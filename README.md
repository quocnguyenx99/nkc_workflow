# nkc_workflow

Demo **NKC OneFlow** – mô hình vận hành nội bộ doanh nghiệp: Nhập liệu (kéo thả) → Tính toán (công thức) → Báo cáo & Phê duyệt → Xuất file.

## Cấu trúc

| Đường dẫn | Nội dung |
|---|---|
| `oneflow-handoff/oneflow-handoff/` | Ứng dụng web (Vite + React 18 + TypeScript + Tailwind v4) |
| `oneflow-handoff/oneflow-handoff/design/` | Bản thiết kế gốc (`*.dc.html`) |
| `oneflow-handoff/oneflow-handoff/brand/logo/` | Concept logo (vòng 1) |

## Chạy dự án

```bash
cd oneflow-handoff/oneflow-handoff
npm install
npm run dev      # http://localhost:3000
npm run build    # bản production → dist/
npm test         # unit test bộ tính công thức
```

## Skill thiết kế logo (tuỳ chọn)

Skill `logo-design` không được commit vì chứa logo thuộc thương hiệu bên thứ ba. Cài lại khi cần:

```bash
git clone https://github.com/kaankiziltug/logo-design-skill.git
cp -r logo-design-skill/skills/logo-design .claude/skills/logo-design
```
