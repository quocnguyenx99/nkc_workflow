# NKC OneFlow – Demo

Demo mô hình vận hành nội bộ doanh nghiệp: Nhập liệu (kéo thả) → Tính toán (công thức) → Báo cáo & Phê duyệt → Xuất file.

## Cấu trúc

| Đường dẫn | Nội dung |
|---|---|
| `src/` | Source ứng dụng Vite + React 18 + TypeScript + Tailwind v4 |
| `design/` | Bản thiết kế gốc (`*.dc.html`) |
| `brand/logo/` | Concept logo |

## Chạy dự án

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # tsc + vite build → dist/
npm test         # Vitest cho bộ tính công thức (src/lib/formula.ts)
```

| Route | Trang | Thiết kế |
|---|---|---|
| `/` | Trang chủ | `design/HomeV2.dc.html` |
| `/nhap-lieu` | Nhập liệu kéo thả + công thức | `design/NhapLieuV2.dc.html` |
| `/bao-cao` | Báo cáo, phê duyệt, xuất XLSX/DOCX/PPTX | `design/BaoCaoV2.dc.html` |
| `/giao-dien` | Showcase desktop & mobile | `design/GiaoDienV2.dc.html` |

Trạng thái (phiếu đã lưu, bước duyệt) được lưu trong `localStorage` (`oneflow-form`, `oneflow-report`). Xoá 2 khoá này để demo lại từ đầu.

## Skill thiết kế logo (tuỳ chọn)

Skill `logo-design` không được commit vì chứa logo thuộc thương hiệu bên thứ ba. Cài lại khi cần:

```bash
git clone https://github.com/kaankiziltug/logo-design-skill.git
cp -r logo-design-skill/skills/logo-design .claude/skills/logo-design
```
