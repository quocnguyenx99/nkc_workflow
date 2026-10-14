# Prompt dán vào Claude Code (chạy lần lượt từng phase)

## Phase 0 – Khởi tạo
Đọc CLAUDE.md, DESIGN-SPEC.md và toàn bộ design/*.dc.html. Lập kế hoạch ngắn (cấu trúc thư mục, component, route) rồi khởi tạo dự án Vite + React + TS + Tailwind v4 + shadcn/ui, cài các thư viện trong CLAUDE.md, khai báo design tokens trong @theme, dựng router 4 route và AppShell. Chưa code chi tiết trang.

## Phase 1 – Trang Nhập liệu (/nhap-lieu) – ưu tiên cao nhất
Dựng y hệt design/NhapLieuV2.dc.html. Port logic từ khối <script type="text/x-dc"> sang Zustand store + src/lib/formula.ts (có unit test Vitest cho bộ tính: mẫu phiếu ra 15.675.000; vòng lặp trả NaN; ngoặc và số âm). Kéo thả dùng dnd-kit (palette → lưới, sắp xếp trong lưới, DragOverlay). Đủ mọi hành vi ở mục 5 DESIGN-SPEC.

## Phase 2 – Báo cáo & Phê duyệt (/bao-cao)
Dựng y hệt design/BaoCaoV2.dc.html, biểu đồ bằng Recharts. Luồng duyệt và khoá xuất file như spec. Xuất XLSX/DOCX/PPTX thật trên trình duyệt (exceljs, docx, pptxgenjs + file-saver), dùng số liệu mock + phiếu vừa lưu từ /nhap-lieu.

## Phase 3 – Trang chủ (/) và Giao diện (/giao-dien)
Dựng y hệt design/HomeV2.dc.html và design/GiaoDienV2.dc.html. Mọi link "Trải nghiệm demo" → /nhap-lieu, "Xem báo cáo" → /bao-cao.

## Phase 4 – Hoàn thiện
Thêm animation theo mục 6 DESIGN-SPEC. Dùng Playwright chụp 4 route ở 1440px và 768px, so với thiết kế, tự sửa lệch. Chạy build, test, rồi tóm tắt việc đã làm.
