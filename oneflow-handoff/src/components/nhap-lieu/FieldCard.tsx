import type { ButtonHTMLAttributes, CSSProperties } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'motion/react';
import { calc, showValue, type Field } from '@/lib/formula';
import { KINDS } from '@/data/template';
import { useFormStore } from '@/store/form';
import { TokenChips } from './TokenChips';
import { AnimatedResult } from './AnimatedResult';

interface CardProps {
  field: Field;
  fields: Field[];
  selected: boolean;
  testing: boolean;
  overlay?: boolean;
  dragHandleProps?: ButtonHTMLAttributes<HTMLButtonElement>;
  onSelect?: (field: Field) => void;
  onRequestDelete?: (field: Field) => void;
}

export function FieldCardBody({ field: f, fields, selected, testing, overlay, dragHandleProps, onSelect, onRequestDelete }: CardProps) {
  const select = useFormStore((s) => s.select);
  const widen = useFormStore((s) => s.widen);
  const remove = useFormStore((s) => s.remove);
  const setValue = useFormStore((s) => s.setValue);

  const isF = f.kind === 'formula';
  const v = isF ? calc(fields, f.id) : NaN;
  const border = selected ? (isF ? '#6E46F0' : '#2F54EB') : isF ? '#E6DDFF' : '#E3E7EE';
  const shadow = overlay
    ? '0 24px 48px -20px rgba(11,18,32,.45)'
    : selected
      ? isF
        ? '0 0 0 4px rgba(110,70,240,.14)'
        : '0 0 0 4px rgba(47,84,235,.14)'
      : 'none';

  return (
    <div
      className="group relative rounded-[14px] pt-2.5 px-3 pb-3 flex flex-col gap-2 min-w-0 box-border h-full"
      style={{ ['--card-bg' as string]: isF ? '#FAF8FF' : '#FFFFFF', background: 'var(--card-bg)', border: `1.5px solid ${border}`, boxShadow: shadow, transition: 'box-shadow .15s, border-color .15s' }}
    >
      <div className="flex items-center gap-1.5">
        {!testing && !overlay && (
          <button
            type="button"
            aria-label={`Kéo để sắp xếp trường ${f.label}`}
            title="Kéo để sắp xếp"
            className="shrink-0 border-0 bg-transparent rounded-md w-6 h-7 text-faint cursor-grab active:cursor-grabbing flex items-center justify-center hover:bg-hover"
            {...dragHandleProps}
          >
            <span aria-hidden="true" className="tracking-[-2px]">⠿</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            select(f.id);
            onSelect?.(f);
          }}
          className="flex-1 min-w-0 flex items-center gap-2 bg-transparent border-0 p-0 min-h-7 cursor-pointer text-left"
        >
          <span
            className="w-[22px] h-[22px] rounded-md text-[11px] font-bold flex items-center justify-center shrink-0"
            style={{ background: isF ? '#F3EFFF' : '#EEF2FF', color: isF ? '#5B33E0' : '#2F54EB' }}
          >
            {KINDS[f.kind]?.glyph ?? '?'}
          </span>
          <span title={f.label} className="text-[13px] leading-[1.3] font-semibold text-ink line-clamp-2 break-words">{f.label}</span>
        </button>
        <div
          className={'card-actions flex items-center gap-0.5 rounded-lg' + (selected || overlay ? ' is-on' : '')}
          style={{ background: 'var(--card-bg)' }}
        >
        <button
          type="button"
          aria-label="Đổi độ rộng"
          onClick={() => widen(f.id)}
          className="ghost border-0 bg-transparent rounded-md w-7 h-7 cursor-pointer text-muted flex items-center justify-center"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 6 21 12 15 18" />
            <polyline points="9 6 3 12 9 18" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Xoá trường"
          onClick={() => (onRequestDelete ? onRequestDelete(f) : remove(f.id))}
          className="ghost border-0 bg-transparent rounded-md w-7 h-7 cursor-pointer text-muted flex items-center justify-center"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        </button>
        </div>
      </div>

      {!isF && !testing && (
        <div className="bg-soft border border-line rounded-[9px] px-2.5 min-h-10 flex items-center text-[14px] text-body whitespace-nowrap overflow-hidden text-ellipsis">
          {showValue(f)}
        </div>
      )}
      {!isF && testing && (
        <input
          aria-label={f.label}
          value={f.value ?? ''}
          onChange={(e) => setValue(f.id, e.target.value)}
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          className="border-[1.5px] border-primary bg-white rounded-[9px] px-2.5 min-h-10 text-[15px] text-ink w-full box-border outline-primary"
        />
      )}
      {isF && (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-1 font-mono text-[12px] min-h-6">
            <TokenChips fields={fields} tokens={f.tokens ?? []} />
            {(!f.tokens || f.tokens.length === 0) && (
              <span className="text-muted font-sans">Bấm vào ô này rồi chọn trường ở cột phải →</span>
            )}
          </div>
          <AnimatedResult value={v} testing={testing} large={f.span >= 6} field={f} />
        </div>
      )}
    </div>
  );
}

export function SortableFieldCard(props: CardProps & { isNew: boolean; dragDisabled: boolean; dropTarget?: boolean }) {
  const { field, isNew, dragDisabled, dropTarget } = props;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
    disabled: dragDisabled,
    data: { type: 'field' },
  });
  const style: CSSProperties = {
    gridColumn: `span ${field.span} / span ${field.span}`,
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    minWidth: 0,
  };
  return (
    <div ref={setNodeRef} style={style} className="field-cell relative" data-span={field.span}>
      {dropTarget && (
        <div className="absolute z-10 -top-[7px] left-1 right-1 h-[3px] rounded-full bg-primary shadow-[0_0_0_3px_rgba(47,84,235,.12)]" aria-hidden="true">
          <span className="absolute left-1/2 -translate-x-1/2 -top-5 bg-primary text-white text-[9px] font-bold rounded px-1.5 py-0.5 whitespace-nowrap">Thả tại đây</span>
        </div>
      )}
      <motion.div
        className="h-full"
        initial={isNew ? { scale: 0.96, opacity: 0 } : false}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 420, damping: 26 }}
      >
        <FieldCardBody {...props} dragHandleProps={{ ...attributes, ...listeners }} />
      </motion.div>
    </div>
  );
}
