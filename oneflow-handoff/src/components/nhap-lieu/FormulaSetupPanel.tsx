import { useEffect, useMemo, useRef, useState, type DragEvent, type KeyboardEvent } from 'react';
import { Check, ChevronDown, CircleAlert, Search, Trash2, X } from 'lucide-react';
import { calc, formatFormulaResult, type Field, type FormulaResultKind, type Op, type Token } from '@/lib/formula';
import { diagnoseFormula } from '@/lib/formula-diagnostics';
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
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').toLocaleLowerCase('vi').trim();

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
  const panelRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setActiveToken(null);
    setInsertAt(null);
    setConstant('');
    setFieldQuery('');
  }, [draft?.id]);

  const diagnostic = draft ? diagnoseFormula(previewFields, draft.id) : null;
  const preview = draft ? calc(previewFields, draft.id) : NaN;
  const excluded = useMemo(() => new Set(draft ? [draft.id, ...findDependents(fields, draft.id).map((item) => item.id)] : []), [draft, fields]);
  const operands = useMemo(() => fields.filter((field) => !excluded.has(field.id) && ['number', 'money', 'percent', 'formula'].includes(field.kind)), [excluded, fields]);
  const filteredOperands = useMemo(() => {
    const query = normalize(fieldQuery);
    if (!query) return operands;
    return operands.filter((field) => normalize(`${field.label} ${fieldKindLabel(field)}`).includes(query));
  }, [fieldQuery, operands]);
  const structuralError = diagnostic && ['empty', 'slot_missing', 'dangling_operator', 'missing_operator', 'unbalanced_parentheses', 'missing_reference', 'cycle', 'invalid_result'].includes(diagnostic.code);
  const isValid = diagnostic?.code === 'valid';
  const isDraft = diagnostic?.code === 'empty';

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
        <div><div className="v6-step is-violet">3</div><h2>Setup công thức</h2><p>{draft ? 'Chèn trường và toán tử để tạo công thức.' : 'Chọn một công thức ở cột 2.'}</p></div>
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
            <div className="v6-live-result-value"><span>Kết quả tức thời</span><strong>{formatFormulaResult(draft as Field, preview)}</strong></div>
            {diagnostic && <div className="v6-live-result-message">{isValid ? <Check size={15} aria-hidden="true" /> : <CircleAlert size={15} aria-hidden="true" />}<span>{diagnostic.message}</span></div>}
          </section>

          <section className="v6-expression-editor" aria-label="Trình chỉnh sửa công thức">
            <div className="v6-editor-heading">
              <div><strong>Công thức hiện tại</strong><span>{draft.tokens.length} thành phần</span></div>
              <span>Bấm token để thay · <kbd>/</kbd> tìm nhanh</span>
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
            <button type="button" onClick={onDiscard} disabled={!dirty} className="v6-secondary-button">Hủy thay đổi</button>
            <button type="button" onClick={onApply} disabled={!dirty || Boolean(structuralError)} className="v6-primary-button">Áp dụng</button>
          </div>
        </div>
      )}
    </aside>
  );
}
