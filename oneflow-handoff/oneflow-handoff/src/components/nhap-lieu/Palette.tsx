import { useDraggable } from '@dnd-kit/core';
import { PAL_DATA, PAL_FORMULA, type PaletteItem } from '@/data/template';

export function PaletteCard({ p, overlay }: { p: PaletteItem; overlay?: boolean }) {
  const isF = p.kind === 'formula';
  return (
    <div
      className="flex items-center gap-2.5 w-full text-left bg-white border border-line rounded-xl px-2.5 py-[7px] min-h-12 box-border"
      style={overlay ? { boxShadow: '0 24px 48px -18px rgba(11,18,32,.45)', borderColor: '#A9B3C6', cursor: 'grabbing' } : undefined}
    >
      <span
        className="w-[30px] h-[30px] rounded-lg font-bold flex items-center justify-center shrink-0"
        style={
          isF
            ? { background: '#F3EFFF', color: '#5B33E0', fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }
            : { background: '#EEF2FF', color: '#2F54EB', fontSize: 12 }
        }
      >
        {p.glyph}
      </span>
      <span className="flex flex-col gap-px min-w-0">
        <span className="text-[14px] font-semibold text-ink whitespace-pre">{p.label}</span>
        <span className="text-[12px] text-muted">{p.hint}</span>
      </span>
    </div>
  );
}

function DraggablePaletteItem({ p, onAdd }: { p: PaletteItem; onAdd: (p: PaletteItem) => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: 'pal:' + p.key, data: { type: 'palette', item: p } });
  return (
    <button
      ref={setNodeRef}
      type="button"
      className="pal block w-full p-0 bg-transparent border-0 rounded-xl text-left"
      style={{ opacity: isDragging ? 0.5 : 1 }}
      onClick={() => onAdd(p)}
      {...attributes}
      {...listeners}
    >
      <PaletteCard p={p} />
    </button>
  );
}

export function Palette({ onAdd }: { onAdd: (p: PaletteItem) => void }) {
  return (
    <aside
      aria-label="Bảng công cụ"
      className="flex-[1_1_240px] max-w-[264px] pt-5 pb-5 pr-4 pl-7 flex flex-col gap-[22px] box-border max-[900px]:max-w-none max-[900px]:flex-[1_1_100%] max-[900px]:px-4"
    >
      <div className="flex flex-col gap-2 max-[900px]:grid max-[900px]:grid-cols-2">
        <div className="text-[11px] font-extrabold tracking-[.12em] text-primary col-span-full">TRƯỜNG DỮ LIỆU</div>
        {PAL_DATA.map((p) => (
          <DraggablePaletteItem key={p.key} p={p} onAdd={onAdd} />
        ))}
      </div>
      <div className="flex flex-col gap-2 max-[900px]:grid max-[900px]:grid-cols-2">
        <div className="text-[11px] font-extrabold tracking-[.12em] text-violet-text col-span-full">TRƯỜNG CÔNG THỨC</div>
        {PAL_FORMULA.map((p) => (
          <DraggablePaletteItem key={p.key} p={p} onAdd={onAdd} />
        ))}
      </div>
    </aside>
  );
}
