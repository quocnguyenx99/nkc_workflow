import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { Area, AreaChart, CartesianGrid, Cell, LabelList, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { KPIS, LEADERBOARD, PRODUCT_MIX, REPORT, REVENUE_TREND } from '@/data/mock';
import type { Approval } from '@/store/report';

function useSeen() {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, margin: '-40px' });
  return [ref, seen] as const;
}

const STATUS: Record<Approval, { text: string; bg: string; fg: string }> = {
  ok: { text: '✓ Đã được Ban Giám đốc phê duyệt', bg: 'rgba(110,231,183,.18)', fg: '#6EE7B7' },
  back: { text: '↩ Đã trả lại để chỉnh sửa', bg: 'rgba(252,165,165,.2)', fg: '#FCA5A5' },
  pending: { text: '● Chờ Ban Giám đốc phê duyệt', bg: 'rgba(251,191,36,.2)', fg: '#FCD34D' },
};

const lastIdx = REVENUE_TREND.length - 1;

export function RevenueHero({ ap }: { ap: Approval }) {
  const [ref, seen] = useSeen();
  const st = STATUS[ap];
  return (
    <div className="report-hero rounded-[22px] px-[30px] py-7 text-white grid gap-7 items-center grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] max-[900px]:px-5">
      <div className="flex flex-col gap-3.5">
        <motion.span
          key={ap}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="self-start text-[12px] font-bold px-[11px] py-[5px] rounded-full"
          style={{ background: st.bg, color: st.fg }}
        >
          {st.text}
        </motion.span>
        <span className="text-[14px] text-[#C5CEE0]">Tổng doanh thu tháng 10/2026</span>
        <span className="text-[46px] font-extrabold tracking-[-.045em] leading-none tabular-nums max-[900px]:text-[36px]">486.240.000 ₫</span>
        <span className="text-[14px] text-[#6EE7B7] font-bold">▲ 12,4% so với tháng 9 · +53,6 triệu ₫</span>
        <div className="flex flex-col gap-1.5 mt-1">
          <div className="flex justify-between text-[12px] text-[#C5CEE0]">
            <span>Tiến độ kế hoạch tháng</span>
            <span>
              <b className="text-white">{REPORT.planPct}%</b> / {REPORT.target}
            </span>
          </div>
          <div className="h-2 bg-white/[.14] rounded-[99px]">
            <motion.div
              className="h-full rounded-[99px]"
              style={{ background: 'linear-gradient(90deg, #8EA6FF, #B79CFF)' }}
              initial={{ width: 0 }}
              animate={{ width: REPORT.planPct + '%' }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
            />
          </div>
        </div>
      </div>
      <figure className="m-0 flex flex-col gap-2">
        <figcaption className="text-[12px] text-[#C5CEE0]">Xu hướng doanh thu 6 tháng (triệu ₫)</figcaption>
        <div ref={ref} role="img" aria-label="Doanh thu tháng 5 đến 10: 380, 402, 395, 418, 432,6 và 486,2 triệu đồng" className="w-full aspect-[600/170] min-h-[130px]">
          {seen && (
            <ResponsiveContainer width="100%" height="100%" minHeight={130}>
              <AreaChart data={REVENUE_TREND} margin={{ top: 22, right: 18, left: 8, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,.08)" />
                <YAxis hide domain={[360, 520]} />
                <XAxis
                  dataKey="month"
                  axisLine={{ stroke: 'rgba(255,255,255,.15)' }}
                  tickLine={false}
                  interval={0}
                  tick={(p: { x: number; y: number; index: number; payload: { value: string } }) => (
                    <text x={p.x} y={p.y + 12} textAnchor="middle" fontSize={12} fill={p.index === lastIdx ? '#FFFFFF' : '#AEB8D0'} fontWeight={p.index === lastIdx ? 700 : 400}>
                      {p.payload.value}
                    </text>
                  )}
                />
                <Area
                  type="linear"
                  dataKey="value"
                  stroke="#B4C3FF"
                  strokeWidth={3}
                  fill="rgba(142,166,255,.18)"
                  fillOpacity={1}
                  animationDuration={1100}
                  dot={(p: { cx: number; cy: number; index: number }) =>
                    p.index === lastIdx ? <circle key="last" cx={p.cx} cy={p.cy} r={6} fill="#FFFFFF" stroke="#8EA6FF" strokeWidth={3} /> : <g key={p.index} />
                  }
                  activeDot={false}
                >
                  <LabelList
                    dataKey="value"
                    content={(p) => {
                      const { x, y, index } = p as { x: number; y: number; index: number };
                      return index === lastIdx ? (
                        <text x={x - 5} y={y - 13} fill="#FFFFFF" fontSize={13} fontWeight={700} textAnchor="end">
                          486,2
                        </text>
                      ) : null;
                    }}
                  />
                </Area>
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </figure>
    </div>
  );
}

function Spark({ data, color }: { data: readonly number[]; color: 'primary' | 'violet' }) {
  const [ref, seen] = useSeen();
  const light = color === 'primary' ? '#C7D2FF' : '#DCD1FF';
  const dark = color === 'primary' ? '#2F54EB' : '#6E46F0';
  return (
    <div ref={ref} aria-hidden="true" className="flex items-end gap-[3px] h-6">
      {data.map((h, i) => (
        <motion.span
          key={i}
          className="flex-1 rounded-[2px]"
          style={{ background: i === data.length - 1 ? dark : light }}
          initial={{ height: 0 }}
          animate={seen ? { height: h + '%' } : undefined}
          transition={{ duration: 0.5, delay: i * 0.06, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

const TONE = {
  green: { bg: '#E6F6EF', fg: '#047857' },
  neutral: { bg: '#F2F4F8', fg: '#5B6478' },
  amber: { bg: '#FEF6E0', fg: '#92400E' },
};

export function KpiRow() {
  return (
    <div className="grid gap-3.5 grid-cols-[repeat(auto-fit,minmax(min(180px,100%),1fr))]">
      {KPIS.map((k) => (
        <div key={k.label} className="bg-white border border-line rounded-[18px] px-5 py-[18px] flex flex-col gap-2">
          <span className="text-[13px] text-muted font-medium">{k.label}</span>
          <div className="flex justify-between items-end">
            <span className="text-[28px] font-extrabold tracking-[-.03em]">{k.value}</span>
            <span className="text-[12px] font-bold px-2 py-[3px] rounded-full" style={{ background: TONE[k.tone].bg, color: TONE[k.tone].fg }}>
              {k.badge}
            </span>
          </div>
          {'spark' in k ? <Spark data={k.spark} color={k.color} /> : <span className="text-[12px] text-muted">{k.note}</span>}
        </div>
      ))}
    </div>
  );
}

export function Leaderboard() {
  const [ref, seen] = useSeen();
  return (
    <div ref={ref} className="bg-white border border-line rounded-[20px] px-6 py-[22px] flex flex-col gap-4">
      <div className="flex justify-between items-baseline">
        <span className="text-[16px] font-extrabold">Xếp hạng nhân viên</span>
        <span className="text-[12px] text-muted">triệu ₫ · % tổng</span>
      </div>
      <div className="flex flex-col gap-3.5">
        {LEADERBOARD.map((l, i) => (
          <div key={l.rank} className="flex gap-3 items-center">
            <span className="w-[22px] text-[13px] font-extrabold" style={{ color: l.rank === 1 ? '#92400E' : '#5B6478' }}>
              {l.rank}
            </span>
            <span className="w-[34px] h-[34px] rounded-full text-[12px] font-bold flex items-center justify-center shrink-0" style={{ background: l.avBg, color: l.avFg }}>
              {l.initials}
            </span>
            <div className="flex-1 flex flex-col gap-[5px]">
              <div className="flex justify-between text-[14px]">
                <span className="font-semibold">{l.name}</span>
                <span className="font-extrabold tabular-nums">
                  {String(l.value).replace('.', ',')} <span className="text-muted font-medium">· {l.pct}%</span>
                </span>
              </div>
              <div className="h-[7px] bg-hover rounded-[99px]">
                <motion.div
                  className="h-full bg-primary rounded-[99px]"
                  initial={{ width: 0 }}
                  animate={seen ? { width: l.bar + '%' } : undefined}
                  transition={{ duration: 0.7, delay: i * 0.08, ease: 'easeOut' }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProductDonut() {
  const [ref, seen] = useSeen();
  return (
    <div className="bg-white border border-line rounded-[20px] px-6 py-[22px] flex flex-col gap-4">
      <div className="flex justify-between items-baseline">
        <span className="text-[16px] font-extrabold">Cơ cấu doanh thu theo sản phẩm</span>
        <span className="text-[12px] text-muted">% tổng</span>
      </div>
      <div className="flex gap-6 items-center flex-wrap">
        <div ref={ref} role="img" aria-label="Gói Pro 48%, Gói Basic 27%, Dịch vụ triển khai 17%, Bảo trì 8%" className="relative w-[170px] h-[170px] shrink-0">
          {seen && (
            <PieChart width={170} height={170}>
              <Pie
                data={PRODUCT_MIX}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={54}
                outerRadius={85}
                startAngle={90}
                endAngle={-270}
                stroke="none"
                animationDuration={900}
                isAnimationActive
              >
                {PRODUCT_MIX.map((p) => (
                  <Cell key={p.name} fill={p.color} />
                ))}
              </Pie>
            </PieChart>
          )}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[11px] text-muted">Tổng</span>
            <span className="text-[18px] font-extrabold">486,2 tr</span>
          </div>
        </div>
        <div className="flex-1 min-w-[150px] flex flex-col gap-3 text-[14px]">
          {PRODUCT_MIX.map((p) => (
            <div key={p.name} className="flex justify-between gap-2">
              <span className="flex gap-2 items-center">
                <span className="w-2.5 h-2.5 rounded-[3px]" style={{ background: p.color }} />
                {p.name}
              </span>
              <b>{p.value}%</b>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
