# AUDIT UI/UX & MOTION — HOME NKC WORKFLOW

**Ngày audit:** 17/10/2026  
**Trang:** `/` — Home NKC OneFlow  vvvvvvvvvvvvvvvvvvvvvvvv
**Phạm vi:** source React/Tailwind/Motion, giao diện thực tế desktop/tablet/mobile, visual hierarchy, interaction, motion, responsive, accessibility và hiệu năng liên quan trực tiếp đến Home.  
**Nguyên tắc:** chỉ audit và lập định hướng; chưa thay đổi source, business logic hoặc hành vi điều hướng.

## 1. Kết luận điều hành

Home hiện tại là một landing page **sạch, dễ hiểu và có cấu trúc nội dung tốt**. Hero nói đúng bài toán, CTA rõ, thông tin nghiệp vụ bám sát luồng Nhập liệu → Tính toán → Báo cáo → Phê duyệt, responsive không tràn ngang ở các viewport đã kiểm tra. Đây là nền tảng tốt để redesign mà không cần phá cấu trúc sản phẩm.

Khoảng cách lớn nhất so với mục tiêu “Premium High-tech SaaS / Futuristic / Motion-driven UI” nằm ở ba điểm:

1. **Sản phẩm đang được mô tả bằng card tĩnh thay vì được trình diễn như một hệ thống đang vận hành.** Workflow Preview có dữ liệu thật và đúng ngữ cảnh nhưng chỉ là bốn hàng tĩnh, không có dòng dữ liệu, trạng thái chuyển bước, kết quả tính toán hay quan hệ giữa các phòng ban.
2. **Motion chưa thành hệ thống.** Gần như mọi section dùng chung `Reveal`: opacity 0 → 1 và `y: 18 → 0`; card chỉ nâng 3 px khi hover; background đứng yên; CTA và navigation gần như không có micro-interaction.
3. **Ngôn ngữ visual thiên về landing page SaaS sáng, an toàn và pastel**, chưa tạo cảm giác “operational control plane” có chiều sâu, độ chính xác và năng lượng kỹ thuật. Dotted grid, gradient xanh/tím và card trắng đang làm nền trang nhã, nhưng chưa đủ khác biệt để tạo WOW.

**Đánh giá tổng thể:** nền tảng UI hiện tại tốt ở mức prototype/marketing demo, nhưng **chưa đạt định vị premium high-tech và motion-rich**. Nên giữ information architecture, copy nghiệp vụ và routes; redesign mạnh cách trình diễn, chiều sâu không gian, nhịp trang và hệ thống motion.

## 2. Cơ sở và phương pháp rà soát

### Source đã đọc

- `oneflow-handoff/src/pages/HomePage.tsx` — toàn bộ Home, 533 dòng.
- `oneflow-handoff/src/components/Reveal.tsx` — entrance animation dùng chung.
- `oneflow-handoff/src/index.css` — tokens, background, card hover, responsive và reduced motion.
- `oneflow-handoff/src/App.tsx` — routing, scroll manager, `MotionConfig reducedMotion="user"`.
- `oneflow-handoff/index.html` — font Inter và JetBrains Mono từ Google Fonts.
- `oneflow-handoff/design/HomeV2.dc.html` — thiết kế gốc để đối chiếu mức độ bám thiết kế.
- `oneflow-handoff/package.json` — React 18, Tailwind v4, `motion` 11 và Lucide React đã có sẵn.

### Kiểm tra giao diện thực tế

- Chạy Vite tại `http://127.0.0.1:3000/` và kiểm tra bằng Chromium có giao diện thật.
- Viewport chính: **1440×1000, 768×1024 và 390×844**.
- Kiểm tra first viewport, toàn trang sau khi scroll, sticky navigation, mobile menu, anchor navigation, hover/reveal, horizontal overflow và reduced motion.
- Ở 390 px: `scrollWidth = 390`, không có tràn ngang; chiều dài trang khoảng **8.246 px**.
- Ở 768 px: không có tràn ngang; Hero xếp dọc hợp lý nhưng Workflow Preview bắt đầu ở gần cuối viewport.

### Kiểm tra kỹ thuật

- `npm run build`: **PASS**.
- Home route chunk: khoảng **26,46 kB / 7,31 kB gzip**; CSS toàn ứng dụng khoảng **52,24 kB / 10,91 kB gzip**. Route Home hiện nhẹ và đang được lazy-load.
- Console không có lỗi runtime chức năng. Có hai cảnh báo React Router v7 future flags và một 404 `favicon.ico` khi mở lần đầu; không chặn Home nhưng nên dọn trong đợt polish.
- `prefers-reduced-motion` đã có ở cả `MotionConfig` và CSS. Tuy nhiên các section ngoài viewport vẫn bị đặt `opacity: 0` cho tới khi Intersection Observer kích hoạt.

## 3. Bản đồ trải nghiệm hiện tại

| Khu vực | Vai trò hiện tại | Thành phần chính | Motion/interaction hiện tại |
|---|---|---|---|
| Navigation | Brand, anchor và route chính | Logo placeholder, 5 link, CTA demo, mobile menu | Sticky + blur; đổi màu link; menu mở/đóng bằng height/opacity |
| Hero | Value proposition và conversion | Eyebrow, H1, mô tả, 2 CTA, 3 benefit, Workflow Preview | Hai khối fade/slide; chấm “Đang chạy” pulse |
| Pain points | Nêu 3 vấn đề và lời giải | 3 card “trước/sau” | Reveal stagger; card nâng 3 px khi hover |
| Operating map | Giải thích liên kết phòng ban | Flow strip, bento 5 phòng ban, form mini | Reveal stagger; card hover chung |
| Process | Trình bày 4 bước | 4 card ngang | Reveal stagger; đường line tĩnh trong card |
| CTA | Chốt chuyển đổi | Panel navy + 2 CTA | Reveal; đổi background button |
| Footer | Kết thúc trang | Brand description, copyright | Không có |

## 4. Scorecard hiện trạng

| Tiêu chí | Điểm | Nhận định |
|---|---:|---|
| Information architecture | 8/10 | Mạch nội dung rõ: vấn đề → hệ thống → quy trình → CTA |
| Copy và tính đúng nghiệp vụ | 8/10 | Dùng dữ liệu, công thức và đối tượng đúng bối cảnh Workflow Automation |
| Visual hierarchy | 7/10 | H1/section heading tốt; các card phía dưới quá đồng cấp |
| Brand/premium perception | 5/10 | Sạch nhưng placeholder và visual pastel làm giảm độ hoàn thiện |
| Technical/futuristic character | 4/10 | Có grid, mono text và flow labels nhưng chưa thành ngôn ngữ hệ thống |
| Motion design | 3/10 | Chủ yếu một kiểu fade/slide, thiếu chuyển động có ý nghĩa |
| Micro-interaction | 4/10 | Hover/card/button rất cơ bản; không có trạng thái nội bộ |
| Responsive | 7/10 | Không vỡ layout; mobile quá dài và product proof xuống dưới fold |
| Accessibility nền tảng | 7/10 | Semantic/ARIA/focus/reduced-motion khá tốt; reveal ẩn nội dung cần sửa |
| Performance nền tảng | 8/10 | Home nhẹ, lazy route tốt; còn nhiều dư địa cho motion nếu kiểm soát |

## 5. Điểm đang làm tốt và nên giữ

### 5.1 Thông điệp sản phẩm rõ ngay từ đầu

H1 “Vận hành toàn doanh nghiệp trên một luồng dữ liệu duy nhất” nói đúng giá trị lõi. Hai CTA phân cấp tốt: trải nghiệm sản phẩm và xem báo cáo. Ba benefit ngay dưới CTA giúp giảm rủi ro nhận thức.

### 5.2 Workflow Preview dùng ngữ cảnh thật

Preview có dữ liệu cụ thể: số lượng, đơn giá, chiết khấu, tổng tiền, báo cáo và xuất file. Đây là chất liệu rất tốt cho motion; không cần thay bằng hình minh hoạ trừu tượng hoặc stock visual.

### 5.3 Cấu trúc nội dung có logic nghiệp vụ

Pain points, sơ đồ phòng ban và bốn bước vận hành bổ trợ nhau. Redesign nên **nén và liên kết** các phần này thành một câu chuyện dữ liệu liên tục, không loại bỏ nội dung cốt lõi.

### 5.4 Responsive cơ bản và accessibility có nền tảng

- Không có horizontal overflow ở 390 và 768 px.
- Mobile menu có `aria-label`, `aria-expanded` và vùng chạm 44 px.
- Focus ring toàn cục đã có.
- `MotionConfig reducedMotion="user"` và media query reduce đã tồn tại.
- Các CTA là link đúng semantic thay vì click handler trên `div`.

### 5.5 Hiệu năng Home đang thuận lợi

Home route nhẹ, không có canvas/WebGL/video nặng, đã dùng lazy routing. Có thể tạo trải nghiệm giàu motion bằng CSS/SVG và Motion hiện có mà không cần đưa thêm animation library lớn.

## 6. Vấn đề và cơ hội theo mức ưu tiên

### P1-01 — First impression chưa truyền đạt “hệ thống công nghệ đang chạy”

Hero hiện là bố cục landing page quen thuộc: text trái, card phải, nền chấm + radial gradient. Nó sạch nhưng gần với nhiều template SaaS phổ biến. Không có một chi tiết nhận diện đủ mạnh để người dùng nhớ NKC OneFlow sau lần đầu truy cập.

**Tác động:** thông điệp hiểu được nhưng cảm giác premium và WOW thấp; visual không chứng minh năng lực workflow automation mạnh như copy.

**Cơ hội:** biến toàn hero thành một “Operational Signal System”: dữ liệu được nhập, chạy qua công thức, phát tín hiệu tới dashboard và chờ duyệt ngay trong first viewport.

### P1-02 — Workflow Preview là minh hoạ tĩnh, chưa phải product storytelling

`HomePage.tsx:213-278` hiển thị bốn bước nhưng:

- Không có connector hoặc data packet chạy giữa các bước.
- Không có trạng thái pending → processing → success.
- Biểu đồ không dựng cột; tổng tiền không count/morph.
- Revenue card chỉ nổi tĩnh và che một phần tiêu đề card ở mobile.
- Hover/click vào step không tạo phản hồi hoặc giải thích sâu hơn.

**Tác động:** phần đáng lẽ là “hero object” lại đọc như một screenshot dựng bằng HTML.

### P1-03 — Motion đơn điệu và lặp lại

`Reveal.tsx` áp dụng cùng một công thức cho gần như toàn bộ trang: `opacity: 0`, `y: 18`, duration 0,5 giây, stagger 80 ms. Ngoài ra chỉ có `animate-pulse` và menu height/opacity.

**Tác động:** người dùng nhận ra pattern sau section đầu; motion không kể chuyện, không biểu đạt quan hệ dữ liệu và không tạo chiều sâu.

**Cơ hội:** dùng nhiều “motion primitive” có nghĩa khác nhau: line draw, path travel, mask reveal, number roll, state morph, shared-layout transition, depth parallax và pointer spotlight.

### P1-04 — Mobile first viewport thiếu product proof

Tại 390×844, viewport đầu gồm brand, eyebrow, headline, paragraph, CTA và benefits; Workflow Preview chỉ xuất hiện sau khi cuộn. Headline 42 px chiếm nhiều dòng, badge cũng wrap thành hai dòng.

**Tác động:** trên thiết bị quan trọng nhất, người dùng chưa thấy sản phẩm trước khi quyết định cuộn. Trang sau đó dài khoảng 8,2k px vì các card xếp nối tiếp, tạo cảm giác catalogue.

**Cơ hội:** rút headline mobile, đưa một mini signal rail hoặc preview crop vào first fold; chuyển một số nhóm card thành horizontal snap/accordion có chủ đích thay vì xếp toàn bộ theo cột.

### P1-05 — Placeholder làm giảm ngay cảm giác premium

Navigation đang hiển thị ô nét đứt “LOGO” và `[TÊN CÔNG TY KHÁCH HÀNG]`. Trong repo đã có nhiều concept logo nhưng Home chưa dùng asset được duyệt.

**Tác động:** ngay điểm nhìn đầu tiên, trang có cảm giác handoff/prototype hơn là sản phẩm cao cấp.

**Cơ hội:** dùng lockup NKC được duyệt; nếu chưa chốt logo khách hàng, bỏ placeholder khỏi production hoặc chuyển thành slot white-label có trạng thái cấu hình rõ ràng.

### P2-01 — Background có motif nhưng không có chiều sâu hoặc ngữ nghĩa

`.hero-bg` gồm ba radial gradient và dotted grid tĩnh. `navy` cũng dùng hai radial gradient. Các lớp này tạo không khí nhưng chưa liên quan tới workflow và khá gần kiểu “gradient blob” phổ biến.

**Cơ hội:** thay bằng topology grid, signal path, coordinate labels và light sweep được mask theo vùng nội dung. Chuyển động nền phải rất chậm, biên độ nhỏ và pause khi offscreen.

### P2-02 — Card system quá đồng dạng

Pain cards, department cards và process cards đều dùng border mảnh, nền trắng, radius 22 px và hover nâng 3 px. Từ giữa trang trở xuống, nhiều khối có trọng lượng thị giác gần như nhau.

**Tác động:** thiếu nhịp lớn/nhỏ, thiếu điểm dừng và thiếu “hero moment” thứ hai sau đầu trang.

**Cơ hội:** phân cấp surface thành primary stage, diagnostic panel, node card và compact telemetry chip; không dùng một kiểu card cho mọi nội dung.

### P2-03 — Operating Map chưa thật sự là “map”

Flow strip chỉ là chuỗi pill và mũi tên. Bento phía dưới có thông tin phong phú nhưng quan hệ giữa các phòng ban không phản ứng theo strip.

**Cơ hội:** dùng SVG network với node, connector và data pulse; hover/focus một phòng ban làm nổi tuyến dữ liệu liên quan và cập nhật inspector ở cạnh, không mở card lồng card.

### P2-04 — Process section mô tả tuần tự nhưng không có continuity

Bốn bước hiện là bốn card độc lập. Đường line trong mỗi card dừng ở chính card đó; người dùng không cảm nhận dữ liệu đi xuyên suốt quy trình.

**Cơ hội:** một rail liên tục với một packet duy nhất đi qua bốn checkpoint; nội dung từng bước reveal theo trạng thái của rail.

### P2-05 — Hover, press và focus chưa tạo cảm giác “tactile”

Card chỉ `translateY(-3px)`; button chỉ đổi màu; icon và arrow không phản ứng. Không có press state, magnetic offset nhỏ, border illumination hoặc pointer-aware highlight.

**Cơ hội:** bổ sung micro-interaction theo vai trò, nhưng giữ biên độ nhỏ: arrow travel, icon path, edge glow, 1–2° tilt có giới hạn và scale press 0,98.

### P2-06 — Navigation thiếu orientation và trạng thái cuộn

Navigation sticky hoạt động, nhưng không có active section, scroll progress, transition từ transparent sang glass compact, hoặc underline chạy theo mục hiện tại.

**Cơ hội:** nav morph theo scroll; active indicator dùng shared layout; mobile menu trở thành command sheet gọn, có current-section state và đóng bằng Escape.

### P2-07 — CTA cuối trang lặp lại hero, chưa tạo cao trào

CTA là một rectangle navy với heading và hai button. Nó đúng chức năng nhưng không “kết thúc câu chuyện dữ liệu” từ các section trước.

**Cơ hội:** cho signal rail từ process đi vào CTA, biến thành trạng thái “Workflow ready”, sau đó sáng CTA chính. Không dùng loop phô trương liên tục.

### P2-08 — Reveal có rủi ro với screenshot, print và progressive enhancement

Ảnh full-page chụp ngay sau khi load cho thấy phần lớn trang trắng vì các section chưa vào viewport vẫn giữ `opacity: 0`. Trong reduced-motion, nội dung ngoài viewport cũng tiếp tục bị ẩn cho tới khi scroll.

**Tác động:** bất lợi cho screenshot automation, print/PDF, một số crawler/rendering tool và trường hợp Intersection Observer không kích hoạt như mong đợi.

**Cơ hội:** mặc định DOM ở final state; chỉ kích hoạt initial hidden state khi JS/motion sẵn sàng, có CSS riêng cho print/reduced-motion và timeout fallback.

### P2-09 — Typography kỹ thuật chưa được khai thác có hệ thống

Inter và JetBrains Mono đã được tải, nhưng mono chủ yếu nằm trong công thức và số thứ tự. Metadata, ID, timestamps, trạng thái, coordinate và số liệu chưa tạo thành một lớp “telemetry typography”.

**Cơ hội:** giữ Inter cho nội dung, dùng JetBrains Mono có chọn lọc cho system label và số; bổ sung type scale/tokens thay vì nhiều giá trị font size trực tiếp trong JSX.

### P3 — Polish kỹ thuật nhỏ

- Dọn `favicon.ico` 404.
- Cấu hình React Router future flags khi nâng version.
- Kiểm tra trạng thái font khi Google Fonts chậm hoặc bị chặn; nên có metric-compatible fallback hoặc self-host nếu yêu cầu production.
- CTA/link đang có focus ring chung tốt, nhưng các trạng thái hover mới phải có tương đương keyboard focus.

## 7. Đánh giá theo từng section

### Navigation

**Tốt:** sạch, sticky, CTA rõ, menu mobile đơn giản và semantic.  
**Chưa đạt premium:** logo placeholder; không active state; blur/surface không thay đổi theo scroll; link hover chỉ đổi màu; mobile menu mở bằng cách đẩy nội dung xuống và chưa tạo cảm giác command layer.  
**Mức ưu tiên:** P1 cho brand, P2 cho motion/orientation.

### Hero

**Tốt:** copy mạnh, hierarchy rõ, CTA hợp lý, product data thật.  
**Chưa đạt:** bố cục quen thuộc, nền tĩnh, visual không tương tác, revenue badge va vào vùng title trên mobile, product proof xuống dưới first fold ở 390/768.  
**Mức ưu tiên:** P1 — khu vực quyết định WOW.

### Pain/Feature Cards

**Tốt:** đối chiếu pain → outcome rõ ràng.  
**Chưa đạt:** ba card có hình thức và motion giống nhau; phần “trước/sau” chỉ đổi màu nền; không có transition biểu đạt dữ liệu rời rạc được chuẩn hoá.  
**Mức ưu tiên:** P1/P2.

### Workflow/Operating Map

**Tốt:** nội dung nghiệp vụ giàu, có department, formula, report và expansion.  
**Chưa đạt:** flow strip và bento tách rời; không có network interaction; quá nhiều surface đồng cấp; desktop chưa có một stage lớn để người dùng khám phá.  
**Mức ưu tiên:** P1 — nên là centerpiece thứ hai của trang.

### Process

**Tốt:** bốn bước rõ và route target đúng.  
**Chưa đạt:** card grid khiến quy trình trông như feature list; connector không xuyên card; CTA text nhỏ và không có state transition.  
**Mức ưu tiên:** P2.

### CTA và Footer

**Tốt:** contrast cao, copy ngắn, CTA route đúng.  
**Chưa đạt:** CTA chưa kế thừa motion narrative; footer tối giản nhưng không có dấu ấn brand hoặc trust layer.  
**Mức ưu tiên:** P2/P3.

## 8. Responsive audit

| Viewport | Kết quả hiện tại | Vấn đề chính |
|---|---|---|
| 1440×1000 | Hero hai cột cân đối, visual nhìn rõ, không overflow | First fold vẫn khá nhiều khoảng trống; motion gần như không thấy sau entrance |
| 768×1024 | Layout xếp dọc đúng, CTA và benefits đọc tốt | Workflow Preview nằm thấp; người dùng thấy chủ yếu copy trong phần lớn first viewport |
| 390×844 | Không tràn ngang, button/menu đủ lớn, text không bị cắt | H1 + copy chiếm toàn bộ first viewport; badge wrap; visual xuống dưới; full page rất dài |

### Kết luận responsive

Responsive hiện tại là **co giãn an toàn**, chưa phải **art direction theo thiết bị**. Redesign cần ba composition thực sự khác nhau:

- Desktop: hero split-stage, network rộng, scroll storytelling.
- Tablet: hero stacked nhưng preview phải xuất hiện sớm; giảm parallax và số lớp.
- Mobile: compact headline + mini workflow proof trong first viewport; cards chuyển thành progressive disclosure/horizontal snap; tránh kéo dài trang vô hạn.

## 9. Accessibility và hiệu năng

### Điểm nên giữ

- Semantic heading/link/navigation tương đối tốt.
- Focus-visible toàn cục rõ.
- Touch target mobile đạt khoảng 44 px.
- Có reduced-motion ở app và CSS.
- Home route nhẹ; không có thư viện visual nặng.

### Điều cần bắt buộc trong redesign

- Không để content phụ thuộc vào animation mới nhìn thấy được.
- Reduced-motion phải hiển thị final state ngay khi load, không chờ scroll để bỏ opacity 0.
- Motion không mang thông tin duy nhất; trạng thái phải có text/color/icon cùng lúc.
- Hover effect phải có `focus-visible` tương đương.
- Background và glow không làm giảm contrast; giữ WCAG AA cho body/control.
- Chỉ animate `transform` và `opacity` trong phần lớn trường hợp; filter/blur dùng ngắn và vùng nhỏ.
- Dừng loop khi tab hidden hoặc component offscreen; không chạy pointer effect trên touch device.

## 10. Cơ hội thiết kế lớn nhất

Đề xuất trục sáng tạo: **“Operational Signal System — một tín hiệu dữ liệu sống xuyên suốt toàn trang.”**

Một data packet xuất hiện ở Hero, chạy qua Input → Formula → Report → Approval, tiếp tục đi vào network phòng ban, trở thành process rail và kết thúc ở CTA “Workflow ready”. Đây là chi tiết ghi nhớ duy nhất nhưng đủ liên kết toàn trang, tạo technical feel và cho phép motion phong phú mà không rối.

Hướng này phù hợp NKC Workflow hơn việc chỉ thêm aurora, glass và parallax trang trí. Nó dùng chuyển động để giải thích nghiệp vụ: dữ liệu được chuẩn hoá, xử lý, phân phối và phê duyệt.

## 11. Ranh giới redesign

- Giữ nguyên routes `/nhap-lieu`, `/bao-cao`, `/giao-dien` và hành vi CTA.
- Không thay đổi schema, store, báo cáo, công thức hoặc business logic.
- Giữ thông điệp cốt lõi và dữ liệu demo; có thể biên tập ngắn để phù hợp responsive.
- Ưu tiên Motion/CSS/SVG đã có; không thêm WebGL hoặc animation dependency lớn nếu chưa chứng minh lợi ích.
- Không sao chép layout/asset của Linear, Vercel, Stripe hoặc Raycast; chỉ học tinh thần: độ chính xác, chiều sâu, storytelling và polish.

## 12. Kết luận audit

Home hiện tại **không cần làm lại từ trắng**. Nội dung, route, semantic và responsive foundation đủ tốt. Phần cần thay đổi mạnh là cách sản phẩm được “biểu diễn”: từ landing page card-based tĩnh sang một hệ thống tín hiệu dữ liệu có chiều sâu, phản ứng theo scroll/hover và có continuity xuyên section.

Redesign nên tập trung theo thứ tự: **Hero + Workflow Preview → Motion foundation → Operating Network → mobile narrative → card/CTA polish**. Kế hoạch chi tiết nằm trong `PLAN-HOMEPAGE-REDESIGN.md`.
