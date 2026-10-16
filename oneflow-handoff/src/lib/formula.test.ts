import { describe, expect, it } from 'vitest';
import { calc, evalItems, fmtMoney, type Field } from './formula';
import { salesTemplate } from '@/data/template';

describe('calc — mẫu Phiếu bán hàng', () => {
  const fields = salesTemplate();

  it('Thành tiền = 12 × 1.250.000', () => {
    expect(calc(fields, 'f1')).toBe(15_000_000);
  });

  it('Tiền chiết khấu và VAT', () => {
    expect(calc(fields, 'f2')).toBe(750_000);
    expect(calc(fields, 'f3')).toBe(1_425_000);
  });

  it('Tổng thanh toán ra 15.675.000 ₫', () => {
    const total = calc(fields, 'f4');
    expect(total).toBe(15_675_000);
    expect(fmtMoney(total).replace(/\s/g, ' ')).toBe('15.675.000 ₫');
  });

  it('đọc số có dấu chấm ngăn cách hàng nghìn', () => {
    const f = fields.map((x) => (x.id === 'c6' ? { ...x, value: '1.250.000' } : x));
    expect(calc(f, 'f4')).toBe(15_675_000);
  });

  it('trường trống → NaN → "Chưa đủ dữ liệu"', () => {
    const f = fields.map((x) => (x.id === 'c5' ? { ...x, value: '' } : x));
    expect(calc(f, 'f4')).toBeNaN();
    expect(fmtMoney(calc(f, 'f4'))).toBe('Chưa đủ dữ liệu');
  });
});

describe('calc — vòng lặp', () => {
  it('A tham chiếu B, B tham chiếu A → NaN', () => {
    const fields: Field[] = [
      { id: 'a', kind: 'formula', label: 'A', span: 4, tokens: [{ f: 'b' }, { o: '+' }, { n: 1 }] },
      { id: 'b', kind: 'formula', label: 'B', span: 4, tokens: [{ f: 'a' }, { o: '×' }, { n: 2 }] },
    ];
    expect(calc(fields, 'a')).toBeNaN();
    expect(calc(fields, 'b')).toBeNaN();
  });

  it('tự tham chiếu → NaN', () => {
    const fields: Field[] = [{ id: 'a', kind: 'formula', label: 'A', span: 4, tokens: [{ f: 'a' }] }];
    expect(calc(fields, 'a')).toBeNaN();
  });

  it('ô trống chờ chọn trường → NaN', () => {
    const fields: Field[] = [{ id: 'a', kind: 'formula', label: 'A', span: 4, tokens: [{ s: 1 }, { o: '×' }, { n: 2 }] }];
    expect(calc(fields, 'a')).toBeNaN();
  });
});

describe('evalItems — ngoặc và số âm', () => {
  it('ưu tiên phép nhân/chia', () => {
    expect(evalItems([2, '+', 3, '*', 4])).toBe(14);
  });
  it('ngoặc', () => {
    expect(evalItems(['(', 2, '+', 3, ')', '*', 4])).toBe(20);
    expect(evalItems(['(', '(', 1, '+', 1, ')', '*', 3, ')', '/', 2])).toBe(3);
  });
  it('số âm đơn ngôi', () => {
    expect(evalItems(['-', 5, '+', 2])).toBe(-3);
    expect(evalItems([4, '*', '-', 2])).toBe(-8);
    expect(evalItems(['-', '(', 2, '+', 3, ')'])).toBe(-5);
  });
  it('biểu thức lỗi → NaN', () => {
    expect(evalItems(['(', 2, '+', 3])).toBeNaN();
    expect(evalItems([2, '+'])).toBeNaN();
    expect(evalItems([2, 3])).toBeNaN();
    expect(evalItems([])).toBeNaN();
  });
});
