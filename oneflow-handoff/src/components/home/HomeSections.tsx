import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useReducedMotion,
} from 'motion/react';
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Boxes,
  Building2,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Database,
  MousePointer2,
  Plus,
  Radio,
  ShieldCheck,
  Sigma,
  Sparkles,
  Users,
  Warehouse,
  Workflow,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const EASE = [0.22, 1, 0.36, 1] as const;

function setSpotlight(event: PointerEvent<HTMLElement>) {
  if (event.pointerType === 'touch') return;
  const rect = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty('--spot-x', `${event.clientX - rect.left}px`);
  event.currentTarget.style.setProperty('--spot-y', `${event.clientY - rect.top}px`);
}

function SystemLabel({ children, tone = 'blue' }: { children: ReactNode; tone?: 'blue' | 'green' | 'amber' }) {
  return <span className={`home-system-label home-system-label--${tone}`}>{children}</span>;
}

function SignalBackground() {
  return (
    <div className="home-signal-bg" aria-hidden="true">
      <div className="home-signal-bg__mesh home-signal-bg__mesh--blue" />
      <div className="home-signal-bg__mesh home-signal-bg__mesh--violet" />
      <div className="home-signal-bg__grid" />
      <div className="home-signal-bg__beam" />
      <div className="home-signal-bg__prism"><i /><i /><i /></div>
      <svg viewBox="0 0 1440 900" preserveAspectRatio="none">
        <path d="M-80 675C180 675 190 520 410 520S650 245 860 245s260 218 660 218" />
        <path d="M210 0v900M610 0v900M1010 0v900" className="home-signal-bg__minor" />
      </svg>
      <span className="home-signal-bg__coordinate home-signal-bg__coordinate--a">SYS / 01</span>
      <span className="home-signal-bg__coordinate home-signal-bg__coordinate--b">LIVE DATA / 24 FPS</span>
    </div>
  );
}

const ENGINE_STEPS = [
  { label: 'Nhập liệu', detail: '12 × 1.250.000 ₫', icon: Database, status: 'VALIDATED' },
  { label: 'Tính toán', detail: 'SL × Đơn giá − CK + VAT', icon: Sigma, status: 'COMPUTED' },
  { label: 'Báo cáo', detail: '486,2 triệu ₫', icon: BarChart3, status: 'SYNCED' },
  { label: 'Phê duyệt', detail: 'XLSX · DOCX · PPTX', icon: BadgeCheck, status: 'READY' },
];

function WorkflowEngine() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.2 });
  const reducedMotion = useReducedMotion();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reducedMotion || !inView) return;
    const timer = window.setInterval(() => setActive((step) => (step + 1) % ENGINE_STEPS.length), 1800);
    return () => window.clearInterval(timer);
  }, [inView, reducedMotion]);

  return (
    <motion.div
      ref={ref}
      className="workflow-engine"
      initial={reducedMotion ? false : { opacity: 0, scale: 0.975, x: 24 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      transition={{ duration: 0.75, delay: 0.35, ease: EASE }}
      onPointerMove={setSpotlight}
    >
      <div className="workflow-engine__chrome">
        <span className="workflow-engine__dots"><i /><i /><i /></span>
        <span>workflow://sales-order/1038</span>
        <span className="workflow-engine__live"><Radio size={13} /> LIVE</span>
      </div>

      <div className="workflow-engine__body">
        <div className="workflow-engine__meta">
          <div>
            <span>OPERATIONAL SIGNAL</span>
            <strong>Phiếu bán hàng #1038</strong>
          </div>
          <div className="workflow-engine__latency">
            <span>LATENCY</span>
            <strong>24 ms</strong>
          </div>
        </div>

        <div className="workflow-engine__rail" aria-hidden="true">
          <span className="workflow-engine__rail-line" />
          <motion.span
            className="workflow-engine__rail-signal"
            animate={{ top: `${12.5 + active * 25}%` }}
            transition={{ type: 'spring', stiffness: 180, damping: 24 }}
          />
        </div>

        <div className="workflow-engine__steps" role="group" aria-label="Mô phỏng luồng vận hành">
          {ENGINE_STEPS.map((step, index) => {
            const Icon = step.icon;
            const completed = index <= active;
            return (
              <button
                type="button"
                key={step.label}
                className={`workflow-engine__step ${active === index ? 'is-active' : ''} ${completed ? 'is-complete' : ''}`}
                onClick={() => setActive(index)}
                onFocus={() => setActive(index)}
              >
                <span className="workflow-engine__step-icon"><Icon size={18} /></span>
                <span className="workflow-engine__step-copy">
                  <span>{String(index + 1).padStart(2, '0')} / {step.label}</span>
                  <strong>{step.detail}</strong>
                </span>
                <span className="workflow-engine__status">{active === index ? step.status : completed ? 'DONE' : 'QUEUED'}</span>
              </button>
            );
          })}
        </div>

        <div className="workflow-engine__footer">
          <span><i className="is-green" /> Schema valid</span>
          <span><i className="is-blue" /> Auto-save</span>
          <strong>{active === 0 ? '12 trường dữ liệu' : active === 1 ? '15.675.000 ₫' : active === 2 ? '+12,4% tăng trưởng' : 'Sẵn sàng xuất file'}</strong>
        </div>
      </div>
    </motion.div>
  );
}

export function HeroSection() {
  const reducedMotion = useReducedMotion();
  const lines = ['Một luồng dữ liệu.', 'Toàn bộ vận hành.'];

  return (
    <section id="home" className="home-hero">
      <SignalBackground />
      <div className="home-shell home-hero__inner">
        <div className="home-hero__copy">
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            <SystemLabel><Zap size={13} /> HỆ ĐIỀU HÀNH DOANH NGHIỆP</SystemLabel>
          </motion.div>

          <h1 className="home-hero__title">
            {lines.map((line, index) => (
              <span className="home-mask-line" key={line}>
                <motion.span
                  initial={reducedMotion ? false : { y: '108%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.75, delay: 0.16 + index * 0.09, ease: EASE }}
                  className={index === 0 ? 'is-accent' : ''}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            className="home-hero__lead"
            initial={reducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.42, ease: EASE }}
          >
            Chuẩn hoá biểu mẫu, tự động hoá tính toán và đưa dữ liệu thời gian thực đến đúng người — trên một hệ thống duy nhất.
          </motion.p>

          <motion.div
            className="home-hero__actions"
            initial={reducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.52, ease: EASE }}
          >
            <Link to="/nhap-lieu" className="home-button home-button--primary">
              Trải nghiệm luồng demo <ArrowRight size={18} />
            </Link>
            <a href="#workflow" className="home-button home-button--ghost">
              Xem hệ thống vận hành <ChevronRight size={17} />
            </a>
          </motion.div>

          <motion.div
            className="home-hero__telemetry"
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <span><Boxes size={15} /> Tuỳ biến nghiệp vụ</span>
            <span><Sparkles size={15} /> No-code</span>
            <span><Radio size={15} /> Realtime</span>
          </motion.div>
        </div>

        <div className="home-hero__visual">
          <div className="home-hero__orbit" aria-hidden="true"><i /><i /><i /><span /></div>
          <div className="home-hero__float home-hero__float--input" aria-hidden="true"><i /> INPUT / VALID</div>
          <div className="home-hero__float home-hero__float--sync" aria-hidden="true"><i /> SYNC / 24 MS</div>
          <WorkflowEngine />
        </div>
      </div>
      <div className="home-hero__scroll-cue" aria-hidden="true"><span /> SCROLL TO TRACE THE SIGNAL</div>
    </section>
  );
}

const PAINS = [
  {
    id: 'fragment',
    index: '01',
    title: 'Dữ liệu phân mảnh',
    before: 'Excel · Zalo · Email',
    outcome: 'Một schema dữ liệu chung',
    detail: 'Mọi phòng ban nhìn thấy cùng một phiên bản dữ liệu, đúng quyền hạn.',
    icon: Database,
  },
  {
    id: 'manual',
    index: '02',
    title: 'Tính toán thủ công',
    before: 'Sai một ô, lệch cả báo cáo',
    outcome: 'Công thức tự động',
    detail: 'Kết quả được tính lại tức thì khi bất kỳ dữ liệu đầu vào nào thay đổi.',
    icon: Sigma,
  },
  {
    id: 'delay',
    index: '03',
    title: 'Báo cáo chậm trễ',
    before: 'Cuối tháng mới gom số',
    outcome: 'Dashboard thời gian thực',
    detail: 'Mỗi phiếu mới lập tức cập nhật dashboard và luồng phê duyệt.',
    icon: Clock3,
  },
];

function TransformationVisual({ active }: { active: number }) {
  const labels = active === 0
    ? ['Excel / Sales', 'Zalo / Kho', 'Email / Kế toán']
    : active === 1
      ? ['Số lượng / 12', 'Đơn giá / 1.250.000', 'VAT / 10%']
      : ['PBH-1038', 'Doanh thu / 486,2M', 'Approved / 09:42'];

  return (
    <div className={`transform-visual transform-visual--${active}`}>
      <div className="transform-visual__topbar">
        <span>RAW INPUT / 03 SOURCES</span>
        <span className="is-live"><i /> NORMALIZING</span>
      </div>
      <div className="transform-visual__field">
        <svg viewBox="0 0 600 360" preserveAspectRatio="none" aria-hidden="true">
          <path d="M72 72C210 72 206 180 300 180S390 288 528 288" />
          <path d="M72 180H528" />
          <path d="M72 288C210 288 206 180 300 180S390 72 528 72" />
        </svg>
        <div className="transform-visual__source-stack">
          {labels.map((label, index) => (
            <motion.div
              key={`${active}-${label}`}
              className="transform-visual__packet"
              initial={{ opacity: 0, x: -16, rotate: index === 0 ? -2 : index === 2 ? 2 : 0 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              transition={{ delay: index * 0.07, ease: EASE }}
            >
              <span>0{index + 1}</span>{label}
            </motion.div>
          ))}
        </div>
        <motion.div
          key={active}
          className="transform-visual__core"
          initial={{ scale: 0.86, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 22 }}
        >
          {active === 0 ? <Database /> : active === 1 ? <Sigma /> : <BarChart3 />}
          <span>{active === 0 ? 'SHARED SCHEMA' : active === 1 ? 'FORMULA ENGINE' : 'LIVE REPORT'}</span>
        </motion.div>
        <div className="transform-visual__output">
          <span><Check size={14} /> Validated</span>
          <strong>{active === 0 ? '1 nguồn dữ liệu' : active === 1 ? '15.675.000 ₫' : 'Realtime · 24 ms'}</strong>
        </div>
      </div>
    </div>
  );
}

export function TransformationSection() {
  const [active, setActive] = useState(0);

  return (
    <section id="diem-nghen" className="home-section transformation-section">
      <div className="home-shell">
        <div className="home-section__head home-section__head--split">
          <div>
            <SystemLabel>01 / NORMALIZE</SystemLabel>
            <h2>Từ dữ liệu rời rạc<br />đến một dòng chảy chuẩn.</h2>
          </div>
          <p>OneFlow không chỉ gom dữ liệu. Hệ thống chuẩn hoá, tính toán và chuyển tiếp mọi tín hiệu vận hành theo thời gian thực.</p>
        </div>

        <div className="transformation-layout">
          <TransformationVisual active={active} />
          <div className="transformation-list" role="group" aria-label="Các điểm nghẽn được OneFlow xử lý">
            {PAINS.map((pain, index) => {
              const Icon = pain.icon;
              return (
                <button
                  type="button"
                  key={pain.id}
                  className={`transformation-item ${active === index ? 'is-active' : ''}`}
                  aria-pressed={active === index}
                  onClick={() => setActive(index)}
                  onPointerEnter={() => setActive(index)}
                  onFocus={() => setActive(index)}
                >
                  <span className="transformation-item__index">{pain.index}</span>
                  <span className="transformation-item__icon"><Icon size={19} /></span>
                  <span className="transformation-item__copy">
                    <strong>{pain.title}</strong>
                    <span className="transformation-item__before">{pain.before}</span>
                    <span className="transformation-item__outcome"><ArrowRight size={14} /> {pain.outcome}</span>
                    <small>{pain.detail}</small>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

const STORY_STEPS = [
  { id: 'input', index: '01', title: 'Nhập dữ liệu', eyebrow: 'FORM BUILDER', text: 'Kéo thả trường dữ liệu và chuẩn hoá biểu mẫu theo đúng nghiệp vụ.' },
  { id: 'compute', index: '02', title: 'Tính toán tự động', eyebrow: 'FORMULA ENGINE', text: 'Ghép công thức trực quan. Kết quả thay đổi ngay cùng dữ liệu đầu vào.' },
  { id: 'report', index: '03', title: 'Báo cáo tức thì', eyebrow: 'LIVE ANALYTICS', text: 'Mọi phiếu được tổng hợp thành KPI và biểu đồ theo thời gian thực.' },
  { id: 'approve', index: '04', title: 'Phê duyệt & xuất file', eyebrow: 'CONTROL GATE', text: 'Kiểm soát nhiều cấp và xuất tài liệu họp chỉ với một thao tác.' },
];

function CountUpMoney() {
  const reducedMotion = useReducedMotion();
  const [value, setValue] = useState(reducedMotion ? 15675000 : 0);

  useEffect(() => {
    if (reducedMotion) {
      setValue(15675000);
      return;
    }
    const control = animate(0, 15675000, {
      duration: 0.85,
      ease: EASE,
      onUpdate: (latest) => setValue(Math.round(latest)),
    });
    return () => control.stop();
  }, [reducedMotion]);

  return <>{new Intl.NumberFormat('vi-VN').format(value)} ₫</>;
}

function StoryStage({ active }: { active: number }) {
  return (
    <div className="story-stage" onPointerMove={setSpotlight}>
      <div className="story-stage__chrome">
        <span className="workflow-engine__dots"><i /><i /><i /></span>
        <span>NKC OneFlow / Sales operation</span>
        <span className="story-stage__secure"><ShieldCheck size={14} /> SECURE</span>
      </div>
      <div className="story-stage__body">
        <AnimatePresence mode="wait">
          <motion.div
            key={STORY_STEPS[active].id}
            className="story-state"
            initial={{ opacity: 0, y: 10, filter: 'blur(5px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
            transition={{ duration: 0.34, ease: EASE }}
          >
            {active === 0 && <InputState />}
            {active === 1 && <ComputeState />}
            {active === 2 && <ReportState />}
            {active === 3 && <ApprovalState />}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="story-stage__footer">
        <span>STATE {active + 1}/4</span>
        <div className="story-stage__progress"><motion.span animate={{ width: `${(active + 1) * 25}%` }} /></div>
        <span>24 ms</span>
      </div>
    </div>
  );
}

function InputState() {
  return (
    <>
      <div className="story-state__heading"><span>PBH-1038</span><strong>Phiếu bán hàng</strong><em>Đang nhập</em></div>
      <div className="input-state__grid">
        {[
          ['Khách hàng', 'Công ty Minh Phát'],
          ['Nhân viên', 'Trần Thu Hà'],
          ['Số lượng', '12'],
          ['Đơn giá', '1.250.000 ₫'],
        ].map(([label, value], index) => (
          <motion.div key={label} initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.05 * index }}>
            <span>{label}</span><strong>{value}</strong>
          </motion.div>
        ))}
      </div>
      <div className="input-state__cursor"><MousePointer2 size={17} /> Auto-save enabled</div>
    </>
  );
}

function ComputeState() {
  return (
    <>
      <div className="story-state__heading"><span>FORMULA-04</span><strong>Tổng thanh toán</strong><em className="is-violet">Đang tính</em></div>
      <div className="compute-state__expression">
        {['Số lượng', '×', 'Đơn giá', '−', 'Chiết khấu', '+', 'VAT'].map((token, index) => (
          <motion.span key={`${token}-${index}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.045 }} className={token.length === 1 ? 'is-operator' : ''}>{token}</motion.span>
        ))}
      </div>
      <div className="compute-state__result">
        <span>KẾT QUẢ ĐÃ KIỂM TRA</span>
        <strong><CountUpMoney /></strong>
        <small><Check size={14} /> Công thức hợp lệ · Không có tham chiếu lỗi</small>
      </div>
    </>
  );
}

function ReportState() {
  const bars = [42, 58, 50, 74, 64, 92, 82, 100];
  return (
    <>
      <div className="story-state__heading"><span>OCT / 2026</span><strong>Doanh thu theo ngày</strong><em className="is-green">Realtime</em></div>
      <div className="report-state__kpis">
        <div><span>Doanh thu</span><strong>486,2M</strong><small>↑ 12,4%</small></div>
        <div><span>Phiếu đã duyệt</span><strong>128</strong><small>94,8%</small></div>
      </div>
      <div className="report-state__chart">
        {bars.map((height, index) => <motion.i key={index} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: index * 0.04, duration: 0.45, ease: EASE }} style={{ height: `${height}%` }} />)}
      </div>
    </>
  );
}

function ApprovalState() {
  return (
    <>
      <div className="story-state__heading"><span>APPROVAL-02</span><strong>Phê duyệt báo cáo</strong><em className="is-green">Sẵn sàng</em></div>
      <div className="approval-state__timeline">
        <div className="is-done"><span><Check size={15} /></span><strong>Trưởng phòng Kinh doanh</strong><small>Đã duyệt · 09:38</small></div>
        <div className="is-active"><span>NH</span><strong>Nguyễn Hoàng · Giám đốc</strong><small>Đang xem báo cáo</small></div>
      </div>
      <div className="approval-state__exports">
        <span className="is-xlsx">XLSX</span><span className="is-docx">DOCX</span><span className="is-pptx">PPTX</span><strong><BadgeCheck size={16} /> Audit trail đã ghi nhận</strong>
      </div>
    </>
  );
}

export function WorkflowStorySection() {
  const [active, setActive] = useState(0);

  return (
    <section id="workflow" className="home-section workflow-story-section">
      <div className="home-shell">
        <div className="home-section__head home-section__head--dark">
          <SystemLabel tone="green">02 / TRACE THE SIGNAL</SystemLabel>
          <h2>Một tín hiệu. Bốn trạng thái.<br />Không một lần nhập lại.</h2>
          <p>Cuộn qua toàn bộ hành trình của một phiếu bán hàng — từ dữ liệu thô đến quyết định đã được phê duyệt.</p>
        </div>

        <div className="workflow-story-layout">
          <div className="workflow-story-steps">
            {STORY_STEPS.map((step, index) => (
              <motion.button
                type="button"
                key={step.id}
                className={`workflow-story-step ${active === index ? 'is-active' : ''}`}
                aria-pressed={active === index}
                onClick={() => setActive(index)}
                onFocus={() => setActive(index)}
                onViewportEnter={() => setActive(index)}
                viewport={{ amount: 0.6, margin: '-15% 0px -20% 0px' }}
              >
                <span>{step.index}</span>
                <div><small>{step.eyebrow}</small><strong>{step.title}</strong><p>{step.text}</p></div>
              </motion.button>
            ))}
          </div>
          <div className="workflow-story-stage-wrap">
            <StoryStage active={active} />
          </div>
        </div>
      </div>
    </section>
  );
}

type Department = {
  name: string;
  short: string;
  description: string;
  formula: string;
  tags: string[];
  icon: LucideIcon;
  position: string;
  path: string;
  tone: string;
  route: string;
};

const DEPARTMENTS: Department[] = [
  { name: 'Kinh doanh', short: 'SALES', description: 'Khởi tạo phiếu bán hàng, báo giá và doanh thu theo nhân viên.', formula: '12 × 1.250.000 = 15.000.000', tags: ['Phiếu bán hàng', 'Báo giá'], icon: CircleDollarSign, position: 'network-node--sales', path: 'M400 260C300 260 270 130 150 130', tone: 'blue', route: '/nhap-lieu' },
  { name: 'Kho vận', short: 'WAREHOUSE', description: 'Tồn kho cập nhật ngay khi đơn hàng được xác nhận.', formula: 'Tồn đầu + Nhập − Xuất = Tồn cuối', tags: ['Tồn kho', 'Giao hàng'], icon: Warehouse, position: 'network-node--warehouse', path: 'M400 260C500 260 535 130 650 130', tone: 'amber', route: '/nhap-lieu' },
  { name: 'Kế toán', short: 'FINANCE', description: 'Thu, chi, công nợ và VAT nhận dữ liệu trực tiếp từ phiếu.', formula: 'Tổng thu − Tổng chi = Dòng tiền', tags: ['Công nợ', 'Thuế VAT'], icon: Building2, position: 'network-node--finance', path: 'M400 260C500 260 535 390 650 390', tone: 'green', route: '/nhap-lieu' },
  { name: 'Nhân sự', short: 'PEOPLE', description: 'KPI và bảng lương liên kết với dữ liệu vận hành thực.', formula: 'Lương CB ÷ 26 × Ngày công', tags: ['KPI', 'Bảng lương'], icon: Users, position: 'network-node--people', path: 'M400 260C300 260 270 390 150 390', tone: 'violet', route: '/nhap-lieu' },
  { name: 'Ban Giám đốc', short: 'CONTROL', description: 'Một màn hình để theo dõi, phê duyệt và ra quyết định.', formula: '5 phòng ban → 1 nguồn sự thật', tags: ['Dashboard', 'Phê duyệt'], icon: ShieldCheck, position: 'network-node--director', path: 'M400 260V70', tone: 'white', route: '/bao-cao' },
];

export function DepartmentNetworkSection() {
  const [active, setActive] = useState(0);
  const selected = DEPARTMENTS[active];
  const Icon = selected.icon;

  const moveFocus = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(event.key)) return;
    event.preventDefault();
    const direction = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1;
    const next = (index + direction + DEPARTMENTS.length) % DEPARTMENTS.length;
    setActive(next);
    document.querySelector<HTMLButtonElement>(`[data-network-index="${next}"]`)?.focus();
  };

  return (
    <section id="so-do" className="home-section department-section">
      <div className="home-shell">
        <div className="home-section__head home-section__head--split home-section__head--dark">
          <div><SystemLabel>03 / CONNECT</SystemLabel><h2>Mọi phòng ban.<br />Một mạng vận hành.</h2></div>
          <p>Chọn một node để theo dõi dữ liệu, công thức và đầu ra đang được chuyển qua hệ thống.</p>
        </div>

        <div className="department-layout">
          <div className="department-network" role="group" aria-label="Mạng lưới phòng ban">
            <svg viewBox="0 0 800 500" preserveAspectRatio="none" aria-hidden="true">
              {DEPARTMENTS.map((department) => <path key={department.name} d={department.path} className="department-network__base-path" />)}
              <motion.path
                key={selected.name}
                d={selected.path}
                className="department-network__active-path"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.65, ease: EASE }}
              />
              <path d={selected.path} className="department-network__signal-path" />
            </svg>
            <div className="department-network__core"><Workflow size={24} /><span>ONEFLOW</span><i /></div>
            {DEPARTMENTS.map((department, index) => {
              const NodeIcon = department.icon;
              return (
                <button
                  key={department.name}
                  type="button"
                  data-network-index={index}
                  className={`network-node ${department.position} network-node--${department.tone} ${active === index ? 'is-active' : ''}`}
                  aria-pressed={active === index}
                  onPointerEnter={() => setActive(index)}
                  onFocus={() => setActive(index)}
                  onClick={() => setActive(index)}
                  onKeyDown={(event) => moveFocus(event, index)}
                >
                  <span><NodeIcon size={19} /></span><strong>{department.name}</strong><small>{department.short}</small>
                </button>
              );
            })}
          </div>

          <div className="department-inspector" onPointerMove={setSpotlight}>
            <div className="department-inspector__head"><span>ACTIVE NODE / {String(active + 1).padStart(2, '0')}</span><i /></div>
            <AnimatePresence mode="wait">
              <motion.div key={selected.name} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.25 }}>
                <div className={`department-inspector__icon is-${selected.tone}`}><Icon size={24} /></div>
                <span className="department-inspector__eyebrow">{selected.short} / LIVE CONNECTION</span>
                <h3>{selected.name}</h3>
                <p>{selected.description}</p>
                <div className="department-inspector__tags">{selected.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                <div className="department-inspector__formula"><Sigma size={15} /><span>{selected.formula}</span></div>
                <Link to={selected.route}>Mở luồng {selected.name.toLowerCase()} <ArrowRight size={16} /></Link>
              </motion.div>
            </AnimatePresence>
            <button type="button" className="department-inspector__add"><Plus size={16} /> Kết nối phòng ban mới</button>
          </div>
        </div>
      </div>
    </section>
  );
}

const PROCESS_STEPS = [
  { n: '01', title: 'Chuẩn hoá biểu mẫu', text: 'Kéo thả trường dữ liệu theo đúng nghiệp vụ.', icon: Boxes, route: '/nhap-lieu' },
  { n: '02', title: 'Tự động tính toán', text: 'Công thức no-code cập nhật theo từng thay đổi.', icon: Sigma, route: '/nhap-lieu' },
  { n: '03', title: 'Tổng hợp tức thì', text: 'KPI và báo cáo luôn ở trạng thái mới nhất.', icon: BarChart3, route: '/bao-cao' },
  { n: '04', title: 'Phê duyệt quyết định', text: 'Đúng người, đúng dữ liệu, đầy đủ audit trail.', icon: BadgeCheck, route: '/bao-cao' },
];

export function ProcessSection() {
  const [active, setActive] = useState(0);
  return (
    <section id="quy-trinh" className="home-section process-section">
      <div className="home-shell">
        <div className="home-section__head">
          <SystemLabel tone="amber">04 / OPERATE</SystemLabel>
          <h2>Bốn checkpoint.<br />Một quy trình liên tục.</h2>
        </div>
        <div className="process-rail" style={{ '--process-active': active } as CSSProperties}>
          <div className="process-rail__line" aria-hidden="true"><motion.i animate={{ left: `${active * 33.333}%` }} transition={{ type: 'spring', stiffness: 180, damping: 24 }} /></div>
          {PROCESS_STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <Link
                key={step.n}
                to={step.route}
                className={`process-step ${active === index ? 'is-active' : ''}`}
                onPointerEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
              >
                <span className="process-step__node"><Icon size={19} /></span>
                <small>{step.n} / CHECKPOINT</small>
                <strong>{step.title}</strong>
                <p>{step.text}</p>
                <span className="process-step__link">Khám phá <ArrowRight size={14} /></span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function FinalCTA() {
  return (
    <section className="home-cta-section">
      <div className="home-shell">
        <div className="home-cta" onPointerMove={setSpotlight}>
          <div className="home-cta__grid" aria-hidden="true" />
          <div className="home-cta__signal" aria-hidden="true"><i /></div>
          <div className="home-cta__orb" aria-hidden="true"><i /><i /><i /><span><Workflow size={30} /></span></div>
          <div className="home-cta__status"><span><Check size={15} /></span> WORKFLOW READY</div>
          <h2>Sẵn sàng vận hành<br />trên một luồng?</h2>
          <p>Dựng biểu mẫu, nhập dữ liệu thử và xem báo cáo hình thành trong vài phút.</p>
          <div className="home-cta__actions">
            <Link to="/nhap-lieu" className="home-button home-button--primary">Trải nghiệm demo <ArrowRight size={18} /></Link>
            <Link to="/giao-dien" className="home-button home-button--ghost">Xem giao diện <ChevronRight size={17} /></Link>
          </div>
          <div className="home-cta__meta"><span>NO-CODE SETUP</span><span>REALTIME REPORT</span><span>MULTI-LEVEL APPROVAL</span></div>
        </div>
      </div>
    </section>
  );
}

export function HomeFooter() {
  return (
    <footer className="home-footer">
      <div className="home-shell home-footer__inner">
        <div><strong>NKC OneFlow</strong><span>Hệ điều hành vận hành nội bộ doanh nghiệp</span></div>
        <span className="home-footer__signal"><i /> ALL SYSTEMS OPERATIONAL</span>
        <span>© 2026 · Bản demo</span>
      </div>
    </footer>
  );
}

export function ProofStrip() {
  const items = useMemo(() => [
    { icon: Boxes, label: 'SCHEMA', value: 'Tuỳ biến theo nghiệp vụ' },
    { icon: Sparkles, label: 'BUILDER', value: 'Không cần lập trình' },
    { icon: Radio, label: 'SYNC', value: 'Báo cáo thời gian thực' },
    { icon: ShieldCheck, label: 'CONTROL', value: 'Phê duyệt đúng quyền hạn' },
  ], []);
  return (
    <section className="proof-strip" aria-label="Năng lực nổi bật">
      <div className="home-shell proof-strip__inner">
        {items.map((item) => {
          const Icon = item.icon;
          return <div key={item.label}><span><Icon size={16} /></span><small>{item.label}</small><strong>{item.value}</strong></div>;
        })}
      </div>
    </section>
  );
}
