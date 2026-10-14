// Bộ tính công thức — port từ calc/evalItems trong design/NhapLieuV2.dc.html.
// Không dùng eval/new Function: parser recursive-descent trên danh sách token.

export type FieldKind = 'text' | 'number' | 'money' | 'percent' | 'date' | 'select' | 'person' | 'formula';
export type Op = '+' | '−' | '×' | '÷' | '(' | ')';
export type Token = { f: string } | { o: Op } | { n: number } | { s: 1 };
export type Span = 2 | 3 | 4 | 6 | 12;

export interface Field {
  id: string;
  kind: FieldKind;
  label: string;
  span: Span;
  value?: string;
  tokens?: Token[];
}

type Item = number | '+' | '-' | '*' | '/' | '(' | ')';

const OPS: Record<Op, Item> = { '×': '*', '÷': '/', '−': '-', '+': '+', '(': '(', ')': ')' };

/** Đọc giá trị số của trường nhập: "1.250.000" → 1250000, "5,5" → 5.5. */
export function parseNumber(value: string | undefined): number {
  const raw = String(value ?? '').replace(/\./g, '').replace(/,/g, '.').trim();
  if (raw === '') return NaN;
  return Number(raw);
}

/** Tính giá trị một trường, đệ quy theo tokens; `seen` chặn vòng lặp (→ NaN). */
export function calc(fields: Field[], id: string, seen: string[] = []): number {
  const f = fields.find((x) => x.id === id);
  if (!f) return NaN;
  if (f.kind !== 'formula') return parseNumber(f.value);
  if (seen.includes(id)) return NaN;
  const next = [...seen, id];
  if (!f.tokens || f.tokens.length === 0) return NaN;
  const items: Item[] = [];
  for (const t of f.tokens) {
    if ('f' in t) {
      const v = calc(fields, t.f, next);
      if (!Number.isFinite(v)) return NaN;
      items.push(v);
    } else if ('n' in t) items.push(Number(t.n));
    else if ('o' in t) items.push(OPS[t.o]);
    else return NaN;
  }
  return evalItems(items);
}

/** Parser recursive-descent: + − × ÷, ngoặc, số âm đơn ngôi. */
export function evalItems(items: Item[]): number {
  let i = 0;
  const peek = () => items[i];
  const factor = (): number => {
    const t = items[i++];
    if (typeof t === 'number') return t;
    if (t === '-') return -factor();
    if (t === '(') {
      const v = expr();
      if (items[i++] !== ')') return NaN;
      return v;
    }
    return NaN;
  };
  const term = (): number => {
    let v = factor();
    while (peek() === '*' || peek() === '/') {
      const op = items[i++];
      const r = factor();
      v = op === '*' ? v * r : v / r;
    }
    return v;
  };
  const expr = (): number => {
    let v = term();
    while (peek() === '+' || peek() === '-') {
      const op = items[i++];
      const r = term();
      v = op === '+' ? v + r : v - r;
    }
    return v;
  };
  const v = expr();
  return i === items.length ? v : NaN;
}

export function fmtMoney(v: number): string {
  if (!Number.isFinite(v)) return 'Chưa đủ dữ liệu';
  return Math.round(v).toLocaleString('vi-VN') + ' ₫';
}

export function fmtNumber(v: number): string {
  return Math.round(v).toLocaleString('vi-VN');
}

export function showValue(f: Field): string {
  const v = f.value == null ? '' : String(f.value);
  if (v === '') return '—';
  if (f.kind === 'money') {
    const n = Number(v.replace(/\./g, ''));
    return Number.isFinite(n) ? n.toLocaleString('vi-VN') + ' ₫' : v;
  }
  if (f.kind === 'percent') return v + ' %';
  return v;
}
