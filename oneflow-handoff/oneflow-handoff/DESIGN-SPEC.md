# OneFlow – Design Spec (V2)

## 1. Routes ↔ file thiết kế
| Route | File thiết kế | Ghi chú |
|---|---|---|
| `/` | `design/HomeV2.dc.html` | Landing page |
| `/nhap-lieu` | `design/NhapLieuV2.dc.html` | Kéo thả + công thức (tương tác chính) |
| `/bao-cao` | `design/BaoCaoV2.dc.html` | Dashboard + luồng duyệt + xuất file |
| `/giao-dien` | `design/GiaoDienV2.dc.html` | Showcase desktop & mobile (tĩnh) |

App shell (sidebar trắng 224px) dùng chung cho `/nhap-lieu` và `/bao-cao`.

## 2. Design tokens
**Font:** `'Inter Display', 'Inter', Arial, sans-serif` + `font-optical-sizing: auto` (Google Fonts `Inter:opsz,wght@14..32,400..800`). Mono: `JetBrains Mono` 500/600 cho công thức, mã phiếu.

| Token | Hex | Dùng cho |
|---|---|---|
| ink | `#0B1220` | chữ chính, nền tối |
| body | `#3B4559` | chữ đoạn |
| muted | `#5B6478` | chữ phụ |
| line | `#E7EAF0` | viền |
| soft | `#F6F8FB` | nền section / app |
| primary | `#2F54EB` (hover `#1E3CC2`) | dữ liệu nhập, nút chính |
| primary-soft | `#EEF2FF` | nền chip dữ liệu |
| violet | `#6E46F0` / text `#5B33E0` / soft `#F3EFFF` / card `#FAF8FF` | **trường tự tính (công thức)** |
| green | `#0E9F6E` / text `#047857` / soft `#E6F6EF` | báo cáo, đã duyệt |
| amber | `#F59E0B` / text `#92400E` / soft `#FEF6E0` | phê duyệt, chờ duyệt |
| red | text `#B42318` / soft `#FEF1EE` | vấn đề (✕), trả lại |
| file | XLSX `#166534`, DOCX `#1E40AF`, PPTX `#C2410C` | chip định dạng |

**Typography:** H1 62px/800/-0.045em · H2 46px/800/-0.04em · H3 20–24px/800 · body 15–19px/1.6 · eyebrow 12px/700/letter-spacing .14em uppercase.
**Radius:** nút 10–12px · input 9px · thẻ 18–22px · khối lớn 24–28px. **Shadow thẻ:** `0 24px 48px -28px rgba(11,18,32,.35)`.
**Nền đặc biệt:** hero = chấm lưới 22px `#E3E7EF` + 2 radial blue/violet nhạt; khối tối `.navy` = `#0B1220` + radial blue/violet.

## 3. Component chính
- **Navbar**, **Hero** (2 cột + flow card 4 bước), **PainPointCard** (✕ → ✓), **DeptBentoCard**, **FlowStrip**, **StepCard**, **CTA band**.
- **AppSidebar**, **AppHeader** (breadcrumb + segmented control).
- **CoachTips** (3 bước, sáng theo trạng thái), **FieldPalette**, **FormGrid** (12 cột), **FieldCard**, **FormulaTokens**, **Inspector**.
- **RevenueHero** (line chart), **KpiCard** (sparkline), **Leaderboard**, **DonutChart**, **InvoiceTable**, **ApprovalTimeline**, **ExportPanel**, **ActivityLog**.

## 4. Data model (Nhập liệu)
```ts
type FieldKind = 'text'|'number'|'money'|'percent'|'date'|'select'|'person'|'formula';
type Token = { f: string } | { o: '+'|'−'|'×'|'÷'|'('|')' } | { n: number } | { s: 1 }; // s = ô trống chờ chọn trường
interface Field { id: string; kind: FieldKind; label: string; span: 2|3|4|6|12; value?: string; tokens?: Token[]; }
```
Mẫu "Phiếu bán hàng" (nạp sẵn): Khách hàng, Nhân viên bán, Ngày bán, Sản phẩm, Số lượng=12, Đơn giá=1250000, Chiết khấu=5;
Thành tiền = SL × Đơn giá · Tiền CK = Thành tiền × CK ÷ 100 · VAT = (Thành tiền − CK) × 10 ÷ 100 · Tổng = Thành tiền − CK + VAT → **15.675.000 ₫**.

**Bộ tính:** đệ quy theo `tokens`, có `seen[]` chặn vòng lặp, parser recursive-descent (+ − × ÷ ngoặc, số âm). Trả `NaN` → hiển thị "Chưa đủ dữ liệu". Format `vi-VN` + " ₫".

## 5. Hành vi tương tác
**/nhap-lieu**
- 2 chế độ: ① Thiết kế biểu mẫu (giá trị tĩnh) / ② Nhập liệu thử (input viền xanh, ô tím tự tính realtime).
- Kéo thẻ từ palette (dnd-kit, có DragOverlay) hoặc bấm để thêm; thả vào lưới → chọn trường mới.
- Mỗi thẻ: chọn, ↔ đổi độ rộng (2→3→4→6→12), × xoá. Kéo sắp xếp lại trong lưới (sortable).
- Inspector: đổi tên, độ rộng; dữ liệu → giá trị mẫu; công thức → Cách 1 preset (Nhân, Cộng, Trừ, Tỷ lệ %, VAT 10%, Để trống — preset tạo ô trống `{s:1}`), Cách 2 bấm trường (lấp ô trống đầu tiên, nếu không thì nối) + phép tính, xoá ký hiệu cuối, xoá công thức.
- CoachTips sáng: bước 1 (mặc định), bước 2 (đang chọn ô công thức), bước 3 (chế độ nhập thử).
- "Lưu phiếu" → toast xanh "Đã lưu phiếu PBH-10xx — tổng thanh toán …" + link /bao-cao. Lưu state vào Zustand persist.

**/bao-cao**
- Approval state: `pending → ok | back`, nút "Diễn lại bước duyệt" về pending.
- Xuất file **khoá** cho đến khi `ok`; bấm khi khoá → cảnh báo vàng. Khi `ok` → tạo file thật:
  - XLSX (exceljs): bảng phiếu + cột công thức Excel thật (`=E2-F2+G2`).
  - DOCX (docx): tiêu đề, đoạn tóm tắt, bảng.
  - PPTX (pptxgenjs): 6 slide (tiêu đề, KPI, xu hướng, xếp hạng, cơ cấu, chi tiết).
- Biểu đồ dùng Recharts, giữ đúng màu và dữ liệu mẫu (T5–T10: 380, 402, 395, 418, 432.6, 486.2 triệu).

## 6. Animation (motion, tôn trọng prefers-reduced-motion)
- Section fade/slide-up khi vào viewport (stagger 80ms).
- Ô kết quả công thức: đếm số từ giá trị cũ → mới 600ms + nháy nền tím nhạt.
- Thẻ thả vào lưới: scale 0.96 → 1 spring; DragOverlay xoay -3°.
- Biểu đồ: cột/đường mọc lên khi vào view. Luồng duyệt: bước mới sáng dần khi phê duyệt.
