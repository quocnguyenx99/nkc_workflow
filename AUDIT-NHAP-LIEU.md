# AUDIT TOÀN DIỆN `/nhap-lieu`

**Ngày audit:** 16/10/2026  
**Phạm vi:** `http://localhost:3000/nhap-lieu`, luồng liên quan tới lưu phiếu và dữ liệu đi sang `/bao-cao`  
**Nguyên tắc:** chỉ kiểm tra và báo cáo; không sửa source ứng dụng.

## 1. Kết luận điều hành

Trang có nền tảng demo tốt: mẫu mặc định tính đúng **15.675.000 ₫**, thao tác thêm/kéo/sắp xếp trường hoạt động, Formula Builder có preset và chẩn đoán lỗi, state form cùng phiếu đã lưu được khôi phục sau reload. Build production thành công và 29/29 unit test hiện có đều qua.

Tuy nhiên, trang **chưa an toàn để dùng cho dữ liệu nghiệp vụ thật**. Hai vấn đề P0 đã được tái hiện trực tiếp trên trình duyệt:

1. Hệ thống cho lưu phiếu có khách hàng/nhân viên/sản phẩm trống, ngày `99/99/abcd`, chiết khấu `150%`, VAT âm và tổng âm `-1.375.000 ₫`. Phiếu sai tiếp tục xuất hiện trong bảng Báo cáo với trạng thái “Chờ duyệt”.
2. Chống lưu trùng chỉ có hiệu lực trong 1,5 giây và không được persist. Cùng một dữ liệu có thể tạo nhiều mã phiếu khi chờ hơn 1,5 giây hoặc reload rồi bấm lưu lại.

Ngoài ra, các loại trường “Danh sách chọn”, “Nhân sự”, “Ngày tháng” hiện chỉ là textbox; Form Builder không có cấu hình bắt buộc/options/ràng buộc/role nghiệp vụ; Formula Builder thiếu kiểu kết quả và khó chỉnh sửa công thức; giao diện desktop 1280–1440 bị chật, cắt nhãn và có trường hợp nút Xóa che vùng chọn trường.

**Đánh giá tổng thể:** **FAIL — chưa sẵn sàng cho production/nghiệp vụ tài chính.** Có thể dùng tiếp như prototype sau khi chặn các lỗi P0.

## 2. Cơ sở và phương pháp kiểm tra

### Tài liệu/source đã đối chiếu

- `oneflow-handoff/README.md`.
- `DESIGN-SPEC.md`, `PROMPT.md`, `CLAUDE.md` từ phiên bản Git hiện tại (các file đang nằm ở lịch sử Git do worktree có di chuyển thư mục từ trước).
- Thiết kế gốc `oneflow-handoff/design/NhapLieuV2.dc.html`.
- Trang, component, store và thư viện liên quan: `NhapLieuPage.tsx`, `BuilderWorkspace.tsx`, `Palette.tsx`, `FieldCard.tsx`, `Inspector.tsx`, `EntryWorkspace.tsx`, `form.ts`, `formula.ts`, `formula-diagnostics.ts`, `form-validation.ts`, `field-semantics.ts`, `field-dependencies.ts`, `template.ts`.
- Luồng nhận phiếu ở Báo cáo: `BaoCaoPage.tsx`, `Panels.tsx`, `export.ts`.

### Kiểm thử thực tế trên trình duyệt

- Dùng Chromium có giao diện thật qua Playwright CLI, state trình duyệt audit riêng.
- Viewport: 1440×1000, 1280×900, 768×900 và 390×844.
- Thực hiện click, kéo bằng chuột thật, kéo sắp xếp, điền input, đổi chế độ, reload, lưu nhiều lần và mở Báo cáo.
- Kiểm tra trực tiếp state đã persist trong `localStorage['oneflow-form']` sau từng luồng quan trọng.

### Kiểm tra kỹ thuật

- `npm test`: **PASS — 6 file, 29/29 test**.
- `npm run build`: **PASS**; Vite build thành công. Có cảnh báo chunk lớn hơn 500 kB, lớn nhất là `exceljs` khoảng 938 kB trước gzip.
- Console trang: không có lỗi runtime của chức năng; có 404 `favicon.ico` lúc mở lần đầu và hai cảnh báo React Router v7 future flags.

### Ảnh bằng chứng

- [Desktop 1440 mặc định](oneflow-handoff/output/playwright/nhap-lieu-default-1440.png)
- [Desktop 1280 — vùng canvas/field bị chật](oneflow-handoff/output/playwright/nhap-lieu-design-1280.png)
- [Thiết kế 768](oneflow-handoff/output/playwright/nhap-lieu-design-768.png)
- [Nhập phiếu 768](oneflow-handoff/output/playwright/nhap-lieu-entry-768.png)
- [Thiết kế 390](oneflow-handoff/output/playwright/nhap-lieu-design-390.png)
- [Thư viện trường 390](oneflow-handoff/output/playwright/nhap-lieu-library-390.png)
- [Nhập phiếu 390](oneflow-handoff/output/playwright/nhap-lieu-entry-390.png)

## 3. Ma trận chức năng PASS/FAIL

| Nhóm | Chức năng/kịch bản | Kết quả | Bằng chứng thực tế |
|---|---|---:|---|
| Khởi tạo | Mở `/nhap-lieu`, nạp mẫu 7 trường nhập + 4 công thức | PASS | UI hiển thị đủ 11 trường; không có lỗi runtime |
| Tính mẫu | 12 × 1.250.000, CK 5%, VAT 10% | PASS | Thành tiền 15.000.000; CK 750.000; VAT 1.425.000; tổng 15.675.000 ₫ |
| Form Builder | Bấm loại trường để thêm nhanh | PASS | Thêm “Văn bản 1”, tự chọn trường mới và focus “Tên trường” |
| Kéo thả | Kéo trường “Số” từ palette vào trước “Khách hàng” | PASS | Trường “Số 2” được chèn đúng vị trí; status DnD xác nhận drop trên `c1` |
| Kéo thả | Kéo “Số 2” để đổi thứ tự | PASS | Thứ tự persisted đổi từ `Số 2 | Khách hàng` thành `Khách hàng | Số 2` |
| Thuộc tính | Đổi tên và giá trị mẫu | PASS | “Ghi chú audit” / “Nội dung kiểm thử” hiển thị và còn nguyên sau reload |
| Thuộc tính | Đổi độ rộng bằng nút 1/2 | PASS | `span` của trường đổi thành 6 trong state persist |
| Thuộc tính | Di chuyển lên/xuống bằng nút | PASS | `f4` đổi vị trí trước `f3` trong mảng persisted |
| Xóa | Cảnh báo khi xóa trường đang được công thức dùng | PASS | Xóa “Số lượng” liệt kê đủ chuỗi ảnh hưởng: Thành tiền → Tiền chiết khấu → VAT → Tổng |
| Xóa | Xóa xong công thức hiển thị tham chiếu mất | PASS | Chip đổi thành “(đã xoá)”, các kết quả chuyển “Chưa đủ dữ liệu” |
| Hoàn tác | Làm trống rồi Hoàn tác | PASS | Số trường từ 11 → 0 → 11 bằng thao tác UI |
| Nạp mẫu | Nạp lại mẫu, có confirm và Hoàn tác | PASS | Form trở về mẫu chuẩn; toast hoàn tác xuất hiện 8 giây |
| Persist form | Reload sau thêm/đổi tên/đổi giá trị/thứ tự | PASS | Cấu trúc, giá trị, mode và selection được khôi phục từ `oneflow-form` |
| Formula Builder | Thêm công thức trống | PASS | UI báo “Chọn công thức mẫu hoặc thêm trường đầu tiên” |
| Formula Builder | Preset “Nhân A × B”, lấp hai slot | PASS | Chọn Số lượng và Đơn giá tạo kết quả 15.000.000 ₫; chẩn đoán hợp lệ |
| Formula Builder | Tự ghép `Số lượng × Đơn giá` | PASS | Tokens persisted đúng `c5 × c6`; kết quả 15.000.000 ₫ |
| Formula Builder | Chia cho 0 | PASS | Tóm tắt báo “Không thể chia cho 0”; lưu bị chặn với 1 lỗi |
| Formula Builder | Cú pháp, ngoặc, số âm, cycle, missing ref | PASS có điều kiện | 12 test bộ tính + 6 test diagnostics qua; UI thực tế đã xác nhận empty/divide-by-zero/missing-ref |
| Formula Builder | Chỉnh sửa token bất kỳ/chèn giữa/nhập hằng số tự do | FAIL | Chỉ có xóa ký hiệu cuối/xóa toàn bộ; hằng số chỉ có 10 và 100 |
| Formula Builder | Kiểu kết quả theo ngữ nghĩa | FAIL | Mọi công thức đều dùng `fmtMoney`; phép `12 ÷ 5` hiển thị `2 ₫` |
| Nhập liệu | Số lượng 2, đơn giá `1.250.000`, CK 10 | PASS | Tính realtime đúng: 2.500.000; 250.000; 225.000; tổng 2.475.000 ₫ |
| Nhập liệu | Nhập chữ `abc` vào Số lượng và lưu | PASS | Save bị chặn, input có `aria-invalid`, hiện lỗi tổng hợp và lỗi cạnh trường |
| Nhập liệu | Ngày hợp lệ, trường bắt buộc, range phần trăm | FAIL | Ngày sai, trường trống, CK 150% vẫn lưu thành công |
| Nhập liệu | Select/person/date đúng loại control | FAIL | Tất cả render bằng `<input>` text; không có date picker, options hay people picker |
| Nhập liệu | Độ rộng/thứ tự thiết kế được áp dụng khi nhập | FAIL | Entry luôn 2 cột `col-span-6`; fields bị tách thành inputs và formulas nên không giữ layout thiết kế |
| Lưu | Lưu phiếu hợp lệ | PASS | Tạo PBH-1039, tổng 2.475.000 ₫, toast và link Báo cáo xuất hiện |
| Lưu | Chống double-click tức thời | PASS | `dblclick` chỉ tạo một phiếu; hiện thông báo không tạo bản trùng |
| Lưu | Chống trùng qua thời gian/reload | FAIL | Cùng payload tạo PBH-1041 và PBH-1042 sau reload |
| Lưu | Khôi phục phiếu sau reload | PASS | Mode nhập, dữ liệu field và danh sách `slips` còn nguyên sau reload |
| Liên thông | Phiếu mới xuất hiện ở Báo cáo | PASS | PBH-1043 xuất hiện trong bảng và activity log |
| Liên thông | Chỉ dữ liệu hợp lệ đi sang Báo cáo | FAIL | PBH-1043 có khách/nhân viên “—”, tổng `-1.375.000`, vẫn “Chờ duyệt” |
| Responsive | 768 thiết kế/nhập liệu | PASS | Không tràn ngang; palette/inspector chuyển thành panel; entry xếp hợp lý |
| Responsive | 390 không tràn ngang | PASS có điều kiện | `scrollWidth = clientWidth = 390`; thao tác cơ bản dùng được |
| Responsive | Desktop ưu tiên 1440 và yêu cầu 1280 không vỡ | FAIL | Nhiều nhãn/card bị cắt; action che vùng chọn; công thức khó đọc |

## 4. Lỗi và rủi ro theo ưu tiên

### P0 — phải xử lý trước khi dùng dữ liệu thật

#### P0-01 — Có thể lưu và đưa vào báo cáo dữ liệu nghiệp vụ/tài chính không hợp lệ

**Cách tái hiện:**

1. Nạp mẫu, chuyển sang “Nhập phiếu”.
2. Đặt Số lượng = `2`, Đơn giá = `1.250.000`, Chiết khấu = `150`.
3. Xóa Khách hàng, Nhân viên bán, Sản phẩm; nhập Ngày bán = `99/99/abcd`.
4. Bấm “Lưu phiếu”.

**Kết quả thực tế:** lưu thành công PBH-1043 với `customer = "—"`, `staff = "—"`, VAT `-125.000`, tổng `-1.375.000 ₫`. Mở Báo cáo cho thấy chính phiếu này trong bảng “Chi tiết phiếu bán hàng” và activity log.

**Nguyên nhân source:** `validateFormForSave()` chỉ kiểm tra toàn bộ công thức và bốn role số phục vụ báo cáo (`quantity`, `subtotal`, `vat`, `total`) tại `src/lib/form-validation.ts:11-39`. Không có required validation cho customer/staff/date/product; không parse/validate date; không có min/max cho số lượng, tiền, phần trăm; không cấm tổng/VAT âm.

**Tác động:** dữ liệu sai có thể vào hàng chờ duyệt, báo cáo và file xuất; rủi ro sai doanh thu/thuế và sai đối tượng giao dịch.

**Đề xuất:** tạo schema validation theo loại và role; tối thiểu required customer/staff/saleDate/product, ngày hợp lệ, quantity nguyên dương, unitPrice ≥ 0, discountRate trong 0–100, VAT/total không âm; chặn save và export nếu vi phạm. Validation phải dùng cùng một schema ở UI, store và export.

#### P0-02 — Chống lưu trùng không bền vững, tạo được nhiều phiếu cùng payload

**Bằng chứng:** double-click tức thời được chặn, nhưng cùng payload đã tạo PBH-1041 rồi PBH-1042 sau reload. Không có thay đổi dữ liệu giữa hai lần.

**Nguyên nhân source:** duplicate guard chỉ so fingerprint trong cửa sổ 1.500 ms (`src/store/form.ts:232`), còn `lastSaveFingerprint` và `lastSaveAt` không nằm trong `partialize` (`src/store/form.ts:257`). Sau reload hai giá trị trở về mặc định. Sau 1,5 giây, ngay cả không reload, cùng payload vẫn tạo mã mới.

**Tác động:** nhân bản giao dịch, làm sai số lượng phiếu và doanh thu; các bản trùng đi thẳng sang báo cáo/export.

**Đề xuất:** dùng idempotency key bền vững hoặc nút “Lưu” theo lifecycle draft/submitted; persist fingerprint/id của lần submit; sau thành công chuyển sang màn “Đã lưu” với CTA “Tạo phiếu mới”, hoặc khóa submit cho tới khi dữ liệu đổi.

### P1 — ảnh hưởng lớn tới nghiệp vụ hoặc khả năng sử dụng

#### P1-01 — Các loại trường chỉ khác nhãn, chưa có hành vi nghiệp vụ tương ứng

- `date`, `select`, `person` đều render bằng cùng một `<input>` (`src/components/nhap-lieu/EntryWorkspace.tsx:69-81`).
- “Danh sách chọn” không có nơi khai báo option và không render `<select>`/combobox.
- “Nhân sự” không liên kết danh bạ, không có autocomplete/id nhân sự.
- “Ngày tháng” không có picker, mask hay kiểm tra ngày.

**Đề xuất:** tách renderer/config theo `FieldKind`; bổ sung options, nguồn dữ liệu, display value/id, placeholder, required, default, min/max và thông báo lỗi.

#### P1-02 — Form Builder không đủ để dựng form nghiệp vụ mới từ đầu

`role` có trong model nhưng là optional (`src/lib/formula.ts:27`) và Inspector không cho gán role. Trường mới chỉ nhận kind/label/value mẫu (`src/store/form.ts:112-120`). Khi lưu, báo cáo lại phụ thuộc `findSemanticField()` và heuristic theo id/label/kind (`src/lib/field-semantics.ts:32-50`). Vì vậy form dựng mới với tên khác có thể không map được subtotal/VAT/total và không lưu được, hoặc map nhầm “số”/“công thức cuối”.

**Đề xuất:** thêm “Ý nghĩa nghiệp vụ/đích dữ liệu” bắt buộc cho các trường dùng báo cáo; đảm bảo mỗi role duy nhất; hiển thị checklist “Form sẵn sàng để lưu/báo cáo”; bỏ heuristic mơ hồ trong runtime production.

#### P1-03 — Cấu hình layout trong Builder không được áp dụng vào màn nhập

Builder cho span 2/3/4/6/12, nhưng màn nhập cố định mọi input ở `col-span-6` (`EntryWorkspace.tsx:69`). Đồng thời code tách toàn bộ input và formula thành hai nhóm (`EntryWorkspace.tsx:21-22`), nên reorder xen kẽ và span thiết kế không được phản ánh khi nhập.

**Đề xuất:** render entry từ cùng schema/layout; nếu muốn summary riêng, phải nêu rõ “Độ rộng chỉ áp dụng canvas thiết kế” hoặc có cấu hình layout riêng cho entry/summary.

#### P1-04 — Formula Builder thiếu mô hình kiểu kết quả

Mọi formula đều hiển thị bằng `fmtMoney` (`Inspector.tsx:138`, `EntryWorkspace.tsx:109`). Công thức ratio `12 ÷ 5` đã hiển thị `2 ₫`; kết quả thực 2,4 cũng bị làm tròn khi hiển thị.

**Đề xuất:** cho chọn result type (số, tiền, %, số thập phân), precision và rounding rule; validate đơn vị giữa operand; không mặc định mọi công thức là tiền.

#### P1-05 — Chỉnh công thức thủ công khó phục hồi khi thao tác sai

UI chỉ nối token vào cuối, “Xóa ký hiệu cuối” hoặc “Xóa công thức”; không chọn/xóa/thay token ở giữa, không drag token, không nhập hằng số tùy ý (chỉ 10/100 tại `Inspector.tsx:218`), không preview cấu trúc A/B của preset ngoài chip.

**Bằng chứng UX:** tạo `Số lượng × Đơn giá` thành công, nhưng muốn thay operand đầu phải xóa ngược hoặc làm lại toàn bộ. Với nhân viên mới, đây là thao tác dễ mắc lỗi và khó hiểu hơn spreadsheet/formula builder quen thuộc.

**Đề xuất:** editor theo slot/block; mỗi token có menu thay/xóa; cho chèn tại caret; ô nhập hằng số; Undo/Redo riêng cho công thức; template mô tả bằng câu “Thành tiền = Số lượng × Đơn giá”; preview kết quả và đơn vị ngay trong từng bước.

#### P1-06 — Desktop 1280–1440 bị chật, làm giảm khả năng click và hiểu kéo thả

**Bằng chứng:** ảnh 1280/1440 cho thấy “Nhân viên bán”, “Chiết khấu”, “Tiền chiết khấu” và token formula bị cắt. Khi Playwright click nút field “Chiết khấu” ở 1440, thao tác timeout vì nút “Xóa trường” trong `.card-actions` chặn pointer. Source chỉ nâng span nhỏ lên 4 cột khi ≤1365 px (`src/index.css:153-158`), còn ở 1440 các span 2 chỉ còn khoảng 1/6 canvas. `.card-actions` đặt absolute bên phải (`src/index.css:168-178`) nên có thể che vùng tên.

**Đề xuất:** dùng breakpoint theo **chiều rộng canvas**, không theo viewport; đặt min-width card; chuyển canvas sang scroll ngang hoặc 6 cột khi ba panel cùng mở; action không được phủ nút chọn; ưu tiên overflow menu; tự tăng span tối thiểu cho label dài.

#### P1-07 — Danh sách phiếu chỉ giữ 20 bản và loại bỏ im lặng

Store dùng `slips: [slip, ...s.slips].slice(0, 20)` (`src/store/form.ts:241`). Không có cảnh báo hay backend. Với demo có thể chấp nhận, nhưng không đáp ứng lưu trữ nghiệp vụ hay khôi phục dài hạn.

**Đề xuất:** ghi rõ giới hạn demo; trong sản phẩm thật dùng backend/database, pagination và audit log; không cắt dữ liệu trên client.

### P2 — cải thiện trải nghiệm/chất lượng

#### P2-01 — Thông báo validation lặp lại cùng một nguyên nhân

Nhập `abc` vào Số lượng tạo 5 lỗi: bốn formula cùng báo thiếu Số lượng và thêm một lỗi Số lượng không hợp lệ. Điều này chính xác về kỹ thuật nhưng gây quá tải.

**Đề xuất:** nhóm theo root cause: một lỗi tại Số lượng, kèm “ảnh hưởng 4 kết quả”; focus vào input gốc.

#### P2-02 — Mobile có quá nhiều CTA “Lưu phiếu”

Ở 390 px có nút lưu tại header, sticky bottom và cuối card Tóm tắt. Sticky bar còn che nội dung tại vị trí cuộn hiện tại trong ảnh full-page.

**Đề xuất:** mobile chỉ giữ sticky CTA; ẩn nút header và nút trong summary hoặc thay bằng một CTA duy nhất theo trạng thái.

#### P2-03 — Thư viện mobile và palette desktop cắt nhãn/drag handle đè nội dung

Ảnh 390 cho thấy “Tự ghép công thức” bị cắt; ảnh 1280 cho thấy tay nắm sát/đè phần hint. Việc một card vừa bấm để thêm vừa có tay nắm nhỏ bên phải chưa tạo affordance rõ cho nhân viên mới.

**Đề xuất:** mobile dùng một cột cho formula; tách rõ CTA “Thêm” và vùng drag; cho phép kéo cả card; thêm tooltip/coachmark ngay lần kéo đầu.

#### P2-04 — Trạng thái lưu cấu hình chưa minh bạch

Header luôn hiện “Đã lưu trên trình duyệt này”. Dù Zustand persist gần như tức thời, copy không cho biết phạm vi chỉ-local, thời điểm lưu, hoặc rủi ro xóa cache/mở thiết bị khác.

**Đề xuất:** “Đã tự lưu cục bộ lúc HH:mm”, tooltip “không đồng bộ thiết bị”; khi có backend đổi thành Saved/Saving/Error thực.

#### P2-05 — Cảnh báo build/console và hiệu năng tải trang

- 404 `favicon.ico` lúc mở đầu.
- Hai cảnh báo React Router future flags.
- Build cảnh báo chunk >500 kB; `exceljs` khoảng 938 kB trước gzip và bundle Báo cáo khá lớn.

**Đề xuất:** thêm favicon; bật future flags sau kiểm thử; tiếp tục lazy-load export libraries/route và tách vendor chunk.

## 5. Đánh giá riêng Formula Builder

### Điểm tốt

- Màu tím phân biệt rõ trường hệ thống tự tính.
- Preset có mô tả A × B, A + B, A − B, tỷ lệ và VAT.
- Slot “chọn trường” giúp người mới hiểu còn thiếu operand.
- Chẩn đoán realtime cho empty, missing slot, operator, ngoặc, missing reference, cycle, chia 0 và input thiếu.
- Không dùng `eval`/`new Function`; parser recursive-descent và unit test tốt.
- Có preview kết quả ngay trong card và Inspector.

### Điểm chưa trực quan cho nhân viên mới

- Hai khái niệm “Cách 1” và “Tự ghép nâng cao” chưa thành wizard; sau khi chọn preset người dùng vẫn phải tự biết mở phần nâng cao để lấp A/B.
- Chip chỉ hiển thị kết quả cuối; không có ô A/B được gắn nhãn hay hướng dẫn “bước tiếp theo”.
- Không sửa trực tiếp token giữa công thức; sai một bước thường phải xóa ngược nhiều lần.
- Không có kiểu kết quả/đơn vị, dẫn tới ratio hiển thị bằng tiền.
- Không có input hằng số tùy ý, hàm điều kiện, so sánh, làm tròn hoặc null handling.
- Cho tham chiếu formula khác nhưng chỉ báo cycle sau khi đã tạo, chưa ngăn lựa chọn gây vòng lặp.
- Ở 1280/1440, panel 320 px và canvas hẹp làm token wrap mạnh, khó đọc toàn biểu thức.

**Kết luận Formula Builder:** engine và diagnostics **khá tốt**, nhưng UX editor chỉ ở mức prototype. Nhân viên mới có thể dùng preset đơn giản sau hướng dẫn, chưa phù hợp tự xây công thức phức tạp hoặc tự sửa lỗi.

## 6. Đánh giá riêng kéo thả

### PASS

- Kéo từ palette vào field cụ thể chèn đúng index.
- Kéo field để reorder hoạt động và persist sau reload.
- Có DragOverlay, opacity field đang kéo, đường “Thả tại đây”.
- Có phương án không cần kéo: bấm để thêm, nút Di chuyển lên/xuống.
- Có aria-label cho tay nắm và KeyboardSensor trong source.

### Vấn đề UX

- Tay nắm palette chỉ rộng khoảng 28 px, nhỏ và sát hint.
- Ở desktop hẹp, action absolute che vùng chọn field; thao tác click thực tế đã bị nút Xóa intercept.
- Mobile vẫn hiển thị tay nắm nhưng không hướng dẫn gesture/touch; label nhỏ bị cắt ở các field 1/3 dòng.
- Chưa có vùng drop rỗng giữa hàng đủ lớn; với form dài, kéo tới cuối cần auto-scroll rõ ràng hơn.
- Không có Undo riêng cho reorder; chỉ delete/replace có undo state.

**Kết luận kéo thả:** chức năng lõi **PASS**, nhưng tính trực quan chỉ ở mức trung bình. Phương án click-to-add và nút lên/xuống đang cứu trải nghiệm nhiều hơn chính thao tác kéo ở viewport chật.

## 7. Nghiệp vụ còn thiếu

1. Trạng thái phiếu: draft/submitted/cancelled; hiện save chỉ tạo record “Chờ duyệt”.
2. Required/optional, permission theo vai trò, người tạo/người sửa, timestamp nghiệp vụ.
3. Mã phiếu từ backend, uniqueness/idempotency và xử lý đồng thời nhiều người dùng.
4. Validation theo loại trường và cross-field rule.
5. Cấu hình option cho select, nguồn nhân sự, timezone/date format.
6. Result type/precision/rounding/currency cho công thức.
7. Versioning form và công thức: phiếu cũ phải gắn với version schema/công thức lúc lưu.
8. Audit trail thay đổi form, giá trị và công thức.
9. Lifecycle “Lưu xong → tạo phiếu mới/sao chép/chỉnh sửa” rõ ràng.
10. Backend sync, lỗi mạng, retry, conflict và khôi phục khi localStorage bị xóa.
11. Quy tắc xóa field đang được dùng: chặn, thay tham chiếu, hoặc migration dữ liệu cũ.
12. Giới hạn dữ liệu và retention; hiện chỉ giữ 20 phiếu cục bộ.

## 8. Thứ tự cải tiến đề nghị

1. **P0:** xây validation schema nghiệp vụ và chặn dữ liệu âm/sai/trống trước save, report và export.
2. **P0:** thiết kế submit idempotent; không cho lưu lại cùng draft sau reload/chờ thời gian.
3. **P1:** triển khai renderer/config thật cho date/select/person và gán business role rõ ràng.
4. **P1:** đồng bộ layout Builder → Entry; xử lý canvas desktop 1280–1440 và pointer overlap.
5. **P1:** nâng Formula Builder thành editor theo slot/token, có result type, precision và hằng số tùy ý.
6. **P1:** chuyển lưu trữ phiếu sang backend/versioned schema; bỏ cắt 20 bản im lặng.
7. **P2:** gom lỗi theo nguyên nhân, tinh gọn CTA mobile, cải thiện coachmark kéo thả và trạng thái autosave.
8. **P2:** dọn console/build warnings và tối ưu chunk.

## 9. Tiêu chí nghiệm thu lại sau khi sửa

- Không thể lưu nếu customer/staff/product/date trống hoặc date không hợp lệ.
- Không thể lưu quantity ≤ 0, unit price < 0, discount ngoài 0–100, VAT/total âm trừ khi có nghiệp vụ ngoại lệ được cấu hình rõ.
- Một draft/payload chỉ tạo một phiếu dù double-click, chờ lâu, reload hoặc mở hai tab.
- Date/select/person có control và validation đúng loại.
- Form dựng mới từ form trống có thể map đầy đủ role báo cáo mà không dựa vào label heuristic.
- Formula có kiểu kết quả và precision; ratio không hiển thị ₫.
- Có thể thay/xóa/chèn token ở mọi vị trí và undo/redo.
- Layout 1440, 1280, 768, 390 không cắt nhãn quan trọng, không có action che hit target, không tràn ngang.
- Layout/span/reorder trong Builder phản ánh đúng màn nhập hoặc được định nghĩa rõ là hai layout khác nhau.
- Phiếu hợp lệ persist sau reload và xuất hiện đúng một lần trong Báo cáo; phiếu không hợp lệ không thể đi sang report/export.

