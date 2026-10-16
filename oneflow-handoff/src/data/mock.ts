// Mọi số liệu báo cáo là dữ liệu mẫu minh hoạ.

export const REVENUE_TREND = [
  { month: 'T5', value: 380 },
  { month: 'T6', value: 402 },
  { month: 'T7', value: 395 },
  { month: 'T8', value: 418 },
  { month: 'T9', value: 432.6 },
  { month: 'T10', value: 486.2 },
];

export const REPORT = {
  period: 'Tháng 10/2026',
  totalRevenue: 486_240_000,
  growthPct: 12.4,
  growthAbs: '+53,6 triệu ₫',
  planPct: 97,
  target: '[MỤC TIÊU 500 tr]',
};

export const KPIS = [
  { label: 'Số phiếu bán', value: '38', badge: '+6', tone: 'green', spark: [40, 55, 50, 70, 65, 100], color: 'primary' },
  { label: 'Giá trị TB / phiếu', value: '12,8 tr', badge: '+4,1%', tone: 'green', spark: [60, 55, 70, 62, 80, 100], color: 'violet' },
  { label: 'Chiết khấu trung bình', value: '4,6%', badge: 'ổn định', tone: 'neutral', note: 'Tự tính từ trường “Chiết khấu”' },
  { label: 'Thuế VAT phải nộp', value: '44,2 tr', badge: 'Kế toán', tone: 'amber', note: 'Tự tính từ trường “Thuế VAT 10%”' },
] as const;

export const LEADERBOARD = [
  { rank: 1, initials: 'TH', name: 'Trần Thu Hà', value: 142.6, pct: 29, bar: 100, avBg: '#2F54EB', avFg: '#fff' },
  { rank: 2, initials: 'MN', name: 'Lê Minh Nam', value: 103.1, pct: 21, bar: 72, avBg: '#6E46F0', avFg: '#fff' },
  { rank: 3, initials: 'HP', name: 'Võ Hoàng Phúc', value: 89.4, pct: 18, bar: 63, avBg: '#0E9F6E', avFg: '#fff' },
  { rank: 4, initials: 'KL', name: 'Phạm Khánh Linh', value: 82.7, pct: 17, bar: 58, avBg: '#F59E0B', avFg: '#0B1220' },
  { rank: 5, initials: 'TV', name: 'Đỗ Tường Vy', value: 68.4, pct: 14, bar: 48, avBg: '#0B1220', avFg: '#fff' },
];

export const PRODUCT_MIX = [
  { name: 'Gói phần mềm Pro', short: 'Gói Pro', value: 48, color: '#2F54EB' },
  { name: 'Gói Basic', short: 'Gói Basic', value: 27, color: '#6E46F0' },
  { name: 'Dịch vụ triển khai', short: 'Dịch vụ triển khai', value: 17, color: '#0E9F6E' },
  { name: 'Bảo trì hằng năm', short: 'Bảo trì', value: 8, color: '#F59E0B' },
];

export interface InvoiceRow {
  code: string;
  customer: string;
  staff: string;
  qty: number;
  subtotal: number;
  vat: number;
  total: number;
  status: 'ok' | 'pending';
  fresh?: boolean;
}

export const INVOICES: InvoiceRow[] = [
  { code: 'PBH-1038', customer: 'Công ty TNHH Minh Phát', staff: 'Trần Thu Hà', qty: 12, subtotal: 15_000_000, vat: 1_425_000, total: 15_675_000, status: 'ok' },
  { code: 'PBH-1037', customer: 'CP Thương mại An Khang', staff: 'Lê Minh Nam', qty: 24, subtotal: 28_800_000, vat: 2_592_000, total: 28_512_000, status: 'ok' },
  { code: 'PBH-1036', customer: 'Cửa hàng Bảo Ngọc', staff: 'Đỗ Tường Vy', qty: 10, subtotal: 9_000_000, vat: 855_000, total: 9_405_000, status: 'pending' },
  { code: 'PBH-1035', customer: 'Công ty CP Hải Đăng', staff: 'Võ Hoàng Phúc', qty: 8, subtotal: 20_000_000, vat: 2_000_000, total: 22_000_000, status: 'pending' },
  { code: 'PBH-1034', customer: 'TNHH Sao Việt', staff: 'Phạm Khánh Linh', qty: 15, subtotal: 18_750_000, vat: 1_781_250, total: 19_593_750, status: 'ok' },
];

export const FILE_NAMES = {
  x: 'BaoCao_DoanhThu_T10.xlsx',
  w: 'BaoCao_DoanhThu_T10.docx',
  p: 'BaoCao_DoanhThu_T10.pptx',
} as const;
