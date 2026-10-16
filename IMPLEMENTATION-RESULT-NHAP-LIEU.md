# IMPLEMENTATION RESULT — `/nhap-lieu`

Ngày nghiệm thu: 16/10/2026  
Phạm vi: `oneflow-handoff`, trang `/nhap-lieu` và luồng dữ liệu sang `/bao-cao`/file xuất.

## 1. Kết quả tổng quan

| Nhóm | Trạng thái | Kết quả |
|---|---|---|
| P0 — chặn dữ liệu sai | PASS | Không tạo phiếu khi thiếu trường bắt buộc, ngày sai, số sai, số lượng không nguyên/dương, đơn giá âm, chiết khấu ngoài 0–100, VAT/tổng âm hoặc công thức lỗi. |
| P0 — chống trùng | PASS | Fingerprint được lưu trong `oneflow-form`; chặn bấm lặp, reload rồi lưu lại, quay lại dữ liệu đã lưu, và đối chiếu được cả phiếu legacy chưa có fingerprint. |
| P0 — báo cáo/xuất file | PASS | Phiếu không đạt điều kiện bị cách ly khỏi bảng báo cáo, nhật ký và XLSX/DOCX/PPTX; dữ liệu gốc vẫn được giữ nguyên. |
| P1 — Form Builder | PASS | Thêm, sửa, xoá có xác nhận/hoàn tác, kéo-thả, đổi thứ tự, đổi độ rộng, vai trò nghiệp vụ, bắt buộc, mặc định, placeholder, danh sách chọn/nhân sự, min/max/số nguyên. |
| P1 — đồng bộ màn nhập | PASS | Màn nhập dùng đúng thứ tự và độ rộng của schema; hỗ trợ text, số, tiền, %, ngày native, select, person autocomplete và formula chỉ đọc. |
| P1 — Formula Builder | PASS | Giữ Formula Engine cũ; thêm chọn/thay/xoá/di chuyển/kéo token, mẫu nhanh, hằng số tuỳ chỉnh, loại kết quả và số lẻ. |
| P1 — lưu lịch sử | PASS | Bỏ giới hạn `.slice(0, 20)`; không tự xoá phiếu cũ; có migration version 2 tương thích `oneflow-form`. |
| P2 — UI/UX | PASS | Sửa nút che chữ, card quá hẹp, thư viện mobile, CTA lưu trùng lặp, thông báo lỗi theo vị trí, trạng thái tự lưu và responsive. |
| P2 — Fixed Form Builder workspace | PASS | Canvas, thư viện và thuộc tính cuộn độc lập; 1280–1440 dùng drawer; ba cột chỉ xuất hiện khi canvas còn tối thiểu 720px; không còn nền chấm/khung trắng kéo dài theo cột khác. |

## 2. Thay đổi đã triển khai

### P0 — tính đúng và an toàn dữ liệu

- Bổ sung validation tập trung cho toàn bộ phiếu bán hàng:
  - trường nghiệp vụ bắt buộc: khách hàng, nhân viên, ngày bán, sản phẩm, số lượng, đơn giá, chiết khấu, thành tiền, VAT và tổng;
  - kiểm tra ngày thực theo lịch, không chỉ kiểm tra định dạng;
  - số lượng phải là số nguyên và từ 1 trở lên;
  - đơn giá, thành tiền, VAT và tổng không âm;
  - chiết khấu từ 0 đến 100;
  - select chỉ nhận giá trị trong danh sách đã cấu hình;
  - công thức lỗi, thiếu tham chiếu, chia 0, vòng lặp hoặc thiếu dữ liệu đều chặn lưu.
- Gom lỗi cùng nguyên nhân để người dùng không nhận nhiều thông báo lặp từ chuỗi công thức.
- Khi lỗi, giao diện chuyển đến đúng trường và hiển thị cách sửa ngay dưới ô nhập.
- Fingerprint phiếu chỉ dựa vào nội dung dữ liệu/kết quả, không phụ thuộc nhãn hay bố cục. Fingerprint và thời điểm lưu được persist.
- Đối với phiếu cũ không có fingerprint, hệ thống so sánh các trường lõi hiện còn lưu để chặn tạo bản trùng đầu tiên sau nâng cấp.
- Phiếu legacy không đạt điều kiện không bị xoá/ghi đè. Chúng được giữ trong store, có cảnh báo số lượng trên Báo cáo, nhưng không được đưa vào bảng báo cáo, nhật ký hoặc file xuất.

### P1 — Form Builder và Formula Builder

- Mở rộng schema `Field` theo cách additive, không phá dữ liệu cũ: `required`, `defaultValue`, `placeholder`, `options`, `min`, `max`, `integer`, `resultKind`, `precision`.
- Mỗi loại trường có control nhập đúng ngữ nghĩa:
  - ngày dùng date picker native và lưu tương thích giá trị `dd/mm/yyyy` cũ;
  - danh sách chọn dùng `<select>`;
  - nhân sự dùng autocomplete/datalist;
  - số, tiền và phần trăm có bàn phím số và hậu tố phù hợp.
- Cho gán “ý nghĩa nghiệp vụ” theo loại trường; một vai trò chỉ thuộc một trường để báo cáo không lấy nhầm formula mới thêm.
- Layout từ Builder được render đúng thứ tự/độ rộng trên màn Nhập phiếu; formula cũng nằm trong lưới tại đúng vị trí thay vì bị tách khỏi schema.
- Formula Builder mới:
  - token có thể chọn để thay thế riêng;
  - xoá riêng từng token;
  - di chuyển trái/phải hoặc kéo-thả token;
  - thêm trường, toán tử, ngoặc và hằng số thập phân tuỳ chỉnh;
  - chọn kết quả số/tiền/% và 0–6 chữ số thập phân;
  - giữ mẫu công thức cũ và diagnostics cũ.
- Bỏ cơ chế chỉ giữ 20 phiếu gần nhất. Local history nay được giữ nguyên cho đến khi người dùng/chính sách lưu trữ chủ động xử lý.
- Persist store nâng từ version 1 lên version 2 bằng migration không phá huỷ; role legacy, công thức và dữ liệu `oneflow-form` cũ vẫn được giữ.

### P2 — trải nghiệm sử dụng

- Nút đổi độ rộng/xoá không còn phủ lên tên trường.
- Breakpoint mới ưu tiên card đủ rộng tại 1280/768 và một cột rõ ràng tại 390.
- Thư viện field mobile chuyển một cột ở màn hẹp; desktop giảm độ rộng panel để tăng không gian canvas.
- Chỉ còn một CTA lưu khả dụng ở mobile; desktop dùng nhãn “Kiểm tra & lưu phiếu”.
- Hiển thị thời điểm tự lưu cấu hình và thông báo rõ dữ liệu đang lưu cục bộ.
- Trạng thái thành công, bản trùng và validation dùng thông điệp khác nhau; bản trùng chỉ rõ mã phiếu đã tồn tại.

### P2 — workspace Form Builder và Formula Builder

- `AppShell` đã chuyển sang CSS Grid và có chế độ `workspace`; lỗi content bị wrap xuống dưới sidebar tại 1024px đã được loại bỏ.
- Chế độ thiết kế từ 768px trở lên dùng đúng chiều cao `100dvh`; body không cuộn, phần builder nhận toàn bộ chiều cao còn lại.
- Layout sử dụng container query theo chiều rộng thực. Workspace rộng từ 1280px mới hiện ba cột `244px / minmax(720px, 1fr) / 340px`; do sidebar, viewport 1280–1440px chuyển sang drawer.
- Palette, canvas và inspector có scroll container độc lập, `overscroll-behavior: contain` và scrollbar ổn định.
- Canvas cao theo nội dung, có chiều cao tối thiểu và drop zone cuối form. Nền chấm chỉ nằm trong canvas surface, không còn khoảng chấm dư theo palette.
- Palette drawer giữ canvas còn nhìn thấy, hỗ trợ cả bấm để thêm và kéo trực tiếp. Collision fallback chỉ kích hoạt khi con trỏ thực sự nằm trong form để không thêm nhầm khi thả ngoài canvas.
- Inspector có header sticky; Formula Builder tự cuộn riêng khi kéo token sát mép và không làm cuộn body/canvas.
- Hướng dẫn đã thu thành thanh một dòng 42–52px; chi tiết mở bằng popover hoặc bottom sheet.
- Bổ sung focus trap, Escape, trả focus về nút mở drawer, reduced-motion và xử lý màn hình thấp/zoom.

## 3. Regression tests và bằng chứng nghiệm thu

### Automated tests

| Lệnh | Kết quả |
|---|---|
| `npm test` | PASS — 7 test files, 35 tests |
| `npm run test:e2e` | PASS — 23 Playwright tests trên Chromium thật |
| `npm run build` | PASS — TypeScript + Vite production build |

Regression coverage mới gồm:

- ngày không tồn tại, trường bắt buộc trống;
- số lượng âm/lẻ, chiết khấu trên 100;
- chống trùng ngoài cửa sổ thời gian cũ và phiếu legacy không có fingerprint;
- lưu hơn 20 phiếu không bị cắt;
- phiếu legacy sai bị loại khỏi `reportRows` nhưng mảng dữ liệu gốc không bị thay đổi;
- kéo field từ palette vào canvas;
- chọn, kéo, thay token và thêm hằng số trong Formula Builder;
- tạo phiếu hợp lệ → lưu → reload → chặn trùng → xuất hiện trong Báo cáo;
- control ngày/select đúng loại;
- không tràn ngang ở 1440, 1280, 768 và 390 cho cả Builder lẫn màn Nhập phiếu.
- fixed workspace không tạo body scroll từ 768px trở lên;
- palette, canvas và Formula Inspector cuộn độc lập;
- drawer tạo form và chỉnh công thức hoạt động ở 1280×720;
- kéo token sát đáy tự cuộn Inspector nhưng không cuộn trang;
- responsive tại 1920×1080, 1600×900, 1440×900, 1366×768, 1280×800, 1280×720, 1024×768, 768×800 và 390×844;
- mô phỏng zoom 125% không phát sinh tràn ngang và tự chuyển sang drawer.

### Ảnh chụp trình duyệt

- Builder: [1920×1080](./oneflow-handoff/output/playwright/nhap-lieu-1920x1080.png), [1600×900](./oneflow-handoff/output/playwright/nhap-lieu-1600x900.png), [1440×900](./oneflow-handoff/output/playwright/nhap-lieu-1440x900.png), [1366×768](./oneflow-handoff/output/playwright/nhap-lieu-1366x768.png), [1280×720](./oneflow-handoff/output/playwright/nhap-lieu-1280x720.png), [1024×768](./oneflow-handoff/output/playwright/nhap-lieu-1024x768.png), [768×800](./oneflow-handoff/output/playwright/nhap-lieu-768x800.png), [390×844](./oneflow-handoff/output/playwright/nhap-lieu-390x844.png)
- Nhập phiếu: các ảnh `nhap-lieu-entry-{width}x{height}.png` tương ứng trong `oneflow-handoff/output/playwright/`.

## 4. Phần chưa triển khai / giới hạn có chủ đích

| Mục | Trạng thái | Lý do |
|---|---|---|
| Backend, đồng bộ nhiều thiết bị, phân quyền và chống ghi đồng thời | CHƯA TRIỂN KHAI | Kiến trúc hiện tại là demo frontend, không có API/database và yêu cầu không giả định backend. |
| IndexedDB hoặc lưu trữ dài hạn dung lượng lớn | CHƯA TRIỂN KHAI | Giữ localStorage để tương thích `oneflow-form` và tránh migration dữ liệu rủi ro. Không còn tự cắt lịch sử, nhưng quota trình duyệt vẫn là giới hạn kỹ thuật. |
| Ép công thức VAT/chiết khấu theo một chuẩn tài chính mới | KHÔNG THAY ĐỔI | Tài liệu hiện có chỉ xác nhận công thức mẫu; tự áp VAT hoặc quy tắc làm tròn khác sẽ thay đổi nghiệp vụ khi chưa có căn cứ. Hệ thống kiểm tra miền giá trị và tính hợp lệ, không viết lại Formula Engine. |
| Khôi phục đầy đủ ngày/sản phẩm của phiếu legacy | KHÔNG THỂ SUY DIỄN | `SavedSlip` cũ không lưu hai trường này. Hệ thống giữ nguyên dữ liệu cũ và chỉ kiểm tra/cách ly dựa trên thông tin thực tế còn có. Phiếu mới lưu snapshot đầy đủ hơn. |
| Tối ưu bundle báo cáo >500 kB | TECH DEBT | Build vẫn PASS; các thư viện Excel/Word/PowerPoint đã được dynamic import nhưng chunk vendor còn lớn. Không thuộc lỗi nghiệp vụ `/nhap-lieu`. |

## 5. Đánh giá phương án lưu trữ

Với kiến trúc hiện tại, tiếp tục dùng localStorage có versioned migration là phương án ít rủi ro nhất để không làm mất `oneflow-form`. Việc bỏ giới hạn 20 bản ghi giải quyết mất dữ liệu âm thầm trong demo. Để dùng production, bước tiếp theo nên là repository abstraction và một trong hai hướng: IndexedDB cho chế độ một thiết bị/offline, hoặc API + database có unique constraint/idempotency key cho nhiều người dùng. Không nên coi localStorage là kho dữ liệu tài chính dài hạn.

## 6. Kết luận nghiệm thu

Không còn lỗi FAIL đã biết trong phạm vi P0/P1/P2 được yêu cầu. Luồng đã kiểm thử thực tế: thiết kế form → kéo trường → chỉnh công thức → nhập liệu → validation → tính toán → lưu → reload/chặn trùng → hiển thị Báo cáo. Dữ liệu cũ không bị reset, xoá hoặc tự động ghi đè trong quá trình triển khai.
