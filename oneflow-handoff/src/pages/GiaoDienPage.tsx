import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';


/** Hộp kích thước cố định w×h, thu phóng theo bề rộng khả dụng (không phóng to quá 1). */
function ScaledBox({ w, h, className = '', children }: { w: number; h: number; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(Math.min(1, el.clientWidth / w)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [w]);
  return (
    <div ref={ref} className={'w-full overflow-hidden ' + className} style={{ height: h * scale }}>
      <div className="relative" style={{ width: w, height: h, transform: `scale(${scale})`, transformOrigin: 'top left' }}>{children}</div>
    </div>
  );
}

function useNarrow(query = '(max-width: 899px)') {
  const [m, setM] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setM(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return m;
}

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
});


function Header({ mobile = false }: { mobile?: boolean }) {
  return (
    <motion.div {...rise(0)} className={mobile ? 'flex flex-col gap-5' : 'flex justify-between items-end gap-8'}>
    <div className="flex flex-col gap-3.5">
      <span className="self-start text-[12px] font-bold tracking-[.14em] text-primary bg-primary-soft px-3 py-1.5 rounded-full">TRẢI NGHIỆM ĐA NỀN TẢNG</span>
      <h2 className={'m-0 leading-[1.05] font-extrabold tracking-[-.045em] ' + (mobile ? 'text-[34px]' : 'text-[50px]')}>
        Một hệ thống.
        <br />
        Vận hành trên mọi màn hình.
      </h2>
    </div>
    <div className="flex flex-col gap-3.5 max-w-[420px]">
      <p className={'m-0 text-body leading-[1.6] ' + (mobile ? 'text-[16px]' : 'text-[17px]')}>
        Ban Giám đốc theo dõi trên máy tính, nhân viên nhập phiếu và quản lý phê duyệt ngay trên điện thoại — dữ liệu đồng bộ tức thì.
      </p>
      <div className="flex gap-2 text-[13px] font-bold">
        <span className="bg-ink text-white px-3.5 py-[7px] rounded-full">Desktop</span>
        <span className="bg-white border border-line px-3.5 py-[7px] rounded-full">Tablet</span>
        <span className="bg-white border border-line px-3.5 py-[7px] rounded-full">Mobile</span>
      </div>
    </div>
    </motion.div>
  );
}

function Laptop({ pos = '' }: { pos?: string }) {
  return (
    <motion.div {...rise(0.1)} className={'w-[900px] ' + pos}>
      <div className="bg-[#1B2236] rounded-t-[18px] pt-3 px-3">
        <div className="bg-white rounded-t-lg overflow-hidden h-[510px] flex flex-col">
          <div className="bg-hover h-[30px] flex items-center gap-1.5 px-3 border-b border-line shrink-0">
            <span className="w-[9px] h-[9px] rounded-full bg-[#F87171]" />
            <span className="w-[9px] h-[9px] rounded-full bg-[#FBBF24]" />
            <span className="w-[9px] h-[9px] rounded-full bg-[#34D399]" />
            <span className="ml-3 bg-white border border-line rounded-md px-2.5 py-px text-[10px] text-muted font-mono">app.oneflow.vn/tong-quan</span>
          </div>
          <div className="flex flex-1 min-h-0">
            <div className="w-40 border-r border-line px-2.5 py-3.5 flex flex-col gap-[3px] text-[11px] text-body shrink-0">
              <span className="text-[14px] font-extrabold px-1.5 pb-3 text-ink">
                One<span className="text-primary">Flow</span>
              </span>
              <span className="px-2 py-[7px] rounded-[7px] bg-primary-soft text-primary-hover font-bold">Tổng quan</span>
              <span className="px-2 py-[7px]">Nhập liệu</span>
              <span className="px-2 py-[7px]">Báo cáo</span>
              <span className="px-2 py-[7px] flex justify-between">
                Phê duyệt<b className="bg-amber-soft text-amber-text px-1.5 rounded-[99px]">3</b>
              </span>
              <span className="mt-2.5 px-2 text-[9px] font-bold tracking-[.1em] text-faint">PHÒNG BAN</span>
              {[
                ['Kinh doanh', '#2F54EB'],
                ['Kế toán', '#0E9F6E'],
                ['Nhân sự', '#6E46F0'],
                ['Kho vận', '#F59E0B'],
              ].map(([n, c]) => (
                <span key={n} className="px-2 py-1.5 flex gap-1.5 items-center">
                  <i className="w-[7px] h-[7px] rounded-[2px]" style={{ background: c }} />
                  {n}
                </span>
              ))}
            </div>
            <div className="flex-1 bg-soft px-[18px] py-4 flex flex-col gap-3 min-w-0">
              <div className="flex justify-between items-center">
                <span className="text-[15px] font-extrabold">Tổng quan vận hành · Tháng 10</span>
                <span className="text-[10px] font-bold bg-white border border-line px-[9px] py-1 rounded-[7px]">Tháng 10/2026 ▾</span>
              </div>
              <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-2.5">
                <div
                  className="bg-ink text-white rounded-xl p-3 flex flex-col gap-[3px]"
                  style={{ backgroundImage: 'radial-gradient(160px 80px at 100% 0%, rgba(110,70,240,.55), transparent 70%)' }}
                >
                  <span className="text-[9px] text-[#AEB8D0]">Doanh thu</span>
                  <span className="text-[18px] font-extrabold">486,2 tr ₫</span>
                  <span className="text-[9px] text-[#6EE7B7] font-bold">▲ 12,4%</span>
                </div>
                {[
                  ['Phiếu bán', '38', '+6', '#047857'],
                  ['Tồn kho', '1.204', 'sản phẩm', '#5B6478'],
                  ['Chờ duyệt', '6', 'cần xử lý', '#92400E'],
                ].map(([k, v, s, c]) => (
                  <div key={k} className="bg-white border border-line rounded-xl p-3 flex flex-col gap-[3px]">
                    <span className="text-[9px] text-muted">{k}</span>
                    <span className="text-[18px] font-extrabold">{v}</span>
                    <span className="text-[9px]" style={{ color: c, fontWeight: c === '#5B6478' ? 400 : 700 }}>
                      {s}
                    </span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-[1.6fr_1fr] gap-2.5 flex-1 min-h-0">
                <div className="bg-white border border-line rounded-xl px-3.5 py-3 flex flex-col gap-2">
                  <span className="text-[11px] font-bold">Xu hướng doanh thu 6 tháng</span>
                  <svg viewBox="0 0 400 140" className="w-full flex-1" preserveAspectRatio="none" aria-hidden="true">
                    <line x1="0" y1="130" x2="400" y2="130" stroke="#E7EAF0" />
                    <line x1="0" y1="85" x2="400" y2="85" stroke="#F2F4F8" />
                    <line x1="0" y1="40" x2="400" y2="40" stroke="#F2F4F8" />
                    <motion.path
                      d="M0 112 L80 96 L160 101 L240 82 L320 71 L400 26 L400 130 L0 130 Z"
                      fill="rgba(47,84,235,.12)"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.9, duration: 0.6 }}
                    />
                    <motion.polyline
                      points="0,112 80,96 160,101 240,82 320,71 400,26"
                      fill="none"
                      stroke="#2F54EB"
                      strokeWidth="3"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: 0.5, duration: 1.1, ease: 'easeOut' }}
                    />
                  </svg>
                </div>
                <div className="bg-white border border-line rounded-xl px-3.5 py-3 flex flex-col gap-[9px] text-[10px]">
                  <span className="text-[11px] font-bold">Báo cáo các phòng</span>
                  {[
                    ['Kinh doanh', 'Chờ duyệt', '#FEF6E0', '#92400E'],
                    ['Kế toán', 'Đã duyệt', '#E6F6EF', '#047857'],
                    ['Kho vận', 'Đã duyệt', '#E6F6EF', '#047857'],
                    ['Nhân sự', 'Đang soạn', '#F2F4F8', '#3B4559'],
                  ].map(([d, s, bg, fg]) => (
                    <div key={d} className="flex justify-between items-center">
                      <span>{d}</span>
                      <b className="px-[7px] py-0.5 rounded-[99px]" style={{ background: bg, color: fg }}>
                        {s}
                      </b>
                    </div>
                  ))}
                  <div className="mt-auto flex gap-1 text-[9px] font-extrabold text-white">
                    <span className="flex-1 bg-xlsx rounded-md py-[5px] text-center">XLSX</span>
                    <span className="flex-1 bg-docx rounded-md py-[5px] text-center">DOCX</span>
                    <span className="flex-1 bg-pptx rounded-md py-[5px] text-center">PPTX</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="h-4 rounded-b-[22px] -mx-7 shadow-[0_30px_60px_-20px_rgba(11,18,32,.45)]" style={{ background: 'linear-gradient(#C9CFDB, #AEB6C5)' }} />
    </motion.div>
  );
}

function PhoneEntry({ pos = '' }: { pos?: string }) {
  return (
    <motion.div
      {...rise(0.25)}
      className={'w-[250px] h-[520px] rounded-[40px] bg-white border-[9px] border-[#1B2236] box-border overflow-hidden shadow-[0_40px_80px_-30px_rgba(11,18,32,.6)] flex flex-col ' + pos}
    >
      <div className="pt-[30px] px-4 pb-3 border-b border-line-2 flex flex-col gap-0.5">
        <span className="text-[10px] text-muted">Kinh doanh</span>
        <span className="text-[15px] font-extrabold">Phiếu bán hàng</span>
      </div>
      <div className="px-3.5 py-3 flex flex-col gap-[9px] text-[11px] bg-soft flex-1">
        <div className="flex flex-col gap-[3px]">
          <span className="font-semibold text-body">Khách hàng</span>
          <div className="bg-white border border-line-3 rounded-[9px] px-2.5 min-h-[34px] flex items-center text-[12px]">Công ty TNHH Minh Phát</div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-[3px]">
            <span className="font-semibold text-primary">Số lượng</span>
            <div className="bg-white border-[1.5px] border-primary rounded-[9px] px-2.5 min-h-[34px] flex items-center text-[12px] shadow-[0_0_0_3px_rgba(47,84,235,.12)]">12</div>
          </div>
          <div className="flex flex-col gap-[3px]">
            <span className="font-semibold text-body">Đơn giá</span>
            <div className="bg-white border border-line-3 rounded-[9px] px-2.5 min-h-[34px] flex items-center text-[12px]">1.250.000</div>
          </div>
        </div>
        <div className="bg-violet-card border border-violet-card-line rounded-xl px-3 py-2.5 flex flex-col gap-1.5">
          <div className="flex justify-between">
            <span className="text-muted">Thành tiền</span>
            <span>15.000.000</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Chiết khấu 5%</span>
            <span>− 750.000</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">VAT 10%</span>
            <span>+ 1.425.000</span>
          </div>
          <div className="h-px bg-violet-card-line" />
          <div className="flex justify-between font-extrabold text-violet-text text-[13px]">
            <span>Tổng</span>
            <span>15.675.000 ₫</span>
          </div>
        </div>
      </div>
      <div className="px-3.5 pt-3 pb-[18px] border-t border-line-2">
        <div className="bg-primary text-white rounded-[11px] min-h-10 flex items-center justify-center text-[13px] font-bold">Gửi phiếu</div>
      </div>
    </motion.div>
  );
}

function PhoneApprove({ pos = '' }: { pos?: string }) {
  return (
    <motion.div
      {...rise(0.4)}
      className={'w-[244px] h-[500px] rounded-[40px] bg-white border-[9px] border-[#1B2236] box-border overflow-hidden shadow-[0_40px_80px_-30px_rgba(11,18,32,.65)] flex flex-col ' + pos}
    >
      <div className="pt-[30px] px-4 pb-3 border-b border-line-2 flex justify-between items-center">
        <span className="text-[15px] font-extrabold">Chờ tôi duyệt</span>
        <span className="bg-amber-soft text-amber-text text-[10px] font-extrabold px-[7px] py-0.5 rounded-[99px]">3</span>
      </div>
      <div className="p-3 flex flex-col gap-[9px] bg-soft flex-1">
        <div className="bg-white border border-line rounded-[14px] p-3 flex flex-col gap-2">
          <div className="flex justify-between gap-1.5">
            <span className="text-[12px] font-bold">Doanh thu T10</span>
            <span className="text-[9px] bg-amber-soft text-amber-text px-[7px] py-0.5 rounded-full font-bold">Bước 4/4</span>
          </div>
          <span className="text-[18px] font-extrabold tracking-[-.02em]">486.240.000 ₫</span>
          <div className="flex gap-[3px]" aria-hidden="true">
            <span className="flex-1 h-1 rounded-[9px] bg-green" />
            <span className="flex-1 h-1 rounded-[9px] bg-green" />
            <span className="flex-1 h-1 rounded-[9px] bg-green" />
            <span className="flex-1 h-1 rounded-[9px] bg-amber" />
          </div>
          <div className="flex gap-1.5">
            <div className="flex-1 bg-ink text-white rounded-[9px] min-h-[34px] flex items-center justify-center text-[12px] font-bold">Phê duyệt</div>
            <div className="flex-1 border border-line-3 rounded-[9px] min-h-[34px] flex items-center justify-center text-[12px] font-semibold bg-white">Trả lại</div>
          </div>
        </div>
        <div className="bg-white border border-line rounded-[14px] p-3 flex flex-col gap-1">
          <span className="text-[12px] font-bold">Phiếu PBH-1036</span>
          <span className="text-[10px] text-muted">Cửa hàng Bảo Ngọc · 9.405.000 ₫</span>
        </div>
        <div className="bg-white border border-line rounded-[14px] p-3 flex flex-col gap-1">
          <span className="text-[12px] font-bold">Phiếu PBH-1035</span>
          <span className="text-[10px] text-muted">Công ty CP Hải Đăng · 22.000.000 ₫</span>
        </div>
      </div>
    </motion.div>
  );
}

function SyncToast({ pos = '' }: { pos?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.9, type: 'spring', stiffness: 300, damping: 20 }}
      className={'bg-white border border-line rounded-2xl px-4 py-3.5 shadow-[0_24px_48px_-20px_rgba(11,18,32,.45)] flex gap-3 items-center ' + pos}
    >
      <span className="w-9 h-9 rounded-full bg-green text-white flex items-center justify-center">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="5 12 10 17 19 7" />
        </svg>
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="text-[14px] font-bold">Đồng bộ tức thì</span>
        <span className="text-[12px] text-muted">Phiếu gửi từ điện thoại đã lên dashboard</span>
      </span>
    </motion.div>
  );
}

function Features({ mobile = false }: { mobile?: boolean }) {
  return (
    <motion.div {...rise(0.5)} className={(mobile ? 'grid grid-cols-1 gap-5' : 'grid grid-cols-3 gap-8') + ' border-t border-line pt-[22px]'}>
    {[
      {
        t: 'Dashboard cho lãnh đạo',
        s: 'Toàn cảnh mọi phòng ban trên một màn hình',
        bg: '#EEF2FF',
        fg: '#2F54EB',
        icon: (
          <>
            <rect x="2" y="4" width="20" height="13" rx="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
          </>
        ),
      },
      {
        t: 'Nhập liệu trên di động',
        s: 'Kết quả tự tính ngay khi gõ số',
        bg: '#F3EFFF',
        fg: '#5B33E0',
        icon: (
          <>
            <rect x="6" y="2" width="12" height="20" rx="2.5" />
            <line x1="11" y1="18" x2="13" y2="18" />
          </>
        ),
      },
      {
        t: 'Phê duyệt một chạm',
        s: 'Thông báo tức thì, duyệt ở mọi nơi',
        bg: '#E6F6EF',
        fg: '#047857',
        icon: (
          <>
            <path d="M9 11l3 3 8-8" />
            <path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9" />
          </>
        ),
      },
    ].map((f) => (
      <div key={f.t} className="flex gap-3.5 items-start">
        <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: f.bg, color: f.fg }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {f.icon}
          </svg>
        </span>
        <span className="flex flex-col gap-[3px]">
          <span className="text-[16px] font-bold">{f.t}</span>
          <span className="text-[14px] text-muted">{f.s}</span>
        </span>
      </div>
    ))}
    </motion.div>
  );
}

export default function GiaoDienPage() {
  const narrow = useNarrow();
  return (
    <div className="font-sans text-ink bg-soft min-h-screen">
      {narrow ? (
        <div className="showcase-bg px-4 py-10 flex flex-col gap-8">
          <Header mobile />
          <ScaledBox w={956} h={540}>
            <Laptop pos="absolute left-7 top-0" />
          </ScaledBox>
          <ScaledBox w={514} h={560} className="max-w-[514px] self-center">
            <PhoneEntry pos="absolute left-0 top-0" />
            <PhoneApprove pos="absolute left-[270px] top-[30px]" />
          </ScaledBox>
          <SyncToast pos="self-start" />
          <Features mobile />
        </div>
      ) : (
        <ScaledBox w={1440} h={1120} className="showcase-bg">
          <div className="showcase-bg w-[1440px] h-[1120px] box-border px-[88px] py-14 flex flex-col gap-9 overflow-hidden">
            <Header />
            <div className="relative flex-1">
              <Laptop pos="absolute left-0 top-2.5" />
              <PhoneEntry pos="absolute left-[850px] top-[30px]" />
              <PhoneApprove pos="absolute left-[1020px] top-[100px]" />
              <SyncToast pos="absolute left-[560px] top-[470px]" />
            </div>
            <Features />
          </div>
        </ScaledBox>
      )}
      <div className="flex justify-center gap-3 py-6 flex-wrap px-4">
        <Link to="/" className="ghost bg-white border border-line-3 text-ink no-underline px-5 min-h-11 rounded-[10px] text-[14px] font-semibold flex items-center">
          ← Trang chủ
        </Link>
        <Link to="/nhap-lieu" className="bg-primary hover:bg-primary-hover text-white hover:text-white no-underline px-5 min-h-11 rounded-[10px] text-[14px] font-bold flex items-center">
          Trải nghiệm demo
        </Link>
      </div>
    </div>
  );
}
