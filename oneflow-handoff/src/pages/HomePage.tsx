import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { Reveal } from '@/components/Reveal';

const Check = () => (
  <span className="w-5 h-5 rounded-full bg-green-soft text-green-text flex items-center justify-center">
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="5 12 10 17 19 7" />
    </svg>
  </span>
);

const btnP = 'bg-primary hover:bg-primary-hover text-white hover:text-white no-underline flex items-center';
const btnO = 'bg-white hover:bg-hover text-ink no-underline flex items-center border border-line-3';
const card = 'card-hover border border-line rounded-[22px] bg-white';
const eyebrow = 'text-[12px] font-bold tracking-[.14em] text-primary';
const h2 = 'm-0 text-[46px] leading-[1.1] font-extrabold tracking-[-.04em] [text-wrap:balance] max-[900px]:text-[34px]';

function FlowStep({ n, numBg, numFg, children }: { n: string; numBg: string; numFg: string; children: ReactNode }) {
  return (
    <div className="border border-line-2 rounded-2xl px-[18px] py-4 flex gap-3.5 items-center">
      <span className="w-10 h-10 rounded-[11px] font-extrabold text-[13px] flex items-center justify-center shrink-0" style={{ background: numBg, color: numFg }}>
        {n}
      </span>
      {children}
    </div>
  );
}

const PAINS = [
  {
    title: 'Dữ liệu phân mảnh',
    x: 'Mỗi phòng một file Excel, gửi qua Zalo, email',
    arrow: 'Số liệu vênh nhau, họp chỉ để đối chiếu',
    ok: '✓ Một nguồn dữ liệu chung',
    bullets: ['Biểu mẫu chuẩn hoá toàn công ty', 'Ai cũng thấy số mới nhất, đúng quyền hạn'],
  },
  {
    title: 'Tính toán thủ công',
    x: 'Tính tay thành tiền, chiết khấu, thuế VAT',
    arrow: 'Sai một ô, lệch cả báo cáo cuối tháng',
    ok: '✓ Công thức tự động',
    bullets: ['Gắn sẵn vào biểu mẫu, không cần gõ cú pháp', 'Tự tính lại ngay khi số liệu thay đổi'],
  },
  {
    title: 'Báo cáo chậm trễ',
    x: 'Cuối tháng mới gom số, dựng slide họp',
    arrow: 'Quyết định dựa trên dữ liệu đã cũ',
    ok: '✓ Báo cáo thời gian thực',
    bullets: ['Dashboard cập nhật theo từng phiếu', 'Duyệt và xuất Excel · Word · PowerPoint một chạm'],
  },
];

const DEPTS = [
  {
    name: 'Kế toán',
    desc: 'Thu – chi, công nợ và thuế VAT nhận thẳng từ phiếu bán hàng.',
    tags: ['Phiếu thu – chi', 'Công nợ', 'Tờ khai VAT'],
    formula: 'Tổng thu − Tổng chi = Dòng tiền',
    bg: '#E6F6EF',
    fg: '#047857',
    icon: (
      <>
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <line x1="8" y1="7" x2="16" y2="7" />
        <line x1="8" y1="12" x2="10" y2="12" />
        <line x1="14" y1="12" x2="16" y2="12" />
        <line x1="8" y1="16" x2="10" y2="16" />
        <line x1="14" y1="16" x2="16" y2="16" />
      </>
    ),
  },
  {
    name: 'Nhân sự',
    desc: 'Chấm công, bảng lương và KPI gắn với số liệu vận hành thật.',
    tags: ['Chấm công', 'Bảng lương', 'Đánh giá KPI'],
    formula: 'Lương CB ÷ 26 × Ngày công = Thực lĩnh',
    bg: '#F3EFFF',
    fg: '#5B33E0',
    icon: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
        <path d="M16 5a3 3 0 0 1 0 6" />
        <path d="M21 20c0-2.6-1.6-4.8-4-5.6" />
      </>
    ),
  },
  {
    name: 'Kho vận',
    desc: 'Tồn kho tự cập nhật khi chốt đơn, theo dõi giao hàng từng chuyến.',
    tags: ['Nhập – xuất kho', 'Tồn kho', 'Giao hàng'],
    formula: 'Tồn đầu + Nhập − Xuất = Tồn cuối',
    bg: '#FEF6E0',
    fg: '#92400E',
    icon: (
      <>
        <path d="M3 7l9-4 9 4v10l-9 4-9-4z" />
        <path d="M3 7l9 4 9-4" />
        <line x1="12" y1="11" x2="12" y2="21" />
      </>
    ),
  },
];

const STEPS = [
  { n: '01', to: '/nhap-lieu', title: 'Chuẩn hoá biểu mẫu', text: 'Kéo thả trường dữ liệu lên lưới — mỗi phòng ban có phiếu nghiệp vụ riêng trong vài phút.', cta: 'Thử kéo thả →', fg: '#2F54EB', bg: '#EEF2FF', line: '#C7D2FF' },
  { n: '02', to: '/nhap-lieu', title: 'Tự động hoá tính toán', text: 'Chọn công thức có sẵn hoặc ghép bằng cú bấm. Nhập số là có kết quả, chính xác tuyệt đối.', cta: 'Thử ghép công thức →', fg: '#5B33E0', bg: '#F3EFFF', line: '#DCD1FF' },
  { n: '03', to: '/bao-cao', title: 'Tổng hợp báo cáo tức thì', text: 'Mọi phiếu gom về dashboard theo phòng ban, nhân viên, thời gian — không cần chờ cuối tháng.', cta: 'Xem dashboard →', fg: '#047857', bg: '#E6F6EF', line: '#BDE8D6' },
  { n: '04', to: '/bao-cao', title: 'Phê duyệt & ra quyết định', text: 'Ban Giám đốc duyệt nhiều cấp, xuất Excel · Word · PowerPoint cho cuộc họp chỉ với một chạm.', cta: 'Xem luồng duyệt →', fg: '#92400E', bg: '#FEF6E0', line: '#FBE3A6' },
];

function NavLinks() {
  return (
    <>
      <a href="#diem-nghen">Giải pháp</a>
      <a href="#so-do">Phòng ban</a>
      <a href="#quy-trinh">Quy trình</a>
      <Link to="/bao-cao">Báo cáo</Link>
      <Link to="/giao-dien">Giao diện</Link>
    </>
  );
}

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="font-sans text-ink bg-white">
      {/* NAV */}
      <header className="bg-white/[.92] border-b border-line-2 sticky top-0 z-20 backdrop-blur">
        <div className="max-w-[1200px] mx-auto px-8 min-h-[72px] flex items-center justify-between gap-6 max-[900px]:px-4 max-[900px]:min-h-16 max-[900px]:gap-3">
          <Link to="/" className="flex items-center gap-3 no-underline text-ink min-w-0">
            <div className="w-10 h-10 rounded-[11px] border-[1.5px] border-dashed border-dash flex items-center justify-center text-[9px] font-bold text-muted">LOGO</div>
            <div className="flex flex-col gap-px">
              <span className="text-[18px] font-extrabold tracking-[-.03em]">
                NKC <span className="text-primary">OneFlow</span>
              </span>
              <span className="text-[11px] text-muted max-[520px]:hidden">[TÊN CÔNG TY KHÁCH HÀNG]</span>
            </div>
          </Link>
          <nav aria-label="Điều hướng chính" className="flex items-center gap-8 text-[15px] font-medium max-[1024px]:gap-5 max-[900px]:hidden [&_a]:text-body [&_a]:no-underline [&_a:hover]:text-primary">
            <NavLinks />
          </nav>
          <div className="flex items-center gap-2 shrink-0">
            <Link to="/nhap-lieu" className={btnP + ' px-5 min-h-11 rounded-[10px] text-[15px] font-bold max-[900px]:px-4'}>
              Vào demo
            </Link>
            <button
              type="button"
              aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
              className="hidden max-[900px]:flex w-11 h-11 items-center justify-center rounded-[10px] border border-line-3 bg-white text-ink cursor-pointer"
            >
              {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              aria-label="Điều hướng chính (di động)"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="hidden max-[900px]:flex flex-col overflow-hidden border-t border-line-2 px-4 text-[16px] font-medium [&_a]:text-body [&_a]:no-underline [&_a]:py-3 [&_a]:border-b [&_a]:border-line-2 [&_a:last-child]:border-b-0"
            >
              <NavLinks />
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* HERO */}
      <section className="hero-bg border-b border-line-2">
        <div className="max-w-[1200px] mx-auto px-8 pt-24 pb-[104px] grid gap-16 items-center grid-cols-[repeat(auto-fit,minmax(min(500px,100%),1fr))] max-[900px]:px-4 max-[900px]:pt-14 max-[900px]:pb-16">
          <Reveal className="flex flex-col gap-7">
            <span className="self-start flex items-center gap-2.5 bg-primary-soft text-primary rounded-full px-3.5 py-[7px] text-[12px] font-bold tracking-[.1em]">
              <span className="w-[7px] h-[7px] rounded-full bg-primary" />
              MÔ HÌNH VẬN HÀNH NỘI BỘ DOANH NGHIỆP
            </span>
            <h1 className="m-0 text-[62px] leading-[1.05] font-extrabold tracking-[-.045em] [text-wrap:balance] max-[900px]:text-[42px]">
              Vận hành toàn doanh nghiệp trên <span className="text-primary">một luồng dữ liệu</span> duy nhất
            </h1>
            <p className="m-0 text-[19px] leading-[1.65] text-body max-w-[540px] [text-wrap:pretty]">
              OneFlow chuẩn hoá biểu mẫu cho từng phòng ban, tự động hoá mọi phép tính và đưa báo cáo minh bạch lên bàn Ban Giám đốc theo thời gian thực.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link to="/nhap-lieu" className={btnP + ' px-7 min-h-14 gap-2.5 rounded-xl text-[16px] font-bold shadow-[0_14px_30px_-12px_rgba(47,84,235,.6)]'}>
                Trải nghiệm demo
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
              <Link to="/bao-cao" className={btnO + ' px-6 min-h-14 rounded-xl text-[16px] font-semibold'}>
                Xem báo cáo mẫu
              </Link>
            </div>
            <div className="flex gap-[22px] flex-wrap text-[14px] text-body font-medium">
              {['Tuỳ biến theo nghiệp vụ', 'Không cần lập trình', 'Báo cáo theo thời gian thực'].map((t) => (
                <span key={t} className="flex items-center gap-2">
                  <Check />
                  {t}
                </span>
              ))}
            </div>
          </Reveal>

          {/* Flow visual */}
          <Reveal i={2} className="relative pt-5 pr-7 pb-5 pl-0">
            <div className="bg-white border border-line rounded-3xl p-[26px] flex flex-col gap-3 shadow-[0_40px_80px_-40px_rgba(11,18,32,.35)] max-[900px]:p-4">
              <div className="flex justify-between items-center text-[13px] text-muted font-medium pb-1.5">
                <span>Luồng vận hành · Phiếu bán hàng</span>
                <span className="flex items-center gap-1.5 text-green-text font-semibold">
                  <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
                  Đang chạy
                </span>
              </div>
              <FlowStep n="01" numBg="#EEF2FF" numFg="#2F54EB">
                <div className="flex flex-col gap-2 flex-1 min-w-0">
                  <span className="font-bold text-[15px]">Nhập liệu</span>
                  <div className="flex gap-1.5 flex-wrap text-[12px] text-body">
                    <span className="bg-soft px-[9px] py-1 rounded-md">
                      Số lượng <b>12</b>
                    </span>
                    <span className="bg-soft px-[9px] py-1 rounded-md">
                      Đơn giá <b>1.250.000 ₫</b>
                    </span>
                    <span className="bg-soft px-[9px] py-1 rounded-md">
                      CK <b>5%</b>
                    </span>
                  </div>
                </div>
              </FlowStep>
              <FlowStep n="02" numBg="#F3EFFF" numFg="#5B33E0">
                <div className="flex flex-col gap-2 flex-1 min-w-0">
                  <span className="font-bold text-[15px]">Tính toán tự động</span>
                  <div className="font-mono text-[12px] flex gap-1.5 items-center flex-wrap">
                    <span className="bg-primary-soft text-primary px-2 py-[3px] rounded-md">Số lượng</span>×
                    <span className="bg-primary-soft text-primary px-2 py-[3px] rounded-md">Đơn giá</span>=
                    <span className="bg-violet-soft text-violet-text px-2 py-[3px] rounded-md font-bold">15.000.000 ₫</span>
                  </div>
                </div>
              </FlowStep>
              <FlowStep n="03" numBg="#E6F6EF" numFg="#047857">
                <div className="flex justify-between items-end gap-3 flex-1">
                  <div className="flex flex-col gap-[3px]">
                    <span className="font-bold text-[15px]">Báo cáo tổng hợp</span>
                    <span className="text-[12px] text-muted">Doanh thu theo nhân viên</span>
                  </div>
                  <div aria-hidden="true" className="flex items-end gap-1 h-9">
                    {[60, 100, 45, 80, 35].map((h, i) => (
                      <span key={i} className="w-2.5 bg-green rounded-[3px]" style={{ height: h + '%' }} />
                    ))}
                  </div>
                </div>
              </FlowStep>
              <FlowStep n="04" numBg="#FEF6E0" numFg="#92400E">
                <div className="flex justify-between items-center gap-3 flex-1 flex-wrap">
                  <span className="font-bold text-[15px]">Phê duyệt &amp; xuất file</span>
                  <div className="flex gap-[5px] text-[11px] font-extrabold text-white">
                    <span className="bg-xlsx px-2 py-1 rounded-md">XLSX</span>
                    <span className="bg-docx px-2 py-1 rounded-md">DOCX</span>
                    <span className="bg-pptx px-2 py-1 rounded-md">PPTX</span>
                  </div>
                </div>
              </FlowStep>
            </div>
            <div className="absolute right-0 -top-1.5 bg-ink text-white rounded-[14px] px-4 py-3 shadow-[0_24px_48px_-18px_rgba(11,18,32,.6)] flex flex-col gap-0.5">
              <span className="text-[11px] text-[#AEB8D0]">Doanh thu tháng 10</span>
              <span className="text-[20px] font-extrabold tracking-[-.02em]">486,2 triệu ₫</span>
              <span className="text-[11px] text-[#6EE7B7] font-bold">▲ 12,4% so với tháng 9</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* PAIN POINTS */}
      <section id="diem-nghen" className="scroll-mt-[72px]">
        <div className="max-w-[1200px] mx-auto px-8 py-[120px] flex flex-col gap-14 max-[900px]:px-4 max-[900px]:py-20">
          <Reveal className="flex flex-col gap-4 items-center text-center">
            <span className={eyebrow}>BÀI TOÁN DOANH NGHIỆP</span>
            <h2 className={h2 + ' max-w-[820px]'}>Ba điểm nghẽn khiến doanh nghiệp chậm lại — và cách OneFlow tháo gỡ</h2>
          </Reveal>
          <div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(min(340px,100%),1fr))]">
            {PAINS.map((p, i) => (
              <Reveal key={p.title} i={i} className={card + ' p-[30px] flex flex-col gap-[22px]'}>
                <span className="text-[22px] font-extrabold tracking-[-.02em]">{p.title}</span>
                <div className="flex flex-col gap-2.5 p-4 bg-red-soft rounded-[14px] text-[15px] text-body leading-[1.5]">
                  <span className="flex gap-2.5">
                    <b className="text-red-text">✕</b>
                    {p.x}
                  </span>
                  <span className="flex gap-2.5">
                    <b className="text-red-text">→</b>
                    {p.arrow}
                  </span>
                </div>
                <div className="flex flex-col gap-2.5">
                  <span className="text-[15px] font-bold text-green-text">{p.ok}</span>
                  {p.bullets.map((b) => (
                    <span key={b} className="text-[15px] text-body leading-[1.5]">
                      • {b}
                    </span>
                  ))}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* OPERATING MAP */}
      <section id="so-do" className="bg-soft border-y border-line-2 scroll-mt-[72px]">
        <div className="max-w-[1200px] mx-auto px-8 py-[120px] flex flex-col gap-12 max-[900px]:px-4 max-[900px]:py-20">
          <Reveal className="flex justify-between items-end gap-8 flex-wrap">
            <div className="flex flex-col gap-4 max-w-[700px]">
              <span className={eyebrow}>SƠ ĐỒ VẬN HÀNH</span>
              <h2 className={h2}>Mọi phòng ban kết nối trên một hệ thống. Dữ liệu chảy liền mạch, không nhập lại.</h2>
            </div>
            <p className="m-0 text-[16px] text-body max-w-[360px] leading-[1.65]">Chọn một phòng ban để xem biểu mẫu, công thức và báo cáo được thiết kế riêng cho nghiệp vụ đó.</p>
          </Reveal>

          <Reveal className="bg-white border border-line rounded-[18px] px-[22px] py-[18px] flex items-center gap-3 flex-wrap text-[14px] font-semibold">
            <span className="text-[12px] font-bold tracking-[.1em] text-muted mr-1.5">LUỒNG DỮ LIỆU</span>
            <span className="flex items-center gap-2 bg-primary-soft text-primary-hover px-3 py-[7px] rounded-full">
              <span className="w-2 h-2 rounded-[2px] bg-primary" />
              Kinh doanh
            </span>
            <span className="text-dash">→</span>
            <span className="flex items-center gap-2 bg-amber-soft text-amber-text px-3 py-[7px] rounded-full">
              <span className="w-2 h-2 rounded-[2px] bg-amber" />
              Kho vận
            </span>
            <span className="text-dash">→</span>
            <span className="flex items-center gap-2 bg-green-soft text-green-text px-3 py-[7px] rounded-full">
              <span className="w-2 h-2 rounded-[2px] bg-green" />
              Kế toán
            </span>
            <span className="text-dash">→</span>
            <span className="flex items-center gap-2 bg-ink text-white px-3 py-[7px] rounded-full">Ban Giám đốc</span>
            <span className="ml-auto flex items-center gap-2 bg-violet-soft text-violet-text px-3 py-[7px] rounded-full max-[900px]:ml-0">
              <span className="w-2 h-2 rounded-[2px] bg-violet" />
              Nhân sự cấp dữ liệu cho mọi phòng
            </span>
          </Reveal>

          {/* bento */}
          <div className="grid gap-5 grid-cols-[repeat(auto-fit,minmax(min(340px,100%),1fr))]">
            <Reveal className="col-span-2 max-[760px]:col-span-1">
              <Link
                to="/nhap-lieu"
                className={card + ' no-underline text-ink p-[30px] grid gap-7 grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] h-full box-border'}
              >
                <div className="flex flex-col gap-[18px]">
                  <div className="flex items-center justify-between">
                    <span className="w-[50px] h-[50px] rounded-[14px] bg-primary text-white flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="3 17 9 11 13 15 21 7" />
                        <polyline points="14 7 21 7 21 14" />
                      </svg>
                    </span>
                    <span className="text-[11px] font-extrabold tracking-[.08em] bg-amber-soft text-amber-text px-2.5 py-[5px] rounded-full">KỊCH BẢN DEMO</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-[24px] font-extrabold tracking-[-.02em]">Kinh doanh</span>
                    <span className="text-[15px] text-body leading-[1.6]">Chuẩn hoá phiếu bán hàng, báo giá và theo dõi doanh thu từng nhân viên theo thời gian thực.</span>
                  </div>
                  <div className="flex gap-1.5 flex-wrap text-[13px] font-semibold">
                    {['Phiếu bán hàng', 'Báo giá', 'Hợp đồng'].map((t) => (
                      <span key={t} className="border border-line px-2.5 py-[5px] rounded-full">
                        {t}
                      </span>
                    ))}
                  </div>
                  <span className="text-[13px] text-muted">
                    Dữ liệu chuyển tới → <b className="text-ink">Kho vận · Kế toán · Ban Giám đốc</b>
                  </span>
                  <span className="text-[15px] font-bold text-primary">Mở luồng demo →</span>
                </div>
                <div className="bg-soft rounded-2xl p-4 flex flex-col gap-2.5">
                  <div className="flex justify-between text-[12px] font-bold">
                    <span>Phiếu bán hàng #1038</span>
                    <span className="text-green-text">Đã tính</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    {[
                      ['Số lượng', '12'],
                      ['Đơn giá', '1.250.000'],
                      ['Chiết khấu', '5 %'],
                      ['VAT', '10 %'],
                    ].map(([k, v]) => (
                      <div key={k} className="bg-white border border-line rounded-lg p-2 flex flex-col gap-0.5">
                        <span className="text-muted">{k}</span>
                        <b className="text-[13px]">{v}</b>
                      </div>
                    ))}
                  </div>
                  <div className="bg-violet-soft rounded-[10px] p-3 flex justify-between items-center">
                    <span className="text-[11px] font-bold text-violet-text">TỔNG THANH TOÁN</span>
                    <span className="text-[18px] font-extrabold text-violet-text">15.675.000 ₫</span>
                  </div>
                </div>
              </Link>
            </Reveal>

            <Reveal i={1}>
              <Link to="/bao-cao" className="card-hover navy no-underline text-white hover:text-white border border-ink rounded-[22px] p-[30px] flex flex-col gap-[18px] h-full box-border">
                <span className="w-[50px] h-[50px] rounded-[14px] bg-white/[.12] text-white flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 3v9h9" />
                  </svg>
                </span>
                <div className="flex flex-col gap-2">
                  <span className="text-[24px] font-extrabold tracking-[-.02em]">Ban Giám đốc</span>
                  <span className="text-[15px] text-[#C5CEE0] leading-[1.6]">Nhận dữ liệu từ mọi phòng ban, duyệt báo cáo và ra quyết định trên một màn hình.</span>
                </div>
                <div className="flex gap-1.5 flex-wrap text-[13px] font-semibold">
                  {['Dashboard', 'Phê duyệt', 'Xuất file họp'].map((t) => (
                    <span key={t} className="border border-white/20 px-2.5 py-[5px] rounded-full">
                      {t}
                    </span>
                  ))}
                </div>
                <span className="mt-auto text-[15px] font-bold text-[#A5B4FF]">Xem báo cáo →</span>
              </Link>
            </Reveal>

            {DEPTS.map((d, i) => (
              <Reveal key={d.name} i={i}>
                <Link to="/nhap-lieu" className={card + ' no-underline text-ink p-7 flex flex-col gap-4 h-full box-border'}>
                  <span className="w-[46px] h-[46px] rounded-[13px] flex items-center justify-center" style={{ background: d.bg, color: d.fg }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      {d.icon}
                    </svg>
                  </span>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[21px] font-extrabold tracking-[-.02em]">{d.name}</span>
                    <span className="text-[15px] text-body leading-[1.6]">{d.desc}</span>
                  </div>
                  <div className="flex gap-1.5 flex-wrap text-[12px] font-semibold">
                    {d.tags.map((t) => (
                      <span key={t} className="border border-line px-[9px] py-1 rounded-full">
                        {t}
                      </span>
                    ))}
                  </div>
                  <span className="mt-auto font-mono text-[12px] text-violet-text bg-violet-soft px-2.5 py-2 rounded-lg">{d.formula}</span>
                </Link>
              </Reveal>
            ))}

            <Reveal className="col-[1/-1] border-[1.5px] border-dashed border-[#C9D1DF] rounded-[22px] px-7 py-6 flex items-center justify-between gap-5 flex-wrap bg-white/60">
              <div className="flex flex-col gap-1.5">
                <span className="text-[18px] font-extrabold">Mở rộng theo đặc thù doanh nghiệp của bạn</span>
                <span className="text-[15px] text-body">Thêm phòng ban và nghiệp vụ bất kỳ — chỉ bằng kéo thả biểu mẫu mới.</span>
              </div>
              <div className="flex gap-2 flex-wrap text-[13px] font-semibold">
                {['Mua hàng', 'Marketing', 'Dự án', 'Chăm sóc khách hàng', 'Sản xuất'].map((t) => (
                  <span key={t} className="bg-white border border-line px-3 py-[7px] rounded-full">
                    {t}
                  </span>
                ))}
                <span className="bg-primary text-white px-3 py-[7px] rounded-full">+ Phòng ban của bạn</span>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 4 STEPS */}
      <section id="quy-trinh" className="scroll-mt-[72px]">
        <div className="max-w-[1200px] mx-auto px-8 py-[120px] flex flex-col gap-14 max-[900px]:px-4 max-[900px]:py-20">
          <Reveal className="flex flex-col gap-4 items-center text-center">
            <span className={eyebrow}>QUY TRÌNH VẬN HÀNH</span>
            <h2 className={h2 + ' max-w-[800px]'}>Bốn bước biến dữ liệu rời rạc thành quyết định chính xác</h2>
          </Reveal>
          <div className="relative grid gap-5 grid-cols-[repeat(auto-fit,minmax(min(250px,100%),1fr))]">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} i={i}>
                <Link to={s.to} className={card + ' no-underline text-ink p-7 flex flex-col gap-4 h-full box-border'}>
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[13px] font-bold px-2.5 py-1.5 rounded-lg" style={{ color: s.fg, background: s.bg }}>
                      {s.n}
                    </span>
                    <span className="h-0.5 flex-1 ml-3.5" style={{ background: `linear-gradient(90deg, ${s.line}, transparent)` }} />
                  </div>
                  <span className="text-[20px] font-extrabold tracking-[-.02em] leading-[1.3]">{s.title}</span>
                  <span className="text-[15px] text-body leading-[1.6]">{s.text}</span>
                  <span className="mt-auto text-[14px] font-bold" style={{ color: s.fg }}>
                    {s.cta}
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-8 pb-[120px] max-[900px]:px-4 max-[900px]:pb-20">
        <Reveal className="navy max-w-[1136px] mx-auto rounded-[28px] px-14 py-16 flex justify-between items-center gap-8 flex-wrap text-white max-[900px]:px-6 max-[900px]:py-10">
          <div className="flex flex-col gap-3.5 max-w-[640px]">
            <h2 className="m-0 text-[40px] leading-[1.12] font-extrabold tracking-[-.035em] max-[900px]:text-[30px]">Sẵn sàng đưa doanh nghiệp vận hành trên một luồng?</h2>
            <p className="m-0 text-[17px] leading-[1.6] text-[#C5CEE0]">Dựng một phiếu bán hàng, nhập số thử và xem báo cáo hình thành — chỉ trong vài phút.</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link to="/nhap-lieu" className={btnP + ' px-[26px] min-h-[54px] rounded-xl text-[16px] font-bold'}>
              Trải nghiệm demo
            </Link>
            <Link to="/giao-dien" className="text-white hover:text-white hover:bg-white/[.14] no-underline px-[22px] min-h-[54px] flex items-center rounded-xl text-[16px] font-semibold border border-white/[.24]">
              Xem giao diện
            </Link>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-line-2">
        <div className="max-w-[1200px] mx-auto px-8 py-7 flex justify-between gap-4 flex-wrap text-[14px] text-muted max-[900px]:px-4">
          <span>
            <b className="text-ink">NKC OneFlow</b> · Mô hình vận hành nội bộ doanh nghiệp
          </span>
          <span>© 2026 · Bản demo</span>
        </div>
      </footer>
    </div>
  );
}
