import { useDroppable } from '@dnd-kit/core';
import { rectSortingStrategy, SortableContext } from '@dnd-kit/sortable';
import type { Field } from '@/lib/formula';
import { SortableFieldCard } from './FieldCard';

export function FormWorkspace({
  fields,
  placedFields,
  selectedId,
  initialIds,
  dragging,
  overId,
  onSelect,
  onRemoveFromForm,
  onOpenData,
  onOpenFormula,
  onOpenProperties,
  onExpand,
  onLoadTemplate,
}: {
  fields: Field[];
  placedFields: Field[];
  selectedId: string | null;
  initialIds: Set<string>;
  dragging: boolean;
  overId: string | null;
  onSelect: (field: Field) => void;
  onRemoveFromForm: (field: Field) => void;
  onOpenData: () => void;
  onOpenFormula: () => void;
  onOpenProperties: () => void;
  onExpand: () => void;
  onLoadTemplate: () => void;
}) {
  const { setNodeRef: setFormRef } = useDroppable({ id: 'form' });
  const { setNodeRef: setEndRef, isOver: isEndOver } = useDroppable({ id: 'form-end' });
  const dataCount = placedFields.filter((field) => field.kind !== 'formula').length;
  const formulaCount = placedFields.length - dataCount;
  return (
    <section aria-label="Form Workspace" className="v6-form-workspace">
      <header className="v6-form-toolbar">
        <div><div className="flex items-center gap-2"><span className="v6-step is-dark">4</span><h2>Form Workspace</h2></div><p>{dataCount} trường nhập · {formulaCount} trường tự tính</p></div>
        <div className="v6-form-toolbar-actions">
          <button type="button" onClick={onOpenData} className="v6-compact-only">+ Dữ liệu</button>
          <button type="button" onClick={onOpenFormula} className="v6-compact-only">ƒx Công thức</button>
          <button type="button" onClick={onExpand} aria-label="Mở rộng Form Workspace">Mở rộng ↗</button>
        </div>
      </header>
      <main className="system-scrollbar builder-canvas-pane" data-dnd-scroll="true">
        <div className="builder-compact-toolbar v6-compat-toolbar">
          <button type="button" onClick={onOpenData}>+ Thêm trường</button>
          <button type="button" onClick={onOpenProperties} disabled={!selectedId}>Thuộc tính</button>
        </div>
        <div className="builder-canvas-surface grid-bg">
          <section ref={setFormRef} aria-label="Biểu mẫu thiết kế" className="builder-form-drop-frame">
          <div className="builder-form bg-white rounded-[18px] p-[18px] flex flex-col gap-4" style={{ border: `2px dashed ${overId ? '#2F54EB' : '#D5DBE6'}` }}>
            <div className="v6-form-intro"><div><strong>Phiếu bán hàng</strong><span>Kéo trường vào vị trí cần hiển thị. Công thức màu tím chỉ đọc khi nhập phiếu.</span></div><div><span className="is-data">Dữ liệu</span><span className="is-formula">Tự tính</span></div></div>
            {!placedFields.length && <div className="v6-empty-canvas"><strong>Form chưa có trường</strong><span>Nạp mẫu bán hàng hoặc thêm trường từ cột 1 và 2.</span><div><button type="button" onClick={onLoadTemplate} className="v6-primary-button">Nạp mẫu Phiếu bán hàng</button><button type="button" onClick={onOpenData} className="v6-secondary-button">+ Thêm trường</button></div></div>}
            <SortableContext items={placedFields.map((field) => field.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-12 gap-3">
                {placedFields.map((field) => <SortableFieldCard key={field.id} field={field} fields={fields} selected={selectedId === field.id} testing={false} isNew={!initialIds.has(field.id)} dragDisabled={false} dropTarget={overId === field.id && dragging} onSelect={onSelect} onRequestDelete={onRemoveFromForm} />)}
              </div>
            </SortableContext>
            <button ref={setEndRef} type="button" onClick={onOpenData} className={`builder-end-drop${(isEndOver || overId === 'form-end') && dragging ? ' is-over' : ''}`}><span aria-hidden="true">＋</span><span>{dragging ? 'Thả để đặt ở cuối Form' : 'Thả trường vào đây hoặc mở Trường dữ liệu'}</span></button>
          </div>
          </section>
        </div>
      </main>
    </section>
  );
}
