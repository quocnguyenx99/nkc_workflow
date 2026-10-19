import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MeasuringStrategy,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type { Field } from '@/lib/formula';
import type { PaletteItem } from '@/data/template';
import { useFormStore } from '@/store/form';
import { DataFieldColumn } from './DataFieldColumn';
import { FormulaFieldColumn } from './FormulaFieldColumn';
import { FormulaSetupPanel } from './FormulaSetupPanel';
import { FormulaWorkspace } from './FormulaWorkspace';
import { FormWorkspace } from './FormWorkspace';
import { FieldPropertiesDrawer } from './FieldPropertiesDrawer';
import { PaletteCard } from './Palette';
import { FieldCardBody } from './FieldCard';
import { useFormulaDraft } from './useFormulaDraft';

const collision: CollisionDetection = (args) => {
  const within = pointerWithin(args);
  const fieldHits = within.filter((candidate) => candidate.id !== 'form');
  if (fieldHits.length) return fieldHits;
  if (['data-template', 'formula-definition'].includes(String(args.active.data.current?.type))) {
    if (within.length) return within;
    const form = typeof document === 'undefined' ? null : document.querySelector<HTMLElement>('.builder-form-drop-frame');
    const point = args.pointerCoordinates;
    if (form && point) {
      const rect = form.getBoundingClientRect();
      if (point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom) return closestCenter(args);
    }
    return closestCenter(args);
  }
  return closestCenter({ ...args, droppableContainers: args.droppableContainers.filter((container) => container.id !== 'form') });
};

type Dragging =
  | { type: 'data-template'; item: PaletteItem }
  | { type: 'formula-definition'; fieldId: string }
  | { type: 'placed-field'; fieldId: string }
  | null;
type Pane = 'data' | 'formula' | 'setup' | 'form';

export interface BuilderWorkspaceV6Props {
  onGuideProgress: (step: 2 | 3) => void;
  onRequestDelete: (id: string) => void;
  onLoadTemplate: () => void;
}

export function BuilderWorkspaceV6({ onGuideProgress, onRequestDelete, onLoadTemplate }: BuilderWorkspaceV6Props) {
  const fields = useFormStore((state) => state.fields);
  const formOrder = useFormStore((state) => state.formOrder);
  const selectedId = useFormStore((state) => state.sel);
  const select = useFormStore((state) => state.select);
  const addDataField = useFormStore((state) => state.addDataField);
  const createFormula = useFormStore((state) => state.createFormula);
  const placeField = useFormStore((state) => state.placeField);
  const detachFormula = useFormStore((state) => state.detachFormula);
  const movePlacedField = useFormStore((state) => state.movePlacedField);
  const [initialIds] = useState(() => new Set(useFormStore.getState().fields.map((field) => field.id)));
  const [dragging, setDragging] = useState<Dragging>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [dataOpen, setDataOpen] = useState(false);
  const [formulaOpen, setFormulaOpen] = useState(false);
  const [propertiesOpen, setPropertiesOpen] = useState(false);
  const [formulaExpanded, setFormulaExpanded] = useState(false);
  const [setupCollapsed, setSetupCollapsed] = useState(false);
  const [activePane, setActivePane] = useState<Pane>('form');
  const [setupWidth, setSetupWidth] = useState(400);
  const [pendingFormulaId, setPendingFormulaId] = useState<string | null>(null);
  const dataRailRef = useRef<HTMLButtonElement>(null);
  const formulaRailRef = useRef<HTMLButtonElement>(null);
  const lastOverRef = useRef<string | null>(null);
  const draft = useFormulaDraft(fields, selectedId);

  const fieldMap = useMemo(() => new Map(fields.map((field) => [field.id, field])), [fields]);
  const placedFields = formOrder.flatMap((id) => {
    const field = fieldMap.get(id);
    return field ? [field] : [];
  });
  const selected = selectedId ? fieldMap.get(selectedId) ?? null : null;
  const formulaErrors = fields.filter((field) => field.kind === 'formula').length;
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || dragging) return;
      if (formulaExpanded) setFormulaExpanded(false);
      else if (propertiesOpen) setPropertiesOpen(false);
      else if (dataOpen) { setDataOpen(false); window.setTimeout(() => dataRailRef.current?.focus(), 0); }
      else if (formulaOpen) { setFormulaOpen(false); window.setTimeout(() => formulaRailRef.current?.focus(), 0); }
    };
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [dataOpen, dragging, formulaExpanded, formulaOpen, propertiesOpen]);

  const commitFormulaSelection = (id: string) => {
    select(id);
    setPropertiesOpen(false);
    setSetupCollapsed(false);
    setActivePane('setup');
  };
  const requestFormulaSelection = (id: string) => {
    if (draft.dirty && draft.draft?.id !== id) {
      setPendingFormulaId(id);
      return;
    }
    commitFormulaSelection(id);
  };

  const insertData = (item: PaletteItem, index?: number) => {
    const selectedIndex = formOrder.indexOf(selectedId ?? '');
    addDataField(item, index ?? (selectedIndex >= 0 ? selectedIndex + 1 : formOrder.length));
    setDataOpen(false);
    setPropertiesOpen(true);
    setActivePane('form');
    onGuideProgress(2);
    window.setTimeout(() => document.getElementById('nl-name')?.focus(), 0);
  };

  const newFormula = () => {
    if (draft.dirty && !window.confirm('Bỏ thay đổi công thức chưa áp dụng để tạo công thức mới?')) return;
    const id = createFormula('free');
    select(id);
    setFormulaOpen(false);
    setSetupCollapsed(false);
    setActivePane('setup');
    window.setTimeout(() => document.getElementById('nl-name')?.focus(), 0);
  };

  const dropIndex = (overId: string | null) => {
    if (!overId || overId === 'form' || overId === 'form-end') return formOrder.length;
    const index = formOrder.indexOf(overId);
    return index < 0 ? formOrder.length : index;
  };

  const onDragStart = (event: DragStartEvent) => {
    lastOverRef.current = null;
    const data = event.active.data.current;
    if (data?.type === 'data-template') setDragging({ type: 'data-template', item: data.item as PaletteItem });
    else if (data?.type === 'formula-definition') setDragging({ type: 'formula-definition', fieldId: String(data.fieldId) });
    else setDragging({ type: 'placed-field', fieldId: String(event.active.id) });
  };

  const onDragEnd = (event: DragEndEvent) => {
    const data = event.active.data.current;
    const active: Dragging = data?.type === 'data-template'
      ? { type: 'data-template', item: data.item as PaletteItem }
      : data?.type === 'formula-definition'
        ? { type: 'formula-definition', fieldId: String(data.fieldId) }
        : { type: 'placed-field', fieldId: String(event.active.id) };
    setDragging(null);
    setOverId(null);
    const effectiveOverId = event.over ? String(event.over.id) : lastOverRef.current;
    lastOverRef.current = null;
    if (!effectiveOverId) return;
    const index = dropIndex(effectiveOverId);
    if (active.type === 'data-template') insertData(active.item, index);
    else if (active.type === 'formula-definition') {
      placeField(active.fieldId, index);
      requestFormulaSelection(active.fieldId);
    } else {
      const from = useFormStore.getState().formOrder.indexOf(active.fieldId);
      const target = Math.min(index, Math.max(0, useFormStore.getState().formOrder.length - 1));
      if (from >= 0) movePlacedField(from, target);
    }
  };

  const selectCard = (field: Field) => {
    if (field.kind === 'formula') requestFormulaSelection(field.id);
    else {
      select(field.id);
      setPropertiesOpen(true);
      setActivePane('form');
    }
  };

  const removeFromForm = (field: Field) => {
    if (field.kind === 'formula') detachFormula(field.id);
    else onRequestDelete(field.id);
  };

  const startResize = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = setupWidth;
    const move = (pointer: PointerEvent) => setSetupWidth(Math.max(340, Math.min(520, startWidth + pointer.clientX - startX)));
    const stop = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', stop); };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', stop);
  };

  const setupProps = {
    fields,
    draft: draft.draft,
    previewFields: draft.previewFields,
    dirty: draft.dirty,
    onPatch: draft.patchDraft,
    onApply: () => { draft.apply(); onGuideProgress(3); },
    onDiscard: draft.discard,
  };
  const draggingField = dragging?.type === 'placed-field' ? fieldMap.get(dragging.fieldId) : dragging?.type === 'formula-definition' ? fieldMap.get(dragging.fieldId) : undefined;
  const frameStyle = { '--v6-setup-width': `${setupWidth}px` } as CSSProperties;

  if (formulaExpanded) return <div className="builder-workspace-frame v6-builder-frame"><FormulaWorkspace {...setupProps} onBack={() => setFormulaExpanded(false)} /></div>;

  return (
    <DndContext sensors={sensors} collisionDetection={collision} measuring={{ droppable: { strategy: MeasuringStrategy.Always } }} autoScroll={{ acceleration: 5, interval: 10, threshold: { x: 0.08, y: 0.18 }, canScroll: (element) => element instanceof HTMLElement && element.dataset.dndScroll === 'true' }} onDragStart={onDragStart} onDragOver={(event) => { const id = event.over ? String(event.over.id) : null; setOverId(id); if (id) lastOverRef.current = id; }} onDragEnd={onDragEnd} onDragCancel={() => { setDragging(null); setOverId(null); lastOverRef.current = null; }}>
      <div className={`builder-workspace-frame v6-builder-frame${setupCollapsed ? ' is-setup-collapsed' : ''}`} style={frameStyle}>
        <nav className="v6-workspace-tabs" aria-label="Khu vực Form Builder">
          {(['data', 'formula', 'setup', 'form'] as Pane[]).map((pane, index) => <button key={pane} type="button" className={activePane === pane ? 'is-active' : ''} onClick={() => { setActivePane(pane); if (pane === 'data') setDataOpen(true); if (pane === 'formula') setFormulaOpen(true); }}>{index + 1}. {pane === 'data' ? 'Dữ liệu' : pane === 'formula' ? 'Công thức' : pane === 'setup' ? 'Setup' : 'Form'}</button>)}
        </nav>
        <div className="v6-builder-grid" data-active-pane={activePane}>
          <div className={`v6-library-slot is-data${dataOpen ? ' is-open' : ''}`}>
            <button ref={dataRailRef} type="button" className="v6-rail" onClick={() => setDataOpen(true)} aria-label="Mở trường dữ liệu"><span>1</span><strong>Aa</strong><small>{fields.filter((field) => field.kind !== 'formula').length}</small></button>
            <div className="v6-library-panel"><DataFieldColumn onAdd={insertData} onClose={() => setDataOpen(false)} /></div>
          </div>
          <div className={`v6-library-slot is-formula${formulaOpen ? ' is-open' : ''}`}>
            <button ref={formulaRailRef} type="button" className="v6-rail" onClick={() => setFormulaOpen(true)} aria-label="Mở trường công thức"><span>2</span><strong>ƒx</strong><small>{formulaErrors}</small></button>
            <div className="v6-library-panel"><FormulaFieldColumn fields={fields} formOrder={formOrder} selectedId={selectedId} onCreate={newFormula} onSelect={requestFormulaSelection} onPlace={(id) => placeField(id)} onDetach={detachFormula} onDelete={onRequestDelete} onClose={() => setFormulaOpen(false)} /></div>
          </div>
          <div className="v6-setup-slot">
            {setupCollapsed ? <button type="button" className="v6-setup-rail" onClick={() => setSetupCollapsed(false)}><span>3</span><strong>Setup</strong></button> : <FormulaSetupPanel {...setupProps} onExpand={() => setFormulaExpanded(true)} onClose={() => { setSetupCollapsed(true); setActivePane('form'); }} />}
            {!setupCollapsed && <button type="button" className="v6-resize-handle" onPointerDown={startResize} aria-label="Thay đổi độ rộng Setup công thức" />}
          </div>
          <FormWorkspace fields={fields} placedFields={placedFields} selectedId={selectedId} initialIds={initialIds} dragging={Boolean(dragging)} overId={overId} onSelect={selectCard} onRemoveFromForm={removeFromForm} onOpenData={() => { setDataOpen(true); setActivePane('data'); }} onOpenFormula={() => { setFormulaOpen(true); setActivePane('formula'); }} onOpenProperties={() => selected?.kind !== 'formula' && setPropertiesOpen(true)} onLoadTemplate={onLoadTemplate} />
        </div>
        <FieldPropertiesDrawer field={selected?.kind === 'formula' ? null : selected} open={propertiesOpen} onClose={() => setPropertiesOpen(false)} onRequestDelete={onRequestDelete} />
        {pendingFormulaId && <div className="v6-draft-dialog-layer" role="presentation"><section role="dialog" aria-modal="true" aria-label="Thay đổi công thức chưa áp dụng" className="v6-draft-dialog"><h2>Thay đổi chưa được áp dụng</h2><p>Bạn muốn lưu bản nháp hiện tại trước khi chuyển sang công thức khác?</p><div><button type="button" onClick={() => setPendingFormulaId(null)} className="v6-secondary-button">Ở lại</button><button type="button" onClick={() => { draft.discard(); const id = pendingFormulaId; setPendingFormulaId(null); commitFormulaSelection(id); }} className="v6-secondary-button">Bỏ thay đổi</button><button type="button" onClick={() => { draft.apply(); const id = pendingFormulaId; setPendingFormulaId(null); commitFormulaSelection(id); }} className="v6-primary-button">Áp dụng & chuyển</button></div></section></div>}
      </div>
      <DragOverlay dropAnimation={{ duration: 180, easing: 'cubic-bezier(.22,1,.36,1)' }}>
        {dragging?.type === 'data-template' && <div style={{ width: 220, transform: 'rotate(-2deg)' }}><PaletteCard p={dragging.item} overlay /></div>}
        {draggingField && <div style={{ width: 320, transform: 'rotate(-2deg)' }}><FieldCardBody field={draggingField} fields={fields} selected={false} testing={false} overlay /></div>}
      </DragOverlay>
    </DndContext>
  );
}
