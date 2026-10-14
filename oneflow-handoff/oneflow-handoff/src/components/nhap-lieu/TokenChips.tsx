import type { Field, Token } from '@/lib/formula';

const D = { bg: '#EEF2FF', fg: '#2F54EB', bc: '#C7D2FF' };
const F = { bg: '#F3EFFF', fg: '#5B33E0', bc: '#DCD1FF' };

export function tokenStyle(fields: Field[], t: Token) {
  if ('f' in t) {
    const ref = fields.find((x) => x.id === t.f);
    const c = ref?.kind === 'formula' ? F : D;
    return { text: ref ? ref.label : '(đã xoá)', bg: c.bg, fg: c.fg, bc: c.bc, borderStyle: 'solid' };
  }
  if ('s' in t) return { text: 'chọn trường', bg: '#FFFFFF', fg: '#5B6478', bc: '#A9B3C6', borderStyle: 'dashed' };
  if ('n' in t) return { text: String(t.n), bg: '#F2F4F8', fg: '#0B1220', bc: '#E7EAF0', borderStyle: 'solid' };
  return { text: t.o, bg: 'transparent', fg: '#0B1220', bc: 'transparent', borderStyle: 'solid' };
}

export function TokenChips({ fields, tokens, size = 'card' }: { fields: Field[]; tokens: Token[]; size?: 'card' | 'inspector' }) {
  return (
    <>
      {tokens.map((t, i) => {
        const s = tokenStyle(fields, t);
        return (
          <span
            key={i}
            className="rounded-md whitespace-nowrap"
            style={{
              background: s.bg,
              color: s.fg,
              border: `1px ${s.borderStyle} ${s.bc}`,
              padding: size === 'card' ? '2px 7px' : '3px 7px',
            }}
          >
            {s.text}
          </span>
        );
      })}
    </>
  );
}
