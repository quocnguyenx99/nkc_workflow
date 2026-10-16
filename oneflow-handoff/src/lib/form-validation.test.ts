import { describe, expect, it } from 'vitest';
import { calc, type Field } from '@/lib/formula';
import { findSemanticField, migrateLegacyFieldRoles } from '@/lib/field-semantics';
import { validateFormForSave } from '@/lib/form-validation';
import { salesTemplate } from '@/data/template';

describe('validateFormForSave', () => {
  it('chấp nhận mẫu hiện tại và giữ nguyên tổng', () => {
    const fields = salesTemplate();
    expect(validateFormForSave(fields)).toEqual([]);
    expect(calc(fields, 'f4')).toBe(15_675_000);
  });

  it('không lấy formula mới thêm sau f4 làm tổng', () => {
    const fields: Field[] = [
      ...salesTemplate(),
      { id: 'extra', kind: 'formula', label: 'Chỉ số khác', span: 4, tokens: [{ n: 1 }, { o: '+' }, { n: 1 }] },
    ];
    expect(findSemanticField(fields, 'total')?.id).toBe('f4');
    expect(validateFormForSave(fields)).toEqual([]);
  });

  it('chặn công thức tham chiếu field đã xóa', () => {
    const fields = salesTemplate().filter((field) => field.id !== 'c5');
    expect(validateFormForSave(fields).some((issue) => issue.code === 'formula_missing_reference')).toBe(true);
  });

  it('gắn role cho legacy template mà không đổi dữ liệu', () => {
    const legacy = salesTemplate().map(({ role: _role, ...field }) => field) as Field[];
    const migrated = migrateLegacyFieldRoles(legacy);
    expect(findSemanticField(migrated, 'quantity')?.id).toBe('c5');
    expect(findSemanticField(migrated, 'total')?.id).toBe('f4');
    expect(calc(migrated, 'f4')).toBe(15_675_000);
  });

  it('chặn ngày không tồn tại và thông tin bắt buộc để trống', () => {
    const fields = salesTemplate().map((field) => field.id === 'c3' ? { ...field, value: '31/02/2026' } : field.id === 'c1' ? { ...field, value: '' } : field);
    const issues = validateFormForSave(fields);
    expect(issues.some((issue) => issue.code === 'invalid_date' && issue.fieldId === 'c3')).toBe(true);
    expect(issues.some((issue) => issue.code === 'required' && issue.fieldId === 'c1')).toBe(true);
  });

  it('chặn số lượng âm, số lượng lẻ và chiết khấu vượt 100%', () => {
    const negative = salesTemplate().map((field) => field.id === 'c5' ? { ...field, value: '-2' } : field.id === 'c7' ? { ...field, value: '101' } : field);
    const negativeIssues = validateFormForSave(negative);
    expect(negativeIssues.some((issue) => issue.fieldId === 'c5')).toBe(true);
    expect(negativeIssues.some((issue) => issue.fieldId === 'c7')).toBe(true);

    const decimal = salesTemplate().map((field) => field.id === 'c5' ? { ...field, value: '1,5' } : field);
    expect(validateFormForSave(decimal).some((issue) => issue.code === 'not_integer' && issue.fieldId === 'c5')).toBe(true);
  });
});
