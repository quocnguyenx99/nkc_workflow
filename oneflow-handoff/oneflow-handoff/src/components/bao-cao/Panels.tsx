import { AnimatePresence, motion } from 'motion/react';
import { FILE_NAMES } from '@/data/mock';
import { exportReport, type ExportRow } from '@/lib/export';
import { useFormStore } from '@/store/form';
import { useReportStore, type ExportFmt } from '@/store/report';

const vnd = (n: number) => Math.round(n).toLocaleString('vi-VN');
const th = 'px-2 py-2.5 border-b border-line font-semibold';
const thF = th + ' text-right text-violet-text bg-violet-card';

export function InvoiceTable({ rows }: { rows: ExportRow[] }) {
  return (
    <div className="bg-white border border-line rounded-[20px] px-6 py-[22px] flex flex-col gap-3.5 max-[900px]:px-4">
      <div className="flex justify-between items-center gap-2 flex-wrap">
        <span className="text-[16px] font-extrabold">Chi tiết phiếu bán hàng</span>
        <span className="text-[12px] text-muted">Cột tím = hệ thống tự tính từ công thức</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px] min-w-[760px]">
          <thead>
            <tr className="text-left text-body">
              <th className={th}>Mã phiếu</th>
              <th className={th}>Khách hàng</th>
              <th className={th}>Nhân viên</th>
              <th className={th + ' text-right'}>SL</th>
              <th className={thF}>Thành tiền</th>
              <th className={thF}>VAT</th>
              <th className={thF}>Tổng</th>
              <th className={th}>Trạng thái</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {rows.map((r, i) => {
              const td = 'px-2 py-3 hover:bg-[#FAFBFD] ' + (i < rows.length - 1 ? 'border-b border-hover' : '');
              return (
                <motion.tr
                  key={r.code + i}
                  initial={r.fresh ? { backgroundColor: '#EEF2FF' } : false}
                  animate={{ backgroundColor: 'rgba(255,255,255,0)' }}
                  transition={{ duration: 2.4 }}
                  className="[&:hover>td]:bg-[#FAFBFD]"
                >
                  <td className={td + ' font-mono text-[12px] whitespace-nowrap'}>
                    {r.code}
                    {r.fresh && <span className="ml-1.5 font-sans text-[10px] font-bold text-primary bg-primary-soft px-1.5 py-px rounded-full">Mới</span>}
                  </td>
                  <td className={td}>{r.customer}</td>
                  <td className={td}>{r.staff}</td>
                  <td className={td + ' text-right'}>{r.qty}</td>
                  <td className={td + ' text-right'}>{vnd(r.subtotal)}</td>
                  <td className={td + ' text-right'}>{vnd(r.vat)}</td>
                  <td className={td + ' text-right font-extrabold'}>{vnd(r.total)}</td>
                  <td className={td}>
                    {r.status === 'ok' ? (
                      <span className="bg-green-soft text-green-text px-[9px] py-[3px] rounded-full text-[12px] font-bold whitespace-nowrap">Đã duyệt</span>
                    ) : (
                      <span className="bg-amber-soft text-amber-text px-[9px] py-[3px] rounded-full text-[12px] font-bold whitespace-nowrap">Chờ duyệt</span>
                    )}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DoneStep({ title, sub, lineColor = '#0E9F6E' }: { title: string; sub: string; lineColor?: string }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <span className="w-[30px] h-[30px] rounded-full bg-green text-white text-[13px] font-extrabold flex items-center justify-center">✓</span>
        <motion.span className="w-0.5 flex-1" animate={{ backgroundColor: lineColor }} transition={{ duration: 0.5 }} />
      </div>
      <div className="flex flex-col gap-0.5 pb-4">
        <span className="text-[14px] font-bold">{title}</span>
        <span className="text-[12px] text-muted">{sub}</span>
      </div>
    </div>
  );
}

export function ApprovalTimeline() {
  const { ap, note, approve, reject, reset, setNote } = useReportStore();
  const ok = ap === 'ok';
  const back = ap === 'back';
  const finalBg = ok ? '#0E9F6E' : back ? '#B42318' : '#F59E0B';
  return (
    <section aria-label="Luồng phê duyệt" className="bg-white border border-line rounded-[20px] p-[22px] flex flex-col gap-[18px]">
      <div className="flex justify-between items-center">
        <span className="text-[16px] font-extrabold">Luồng phê duyệt</span>
        <span className="text-[12px] font-bold text-muted">{ok ? '4/4 hoàn tất' : back ? 'Đã trả lại' : 'Bước 4/4'}</span>
      </div>
      <div className="flex flex-col">
        <DoneStep title="Trần Thu Hà gửi báo cáo" sub="Nhân viên Kinh doanh · 08:50" />
        <DoneStep title="Lê Minh Nam duyệt" sub="Trưởng phòng Kinh doanh · 09:30" />
        <DoneStep title="Lê Thị Mai đối chiếu số liệu" sub="Kế toán trưởng · 10:15 · “Khớp sổ sách”" lineColor={ok ? '#0E9F6E' : '#E7EAF0'} />
        <div className="flex gap-3">
          <div className="flex flex-col items-center">
            <motion.span
              key={ap}
              initial={ap === 'pending' ? false : { scale: 0.6, opacity: 0.4 }}
              animate={{ scale: 1, opacity: 1, backgroundColor: finalBg }}
              transition={{ type: 'spring', stiffness: 380, damping: 18 }}
              className="w-[30px] h-[30px] rounded-full text-[13px] font-extrabold flex items-center justify-center"
              style={{ color: ok || back ? '#FFFFFF' : '#0B1220', backgroundColor: finalBg }}
            >
              {ok ? '✓' : back ? '↩' : '4'}
            </motion.span>
          </div>
          <div className="flex flex-col gap-2.5 flex-1">
            <div className="flex flex-col gap-0.5">
              <span className="text-[14px] font-bold">Ban Giám đốc phê duyệt</span>
              <span className="text-[12px] text-muted">
                {ok ? 'Nguyễn Quang Vinh · vừa duyệt' : back ? 'Nguyễn Quang Vinh · đã trả lại kèm ghi chú' : 'Đang chờ bạn xử lý'}
              </span>
            </div>
            {ap === 'pending' ? (
              <div className="flex flex-col gap-2">
                <label htmlFor="bc-note" className="text-[12px] font-semibold text-body">
                  Ghi chú (tuỳ chọn)
                </label>
                <textarea
                  id="bc-note"
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ví dụ: Đẩy mạnh gói Basic quý tới"
                  className="border border-line-3 rounded-[10px] px-3 py-2.5 text-[13px] resize-none text-ink"
                />
                <div className="flex gap-2">
                  <button type="button" onClick={approve} className="flex-1 border-0 bg-ink text-white rounded-[10px] min-h-11 text-[14px] font-bold cursor-pointer hover:bg-[#1B2236]">
                    Phê duyệt
                  </button>
                  <button type="button" onClick={reject} className="ghost flex-1 border border-line-3 bg-white text-ink rounded-[10px] min-h-11 text-[14px] font-semibold cursor-pointer">
                    Trả lại
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={reset}
                className="ghost self-start border border-line-3 bg-white text-body rounded-lg px-3 min-h-[34px] text-[12px] font-semibold cursor-pointer"
              >
                ↺ Diễn lại bước duyệt
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

const FORMATS: { k: ExportFmt; chip: string; name: string; color: string }[] = [
  { k: 'x', chip: 'XLSX', name: 'Excel', color: '#166534' },
  { k: 'w', chip: 'DOCX', name: 'Word', color: '#1E40AF' },
  { k: 'p', chip: 'PPTX', name: 'PowerPoint', color: '#C2410C' },
];

function Preview({ fmt }: { fmt: ExportFmt }) {
  if (fmt === 'x')
    return (
      <>
        <div className="bg-white rounded-lg overflow-hidden text-[10px] font-mono shadow-[0_4px_12px_-4px_rgba(11,18,32,.2)]">
          <div className="bg-xlsx text-white px-2 py-1.5 font-bold">BaoCao_DoanhThu_T10.xlsx</div>
          <div className="grid grid-cols-[1.3fr_1fr_1fr_1fr]">
            {['Nhân viên', 'Thành tiền', 'VAT', 'Tổng'].map((h, i) => (
              <span key={h} className={'px-1.5 py-[5px] bg-hover border-b border-[#DCE0EA] font-bold ' + (i < 3 ? 'border-r' : '')}>
                {h}
              </span>
            ))}
            {[
              ['Thu Hà', '15.000.000', '1.425.000', '=B2-C2+D2'],
              ['Minh Nam', '28.800.000', '2.592.000', '=B3-C3+D3'],
            ].map((row, r) =>
              row.map((c, i) => (
                <span key={r + '-' + i} className={'px-1.5 py-[5px] border-line ' + (i < 3 ? 'border-r ' : '') + (r === 0 ? 'border-b' : '')}>
                  {c}
                </span>
              )),
            )}
          </div>
        </div>
        <span className="text-[12px] text-body">Số liệu chi tiết, giữ nguyên công thức để kế toán đối chiếu.</span>
      </>
    );
  if (fmt === 'w')
    return (
      <>
        <div className="bg-white rounded-lg px-4 py-3.5 flex flex-col gap-1.5 shadow-[0_4px_12px_-4px_rgba(11,18,32,.2)]">
          <span className="text-[9px] text-docx font-bold">BaoCao_DoanhThu_T10.docx</span>
          <span className="text-[12px] font-extrabold">BÁO CÁO DOANH THU THÁNG 10/2026</span>
          <span className="text-[10px] text-body leading-[1.5]">Tổng doanh thu đạt 486.240.000 ₫, tăng 12,4% so với tháng trước; đạt 97% kế hoạch.</span>
          <span className="h-[5px] bg-line rounded-[3px] w-full" />
          <span className="h-[5px] bg-line rounded-[3px] w-[82%]" />
        </div>
        <span className="text-[12px] text-body">Văn bản có bảng biểu, nhận xét và chữ ký duyệt.</span>
      </>
    );
  return (
    <>
      <div className="report-hero rounded-lg aspect-video px-4 py-3.5 flex flex-col justify-between">
        <span className="text-[9px] text-[#B4C3FF] font-bold">BaoCao_DoanhThu_T10.pptx · Slide 1/6</span>
        <span className="text-[16px] font-extrabold text-white leading-[1.25]">
          Doanh thu tháng 10
          <br />
          486,2 triệu ₫ · ▲12,4%
        </span>
        <svg viewBox="0 0 200 40" className="w-3/5 h-auto" aria-hidden="true">
          <polyline points="0,34 40,28 80,30 120,24 160,20 200,6" fill="none" stroke="#B4C3FF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span className="text-[12px] text-body">Bộ slide tóm tắt cho cuộc họp giao ban.</span>
    </>
  );
}

export function ExportPanel() {
  const { ap, fmt, dl, note, pick, setDl } = useReportStore();
  const slips = useFormStore((s) => s.slips);
  const ok = ap === 'ok';
  const name = FORMATS.find((f) => f.k === fmt)!.name;

  const download = async () => {
    if (!ok) return setDl('locked');
    setDl('working');
    try {
      await exportReport(fmt, slips, note);
      setDl('done');
    } catch (e) {
      console.error(e);
      setDl('error');
    }
  };

  const msg =
    dl === 'locked'
      ? { t: 'Báo cáo cần được Ban Giám đốc phê duyệt trước khi xuất file.', bg: '#FEF6E0', fg: '#7A4A06' }
      : dl === 'done'
        ? { t: '✓ Đã tạo ' + FILE_NAMES[fmt] + ' — sẵn sàng gửi đi và trình chiếu.', bg: '#E6F6EF', fg: '#065F46' }
        : dl === 'working'
          ? { t: 'Đang tạo ' + FILE_NAMES[fmt] + '…', bg: '#EEF2FF', fg: '#1E3CC2' }
          : dl === 'error'
            ? { t: 'Không tạo được file, vui lòng thử lại.', bg: '#FEF1EE', fg: '#B42318' }
            : null;

  return (
    <section aria-label="Xuất báo cáo" className="bg-white border border-line rounded-[20px] p-[22px] flex flex-col gap-3.5">
      <div className="flex justify-between items-center">
        <span className="text-[16px] font-extrabold">Xuất báo cáo</span>
        <span className="text-[12px] font-bold px-2.5 py-1 rounded-full transition-colors" style={{ background: ok ? '#E6F6EF' : '#F2F4F8', color: ok ? '#047857' : '#5B6478' }}>
          {ok ? 'Đã mở khoá' : 'Chờ phê duyệt'}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {FORMATS.map((f) => (
          <button
            key={f.k}
            type="button"
            onClick={() => pick(f.k)}
            className="exp bg-white rounded-xl px-1.5 py-3 min-h-20 cursor-pointer flex flex-col items-center gap-2"
            style={{ border: `2px solid ${fmt === f.k ? '#2F54EB' : '#E7EAF0'}` }}
          >
            <span className="text-white text-[11px] font-extrabold px-2 py-1.5 rounded-md" style={{ background: f.color }}>
              {f.chip}
            </span>
            <span className="text-[13px] font-semibold text-ink">{f.name}</span>
          </button>
        ))}
      </div>
      <div className="bg-hover rounded-[14px] p-3.5 flex flex-col gap-2.5">
        <Preview fmt={fmt} />
      </div>
      <button
        type="button"
        onClick={download}
        disabled={dl === 'working'}
        className="border-0 text-white rounded-xl min-h-12 text-[15px] font-bold cursor-pointer flex items-center justify-center gap-2 transition-colors disabled:cursor-wait"
        style={{ background: ok ? '#2F54EB' : '#8A93A8' }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 3v12" />
          <polyline points="7 10 12 15 17 10" />
          <path d="M4 19h16" />
        </svg>
        Xuất file {name}
      </button>
      <AnimatePresence>
        {msg && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-[10px] px-3 py-2.5 text-[13px] font-semibold"
            style={{ background: msg.bg, color: msg.fg }}
          >
            {msg.t}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export function ActivityLog() {
  const ap = useReportStore((s) => s.ap);
  const slips = useFormStore((s) => s.slips);
  const dot = 'w-2 h-2 rounded-full mt-1.5 shrink-0';
  return (
    <section aria-label="Nhật ký hoạt động" className="bg-white border border-line rounded-[20px] p-[22px] flex flex-col gap-3.5">
      <span className="text-[16px] font-extrabold">Nhật ký hoạt động</span>
      <div className="flex flex-col gap-3 text-[13px]">
        <AnimatePresence initial={false}>
          {ap !== 'pending' && (
            <motion.div key="decided" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex gap-2.5">
              <span className={dot} style={{ background: ap === 'ok' ? '#0E9F6E' : '#B42318' }} />
              <span>
                <b>Ban Giám đốc</b> {ap === 'ok' ? 'đã phê duyệt' : 'đã trả lại'} báo cáo doanh thu T10 <span className="text-muted">· vừa xong</span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        {slips.slice(0, 2).map((s) => (
          <div key={s.code} className="flex gap-2.5">
            <span className={dot} style={{ background: '#2F54EB' }} />
            <span>
              <b>{s.staff}</b> lưu phiếu {s.code} · {Math.round(s.total).toLocaleString('vi-VN')} ₫ <span className="text-muted">· vừa xong</span>
            </span>
          </div>
        ))}
        <div className="flex gap-2.5">
          <span className={dot} style={{ background: '#0E9F6E' }} />
          <span>
            <b>Lê Thị Mai</b> đối chiếu và xác nhận số liệu <span className="text-muted">· 10:15</span>
          </span>
        </div>
        <div className="flex gap-2.5">
          <span className={dot} style={{ background: '#6E46F0' }} />
          <span>
            <b>Hệ thống</b> tự tính lại 38 phiếu sau khi cập nhật công thức VAT <span className="text-muted">· 09:42</span>
          </span>
        </div>
        <div className="flex gap-2.5">
          <span className={dot} style={{ background: '#2F54EB' }} />
          <span>
            <b>Lê Minh Nam</b> duyệt cấp phòng <span className="text-muted">· 09:30</span>
          </span>
        </div>
        <div className="flex gap-2.5">
          <span className={dot} style={{ background: '#A9B3C6' }} />
          <span>
            <b>Trần Thu Hà</b> gửi báo cáo doanh thu T10 <span className="text-muted">· 08:50</span>
          </span>
        </div>
      </div>
    </section>
  );
}
