import { useEffect, useRef, useState, type DragEvent } from 'react';
import { calc, formatFormulaResult, type FieldRole, type Op, type Span, type Token } from '@/lib/formula';
import { diagnoseFormula } from '@/lib/formula-diagnostics';
import { KINDS, PRESETS } from '@/data/template';
import { useFormStore } from '@/store/form';
import { tokenStyle } from './TokenChips';

const WIDTHS: { n: Span; label: string }[] = [
  { n: 2, label: '1/6' }, { n: 3, label: '1/4' }, { n: 4, label: '1/3' }, { n: 6, label: '1/2' }, { n: 12, label: 'Cả dòng' },
];
const OPS: Op[] = ['+', '−', '×', '÷', '(', ')'];
const ROLE_LABELS: Record<FieldRole, string> = {
  customer: 'Khách hàng', staff: 'Nhân viên bán', saleDate: 'Ngày bán', product: 'Sản phẩm', quantity: 'Số lượng', unitPrice: 'Đơn giá', discountRate: 'Chiết khấu', subtotal: 'Thành tiền', discountAmount: 'Tiền chiết khấu', vat: 'Thuế VAT', total: 'Tổng thanh toán',
};
const INPUT_ROLES: Partial<Record<string, FieldRole[]>> = {
  text: ['customer'], person: ['staff'], date: ['saleDate'], select: ['product'], number: ['quantity'], money: ['unitPrice'], percent: ['discountRate'],
};
const FORMULA_ROLES: FieldRole[] = ['subtotal', 'discountAmount', 'vat', 'total'];

const optionsText = (options?: string[]) => (options ?? []).join('\n');
const parseOptions = (value: string) => [...new Set(value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean))];

interface InspectorProps {
  onRequestDelete?: (id: string) => void;
  onFormulaInteraction?: () => void;
  onClose?: () => void;
}

export function Inspector({ onRequestDelete, onFormulaInteraction, onClose }: InspectorProps) {
  const fields = useFormStore((state) => state.fields);
  const selId = useFormStore((state) => state.sel);
  const { updateField, setRole, remove, move, applyPreset, insertToken, replaceToken, removeToken, moveToken, clearTokens } = useFormStore.getState();
  const sel = fields.find((field) => field.id === selId) ?? null;
  const selectedIndex = sel ? fields.findIndex((field) => field.id === sel.id) : -1;
  const isFormula = sel?.kind === 'formula';
  const diagnostic = isFormula && sel ? diagnoseFormula(fields, sel.id) : null;
  const [activeToken, setActiveToken] = useState<number | null>(null);
  const [dragToken, setDragToken] = useState<number | null>(null);
  const [constant, setConstant] = useState('');
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setActiveToken(null);
    setConstant('');
  }, [selId]);

  const addOrReplace = (token: Token) => {
    if (!sel || sel.kind !== 'formula') return;
    if (activeToken != null) {
      replaceToken(activeToken, token);
      setActiveToken(null);
    } else if ('f' in token) {
      const slot = (sel.tokens ?? []).findIndex((item) => 's' in item);
      if (slot >= 0) replaceToken(slot, token);
      else insertToken((sel.tokens ?? []).length, token);
    } else {
      insertToken((sel.tokens ?? []).length, token);
    }
    onFormulaInteraction?.();
  };

  const autoScrollFormula = (event: DragEvent<HTMLElement>) => {
    if (dragToken == null || !panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    const edge = Math.min(88, rect.height * 0.18);
    if (event.clientY < rect.top + edge) panelRef.current.scrollBy({ top: -18 });
    if (event.clientY > rect.bottom - edge) panelRef.current.scrollBy({ top: 18 });
  };

  const roleChoices = sel ? (sel.kind === 'formula' ? FORMULA_ROLES : INPUT_ROLES[sel.kind] ?? []) : [];

  return (
    <aside ref={panelRef} aria-label="Cấu hình trường" className="system-scrollbar inspector-panel" onDragOver={autoScrollFormula}>
      <div className="inspector-header">
        <div className="min-w-0">
          <div className="text-[11px] font-extrabold tracking-[.12em]" style={{ color: isFormula ? '#5B33E0' : '#2F54EB' }}>
            {sel ? KINDS[sel.kind]?.name.toUpperCase() : 'THUỘC TÍNH'}
          </div>
          <div className="text-[18px] font-extrabold break-words">{sel?.label ?? 'Cấu hình trường'}</div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {sel && <button type="button" onClick={() => (onRequestDelete ? onRequestDelete(sel.id) : remove(sel.id))} className="ghost border border-line bg-white rounded-lg px-2.5 min-h-9 text-[13px] text-red-text cursor-pointer">Xoá</button>}
          {onClose && <button type="button" onClick={onClose} aria-label="Đóng thuộc tính" className="inspector-close border-0 bg-hover rounded-lg w-9 h-9 text-[20px] cursor-pointer">×</button>}
        </div>
      </div>

      <div className="inspector-body">
        {!sel && <p className="m-0 text-muted text-[14px] leading-[1.6]">Bấm một trường trên biểu mẫu để chỉnh tên, quy tắc nhập hoặc công thức.</p>}
        {sel && (
          <>
            <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-body">Tên trường<input id="nl-name" value={sel.label} onChange={(event) => updateField(sel.id, { label: event.target.value })} className="border border-line-3 rounded-[9px] px-3 min-h-[42px] text-[14px] text-ink" /></label>

            {roleChoices.length > 0 && (
              <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-body">Ý nghĩa nghiệp vụ
                <select value={sel.role ?? ''} onChange={(event) => setRole(sel.id, (event.target.value || undefined) as FieldRole | undefined)} className="border border-line-3 bg-white rounded-[9px] px-3 min-h-[42px] text-[14px] text-ink">
                  <option value="">Không gán</option>{roleChoices.map((role) => <option key={role} value={role}>{ROLE_LABELS[role]}</option>)}
                </select>
                <span className="text-[11px] font-normal text-muted">Mỗi vai trò chỉ gán cho một trường; dùng để lập báo cáo an toàn.</span>
              </label>
            )}

            <div className="flex flex-col gap-1.5"><div className="text-[13px] font-semibold text-body">Độ rộng trên lưới</div><div className="grid grid-cols-5 gap-1.5 max-[1080px]:grid-cols-3">{WIDTHS.map((width) => <button key={width.n} type="button" onClick={() => updateField(sel.id, { span: width.n })} className="rounded-lg min-h-9 text-[13px] font-semibold cursor-pointer" style={{ border: `1px solid ${sel.span === width.n ? '#0B1220' : '#D5DBE6'}`, background: sel.span === width.n ? '#0B1220' : '#FFFFFF', color: sel.span === width.n ? '#FFFFFF' : '#0B1220' }}>{width.label}</button>)}</div></div>

            <div className="flex flex-col gap-1.5"><div className="text-[13px] font-semibold text-body">Vị trí trong biểu mẫu</div><div className="grid grid-cols-2 gap-1.5"><button type="button" disabled={selectedIndex <= 0} onClick={() => move(selectedIndex, selectedIndex - 1)} className="ghost border border-line-3 bg-white rounded-lg min-h-10 text-[13px] font-semibold cursor-pointer disabled:opacity-40">↑ Lên</button><button type="button" disabled={selectedIndex < 0 || selectedIndex >= fields.length - 1} onClick={() => move(selectedIndex, selectedIndex + 1)} className="ghost border border-line-3 bg-white rounded-lg min-h-10 text-[13px] font-semibold cursor-pointer disabled:opacity-40">↓ Xuống</button></div></div>

            {!isFormula && (
              <div className="flex flex-col gap-3 rounded-xl border border-line p-3">
                <label className="flex items-center justify-between gap-3 text-[13px] font-semibold text-body">Bắt buộc nhập<input type="checkbox" checked={Boolean(sel.required)} onChange={(event) => updateField(sel.id, { required: event.target.checked })} className="w-4 h-4 accent-primary" /></label>
                <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-body">Giá trị mặc định<input value={sel.value ?? ''} onChange={(event) => updateField(sel.id, { value: event.target.value, defaultValue: event.target.value })} className="border border-line-3 rounded-[9px] px-3 min-h-[42px] text-[14px] text-ink" /></label>
                <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-body">Gợi ý trong ô<input value={sel.placeholder ?? ''} onChange={(event) => updateField(sel.id, { placeholder: event.target.value })} placeholder={`Nhập ${sel.label.toLowerCase()}`} className="border border-line-3 rounded-[9px] px-3 min-h-[42px] text-[14px] text-ink" /></label>
                {(sel.kind === 'select' || sel.kind === 'person') && <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-body">Danh sách lựa chọn<textarea rows={4} value={optionsText(sel.options)} onChange={(event) => updateField(sel.id, { options: parseOptions(event.target.value) })} placeholder="Mỗi lựa chọn một dòng" className="system-scrollbar border border-line-3 rounded-[9px] px-3 py-2 text-[14px] text-ink resize-y" /><span className="text-[11px] font-normal text-muted">Nhập mỗi lựa chọn trên một dòng.</span></label>}
                {['number', 'money', 'percent'].includes(sel.kind) && <div className="grid grid-cols-2 gap-2"><label className="text-[12px] font-semibold text-body">Nhỏ nhất<input type="number" value={sel.min ?? ''} onChange={(event) => updateField(sel.id, { min: event.target.value === '' ? undefined : Number(event.target.value) })} className="mt-1 w-full box-border border border-line-3 rounded-[9px] px-2 min-h-10" /></label><label className="text-[12px] font-semibold text-body">Lớn nhất<input type="number" value={sel.max ?? ''} onChange={(event) => updateField(sel.id, { max: event.target.value === '' ? undefined : Number(event.target.value) })} className="mt-1 w-full box-border border border-line-3 rounded-[9px] px-2 min-h-10" /></label>{sel.kind === 'number' && <label className="col-span-2 flex items-center gap-2 text-[12px] font-semibold"><input type="checkbox" checked={Boolean(sel.integer)} onChange={(event) => updateField(sel.id, { integer: event.target.checked })} className="accent-primary" />Chỉ cho phép số nguyên</label>}</div>}
              </div>
            )}

            {isFormula && (
              <div className="flex flex-col gap-4">
                <div className="rounded-xl border border-violet-line bg-violet-card p-3">
                  <div className="flex items-center justify-between gap-2"><span className="text-[13px] font-bold">Công thức hiện tại</span><span className="text-[11px] text-muted">Kéo token để sắp xếp</span></div>
                  <div className="mt-2 min-h-[54px] flex flex-wrap gap-1.5 items-center font-mono text-[12px]">
                    {(sel.tokens ?? []).map((token, index) => {
                      const style = tokenStyle(fields, token);
                      return <button key={index} type="button" draggable onDragStart={(event) => { event.dataTransfer.effectAllowed = 'move'; setDragToken(index); }} onDragEnd={() => setDragToken(null)} onDragOver={(event) => event.preventDefault()} onDrop={() => { if (dragToken != null) moveToken(dragToken, index); setDragToken(null); }} onClick={() => setActiveToken(activeToken === index ? null : index)} className="rounded-md px-2 py-1.5 cursor-grab active:cursor-grabbing" style={{ background: style.bg, color: style.fg, border: `2px ${style.borderStyle} ${activeToken === index ? '#0B1220' : style.bc}` }} title="Bấm để chọn và thay thế">{style.text}</button>;
                    })}
                    {!(sel.tokens ?? []).length && <span className="font-sans text-muted">Chọn mẫu hoặc thêm trường bên dưới.</span>}
                  </div>
                  {activeToken != null && <div className="mt-2 rounded-lg bg-white border border-line px-2 py-2 flex items-center justify-between gap-2 text-[11px]"><span>Đang chọn token {activeToken + 1}. Bấm thành phần bên dưới để thay.</span><div className="flex gap-1"><button type="button" disabled={activeToken === 0} onClick={() => { moveToken(activeToken, activeToken - 1); setActiveToken(activeToken - 1); }} className="border border-line rounded px-2 py-1 bg-white disabled:opacity-40">←</button><button type="button" disabled={activeToken >= (sel.tokens?.length ?? 0) - 1} onClick={() => { moveToken(activeToken, activeToken + 1); setActiveToken(activeToken + 1); }} className="border border-line rounded px-2 py-1 bg-white disabled:opacity-40">→</button><button type="button" onClick={() => { removeToken(activeToken); setActiveToken(null); }} className="border border-red-line text-red-text rounded px-2 py-1 bg-white">Xoá</button></div></div>}
                  <div className="mt-3 flex justify-between items-center text-[14px]"><span className="text-muted">Kết quả</span><span className="font-extrabold text-violet-text tabular-nums">{formatFormulaResult(sel, calc(fields, sel.id))}</span></div>
                </div>

                <div><div className="text-[13px] font-bold mb-2">Mẫu nhanh</div><div className="grid grid-cols-2 gap-1.5">{PRESETS.map((preset) => <button key={preset.key} type="button" onClick={() => { applyPreset(preset.key); setActiveToken(null); onFormulaInteraction?.(); }} className="ghost border border-line bg-white rounded-[9px] px-2.5 py-2 text-left cursor-pointer"><span className="block text-[13px] font-bold">{preset.label}</span><span className="text-[11px] text-muted font-mono">{preset.expr}</span></button>)}</div></div>

                <div className="rounded-xl border border-line p-3 flex flex-col gap-2">
                  <div className="text-[13px] font-bold">Thêm hoặc thay thành phần</div><div className="text-[11px] text-muted">Chọn một token để thay; bỏ chọn để thêm vào cuối. Trường sẽ tự lấp ô “chọn trường”.</div>
                  <div className="flex flex-wrap gap-1.5">{fields.filter((field) => field.id !== sel.id && ['number', 'money', 'percent', 'formula'].includes(field.kind)).map((field) => <button key={field.id} type="button" onClick={() => addOrReplace({ f: field.id })} className="chipbtn rounded-lg px-2.5 min-h-[34px] text-[12px] font-semibold cursor-pointer" style={{ border: `1px solid ${field.kind === 'formula' ? '#DCD1FF' : '#C7D2FF'}`, background: field.kind === 'formula' ? '#F3EFFF' : '#EEF2FF', color: field.kind === 'formula' ? '#5B33E0' : '#2F54EB' }}>{field.label}</button>)}</div>
                  <div className="grid grid-cols-6 gap-1.5">{OPS.map((op) => <button key={op} type="button" onClick={() => addOrReplace({ o: op })} className="chipbtn border border-line-3 bg-soft rounded-lg min-h-10 text-[15px] font-mono cursor-pointer">{op}</button>)}</div>
                  <div className="flex gap-1.5"><input inputMode="decimal" value={constant} onChange={(event) => setConstant(event.target.value)} placeholder="Hằng số, ví dụ 7,5" className="min-w-0 flex-1 border border-line-3 rounded-lg px-2.5 min-h-10 text-[13px]" /><button type="button" onClick={() => { const value = Number(constant.replace(',', '.')); if (Number.isFinite(value)) { addOrReplace({ n: value }); setConstant(''); } }} className="border-0 bg-ink text-white rounded-lg px-3 text-[12px] font-bold cursor-pointer">Thêm số</button></div>
                  <button type="button" onClick={() => { clearTokens(); setActiveToken(null); }} className="ghost border border-line-3 bg-white rounded-lg min-h-10 text-[13px] font-semibold cursor-pointer">Xoá toàn bộ công thức</button>
                </div>

                <div className="rounded-xl border border-line p-3 grid grid-cols-2 gap-2"><label className="text-[12px] font-semibold text-body">Loại kết quả<select value={sel.resultKind ?? 'money'} onChange={(event) => updateField(sel.id, { resultKind: event.target.value as 'number' | 'money' | 'percent' })} className="mt-1 w-full border border-line-3 bg-white rounded-lg px-2 min-h-10"><option value="number">Số</option><option value="money">Tiền tệ</option><option value="percent">Phần trăm</option></select></label><label className="text-[12px] font-semibold text-body">Số lẻ<input type="number" min="0" max="6" value={sel.precision ?? 0} onChange={(event) => updateField(sel.id, { precision: Math.max(0, Math.min(6, Number(event.target.value))) })} className="mt-1 w-full box-border border border-line-3 rounded-lg px-2 min-h-10" /></label></div>

                {diagnostic && <div role="status" className="rounded-[10px] px-3 py-2.5 text-[12px] font-semibold" style={{ background: diagnostic.code === 'valid' ? '#E6F6EF' : '#FEF6E0', color: diagnostic.code === 'valid' ? '#065F46' : '#7A4A06' }}>{diagnostic.code === 'valid' ? '✓ ' : '⚠ '}{diagnostic.message}</div>}
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
