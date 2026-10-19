# IMPLEMENTATION REPORT — NKC WORKFLOW FORM BUILDER V6.0

Ngày hoàn tất kiểm chứng: 19/10/2026  
Nhánh triển khai: `codex/form-builder-v6`  
Phạm vi: `/nhap-lieu`, compatibility của Phiếu bán hàng, Báo cáo/Phê duyệt/Export và đồng bộ nhận diện logo.

## 1. Executive Summary

V6.0 đã được triển khai theo hướng nâng cấp có kiểm soát, không viết lại Formula Engine và không thay đổi nghiệp vụ Phiếu bán hàng. Form Builder mặc định sử dụng workspace bốn khu vực theo đúng thứ tự:

1. Trường dữ liệu.
2. Trường công thức.
3. Setup công thức.
4. Form Workspace.

Kết quả chính:

- Tách Data Field Library và Formula Registry thành hai khu vực độc lập.
- Tách formula definition khỏi placement bằng `formOrder`, nhưng giữ nguyên `Field[]`, ID và token schema.
- Thêm Basic Formula Editor, Advanced Structured Token Editor, preview/diagnostics và Formula Workspace mở rộng.
- Chuyển thuộc tính field thường sang Field Properties Drawer thuộc Form Workspace.
- Giữ `dnd-kit`, evaluator, diagnostics, dependency traversal và sales/report/export flow hiện có.
- Thêm migration v2 → v3 có raw backup, normalization, idempotence và feature-flag rollback về renderer V5.
- Responsive theo workspace thực tế: desktop rộng có đủ bốn cột; 1440px dùng hai rail + Setup + Form; tablet/mobile dùng single-pane/tab và click-to-add.
- Đồng bộ biểu tượng NKC OneFlow giữa trang chủ, sidebar ứng dụng, trang mô phỏng giao diện và favicon; mobile giữ symbol và ẩn wordmark để tránh chật navigation.

Không đưa vào V6.0: AST mới, IF/ELSE, IFS, AND/OR, hàm Excel, generic multi-department submission, full Undo/Redo, backend sync và version history.

## 2. Phạm vi và nguyên tắc bảo toàn

Các phần được giữ nguyên:

- `src/lib/formula.ts`: evaluator và arithmetic semantics.
- Formula token schema, field/formula ID và cách tham chiếu bằng ID.
- Bảy field type hiện có.
- Sales template và required sales roles.
- Required/default/placeholder/options/min/max/integer/span/result kind/precision.
- Single-step Undo cho delete/clear/load template.
- LocalStorage, saved slips, duplicate protection.
- Entry mode, reporting, approval và các exporter XLSX/DOCX/PPTX.
- Tất cả route ngoài `/nhap-lieu`.

Không có migration phá hủy, không reset dữ liệu người dùng, không đổi thư viện kéo thả và không tạo cú pháp formula giả vượt quá engine thực tế.

## 3. Phase Results

### Phase 0 — Baseline, Data Safety & Compatibility: PASS

Đã triển khai:

- Tạo nhánh `codex/form-builder-v6` từ revision baseline `63ecbd7`.
- Thêm schema version 3 với `formOrder: string[]`.
- Migration giữ nguyên unknown properties, fields, tokens, roles, spans, slips và timestamps.
- `formOrder` của v2 được dựng từ đúng thứ tự `fields` cũ.
- Loại stale/duplicate placement, chuẩn hóa `sel` không hợp lệ về `null`.
- Tính lại `seq` an toàn từ các ID dạng `n<number>` để tránh trùng ID.
- Chạy preflight trước App hydration: raw v2 được sao lưu tại `oneflow-form:v2-backup`, sau đó mới thay live envelope bằng v3.
- Migration có thể chạy lặp mà không làm thay đổi trạng thái đã migrate.
- Thêm renderer flag: localStorage `oneflow-builder-version = v5 | v6`; mặc định V6, có thể đặt `VITE_FORM_BUILDER_V6=false` để mặc định V5.
- Renderer V5 tiếp tục đọc toàn bộ `fields`; detached V6 definitions vẫn xuất hiện trong V5 khi rollback để tránh mất quyền truy cập dữ liệu.

Files chính:

- `src/store/form-persistence.ts`
- `src/store/form-persistence-preflight.ts`
- `src/store/form-persistence.test.ts`
- `src/store/form.ts`
- `src/store/form.test.ts`
- `src/main.tsx`
- `src/components/nhap-lieu/BuilderWorkspace.tsx`
- `src/components/nhap-lieu/BuilderWorkspaceLegacy.tsx`

Kiểm chứng:

- Production-shaped v2 fixture, stale `sel`, stale `seq`, unknown property và saved slips.
- Raw backup chỉ tạo một lần và không bị ghi đè.
- Durable migration xảy ra trước Zustand hydration.
- V5 feature flag được kiểm tra trong browser sau khi V6 đã tạo một formula chưa placement.

Rủi ro còn lại:

- Persistence vẫn là localStorage; backup là local trên cùng browser/profile.
- Không có server-side version history hoặc multi-user conflict handling trong V6.0.

### Phase 1 — Four-Column Workspace Foundation: PASS

Đã triển khai:

- Shell bốn khu vực, scroll độc lập, min-width và overflow guards.
- Setup width có thể resize trong khoảng 340–520px.
- Collapse Setup, expand Form và expanded Formula Workspace.
- Breakpoint thực tế:
  - `>= 1720px`: đủ bốn cột.
  - `1280–1719px`: Data/Formula thành rail/drawer, Setup và Form cùng hiển thị; Form tối thiểu 560px.
  - `768–1279px`: single main workspace, chuyển bằng tab/drawer.
  - `< 768px`: single-pane, tab cố định và click-to-add ưu tiên.
- Không horizontal body overflow tại các viewport kiểm thử.

Files chính:

- `src/components/nhap-lieu/BuilderWorkspaceV6.tsx`
- `src/index.css`
- `e2e/nhap-lieu.spec.ts`
- `e2e/form-builder-v6.spec.ts`

Kiểm chứng viewport:

- 1920×1080, 1600×900, 1440×900, 1366×768, 1280×800, 1280×720, 1024×768, 768×800 và 390×844.
- 125% zoom và chiều cao thấp.
- Scrollbar của workspace, drawer, report và textarea.

Rủi ro còn lại:

- Panel width chưa persist theo thiết bị; đây là P1 đã khóa ngoài acceptance V6.0.

### Phase 2 — Data Fields & Formula Fields: PASS

Đã triển khai:

- Data Field Column chỉ chứa bảy loại field thực tế, có search, drag handle và click-to-add.
- Formula Field Column là registry definition, có search, create, status, dependency count, select, drag/place, detach và hard-delete.
- Create formula chỉ thêm definition vào `fields`; place mới thêm ID vào `formOrder`.
- Detach chỉ loại placement, không xóa definition.
- Không cho duplicate placement.
- Hard-delete dùng confirmation hiện có và liệt kê dependency trực tiếp/bắc cầu trước thao tác.
- Formula helper không placement vẫn được evaluator truy cập khi formula trên Form tham chiếu đến nó.
- Formula draft chưa dùng không render ở Entry và không chặn save.

Files chính:

- `src/components/nhap-lieu/DataFieldColumn.tsx`
- `src/components/nhap-lieu/FormulaFieldColumn.tsx`
- `src/store/form.ts`
- `src/lib/form-validation.ts`
- `src/components/nhap-lieu/EntryWorkspace.tsx`

Kiểm chứng:

- Create → edit → place → detach → reload.
- Unplaced draft không chặn sales save.
- Unplaced helper được validate nếu reachable từ placed formula.
- Delete vẫn cảnh báo dependency và single-step Undo khôi phục definition cùng placement cũ.

Rủi ro còn lại:

- Clone formula và duplicate-name warning thuộc P1.
- V6.0 cảnh báo rõ nhưng vẫn cho phép hard-delete dependency sau xác nhận; dangling reference sau thao tác được diagnostics phát hiện.

### Phase 3 — Formula Setup & Formula Workspace: PASS

Đã triển khai:

- Local draft contract: thay đổi chỉ tác động preview cho đến khi bấm Áp dụng.
- Hủy thay đổi khôi phục committed formula.
- Khi chuyển formula trong lúc draft bẩn: chọn Áp dụng & chuyển, Bỏ thay đổi hoặc Ở lại.
- Basic Mode: A — operator — B/constant cho cộng, trừ, nhân, chia.
- Advanced Mode: token fields/formulas/operators/constants, replace, delete và reorder token.
- Formula phức tạp không tương thích Basic được giữ nguyên và Basic bị disable, không làm mất logic.
- Result type, precision, live preview và diagnostics.
- Formula Workspace mở rộng giữ draft/selection và quay lại bốn cột không reset.
- Không thay evaluator hoặc token schema.

Files chính:

- `src/components/nhap-lieu/useFormulaDraft.ts`
- `src/components/nhap-lieu/FormulaSetupPanel.tsx`
- `src/components/nhap-lieu/FormulaWorkspace.tsx`
- `src/components/nhap-lieu/BuilderWorkspaceV6.tsx`

Kiểm chứng:

- Basic `A × B`, constants và preview trước Apply.
- Advanced arithmetic nhiều token, ngoặc và dependency chain qua test evaluator/diagnostics hiện hữu.
- Missing reference, cycle, divide-by-zero, input missing và syntax diagnostics.
- Workspace back/restore và Cancel không đổi công thức đang chạy.

Rủi ro còn lại:

- Advanced là structured token editor, chưa phải Excel-like text editor.
- IF/ELSE và function engine không có trong V6.0.

### Phase 4 — Form Workspace Optimization: PASS

Đã triển khai:

- Canvas render theo `formOrder`; evaluator vẫn dùng complete `fields` registry.
- Drag data definition vào Form, drag formula definition vào Form và reorder placed fields bằng `dnd-kit` hiện có.
- Drop target cuối Form và visual drop state.
- Click-to-add trên thiết bị cảm ứng.
- Form expand mode.
- Field Properties Drawer độc lập khỏi Formula Setup.
- Giữ label, role, span, required, default value, placeholder, option list, min/max và integer.
- Input fields hard-delete khỏi Form theo hành vi cũ; formula card detach khỏi Form theo semantics mới.
- Entry Workspace chỉ render placed fields theo đúng thứ tự.

Files chính:

- `src/components/nhap-lieu/FormWorkspace.tsx`
- `src/components/nhap-lieu/FieldPropertiesDrawer.tsx`
- `src/components/nhap-lieu/FieldCard.tsx` (tái sử dụng)
- `src/components/nhap-lieu/EntryWorkspace.tsx`
- `src/index.css`

Kiểm chứng:

- Add, drag/drop, reorder, resize/span, select và delete/detach.
- Drawer focus, close và selection sau collapse/expand.
- Form dài và scroll độc lập.
- Reload giữ placement.

Rủi ro còn lại:

- Keyboard DnD sensor đã giữ, nhưng accessibility hardening toàn diện và screen-reader matrix là P1.
- Performance profiling 100 fields/50 formulas là P1.

### Phase 5 — Integration, Regression & Release Validation: PASS

Đã triển khai/kiểm chứng:

- Sales validation và required roles giữ nguyên.
- Công thức mẫu `f1–f4` và kết quả tổng mẫu giữ parity.
- Save, duplicate prevention, reload, saved slip và report handoff.
- Approval flow và tải file XLSX/DOCX/PPTX thực tế trong browser.
- V5 rollback renderer.
- Route/responsive regression.
- Đồng bộ logo NKC OneFlow bằng shared `BrandMark` tại Home, AppSidebar và GiaoDien preview; favicon dùng cùng geometry; mobile giữ symbol.

Files bổ sung/liên quan:

- `e2e/form-builder-v6.spec.ts`
- `e2e/branding.spec.ts`
- `e2e/report-export.spec.ts`
- `src/components/app/AppShell.tsx`
- `src/components/home/BrandMark.tsx`
- `src/pages/GiaoDienPage.tsx`
- `public/favicon.svg`
- `output/playwright/nhap-lieu-*.png`
- `output/playwright/nhap-lieu-entry-*.png`

Rủi ro còn lại:

- Vite vẫn cảnh báo chunk `exceljs` lớn hơn 500 kB; exporter đã được dynamic import như baseline nên đây không phải regression V6.
- Browser automation hiển thị warning môi trường `NO_COLOR`; không có runtime/console error nghiêm trọng trong kiểm tra trực quan.

## 4. UI/UX Validation

### Desktop rộng

- 1920px hiển thị đồng thời bốn vùng đúng thứ tự.
- Data và Formula có heading/step/empty state riêng.
- Formula Setup đủ rộng cho editor thường; Form vẫn là workspace lớn nhất.

### Desktop 1440px

- Không ép bốn panel đầy đủ vào 1230px content thực tế.
- Data và Formula thu về rail; mở drawer không đóng Form.
- Setup và Form cùng hiển thị; Form đạt min-width 560px.
- Form hoặc Formula có thể expand khi cần tập trung.

### Tablet

- 1024/768px dùng các workspace chuyển bằng tab.
- Không có horizontal body overflow hoặc nested-scroll conflict được phát hiện trong E2E.

### Mobile

- 390px dùng single-pane và click-to-add.
- Bottom workspace tabs giữ bốn vùng dễ nhận biết.
- Form field về một cột; Form dài cuộn theo document.
- Logo giữ symbol, wordmark ẩn ở <=520px để không lấn navigation.

### Drag & Drop

- Data fields, formula definitions và placed fields có drag handle tách khỏi click action.
- Drop target và reorder dùng cùng `DndContext`/collision strategy.
- Touch có đường click-to-add/place thay thế.
- Escape đóng workspace/drawer đang mở mà không mutate dữ liệu.

### Formula Setup

- Basic flow giảm thao tác cho arithmetic hai toán hạng.
- Advanced giữ token semantics cũ và không giả lập function chưa hỗ trợ.
- Preview/diagnostics chạy trên draft copy; Apply mới commit.

### Form Workspace

- Data/computed cards phân biệt bằng màu và result preview.
- Properties không còn chiếm Formula Setup.
- Expand Form giữ selection và state.

## 5. State & Data Flow đã triển khai

```text
Data Library ── add ─────────────> fields + formOrder
Formula Registry ── create ─────> fields only
Formula Registry ── place/drag ─> formOrder
Formula Setup ── Apply ─────────> label/tokens/resultKind/precision
Form Canvas ── reorder ─────────> formOrder
Entry Workspace ── render ──────> fields ordered by formOrder
Formula Engine ── evaluate ─────> complete fields registry
Save ── validate ───────────────> placed fields + reachable formulas + sales roles
Report/Export ──────────────────> existing SavedSlip adapters
```

## 6. Compatibility

### Migration

- Live key: `oneflow-form`, schema version 3.
- Raw rollback backup: `oneflow-form:v2-backup`.
- Unknown state/envelope properties được giữ.
- Migration không đổi field/formula IDs hoặc token references.

### Formula parity

- `src/lib/formula.ts` không bị thay đổi.
- Arithmetic, parentheses, negative values, recursion/recalculation giữ nguyên.
- Diagnostics và dependency traversal được tái sử dụng.

### Existing forms và records

- V2 field order trở thành initial `formOrder`.
- Existing slips được giữ nguyên.
- Unplaced formula không đi vào Entry/submit fingerprint; formula reachable vẫn được validate/evaluate.

### Reporting, Approval và Export

- SavedSlip flow giữ nguyên.
- Report chỉ nhận data hợp lệ theo validation hiện có.
- Browser E2E đã tạo thành công `.xlsx`, `.docx` và `.pptx` sau phê duyệt.

## 7. Rollback Readiness

### Chuyển renderer về V5, không đụng dữ liệu

Trong cùng browser/profile:

```js
localStorage.setItem('oneflow-builder-version', 'v5');
location.reload();
```

Hoặc build/deploy với `VITE_FORM_BUILDER_V6=false` khi không có local override `v6`.

### Khôi phục raw v2

Chỉ dùng trong quy trình rollback có kiểm soát sau khi xác nhận key backup tồn tại:

```js
const rawV2 = localStorage.getItem('oneflow-form:v2-backup');
if (rawV2) localStorage.setItem('oneflow-form', rawV2);
localStorage.setItem('oneflow-builder-version', 'v5');
location.reload();
```

Không xóa v3 live state hoặc backup cho đến khi dữ liệu đã được kiểm chứng/chép ra nơi an toàn.

## 8. Test Results

Các lệnh nghiệm thu:

```text
npm test
npm run build
npm run test:e2e
git diff --check
```

Kết quả cuối:

- TypeScript + production build: PASS.
- Unit/integration: 43/43 PASS, 8 test files.
- Browser E2E: 34/34 PASS, gồm V6 flows, legacy flows, responsive matrix, scrollbar, branding và ba export format.
- Migration/rollback browser tests: PASS.
- Formula evaluator/diagnostics/dependency tests: PASS.
- Visual inspection: PASS tại 1920×1080, 1440×900 và 390×844.
- Git whitespace check: PASS.

## 9. Known Limitations / V6.1+

- Chưa có AST/typed evaluator mới.
- Chưa có IF/IFS, AND/OR, comparisons, ROUND/MIN/MAX, SUMIF/COUNTIF, lookup hoặc date functions.
- Chưa có Excel-like text parser.
- Chưa có full Undo/Redo transaction history; giữ single-step Undo cũ.
- Chưa có formula clone, duplicate-name warning hoặc dependency graph trực quan.
- Chưa persist panel width theo thiết bị.
- Chưa có generic validation/submission profile đa phòng ban; custom form thiếu sales roles vẫn không save được theo đúng scope V6.0.
- Reporting/export vẫn theo SavedSlip/Phiếu bán hàng, chưa dynamic theo arbitrary custom schema.
- Chưa có backend sync, audit trail, multi-user conflict hoặc form version history.
- Chưa hoàn tất accessibility certification toàn diện và performance target cho form cực lớn; các hạng mục này thuộc P1.

## 10. Final Acceptance

| Tiêu chí | Trạng thái |
|---|---|
| Four-column architecture đúng thứ tự | PASS |
| Data/Formula registry độc lập | PASS |
| Definition tách placement | PASS |
| Basic + Advanced arithmetic setup | PASS |
| Expanded Formula Workspace | PASS |
| Form Canvas + Properties Drawer | PASS |
| Formula Engine không regress | PASS |
| V2 backup + v3 migration + idempotence | PASS |
| V5 renderer rollback | PASS |
| Sales save/report/approval/export | PASS |
| Responsive matrix | PASS |
| Logo/brand đồng bộ | PASS |
| Build, unit, E2E | PASS |

Kết luận: V6.0 đạt phạm vi P0 đã khóa và sẵn sàng cho review/acceptance trên nhánh triển khai. Các hạng mục V6.1/P1/P2 nêu trên không được ngầm coi là đã triển khai.

## 11. Cách chạy

```powershell
cd D:\nkc_workflow\oneflow-handoff
npm install
npm run dev
```

Mở `http://localhost:3000/nhap-lieu`.

Kiểm thử:

```powershell
npm test
npm run build
npm run test:e2e
```
