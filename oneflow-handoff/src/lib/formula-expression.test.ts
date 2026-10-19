import { describe, expect, it } from 'vitest';
import { formatFormulaExpression, getFormulaAutocompleteContext, normalizeFormulaSearch, parseFormulaExpression } from './formula-expression';
import { salesTemplate } from '@/data/template';

describe('formula expression bridge', () => {
  const fields = salesTemplate().filter((field) => ['number', 'money', 'percent', 'formula'].includes(field.kind));

  it('round-trips field references by ID and supported operators', () => {
    const parsed = parseFormulaExpression('= [Số lượng] * [Đơn giá] + 7,5', fields);
    expect(parsed).toEqual({ ok: true, tokens: [{ f: 'c5' }, { o: '×' }, { f: 'c6' }, { o: '+' }, { n: 7.5 }] });
    if (parsed.ok) expect(formatFormulaExpression(parsed.tokens, fields)).toBe('[Số lượng] * [Đơn giá] + 7.5');
  });

  it('accepts pasted field names without brackets or accents', () => {
    expect(parseFormulaExpression('so luong * don gia', fields)).toEqual({
      ok: true,
      tokens: [{ f: 'c5' }, { o: '×' }, { f: 'c6' }],
    });
  });

  it('keeps incomplete or unsupported input out of the token model', () => {
    expect(parseFormulaExpression('[Số lượng] +', fields)).toMatchObject({ ok: false });
    expect(parseFormulaExpression('[Số lượng] ^ 2', fields)).toMatchObject({ ok: false });
    expect(parseFormulaExpression('[Số lượng] = 2', fields)).toMatchObject({ ok: false });
    expect(parseFormulaExpression('[Không tồn tại] + 2', fields)).toMatchObject({ ok: false });
  });

  it('finds accent-insensitive autocomplete fragments', () => {
    expect(normalizeFormulaSearch('Đơn Giá')).toBe('don gia');
    expect(getFormulaAutocompleteContext('[', 1)).toEqual({ query: '', start: 0, end: 1 });
    expect(getFormulaAutocompleteContext('[Số lượng] * don g', 20)).toEqual({ query: 'don g', start: 13, end: 20 });
  });
});
