import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AppHeader, AppShell, AppSidebar } from '@/components/app/AppShell';
import { KpiRow, Leaderboard, ProductDonut, RevenueHero } from '@/components/bao-cao/Charts';
import { ActivityLog, ApprovalTimeline, ExportPanel, InvoiceTable } from '@/components/bao-cao/Panels';
import { Reveal } from '@/components/Reveal';
import { reportRows } from '@/lib/export';
import { useFormStore } from '@/store/form';
import { useReportStore } from '@/store/report';

export default function BaoCaoPage() {
  const ap = useReportStore((s) => s.ap);
  const slips = useFormStore((s) => s.slips);
  const rows = useMemo(() => reportRows(slips), [slips]);

  return (
    <AppShell
      minHeight={1760}
      sidebar={
        <AppSidebar
          active="report"
          pendingCount={ap === 'pending' ? '3' : '2'}
          group={{
            heading: 'BÁO CÁO THEO PHÒNG',
            items: [
              { label: 'Kinh doanh', color: '#2F54EB', active: true },
              { label: 'Kế toán', color: '#0E9F6E' },
              { label: 'Nhân sự', color: '#6E46F0' },
              { label: 'Kho vận', color: '#F59E0B' },
            ],
          }}
          user={{ initials: 'GĐ', name: 'Nguyễn Quang Vinh', role: 'Ban Giám đốc · Admin', avatarBg: '#0B1220', avatarSize: 12 }}
        />
      }
    >
      <AppHeader crumb="Báo cáo  /  Kinh doanh" title="Báo cáo doanh thu · Tháng 10/2026">
        <span className="text-[12px] font-semibold bg-amber-soft text-amber-deep px-2.5 py-1.5 rounded-full">Dữ liệu mẫu minh hoạ</span>
        <div role="group" aria-label="Kỳ báo cáo" className="flex bg-hover rounded-[10px] p-1 gap-0.5 text-[13px] font-semibold">
          {['Tuần', 'Tháng', 'Quý', 'Năm'].map((p) => (
            <span key={p} className="px-3 py-[7px] rounded-[7px]" style={p === 'Tháng' ? { background: '#FFFFFF', boxShadow: '0 1px 3px rgba(11,18,32,.15)' } : { color: '#5B6478' }}>
              {p}
            </span>
          ))}
        </div>
        <Link to="/nhap-lieu" className="ghost border border-line-3 bg-white text-ink rounded-[10px] px-3.5 min-h-[42px] text-[14px] font-semibold no-underline flex items-center">
          ← Về nhập liệu
        </Link>
      </AppHeader>

      <div className="px-7 pt-6 pb-10 flex flex-wrap gap-6 items-start max-[900px]:px-4">
        <div className="flex-[999_1_620px] min-w-0 flex flex-col gap-5">
          <Reveal i={0}>
            <RevenueHero ap={ap} />
          </Reveal>
          <Reveal i={1}>
            <KpiRow />
          </Reveal>
          <Reveal i={2} className="grid gap-5 grid-cols-[repeat(auto-fit,minmax(min(340px,100%),1fr))]">
            <Leaderboard />
            <ProductDonut />
          </Reveal>
          <Reveal i={3}>
            <InvoiceTable rows={rows} />
          </Reveal>
        </div>

        <aside className="flex-[1_1_340px] min-w-0 flex flex-col gap-5">
          <Reveal i={1}>
            <ApprovalTimeline />
          </Reveal>
          <Reveal i={2}>
            <ExportPanel />
          </Reveal>
          <Reveal i={3}>
            <ActivityLog />
          </Reveal>
        </aside>
      </div>
    </AppShell>
  );
}
