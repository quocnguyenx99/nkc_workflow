# Kế hoạch cải tiến UI/UX `/nhap-lieu`

## 1. Nguyên nhân thực tế

- `AppShell` dùng `flex-wrap` cùng flex-basis lớn, làm content bị đẩy xuống dưới sidebar quanh 1024px.
- `BuilderWorkspace` dùng `items-stretch`; palette dài ép canvas và inspector cùng chiều cao, tạo document scrolling.
- Palette không có chiều cao giới hạn. Inspector có `overflow-y-auto` nhưng parent không có chiều cao xác định nên không tạo vùng cuộn độc lập.
- Nền chấm được gắn vào toàn cột giữa nên kéo dài theo cột dài nhất thay vì chiều cao thực của form.
- Banner hướng dẫn nằm trong normal flow và chiếm hơn 100px chiều cao thao tác.
- Breakpoint theo viewport không tính phần diện tích đã bị sidebar chiếm hoặc thay đổi do zoom trình duyệt.

## 2. Phương án bố cục

- Dùng fixed workspace từ 768px trở lên: app cao `100dvh`, header/guide không co, phần builder nhận toàn bộ chiều cao còn lại.
- Palette, canvas và inspector có `min-height: 0`, `overflow-y: auto`, `overscroll-behavior: contain` và cuộn độc lập.
- Dùng container query theo chiều rộng thực của builder. Chỉ hiện ba cột `244px minmax(720px, 1fr) 340px` khi workspace rộng ít nhất 1280px.
- Nếu không đủ chỗ, canvas chiếm toàn bộ workspace; palette và inspector mở bằng drawer. Vì sidebar chiếm khoảng 210px, các viewport 1280–1440px mặc định dùng drawer.
- Dưới 768px dùng document flow; palette và inspector là sheet toàn màn hình, thêm trường bằng chạm là thao tác chính.

## 3. Canvas, hướng dẫn và kéo thả

- Canvas cao theo nội dung nhưng có chiều cao tối thiểu `clamp(420px, 55vh, 640px)`; mobile tối thiểu 360px.
- Nền chấm chỉ bao quanh canvas surface, không kéo dài theo palette/inspector.
- Cuối form có drop zone 64px để thả trường vào cuối hoặc mở thư viện.
- Giữ DndContext, pointer/keyboard sensors và DragOverlay hiện tại; đo lại droppable khi kéo và chỉ auto-scroll palette/canvas.
- Drawer palette không đóng khi bắt đầu kéo, không chặn hit testing canvas và chỉ đóng sau khi thả thành công.
- Inspector có sticky header và auto-scroll cục bộ khi kéo token công thức; không làm cuộn body hoặc canvas.
- Thanh hướng dẫn thu còn một dòng 42–52px; nội dung đầy đủ mở trong popover/bottom sheet.

## 4. Component điều chỉnh

- `AppShell`: CSS Grid, chế độ `document | workspace`, loại bỏ phụ thuộc vào min-height giả.
- `NhapLieuPage`: dùng workspace layout ở chế độ thiết kế, document layout ở chế độ nhập phiếu.
- `BuilderWorkspace`: container query, drawer thích ứng, canvas auto-height và scroll panes độc lập.
- `Palette`: vùng cuộn độc lập, giữ cả click-to-add và drag-to-add.
- `Inspector`: sticky header, scroll body và formula token auto-scroll.
- `FirstRunJourney`: progress strip gọn và popover chi tiết.

## 5. Thứ tự triển khai

1. P0: sửa AppShell, chuỗi chiều cao, overflow và canvas surface.
2. P0: áp dụng container query, bảo đảm canvas không hẹp dưới 720px.
3. P1: drawer palette/inspector, focus, Escape và drag từ drawer.
4. P1: Formula Builder scrolling và token drag trong inspector.
5. P2: guide thu gọn, sticky controls và responsive polish.

## 6. Tiêu chí nghiệm thu

- Kiểm tra 1920×1080, 1600×900, 1440×900, 1366×768, 1280×800, 1280×720, 1024×768, 768×800 và 390×844; kiểm tra thêm 1440×900 ở zoom 125%.
- Ba cột chỉ xuất hiện khi canvas còn tối thiểu 720px; 1280–1440px dùng drawer nếu không đủ chỗ.
- Từ 768px trở lên, Form Builder không tạo body scroll; ba pane cuộn độc lập và không có horizontal overflow.
- Màn hình thấp vẫn truy cập được mọi nút bằng scrolling trong đúng pane.
- Kéo field vào đầu/giữa/cuối form, reorder, auto-scroll, Escape và keyboard drag hoạt động.
- Formula Builder kéo token và cuộn inspector mà không cuộn cả trang.
- Không thay đổi schema `oneflow-form`, Formula Engine, nghiệp vụ hoặc dữ liệu đã lưu.
