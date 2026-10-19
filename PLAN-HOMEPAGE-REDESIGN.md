# PLAN REDESIGN HOME — NKC WORKFLOW

**Ngày lập kế hoạch:** 17/10/2026  
**Trạng thái:** chờ duyệt concept; chưa triển khai code.  
**Mục tiêu:** nâng Home thành trải nghiệm Premium High-tech SaaS / Futuristic / Motion-driven, tạo WOW trong first visit nhưng vẫn rõ nghiệp vụ, responsive và giữ 60 FPS.

## 1. North Star

### Concept đề xuất: Operational Signal System

Home được hình dung như một **control plane đang vận hành**. Một “tín hiệu dữ liệu” là motif xuyên suốt:

1. Sinh ra từ thao tác nhập phiếu.
2. Chạy qua công thức và được chuẩn hoá.
3. Phân phối tới các phòng ban.
4. Tổng hợp thành dashboard.
5. Dừng tại checkpoint phê duyệt.
6. Kết thúc bằng trạng thái “Workflow ready”.

Đây là điểm nhận diện chính, thay vì phủ mọi nơi bằng gradient/glass. Motion có nhiệm vụ giải thích luồng nghiệp vụ, còn typography, ánh sáng và surface tạo cảm giác premium.

### Tinh thần tham khảo, không sao chép

- **Linear:** độ tĩnh có kiểm soát, hierarchy chính xác, motion ngắn và sắc.
- **Vercel:** grid kỹ thuật, typography kỷ luật, khoảng trắng và contrast rõ.
- **Stripe:** product storytelling nhiều lớp, UI mock có dữ liệu thật và chuyển trạng thái.
- **Raycast:** light/glow tinh tế, micro-interaction tactile và polish cao.

### Ba nguyên tắc quyết định

1. **Show the system, not decoration:** mọi hiệu ứng lớn phải biểu đạt dữ liệu, trạng thái hoặc quan hệ.
2. **One hero motion at a time:** mỗi viewport chỉ có một chuyển động nổi bật; các lớp còn lại hỗ trợ với biên độ thấp.
3. **Static first, motion enhanced:** nội dung và thao tác hoàn chỉnh khi animation bị tắt hoặc JS chưa sẵn sàng.

## 2. Art direction

### 2.1 Palette

Giữ cobalt hiện tại làm brand signal, nhưng mở rộng thành hệ màu có chiều sâu:

| Vai trò | Định hướng |
|---|---|
| Canvas dark | Obsidian/Navy gần `#070B14` và `#0B1220` |
| Canvas light | Cool white và fog `#F6F8FB` |
| Brand signal | Electric cobalt `#3157FF` |
| Computation | Violet có kiểm soát, chỉ cho formula/process |
| Success/data live | Emerald cho trạng thái chạy/đã duyệt |
| Pending | Amber cho checkpoint/chờ duyệt |
| Hairline | Trắng 8–14% trên dark; ink 8–12% trên light |

Không dùng purple gradient toàn màn hình. Gradient chỉ là ánh sáng cục bộ đi theo signal hoặc làm separation giữa surface.

### 2.2 Typography

- Giữ **Inter** cho display/body để đồng bộ sản phẩm hiện tại.
- Dùng **JetBrains Mono** cho ID, system label, formula, timestamp, coordinate và telemetry.
- Tạo type tokens thay cho nhiều giá trị trực tiếp: Display XL/L/M, Heading L/M/S, Body L/M/S, Label Mono.
- Headline desktop mục tiêu 60–68 px; mobile 36–40 px với line-height 0,98–1,04 để đưa product proof vào first viewport.
- Dùng optical weight/letter spacing có chủ đích; không biến mọi heading thành extra-bold.

### 2.3 Surface và depth

- Ba cấp surface: `stage`, `panel`, `node`; không dùng card 22 px cho tất cả.
- Border là hairline có edge highlight thay vì line xám đồng đều.
- Shadow tách thành ambient shadow + contact shadow; tránh bóng lớn mờ ở mọi card.
- Glass chỉ dùng cho nav/floating inspector; nội dung chính ưu tiên surface đặc để giữ contrast và hiệu năng.

### 2.4 Background technical

- Perspective grid nhẹ, coordinate ticks và topology line thay cho dotted pattern đơn thuần.
- Một light sweep rất chậm theo signal path, không loop dày.
- Noise 1–2% opacity để tránh gradient banding; có thể dùng CSS/data texture nhỏ, không dùng video.
- Background layers giảm còn 1–2 lớp trên mobile/low-power.

## 3. Information architecture đề xuất

Giữ cùng câu chuyện nội dung nhưng tái cấu trúc nhịp:

1. **Navigation / Command Bar**
2. **Hero / Live Workflow Engine**
3. **Operational Proof Strip** — ba benefit hiện có dưới dạng telemetry, không thêm claim không có dữ liệu
4. **Pain → Transformation** — ba vấn đề được “normalize” bằng motion
5. **Workflow Preview / Scroll Story** — centerpiece giải thích Input → Compute → Report → Approval
6. **Department Network** — quan hệ phòng ban tương tác
7. **Process Rail** — tóm tắt bốn bước, đồng bộ cùng signal
8. **Final CTA / Workflow Ready**
9. **Footer**

Có thể hợp nhất một phần “Operating Map” và “4 Steps” để trang ngắn hơn trên mobile, nhưng giữ đủ nội dung và routes hiện tại.

## 4. Redesign theo từng section

### 4.1 Navigation — Adaptive Command Bar

**Bố cục**

- Dùng NKC lockup được duyệt; bỏ ô “LOGO” nét đứt và placeholder khách hàng trên bản public.
- Desktop nav ban đầu trong suốt trên hero; sau 24–40 px scroll morph thành compact glass bar.
- Active section có indicator chạy bằng shared layout; thêm progress line rất mảnh ở cạnh dưới.
- CTA “Vào demo” giữ route và prominence, nhưng có icon arrow/launch rõ.

**Motion**

- Nav surface: 220–280 ms, blur/opacity/height nhẹ.
- Active indicator trượt giữa link bằng spring có damping cao, không bounce.
- Link hover có underline scan hoặc 2 px signal travel; focus-visible cùng treatment.
- CTA hover: edge light chạy một lần; arrow dịch 3–4 px; active scale 0,98.

**Mobile**

- Menu mở thành command sheet ngay dưới bar, có backdrop nhẹ và current section.
- Stagger theo nhóm 30–40 ms, không dùng toàn menu slide dài.
- Đóng bằng click ngoài, Escape và chọn link; trả focus về trigger.

### 4.2 Hero — Live Workflow Engine

**Mục tiêu:** trong 3 giây đầu, người dùng hiểu “OneFlow biến dữ liệu nhập thành báo cáo/phê duyệt trong một luồng”.

**Bố cục desktop**

- 12-column stage; copy khoảng 5 cột, live engine 7 cột.
- H1 gọn hơn theo chiều cao; keyword “một luồng dữ liệu” có signal underline chạy một lần.
- CTA giữ hai cấp; benefits chuyển thành compact telemetry row.
- Live engine là một canvas HTML/SVG gồm 4 node, connector, data packet và inspector nổi; không phải bốn row độc lập.

**Entrance sequence**

1. Grid/coordinate fade rất nhẹ.
2. Brand signal vẽ connector từ trái sang phải.
3. Headline reveal bằng mask theo 2–3 dòng, không slide-up từng dòng giống nhau.
4. Input node bật trạng thái; giá trị xuất hiện như typed data.
5. Formula token snap vào biểu thức; tổng tiền roll tới `15.000.000 ₫`.
6. Chart dựng cột; approval node chuyển pending → ready.
7. CTA sáng lên sau khi demo state hoàn tất.

Toàn sequence 1,6–2,2 giây, chạy một lần. Không tự lặp toàn bộ. Sau đó chỉ giữ một data pulse chậm mỗi 4–6 giây hoặc dừng hẳn khi user tương tác.

**Interaction**

- Hover/focus từng node làm connector liên quan sáng và mở inspector ngắn.
- Pointer spotlight cập nhật qua CSS variables, chỉ desktop có fine pointer.
- Card tilt tối đa 1,5–2°, không dùng perspective quá mạnh.
- Click vẫn dẫn tới route hiện tại hoặc CTA rõ; không tạo dead interaction.

**Mobile**

- H1 36–40 px, copy rút gọn hợp lý.
- Hiển thị mini flow rail hoặc 2 node đầu ngay trong first 844 px.
- Live engine chuyển sang horizontal stage có snap hoặc state carousel tự dừng; revenue card đặt trong layout, không absolute che title.
- Bỏ pointer parallax; giữ tap-to-focus và connector pulse.

### 4.3 Operational Proof Strip

Ba benefit hiện có trở thành một strip telemetry:

- “Tuỳ biến theo nghiệp vụ” — schema/node icon.
- “Không cần lập trình” — no-code token icon.
- “Báo cáo thời gian thực” — live status icon.

Mỗi item có micro animation riêng, không dùng cùng một checkmark. Khi vào viewport: schema line draw, token snap, status ping; sau đó đứng yên.

### 4.4 Pain → Transformation

**Bố cục desktop**

- Trái: sticky visual “fragmented data field” gồm ba nguồn Excel/Zalo/Email được biểu diễn như packet lệch chuẩn.
- Phải: ba narrative step. Khi step active, các packet được align, validate hoặc aggregate.
- Chỉ một step active tại một thời điểm; section cao vừa đủ, không kéo dài kiểu presentation vô tận.

**Motion theo pain**

- Dữ liệu phân mảnh: packet rời rạc → snap vào một shared schema.
- Tính toán thủ công: formula tokens sai lệch → khóa vào expression → output ổn định.
- Báo cáo chậm: timeline theo tháng → nén thành live event stream.

**Mobile**

- Bỏ sticky; dùng ba compact transformation cards.
- Tap hoặc scroll vào card kích hoạt một transition ngắn 500–700 ms.
- Không auto-play nhiều animation cùng lúc.

### 4.5 Workflow Preview — Scroll-driven Product Story

Đây là centerpiece quan trọng nhất sau Hero.

**Desktop**

- Stage 60–65% bên phải sticky; narrative step bên trái.
- Dùng chính UI/data hiện có, không dựng dashboard giả không liên quan.
- Scroll progress điều khiển bốn state rời rạc; không map mọi pixel vào animation liên tục.

**Bốn state**

1. **Input:** field chips đi vào phiếu; cursor/focus ring cho thấy thao tác no-code.
2. **Compute:** formula tokens nối; số kết quả cập nhật; edge pulse sang bước tiếp.
3. **Report:** form thu nhỏ/morph thành chart và KPI; số liệu giữ continuity.
4. **Approval:** checkpoint hiện avatar/role, status pending → approved; export formats xuất hiện sau cùng.

**Kỹ thuật motion**

- Shared layout transition cho panel/form/chart.
- SVG pathLength cho connector.
- Number interpolation có định dạng tiền Việt; final value phải chính xác.
- Clip/mask cho chart build, không animate width/height layout trực tiếp.
- Scroll snap logic mềm ở cấp state; không khóa scroll người dùng.

**Mobile/tablet**

- Tablet: stage trên, step rail dưới; không sticky quá dài.
- Mobile: stepper ngang hoặc stacked state panels; tap “Tiếp” không bắt buộc, scroll vẫn tự nhiên.
- Mọi final state đọc được khi reduced-motion.

### 4.6 Department Network

**Bố cục**

- Kinh doanh là origin node; Kho vận, Kế toán, Nhân sự và Ban Giám đốc là network node.
- Inspector ở cạnh hiển thị form/formula/output của node đang active.
- “Mở rộng theo đặc thù” trở thành add-node affordance, không phải một card dashed lớn riêng biệt.

**Interaction**

- Hover/focus node: highlight tuyến liên quan, packet chạy một lần, inspector crossfade/morph.
- Click/tap: pin active state; CTA giữ route hiện tại.
- Keyboard arrow có thể chuyển giữa node; tab order hợp logic.

**Motion**

- Connector draw khi section vào viewport.
- Node entrance theo topology, không stagger trái sang phải máy móc.
- Data pulse chỉ chạy trên tuyến active; tránh tất cả tuyến chạy cùng lúc.

**Mobile**

- Network rút thành vertical route + tab/accordion theo phòng ban.
- Inspector nằm trong active panel; không cố giữ sơ đồ rộng gây chữ nhỏ.

### 4.7 Feature/Department Cards

Nếu vẫn giữ card grid, chia thành ba archetype:

- **Primary product card:** stage lớn có UI thật.
- **Node card:** department, icon + telemetry + output.
- **Diagnostic card:** pain/transformation, trước/sau rõ.

Hover card gồm:

- Border illumination theo pointer.
- Icon path hoặc glyph đổi state một lần.
- Content lift 2–4 px và shadow contact thay đổi.
- CTA arrow travel; press scale 0,985.

Không dùng tilt/glow trên toàn bộ card cùng lúc và không lồng card trong card.

### 4.8 Process Rail

- Thay bốn card rời bằng một rail liên tục có bốn checkpoint.
- Signal packet từ Workflow Preview tiếp tục qua rail để tạo continuity.
- Desktop có layout ngang; tablet/mobile dùng dọc.
- Step active mở rộng nhẹ và reveal copy bằng clip; các step còn lại vẫn đọc được.
- Hover/focus step làm sáng đoạn connector tương ứng và CTA route.

### 4.9 Final CTA — Workflow Ready

- Signal rail đi vào CTA và hoàn thành thành check/state “Workflow ready”.
- Background dark có grid hội tụ và edge light chậm; không dùng hai radial blob tĩnh.
- CTA chính nhận một light sweep duy nhất khi section vào viewport.
- CTA phụ giảm prominence nhưng vẫn đủ contrast.
- Footer tiếp nối cùng baseline/grid để trang kết thúc có chủ đích.

## 5. Motion Design System

### 5.1 Motion tokens

| Token | Thời lượng | Dùng cho |
|---|---:|---|
| `instant` | 80–120 ms | pressed, toggle feedback |
| `micro` | 140–180 ms | icon, arrow, border, chip |
| `state` | 220–320 ms | tab, nav morph, inspector change |
| `enter` | 450–650 ms | mask reveal, card/node entrance |
| `narrative` | 800–1.200 ms | path draw, product state transition |
| `ambient` | 4–8 s | một pulse/background drift rất nhẹ |

### 5.2 Easing

- Enter: `[0.22, 1, 0.36, 1]` — giữ tinh thần hiện tại.
- Exit/state: `[0.4, 0, 0.2, 1]`.
- Spring UI: stiffness cao, damping cao, gần như không bounce.
- Không dùng elastic/bouncy motion cho dữ liệu tài chính hoặc approval.

### 5.3 Motion primitives

- Mask/clip reveal cho headline và section title.
- SVG line draw/path travel cho workflow.
- Shared layout morph cho form → report → approval.
- Number roll cho KPI, chạy một lần và kết thúc chính xác.
- Depth shift 4–16 px giữa background/midground/foreground.
- Pointer spotlight qua CSS variables, throttle bằng `requestAnimationFrame`.
- Edge glow/border sweep cho hover/focus.
- State pulse cho live/pending/approved; không lạm dụng pulse liên tục.

### 5.4 Entrance choreography

Không dùng một `Reveal` cho mọi nội dung. Chọn choreography theo semantics:

- Text: mask reveal.
- Network: draw connector rồi activate node.
- Data: token/packet travel.
- Chart: build from baseline.
- Cards: edge → surface → content, delay ngắn.
- CTA: signal arrives → state ready → button highlight.

### 5.5 Reduced motion

- Mọi content ở final state ngay khi load; không `opacity: 0` chờ viewport.
- Không parallax, tilt, packet travel hoặc number roll.
- Cho phép đổi màu/border tức thì hoặc 80–120 ms nếu hệ điều hành chấp nhận.
- Workflow vẫn thể hiện quan hệ bằng connector tĩnh, labels và status.
- `@media print` buộc toàn bộ section visible, bỏ sticky và transform.

## 6. Component/source cần chỉnh sửa khi được duyệt code

### File hiện có

| File | Hướng chỉnh |
|---|---|
| `src/pages/HomePage.tsx` | Tách composition lớn thành section component; giữ copy/routes/business action |
| `src/components/Reveal.tsx` | Thay generic reveal bằng motion primitives/variants; thêm safe fallback và reduced-motion final state |
| `src/index.css` | Bổ sung design tokens, surface, grid, motion utilities, print/reduced-motion/performance rules |
| `src/App.tsx` | Giữ routing; chỉ chỉnh motion configuration nếu cần, không đổi business logic |
| `index.html` | Favicon, font loading/preload hoặc self-host strategy nếu được chọn |

### Component đề xuất

| Component | Trách nhiệm |
|---|---|
| `HomeNav` | Adaptive nav, active section, mobile command sheet |
| `SignalBackground` | Grid/topology/light layers có adaptive quality |
| `HeroCopy` | Headline mask, CTA, proof strip |
| `WorkflowEngine` | Hero node graph và state demo |
| `TransformationStory` | Pain → normalized data states |
| `WorkflowScrollytelling` | Bốn product states theo scroll |
| `DepartmentNetwork` | SVG connectors, nodes, inspector |
| `ProcessRail` | Bốn checkpoint và continuity signal |
| `WorkflowCTA` | Final state + CTA |
| `MotionProvider` hoặc hooks nhỏ | Reduced motion, pointer capability, visibility/offscreen pause |

Không cần thêm dependency animation mới ở phase đầu; `motion`, CSS và SVG hiện có đủ cho concept.

## 7. Kiến trúc motion và hiệu năng

### Nguyên tắc triển khai

- Animate chủ yếu `transform` và `opacity`.
- SVG path dùng `pathLength`; chart dùng scale/clip, không animate layout.
- `will-change` chỉ bật sát thời điểm animate và gỡ sau khi xong.
- Continuous background chỉ chạy khi section trong viewport và `document.visibilityState === 'visible'`.
- Pointer tracking chỉ bật với `(hover: hover) and (pointer: fine)`.
- Không tạo state React trên mỗi `pointermove`; dùng motion value hoặc CSS variables.
- Dùng Intersection Observer/motion viewport để activate section, nhưng DOM mặc định visible.
- Không blur vùng lớn liên tục; backdrop blur chỉ ở nav/inspector nhỏ.
- Mobile giảm số layer, tắt tilt/parallax và giảm số shadow.

### Performance budget đề xuất

- 60 FPS mục tiêu; không có long animation frame lặp lại trên thiết bị tầm trung.
- LCP production mobile ≤ 2,5 giây.
- CLS ≤ 0,1; mọi panel/visual có kích thước ổn định trước khi font/animation load.
- INP ≤ 200 ms.
- Không thêm animation library lớn; Home JS gzip tăng tối đa khoảng 25–35 kB nếu có lý do rõ.
- Không autoplay video/WebGL trong Hero ở phase đầu.
- Font không chặn render; có fallback tương thích metric.

## 8. Responsive strategy

### Desktop ≥ 1200 px

- Full live engine, sticky product story và network graph.
- Pointer spotlight/tilt có giới hạn.
- Hero nội dung chính nằm gọn trong khoảng 780–900 px chiều cao.

### Laptop 900–1199 px

- Hero vẫn hai cột khi đủ chỗ hoặc split 45/55.
- Giảm metadata và inspector floating.
- Scrollytelling chuyển thành stage trên + step rail dưới nếu chiều ngang hạn chế.

### Tablet 640–899 px

- Hero stacked, live preview xuất hiện ngay sau CTA và vẫn có teaser trong first viewport.
- Không sticky section quá cao.
- Network thành route/accordion; process vertical hoặc 2×2.

### Mobile < 640 px

- Headline ngắn và gọn; CTA không chiếm quá nhiều chiều cao.
- Có mini workflow proof trong first 844 px.
- Không absolute badge che content.
- Dùng horizontal snap có affordance rõ hoặc accordion; tránh 8k+ px trang chỉ vì card stack.
- Touch target ≥ 44×44 px; không phụ thuộc hover.

## 9. Thứ tự triển khai và ưu tiên

### Phase 0 — Baseline và safety rails — P0

1. Chốt concept, logo/lockup và content không được thay đổi.
2. Chụp baseline 1440/768/390; đo Lighthouse/Performance production.
3. Tạo design tokens visual/motion và reduced-motion/print contract.
4. Refactor `Reveal` để content không bị ẩn khi print, reduce motion hoặc automation.

**Kết quả:** nền motion an toàn trước khi thêm hiệu ứng.

### Phase 1 — Hero WOW + Navigation — P0

1. Adaptive nav và brand lockup.
2. Technical background có topology/signal.
3. Live Workflow Engine và entrance choreography.
4. Responsive hero riêng cho desktop/tablet/mobile.
5. Hover/focus/press cho CTA và node.

**Kết quả:** first viewport đạt định vị mới và chứng minh sản phẩm.

### Phase 2 — Workflow storytelling — P0/P1

1. Pain → Transformation.
2. Scroll-driven Workflow Preview bốn state.
3. Shared data continuity và exact number formatting.
4. Mobile state rail thay cho sticky desktop.

**Kết quả:** motion trở thành công cụ giải thích nghiệp vụ, không chỉ trang trí.

### Phase 3 — Department Network + Cards — P1

1. Network graph và inspector.
2. Interaction hover/focus/tap/keyboard.
3. Chuẩn hoá ba archetype surface/card.
4. Add-node affordance cho phần mở rộng phòng ban.

**Kết quả:** Operating Map thật sự có quan hệ và khả năng khám phá.

### Phase 4 — Process, CTA và polish — P1/P2

1. Process Rail liên tục.
2. CTA “Workflow ready”.
3. Footer, favicon, font loading, nav progress.
4. Tune timing, easing, shadow, contrast và copy wrapping.

### Phase 5 — QA/performance — P0 trước release

1. Visual regression đa viewport.
2. Keyboard/screen reader/reduced-motion/print.
3. Performance profiling CPU 4× slowdown và mobile emulation.
4. Build/test/routes/business flows.

## 10. Ma trận ưu tiên

| Hạng mục | Ưu tiên | Giá trị | Rủi ro/độ khó |
|---|---:|---:|---:|
| Brand lockup + Hero engine | P0 | Rất cao | Trung bình |
| Motion foundation + reduced motion | P0 | Rất cao | Trung bình |
| Workflow scrollytelling | P0 | Rất cao | Cao |
| Mobile first-fold redesign | P0 | Rất cao | Trung bình |
| Department Network | P1 | Cao | Cao |
| Card/micro-interaction system | P1 | Cao | Trung bình |
| Adaptive navigation | P1 | Trung bình/Cao | Thấp/Trung bình |
| Process Rail | P1 | Trung bình | Trung bình |
| CTA/footer polish | P2 | Trung bình | Thấp |
| Ambient background extras | P2 | Thấp/Trung bình | Trung bình nếu lạm dụng |

## 11. Tiêu chí nghiệm thu

### Visual và brand

- First viewport desktop truyền đạt rõ Input → Compute → Report → Approval mà không cần đọc toàn bộ copy.
- Không còn placeholder “LOGO” hoặc `[TÊN CÔNG TY KHÁCH HÀNG]` trên bản được nghiệm thu.
- Có một motif signal nhất quán xuyên Hero, Workflow, Network, Process và CTA.
- Không section nào chỉ là biến thể lặp của card trắng + fade/slide-up.
- Visual vẫn chuyên nghiệp, không biến thành gaming/cyberpunk hoặc neon quá mức.

### Motion

- Hero entrance có choreography rõ, chạy một lần và hoàn tất trong khoảng 2,2 giây.
- Mỗi section có motion semantics riêng; không dùng fade-in/slide-up làm hiệu ứng chính cho toàn trang.
- Scroll không bị lock, snap cưỡng bức hoặc giật khi đổi state.
- Hover, focus, press và tap đều có phản hồi đúng thiết bị.
- Không có hơn một ambient loop nổi bật trong cùng viewport.
- Offscreen animation và tab background được pause.

### Responsive

- Kiểm tra tối thiểu: 1920×1080, 1440×900, 1366×768, 1280×800, 1024×768, 768×1024, 390×844 và 360×800.
- Không horizontal overflow ở tất cả viewport.
- 390×844 nhìn thấy ít nhất một phần product/workflow proof trong first viewport.
- Badge/panel không che heading, label hoặc control.
- Mobile page không biến mọi desktop card thành một chuỗi dọc đơn điệu; có progressive disclosure hợp lý.

### Accessibility

- WCAG AA cho text và control.
- Tab order logic; mọi interactive node có name/role/state và focus-visible.
- Interaction không phụ thuộc hover hoặc màu duy nhất.
- Với `prefers-reduced-motion: reduce`, toàn bộ nội dung ở final state ngay khi load; không packet/parallax/tilt/number roll.
- Print/full-page screenshot hiển thị đủ nội dung, không có section opacity 0.
- Mobile menu đóng bằng Escape, click ngoài và chọn link; focus được quản lý đúng.

### Performance

- Production build pass, không thêm warning mới liên quan Home.
- LCP mobile ≤ 2,5 s, CLS ≤ 0,1, INP ≤ 200 ms trong môi trường nghiệm thu thống nhất.
- Scroll/hover đạt mục tiêu 60 FPS; không có repeated long task đáng kể.
- Không dùng WebGL/video autoplay hoặc dependency motion nặng nếu chưa có phê duyệt riêng.
- Home route giữ lazy-loading; bundle delta nằm trong budget 25–35 kB gzip.

### Chức năng

- Tất cả anchor và routes hiện tại giữ nguyên hành vi.
- CTA `/nhap-lieu`, `/bao-cao`, `/giao-dien` hoạt động bằng chuột, bàn phím và touch.
- Không thay đổi business logic, store, công thức, báo cáo hoặc dữ liệu demo.
- Number/currency trong visual luôn khớp dữ liệu hiện tại, không animate tới giá trị sai.

## 12. Quy trình duyệt đề xuất trước khi code

1. Duyệt concept “Operational Signal System”.
2. Chọn light-dominant hay dark-dominant cho toàn Home; đề xuất **dark hero + light operational sections + dark final CTA** để vừa premium vừa giữ khả năng đọc.
3. Duyệt NKC lockup và cách xử lý white-label customer name.
4. Duyệt wireframe desktop/mobile của Hero, Workflow Preview và Department Network.
5. Duyệt motion storyboard 6–8 keyframe cho Hero và 4 state của Workflow Preview.
6. Sau khi duyệt đủ năm mục trên mới bắt đầu Phase 0/1.

## 13. Khuyến nghị cuối

Phương án tốt nhất không phải “thêm nhiều animation vào các card hiện có”, mà là **biến luồng dữ liệu thành nhân vật chính của trang**. Một signal xuyên suốt, kết hợp UI thật và transition trạng thái, sẽ tạo WOW rõ rệt hơn nhưng vẫn đúng nghiệp vụ NKC Workflow, dễ kiểm soát hiệu năng và không rơi vào phong cách futuristic trang trí.

**Dừng tại đây để chờ duyệt trước khi triển khai code.**
