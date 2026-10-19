# AUDIT FORM BUILDER V6

**Dự án:** NKC Workflow / OneFlow  
**Phạm vi:** `/nhap-lieu`, Form Builder, Formula Builder, nhập phiếu và các điểm tích hợp trực tiếp  
**Ngày audit:** 19/10/2026  
**Trạng thái:** Audit và lập kế hoạch; chưa triển khai V6

## 1. Executive Summary

Form Builder hiện tại là một bản triển khai hoạt động được của Phiếu bán hàng, không phải một nền tảng form tổng quát hoàn chỉnh. Hệ thống đã có nền tảng kỹ thuật tốt cho V6: field ID ổn định, formula token tham chiếu bằng ID, evaluator thuần, dependency diagnostics, kéo thả bằng dnd-kit, Zustand persistence, nhập phiếu và các luồng Báo cáo/Export đã có test.

Những giới hạn chính không nằm ở khả năng cộng/trừ/nhân/chia, mà nằm ở cách tổ chức UI và cách một mảng `fields` đang đồng thời đảm nhiệm definition registry, thứ tự Form, placement, dữ liệu nhập và nguồn cho validation/reporting. Formula Builder bị đặt chung trong Inspector hẹp; formula presets và formula definitions chưa được tách; custom form vẫn bị bắt buộc phải có các business role của Phiếu bán hàng.

Kết luận phạm vi V6.0:

- Tái thiết kế thành bốn khu vực: Trường dữ liệu, Trường công thức, Setup công thức, Form Workspace.
- Tái sử dụng Formula Engine và token schema hiện tại; không đưa AST, IF/ELSE hoặc spreadsheet functions vào V6.0.
- Tách formula definition khỏi Form placement bằng thay đổi tối thiểu `formOrder`, không tái cấu trúc toàn bộ `Field` model.
- Giữ nguyên sales submission, reporting và export trong V6.0.
- Tách Formula Engine V6.1 và generic multi-department submission thành dự án riêng.

## 2. Phương pháp và bằng chứng

Audit sử dụng:

- Đọc source và test trong repository.
- Kiểm tra git history và revision cũ nhất có thể đối chiếu.
- Chạy unit test, E2E và production build hiện tại.
- Đo runtime layout bằng Chromium tại 1920, 1440, 1280 và 1024.
- Thử runtime cho Undo hiện tại và custom form thiếu sales roles.
- Kiểm tra screenshot ở 1920, 1440, 1280, 1024, 768 và 390.

Kết quả baseline:

- 35/35 unit tests đạt trong lượt kiểm tra đầy đủ.
- 25/25 Playwright E2E đạt.
- 30/30 test tập trung cho store, formula, diagnostics và validation đạt ở lượt xác minh bổ sung.
- Production build đạt; còn cảnh báo chunk lớn, nổi bật `exceljs` khoảng 938 kB trước gzip.
- Worktree sạch trước khi tạo hai tài liệu V6.

## 3. Stack và cấu trúc thực tế

### 3.1. Phiên bản đã xác minh

| Hạng mục | Phiên bản |
|---|---:|
| React / React DOM | 18.3.1 |
| TypeScript | 5.7.2 |
| Vite | 6.0.7 |
| Tailwind CSS | 4.1.4 |
| Zustand | 5.0.2 |
| dnd-kit core | 6.3.1 |
| dnd-kit sortable | 10.0.0 |
| Vitest | 2.1.8 |
| Playwright | 1.64.1 |

### 3.2. Component và module chính

| File hiện tại | Trách nhiệm | Đánh giá V6 |
|---|---|---|
| `src/pages/NhapLieuPage.tsx` | Mode Design/Entry, confirm, guide, save và orchestration | Giữ vai trò page shell; bổ sung workspace expansion state |
| `src/components/nhap-lieu/BuilderWorkspace.tsx` | DndContext, palette/canvas/inspector, drawer state | Cần refactor thành orchestrator bốn cột |
| `src/components/nhap-lieu/Palette.tsx` | Trộn data field library và formula presets | Tách Data Field Column; formula definitions chuyển sang cột 2 |
| `src/components/nhap-lieu/Inspector.tsx` | Thuộc tính data field và toàn bộ formula editor | Tách Formula Setup và Field Properties Drawer |
| `src/components/nhap-lieu/FieldCard.tsx` | Field/formula card, resize, delete, inline preview | Tái sử dụng phần lớn; thêm detach semantics cho formula |
| `src/components/nhap-lieu/EntryWorkspace.tsx` | Render nhập phiếu và computed result | Tái sử dụng; đổi nguồn order sang `formOrder` |
| `src/components/nhap-lieu/TokenChips.tsx` | Hiển thị field/operator/constant token | Giữ nguyên trong V6.0 |
| `src/store/form.ts` | Form state, persistence, CRUD, formula token, save | Bổ sung placement actions và migration v3; không thay evaluator |
| `src/lib/formula.ts` | Token types, numeric parser và recursive evaluator | Giữ nguyên trong V6.0 |
| `src/lib/formula-diagnostics.ts` | Syntax, missing reference, cycle, divide-by-zero | Tái sử dụng |
| `src/lib/field-dependencies.ts` | Direct/transitive dependents | Tái sử dụng cho delete/detach safety |
| `src/lib/form-validation.ts` | Generic field validation cộng sales-role validation | Giữ behavior V6.0; ghi rõ giới hạn sales-specific |
| `src/lib/field-semantics.ts` | Role migration và fallback mapping | Giữ nguyên; kiểm thử với `formOrder` |
| `src/lib/export.ts` | XLSX/DOCX/PPTX theo SavedSlip | Không đổi logic trong V6.0 |
| `src/data/template.ts` | Sales template, field kinds và formula presets | Tái sử dụng |
| `src/index.css` | Workspace layout, drawers, responsive/container queries | Thay đổi lớn cho bốn cột |

## 4. Kiến trúc Form Builder hiện tại

### 4.1. Layout

Desktop rộng sử dụng ba vùng:

```text
Palette 244px | Canvas min 720px | Inspector 340px
```

Source evidence:

- `src/index.css:150` khai báo `grid-template-columns: 244px minmax(720px, 1fr) 340px`.
- `src/index.css:392-395` chuyển workspace thành một cột khi builder container nhỏ hơn hoặc bằng 1279px.
- Palette và Inspector được chuyển thành overlay drawer ở breakpoint này.

Runtime metrics:

| Viewport | Content sau sidebar | Palette | Canvas | Inspector | Form surface |
|---:|---:|---:|---:|---:|---:|
| 1920×1080 | 1710 | 244 | 1126 | 340 | 1066 |
| 1440×900 | 1230 | Drawer/0 | 1230 | Drawer/0 | 1170 |
| 1280×800 | 1070 | Drawer/0 | 1070 | Drawer/0 | 1010 |
| 1024×768 | 814 | Drawer/0 | 814 | Drawer/0 | 754 |

Nhận xét:

- Ở 1920px, ba vùng độc lập hoạt động tốt và có scroll riêng.
- Ở 1440px, canvas rộng nhưng library/settings cần mở drawer; người dùng mất khả năng nhìn đồng thời nguồn field, formula setup và kết quả Form.
- Không thể đặt bốn cột đầy đủ trong 1230px mà vẫn bảo vệ Form tối thiểu 560px và Formula Setup khoảng 360–400px.
- Mobile không có horizontal overflow, nhưng Form dài và drag không phải thao tác phù hợp nhất.

### 4.2. Canvas và field layout

- Form sử dụng grid 12 cột và `span` thuộc field.
- Các giá trị span hiện có: 2, 3, 4, 6, 12.
- Container queries tự nâng span khi canvas hẹp.
- Builder cho resize bằng nút và Inspector.
- Entry Workspace có responsive rules riêng; cần giữ parity khi V6 dùng `formOrder`.

### 4.3. Các khu vực chiếm diện tích

- Header có mode switch, autosave, template, clear và CTA Entry; ở 1024px header wrap thành hai hàng.
- First-run guide đã được thu gọn, không còn là vấn đề chính.
- Inspector formula chứa name, role, width, position, formula tokens, presets, operands, operators, constants, result kind, precision và diagnostics trong cùng một vùng 340px.
- Vấn đề chính là mật độ và chức năng trộn lẫn, không chỉ là chiều rộng cố định.

## 5. Audit trường dữ liệu

### 5.1. Field kinds hiện có

| Kind | Thư viện | Entry control | Formula operand |
|---|---|---|---|
| `text` | Có | Text input | Không |
| `number` | Có | Decimal/text input | Có |
| `money` | Có | Decimal/text input + currency suffix | Có |
| `percent` | Có | Decimal/text input + `%` | Có |
| `date` | Có | Native date input | Không |
| `select` | Có | Select | Không |
| `person` | Có | Text input + datalist | Không |
| `formula` | Có dưới dạng preset | Computed card | Có |

Checkbox chưa tồn tại trong schema hoặc palette hiện tại.

### 5.2. Thuộc tính hỗ trợ

- ID, kind, label, span và optional business role.
- Required, placeholder, default/current value.
- Select/person options.
- Numeric min/max và integer.
- Formula result kind và precision.

### 5.3. ID và ảnh hưởng của thay đổi

- Template dùng ID `c1..c7` và `f1..f4`.
- Field mới dùng `n<seq>`.
- Formula token lưu `{ f: fieldId }`, không lưu label.
- Đổi tên field không phá formula reference.
- UI hiện không có thao tác đổi `kind`; vì vậy type-change compatibility chưa phải behavior cần preserve.
- Xóa field loại bỏ definition khỏi `fields` nhưng giữ token tham chiếu trong formula khác, tạo missing reference cho đến khi undo hoặc sửa formula.

### 5.4. Reuse và refactor

Tái sử dụng:

- Field schema và ID model.
- FieldCard, Entry controls, width/span và validation properties.
- Palette item definitions cho data fields.

Cần refactor:

- Data library tách khỏi formula presets.
- Properties của data field chuyển vào drawer trong Form Workspace.
- Thứ tự hiển thị Form tách khỏi definition registry bằng `formOrder`.

## 6. Formula Engine capability matrix

| Khả năng | Trạng thái | Bằng chứng/giới hạn |
|---|---|---|
| Cộng, trừ, nhân, chia | Hoạt động đúng | `evalItems()` và unit tests |
| Ưu tiên toán tử | Hoạt động đúng | `2 + 3 × 4 = 14` có test |
| Ngoặc lồng nhau | Hoạt động đúng | Recursive-descent parser có test |
| Số âm đơn ngôi | Hoạt động đúng | Có test cho `-5` và `4 × -2` |
| Constant tùy ý | Hoạt động | Inspector nhận decimal constant |
| Field reference bằng ID | Hoạt động | Token `{ f: id }` |
| Formula tham chiếu formula | Hoạt động | Template f2–f4 |
| Chuỗi dependency nhiều bước | Hoạt động | Template và `findDependents()` |
| Recalculation | Hoạt động tức thời | `calc(fields, id)` chạy từ state mới |
| Preview | Hoạt động | FieldCard, Inspector và Entry Workspace |
| Result number/money/percent | Hoạt động | `formatFormulaResult()` |
| Precision 0–6 | Hoạt động | Inspector và formatter |
| Empty/slot/operator/ngoặc lỗi | Có diagnostics | `formula-diagnostics.ts` |
| Missing reference | Có diagnostics | Token trỏ ID không tồn tại |
| Circular reference | Phát hiện | `seen` trong evaluator và `hasCycle()` trong diagnostics |
| Divide by zero | Phát hiện | Diagnostics parser riêng |
| Token insert/replace/remove/move | Có | Store actions hiện tại |
| Formula clone | Chưa có | Không có action/UI |
| Formula registry độc lập | Chưa có | Formula là phần tử của `fields` và canvas |
| IF/IFS/AND/OR | Chưa hỗ trợ | Token/Op chỉ có arithmetic và ngoặc |
| Comparison | Chưa hỗ trợ | Không có boolean/value type |
| ROUND/MIN/MAX | Chưa hỗ trợ | Không có function node |
| SUMIF/COUNTIF | Chưa hỗ trợ | Không có range/collection context |
| XLOOKUP/equivalent | Chưa hỗ trợ | Không có lookup source schema |
| Date formula | Chưa hỗ trợ | `calc()` chỉ parse numeric input |
| Excel-compatible raw formula | Chưa hỗ trợ | Không có text parser/AST |

### 6.1. Khả năng tái sử dụng

Formula Engine hiện tại nên được giữ nguyên trong V6.0 vì:

- Là pure logic tách khỏi component.
- Token reference bằng ID phù hợp với rename-safe editing.
- Đã có tests cho arithmetic, dependency và lỗi chính.
- Có thể phục vụ Basic editor dạng slot và Advanced structured token editor.

Không nên cố mở rộng bằng cách thêm IF/function trực tiếp vào `Token` và `evalItems()`. Các hàm điều kiện cần type system, AST, parser/serializer và null semantics; đó là phạm vi V6.1.

## 7. Audit Formula Builder UX

### Đang hoạt động tốt

- Preset Nhân/Cộng/Trừ/Tỷ lệ/VAT/Tự ghép.
- Field operands tự lấp slot trống.
- Token có thể chọn, thay, xóa và reorder.
- Constant tùy ý.
- Preview và diagnostic trực tiếp.
- Result type và precision.

### UX khó sử dụng

- Formula template và formula instance đang xuất hiện cùng trong Palette.
- Muốn sửa formula phải tìm formula card trên canvas trước.
- Preset, token editing và field properties cùng nằm trong một Inspector dài.
- Không có khái niệm Basic/Advanced rõ ràng.
- Formula dài wrap nhiều dòng trong panel 340px.
- Token reorder dùng native drag, chưa có keyboard equivalent đầy đủ.

### Có triển khai nhưng còn rủi ro

- Cycle được phát hiện sau khi người dùng tạo reference, chưa chặn candidate gây cycle.
- Delete warning liệt kê dependents nhưng vẫn cho xóa và tạo formula lỗi.
- Một diagnostic được hiển thị tại một thời điểm; chưa có dependency path hoặc focus-to-source đầy đủ.
- Formula editing cập nhật state ngay, không có Apply/Cancel transaction.

## 8. Drag/drop audit

### Đã hỗ trợ

- Palette item → Form bằng dnd-kit.
- Click-to-add fallback.
- Reorder field trên canvas.
- DragOverlay.
- Drop indicator và end drop zone.
- Pointer và KeyboardSensor cho field DnD.
- Auto-scroll chỉ cho các vùng có `data-dnd-scroll`.
- Escape đóng drawer khi không kéo.

### Chưa hỗ trợ hoặc dễ nhầm

- Formula definition chưa thể được kéo độc lập từ formula list vào Form.
- Không có detach formula khỏi Form mà vẫn giữ definition.
- Data field không được kéo trực tiếp vào Formula Setup; người dùng chọn operand bằng button.
- Token drag là native HTML drag, khác interaction model với dnd-kit.
- Undo không bao phủ add/reorder/drop.
- Mobile vẫn hiển thị drag affordance dù tap-to-add phù hợp hơn.

## 9. Undo/Redo audit

### Git history

- Repository không có tag/branch `V5.2`.
- Revision cũ nhất đối chiếu được có `undoToken()` với nhãn “Xoá ký hiệu cuối”, không có global Undo hoặc Redo.

### Bản hiện tại

`UndoAction` chỉ có:

- `delete`: lưu một field và index.
- `replace`: lưu một snapshot fields cho clear/load template.

`undoLast()` tiêu thụ action và đặt lại `undoAction = null`. Không có stack hoặc redo stack.

Runtime xác nhận:

- Default: 11 field.
- Sau “Làm trống”: 0 field.
- Toast có “Hoàn tác”.
- Sau Undo: 11 field.
- Không có control Redo.

Kết luận: full history là tính năng mới P1. V6.0 phải bảo toàn single-step Undo và không được ghi UI copy khiến người dùng hiểu rằng hệ thống có Redo đầy đủ.

## 10. State, persistence và tính toàn vẹn dữ liệu

### 10.1. Persisted state hiện tại

- Zustand persist key: `oneflow-form`.
- Version: 2.
- Persist: `fields`, mode, selection, sequence, saved count, slips, last-save fingerprint/time và updated time.
- Không persist validation, undo state hoặc toast.
- Mỗi mutation field gọi `updatedAt`; Zustand ghi localStorage gần như tức thời.
- Không có backend, retry, conflict resolution hoặc audit trail.

### 10.2. SavedSlip và downstream

- Slip lưu các trường bán hàng đã flatten: customer, staff, quantity, subtotal, VAT, total và metadata bổ sung.
- Slip không chứa snapshot đầy đủ của form schema hoặc formula version.
- Báo cáo lọc slip invalid rồi trộn với mock invoices.
- Export XLSX/DOCX/PPTX dùng SavedSlip shape cố định.

### 10.3. Custom form không lưu

Root cause:

1. `form-validation.ts` khai báo `REQUIRED_ROLES` cho mười role bán hàng.
2. `validateFormForSave()` luôn báo lỗi nếu thiếu bất kỳ role nào.
3. `store/form.ts` luôn gọi validation trước `slipFrom()`.

Runtime với một field Văn bản trả về chín lỗi thiếu staff, sale date, product, quantity, unit price, discount, subtotal, VAT và total. Đây là hạn chế nghiệp vụ có chủ ý của implementation hiện tại, không phải lỗi UI.

V6.0 giữ behavior này để tránh kéo generic record/reporting vào cùng dự án. Tài liệu và empty-state phải nói rõ template Phiếu bán hàng là workflow đang được hỗ trợ.

## 11. Ảnh hưởng khi tách formula definition khỏi placement

Các consumer hiện đọc trực tiếp `fields` theo thứ tự:

- Builder canvas.
- Entry Workspace.
- Add/move/remove actions.
- Validation và formula scan.
- Fingerprint/submission.
- Semantic role fallback.

Phương án ít xâm lấn:

```ts
interface FormStateV3 extends FormStateV2 {
  formOrder: string[];
}
```

Quy tắc:

- `fields` tiếp tục là definition registry và giữ nguyên thứ tự legacy.
- `formOrder` là danh sách ID duy nhất dùng cho canvas/entry placement.
- Data field được add vào cả `fields` và `formOrder`.
- Formula được create trong `fields`; placement là thao tác riêng.
- Formula evaluator luôn nhận toàn bộ `fields`.
- Validation bắt đầu từ placed formulas và duyệt dependencies; unplaced unused formula không chặn save.
- Sales roles bắt buộc phải tồn tại và được đặt trên Form.
- Hard-delete definition là destructive action riêng; detach không xóa tokens hoặc ID.

## 12. Migration v2 → v3

### Migration rule

```text
fields      := migratedFields(v2.fields)
formOrder   := unique existing field IDs theo đúng v2.fields order
sel         := giữ nếu ID còn tồn tại, ngược lại null
seq         := max(v2.seq, max numeric suffix của n<ID> + 1)
slips       := giữ nguyên
unknown keys:= giữ nguyên
```

### Rủi ro P0

- Regenerate ID làm hỏng toàn bộ formula references.
- Dedupe `formOrder` sai có thể làm mất một field khỏi canvas.
- Stale `seq` tạo duplicate ID.
- Persist v3 trước khi backup khiến rollback về code cũ khó khăn.
- Formula chưa placed nhưng invalid có thể chặn submission nếu validation vẫn scan tất cả fields.
- Entry Workspace có thể render detached formula nếu vẫn map trực tiếp `fields`.
- Reorder chỉ cập nhật `formOrder` nhưng legacy semantic fallback có thể vẫn dựa trên `fields` order.

### Mitigation

- Backup raw v2 vào key riêng trước lần ghi v3.
- Migration pure, idempotent và có fixture tests.
- Không xóa `tokens` hoặc thay engine trong V6.0.
- Feature flag cho renderer V5/V6.
- Rollback có thể bỏ qua `formOrder` và dùng lại `fields`.

## 13. UX flows hiện tại và mục tiêu V6.0

| Luồng | Hiện tại | Điểm khó | V6.0 |
|---|---|---|---|
| Tạo form lần đầu | Sales template có sẵn | Custom blank form không submit được | Giữ template; giải thích phạm vi sales |
| Thêm Số lượng/Đơn giá | Drag hoặc click; drawer ở 1440 | Mở/đóng library nhiều lần | Data Column/rail luôn có entry point rõ |
| Tạo Thành tiền | Add preset rồi chọn operand | Formula bị trộn trong palette | New formula → Basic A×B → Apply → drag vào Form |
| Chiết khấu điều kiện | Không hỗ trợ | Engine không có condition | Ghi rõ V6.1, không giả lập trong UI |
| Tổng nhiều field | Token editor làm được | Dài và wrap trong Inspector | Advanced token editor trong Formula Workspace |
| Sửa formula | Chọn card rồi Inspector | Khó tìm formula trong form dài | Chọn trực tiếp ở Formula Column |
| Rename/delete reference | Rename an toàn; delete tạo missing ref | Warning chưa ngăn lỗi | Rename giữ ID; detach riêng; hard-delete dependency-aware |
| Formula lỗi | Có diagnostic | Một message, panel hẹp | Diagnostic ở Formula Setup/Workspace |
| Reload form | localStorage tự khôi phục | Không có schema snapshot | Migration v3 và backup |
| Nhập phiếu/report | Hoạt động với sales roles | Không generic | Giữ nguyên V6.0 |

## 14. Thành phần nên giữ nguyên

- Formula token schema và evaluator.
- Dependency/diagnostics modules.
- Field IDs, roles và sales template.
- FieldCard/TokenChips behavior cốt lõi.
- dnd-kit sensors, DragOverlay và auto-scroll approach.
- Input controls và sales validation.
- SavedSlip, reporting và export adapters.
- Existing localStorage key và single-step Undo behavior.

## 15. Thành phần cần cải tiến

- BuilderWorkspace phải tách orchestration khỏi presentation.
- Palette phải tách data templates khỏi formula instances.
- Inspector phải tách thành Formula Setup và Field Properties Drawer.
- Store cần `formOrder` và placement actions.
- Formula delete phải phân biệt detach và hard-delete.
- Validation phải dùng reachability cho formula definitions chưa placed.
- Responsive cần rails/workspaces, không ép bốn cột tại 1440.

## 16. Risk Assessment

| Risk | Mức | Ảnh hưởng | Mitigation |
|---|---|---|---|
| v2→v3 làm mất ID/order | P0 | Formula/data hỏng | Backup, fixture migration, idempotence |
| Detached formula vẫn render/save sai | P0 | Sai dữ liệu nhập | `formOrder` là nguồn placement duy nhất |
| Validation scan draft formula chưa dùng | P0 | Không lưu được phiếu | Reachability-based formula validation |
| Sales report/export regress | P0 | Sai downstream | Giữ SavedSlip và regression tests |
| Bốn cột quá hẹp ở 1440 | P0 UX | Không thao tác được | Rails + min-width + workspace modes |
| Hai interaction systems cho drag | P1 | Touch/keyboard không đồng nhất | Giữ token editor button fallback; hardening P1 |
| Full Undo/Redo bị hiểu nhầm | P1 | Mất thao tác ngoài dự kiến | Copy đúng capability; history dự án riêng |
| localStorage mất/xung đột | P1 | Mất cấu hình | Backup key; backend là roadmap |
| Engine scope creep | P0 dự án | Viết lại hệ thống | Khóa arithmetic engine V6.0; V6.1 RFC riêng |

## 17. Những điểm chưa xác minh

- Không có artifact chính thức mang tên V5.2 trong Git để so sánh release-to-release.
- Không có backend hoặc production data sample ngoài localStorage fixtures.
- Chưa có số liệu thực tế về form lớn nhất và số formula lớn nhất của người dùng.
- Chưa có nghiệp vụ được phê duyệt cho checkbox, lookup, date formula hoặc generic reporting.

Các điểm này không chặn V6.0 layout nhưng phải được giải quyết trước các roadmap tương ứng.
