# NKC OneFlow – Demo

```bash
npm install
npm run dev      # http://localhost:5173
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
