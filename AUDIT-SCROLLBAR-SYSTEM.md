# AUDIT SCROLLBAR TOÀN HỆ THỐNG NKC WORKFLOW

**Ngày rà soát:** 16/10/2026  
**Phạm vi runtime:** `oneflow-handoff/src`, các route `/`, `/nhap-lieu`, `/bao-cao`, `/giao-dien`  
**Nguyên tắc:** Chỉ đọc source và kiểm tra trình duyệt; không sửa CSS, component, layout, dữ liệu hay cơ chế scrolling.

## 1. Kết luận nhanh

- Tìm thấy **8 scroll container được ứng dụng khai báo rõ ràng** bằng `overflow-auto`, `overflow-x-auto`, `overflow-y-auto` hoặc CSS tương đương.
- Nếu tính thêm **document viewport** và **textarea cuộn native của trình duyệt**, toàn hệ thống có **10 cơ chế/vị trí có khả năng sinh scrollbar**.
- Có thêm **1 khai báo `overflow-x: auto` trong file prototype** `design/BaoCaoV2.dc.html`; file này không nằm trong cây runtime React nên không tính vào tổng 8 container của ứng dụng.
- Không tìm thấy `overflow-scroll` trong runtime.
- Tất cả scrollbar nhìn thấy hiện nay vẫn dùng giao diện mặc định của trình duyệt/hệ điều hành: kiểm tra computed style cho kết quả `scrollbar-width: auto`, `scrollbar-color: auto`, WebKit width/height `auto`.
- Riêng thanh điều hướng trong `AppSidebar` đặt `scrollbar-width: none` ở màn hình `<= 900px`. Cách này chỉ che scrollbar theo cơ chế chuẩn/Firefox; không có rule WebKit tương ứng, vì vậy hành vi có thể khác nhau giữa Firefox và Chrome/Edge.
- Bộ class mong muốn `scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400` **chưa được hỗ trợ trong cấu hình hiện tại**. Dự án dùng Tailwind CSS `4.1.4` qua `@tailwindcss/vite`, nhưng không cài hoặc đăng ký `tailwind-scrollbar`/plugin tương đương.
- Không phát hiện scrollbar thừa đang hiển thị tại dữ liệu kiểm thử hiện tại. Có các vùng khai báo `auto` nhưng chưa overflow; đây là dự phòng responsive/hay nội dung dài, không phải lỗi.
- Không phát hiện hai scrollbar dọc lồng nhau cùng hiển thị trong workspace desktop. Form Builder, canvas và inspector là ba pane song song; Formula Builder dùng chung thanh cuộn của inspector, không tạo thêm scrollbar con.

## 2. Phương pháp và bằng chứng

### 2.1 Quét source

Đã quét toàn workspace, loại trừ `node_modules`, `dist`, output kiểm thử và tài liệu audit, với các nhóm từ khóa:

- `overflow-auto`, `overflow-x-auto`, `overflow-y-auto`, `overflow-scroll`
- `overflow: auto|scroll`, `overflow-x/y: auto|scroll`
- `scrollbar-width`, `scrollbar-color`, `scrollbar-gutter`, `::-webkit-scrollbar`
- Các lệnh cuộn chủ động: `scrollIntoView`, `scrollBy`, `window.scrollTo`

Các khai báo `overflow-hidden`/`overflow-visible` cũng được rà soát để tránh nhầm vùng cắt nội dung thành scroll container. Chúng không được tính vào tổng số.

### 2.2 Kiểm tra trình duyệt

Kiểm tra trực tiếp bằng Chromium tại các kích thước đại diện `1600×900`, `1440×900`, `768×800`, `390×844` và một tình huống màn hình thấp `390×500`. Với mỗi route, đo:

- `clientWidth/clientHeight`
- `scrollWidth/scrollHeight`
- computed `overflow-x/overflow-y`
- computed `scrollbar-width`, `scrollbar-color`
- trạng thái pane/drawer đang hiển thị hay ẩn

Quy ước trong báo cáo:

- **Khai báo:** element có cơ chế cuộn `auto/scroll` trong CSS/runtime.
- **Phát sinh thực tế:** `scrollWidth > clientWidth` hoặc `scrollHeight > clientHeight` tại tình huống kiểm thử.

## 3. Tổng số và danh sách scroll container

### 3.1 Tám container do ứng dụng khai báo

| # | Nhóm | Vị trí/component | Source | Kiểu cuộn | Khi nào hoạt động | Style hiện tại | Trạng thái |
|---:|---|---|---|---|---|---|---|
| 1 | Sidebar | Danh sách navigation của `AppSidebar` | `src/components/app/AppShell.tsx:61` | Ngang, `<=900px` | Khi tổng chiều rộng item vượt vùng nav | Native; `scrollbar-width:none` | **Chưa đồng bộ** và khác hành vi Firefox/WebKit |
| 2 | Header | `AppHeader` actions | `src/components/app/AppShell.tsx:106`; override `src/index.css:483-487` | Ngang ở `641–900px`; `visible` ở `<=640px` | Khi action dài hơn header | Native | **Chưa đồng bộ** |
| 3 | Báo cáo | Thanh “Tiến trình báo cáo” | `src/pages/BaoCaoPage.tsx:60` | Ngang | Phát sinh ở mobile hẹp | Native | **Chưa đồng bộ** |
| 4 | Bảng dữ liệu | Wrapper bảng “Chi tiết phiếu bán hàng” | `src/components/bao-cao/Panels.tsx:26` | Ngang | Bảng có `min-width:760px`, phát sinh dưới khoảng 760px nội dung | Native | **Chưa đồng bộ** |
| 5 | Form Builder / drawer | Thư viện trường `.builder-palette` | `src/index.css:123-133` | Dọc | Pane desktop hoặc drawer tablet/mobile có nội dung dài | Native + `scrollbar-gutter:stable` | **Chưa đồng bộ** |
| 6 | Form Builder | Canvas `.builder-canvas-pane` | `src/index.css:134-144` | Hai chiều theo CSS `overflow:auto`; thực tế hiện chỉ dọc | Desktop/tablet có workspace cố định; mobile chuyển `overflow:visible` | Native + `scrollbar-gutter:stable` | **Chưa đồng bộ** |
| 7 | Inspector / Formula Builder / drawer | `.inspector-panel` | `src/index.css:183-193` | Dọc | Thuộc tính/công thức dài; desktop pane hoặc drawer | Native + `scrollbar-gutter:stable` | **Chưa đồng bộ** |
| 8 | Hướng dẫn | `.first-run-popover` ở mobile | `src/index.css:471-480` | Dọc | Nội dung vượt `calc(100dvh - 20px)` | Native | **Chưa đồng bộ**; chưa overflow với nội dung hiện tại |

### 3.2 Hai cơ chế bổ sung

| # | Nhóm | Vị trí | Source/nguồn | Hành vi |
|---:|---|---|---|---|
| 9 | Scrollbar trang | Document viewport (`html`) | Cơ chế trình duyệt; `AppShell` document-flow | Có scrollbar dọc ở `/`, `/giao-dien`, `/bao-cao` và `/nhap-lieu` mobile. `/nhap-lieu` desktop workspace không cuộn body. |
| 10 | Form control native | Textarea ghi chú trong `ApprovalTimeline` | `src/components/bao-cao/Panels.tsx:134` | Trình duyệt tính `overflow:auto`; chỉ hiện scrollbar khi ghi chú vượt chiều cao textarea. |

### 3.3 Artifact không thuộc runtime

`oneflow-handoff/design/BaoCaoV2.dc.html:156` có `overflow-x:auto`. Đây là prototype tham chiếu, không được import hoặc render bởi ứng dụng React hiện tại, vì vậy không cộng vào tổng runtime. Nếu prototype này tiếp tục được dùng để review độc lập, nó cũng nên dùng cùng token scrollbar sau này.

## 4. Kết quả kiểm tra thực tế

### 4.1 `/nhap-lieu`

| Viewport/trạng thái | Document | Scrollbar thực tế | Bằng chứng kích thước |
|---|---|---|---|
| `1600×900`, 3 cột | Không cuộn; `1600×900` | Palette dọc, canvas dọc, inspector dọc | Palette `752→1095px`; canvas `752→1041px`; inspector `752→1420px` |
| `1440×900`, drawer đóng | Không cuộn | Canvas dọc | Canvas `752→953px` |
| `1440×900`, mở palette drawer | Không cuộn | Palette drawer dọc + canvas dọc phía sau | Palette `689→927px`; canvas `752→953px` |
| `1440×900`, mở inspector drawer | Không cuộn | Inspector drawer dọc + canvas dọc phía sau | Inspector `752→1358px`; canvas `752→953px` |
| `390×844`, drawer đóng | Trang cuộn dọc | Chỉ document | Document `844→2154px`; canvas chuyển `overflow:visible` đúng responsive |
| `390×844`, mở palette drawer | Trang tồn tại phía sau; drawer phủ toàn màn hình | Palette drawer dọc | Palette `781→927px` |

Nhận xét:

- Ba pane desktop cuộn độc lập đúng chủ đích; không phải scrollbar lồng nhau.
- Drawer tái sử dụng chính `.builder-palette`/`.inspector-panel`, nên chỉ cần chuẩn hóa hai selector này là bao phủ cả desktop và drawer.
- Formula Builder không có scrollbar riêng. Nó nằm trong `.inspector-panel`; logic drag token tại `src/components/nhap-lieu/Inspector.tsx:66-67` gọi `panelRef.current.scrollBy(...)`, do đó style phải gắn vào inspector để thanh cuộn khi auto-scroll và thanh cuộn khi người dùng cuộn là một.
- `overscroll-behavior:contain` đã có ở palette, canvas và inspector, giúp hạn chế scroll chaining sang trang. Không nên bỏ khi chỉ đổi giao diện scrollbar.

### 4.2 `/bao-cao`

| Viewport | Document | Scrollbar nội bộ thực tế | Bằng chứng |
|---|---|---|---|
| `1440×900` | Cuộn dọc, document cao `1760px` | Không có inner scrollbar thực tế | Progress `462/462px`; table `760/760px` |
| `768×800` | Cuộn dọc, document cao `2883px` | Bảng cuộn ngang | Table `702→760px`; nav/header/progress chưa overflow |
| `390×844` | Cuộn dọc, document cao `3903px` | Progress ngang và bảng ngang | Progress `324→462px`; table `324→760px` |

Textarea của luồng phê duyệt có computed `overflow:auto` nhưng nội dung hiện tại vừa khung (`268×59px` cả client/scroll), nên chưa sinh scrollbar.

### 4.3 `/` và `/giao-dien`

- `/` tại `1440×900`: chỉ document cuộn dọc, chiều cao nội dung đo được `4503px`; không có inner element computed `overflow:auto/scroll`.
- `/giao-dien` tại `1440×900`: chỉ document cuộn dọc, chiều cao nội dung đo được `1212px`; các `overflow-hidden` trong mockup chỉ cắt khung, không sinh scrollbar.

### 4.4 Các vùng khai báo nhưng chưa sinh scrollbar trong dữ liệu hiện tại

- AppSidebar nav tại `390px` và `768px`: nội dung vừa khung; vẫn là scroll container dự phòng.
- AppHeader actions tại `768px`: `736/736px`, chưa overflow. Ở `<=640px`, CSS chuyển về wrap + `overflow-x:visible`.
- First-run popover tại `390×844` và `390×500`: nội dung cao `194px`, chưa chạm `max-height`; scrollbar chỉ xuất hiện khi nội dung/dịch/zoom dài hơn.
- Progress bar báo cáo ở desktop/tablet vừa khung; chỉ overflow tại mobile hẹp.

## 5. Vấn đề và mức độ ưu tiên

### P1 — Chưa có chuẩn scrollbar chung

Không có CSS token, utility hoặc component class dùng chung. Màu, độ dày và hover hiện phụ thuộc Chrome/Edge/Firefox và thiết lập hệ điều hành. Đây là nguyên nhân chính khiến không đáp ứng bộ tiêu chuẩn mong muốn.

### P1 — Sidebar ẩn scrollbar không nhất quán giữa browser

`[scrollbar-width:none]` chỉ là một nửa của giải pháp ẩn đa trình duyệt: không có `::-webkit-scrollbar { display:none }`. Khi nav thực sự overflow, Firefox có thể không hiển thị dấu hiệu cuộn trong khi Chrome/Edge vẫn dùng cách thể hiện native tùy phiên bản/hệ điều hành. Nó cũng làm giảm khả năng nhận biết còn nội dung ở phía ngang.

### P1 — Các vùng cuộn quan trọng dùng native style

Palette, canvas, inspector/Formula Builder, bảng báo cáo và progress đều có scrollbar thao tác trực tiếp nhưng chưa dùng gray-300/gray-100/gray-400. Đây là các vị trí cần ưu tiên chuẩn hóa trước.

### P2 — Các ngữ cảnh cuộn kết hợp

- `/bao-cao` mobile có document cuộn dọc và hai vùng con cuộn ngang. Đây là nesting khác trục, hợp lý cho bảng và tiến trình, nhưng cần style đồng nhất để người dùng nhận ra có thể kéo ngang.
- `/nhap-lieu` mobile có document cuộn phía sau drawer cố định; drawer cuộn dọc và đã có `overscroll-behavior:contain`. Không thấy hai thanh dọc cùng hiển thị trên một mặt phẳng, nhưng vẫn cần kiểm tra wheel/touch ở mép drawer sau khi đổi style.
- First-run popover là vùng dọc nằm trên trang dọc; chưa overflow trong dữ liệu hiện tại nhưng có thể tạo scroll context lồng nhau khi nội dung dài hoặc zoom lớn.

### P2 — Thiếu dấu hiệu cho overflow ngang bằng bàn phím/touch

Các wrapper report không có class scrollbar thống nhất và không có quy ước focus riêng cho vùng cuộn. Đây không phải lỗi logic scroll, nhưng khi thanh cuộn overlay tự ẩn trên macOS/Windows, khả năng nhận biết nội dung bên phải thấp.

## 6. Đánh giá khả năng dùng các class Tailwind yêu cầu

Chuỗi mong muốn:

```text
scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400
```

Kết luận: **không thể dùng trực tiếp với dependencies/config hiện tại**. `package.json` không có `tailwind-scrollbar`, `tailwind-scrollbar-hide` hay plugin scrollbar khác; source cũng không đăng ký plugin. Arbitrary property như `[scrollbar-width:none]` hoạt động vì là cú pháp lõi của Tailwind, nhưng không đồng nghĩa các utility `scrollbar-thumb-*` tồn tại.

Không khuyến nghị thêm dependency chỉ để tạo bốn rule đơn giản. Giải pháp CSS dùng chung phù hợp hơn với kiến trúc hiện tại, giảm phụ thuộc và kiểm soát chính xác Chrome/Edge/Firefox.

## 7. Phương án chuẩn hóa đề xuất

### 7.1 Một utility dùng chung, token tập trung

Tạo một utility semantic, ví dụ `.system-scrollbar`, trong `src/index.css` và định nghĩa màu qua CSS variables:

```css
:root {
  --scrollbar-track: #f3f4f6;       /* gray-100 */
  --scrollbar-thumb: #d1d5db;       /* gray-300 */
  --scrollbar-thumb-hover: #9ca3af; /* gray-400 */
}

.system-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: var(--scrollbar-thumb) var(--scrollbar-track);
}

.system-scrollbar::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.system-scrollbar::-webkit-scrollbar-track {
  background: var(--scrollbar-track);
}

.system-scrollbar::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb);
  border-radius: 999px;
}

.system-scrollbar::-webkit-scrollbar-thumb:hover {
  background: var(--scrollbar-thumb-hover);
}
```

Áp dụng có kiểm soát cho `html`, các container rõ chủ đích và textarea. Không khuyến nghị selector toàn cục `*::-webkit-scrollbar`, vì có thể ảnh hưởng chart, control native, widget bên thứ ba hoặc scroll container mới chưa được review.

### 7.2 Mapping áp dụng

| Đích | Cách áp dụng đề xuất |
|---|---|
| Document viewport | Gắn cùng property cho `html` hoặc class root ứng dụng |
| AppSidebar nav | Bỏ `[scrollbar-width:none]`, thêm `.system-scrollbar` để có affordance nhất quán |
| AppHeader actions | Thêm `.system-scrollbar`; giữ nguyên breakpoint và wrap hiện tại |
| Report progress/table | Thêm `.system-scrollbar`; không đổi `overflow-x-auto`, min-width bảng hay layout |
| Palette/canvas/inspector | Có thể thêm selector này vào nhóm `.system-scrollbar` ngay trong CSS hoặc gắn class tại component; giữ nguyên `scrollbar-gutter`/`overscroll-behavior` |
| First-run popover | Áp dụng style chung; giữ nguyên `max-height` và `overflow-y:auto` |
| Approval textarea | Áp dụng style chung cho textarea cụ thể hoặc utility reusable cho form control có nội dung dài |

### 7.3 Tương thích browser

- **Firefox:** `scrollbar-width:thin` và `scrollbar-color` cung cấp độ dày/màu track-thumb.
- **Chrome/Edge:** `::-webkit-scrollbar*` cung cấp width/height, track, thumb và hover; các browser Chromium mới cũng hiểu một phần chuẩn CSS Scrollbars.
- Firefox không có pseudo-element chuẩn để đổi màu **chỉ riêng thumb khi hover** giống WebKit. Có thể giữ thumb gray-300 ổn định trên Firefox; không nên giả lập bằng cách đổi màu khi hover cả container vì trạng thái đó không tương đương hover thanh kéo.
- Hệ điều hành dùng overlay scrollbar có thể chỉ hiện thanh trong lúc cuộn; CSS không nên ép thay đổi cơ chế native này.

## 8. Danh sách file cần chỉnh sửa ở bước triển khai sau

Tối thiểu:

1. `oneflow-handoff/src/index.css` — khai báo token/utility chung; áp dụng cho document, builder classes và first-run popover.
2. `oneflow-handoff/src/components/app/AppShell.tsx` — thay rule ẩn sidebar và gắn utility cho sidebar/header actions.
3. `oneflow-handoff/src/pages/BaoCaoPage.tsx` — gắn utility cho progress.
4. `oneflow-handoff/src/components/bao-cao/Panels.tsx` — gắn utility cho bảng ngang và textarea.

Tùy cách tổ chức class, có thể cần chạm thêm `Palette.tsx`, `BuilderWorkspace.tsx` hoặc `Inspector.tsx`; tuy nhiên không cần nếu style chung mở rộng trực tiếp các selector semantic `.builder-palette`, `.builder-canvas-pane`, `.inspector-panel`. Không cần sửa Formula Engine, store, schema hay dữ liệu.

File prototype `design/BaoCaoV2.dc.html` chỉ cần cập nhật nếu nhóm vẫn dùng nó như artifact review độc lập; không ảnh hưởng sản phẩm runtime.

## 9. Rủi ro khi triển khai

- Chuyển scrollbar native sang `thin` có thể thay đổi vài pixel không gian khả dụng, đặc biệt tại các pane đang dùng `scrollbar-gutter:stable`; cần visual regression để chắc chắn card/grid không wrap khác.
- Hiện scrollbar cho sidebar thay vì `none` có thể tăng chiều cao cảm nhận của thanh nav tại breakpoint hiếm khi overflow. Cần kiểm tra nội dung dài, bản dịch và zoom.
- Horizontal scrollbar 8px trên touch device vẫn chủ yếu dùng swipe; không được làm giảm vùng touch hoặc chặn gesture.
- Forced-colors/high-contrast mode có thể ghi đè màu tùy chỉnh. Không nên tắt khả năng ghi đè của hệ điều hành.
- Firefox không thể khớp 100% trạng thái thumb-hover của WebKit; đây là giới hạn nền tảng, không phải lỗi triển khai.
- Không được thay `overflow`, `height`, `overscroll-behavior`, `scrollbar-gutter`, logic drawer hay logic `scrollBy`; phạm vi thay đổi chỉ là skin scrollbar.

## 10. Kế hoạch kiểm thử sau khi thay đổi

### 10.1 Static/regression

- Kiểm tra không còn scroll container runtime nào thiếu `.system-scrollbar` hoặc selector tương đương.
- Thêm test xác nhận các container đích vẫn giữ nguyên `overflow-x/y`, `overscroll-behavior` và breakpoint.
- Chạy unit test, E2E hiện có và production build.

### 10.2 Browser và responsive

Kiểm tra trên Chrome, Edge và Firefox tại tối thiểu:

- `1920×1080`, `1600×900`, `1440×900`, `1366×768`, `1280×800`, `1280×720`
- `1024×768`, `768×800`, `390×844`
- `1440×900` zoom 125%
- Màn hình thấp và nội dung Formula Builder dài

Cho từng viewport cần xác minh:

1. Document không xuất hiện scrollbar ngang ngoài ý muốn.
2. Palette, canvas, inspector/drawer vẫn cuộn độc lập và auto-scroll khi drag giữ nguyên.
3. Formula Builder kéo token gần mép inspector vẫn gọi đúng pane scroll, không kéo document.
4. Report progress và table cuộn ngang được bằng wheel/trackpad/touch/keyboard.
5. First-run popover và textarea chỉ xuất hiện scrollbar khi nội dung thực sự vượt khung.
6. Track `gray-100`, thumb `gray-300`, hover `gray-400` trên Chrome/Edge; Firefox có thin + gray-300/gray-100 tương đương.
7. Focus, forced-colors, zoom và overlay scrollbar không che sticky header/nút hành động.

## 11. Phạm vi không thay đổi

Báo cáo này không thay đổi source code, CSS, layout, responsive, drag & drop, Formula Builder/Formula Engine, dữ liệu hoặc cơ chế cuộn hiện có. Chỉ file báo cáo được tạo mới.
