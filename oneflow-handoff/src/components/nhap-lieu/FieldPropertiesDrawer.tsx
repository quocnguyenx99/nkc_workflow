import { useEffect, useRef } from 'react';
import type { Field, FieldRole, Span } from '@/lib/formula';
import { KINDS } from '@/data/template';
import { useFormStore } from '@/store/form';

const WIDTHS: { n: Span; label: string }[] = [
  { n: 2, label: '1/6' }, { n: 3, label: '1/4' }, { n: 4, label: '1/3' }, { n: 6, label: '1/2' }, { n: 12, label: 'Cả dòng' },
];
const ROLE_LABELS: Partial<Record<FieldRole, string>> = {
  customer: 'Khách hàng', staff: 'Nhân viên bán', saleDate: 'Ngày bán', product: 'Sản phẩm', quantity: 'Số lượng', unitPrice: 'Đơn giá', discountRate: 'Chiết khấu',
};
const INPUT_ROLES: Partial<Record<string, FieldRole[]>> = {
  text: ['customer'], person: ['staff'], date: ['saleDate'], select: ['product'], number: ['quantity'], money: ['unitPrice'], percent: ['discountRate'],
};
const optionsText = (options?: string[]) => (options ?? []).join('\n');
const parseOptions = (value: string) => [...new Set(value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean))];

export function FieldPropertiesDrawer({ field, open, onClose, onRequestDelete }: { field: Field | null; open: boolean; onClose: () => void; onRequestDelete: (id: string) => void }) {
  const formOrder = useFormStore((state) => state.formOrder);
  const updateField = useFormStore((state) => state.updateField);
  const setRole = useFormStore((state) => state.setRole);
  const move = useFormStore((state) => state.movePlacedField);
  const closeRef = useRef<HTMLButtonElement>(null);
  const index = field ? formOrder.indexOf(field.id) : -1;
  const roles = field ? INPUT_ROLES[field.kind] ?? [] : [];

  useEffect(() => {
    if (open) window.requestAnimationFrame(() => closeRef.current?.focus());
  }, [open]);
  if (!field || field.kind === 'formula') return null;

  return (
    <div className={`v6-properties-layer${open ? ' is-open' : ''}`} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside aria-label="Cấu hình trường" className="system-scrollbar v6-properties-drawer">
        <header className="inspector-header">
          <div><div className="text-[11px] font-extrabold tracking-[.12em] text-primary">{KINDS[field.kind].name.toUpperCase()}</div><div className="text-[18px] font-extrabold">Thuộc tính trường</div></div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Đóng thuộc tính" className="v6-icon-button">×</button>
        </header>
        <div className="inspector-body">
          <label className="v6-field-label">Tên trường<input id="nl-name" value={field.label} onChange={(event) => updateField(field.id, { label: event.target.value })} /></label>
          {roles.length > 0 && <label className="v6-field-label">Ý nghĩa nghiệp vụ<select value={field.role ?? ''} onChange={(event) => setRole(field.id, (event.target.value || undefined) as FieldRole | undefined)}><option value="">Không gán</option>{roles.map((role) => <option key={role} value={role}>{ROLE_LABELS[role]}</option>)}</select><small>Mỗi vai trò chỉ gán cho một trường để giữ báo cáo an toàn.</small></label>}
          <section className="v6-property-section"><strong>Độ rộng trên lưới</strong><div className="grid grid-cols-5 gap-1.5">{WIDTHS.map((width) => <button key={width.n} type="button" onClick={() => updateField(field.id, { span: width.n })} className={field.span === width.n ? 'is-active' : ''}>{width.label}</button>)}</div></section>
          <section className="v6-property-section"><strong>Vị trí trong Form</strong><div className="grid grid-cols-2 gap-1.5"><button type="button" disabled={index <= 0} onClick={() => move(index, index - 1)}>↑ Lên</button><button type="button" disabled={index < 0 || index >= formOrder.length - 1} onClick={() => move(index, index + 1)}>↓ Xuống</button></div></section>
          <section className="v6-property-section">
            <label className="v6-check-row">Bắt buộc nhập<input aria-label="Bắt buộc nhập" type="checkbox" checked={Boolean(field.required)} onChange={(event) => updateField(field.id, { required: event.target.checked })} /></label>
            <label className="v6-field-label">Giá trị mặc định<input value={field.value ?? ''} onChange={(event) => updateField(field.id, { value: event.target.value, defaultValue: event.target.value })} /></label>
            <label className="v6-field-label">Gợi ý trong ô<input value={field.placeholder ?? ''} onChange={(event) => updateField(field.id, { placeholder: event.target.value })} placeholder={`Nhập ${field.label.toLowerCase()}`} /></label>
            {(field.kind === 'select' || field.kind === 'person') && <label className="v6-field-label">Danh sách lựa chọn<textarea rows={5} value={optionsText(field.options)} onChange={(event) => updateField(field.id, { options: parseOptions(event.target.value) })} placeholder="Mỗi lựa chọn một dòng" /></label>}
            {['number', 'money', 'percent'].includes(field.kind) && <div className="grid grid-cols-2 gap-2"><label className="v6-field-label">Nhỏ nhất<input type="number" value={field.min ?? ''} onChange={(event) => updateField(field.id, { min: event.target.value === '' ? undefined : Number(event.target.value) })} /></label><label className="v6-field-label">Lớn nhất<input type="number" value={field.max ?? ''} onChange={(event) => updateField(field.id, { max: event.target.value === '' ? undefined : Number(event.target.value) })} /></label>{field.kind === 'number' && <label className="v6-check-row col-span-2">Chỉ cho phép số nguyên<input type="checkbox" checked={Boolean(field.integer)} onChange={(event) => updateField(field.id, { integer: event.target.checked })} /></label>}</div>}
          </section>
          <button type="button" onClick={() => onRequestDelete(field.id)} className="v6-danger-button">Xóa trường khỏi Form</button>
        </div>
      </aside>
    </div>
  );
}
