import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
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
import { AnimatePresence, motion } from 'motion/react';
import { AppHeader, AppShell, AppSidebar } from '@/components/app/AppShell';
import { Palette, PaletteCard } from '@/components/nhap-lieu/Palette';
import { FieldCardBody, SortableFieldCard } from '@/components/nhap-lieu/FieldCard';
import { Inspector } from '@/components/nhap-lieu/Inspector';
import { CoachTips } from '@/components/nhap-lieu/CoachTips';
import { fmtMoney } from '@/lib/formula';
import type { PaletteItem } from '@/data/template';
import { kpiOf, useFormStore } from '@/store/form';

const collision: CollisionDetection = (args) => {
  const within = pointerWithin(args);
  const fieldHits = within.filter((c) => c.id !== 'form');
  if (fieldHits.length) return fieldHits;
  if (args.active.data.current?.type === 'palette') return within;
  return closestCenter({ ...args, droppableContainers: args.droppableContainers.filter((c) => c.id !== 'form') });
};

type Dragging = { type: 'palette'; item: PaletteItem } | { type: 'field'; id: string } | null;

export default function NhapLieuPage() {
  const s = useFormStore();
  const testing = s.mode === 'test';
  const [initialIds] = useState(() => new Set(useFormStore.getState().fields.map((f) => f.id)));
  const [dragging, setDragging] = useState<Dragging>(null);
  const [overForm, setOverForm] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const { setNodeRef: setFormRef } = useDroppable({ id: 'form' });

  const sel = s.fields.find((f) => f.id === s.sel);
  const activeTip = testing ? 3 : sel?.kind === 'formula' ? 2 : 1;
  const nData = s.fields.filter((f) => f.kind !== 'formula').length;
  const nF = s.fields.length - nData;
  const kpi = kpiOf(s.fields);

  const onDragStart = (e: DragStartEvent) => {
    const d = e.active.data.current;
    if (d?.type === 'palette') setDragging({ type: 'palette', item: d.item as PaletteItem });
    else setDragging({ type: 'field', id: String(e.active.id) });
  };

  const onDragEnd = (e: DragEndEvent) => {
    const d = dragging;
    setDragging(null);
    setOverForm(false);
    const { over, active } = e;
    if (!d || !over) return;
    const fields = useFormStore.getState().fields;
    if (d.type === 'palette') {
      const idx = over.id === 'form' ? fields.length : fields.findIndex((f) => f.id === over.id);
      s.add(d.item, idx < 0 ? fields.length : idx);
    } else if (over.id !== active.id && over.id !== 'form') {
      const from = fields.findIndex((f) => f.id === active.id);
      const to = fields.findIndex((f) => f.id === over.id);
      if (from >= 0 && to >= 0) s.move(from, to);
    }
  };

  const draggingField = dragging?.type === 'field' ? s.fields.find((f) => f.id === dragging.id) : undefined;
  const seg = (on: boolean) => ({
    background: on ? '#FFFFFF' : 'transparent',
    color: on ? '#0B1220' : '#5B6478',
    boxShadow: on ? '0 1px 3px rgba(11,18,32,.15)' : 'none',
  });

  return (
    <AppShell
      minHeight={1500}
      sidebar={
        <AppSidebar
          active="form"
          pendingCount="3"
          group={{
            heading: 'BIỂU MẪU · KINH DOANH',
            items: [
              { label: 'Phiếu bán hàng', color: '#2F54EB', active: true },
              { label: 'Báo giá', color: '#C7D2FF' },
              { label: 'Hợp đồng', color: '#C7D2FF' },
            ],
          }}
          user={{ initials: 'TH', name: 'Trần Thu Hà', role: 'Kinh doanh', avatarBg: '#2F54EB' }}
        />
      }
    >
      <AppHeader crumb="Kinh doanh  /  Biểu mẫu" title="Phiếu bán hàng">
        <div role="group" aria-label="Chế độ" className="flex bg-hover rounded-xl p-1 gap-1">
          <button type="button" onClick={() => s.setMode('design')} className="border-0 rounded-[9px] px-4 min-h-[38px] text-[14px] font-semibold cursor-pointer transition-colors" style={seg(!testing)}>
            ① Thiết kế biểu mẫu
          </button>
          <button type="button" onClick={() => s.setMode('test')} className="border-0 rounded-[9px] px-4 min-h-[38px] text-[14px] font-semibold cursor-pointer transition-colors" style={seg(testing)}>
            ② Nhập liệu thử
          </button>
        </div>
        <button type="button" onClick={s.loadTemplate} className="ghost border border-line-3 bg-white rounded-[10px] px-3.5 min-h-11 text-[14px] font-semibold text-ink cursor-pointer">
          Nạp mẫu
        </button>
        <button type="button" onClick={s.clearAll} className="ghost border border-line-3 bg-white rounded-[10px] px-3.5 min-h-11 text-[14px] font-semibold text-ink cursor-pointer">
          Làm trống
        </button>
        <button
          type="button"
          onClick={() => s.save()}
          className="border-0 bg-primary hover:bg-primary-hover text-white rounded-[10px] px-[18px] min-h-11 text-[14px] font-bold cursor-pointer shadow-[0_10px_22px_-10px_rgba(47,84,235,.7)]"
        >
          Lưu phiếu
        </button>
      </AppHeader>

      <CoachTips active={activeTip} />

      <AnimatePresence>
        {s.toast && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-4 mx-7 bg-green-soft border border-green-line text-green-deep rounded-xl px-4 py-3 flex justify-between items-center gap-3 flex-wrap text-[14px] font-semibold max-[900px]:mx-4"
          >
            <span>
              ✓ Đã lưu phiếu PBH-{1038 + s.saved} — tổng thanh toán {fmtMoney(kpi)}. Dữ liệu đã sẵn sàng cho báo cáo.
            </span>
            <Link to="/bao-cao" className="text-green-text font-bold no-underline">
              Xem báo cáo →
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <DndContext
        sensors={sensors}
        collisionDetection={collision}
        onDragStart={onDragStart}
        onDragOver={(e) => setOverForm(dragging?.type === 'palette' && !!e.over)}
        onDragEnd={onDragEnd}
        onDragCancel={() => {
          setDragging(null);
          setOverForm(false);
        }}
      >
        <div className="flex flex-wrap items-stretch flex-1">
          <Palette onAdd={(p) => s.add(p)} />

          <main className="grid-bg flex-[999_1_520px] min-w-0 px-4 py-5 flex flex-col gap-4 box-border">
            <section
              ref={setFormRef}
              aria-label="Biểu mẫu nhập liệu"
              className="bg-white rounded-[20px] p-[22px] flex flex-col gap-4 shadow-[0_18px_40px_-30px_rgba(11,18,32,.35)] transition-colors max-[900px]:p-4"
              style={{ border: `2px dashed ${overForm ? '#2F54EB' : '#D5DBE6'}` }}
            >
              <div className="flex justify-between items-center gap-3 flex-wrap">
                <div className="flex flex-col gap-[3px]">
                  <div className="text-[17px] font-extrabold tracking-[-.01em]">
                    Phiếu bán hàng · {nData} trường nhập · {nF} trường tự tính
                  </div>
                  <div className="text-[13px] text-muted">
                    {testing
                      ? 'Đang nhập liệu thử — sửa số ở ô viền xanh, ô tím tự tính lại ngay lập tức'
                      : 'Lưới 12 cột — kéo thả để thêm trường, bấm ↔ để đổi độ rộng'}
                  </div>
                </div>
                <div className="flex gap-3.5 text-[12px] text-muted flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-[3px] bg-primary-soft border border-primary" />
                    Người dùng nhập
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-[3px] bg-violet-soft border border-violet" />
                    Hệ thống tự tính
                  </span>
                </div>
              </div>

              {s.fields.length === 0 && (
                <div className="border-2 border-dashed border-[#C9D1DF] rounded-[14px] min-h-[260px] flex flex-col items-center justify-center gap-2 text-muted text-center p-6">
                  <div className="text-[17px] font-bold text-ink">Kéo trường dữ liệu từ cột trái thả vào đây</div>
                  <div className="text-[14px]">hoặc bấm “Nạp mẫu” để dựng nhanh phiếu bán hàng</div>
                </div>
              )}

              <SortableContext items={s.fields.map((f) => f.id)} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-12 gap-3">
                  {s.fields.map((f) => (
                    <SortableFieldCard
                      key={f.id}
                      field={f}
                      fields={s.fields}
                      selected={s.sel === f.id}
                      testing={testing}
                      isNew={!initialIds.has(f.id)}
                      dragDisabled={testing}
                    />
                  ))}
                </div>
              </SortableContext>
            </section>
          </main>

          <Inspector />
        </div>

        <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(.22,1,.36,1)' }}>
          {dragging?.type === 'palette' && (
            <div style={{ transform: 'rotate(-3deg)', width: 220 }}>
              <PaletteCard p={dragging.item} overlay />
            </div>
          )}
          {draggingField && (
            <div style={{ transform: 'rotate(-3deg)' }}>
              <FieldCardBody field={draggingField} fields={s.fields} selected={false} testing={testing} overlay />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </AppShell>
  );
}
