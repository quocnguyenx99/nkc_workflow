import { describe, expect, it } from 'vitest';
import type { Field } from '@/lib/formula';
import { diagnoseFormula } from '@/lib/formula-diagnostics';
import { salesTemplate } from '@/data/template';

const withFormula = (tokens: Field['tokens'], extra: Field[] = []): Field[] => [
  { id: 'a', kind: 'number', label: 'A', span: 3, value: '10' },
  { id: 'b', kind: 'number', label: 'B', span: 3, value: '2' },
  ...extra,
  { id: 'fx', kind: 'formula', label: 'Kết quả', span: 4, tokens },
];

describe('diagnoseFormula', () => {
  it('xác nhận công thức mẫu hợp lệ mà không đổi kết quả', () => {
    const fields = salesTemplate();
    expect(diagnoseFormula(fields, 'f4').code).toBe('valid');
  });

  it('phân biệt công thức trống và slot chưa chọn', () => {
    expect(diagnoseFormula(withFormula([]), 'fx').code).toBe('empty');
    expect(diagnoseFormula(withFormula([{ s: 1 }, { o: '×' }, { f: 'b' }]), 'fx').code).toBe('slot_missing');
  });

  it('phát hiện toán tử cuối và thiếu toán tử', () => {
    expect(diagnoseFormula(withFormula([{ f: 'a' }, { o: '+' }]), 'fx').code).toBe('dangling_operator');
    expect(diagnoseFormula(withFormula([{ f: 'a' }, { f: 'b' }]), 'fx').code).toBe('missing_operator');
  });

  it('phát hiện ngoặc lệch và tham chiếu đã xóa', () => {
    expect(diagnoseFormula(withFormula([{ o: '(' }, { f: 'a' }, { o: '+' }, { f: 'b' }]), 'fx').code).toBe('unbalanced_parentheses');
    expect(diagnoseFormula(withFormula([{ f: 'gone' }, { o: '+' }, { f: 'b' }]), 'fx').code).toBe('missing_reference');
  });

  it('phát hiện vòng tham chiếu', () => {
    const fields: Field[] = [
      { id: 'fa', kind: 'formula', label: 'A', span: 4, tokens: [{ f: 'fb' }] },
      { id: 'fb', kind: 'formula', label: 'B', span: 4, tokens: [{ f: 'fa' }] },
    ];
    expect(diagnoseFormula(fields, 'fa').code).toBe('cycle');
  });

  it('phát hiện input trống và chia cho 0', () => {
    const missing = withFormula([{ f: 'a' }, { o: '+' }, { f: 'b' }]).map((field) => (field.id === 'a' ? { ...field, value: '' } : field));
    expect(diagnoseFormula(missing, 'fx').code).toBe('input_missing');
    const zero = withFormula([{ f: 'a' }, { o: '÷' }, { f: 'b' }]).map((field) => (field.id === 'b' ? { ...field, value: '0' } : field));
    expect(diagnoseFormula(zero, 'fx').code).toBe('divide_by_zero');
  });
});
