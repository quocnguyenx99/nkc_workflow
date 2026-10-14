import type { Field, FieldKind, Token } from '@/lib/formula';

/** Mẫu "Phiếu bán hàng" nạp sẵn — tổng thanh toán 15.675.000 ₫. */
export function salesTemplate(): Field[] {
  return [
    { id: 'c1', kind: 'text', label: 'Khách hàng', span: 6, value: 'Công ty TNHH Minh Phát' },
    { id: 'c2', kind: 'person', label: 'Nhân viên bán', span: 3, value: 'Trần Thu Hà' },
    { id: 'c3', kind: 'date', label: 'Ngày bán', span: 3, value: '14/10/2026' },
    { id: 'c4', kind: 'select', label: 'Sản phẩm', span: 6, value: 'Gói phần mềm Pro' },
    { id: 'c5', kind: 'number', label: 'Số lượng', span: 2, value: '12' },
    { id: 'c6', kind: 'money', label: 'Đơn giá', span: 2, value: '1250000' },
    { id: 'c7', kind: 'percent', label: 'Chiết khấu', span: 2, value: '5' },
    { id: 'f1', kind: 'formula', label: 'Thành tiền', span: 4, tokens: [{ f: 'c5' }, { o: '×' }, { f: 'c6' }] },
    { id: 'f2', kind: 'formula', label: 'Tiền chiết khấu', span: 4, tokens: [{ f: 'f1' }, { o: '×' }, { f: 'c7' }, { o: '÷' }, { n: 100 }] },
    {
      id: 'f3', kind: 'formula', label: 'Thuế VAT 10%', span: 4,
      tokens: [{ o: '(' }, { f: 'f1' }, { o: '−' }, { f: 'f2' }, { o: ')' }, { o: '×' }, { n: 10 }, { o: '÷' }, { n: 100 }],
    },
    { id: 'f4', kind: 'formula', label: 'Tổng thanh toán', span: 12, tokens: [{ f: 'f1' }, { o: '−' }, { f: 'f2' }, { o: '+' }, { f: 'f3' }] },
  ];
}

export const KINDS: Record<FieldKind, { name: string; glyph: string }> = {
  text: { name: 'Văn bản', glyph: 'Aa' },
  number: { name: 'Số', glyph: '123' },
  money: { name: 'Tiền tệ', glyph: '₫' },
  percent: { name: 'Phần trăm', glyph: '%' },
  date: { name: 'Ngày tháng', glyph: '31' },
  select: { name: 'Danh sách chọn', glyph: '≡' },
  person: { name: 'Nhân sự', glyph: '@' },
  formula: { name: 'Công thức', glyph: 'ƒx' },
};

export type PresetKey = 'mul' | 'sum' | 'sub' | 'pct' | 'vat' | 'free';

export function presetTokens(key: PresetKey): Token[] {
  const S = (): Token => ({ s: 1 });
  const map: Record<PresetKey, () => Token[]> = {
    mul: () => [S(), { o: '×' }, S()],
    sum: () => [S(), { o: '+' }, S()],
    sub: () => [S(), { o: '−' }, S()],
    pct: () => [S(), { o: '×' }, S(), { o: '÷' }, { n: 100 }],
    vat: () => [S(), { o: '×' }, { n: 10 }, { o: '÷' }, { n: 100 }],
    free: () => [],
  };
  return map[key]();
}

export interface PaletteItem {
  key: string;
  kind: FieldKind;
  label: string;
  hint: string;
  glyph: string;
  preset?: PresetKey;
  name?: string;
}

export const PAL_DATA: PaletteItem[] = [
  { key: 'd-text', kind: 'text', label: 'Văn bản', hint: 'Tên khách hàng, ghi chú', glyph: 'Aa' },
  { key: 'd-number', kind: 'number', label: 'Số', hint: 'Số lượng, số giờ công', glyph: '123' },
  { key: 'd-money', kind: 'money', label: 'Tiền tệ', hint: 'Đơn giá, chi phí', glyph: '₫' },
  { key: 'd-percent', kind: 'percent', label: 'Phần trăm', hint: 'Chiết khấu, tỷ lệ', glyph: '%' },
  { key: 'd-date', kind: 'date', label: 'Ngày tháng', hint: 'Ngày bán, hạn chót', glyph: '31' },
  { key: 'd-select', kind: 'select', label: 'Danh sách chọn', hint: 'Sản phẩm, trạng thái', glyph: '≡' },
  { key: 'd-person', kind: 'person', label: 'Nhân sự', hint: 'Người phụ trách', glyph: '@' },
];

export const PAL_FORMULA: PaletteItem[] = [
  { key: 'f-mul', kind: 'formula', preset: 'mul', label: 'Nhân  A × B', name: 'Kết quả nhân', hint: 'Thành tiền = SL × Đơn giá', glyph: '×' },
  { key: 'f-sum', kind: 'formula', preset: 'sum', label: 'Cộng  A + B', name: 'Tổng cộng', hint: 'Tổng chi phí', glyph: '+' },
  { key: 'f-sub', kind: 'formula', preset: 'sub', label: 'Trừ  A − B', name: 'Chênh lệch', hint: 'Lợi nhuận = Thu − Chi', glyph: '−' },
  { key: 'f-pct', kind: 'formula', preset: 'pct', label: 'Tỷ lệ  A × B%', name: 'Giá trị %', hint: 'Tiền chiết khấu', glyph: '%' },
  { key: 'f-vat', kind: 'formula', preset: 'vat', label: 'Thuế VAT 10%', name: 'Thuế VAT', hint: 'VAT = A × 10%', glyph: 'T' },
  { key: 'f-free', kind: 'formula', preset: 'free', label: 'Tự ghép công thức', name: 'Trường công thức', hint: 'Bấm trường + phép tính', glyph: 'ƒx' },
];

export const PRESETS: { key: PresetKey; label: string; expr: string }[] = [
  { key: 'mul', label: 'Nhân', expr: 'A × B' },
  { key: 'sum', label: 'Cộng', expr: 'A + B' },
  { key: 'sub', label: 'Trừ', expr: 'A − B' },
  { key: 'pct', label: 'Tỷ lệ %', expr: 'A × B ÷ 100' },
  { key: 'vat', label: 'Thuế VAT 10%', expr: 'A × 10%' },
  { key: 'free', label: 'Để trống', expr: 'tự ghép' },
];
