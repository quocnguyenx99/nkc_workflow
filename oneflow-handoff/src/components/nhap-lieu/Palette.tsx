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
      <span className="flex flex-col gap-px min-w-0 pr-7">
        <span className="text-[14px] font-semibold text-ink whitespace-normal">{p.label}</span>
        <span className="text-[12px] text-muted">{p.hint}</span>
      </span>
    </div>
  );
}

function DraggablePaletteItem({ p, onAdd }: { p: PaletteItem; onAdd: (p: PaletteItem) => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: 'pal:' + p.key, data: { type: 'palette', item: p } });
  return (
    <div
      ref={setNodeRef}
      className="pal relative flex items-stretch w-full rounded-xl"
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <button type="button" onClick={() => onAdd(p)} className="block w-full p-0 bg-transparent border-0 rounded-xl text-left cursor-pointer">
        <PaletteCard p={p} />
      </button>
      <button
        type="button"
        aria-label={`Kéo ${p.label} vào biểu mẫu`}
        title="Kéo vào biểu mẫu"
        className="absolute right-1.5 top-1/2 -translate-y-1/2 border-0 bg-transparent rounded-md w-7 h-8 text-faint cursor-grab active:cursor-grabbing flex items-center justify-center hover:bg-hover"
        {...attributes}
        {...listeners}
      >
        <span aria-hidden="true" className="tracking-[-2px]">⠿</span>
      </button>
    </div>
  );
}

export function Palette({ onAdd }: { onAdd: (p: PaletteItem) => void }) {
  return (
    <aside
      aria-label="Bảng công cụ"
      className="system-scrollbar builder-palette pt-5 pb-5 px-4 flex flex-col gap-[22px] box-border"
      data-dnd-scroll="true"
    >
      <div className="flex flex-col gap-2 max-[900px]:grid max-[900px]:grid-cols-2 max-[520px]:grid-cols-1">
        <div className="text-[11px] font-extrabold tracking-[.12em] text-primary col-span-full">TRƯỜNG DỮ LIỆU</div>
        {PAL_DATA.map((p) => (
          <DraggablePaletteItem key={p.key} p={p} onAdd={onAdd} />
        ))}
      </div>
      <div className="flex flex-col gap-2 max-[900px]:grid max-[900px]:grid-cols-2 max-[520px]:grid-cols-1">
        <div className="text-[11px] font-extrabold tracking-[.12em] text-violet-text col-span-full">TRƯỜNG CÔNG THỨC</div>
        {PAL_FORMULA.map((p) => (
          <DraggablePaletteItem key={p.key} p={p} onAdd={onAdd} />
        ))}
      </div>
    </aside>
  );
}
