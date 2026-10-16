// Xuất XLSX / DOCX / PPTX thật trên trình duyệt. Thư viện được import động để tách bundle.
import { saveAs } from 'file-saver';
import { FILE_NAMES, INVOICES, KPIS, LEADERBOARD, PRODUCT_MIX, REPORT, REVENUE_TREND, type InvoiceRow } from '@/data/mock';
import type { SavedSlip } from '@/store/form';
import type { ExportFmt } from '@/store/report';
import { isSavedSlipReportable } from '@/lib/form-validation';

export interface ExportRow extends InvoiceRow {
  discount: number;
}

export function reportRows(slips: SavedSlip[]): ExportRow[] {
  const fresh: InvoiceRow[] = slips.filter(isSavedSlipReportable).map((s) => ({ ...s, status: 'pending', fresh: true }));
  return [...fresh, ...INVOICES].map((r) => ({ ...r, discount: r.subtotal + r.vat - r.total }));
}

const vnd = (n: number) => Math.round(n).toLocaleString('vi-VN');
const statusText = (r: InvoiceRow) => (r.status === 'ok' ? 'Đã duyệt' : 'Chờ duyệt');
const SUMMARY = `Tổng doanh thu đạt ${vnd(REPORT.totalRevenue)} ₫, tăng 12,4% so với tháng trước; đạt ${REPORT.planPct}% kế hoạch.`;

async function exportXlsx(rows: ExportRow[]) {
  const { default: ExcelJS } = await import('exceljs');
  const wb = new ExcelJS.Workbook();
  wb.creator = 'NKC OneFlow';
  wb.created = new Date();

  const ws = wb.addWorksheet('Chi tiết phiếu', { views: [{ state: 'frozen', ySplit: 1 }] });
  ws.columns = [
    { header: 'Mã phiếu', key: 'code', width: 12 },
    { header: 'Khách hàng', key: 'customer', width: 28 },
    { header: 'Nhân viên', key: 'staff', width: 18 },
    { header: 'SL', key: 'qty', width: 7 },
    { header: 'Thành tiền', key: 'subtotal', width: 15 },
    { header: 'Chiết khấu', key: 'discount', width: 14 },
    { header: 'VAT', key: 'vat', width: 14 },
    { header: 'Tổng', key: 'total', width: 16 },
    { header: 'Trạng thái', key: 'status', width: 12 },
  ];
  rows.forEach((r, i) => {
    const n = i + 2;
    ws.addRow({
      code: r.code,
      customer: r.customer,
      staff: r.staff,
      qty: r.qty,
      subtotal: r.subtotal,
      discount: r.discount,
      vat: r.vat,
      // Cột tổng giữ công thức Excel thật để kế toán đối chiếu.
      total: { formula: `E${n}-F${n}+G${n}`, result: r.total },
      status: statusText(r),
    });
  });
  const last = rows.length + 1;
  const sumRow = ws.addRow({
    code: 'TỔNG',
    qty: { formula: `SUM(D2:D${last})` },
    subtotal: { formula: `SUM(E2:E${last})` },
    discount: { formula: `SUM(F2:F${last})` },
    vat: { formula: `SUM(G2:G${last})` },
    total: { formula: `SUM(H2:H${last})` },
  });
  sumRow.font = { bold: true };

  const header = ws.getRow(1);
  header.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF166534' } };
  ['E', 'F', 'G', 'H'].forEach((c) => (ws.getColumn(c).numFmt = '#,##0'));
  ['E1', 'F1', 'G1', 'H1'].forEach((a) => (ws.getCell(a).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF5B33E0' } }));

  const s2 = wb.addWorksheet('Tổng quan');
  s2.columns = [
    { header: 'Chỉ số', key: 'k', width: 28 },
    { header: 'Giá trị', key: 'v', width: 22 },
  ];
  s2.getRow(1).font = { bold: true };
  s2.addRow({ k: 'Kỳ báo cáo', v: REPORT.period });
  s2.addRow({ k: 'Tổng doanh thu (₫)', v: REPORT.totalRevenue }).getCell(2).numFmt = '#,##0';
  s2.addRow({ k: 'Tăng trưởng so với tháng 9', v: '12,4%' });
  s2.addRow({ k: 'Tiến độ kế hoạch', v: REPORT.planPct + '%' });
  KPIS.forEach((k) => s2.addRow({ k: k.label, v: k.value }));
  s2.addRow({});
  s2.addRow({ k: 'Tháng', v: 'Doanh thu (triệu ₫)' }).font = { bold: true };
  REVENUE_TREND.forEach((t) => s2.addRow({ k: t.month, v: t.value }));
  s2.addRow({});
  s2.addRow({ k: 'Nhân viên', v: 'Doanh thu (triệu ₫)' }).font = { bold: true };
  LEADERBOARD.forEach((l) => s2.addRow({ k: l.name, v: l.value }));

  const buf = await wb.xlsx.writeBuffer();
  saveAs(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), FILE_NAMES.x);
}

async function exportDocx(rows: ExportRow[], note: string) {
  const d = await import('docx');
  const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel, ShadingType } = d;
  const cell = (text: string, opts: { bold?: boolean; right?: boolean; fill?: string; color?: string } = {}) =>
    new TableCell({
      shading: opts.fill ? { type: ShadingType.CLEAR, color: 'auto', fill: opts.fill } : undefined,
      children: [
        new Paragraph({
          alignment: opts.right ? AlignmentType.RIGHT : AlignmentType.LEFT,
          children: [new TextRun({ text, bold: opts.bold, color: opts.color, size: 18 })],
        }),
      ],
    });
  const head = ['Mã phiếu', 'Khách hàng', 'Nhân viên', 'SL', 'Thành tiền', 'VAT', 'Tổng', 'Trạng thái'];
  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ tableHeader: true, children: head.map((h, i) => cell(h, { bold: true, right: i >= 3 && i <= 6, fill: '1E40AF', color: 'FFFFFF' })) }),
      ...rows.map(
        (r) =>
          new TableRow({
            children: [
              cell(r.code),
              cell(r.customer),
              cell(r.staff),
              cell(String(r.qty), { right: true }),
              cell(vnd(r.subtotal), { right: true }),
              cell(vnd(r.vat), { right: true }),
              cell(vnd(r.total), { right: true, bold: true }),
              cell(statusText(r)),
            ],
          }),
      ),
    ],
  });
  const lb = LEADERBOARD.map((l) => new Paragraph({ bullet: { level: 0 }, children: [new TextRun(`${l.name}: ${String(l.value).replace('.', ',')} triệu ₫ (${l.pct}%)`)] }));
  const doc = new Document({
    creator: 'NKC OneFlow',
    title: 'Báo cáo doanh thu tháng 10/2026',
    styles: { default: { document: { run: { font: 'Arial', size: 22 } } } },
    sections: [
      {
        children: [
          new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun({ text: 'BÁO CÁO DOANH THU THÁNG 10/2026', bold: true })] }),
          new Paragraph({ children: [new TextRun({ text: 'Phòng Kinh doanh · Dữ liệu mẫu minh hoạ', color: '5B6478' })] }),
          new Paragraph({ text: '' }),
          new Paragraph({ children: [new TextRun(SUMMARY)] }),
          new Paragraph({ heading: HeadingLevel.HEADING_2, text: 'Xếp hạng nhân viên' }),
          ...lb,
          new Paragraph({ heading: HeadingLevel.HEADING_2, text: 'Chi tiết phiếu bán hàng' }),
          table,
          new Paragraph({ heading: HeadingLevel.HEADING_2, text: 'Nhận xét & phê duyệt' }),
          new Paragraph({ children: [new TextRun(note.trim() ? `Ghi chú của Ban Giám đốc: ${note.trim()}` : 'Số liệu đã được Kế toán trưởng đối chiếu, khớp sổ sách.')] }),
          new Paragraph({ text: '' }),
          new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Ban Giám đốc phê duyệt', bold: true })] }),
          new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun('Nguyễn Quang Vinh')] }),
        ],
      },
    ],
  });
  saveAs(await Packer.toBlob(doc), FILE_NAMES.w);
}

async function exportPptx(rows: ExportRow[]) {
  const { default: PptxGenJS } = await import('pptxgenjs');
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.title = 'Báo cáo doanh thu T10';
  const INK = '0B1220';
  const FONT = 'Arial';
  const title = (s: ReturnType<typeof pptx.addSlide>, t: string) => s.addText(t, { x: 0.6, y: 0.4, w: 12, h: 0.7, fontFace: FONT, fontSize: 28, bold: true, color: INK });

  // 1. Tiêu đề
  const s1 = pptx.addSlide();
  s1.background = { color: INK };
  s1.addText('BaoCao_DoanhThu_T10 · Phòng Kinh doanh', { x: 0.6, y: 0.5, w: 12, h: 0.4, fontFace: FONT, fontSize: 14, color: 'B4C3FF' });
  s1.addText('Doanh thu tháng 10\n486,2 triệu ₫ · ▲12,4%', { x: 0.6, y: 2.2, w: 12, h: 2, fontFace: FONT, fontSize: 44, bold: true, color: 'FFFFFF' });
  s1.addText('Đã được Ban Giám đốc phê duyệt', { x: 0.6, y: 4.6, w: 12, h: 0.5, fontFace: FONT, fontSize: 16, color: '6EE7B7' });

  // 2. KPI
  const s2 = pptx.addSlide();
  title(s2, 'Chỉ số chính');
  KPIS.forEach((k, i) => {
    const x = 0.6 + i * 3.1;
    s2.addShape(pptx.ShapeType.roundRect, { x, y: 1.6, w: 2.9, h: 2, fill: { color: 'F6F8FB' }, line: { color: 'E7EAF0' }, rectRadius: 0.15 });
    s2.addText(k.label, { x: x + 0.2, y: 1.8, w: 2.5, h: 0.4, fontFace: FONT, fontSize: 13, color: '5B6478' });
    s2.addText(k.value, { x: x + 0.2, y: 2.3, w: 2.5, h: 0.8, fontFace: FONT, fontSize: 32, bold: true, color: INK });
    s2.addText(k.badge, { x: x + 0.2, y: 3.05, w: 2.5, h: 0.4, fontFace: FONT, fontSize: 12, bold: true, color: '047857' });
  });
  s2.addText(SUMMARY, { x: 0.6, y: 4.3, w: 12, h: 0.8, fontFace: FONT, fontSize: 16, color: '3B4559' });

  // 3. Xu hướng
  const s3 = pptx.addSlide();
  title(s3, 'Xu hướng doanh thu 6 tháng (triệu ₫)');
  s3.addChart(pptx.ChartType.line, [{ name: 'Doanh thu', labels: REVENUE_TREND.map((t) => t.month), values: REVENUE_TREND.map((t) => t.value) }], {
    x: 0.6, y: 1.3, w: 12, h: 5.5, chartColors: ['2F54EB'], lineSize: 3, lineDataSymbolSize: 8, showValue: true, dataLabelPosition: 't', valAxisMinVal: 350, catAxisLabelFontFace: FONT, valAxisLabelFontFace: FONT,
  });

  // 4. Xếp hạng
  const s4 = pptx.addSlide();
  title(s4, 'Xếp hạng nhân viên (triệu ₫)');
  s4.addChart(pptx.ChartType.bar, [{ name: 'Doanh thu', labels: [...LEADERBOARD].reverse().map((l) => l.name), values: [...LEADERBOARD].reverse().map((l) => l.value) }], {
    x: 0.6, y: 1.3, w: 12, h: 5.5, barDir: 'bar', chartColors: ['2F54EB'], showValue: true, catAxisLabelFontFace: FONT, valAxisLabelFontFace: FONT,
  });

  // 5. Cơ cấu
  const s5 = pptx.addSlide();
  title(s5, 'Cơ cấu doanh thu theo sản phẩm');
  s5.addChart(pptx.ChartType.doughnut, [{ name: 'Tỷ trọng', labels: PRODUCT_MIX.map((p) => p.name), values: PRODUCT_MIX.map((p) => p.value) }], {
    x: 0.6, y: 1.3, w: 12, h: 5.5, holeSize: 60, chartColors: PRODUCT_MIX.map((p) => p.color.slice(1)), showLegend: true, legendPos: 'r', showPercent: true, legendFontFace: FONT,
  });

  // 6. Chi tiết
  const s6 = pptx.addSlide();
  title(s6, 'Chi tiết phiếu bán hàng');
  const h = (t: string) => ({ text: t, options: { bold: true, color: 'FFFFFF', fill: { color: 'C2410C' } } });
  s6.addTable(
    [
      ['Mã phiếu', 'Khách hàng', 'Nhân viên', 'SL', 'Thành tiền', 'VAT', 'Tổng', 'Trạng thái'].map(h),
      ...rows.slice(0, 10).map((r) => [r.code, r.customer, r.staff, String(r.qty), vnd(r.subtotal), vnd(r.vat), vnd(r.total), statusText(r)].map((t) => ({ text: t }))),
    ],
    { x: 0.6, y: 1.3, w: 12.1, fontFace: FONT, fontSize: 12, border: { type: 'solid', color: 'E7EAF0', pt: 1 }, colW: [1.2, 2.8, 1.8, 0.6, 1.5, 1.3, 1.5, 1.4] },
  );

  await pptx.writeFile({ fileName: FILE_NAMES.p });
}

export async function exportReport(fmt: ExportFmt, slips: SavedSlip[], note: string) {
  const rows = reportRows(slips);
  if (fmt === 'x') return exportXlsx(rows);
  if (fmt === 'w') return exportDocx(rows, note);
  return exportPptx(rows);
}
