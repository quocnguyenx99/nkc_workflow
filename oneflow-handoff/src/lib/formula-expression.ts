import type { Field, Op, Token } from '@/lib/formula';

const OP_BY_INPUT: Record<string, Op> = {
  '+': '+',
  '-': '−',
  '−': '−',
  '*': '×',
  '×': '×',
  '/': '÷',
  '÷': '÷',
  '(': '(',
  ')': ')',
};

const INPUT_BY_OP: Record<Op, string> = {
  '+': '+',
  '−': '-',
  '×': '*',
  '÷': '/',
  '(': '(',
  ')': ')',
};

export type FormulaExpressionResult =
  | { ok: true; tokens: Token[] }
  | { ok: false; message: string };

export interface FormulaAutocompleteContext {
  query: string;
  start: number;
  end: number;
}

export function normalizeFormulaSearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLocaleLowerCase('vi')
    .trim();
}

function resolveField(reference: string, fields: Field[]): Field | string {
  const normalized = normalizeFormulaSearch(reference);
  const matches = fields.filter((field) => normalizeFormulaSearch(field.label) === normalized);
  if (matches.length === 1) return matches[0];
  if (matches.length > 1) return `Có nhiều trường tên “${reference}”. Hãy đổi tên trường để tham chiếu rõ ràng.`;
  return `Không tìm thấy trường “${reference}”.`;
}

function validateSyntax(tokens: Token[]): string | null {
  if (!tokens.length) return 'Nhập trường, số hoặc biểu thức để bắt đầu.';
  let expectOperand = true;
  let depth = 0;

  for (const token of tokens) {
    if ('f' in token || 'n' in token) {
      if (!expectOperand) return 'Thiếu phép tính giữa hai giá trị.';
      expectOperand = false;
      continue;
    }
    if (!('o' in token)) return 'Biểu thức chứa thành phần chưa được hỗ trợ.';
    if (token.o === '(') {
      if (!expectOperand) return 'Thiếu phép tính trước dấu ngoặc mở.';
      depth += 1;
      continue;
    }
    if (token.o === ')') {
      if (expectOperand || depth === 0) return 'Kiểm tra lại cặp dấu ngoặc trong công thức.';
      depth -= 1;
      expectOperand = false;
      continue;
    }
    if (token.o === '−' && expectOperand) continue;
    if (expectOperand) return 'Cần nhập trường, số hoặc dấu ngoặc mở trước phép tính.';
    expectOperand = true;
  }

  if (depth !== 0) return 'Đóng ngoặc còn thiếu hoặc xóa ngoặc dư.';
  if (expectOperand) return 'Cần nhập trường hoặc số sau phép tính cuối.';
  return null;
}

export function parseFormulaExpression(source: string, fields: Field[]): FormulaExpressionResult {
  const tokens: Token[] = [];
  let index = 0;
  while (/\s/.test(source[index] ?? '')) index += 1;
  if (source[index] === '=') index += 1;

  while (index < source.length) {
    const char = source[index];
    if (/\s/.test(char)) {
      index += 1;
      continue;
    }

    const operator = OP_BY_INPUT[char];
    if (operator) {
      tokens.push({ o: operator });
      index += 1;
      continue;
    }

    if (char === '[') {
      const end = source.indexOf(']', index + 1);
      if (end < 0) return { ok: false, message: 'Đóng dấu ] để hoàn tất tên trường.' };
      const reference = source.slice(index + 1, end).trim();
      if (!reference) return { ok: false, message: 'Tên trường trong dấu [ ] không được để trống.' };
      const field = resolveField(reference, fields);
      if (typeof field === 'string') return { ok: false, message: field };
      tokens.push({ f: field.id });
      index = end + 1;
      continue;
    }

    const number = source.slice(index).match(/^(?:\d+(?:[.,]\d+)?|[.,]\d+)/)?.[0];
    if (number) {
      const value = Number(number.replace(',', '.'));
      if (!Number.isFinite(value)) return { ok: false, message: `Số “${number}” không hợp lệ.` };
      tokens.push({ n: value });
      index += number.length;
      continue;
    }

    const end = source.slice(index).search(/[=+\-\u2212*\u00d7/\u00f7()\[\]]/);
    const stop = end < 0 ? source.length : index + end;
    const reference = source.slice(index, stop).trim();
    if (!reference) return { ok: false, message: `Ký tự “${char}” chưa được hỗ trợ.` };
    const field = resolveField(reference, fields);
    if (typeof field === 'string') return { ok: false, message: field };
    tokens.push({ f: field.id });
    index = stop;
  }

  const syntaxError = validateSyntax(tokens);
  return syntaxError ? { ok: false, message: syntaxError } : { ok: true, tokens };
}

export function formatFormulaExpression(tokens: Token[], fields: Field[]) {
  return tokens.map((token) => {
    if ('f' in token) {
      const field = fields.find((item) => item.id === token.f);
      return `[${field?.label ?? `Trường đã xóa: ${token.f}`}]`;
    }
    if ('n' in token) return String(token.n);
    if ('o' in token) return INPUT_BY_OP[token.o];
    return '';
  }).filter(Boolean).join(' ');
}

export function getFormulaAutocompleteContext(value: string, cursor: number): FormulaAutocompleteContext | null {
  const beforeCursor = value.slice(0, cursor);
  let start = beforeCursor.length;
  while (start > 0 && !/[=+\-\u2212*\u00d7/\u00f7()]/.test(beforeCursor[start - 1])) start -= 1;
  while (/\s/.test(value[start] ?? '')) start += 1;

  const fragment = value.slice(start, cursor);
  if (fragment.startsWith('[')) {
    if (fragment.includes(']')) return null;
    const query = fragment.slice(1).trim();
    return { query, start, end: cursor };
  }
  if (fragment.includes(']')) return null;
  const query = fragment.trim();
  if (!query || /^[\d.,]+$/.test(query)) return null;
  return { query, start, end: cursor };
}

