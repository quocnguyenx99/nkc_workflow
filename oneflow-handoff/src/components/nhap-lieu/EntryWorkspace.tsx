import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { calc, formatFormulaResult, type Field } from '@/lib/formula';
import { diagnoseFormula } from '@/lib/formula-diagnostics';
import { findSemanticField } from '@/lib/field-semantics';
import { useFormStore } from '@/store/form';

interface Props {
  onSave: () => void;
  duplicateNotice: string | null;
}

const inputModeFor = (field: Field): 'text' | 'decimal' => (['number', 'money', 'percent'].includes(field.kind) ? 'decimal' : 'text');
const suffixFor = (field: Field) => (field.kind === 'money' ? '₫' : field.kind === 'percent' ? '%' : '');
const toIsoDate = (value = '') => {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : '';
};
const fromIsoDate = (value: string) => {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : value;
};

function InputControl({ field, invalid, onChange }: { field: Field; invalid: boolean; onChange: (value: string) => void }) {
  const shared = {
    id: `entry-${field.id}`,
    'aria-invalid': invalid || undefined,
    'aria-describedby': invalid ? `entry-error-${field.id}` : undefined,
    className: 'w-full min-h-11 box-border rounded-[10px] border bg-white px-3 text-[15px] text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary-soft',
    style: { borderColor: invalid ? '#D92D20' : '#D5DBE6' },
  };
  if (field.kind === 'date') {
    return <input {...shared} type="date" value={toIsoDate(field.value)} onChange={(event) => onChange(fromIsoDate(event.target.value))} />;
  }
  if (field.kind === 'select') {
    const options = [...new Set([...(field.options ?? []), ...(field.value ? [field.value] : [])])];
    return (
      <select {...shared} value={field.value ?? ''} onChange={(event) => onChange(event.target.value)}>
        <option value="">Chọn {field.label.toLowerCase()}</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    );
  }
  const suffix = suffixFor(field);
  const listId = field.kind === 'person' && field.options?.length ? `entry-options-${field.id}` : undefined;
  return (
    <div className="relative">
      <input
        {...shared}
        type="text"
        list={listId}
        inputMode={inputModeFor(field)}
        value={field.value ?? ''}
        onChange={(event) => onChange(event.target.value)}
        placeholder={field.placeholder || `Nhập ${field.label.toLowerCase()}`}
        style={{ ...shared.style, paddingRight: suffix ? 38 : 12 }}
      />
      {listId && <datalist id={listId}>{field.options?.map((option) => <option key={option} value={option} />)}</datalist>}
      {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-muted" aria-hidden="true">{suffix}</span>}
    </div>
  );
}

export function EntryWorkspace({ onSave, duplicateNotice }: Props) {
  const fields = useFormStore((state) => state.fields);
  const validation = useFormStore((state) => state.validation);
  const setValue = useFormStore((state) => state.setValue);
  const toast = useFormStore((state) => state.toast);
  const lastSlip = useFormStore((state) => state.slips[0]);
  const total = findSemanticField(fields, 'total');
  const totalValue = total ? calc(fields, total.id) : NaN;

  return (
    <main className="px-7 py-5 max-[900px]:px-4 max-[640px]:pb-[108px]">
      {toast && lastSlip && (
        <div role="status" className="mb-4 rounded-[16px] border border-green-line bg-green-soft px-4 py-3.5 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-[14px] font-extrabold text-green-deep">✓ Đã lưu phiếu {lastSlip.code}</div>
            <div className="mt-1 text-[13px] text-green-text">Tổng {total ? formatFormulaResult(total, lastSlip.total) : lastSlip.total.toLocaleString('vi-VN')} · Trạng thái Chờ duyệt</div>
          </div>
          <Link to={`/bao-cao?focus=${encodeURIComponent(lastSlip.code)}`} className="bg-green text-white rounded-[9px] px-3.5 min-h-10 flex items-center text-[13px] font-bold no-underline">Xem trong báo cáo →</Link>
        </div>
      )}

      {duplicateNotice && <div role="status" className="mb-4 rounded-xl bg-amber-soft text-amber-deep px-4 py-3 text-[13px] font-semibold">{duplicateNotice}</div>}

      {validation.length > 0 && (
        <section role="alert" className="mb-4 rounded-[16px] border border-red-line bg-red-soft px-4 py-3.5">
          <div className="text-[14px] font-extrabold text-red-text">Chưa thể lưu · cần sửa {validation.length} vấn đề</div>
          <ul className="mt-2 mb-0 pl-5 text-[13px] text-red-text leading-[1.65]">
            {validation.map((issue, index) => (
              <li key={`${issue.code}-${index}`}>{issue.fieldId ? <a href={`#entry-${issue.fieldId}`} className="text-red-text underline underline-offset-2">{issue.message}</a> : issue.message}</li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid grid-cols-[minmax(0,1fr)_minmax(260px,320px)] gap-5 items-start max-[900px]:grid-cols-1">
        <section aria-label="Thông tin phiếu" className="bg-white border border-line rounded-[20px] p-[22px] max-[640px]:p-4">
          <div className="flex items-start justify-between gap-3 mb-5">
            <div>
              <h2 className="m-0 text-[17px] font-extrabold text-ink">Thông tin phiếu</h2>
              <p className="mt-1 mb-0 text-[13px] text-muted">Bố cục đồng bộ từ Form Builder. Ô tím được tính tự động.</p>
            </div>
            <span className="text-[11px] font-bold text-primary bg-primary-soft rounded-full px-2.5 py-1 whitespace-nowrap">* Bắt buộc</span>
          </div>
          <div className="grid grid-cols-12 gap-x-3 gap-y-4">
            {fields.map((field) => {
              const issues = validation.filter((issue) => issue.fieldId === field.id);
              const style = { gridColumn: `span ${field.span} / span ${field.span}` } as CSSProperties;
              if (field.kind === 'formula') {
                const value = calc(fields, field.id);
                const diagnostic = diagnoseFormula(fields, field.id);
                const isTotal = field.id === total?.id;
                return (
                  <div key={field.id} id={`entry-${field.id}`} className="entry-cell min-w-0 rounded-xl border border-violet-line bg-violet-card px-3.5 py-3" data-span={field.span} style={style} tabIndex={-1}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-extrabold text-violet-text">ƒx TỰ TÍNH</span>
                      <span className="text-[11px] text-muted">chỉ đọc</span>
                    </div>
                    <div className="mt-2 flex items-end justify-between gap-3 flex-wrap">
                      <span className={isTotal ? 'text-[15px] font-extrabold' : 'text-[13px] font-semibold text-body'}>{field.label}</span>
                      <span className={isTotal ? 'text-[21px] font-extrabold text-violet-text tabular-nums' : 'text-[15px] font-bold text-violet-text tabular-nums'}>{formatFormulaResult(field, value)}</span>
                    </div>
                    {diagnostic.code !== 'valid' && <div className="mt-1.5 text-[12px] text-amber-deep">{diagnostic.message}</div>}
                  </div>
                );
              }
              return (
                <div key={field.id} className="entry-cell min-w-0" data-span={field.span} style={style}>
                  <label htmlFor={`entry-${field.id}`} className="block text-[13px] font-semibold text-body mb-1.5">
                    {field.label}{field.required && <span className="text-red-text" aria-label="bắt buộc"> *</span>}
                  </label>
                  <InputControl field={field} invalid={issues.length > 0} onChange={(value) => setValue(field.id, value)} />
                  <div id={`entry-error-${field.id}`} className="min-h-[18px] pt-1 text-[12px] text-red-text">{issues[0]?.message ?? ''}</div>
                </div>
              );
            })}
          </div>
        </section>

        <aside aria-label="Trạng thái phiếu" className="bg-white border border-violet-line rounded-[20px] p-[22px] sticky top-4 max-[900px]:static max-[640px]:p-4">
          <h2 className="m-0 text-[17px] font-extrabold text-ink">Sẵn sàng lưu?</h2>
          <p className="mt-1 mb-4 text-[12px] text-muted">Hệ thống kiểm tra trường bắt buộc, ngày, số, công thức và bản trùng trước khi tạo phiếu.</p>
          <div className="rounded-xl bg-violet-card border border-violet-line px-3.5 py-3">
            <div className="text-[12px] text-muted">Tổng thanh toán</div>
            <div className="mt-1 text-[22px] font-extrabold text-violet-text tabular-nums">{total ? formatFormulaResult(total, totalValue) : 'Chưa xác định'}</div>
          </div>
          <button type="button" onClick={onSave} className="mt-4 w-full min-h-12 border-0 rounded-xl bg-primary hover:bg-primary-hover text-white text-[15px] font-extrabold cursor-pointer shadow-[0_12px_24px_-14px_rgba(47,84,235,.8)] max-[640px]:hidden">Kiểm tra & lưu phiếu</button>
          <div className="mt-3 text-[11px] text-muted text-center">Dữ liệu được lưu cục bộ trên trình duyệt này.</div>
        </aside>
      </div>

      <div className="hidden max-[640px]:flex fixed z-30 left-0 right-0 bottom-0 bg-white border-t border-line px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] items-center justify-between gap-3 shadow-[0_-12px_28px_-22px_rgba(11,18,32,.45)]">
        <div className="min-w-0">
          <div className="text-[11px] text-muted">Tổng thanh toán</div>
          <div className="text-[17px] font-extrabold text-violet-text tabular-nums truncate">{total ? formatFormulaResult(total, totalValue) : 'Chưa xác định'}</div>
        </div>
        <button type="button" onClick={onSave} className="border-0 bg-primary text-white rounded-[10px] px-5 min-h-11 text-[14px] font-extrabold cursor-pointer">Kiểm tra & lưu</button>
      </div>
    </main>
  );
}
