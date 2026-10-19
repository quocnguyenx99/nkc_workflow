import { useMemo, useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { diagnoseFormula } from '@/lib/formula-diagnostics';
import { findDependents } from '@/lib/field-dependencies';
import type { Field } from '@/lib/formula';

function FormulaRegistryItem({
  field,
  fields,
  placed,
  selected,
  onSelect,
  onPlace,
  onDetach,
  onDelete,
}: {
  field: Field;
  fields: Field[];
  placed: boolean;
  selected: boolean;
  onSelect: () => void;
  onPlace: () => void;
  onDetach: () => void;
  onDelete: () => void;
}) {
  const diagnostic = diagnoseFormula(fields, field.id);
  const dependents = findDependents(fields, field.id);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: `formula:${field.id}`, data: { type: 'formula-definition', fieldId: field.id } });
  const status = diagnostic.code === 'valid' ? 'Hợp lệ' : diagnostic.code === 'empty' ? 'Bản nháp' : 'Có lỗi';
  return (
    <article ref={setNodeRef} className={`v6-formula-item${selected ? ' is-selected' : ''}`} style={{ opacity: isDragging ? 0.45 : 1 }}>
      <button type="button" onClick={onSelect} aria-label={`Chỉnh công thức ${field.label}`} className="v6-formula-main">
        <span className="v6-formula-glyph">ƒx</span>
        <span className="min-w-0"><strong>{field.label}</strong><small>{status}{placed ? ' · Trên Form' : ''}{dependents.length ? ` · ${dependents.length} phụ thuộc` : ''}</small></span>
        <span className={`v6-status-dot is-${diagnostic.code === 'valid' ? 'valid' : diagnostic.code === 'empty' ? 'draft' : 'error'}`} aria-hidden="true" />
      </button>
      <div className="v6-formula-actions">
        <button type="button" {...attributes} {...listeners} title="Kéo vào Form" aria-label={`Kéo công thức ${field.label} vào biểu mẫu`} className="v6-mini-button">⠿</button>
        {placed
          ? <button type="button" onClick={onDetach} className="v6-mini-button" title="Bỏ khỏi Form">Bỏ</button>
          : <button type="button" onClick={onPlace} className="v6-mini-button" title="Đặt lên Form">+ Form</button>}
        <button type="button" onClick={onDelete} className="v6-mini-button is-danger" title="Xóa định nghĩa">Xóa</button>
      </div>
    </article>
  );
}

export function FormulaFieldColumn({ fields, formOrder, selectedId, onCreate, onSelect, onPlace, onDetach, onDelete, onClose }: {
  fields: Field[];
  formOrder: string[];
  selectedId: string | null;
  onCreate: () => void;
  onSelect: (id: string) => void;
  onPlace: (id: string) => void;
  onDetach: (id: string) => void;
  onDelete: (id: string) => void;
  onClose?: () => void;
}) {
  const [query, setQuery] = useState('');
  const formulas = useMemo(() => fields.filter((field) => field.kind === 'formula' && field.label.toLocaleLowerCase('vi').includes(query.trim().toLocaleLowerCase('vi'))), [fields, query]);
  return (
    <aside aria-label="Trường công thức" className="system-scrollbar v6-column v6-formula-column" data-dnd-scroll="true">
      <header className="v6-column-header">
        <div><div className="v6-step is-violet">2</div><h2>Trường công thức</h2><p>Quản lý kết quả tính toán độc lập với Form.</p></div>
        {onClose && <button type="button" onClick={onClose} aria-label="Đóng trường công thức" className="v6-icon-button">×</button>}
      </header>
      <div className="v6-column-body">
        <button type="button" onClick={onCreate} className="v6-primary-button">+ Công thức mới</button>
        <label className="v6-search"><span className="sr-only">Tìm công thức</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm theo tên…" /></label>
        <div className="v6-section-label">{formulas.length} ĐỊNH NGHĨA</div>
        <div className="flex flex-col gap-2">
          {formulas.map((field) => <FormulaRegistryItem key={field.id} field={field} fields={fields} placed={formOrder.includes(field.id)} selected={selectedId === field.id} onSelect={() => onSelect(field.id)} onPlace={() => onPlace(field.id)} onDetach={() => onDetach(field.id)} onDelete={() => onDelete(field.id)} />)}
          {!formulas.length && <div className="v6-empty-state">Chưa có công thức. Tạo một công thức số học để bắt đầu.</div>}
        </div>
      </div>
    </aside>
  );
}
