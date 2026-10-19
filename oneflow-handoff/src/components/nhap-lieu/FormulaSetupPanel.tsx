import { useEffect, useMemo, useRef, useState, type DragEvent } from 'react';
import { calc, formatFormulaResult, type Field, type FormulaResultKind, type Op, type Token } from '@/lib/formula';
import { diagnoseFormula } from '@/lib/formula-diagnostics';
import { findDependents } from '@/lib/field-dependencies';
import { tokenStyle } from './TokenChips';
import { isBasicFormula, type FormulaDraft, type FormulaEditorMode } from './useFormulaDraft';

const OPS: Op[] = ['+', '−', '×', '÷', '(', ')'];
const BASIC_OPS: Op[] = ['+', '−', '×', '÷'];
const SLOT: Token = { s: 1 };
const copyTokens = (tokens: Token[]) => tokens.map((token) => ({ ...token }));

function OperandControl({ token, fields, onChange, label }: { token: Token; fields: Field[]; onChange: (token: Token) => void; label: string }) {
  const value = 'f' in token ? `field:${token.f}` : 'n' in token ? 'constant' : '';
  return (
    <div className="v6-operand">
      <label>{label}
        <select value={value} onChange={(event) => {
          if (event.target.value.startsWith('field:')) onChange({ f: event.target.value.slice(6) });
          else if (event.target.value === 'constant') onChange({ n: 0 });
          else onChange(SLOT);
        }}>
          <option value="">Chọn trường hoặc số</option>
          <optgroup label="Trường số">
            {fields.map((field) => <option key={field.id} value={`field:${field.id}`}>{field.label}</option>)}
          </optgroup>
          <option value="constant">Hằng số</option>
        </select>
      </label>
      {'n' in token && <label className="v6-constant"><span>Giá trị</span><input aria-label={`Hằng số ${label}`} inputMode="decimal" value={String(token.n)} onChange={(event) => { const value = Number(event.target.value.replace(',', '.')); if (Number.isFinite(value)) onChange({ n: value }); }} /></label>}
    </div>
  );
}

export function FormulaSetupPanel({
  fields,
  draft,
  previewFields,
  dirty,
  mode,
  onModeChange,
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
  mode: FormulaEditorMode;
  onModeChange: (mode: FormulaEditorMode) => void;
  onPatch: (patch: Partial<Omit<FormulaDraft, 'id'>>) => void;
  onApply: () => void;
  onDiscard: () => void;
  onExpand?: () => void;
  onClose?: () => void;
  expanded?: boolean;
}) {
  const [activeToken, setActiveToken] = useState<number | null>(null);
  const [dragToken, setDragToken] = useState<number | null>(null);
  const [constant, setConstant] = useState('');
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => { setActiveToken(null); setConstant(''); }, [draft?.id]);
  const diagnostic = draft ? diagnoseFormula(previewFields, draft.id) : null;
  const preview = draft ? calc(previewFields, draft.id) : NaN;
  const compatible = draft ? isBasicFormula(draft.tokens) : true;
  const excluded = useMemo(() => new Set(draft ? [draft.id, ...findDependents(fields, draft.id).map((item) => item.id)] : []), [draft, fields]);
  const operands = fields.filter((field) => !excluded.has(field.id) && ['number', 'money', 'percent', 'formula'].includes(field.kind));
  const structuralError = diagnostic && ['empty', 'slot_missing', 'dangling_operator', 'missing_operator', 'unbalanced_parentheses', 'missing_reference', 'cycle', 'invalid_result'].includes(diagnostic.code);

  const replaceAt = (index: number, token: Token) => {
    if (!draft) return;
    const tokens: Token[] = compatible && draft.tokens.length === 3 ? copyTokens(draft.tokens) : [SLOT, { o: '×' }, SLOT];
    tokens[index] = token;
    onPatch({ tokens });
  };
  const addOrReplace = (token: Token) => {
    if (!draft) return;
    const tokens = copyTokens(draft.tokens);
    if (activeToken != null && tokens[activeToken]) tokens[activeToken] = token;
    else {
      const slot = 'f' in token ? tokens.findIndex((item) => 's' in item) : -1;
      if (slot >= 0) tokens[slot] = token;
      else tokens.push(token);
    }
    setActiveToken(null);
    onPatch({ tokens });
  };
  const moveToken = (from: number, to: number) => {
    if (!draft || from < 0 || to < 0 || from >= draft.tokens.length || to >= draft.tokens.length) return;
    const tokens = copyTokens(draft.tokens);
    const [token] = tokens.splice(from, 1);
    tokens.splice(to, 0, token);
    onPatch({ tokens });
  };
  const autoScroll = (event: DragEvent<HTMLElement>) => {
    if (dragToken == null || !panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    if (event.clientY < rect.top + 80) panelRef.current.scrollBy({ top: -18 });
    if (event.clientY > rect.bottom - 80) panelRef.current.scrollBy({ top: 18 });
  };

  return (
    <aside ref={panelRef} aria-label="Setup công thức" className={`system-scrollbar inspector-panel v6-column v6-setup-panel${expanded ? ' is-expanded' : ''}`} onDragOver={autoScroll}>
      <header className="v6-column-header v6-setup-header inspector-header">
        <div><div className="v6-step is-violet">3</div><h2>Setup công thức</h2><p>{draft ? 'Chỉnh bản nháp, xem trước rồi Áp dụng.' : 'Chọn một công thức ở cột 2.'}</p></div>
        <div className="flex gap-1.5">
          {onExpand && draft && <button type="button" onClick={onExpand} className="v6-icon-button v6-expand-button" aria-label="Mở Formula Workspace" title="Mở rộng">↗</button>}
          {onClose && <button type="button" onClick={onClose} aria-label="Đóng setup công thức" className="v6-icon-button">×</button>}
        </div>
      </header>

      {!draft ? <div className="v6-column-body"><div className="v6-empty-state is-large"><strong>Chưa chọn công thức</strong><span>Chọn một kết quả tính toán để chỉnh tại đây.</span></div></div> : (
        <div className="inspector-body v6-formula-editor">
          <div className="v6-formula-title-row">
            <label className="flex-1">Tên công thức<input id="nl-name" value={draft.label} onChange={(event) => onPatch({ label: event.target.value })} /></label>
            <span className={`v6-status-pill is-${diagnostic?.code === 'valid' ? 'valid' : diagnostic?.code === 'empty' ? 'draft' : 'error'}`}>{diagnostic?.code === 'valid' ? 'Hợp lệ' : diagnostic?.code === 'empty' ? 'Bản nháp' : 'Cần sửa'}</span>
          </div>

          <div className="v6-mode-tabs" role="tablist" aria-label="Chế độ công thức">
            <button type="button" role="tab" aria-selected={mode === 'basic'} disabled={!compatible} onClick={() => onModeChange('basic')}>Cơ bản</button>
            <button type="button" role="tab" aria-selected={mode === 'advanced'} onClick={() => onModeChange('advanced')}>Nâng cao</button>
          </div>
          {!compatible && <div className="v6-inline-note">Công thức có nhiều bước hoặc dấu ngoặc; hãy chỉnh ở chế độ Nâng cao.</div>}

          {mode === 'basic' && compatible && (() => {
            const tokens = draft.tokens.length === 3 ? draft.tokens : [SLOT, { o: '×' } as Token, SLOT];
            return <section className="v6-basic-editor">
              <OperandControl label="A" token={tokens[0]} fields={operands} onChange={(token) => replaceAt(0, token)} />
              <label className="v6-basic-operator">Phép tính<select aria-label="Phép tính" value={'o' in tokens[1] ? tokens[1].o : '×'} onChange={(event) => replaceAt(1, { o: event.target.value as Op })}>{BASIC_OPS.map((op) => <option key={op} value={op}>{op}</option>)}</select></label>
              <OperandControl label="B" token={tokens[2]} fields={operands} onChange={(token) => replaceAt(2, token)} />
            </section>;
          })()}

          {mode === 'advanced' && (
            <section className="v6-advanced-editor">
              <div className="flex items-center justify-between gap-2"><strong>Công thức hiện tại</strong><span className="text-[11px] text-muted">Bấm token để thay</span></div>
              <div className="v6-token-canvas">
                {draft.tokens.map((token, index) => {
                  const style = tokenStyle(fields, token);
                  return <button key={index} type="button" draggable title="Bấm để chọn và thay thế" aria-label={style.text} onDragStart={(event) => { event.dataTransfer.effectAllowed = 'move'; setDragToken(index); }} onDragEnd={() => setDragToken(null)} onDragOver={(event) => event.preventDefault()} onDrop={() => { if (dragToken != null) moveToken(dragToken, index); setDragToken(null); }} onClick={() => setActiveToken(activeToken === index ? null : index)} className="v6-token" style={{ background: style.bg, color: style.fg, border: `2px ${style.borderStyle} ${activeToken === index ? '#0B1220' : style.bc}` }}>{style.text}</button>;
                })}
                {!draft.tokens.length && <span className="text-[12px] text-muted">Thêm trường, toán tử hoặc hằng số bên dưới.</span>}
              </div>
              {activeToken != null && <div className="v6-token-actions"><span>Đang chọn token {activeToken + 1}</span><button type="button" disabled={activeToken === 0} onClick={() => { moveToken(activeToken, activeToken - 1); setActiveToken(activeToken - 1); }}>←</button><button type="button" disabled={activeToken >= draft.tokens.length - 1} onClick={() => { moveToken(activeToken, activeToken + 1); setActiveToken(activeToken + 1); }}>→</button><button type="button" onClick={() => { onPatch({ tokens: draft.tokens.filter((_, index) => index !== activeToken) }); setActiveToken(null); }}>Xóa</button></div>}
              <div className="v6-editor-group"><span>Trường số và công thức</span><div className="flex flex-wrap gap-1.5">{operands.map((field) => <button key={field.id} type="button" onClick={() => addOrReplace({ f: field.id })} className="chipbtn">{field.label}</button>)}</div></div>
              <div className="v6-editor-group"><span>Toán tử</span><div className="grid grid-cols-6 gap-1.5">{OPS.map((op) => <button key={op} type="button" onClick={() => addOrReplace({ o: op })} className="chipbtn is-operator">{op}</button>)}</div></div>
              <div className="v6-constant-row"><input inputMode="decimal" value={constant} onChange={(event) => setConstant(event.target.value)} placeholder="Hằng số, ví dụ 7,5" /><button type="button" onClick={() => { const value = Number(constant.replace(',', '.')); if (Number.isFinite(value)) { addOrReplace({ n: value }); setConstant(''); } }}>Thêm số</button></div>
              <button type="button" onClick={() => { onPatch({ tokens: [] }); setActiveToken(null); }} className="v6-secondary-button">Xóa toàn bộ công thức</button>
            </section>
          )}

          <section className="v6-result-settings">
            <label>Loại kết quả<select aria-label="Loại kết quả" value={draft.resultKind} onChange={(event) => onPatch({ resultKind: event.target.value as FormulaResultKind })}><option value="number">Số</option><option value="money">Tiền tệ</option><option value="percent">Phần trăm</option></select></label>
            <label>Số lẻ<input aria-label="Số lẻ" type="number" min="0" max="6" value={draft.precision} onChange={(event) => onPatch({ precision: Math.max(0, Math.min(6, Number(event.target.value))) })} /></label>
          </section>

          <section className="v6-preview-card">
            <div><span>Xem trước</span><strong>{formatFormulaResult(draft as Field, preview)}</strong></div>
            {diagnostic && <p role="status" className={diagnostic.code === 'valid' ? 'is-valid' : 'is-warning'}>{diagnostic.code === 'valid' ? '✓ ' : '⚠ '}{diagnostic.message}</p>}
          </section>

          <div className="v6-apply-bar">
            <button type="button" onClick={onDiscard} disabled={!dirty} className="v6-secondary-button">Hủy thay đổi</button>
            <button type="button" onClick={onApply} disabled={!dirty || Boolean(structuralError)} className="v6-primary-button">Áp dụng</button>
          </div>
        </div>
      )}
    </aside>
  );
}
