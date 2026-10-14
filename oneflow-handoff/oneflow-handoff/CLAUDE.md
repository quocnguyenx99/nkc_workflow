# NKC OneFlow – Demo web app

Demo cho khách hàng hiểu cách hệ thống vận hành nội bộ doanh nghiệp: Nhập liệu (kéo thả) → Tính toán (công thức) → Báo cáo & Phê duyệt → Xuất file.

## Nguồn thiết kế (bắt buộc đọc trước khi code)
- `design/*.dc.html` là bản thiết kế gốc (HTML + inline style). Đây là **nguồn sự thật** về màu, khoảng cách, cỡ chữ, bo góc, nội dung chữ.
  - Thẻ `<x-dc>`, `<sc-for>`, `<sc-if>`, `{{hole}}` là cú pháp template của công cụ thiết kế → dịch sang JSX tương ứng (`.map`, điều kiện, biến).
  - Khối `<script type="text/x-dc">` chứa logic mẫu (state, công thức, bộ tính biểu thức) → port sang React/TypeScript.
- `DESIGN-SPEC.md`: token màu, typography, component, data model, hành vi tương tác.
- Copy giữ **nguyên văn tiếng Việt** trong thiết kế. Không tự viết lại câu chữ.

## Stack
Vite + React 18 + TypeScript, Tailwind CSS v4, shadcn/ui, lucide-react, Zustand (persist), dnd-kit, Recharts, motion, exceljs, docx, pptxgenjs, file-saver.

## Quy tắc
- Copy chính xác giá trị px/hex từ thiết kế, không làm tròn theo thang Tailwind mặc định → khai báo token trong `@theme`.
- Không dùng `eval`/`new Function` cho công thức: dùng bộ parser trong `src/lib/formula.ts` (port từ `evalItems` của thiết kế).
- Mọi số liệu báo cáo là dữ liệu mẫu, đặt trong `src/data/mock.ts`.
- Responsive: desktop là ưu tiên (trình chiếu 1440px), không vỡ ở 1280px và 768px.
- Sau mỗi phase: chạy `npm run build` + dùng Playwright chụp màn hình từng route, so với thiết kế và tự sửa.
