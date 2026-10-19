import { useMemo, useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { PAL_DATA, type PaletteItem } from '@/data/template';
import { PaletteCard } from './Palette';

function DataFieldItem({ item, onAdd }: { item: PaletteItem; onAdd: (item: PaletteItem) => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `data:${item.key}`,
    data: { type: 'data-template', item },
  });
  return (
    <div ref={setNodeRef} className="pal relative rounded-xl" style={{ opacity: isDragging ? 0.45 : 1 }}>
      <button type="button" onClick={() => onAdd(item)} className="block w-full border-0 bg-transparent p-0 text-left cursor-pointer">
        <PaletteCard p={item} />
      </button>
      <button
        type="button"
        aria-label={`Kéo ${item.label} vào biểu mẫu`}
        title="Kéo vào Form"
        className="absolute right-1.5 top-1/2 -translate-y-1/2 border-0 bg-transparent rounded-md w-7 h-8 text-faint cursor-grab flex items-center justify-center hover:bg-hover"
        style={{ touchAction: 'none', userSelect: 'none' }}
        {...attributes}
        {...listeners}
      >
        <span aria-hidden="true" className="tracking-[-2px]">⠿</span>
      </button>
    </div>
  );
}

export function DataFieldColumn({ onAdd, onClose }: { onAdd: (item: PaletteItem) => void; onClose?: () => void }) {
  const [query, setQuery] = useState('');
  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('vi');
    return normalized ? PAL_DATA.filter((item) => `${item.label} ${item.hint}`.toLocaleLowerCase('vi').includes(normalized)) : PAL_DATA;
  }, [query]);

  return (
    <aside aria-label="Trường dữ liệu" className="system-scrollbar builder-palette v6-column v6-data-column" data-dnd-scroll="true">
      <header className="v6-column-header">
        <div><div className="v6-step">1</div><h2>Trường dữ liệu</h2><p>Kéo hoặc bấm để thêm trường nhập liệu.</p></div>
        {onClose && <button type="button" onClick={onClose} aria-label="Đóng thư viện trường" className="v6-icon-button">×</button>}
      </header>
      <div className="v6-column-body">
        <label className="v6-search"><span className="sr-only">Tìm trường dữ liệu</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm loại trường…" /></label>
        <div className="v6-section-label">7 LOẠI ĐANG HỖ TRỢ</div>
        <div className="flex flex-col gap-2">
          {results.map((item) => <DataFieldItem key={item.key} item={item} onAdd={onAdd} />)}
          {!results.length && <div className="v6-empty-state">Không tìm thấy loại trường phù hợp.</div>}
        </div>
      </div>
    </aside>
  );
}
