# PLAN FORM BUILDER 4 COLUMNS V6

**Dự án:** NKC Workflow / OneFlow  
**Mốc:** V6.0 — Four-column Form Builder, arithmetic engine hiện tại  
**Ngoài mốc:** V6.1 Formula Engine và generic multi-department submission  
**Trạng thái:** Kế hoạch chờ phê duyệt; chưa triển khai source

## 1. Mục tiêu sản phẩm V6.0

V6.0 tái tổ chức Form Builder thành bốn khu vực có vai trò ổn định:

1. Trường dữ liệu — thư viện field templates.
2. Trường công thức — registry của formula definitions.
3. Setup công thức — chỉnh arithmetic formula đang chọn.
4. Form Workspace — thiết kế placement, layout và preview.

Mục tiêu UX:

- Nhân viên văn phòng nhận biết ngay chức năng của từng khu vực.
- Data fields và formula definitions không còn bị trộn trong cùng palette.
- Formula cơ bản được tạo qua các slot A/operator/B, không cần nhớ cú pháp.
- Arithmetic formula dài được chỉnh trong Formula Workspace rộng.
- Form có thể mở rộng toàn màn hình mà không mất selection hoặc draft.
- Màn hình 1440px dùng rails/drawers thay vì ép bốn panel hẹp.
- Không thay đổi kết quả formula, sales submission, reports hoặc exports hiện tại.

## 2. Phạm vi

### 2.1. V6.0 P0

- Responsive four-column shell.
- Data Field Column.
- Formula Field Column.
- Formula Setup Column.
- Form Workspace và Field Properties Drawer.
- Formula definition tách khỏi Form placement.
- Basic arithmetic editor.
- Advanced structured token editor.
- Formula Workspace cho arithmetic formula dài.
- Preview, diagnostics, dependency-aware delete và rename-safe references.
- Schema v3 với `formOrder`, migration và rollback.
- Regression cho Entry, sales validation, Report, Approval và Export.

### 2.2. P1 sau V6.0

- Full Undo/Redo history.
- Formula clone và duplicate-name warning nâng cao.
- Dependency graph visualization.
- Persist panel widths.
- Keyboard DnD và accessibility hardening.
- Performance tuning cho form lớn.
- Arithmetic text input nếu round-trip an toàn sang legacy tokens.

### 2.3. Không thuộc V6.0

- AST và typed evaluator.
- IF/IFS, AND/OR và comparison functions.
- ROUND/MIN/MAX, SUMIF/COUNTIF, lookup và date functions.
- Excel-compatible formula parser.
- Generic submission cho custom form.
- Dynamic report/export schema.
- Backend sync, audit log và multi-user conflict.

Không tạo placeholder hoặc control giả cho các chức năng ngoài phạm vi. UI chỉ hiển thị capability thực sự hoạt động.

## 3. Nguyên tắc bảo toàn

- Không đổi hoặc tái tạo field/formula ID.
- Không thay Formula `Token` schema trong V6.0.
- Không đổi semantics của `calc()` và `evalItems()`.
- Không đổi sales roles và SavedSlip contract.
- Không làm thay đổi giá trị f1–f4 của template.
- Không xóa dữ liệu v2 hoặc unknown persisted properties.
- Không thay route ngoài `/nhap-lieu`.
- Không tuyên bố hệ thống tương thích Excel/Office.
- Feature flag và backup phải có trước khi persist v3 mặc định.

## 4. Kiến trúc giao diện bốn cột

### 4.1. Desktop rộng — từ 1720px

```text
┌────────────────┬──────────────────┬────────────────────────┬──────────────────────────┐
│ 1. TRƯỜNG      │ 2. TRƯỜNG       │ 3. SETUP CÔNG THỨC     │ 4. FORM WORKSPACE        │
│ DỮ LIỆU        │ CÔNG THỨC       │                        │                          │
│                │                  │ Formula name           │ Form toolbar             │
│ Search         │ + Công thức mới │ Basic / Nâng cao       │ Form canvas              │
│ Input groups   │ Formula list     │ Editor                 │ Placement/reorder        │
│ Drag/click     │ Status/errors    │ Preview/diagnostics    │ Formula result preview   │
│                │ Drag result      │ Open Workspace         │ Properties drawer        │
│ min 220px      │ min 240px        │ min 380–420px          │ min 560px                │
└────────────────┴──────────────────┴────────────────────────┴──────────────────────────┘
```

Grid đề xuất:

```css
grid-template-columns:
  minmax(220px, .8fr)
  minmax(240px, .9fr)
  minmax(380px, 1.3fr)
  minmax(560px, 1.8fr);
```

Tỷ lệ 20/20/30/30 là định hướng, không phải ràng buộc cứng. Min-width được ưu tiên để Form và editor vẫn dùng được.

### 4.2. Desktop 1280–1719px

```text
┌──────┬──────┬─────────────────────────┬─────────────────────────────────────────────┐
│ Data │ ƒx   │ Formula Setup           │ Form Workspace                              │
│ rail │ rail │ 360–400px/collapsible   │ min 560px                                   │
└──────┴──────┴─────────────────────────┴─────────────────────────────────────────────┘
```

- Rail rộng 48–56px, có icon, tooltip và badge số lượng/lỗi.
- Mở rail tạo drawer phủ một phần Setup nhưng không che toàn bộ Form.
- Setup có thể collapse để Form mở rộng.
- Tại 1440px runtime content chỉ 1230px; không hiển thị bốn panel đầy đủ.

### 4.3. Tablet 768–1279px

- Toolbar có bốn entry point: Dữ liệu, Công thức, Setup, Form.
- Chỉ một workspace chính mở tại một thời điểm.
- Data/Formula dùng side sheet.
- Form là default workspace.
- Formula Workspace dùng toàn bộ vùng content.
- Selection, formula draft và scroll được giữ khi chuyển workspace.

### 4.4. Mobile dưới 768px

- Single-pane và bottom navigation.
- Tap-to-add là thao tác chính; drag là tùy chọn nếu thiết bị hỗ trợ.
- Reorder có Move up/down.
- Formula Basic dùng các control xếp dọc.
- Advanced editor luôn mở Formula Workspace toàn màn hình.
- Sticky CTA không che nội dung và tôn trọng safe-area.

### 4.5. Scroll và resize

- Desktop workspace cố định trong `100dvh` như hiện tại.
- Mỗi column có `min-height: 0`, `overflow-y: auto`, `overscroll-behavior: contain`.
- Canvas cho phép cả vertical và controlled horizontal overflow nếu Form minimum width được bật.
- Resize handle chỉ xuất hiện ở desktop rộng.
- Panel width persistence là P1; V6.0 có default/reset trong session.

## 5. Trải nghiệm từng cột

### 5.1. Cột 1 — Trường dữ liệu

Nội dung:

- Search theo label/hint.
- Nhóm Cơ bản, Số liệu, Lựa chọn nếu danh sách tăng.
- Các kind hiện có: text, number, money, percent, date, select và person.
- Card chỉ có icon, tên, mô tả ngắn và drag affordance.

Interaction:

- Click: thêm field sau field đang chọn hoặc cuối Form.
- Drag: chèn tại drop index.
- Sau add: chọn field mới và mở Field Properties Drawer.
- Không hiển thị validation hoặc field settings ngay trong library.

### 5.2. Cột 2 — Trường công thức

Nội dung:

- CTA `+ Công thức mới`.
- Danh sách tất cả formula definitions, kể cả chưa đặt lên Form.
- Status: Draft/Valid/Error/On form.
- Dependency count hoặc error badge.
- Search theo formula label.

Interaction:

- Click formula: chọn và mở Setup ở cột 3.
- Drag formula chưa placed vào Form: thêm ID vào `formOrder`.
- Formula đã placed không được duplicate placement; drag dùng để focus hoặc reorder theo drop behavior đã định nghĩa.
- Remove from Form là detach, không phải delete.
- Hard-delete chỉ ở formula menu và phải dependency-aware.

Create flow:

1. `+ Công thức mới`.
2. Tạo definition với ID mới, label mặc định và tokens rỗng.
3. Tự chọn formula và focus tên tại Setup.
4. Chưa thêm vào `formOrder`.
5. Draft chưa được tham chiếu không chặn save.

### 5.3. Cột 3 — Setup công thức

Header:

- Formula label.
- Status.
- Result type và precision.
- CTA mở Formula Workspace.

V6.0 có hai chế độ thật sự:

- **Cơ bản:** hai operand và một operator.
- **Nâng cao:** structured token editor hiện tại được tổ chức lại.

Không hiển thị tab Visual/IF hoặc text formula khi engine chưa hỗ trợ.

Basic editor:

```text
[Field/constant A] [ + | − | × | ÷ ] [Field/constant B]
Preview: 15.000.000 ₫
[Hủy] [Áp dụng]
```

- Chỉ editable khi token pattern tương thích.
- Nếu formula có ngoặc hoặc hơn hai operands, hiển thị summary read-only và CTA chuyển Nâng cao.
- Apply tạo đúng legacy tokens.

Advanced editor:

- Hiển thị token sequence.
- Insert/replace/remove/move field/operator/constant.
- Dùng button controls làm fallback, không phụ thuộc hoàn toàn vào drag.
- Dùng diagnostics và evaluator hiện tại.
- Không cho chọn reference chắc chắn tạo cycle; vẫn giữ diagnostics phòng thủ.

Draft semantics:

- Edit diễn ra trên local draft của formula đang chọn.
- Preview tính từ `fields` với draft thay thế tạm thời.
- Apply commit tokens/result settings vào store.
- Cancel khôi phục committed formula.
- Chuyển formula khi draft bẩn phải Apply, Discard hoặc Stay; không âm thầm mất dữ liệu.

### 5.4. Cột 4 — Form Workspace

Toolbar:

- Form summary.
- Expand Form.
- Preview/Entry CTA hiện tại.
- Open Data/Formula controls ở breakpoint hẹp.

Canvas:

- Chỉ render definitions có ID trong `formOrder`.
- Lookup definition từ `fields` theo ID.
- Giữ grid 12 cột, span và responsive card behavior.
- Formula card hiển thị committed value, không hiển thị unapplied draft.
- End drop zone giữ nguyên.

Field Properties Drawer:

- Mở bên trong Form Workspace khi chọn data field.
- Label, business role, width, position, required, default, placeholder, options, min/max/integer.
- Với formula card, selection chuyển sang cột 2/3; layout-only properties có thể mở mini drawer nếu cần.

Expand Form:

- Tạm ẩn cột 1–3.
- Không thay selection hoặc state.
- Escape/Back trả về layout trước đó.
- Dùng cho form dài hoặc kiểm tra field widths.

## 6. Formula Workspace

### 6.1. Mục tiêu

- Không ép formula dài vào cột 3.
- Giữ cùng token engine và diagnostics.
- Cho người dùng thấy formula, dependencies, preview và operands trong một màn hình.

### 6.2. Layout

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ ← Quay lại bốn cột | Formula: Tổng thanh toán | Valid | Hủy | Áp dụng       │
├────────────────────────────────────────────┬─────────────────────────────────┤
│ Token editor                               │ Preview & diagnostics           │
│                                            │ Current values                  │
│ [Thành tiền] − [Chiết khấu] + [VAT]       │ Result                          │
│                                            │ Direct dependencies             │
│ Field/operator/constant controls           │ Affected formulas               │
└────────────────────────────────────────────┴─────────────────────────────────┘
```

### 6.3. State restoration

Khi quay lại bốn cột phải giữ:

- Selected formula ID.
- Basic/Advanced mode.
- Draft tokens.
- Active token/caret position.
- Scroll positions của Formula List, Setup và Form.
- Form expansion/collapse state trước đó.

## 7. Component architecture

### 7.1. Reuse

| Component/module | Cách dùng |
|---|---|
| `formula.ts` | Evaluator canonical V6.0 |
| `formula-diagnostics.ts` | Validation/preview diagnostics |
| `field-dependencies.ts` | Delete safety và dependency summary |
| `FieldCard.tsx` | Card rendering và sortable field |
| `TokenChips.tsx` | Token presentation |
| `EntryWorkspace.tsx` | Entry UI; đổi sang ordered placed fields |
| `template.ts` | Field templates và arithmetic presets |

### 7.2. Refactor

| File | Sau refactor |
|---|---|
| `BuilderWorkspace.tsx` | DndContext, collision strategy, workspace state và composition |
| `Palette.tsx` | Chỉ còn reusable Data palette primitives hoặc được thay bởi DataFieldColumn |
| `Inspector.tsx` | Tách formula editor và field properties; file cũ trở thành adapter rồi được loại sau regression |
| `form.ts` | Definition registry + `formOrder` + placement actions + v3 migration |
| `NhapLieuPage.tsx` | Page-level confirm và workspace expansion |
| `index.css` | Four-column grid, rails, sheets và workspace responsive |

### 7.3. Component mới đề xuất

```text
BuilderWorkspace
├── DataFieldColumn
├── FormulaFieldColumn
├── FormulaSetupPanel
├── FormWorkspace
│   └── FieldPropertiesDrawer
└── FormulaWorkspace
```

Trách nhiệm:

- `DataFieldColumn`: PAL_DATA, search, add/drag.
- `FormulaFieldColumn`: formula definitions, status, create/place/detach/delete.
- `FormulaSetupPanel`: formula draft session, Basic/Advanced và diagnostics.
- `FormWorkspace`: placed fields, reorder, drop targets và expand.
- `FieldPropertiesDrawer`: non-formula configuration.
- `FormulaWorkspace`: expanded editor sử dụng cùng draft controller với Setup panel.

Không tạo store riêng cho mỗi component. Business state tiếp tục ở `useFormStore`; ephemeral UI state đặt ở BuilderWorkspace hoặc hook cục bộ.

## 8. State và data flow

### 8.1. Persisted state v3

```ts
interface FormStateV3 {
  fields: Field[];
  formOrder: string[];
  mode: 'design' | 'test';
  sel: string | null;
  seq: number;
  saved: number;
  slips: SavedSlip[];
  lastSaveFingerprint: string | null;
  lastSaveAt: number;
  updatedAt: number;
}
```

Không persist:

- Validation messages.
- Toast.
- Undo action/history.
- Open drawers.
- Draft formula của phiên nếu chưa quyết định chính sách recovery P1.

### 8.2. Store actions mới/đổi

```ts
addDataField(item, placementIndex?)
createFormula(preset?)
placeField(fieldId, placementIndex?)
detachFormula(fieldId)
movePlacedField(fromIndex, toIndex)
removeDefinition(fieldId)
getPlacedFields()
```

Compatibility:

- `add()` có thể được giữ như adapter trong quá trình chuyển đổi.
- `move()` phải chuyển sang thao tác trên `formOrder` cho canvas.
- `remove()` được tách semantics: data field delete, formula detach và hard-delete formula.

### 8.3. Placement invariants

- `formOrder` không chứa ID trùng.
- Mọi ID trong `formOrder` phải tồn tại trong `fields`.
- Data field mới được placed ngay.
- Formula mới không placed.
- Hard-delete loại ID khỏi cả `fields` và `formOrder`.
- Detach chỉ loại ID khỏi `formOrder`.
- Reorder không thay ID hoặc tokens.

### 8.4. Formula validation scope

Tạo tập formula cần validate:

1. Lấy mọi placed formula từ `formOrder`.
2. Thêm formula mang sales role bắt buộc.
3. Duyệt đệ quy token references để lấy formula dependencies.
4. Chạy diagnostics trên tập reachable.

Unplaced formula không reachable được xem là draft registry item và không chặn save.

### 8.5. Entry flow

```text
formOrder
  → lookup fields by ID
  → filter missing IDs defensively
  → render in order
  → formula calc still receives complete fields registry
```

### 8.6. Delete flow

Data field:

1. Tính dependents.
2. Nếu không có dependent: confirm rồi delete definition + placement.
3. Nếu có dependent: block mặc định; cho Cancel hoặc explicit hard-delete làm dependent invalid.

Formula field:

- `Remove from Form`: detach, không confirm destructive.
- `Delete formula`: dependency-aware hard-delete.
- Formula đang làm sales role bắt buộc phải cảnh báo submission sẽ bị chặn.

## 9. Migration v2 → v3

### 9.1. Algorithm

```text
input = persisted v2 state

fields = migratedFields(input.fields ?? salesTemplate())
validIds = ordered unique IDs từ fields
formOrder = nếu input.formOrder hợp lệ thì sanitize, ngược lại validIds
sel = validIds chứa input.sel ? input.sel : null
seq = max(input.seq, max suffix của /^n(\d+)$/ + 1, 1)
slips = input.slips ?? []
preserve all remaining known/unknown keys
```

### 9.2. Backup

- Trước lần persist v3 đầu tiên, đọc raw `oneflow-form`.
- Nếu payload version 2 và chưa có backup, lưu vào `oneflow-form:v2-backup`.
- Không ghi đè backup đã tồn tại trong cùng rollout.
- Backup operation phải xử lý localStorage exception mà không crash app.

### 9.3. Idempotence

- Chạy migration trên state đã migrate không thêm duplicate `formOrder`.
- Không thay `fields`, tokens hoặc slips ở lần thứ hai.
- Không giảm `seq`.

### 9.4. Rollback

- Feature flag cho renderer V5/V6.
- V5 renderer có thể bỏ qua `formOrder` và tiếp tục đọc `fields`.
- Nếu cần downgrade store, khôi phục raw v2 backup sau khi người dùng xác nhận ở quy trình vận hành.
- Không tự động xóa v3 hoặc submissions mới.

## 10. UX flows V6.0

### 10.1. Tạo form lần đầu

- Mở sales template hiện tại.
- Bốn column headings và helper text xuất hiện ngay.
- First-run journey chỉ giải thích: thêm field, tạo formula, kéo result vào Form, nhập thử.
- Không quảng bá custom generic submission trong V6.0.

### 10.2. Thêm Số lượng và Đơn giá

1. Tìm/chọn Số tại Data Column.
2. Click/drag vào Form.
3. Properties Drawer mở; đặt tên Số lượng.
4. Lặp lại cho Tiền tệ/Đơn giá.

Ở mobile, click-to-add là flow chuẩn; không yêu cầu drag.

### 10.3. Tạo Thành tiền

1. `+ Công thức mới`.
2. Nhập `Thành tiền`.
3. Chọn Basic.
4. Operand A = Số lượng.
5. Operator = Nhân.
6. Operand B = Đơn giá.
7. Kiểm tra preview và Apply.
8. Drag Thành tiền từ cột 2 vào Form.

### 10.4. Formula arithmetic dài

- Chọn formula từ cột 2.
- Mở Nâng cao hoặc Formula Workspace.
- Thêm/reorder token, constant và parentheses.
- Preview draft; Apply khi diagnostics valid.

### 10.5. Formula điều kiện

- Không hỗ trợ trong V6.0.
- Không cung cấp workaround bằng chuỗi token không hợp lệ.
- Tài liệu UI/help chỉ ra đây là capability V6.1.

### 10.6. Rename hoặc delete reference

- Rename cập nhật label display; tokens giữ ID.
- Detach field không làm mất definition.
- Hard-delete có dependency list và explicit destructive confirmation.
- Missing legacy reference vẫn hiển thị diagnostics và cho chọn replacement.

### 10.7. Mở form đã lưu

- Backup v2 nếu cần.
- Migration tạo `formOrder` theo field order cũ.
- Bốn cột render cùng field/formula IDs.
- Selection stale được reset về null.

### 10.8. Nhập phiếu

- Entry Workspace render theo `formOrder`.
- Formula helper unplaced vẫn được evaluator sử dụng nếu referenced.
- Sales validation, duplicate prevention và report link giữ nguyên.

## 11. Implementation roadmap

### Phase 0 — Baseline và migration contract

**Mục tiêu:** khóa behavior và dữ liệu trước khi thay UI.

**Files:**

- `src/store/form.test.ts`
- `src/lib/formula*.test.ts`
- `src/lib/form-validation.test.ts`
- `e2e/nhap-lieu.spec.ts`

**Thay đổi:** chỉ bổ sung fixtures/tests; chưa đổi runtime.

**Giữ nguyên:** toàn bộ ứng dụng.

**Rủi ro:** fixture chỉ kiểm tra template mặc định.

**Test:** default, renamed fields, deleted ref, cycle, slips, stale seq/sel.

**Acceptance:** baseline cũ đạt; fixture v2 được review; backup key được khóa.

**Gate:** chưa đạt migration contract thì không sang Phase 1.

### Phase 1 — Four-column shell

**Mục tiêu:** layout bốn cột bằng views derived từ `fields`, chưa đổi schema.

**Files:** `BuilderWorkspace.tsx`, `index.css`, column components mới.

**Dependency:** Phase 0.

**Giữ nguyên:** store, engine, Entry, save/report/export.

**Rủi ro:** Form quá hẹp, nested scroll, drawer che drop zone.

**Test:** 1920, 1440, 1280, 1024, 768, 390; zoom 125%; independent scroll.

**Acceptance:** 1920 có bốn cột; 1440 có rails; Form ≥560px khi split; không body overflow.

**Gate:** visual/responsive review đạt.

### Phase 2 — Component split và UX nền tảng

**Mục tiêu:** ổn định vai trò mỗi cột và selection flow.

**Files:** `Palette.tsx`, `Inspector.tsx`, `FieldCard.tsx`, components mới.

**Dependency:** Phase 1.

**Giữ nguyên:** actions hiện tại và formula tokens.

**Rủi ro:** duplicate controls, selection race khi drawer đóng.

**Test:** formula select → Setup; data select → Properties; focus restore; expand/collapse.

**Acceptance:** không cần chọn field hai lần; headings/empty states dễ hiểu.

**Gate:** walkthrough add/edit/formula đạt.

### Phase 3 — Schema v3 và placement

**Mục tiêu:** formula definition độc lập với Form.

**Files:** `store/form.ts`, Builder/Entry, validation/dependency modules.

**Dependency:** Phase 0–2.

**Giữ nguyên:** `Field`, `Token`, evaluator và slips.

**Rủi ro:** mất order, draft chặn save, detached formula render sai.

**Test:** migration/idempotence, create/place/detach/re-place, reload, helper dependency, hard-delete.

**Acceptance:** IDs/tokens/slips không đổi; formula result parity; unplaced unused formula không chặn save.

**Gate:** migration suite và rollback drill đạt.

### Phase 4 — Formula Setup và Formula Workspace

**Mục tiêu:** Basic formula nhanh; formula dài có không gian đủ rộng.

**Files:** Formula Setup/Workspace mới; reuse formula/diagnostics/TokenChips.

**Dependency:** Phase 2–3.

**Giữ nguyên:** arithmetic semantics.

**Rủi ro:** Basic/Advanced token mismatch; mất draft.

**Test:** A×B, constants, parentheses, dependencies, mode compatibility, preview errors, Apply/Cancel.

**Acceptance:** Simple formula flow đạt; complex formula không bị ép vào Basic; Form chỉ dùng committed tokens.

**Gate:** evaluator parity và UX walkthrough đạt.

### Phase 5 — Integration và regression

**Mục tiêu:** bảo toàn toàn bộ sales workflow và downstream.

**Files:** Form Workspace/Drawer, `NhapLieuPage.tsx`, Entry, export và E2E.

**Dependency:** Phase 1–4.

**Giữ nguyên:** sales validation, SavedSlip, reports và exports.

**Rủi ro:** field order làm đổi fingerprint/total/report rows.

**Test:** mười business flows, save/reload/dedupe, reports, approval, XLSX/DOCX/PPTX, keyboard/mobile.

**Acceptance:** old tests + V6 tests đạt; report/export parity; routes khác không regress.

**Gate:** chỉ bật V6 mặc định sau acceptance đầy đủ.

### Phase 6 — V6.1 Formula Engine

RFC/project riêng sau khi V6.0 ổn định. Không được bắt đầu bằng cách mở rộng ngầm token/evaluator trong Phase 1–5.

## 12. P0/P1/P2 backlog

| ID | Pri | Loại | Phạm vi / files | Dependency | Complexity | Risk | Acceptance/Test |
|---|---|---|---|---|---|---|---|
| V6-000 | P0 | Testing | Baseline fixtures; formula/store/validation tests | — | M | Thiếu legacy cases | Tất cả baseline đạt |
| V6-001 | P0 | UI-only | Four-column shell; Builder + CSS | 000 | L | Responsive overflow | Six viewport matrix đạt |
| V6-002 | P0 | UI-only | Data/Formula/Setup/Form component split | 001 | L | Selection drift | Selection tests đạt |
| V6-003 | P0 | UI + State | Field Properties Drawer | 002 | M | Duplicate settings | Property parity đạt |
| V6-004 | P0 | Data Migration | `formOrder`, version 3, sanitize state | 000–002 | L | Mất ID/order | Migration fixtures đạt |
| V6-005 | P0 | Data Migration | v2 backup và rollback adapter | 004 | M | Backup overwrite | Rollback drill đạt |
| V6-006 | P0 | UI + State | Formula create/place/detach/delete | 004 | L | Invalid draft/save | Placement suite đạt |
| V6-007 | P0 | UI + Logic | Basic arithmetic editor | 006 | M | Token mismatch | A/op/B round-trip đạt |
| V6-008 | P0 | UI + Logic | Advanced token editor + Workspace | 006–007 | L | Draft loss | Apply/Cancel/restore đạt |
| V6-009 | P0 | Business Logic | Reachable formula validation/delete safety | 004–008 | L | Broken dependencies | Cycle/missing/delete tests đạt |
| V6-010 | P0 | Integration | Entry/report/export regression | 004–009 | L | Downstream data change | Sales parity đạt |
| V6-101 | P1 | UI + State | Full Undo/Redo transaction history | V6.0 | L | Memory/history semantics | 20-step undo/redo suite |
| V6-102 | P1 | UI + State | Formula clone/name warnings | 006 | M | Duplicate labels | New ID, same tokens |
| V6-103 | P1 | UI | Dependency graph view | 009 | M | Visual clutter | Direct/transitive accuracy |
| V6-104 | P1 | UI + State | Persist panel widths | 001 | M | Bad restored size | Clamp/reset tests |
| V6-105 | P1 | Accessibility | Keyboard DnD/focus/axe | V6.0 | M | Incomplete parity | Keyboard flows, no critical axe issue |
| V6-106 | P1 | Performance | Large-form profiling/memoization | V6.0 | M | Premature optimization | 100 fields/50 formulas target |
| V6-201 | P2 | Formula Engine | AST/type system/conditional funcs | V6.0 | XL | Semantic drift | RFC + parity fixtures |
| V6-202 | P2 | Business Logic | Generic submission profiles | V6.0 | XL | Report compatibility | Separate architecture approval |
| V6-203 | P2 | Formula Engine | Lookup/date/aggregates | 201–202 | XL | Missing data model | Dedicated source schemas |

## 13. Test strategy

### Unit

- Current arithmetic parity.
- Migration v2→v3 và idempotence.
- `formOrder` sanitize/dedupe.
- Placement actions.
- Reachable formula validation.
- Dependency-aware delete.
- Basic editor token conversion.
- Formula draft preview.

### Store integration

- Add data creates definition + placement.
- Create formula only creates definition.
- Place/detach/re-place giữ ID/tokens.
- Reorder chỉ đổi Form placement.
- Hard-delete xóa placement và xử lý dependents.
- Reload giữ placement và selection hợp lệ.
- Single-step Undo hiện tại không regress.

### Component

- Column headings và empty states.
- Selection sync giữa list/setup/card.
- Drawer focus restoration.
- Basic/Advanced compatibility.
- Formula Workspace state restoration.
- Apply/Cancel draft.

### E2E business flows

1. Mở sales template lần đầu.
2. Thêm Số lượng và Đơn giá.
3. Tạo Thành tiền bằng Basic editor.
4. Xác nhận conditional formula chưa được cung cấp trong V6.0.
5. Tạo arithmetic formula nhiều dependency.
6. Sửa formula đã tồn tại.
7. Rename và dependency-aware delete.
8. Sửa formula lỗi.
9. Reload migrated form.
10. Nhập, save, report và export.

### Responsive

| Viewport | Expected |
|---:|---|
| 1920 | Bốn cột đầy đủ |
| 1440 | Hai rails + Setup + Form |
| 1280 | Rails; Setup collapsible; Form usable |
| 1024 | Single main workspace + drawers |
| 768 | Workspace tabs/sheets |
| 390 | Mobile single-pane, tap-first |

Mọi viewport:

- Không body horizontal overflow.
- Primary actions reachable.
- Không action che field label/hit target.
- Drawer/sheet scroll độc lập.

### Migration

- Default v2 template.
- Renamed/reordered fields.
- Legacy fields thiếu role/result settings.
- Broken reference và cycle.
- Stale selection.
- Stale `seq` có `n1/n7`.
- Existing slips và fingerprints.
- Unknown properties.
- Second migration pass.

### Regression

- 35 unit tests hiện tại.
- 25 Playwright tests hiện tại.
- Build TypeScript/Vite.
- Report row và duplicate prevention.
- XLSX/DOCX/PPTX export smoke tests.

## 14. Acceptance Criteria V6.0

- Đúng thứ tự bốn khu vực ở desktop rộng.
- 1440px không ép bốn panel đầy đủ.
- Form không nhỏ hơn 560px khi hiển thị cạnh Formula Setup.
- Data và Formula có entry point riêng, rõ nghĩa.
- Formula definition có thể tồn tại khi chưa placed.
- Formula được placed tối đa một lần.
- Detach không xóa definition hoặc tokens.
- Basic A/operator/B tạo đúng legacy tokens.
- Formula dài chỉnh được trong Formula Workspace.
- Apply/Cancel không làm mất hoặc commit nhầm draft.
- Existing field IDs, tokens, spans, roles và slips được bảo toàn.
- f1–f4 vẫn tính 15.000.000, 750.000, 1.425.000 và 15.675.000.
- Sales validation, duplicate prevention, report và export không đổi kết quả.
- Unplaced unused draft formula không chặn save.
- Formula dependency của placed formula vẫn được validate.
- Single-step Undo hiện tại không regress.
- Không có route ngoài phạm vi bị thay đổi.

## 15. Risk và mitigation

| Risk | Pri | Mitigation |
|---|---|---|
| Migration làm mất order/ID | P0 | Backup, pure migration, fixtures, idempotence |
| Draft formula chặn save | P0 | Reachability-based validation |
| Detached formula render trong Entry | P0 | Entry chỉ map `formOrder` |
| Report/export sai dữ liệu | P0 | Giữ SavedSlip; parity tests |
| Layout 1440 quá hẹp | P0 UX | Rails, min-width, collapsible Setup |
| Apply/Cancel state sai | P0 UX | Draft controller dùng chung Setup/Workspace |
| Hard-delete tạo dangling refs | P0 | Dependency-aware confirmation/block |
| V6.1 scope lọt vào V6.0 | P0 project | Không đổi evaluator/token; RFC gate |
| Full Undo/Redo bị kỳ vọng | P1 | Copy chính xác; backlog riêng |
| localStorage quota/conflict | P1 | Backup/error handling; backend roadmap |

## 16. Rollout và rollback

### Rollout

1. Merge Phase 0 tests.
2. Ship Phase 1–2 sau visual review, chưa bật schema v3.
3. Ship migration v3 sau fixture review và backup verification.
4. Chạy sales/report/export regression.
5. Bật V6 bằng feature flag cho test users.
6. Bật mặc định sau responsive, migration và downstream acceptance.

### Rollback

- Tắt feature flag để dùng renderer V5.
- Renderer V5 bỏ qua `formOrder` và tiếp tục dùng `fields`.
- Giữ legacy tokens và evaluator trong toàn bộ V6.0.
- Không tự động downgrade/xóa v3 state.
- Có raw v2 backup để phục hồi có kiểm soát.
- Mọi rollback phải giữ `slips` và không tạo duplicate records.

## 17. Quyết định đã khóa trước khi code

- V6.0 giữ sales-specific save/report/export.
- Generic custom submission là P2 riêng.
- V6.0 giữ Formula Engine arithmetic hiện tại.
- IF/IFS/AND/OR/ROUND/MIN/MAX thuộc V6.1.
- Formula definition tách placement bằng `formOrder`, không tách sang database/model mới.
- Bốn cột đầy đủ chỉ từ desktop rất rộng; 1440px dùng rails.
- Field Properties nằm trong Form Workspace, không chiếm cột Formula Setup.
- Full Undo/Redo không phải P0.
- Không triển khai source cho đến khi tài liệu này được phê duyệt.

## 18. Vấn đề còn tồn tại sau kế hoạch

- Không có artifact Git định danh chính xác V5.2.
- Custom blank form vẫn không submit được trong V6.0 nếu thiếu sales roles.
- Formula conditions và spreadsheet functions chưa có trong V6.0.
- Persistence vẫn là localStorage.
- Chưa có production metrics cho form rất lớn.
- Checkbox và các field type mới chưa được duyệt nghiệp vụ.

Những điểm này được ghi nhận nhưng không chặn triển khai V6.0 theo phạm vi tối thiểu.
