import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MeasuringStrategy,
  PointerSensor,
  pointerWithin,
  useDroppable,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { rectSortingStrategy, SortableContext, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Palette, PaletteCard } from '@/components/nhap-lieu/Palette';
import { FieldCardBody, SortableFieldCard } from '@/components/nhap-lieu/FieldCard';
import { Inspector } from '@/components/nhap-lieu/Inspector';
import type { Field } from '@/lib/formula';
import type { PaletteItem } from '@/data/template';
import { useFormStore } from '@/store/form';

const collision: CollisionDetection = (args) => {
  const within = pointerWithin(args);
  const fieldHits = within.filter((candidate) => candidate.id !== 'form');
  if (fieldHits.length) return fieldHits;
  if (args.active.data.current?.type === 'palette') {
    if (within.length) return within;
    const form = typeof document === 'undefined' ? null : document.querySelector<HTMLElement>('.builder-form');
    const point = args.pointerCoordinates;
    if (form && point) {
      const rect = form.getBoundingClientRect();
      if (point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom) return closestCenter(args);
    }
    return [];
  }
  return closestCenter({ ...args, droppableContainers: args.droppableContainers.filter((container) => container.id !== 'form') });
};

type Dragging = { type: 'palette'; item: PaletteItem } | { type: 'field'; id: string } | null;

interface Props {
  onGuideProgress: (step: 2 | 3) => void;
  onRequestDelete: (id: string) => void;
  onLoadTemplate: () => void;
}

export function BuilderWorkspace({ onGuideProgress, onRequestDelete, onLoadTemplate }: Props) {
  const fields = useFormStore((state) => state.fields);
  const selectedId = useFormStore((state) => state.sel);
  const add = useFormStore((state) => state.add);
  const move = useFormStore((state) => state.move);
  const [initialIds] = useState(() => new Set(useFormStore.getState().fields.map((field) => field.id)));
  const [dragging, setDragging] = useState<Dragging>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const libraryButtonRef = useRef<HTMLButtonElement>(null);
  const inspectorButtonRef = useRef<HTMLButtonElement>(null);

  const closeLibrary = () => {
    setLibraryOpen(false);
    window.setTimeout(() => libraryButtonRef.current?.focus(), 0);
  };

  const closeInspector = () => {
    setInspectorOpen(false);
    window.setTimeout(() => inspectorButtonRef.current?.focus(), 0);
  };

  useEffect(() => {
    const closeDrawer = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || dragging) return;
      if (libraryOpen) closeLibrary();
      if (inspectorOpen) closeInspector();
    };
    window.addEventListener('keydown', closeDrawer);
    return () => window.removeEventListener('keydown', closeDrawer);
  }, [dragging, inspectorOpen, libraryOpen]);

  useEffect(() => {
    if (!libraryOpen && !inspectorOpen) return;
    const frame = window.requestAnimationFrame(() => {
      const selector = libraryOpen ? 'button[aria-label="Đóng thư viện trường"]' : 'button[aria-label="Đóng thuộc tính"]';
      const closeButton = document.querySelector<HTMLElement>(selector);
      if (closeButton?.offsetParent) closeButton.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [inspectorOpen, libraryOpen]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const { setNodeRef: setFormRef } = useDroppable({ id: 'form' });
  const { setNodeRef: setEndRef, isOver: isEndOver } = useDroppable({ id: 'form-end' });
  const selected = fields.find((field) => field.id === selectedId);
  const dataCount = fields.filter((field) => field.kind !== 'formula').length;
  const formulaCount = fields.length - dataCount;

  const insert = (item: PaletteItem, index?: number) => {
    const selectedIndex = fields.findIndex((field) => field.id === selectedId);
    add(item, index ?? (selectedIndex >= 0 ? selectedIndex + 1 : fields.length));
    setLibraryOpen(false);
    setInspectorOpen(true);
    onGuideProgress(2);
    window.setTimeout(() => document.getElementById('nl-name')?.focus(), 0);
  };

  const onDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current;
    if (data?.type === 'palette') setDragging({ type: 'palette', item: data.item as PaletteItem });
    else setDragging({ type: 'field', id: String(event.active.id) });
  };

  const onDragEnd = (event: DragEndEvent) => {
    const activeDrag = dragging;
    setDragging(null);
    setOverId(null);
    if (!activeDrag || !event.over) return;
    const currentFields = useFormStore.getState().fields;
    if (activeDrag.type === 'palette') {
      const index = event.over.id === 'form' || event.over.id === 'form-end' ? currentFields.length : currentFields.findIndex((field) => field.id === event.over?.id);
      insert(activeDrag.item, index < 0 ? currentFields.length : index);
      return;
    }
    if (event.over.id === 'form-end') {
      const from = currentFields.findIndex((field) => field.id === event.active.id);
      if (from >= 0) move(from, currentFields.length - 1);
      return;
    }
    if (event.over.id !== event.active.id && event.over.id !== 'form') {
      const from = currentFields.findIndex((field) => field.id === event.active.id);
      const to = currentFields.findIndex((field) => field.id === event.over?.id);
      if (from >= 0 && to >= 0) move(from, to);
    }
  };

  const draggingField = dragging?.type === 'field' ? fields.find((field) => field.id === dragging.id) : undefined;

  const selectField = (field: Field) => {
    setLibraryOpen(false);
    setInspectorOpen(true);
    if (field.kind === 'formula') onGuideProgress(2);
  };

  const openLibrary = () => {
    setInspectorOpen(false);
    setLibraryOpen(true);
  };

  const trapFocus = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab') return;
    const focusable = [...event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')].filter((element) => element.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collision}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      autoScroll={{
        acceleration: 5,
        interval: 10,
        threshold: { x: 0.08, y: 0.18 },
        canScroll: (element) => element instanceof HTMLElement && element.dataset.dndScroll === 'true',
      }}
      onDragStart={onDragStart}
      onDragOver={(event) => setOverId(event.over ? String(event.over.id) : null)}
      onDragEnd={onDragEnd}
      onDragCancel={() => {
        setDragging(null);
        setOverId(null);
      }}
    >
      <div className="builder-workspace-frame">
        <div className="builder-workspace">
        <div
          className={`builder-drawer-layer builder-drawer-layer--left${libraryOpen ? ' is-open' : ''}${dragging?.type === 'palette' ? ' is-dragging' : ''}`}
          onMouseDown={(event) => event.target === event.currentTarget && closeLibrary()}
        >
          <div className="builder-drawer-panel builder-drawer-panel--left" onKeyDown={trapFocus}>
            <div className="builder-drawer-header">
              <div><div className="text-[16px] font-extrabold">Thêm trường</div><div className="text-[12px] text-muted">Kéo vào canvas hoặc bấm để thêm nhanh</div></div>
              <button type="button" onClick={closeLibrary} aria-label="Đóng thư viện trường" className="border-0 bg-hover rounded-lg w-9 h-9 text-[20px] cursor-pointer">×</button>
            </div>
            <Palette onAdd={insert} />
          </div>
        </div>

        <main className="system-scrollbar builder-canvas-pane" data-dnd-scroll="true">
          <div className="builder-compact-toolbar">
            <button ref={libraryButtonRef} type="button" onClick={openLibrary} className="flex-1 border border-primary-line bg-primary-soft text-primary-hover rounded-[10px] min-h-11 text-[13px] font-bold cursor-pointer">+ Thêm trường</button>
            <button ref={inspectorButtonRef} type="button" onClick={() => setInspectorOpen(true)} disabled={!selected} className="flex-1 border border-line-3 bg-white text-ink rounded-[10px] min-h-11 text-[13px] font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">Thuộc tính</button>
          </div>

          <div className="builder-canvas-surface grid-bg">
            <section
              ref={setFormRef}
              aria-label="Biểu mẫu thiết kế"
              className="builder-form bg-white rounded-[20px] p-[22px] flex flex-col gap-4 shadow-[0_18px_40px_-30px_rgba(11,18,32,.35)] transition-colors max-[640px]:p-4"
              style={{ border: `2px dashed ${overId ? '#2F54EB' : '#D5DBE6'}` }}
            >
            <div className="flex justify-between items-center gap-3 flex-wrap">
              <div>
                <div className="text-[17px] font-extrabold tracking-[-.01em]">Biểu mẫu · {dataCount} trường nhập · {formulaCount} trường tự tính</div>
                <div className="mt-1 text-[13px] text-muted">Kéo bằng tay nắm ⠿ hoặc bấm một loại trường để thêm nhanh.</div>
              </div>
              <div className="flex gap-3 text-[12px] text-muted">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-[3px] bg-primary-soft border border-primary" />Người dùng nhập</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-[3px] bg-violet-soft border border-violet" />Hệ thống tự tính</span>
              </div>
            </div>

            {fields.length === 0 && (
              <div className="border-2 border-dashed border-[#C9D1DF] rounded-[14px] min-h-[260px] flex flex-col items-center justify-center gap-3 text-muted text-center p-6">
                <div className="text-[17px] font-bold text-ink">Biểu mẫu chưa có trường</div>
                <div className="text-[14px]">Nạp mẫu Phiếu bán hàng hoặc thêm trường từ thư viện.</div>
                <div className="flex gap-2 flex-wrap justify-center">
                  <button type="button" onClick={onLoadTemplate} className="border-0 bg-primary text-white rounded-[10px] px-4 min-h-11 text-[14px] font-bold cursor-pointer">Nạp mẫu Phiếu bán hàng</button>
                  <button type="button" onClick={openLibrary} className="builder-empty-add border border-line-3 bg-white rounded-[10px] px-4 min-h-11 text-[14px] font-semibold cursor-pointer">+ Thêm trường</button>
                </div>
              </div>
            )}

            <SortableContext items={fields.map((field) => field.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-12 gap-3">
                {fields.map((field) => (
                  <SortableFieldCard
                    key={field.id}
                    field={field}
                    fields={fields}
                    selected={selectedId === field.id}
                    testing={false}
                    isNew={!initialIds.has(field.id)}
                    dragDisabled={false}
                    dropTarget={overId === field.id && dragging !== null}
                    onSelect={selectField}
                    onRequestDelete={(target) => onRequestDelete(target.id)}
                  />
                ))}
              </div>
            </SortableContext>
              <button ref={setEndRef} type="button" onClick={openLibrary} className={`builder-end-drop${(isEndOver || overId === 'form-end') && dragging ? ' is-over' : ''}`}>
                <span className="text-[18px] leading-none" aria-hidden="true">＋</span>
                <span>{dragging?.type === 'palette' ? 'Thả để thêm vào cuối biểu mẫu' : 'Kéo trường vào đây hoặc mở Thư viện trường'}</span>
              </button>
            </section>
          </div>
        </main>

          <div className={`builder-drawer-layer builder-drawer-layer--right${inspectorOpen ? ' is-open' : ''}`} onMouseDown={(event) => event.target === event.currentTarget && closeInspector()}>
            <div className="builder-drawer-panel builder-drawer-panel--right" onKeyDown={trapFocus}>
              <Inspector
                onClose={closeInspector}
                onRequestDelete={onRequestDelete}
                onFormulaInteraction={() => onGuideProgress(3)}
              />
            </div>
          </div>
        </div>
      </div>

      <DragOverlay dropAnimation={{ duration: 180, easing: 'cubic-bezier(.22,1,.36,1)' }}>
        {dragging?.type === 'palette' && <div style={{ transform: 'rotate(-2deg)', width: 220 }}><PaletteCard p={dragging.item} overlay /></div>}
        {draggingField && <div style={{ transform: 'rotate(-2deg)' }}><FieldCardBody field={draggingField} fields={fields} selected={false} testing={false} overlay /></div>}
      </DragOverlay>
    </DndContext>
  );
}
