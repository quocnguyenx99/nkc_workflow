import { useEffect, useMemo, useRef, useState, type DragEvent, type KeyboardEvent } from 'react';
import { Check, ChevronDown, CircleAlert, Search, Trash2, X } from 'lucide-react';
import { calc, formatFormulaResult, type Field, type FormulaResultKind, type Op, type Token } from '@/lib/formula';
import { diagnoseFormula } from '@/lib/formula-diagnostics';
import {
  formatFormulaExpression,
  getFormulaAutocompleteContext,
  normalizeFormulaSearch,
  parseFormulaExpression,
  type FormulaAutocompleteContext,
} from '@/lib/formula-expression';
import { findDependents } from '@/lib/field-dependencies';
import { tokenStyle } from './TokenChips';
import type { FormulaDraft } from './useFormulaDraft';

const OPS: { value: Op; label: string }[] = [
  { value: '+', label: 'Cộng' },
  { value: '−', label: 'Trừ' },
  { value: '×', label: 'Nhân' },
  { value: '÷', label: 'Chia' },
  { value: '(', label: 'Mở ngoặc' },
  { value: ')', label: 'Đóng ngoặc' },
];

const copyTokens = (tokens: Token[]) => tokens.map((token) => ({ ...token }));
const OPERAND_KINDS = new Set<Field['kind']>(['number', 'money', 'percent', 'formula']);

interface FormulaSuggestion {
  field: Field;
  disabled: boolean;
  reason?: string;
}

function fieldKindLabel(field: Field) {
  if (field.kind === 'formula') return 'Công thức';
  if (field.kind === 'money') return 'Tiền tệ';
  if (field.kind === 'percent') return 'Phần trăm';
  return 'Số';
}

export function FormulaSetupPanel({
  fields,
  draft,
  previewFields,
  dirty,
  onPatch,
  onApply,
  onDiscard,
  onExpand,
  onClose,
  expanded = false,
}: {
  fields: Field[];
  draft: FormulaDraft | null;
  previewFields: Field[];
  dirty: boolean;
  onPatch: (patch: Partial<Omit<FormulaDraft, 'id'>>) => void;
  onApply: () => void;
  onDiscard: () => void;
  onExpand?: () => void;
  onClose?: () => void;
  expanded?: boolean;
}) {
  const [activeToken, setActiveToken] = useState<number | null>(null);
  const [insertAt, setInsertAt] = useState<number | null>(null);
  const [dragToken, setDragToken] = useState<number | null>(null);
  const [constant, setConstant] = useState('');
  const [fieldQuery, setFieldQuery] = useState('');
  const [expressionText, setExpressionText] = useState('');
  const [expressionIssue, setExpressionIssue] = useState<string | null>(null);
  const [autocompleteContext, setAutocompleteContext] = useState<FormulaAutocompleteContext | null>(null);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const panelRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const formulaInputRef = useRef<HTMLInputElement>(null);
  const lastDirectTokenSignature = useRef('');

  const dependentIds = useMemo(() => new Set(draft ? findDependents(fields, draft.id).map((item) => item.id) : []), [draft, fields]);
  const expressionFields = useMemo(() => fields.filter((field) => OPERAND_KINDS.has(field.kind)), [fields]);
  const operands = useMemo(() => expressionFields.filter((field) => field.id !== draft?.id && !dependentIds.has(field.id)), [dependentIds, draft?.id, expressionFields]);
  const tokenSignature = JSON.stringify(draft?.tokens ?? []);

  useEffect(() => {
    setActiveToken(null);
    setInsertAt(null);
    setConstant('');
    setFieldQuery('');
    setExpressionText(draft ? formatFormulaExpression(draft.tokens, fields) : '');
    setExpressionIssue(null);
    setAutocompleteContext(null);
    setSuggestionIndex(0);
    lastDirectTokenSignature.current = tokenSignature;
  }, [draft?.id]);

  useEffect(() => {
    if (!draft || lastDirectTokenSignature.current === tokenSignature) return;
    lastDirectTokenSignature.current = tokenSignature;
    setExpressionText(formatFormulaExpression(draft.tokens, fields));
    setExpressionIssue(null);
    setAutocompleteContext(null);
  }, [draft, fields, tokenSignature]);

  const diagnostic = draft ? diagnoseFormula(previewFields, draft.id) : null;
  const preview = draft ? calc(previewFields, draft.id) : NaN;
  const filteredOperands = useMemo(() => {
    const query = normalizeFormulaSearch(fieldQuery);
    if (!query) return operands;
    return operands.filter((field) => normalizeFormulaSearch(`${field.label} ${fieldKindLabel(field)}`).includes(query));
  }, [fieldQuery, operands]);
  const formulaSuggestions = useMemo(() => {
    if (!autocompleteContext) return [];
    const query = normalizeFormulaSearch(autocompleteContext.query);
    return expressionFields
      .filter((field) => normalizeFormulaSearch(field.label).includes(query))
      .map((field): FormulaSuggestion => {
        if (field.id === draft?.id) return { field, disabled: true, reason: 'Đang chỉnh sửa' };
        if (dependentIds.has(field.id)) return { field, disabled: true, reason: 'Tạo vòng tham chiếu' };
        return { field, disabled: false };
      });
  }, [autocompleteContext, dependentIds, draft?.id, expressionFields]);
  const suggestionGroups = useMemo(() => [
    { key: 'data', label: 'Dữ liệu', items: formulaSuggestions.filter((item) => item.field.kind !== 'formula') },
    { key: 'formula', label: 'Công thức', items: formulaSuggestions.filter((item) => item.field.kind === 'formula') },
  ].filter((group) => group.items.length), [formulaSuggestions]);
  const selectableSuggestionIndexes = useMemo(() => formulaSuggestions.map((item, index) => item.disabled ? -1 : index).filter((index) => index >= 0), [formulaSuggestions]);
  const hasSuggestions = Boolean(autocompleteContext && formulaSuggestions.length);
  const visibleExpressionIssue = hasSuggestions ? null : expressionIssue;
  const structuralError = Boolean(expressionIssue) || Boolean(diagnostic && ['empty', 'slot_missing', 'dangling_operator', 'missing_operator', 'unbalanced_parentheses', 'missing_reference', 'cycle', 'invalid_result'].includes(diagnostic.code));
  const isValid = !expressionIssue && diagnostic?.code === 'valid';
  const isDraft = hasSuggestions || (!expressionIssue && diagnostic?.code === 'empty');
  const resultMessage = hasSuggestions ? 'Chọn một trường gợi ý để tiếp tục.' : expressionIssue ?? diagnostic?.message;

  const updateAutocomplete = (value: string, cursor: number) => {
    setAutocompleteContext(getFormulaAutocompleteContext(value, cursor));
    setSuggestionIndex(0);
  };
  const updateExpression = (value: string, cursor = value.length) => {
    setExpressionText(value);
    const parsed = parseFormulaExpression(value, expressionFields);
    if (parsed.ok) {
      setExpressionIssue(null);
      const signature = JSON.stringify(parsed.tokens);
      lastDirectTokenSignature.current = signature;
      if (signature !== tokenSignature) onPatch({ tokens: parsed.tokens });
    } else {
      setExpressionIssue(parsed.message);
    }
    updateAutocomplete(value, cursor);
  };
  const chooseSuggestion = (suggestion: FormulaSuggestion) => {
    if (!autocompleteContext || suggestion.disabled) return;
    const { field } = suggestion;
    const insertion = `[${field.label}]`;
    const next = `${expressionText.slice(0, autocompleteContext.start)}${insertion}${expressionText.slice(autocompleteContext.end)}`;
    const cursor = autocompleteContext.start + insertion.length;
    updateExpression(next, cursor);
    setAutocompleteContext(null);
    window.requestAnimationFrame(() => {
      formulaInputRef.current?.focus();
      formulaInputRef.current?.setSelectionRange(cursor, cursor);
    });
  };

  const setCursor = (index: number) => {
    setActiveToken(null);
    setInsertAt(index);
  };
  const addOrReplace = (token: Token) => {
    if (!draft) return;
    const tokens = copyTokens(draft.tokens);
    if (activeToken != null && tokens[activeToken]) {
      tokens[activeToken] = token;
      setInsertAt(activeToken + 1);
    } else {
      const index = insertAt == null ? tokens.length : Math.max(0, Math.min(insertAt, tokens.length));
      tokens.splice(index, 0, token);
      setInsertAt(index + 1);
    }
    setActiveToken(null);
    onPatch({ tokens });
  };
  const removeToken = (index: number) => {
    if (!draft) return;
    onPatch({ tokens: draft.tokens.filter((_, tokenIndex) => tokenIndex !== index) });
    setActiveToken(null);
    setInsertAt(Math.max(0, index));
  };
  const moveToken = (from: number, to: number) => {
    if (!draft || from < 0 || to < 0 || from >= draft.tokens.length || to >= draft.tokens.length) return;
    const tokens = copyTokens(draft.tokens);
    const [token] = tokens.splice(from, 1);
    tokens.splice(to, 0, token);
    setActiveToken(null);
    setInsertAt(to + 1);
    onPatch({ tokens });
  };
  const addConstant = () => {
    const value = Number(constant.replace(',', '.'));
    if (!Number.isFinite(value)) return;
    addOrReplace({ n: value });
    setConstant('');
  };
  const autoScroll = (event: DragEvent<HTMLElement>) => {
    if (dragToken == null || !panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    if (event.clientY < rect.top + 80) panelRef.current.scrollBy({ top: -18 });
    if (event.clientY > rect.bottom - 80) panelRef.current.scrollBy({ top: 18 });
  };
  const handleEditorKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;
    const isInput = ['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName);
    if (event.key === '/' && !isInput) {
      event.preventDefault();
      searchRef.current?.focus();
    }
    if ((event.key === 'Delete' || event.key === 'Backspace') && activeToken != null && !isInput) {
      event.preventDefault();
      removeToken(activeToken);
    }
    if (event.key === 'Escape' && activeToken != null) {
      setActiveToken(null);
      setInsertAt(draft?.tokens.length ?? 0);
    }
  };

  return (
    <aside ref={panelRef} aria-label="Setup công thức" className={`system-scrollbar inspector-panel v6-column v6-setup-panel${expanded ? ' is-expanded' : ''}`} onDragOver={autoScroll} onKeyDown={handleEditorKeyDown}>
      <header className="v6-column-header v6-setup-header inspector-header">
        <div><div className="v6-step is-violet">3</div><h2>Setup công thức</h2><p>{draft ? 'Gõ trực tiếp hoặc chèn trường và toán tử.' : 'Chọn một công thức ở cột 2.'}</p></div>
        <div className="flex gap-1.5">
          {onExpand && draft && <button type="button" onClick={onExpand} className="v6-icon-button v6-expand-button" aria-label="Mở Formula Workspace" title="Mở rộng">↗</button>}
          {onClose && <button type="button" onClick={onClose} aria-label="Đóng setup công thức" className="v6-icon-button">×</button>}
        </div>
      </header>

      {!draft ? <div className="v6-column-body"><div className="v6-empty-state is-large"><strong>Chưa chọn công thức</strong><span>Chọn một kết quả tính toán để chỉnh tại đây.</span></div></div> : (
        <div className="inspector-body v6-formula-editor">
          <div className="v6-formula-title-row">
            <label className="flex-1">Tên công thức<input id="nl-name" value={draft.label} onChange={(event) => onPatch({ label: event.target.value })} /></label>
            <span className={`v6-status-pill is-${isValid ? 'valid' : isDraft ? 'draft' : 'error'}`}>{isValid ? 'Hợp lệ' : isDraft ? 'Bản nháp' : 'Cần sửa'}</span>
          </div>

          <section className={`v6-live-result is-${isValid ? 'valid' : isDraft ? 'draft' : 'warning'}`} aria-live="polite">
            <div className="v6-live-result-value"><span>Kết quả tức thời</span><strong>{formatFormulaResult(draft as Field, expressionIssue ? NaN : preview)}</strong></div>
            {resultMessage && <div className="v6-live-result-message">{isValid ? <Check size={15} aria-hidden="true" /> : <CircleAlert size={15} aria-hidden="true" />}<span>{resultMessage}</span></div>}
          </section>

          <section className="v6-expression-editor" aria-label="Trình chỉnh sửa công thức">
            <div className="v6-editor-heading">
              <div><strong>Công thức hiện tại</strong><span>{draft.tokens.length} thành phần</span></div>
              <span>Bấm token để thay · <kbd>/</kbd> tìm nhanh</span>
            </div>
            <div className={`v6-direct-formula${visibleExpressionIssue ? ' has-error' : ''}`}>
              <label htmlFor={`formula-input-${draft.id}`}>Nhập công thức</label>
              <div className="v6-formula-bar">
                <span aria-hidden="true">=</span>
                <input
                  ref={formulaInputRef}
                  id={`formula-input-${draft.id}`}
                  role="combobox"
                  aria-autocomplete="list"
                  aria-expanded={Boolean(autocompleteContext && formulaSuggestions.length)}
                  aria-invalid={Boolean(visibleExpressionIssue)}
                  aria-controls={`formula-suggestions-${draft.id}`}
                  aria-activedescendant={autocompleteContext && formulaSuggestions[suggestionIndex] ? `formula-suggestion-${formulaSuggestions[suggestionIndex].field.id}` : undefined}
                  aria-describedby={`formula-input-help-${draft.id}`}
                  autoComplete="off"
                  spellCheck={false}
                  value={expressionText}
                  onChange={(event) => updateExpression(event.target.value, event.target.selectionStart ?? event.target.value.length)}
                  onClick={(event) => updateAutocomplete(event.currentTarget.value, event.currentTarget.selectionStart ?? event.currentTarget.value.length)}
                  onKeyUp={(event) => {
                    if (!['ArrowDown', 'ArrowUp', 'Enter', 'Tab', 'Escape'].includes(event.key)) updateAutocomplete(event.currentTarget.value, event.currentTarget.selectionStart ?? event.currentTarget.value.length);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Escape' && autocompleteContext) {
                      event.preventDefault();
                      event.stopPropagation();
                      setAutocompleteContext(null);
                      return;
                    }
                    if (!autocompleteContext || !formulaSuggestions.length) return;
                    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                      if (!selectableSuggestionIndexes.length) return;
                      event.preventDefault();
                      const direction = event.key === 'ArrowDown' ? 1 : -1;
                      setSuggestionIndex((current) => {
                        const currentPosition = selectableSuggestionIndexes.indexOf(current);
                        const nextPosition = currentPosition < 0
                          ? direction > 0 ? 0 : selectableSuggestionIndexes.length - 1
                          : (currentPosition + direction + selectableSuggestionIndexes.length) % selectableSuggestionIndexes.length;
                        return selectableSuggestionIndexes[nextPosition];
                      });
                    } else if (event.key === 'Enter' || event.key === 'Tab') {
                      const suggestion = formulaSuggestions[suggestionIndex]?.disabled
                        ? formulaSuggestions[selectableSuggestionIndexes[0]]
                        : formulaSuggestions[suggestionIndex];
                      if (!suggestion) return;
                      event.preventDefault();
                      chooseSuggestion(suggestion);
                    }
                  }}
                  onBlur={() => window.setTimeout(() => setAutocompleteContext(null), 100)}
                  placeholder="[Số lượng] * [Đơn giá]"
                />
              </div>
              {autocompleteContext && formulaSuggestions.length > 0 && (
                <div id={`formula-suggestions-${draft.id}`} role="listbox" aria-label="Gợi ý trường công thức" className="v6-formula-suggestions">
                  {suggestionGroups.map((group) => (
                    <div key={group.key} role="group" aria-label={`${group.label} (${group.items.length})`} className="v6-formula-suggestion-group">
                      <div className="v6-formula-suggestion-heading"><span>{group.label}</span><small>{group.items.length}</small></div>
                      {group.items.map((suggestion) => {
                        const index = formulaSuggestions.indexOf(suggestion);
                        return <button
                          id={`formula-suggestion-${suggestion.field.id}`}
                          key={suggestion.field.id}
                          type="button"
                          role="option"
                          tabIndex={-1}
                          aria-selected={index === suggestionIndex}
                          aria-disabled={suggestion.disabled}
                          className={`${index === suggestionIndex ? 'is-active' : ''}${suggestion.disabled ? ' is-disabled' : ''}`}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => chooseSuggestion(suggestion)}
                        ><span><strong>{suggestion.field.label}</strong><small>{fieldKindLabel(suggestion.field)}</small></span><em>{suggestion.reason ?? (suggestion.field.kind === 'formula' ? 'ƒx' : '123')}</em></button>;
                      })}
                    </div>
                  ))}
                </div>
              )}
              <div id={`formula-input-help-${draft.id}`} className="v6-formula-input-help">
                <span>Dùng <kbd>+ − * / ( )</kbd> · Gõ tên trường không dấu vẫn tìm được</span>
                {visibleExpressionIssue && <strong role="alert">{visibleExpressionIssue}</strong>}
              </div>
            </div>
            <div className="v6-token-canvas" onClick={(event) => { if (event.currentTarget === event.target) setCursor(draft.tokens.length); }}>
              <button type="button" className={`v6-insert-point${insertAt === 0 ? ' is-active' : ''}`} onClick={() => setCursor(0)} aria-label="Chèn ở đầu công thức"><span /></button>
              {draft.tokens.map((token, index) => {
                const style = tokenStyle(fields, token);
                return <div className="v6-token-unit" key={`${index}-${style.text}`}>
                  <button type="button" draggable title="Bấm để chọn và thay thế" aria-label={style.text} onDragStart={(event) => { event.dataTransfer.effectAllowed = 'move'; setDragToken(index); }} onDragEnd={() => setDragToken(null)} onDragOver={(event) => event.preventDefault()} onDrop={() => { if (dragToken != null) moveToken(dragToken, index); setDragToken(null); }} onClick={() => { setActiveToken(activeToken === index ? null : index); setInsertAt(null); }} className="v6-token" style={{ background: style.bg, color: style.fg, border: `2px ${style.borderStyle} ${activeToken === index ? '#0B1220' : style.bc}` }}>{style.text}</button>
                  <button type="button" className={`v6-insert-point${insertAt === index + 1 ? ' is-active' : ''}`} onClick={() => setCursor(index + 1)} aria-label={`Chèn sau ${style.text}`}><span /></button>
                </div>;
              })}
              {!draft.tokens.length && <button type="button" onClick={() => searchRef.current?.focus()} className="v6-empty-formula"><strong>Bắt đầu bằng một trường dữ liệu</strong><span>Tìm bên dưới hoặc nhấn /</span></button>}
            </div>
            <div className="v6-selection-bar" aria-live="polite">
              {activeToken != null ? <>
                <span>Đang chọn token {activeToken + 1} · Chọn mục bên dưới để thay</span>
                <button type="button" onClick={() => removeToken(activeToken)}><Trash2 size={13} /> Xóa</button>
                <button type="button" onClick={() => setCursor(activeToken + 1)}>Chèn sau</button>
                <button type="button" aria-label="Bỏ chọn token" onClick={() => setCursor(draft.tokens.length)}><X size={14} /></button>
              </> : <span>{insertAt == null || insertAt === draft.tokens.length ? 'Nội dung mới sẽ được thêm vào cuối công thức.' : `Đang chèn tại vị trí ${insertAt + 1}.`}</span>}
            </div>

            <div className="v6-field-picker">
              <label className="v6-formula-search">
                <Search size={15} aria-hidden="true" />
                <span className="sr-only">Tìm trường để chèn</span>
                <input ref={searchRef} value={fieldQuery} onChange={(event) => setFieldQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && filteredOperands[0]) addOrReplace({ f: filteredOperands[0].id }); }} placeholder="Tìm trường để chèn…" />
                {fieldQuery && <button type="button" onClick={() => { setFieldQuery(''); searchRef.current?.focus(); }} aria-label="Xóa tìm kiếm"><X size={14} /></button>}
              </label>
              <div className="v6-field-results" aria-label="Trường có thể chèn">
                {filteredOperands.map((field) => <button key={field.id} type="button" onClick={() => addOrReplace({ f: field.id })} aria-label={`Chèn trường ${field.label}`} className="v6-field-option"><span>{field.label}</span><small>{fieldKindLabel(field)}</small></button>)}
                {!filteredOperands.length && <div className="v6-no-field-result">Không tìm thấy trường phù hợp.</div>}
              </div>
            </div>

            <div className="v6-quick-insert">
              <div className="v6-operator-row" aria-label="Chèn toán tử">{OPS.map((op) => <button key={op.value} type="button" onClick={() => addOrReplace({ o: op.value })} aria-label={`Chèn ${op.label}`} title={op.label}>{op.value}</button>)}</div>
              <div className="v6-constant-row"><input aria-label="Giá trị hằng số" inputMode="decimal" value={constant} onChange={(event) => setConstant(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') addConstant(); }} placeholder="Hằng số, ví dụ 7,5" /><button type="button" onClick={addConstant} disabled={!Number.isFinite(Number(constant.replace(',', '.')))}>Chèn số</button></div>
            </div>

            <button type="button" onClick={() => { onPatch({ tokens: [] }); setActiveToken(null); setInsertAt(0); }} className="v6-clear-formula"><Trash2 size={13} /> Xóa công thức</button>
          </section>

          <details className="v6-result-format" open>
            <summary><span>Định dạng kết quả</span><span>{draft.resultKind === 'money' ? 'Tiền tệ' : draft.resultKind === 'percent' ? 'Phần trăm' : 'Số'} · {draft.precision} số lẻ</span><ChevronDown size={14} aria-hidden="true" /></summary>
            <section className="v6-result-settings">
              <label>Loại kết quả<select aria-label="Loại kết quả" value={draft.resultKind} onChange={(event) => onPatch({ resultKind: event.target.value as FormulaResultKind })}><option value="number">Số</option><option value="money">Tiền tệ</option><option value="percent">Phần trăm</option></select></label>
              <label>Số lẻ<input aria-label="Số lẻ" type="number" min="0" max="6" value={draft.precision} onChange={(event) => onPatch({ precision: Math.max(0, Math.min(6, Number(event.target.value))) })} /></label>
            </section>
          </details>

          <div className="v6-apply-bar">
            <button type="button" onClick={() => { setExpressionText(formatFormulaExpression(draft.tokens, fields)); setExpressionIssue(null); setAutocompleteContext(null); onDiscard(); }} disabled={!dirty && !expressionIssue} className="v6-secondary-button">Hủy thay đổi</button>
            <button type="button" onClick={onApply} disabled={!dirty || Boolean(structuralError)} className="v6-primary-button">Áp dụng</button>
          </div>
        </div>
      )}
    </aside>
  );
}
