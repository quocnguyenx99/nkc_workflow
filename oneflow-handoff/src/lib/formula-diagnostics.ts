import { calc, parseNumber, type Field, type Token } from '@/lib/formula';

export type FormulaDiagnosticCode =
  | 'empty'
  | 'slot_missing'
  | 'dangling_operator'
  | 'missing_operator'
  | 'unbalanced_parentheses'
  | 'missing_reference'
  | 'cycle'
  | 'divide_by_zero'
  | 'input_missing'
  | 'invalid_result'
  | 'valid';

export interface FormulaDiagnostic {
  code: FormulaDiagnosticCode;
  message: string;
  fieldId?: string;
}

const ok = (): FormulaDiagnostic => ({ code: 'valid', message: 'Công thức hợp lệ.' });

function syntaxDiagnostic(tokens: Token[]): FormulaDiagnostic | null {
  if (!tokens.length) return { code: 'empty', message: 'Chọn công thức mẫu hoặc thêm trường đầu tiên.' };
  if (tokens.some((token) => 's' in token)) return { code: 'slot_missing', message: 'Chọn trường cho ô đang để trống.' };

  let expectOperand = true;
  let depth = 0;
  for (const token of tokens) {
    if ('f' in token || 'n' in token) {
      if (!expectOperand) return { code: 'missing_operator', message: 'Thêm phép tính giữa hai giá trị.' };
      expectOperand = false;
      continue;
    }
    if (!('o' in token)) continue;
    if (token.o === '(') {
      if (!expectOperand) return { code: 'missing_operator', message: 'Thêm phép tính trước dấu ngoặc mở.' };
      depth += 1;
      continue;
    }
    if (token.o === ')') {
      if (expectOperand || depth === 0) return { code: 'unbalanced_parentheses', message: 'Kiểm tra lại cặp dấu ngoặc trong công thức.' };
      depth -= 1;
      expectOperand = false;
      continue;
    }
    if (token.o === '−' && expectOperand) continue;
    if (expectOperand) return { code: 'dangling_operator', message: 'Chọn một trường hoặc số trước phép tính này.' };
    expectOperand = true;
  }
  if (depth !== 0) return { code: 'unbalanced_parentheses', message: 'Đóng ngoặc còn thiếu hoặc xóa ngoặc dư.' };
  if (expectOperand) return { code: 'dangling_operator', message: 'Chọn một trường hoặc số sau phép tính cuối.' };
  return null;
}

function findMissingReference(fields: Field[], tokens: Token[]) {
  return tokens.find((token): token is { f: string } => 'f' in token && !fields.some((field) => field.id === token.f));
}

function hasCycle(fields: Field[], currentId: string, path = new Set<string>()): boolean {
  if (path.has(currentId)) return true;
  const field = fields.find((item) => item.id === currentId);
  if (!field || field.kind !== 'formula') return false;
  const nextPath = new Set(path).add(currentId);
  return (field.tokens ?? []).some((token) => 'f' in token && hasCycle(fields, token.f, nextPath));
}

function firstMissingInput(fields: Field[], fieldId: string, seen = new Set<string>()): Field | undefined {
  if (seen.has(fieldId)) return undefined;
  const field = fields.find((item) => item.id === fieldId);
  if (!field) return undefined;
  if (field.kind !== 'formula') return Number.isFinite(parseNumber(field.value)) ? undefined : field;
  const nextSeen = new Set(seen).add(fieldId);
  for (const token of field.tokens ?? []) {
    if ('f' in token) {
      const missing = firstMissingInput(fields, token.f, nextSeen);
      if (missing) return missing;
    }
  }
  return undefined;
}

type Item = number | '+' | '-' | '*' | '/' | '(' | ')';

function evaluatesWithDivisionByZero(fields: Field[], tokens: Token[]) {
  const items: Item[] = tokens.map((token) => {
    if ('f' in token) return calc(fields, token.f);
    if ('n' in token) return token.n;
    if ('o' in token) return ({ '+': '+', '−': '-', '×': '*', '÷': '/', '(': '(', ')': ')' } as const)[token.o];
    return NaN;
  });
  let index = 0;
  let divisionByZero = false;
  const peek = () => items[index];
  const factor = (): number => {
    const token = items[index++];
    if (typeof token === 'number') return token;
    if (token === '-') return -factor();
    if (token === '(') {
      const value = expression();
      index += 1;
      return value;
    }
    return NaN;
  };
  const term = (): number => {
    let value = factor();
    while (peek() === '*' || peek() === '/') {
      const operator = items[index++];
      const right = factor();
      if (operator === '/' && right === 0) divisionByZero = true;
      value = operator === '*' ? value * right : value / right;
    }
    return value;
  };
  const expression = (): number => {
    let value = term();
    while (peek() === '+' || peek() === '-') {
      const operator = items[index++];
      const right = term();
      value = operator === '+' ? value + right : value - right;
    }
    return value;
  };
  expression();
  return divisionByZero;
}

export function diagnoseFormula(fields: Field[], fieldId: string): FormulaDiagnostic {
  const field = fields.find((item) => item.id === fieldId);
  if (!field || field.kind !== 'formula') return { code: 'missing_reference', message: 'Không tìm thấy trường công thức.', fieldId };
  const tokens = field.tokens ?? [];
  const syntax = syntaxDiagnostic(tokens);
  if (syntax) return syntax;

  const missingReference = findMissingReference(fields, tokens);
  if (missingReference) return { code: 'missing_reference', message: 'Trường tham chiếu đã bị xóa. Hãy chọn trường khác.', fieldId: missingReference.f };
  if (hasCycle(fields, fieldId)) return { code: 'cycle', message: 'Công thức đang tham chiếu vòng. Hãy bỏ tham chiếu được đánh dấu.', fieldId };

  const missingInput = firstMissingInput(fields, fieldId);
  if (missingInput) return { code: 'input_missing', message: `Nhập ${missingInput.label} để xem kết quả.`, fieldId: missingInput.id };
  if (evaluatesWithDivisionByZero(fields, tokens)) return { code: 'divide_by_zero', message: 'Không thể chia cho 0. Hãy kiểm tra giá trị ở mẫu số.', fieldId };
  if (!Number.isFinite(calc(fields, fieldId))) return { code: 'invalid_result', message: 'Kết quả chưa hợp lệ. Hãy kiểm tra lại công thức.', fieldId };
  return ok();
}
