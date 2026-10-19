import type { ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { BrandMark } from '@/components/home/BrandMark';

const ICONS = {
  home: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10h14V10" />
    </svg>
  ),
  form: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="18" height="7" rx="1.5" />
    </svg>
  ),
  report: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="6" y1="20" x2="6" y2="12" />
      <line x1="12" y1="20" x2="12" y2="5" />
      <line x1="18" y1="20" x2="18" y2="9" />
    </svg>
  ),
  approve: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 11l3 3 8-8" />
      <path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9" />
    </svg>
  ),
};

const navCls = 'navi flex items-center gap-2.5 px-2.5 min-h-10 rounded-[9px] text-body no-underline hover:bg-hover shrink-0 max-[520px]:min-w-11 max-[520px]:justify-center max-[520px]:gap-1.5';
const navActive = 'bg-primary-soft text-primary-hover font-bold hover:bg-primary-soft';

export interface SidebarGroup {
  heading: string;
  items: { label: string; color: string; active?: boolean }[];
}

interface Props {
  active: 'form' | 'report';
  pendingCount: string;
  group: SidebarGroup;
  user: { initials: string; name: string; role: string; avatarBg: string; avatarSize?: number };
}

export function AppSidebar({ active, pendingCount, group, user }: Props) {
  return (
    <nav
      aria-label="Ứng dụng"
      className="app-sidebar w-full min-w-0 bg-white border-r border-line px-3.5 py-[18px] flex flex-col gap-1 box-border text-[14px] text-body max-[900px]:border-r-0 max-[900px]:border-b max-[900px]:flex-row max-[900px]:items-center max-[900px]:gap-3 max-[900px]:px-4 max-[900px]:py-2.5 max-[900px]:sticky max-[900px]:top-0 max-[900px]:z-20"
    >
      <Link to="/" aria-label="Về trang chủ NKC OneFlow" className="app-sidebar-brand flex items-center pt-1 px-2 pb-5 no-underline text-ink shrink-0 max-[900px]:p-0">
        <BrandMark variant="app" />
      </Link>
      <div className="system-scrollbar flex flex-col gap-1 max-[900px]:flex-row max-[900px]:flex-1 max-[900px]:min-w-0 max-[900px]:overflow-x-auto">
        <NavLink to="/" end className={navCls}>
          {ICONS.home}<span className="whitespace-nowrap max-[520px]:sr-only">Tổng quan</span>
        </NavLink>
        <NavLink to="/nhap-lieu" className={cn(navCls, active === 'form' && navActive)}>
          {ICONS.form}<span className="whitespace-nowrap max-[520px]:sr-only">Nhập liệu</span>
        </NavLink>
        <NavLink to="/bao-cao" className={cn(navCls, active === 'report' && navActive)}>
          {ICONS.report}<span className="whitespace-nowrap max-[520px]:sr-only">Báo cáo</span>
        </NavLink>
        <Link to="/bao-cao" className={navCls}>
          {ICONS.approve}<span className="whitespace-nowrap max-[520px]:sr-only">Phê duyệt</span>
          <span className="ml-auto max-[900px]:ml-0 bg-amber-soft text-amber-text text-[11px] font-extrabold px-[7px] py-px rounded-full">{pendingCount}</span>
        </Link>
      </div>
      <div className="mt-5 mx-2.5 mb-1.5 text-[11px] tracking-[.12em] text-faint font-bold max-[900px]:hidden">{group.heading}</div>
      {group.items.map((it) => (
        <div key={it.label} className={cn('flex items-center gap-2.5 px-2.5 min-h-9 max-[900px]:hidden', it.active && 'text-ink font-semibold')}>
          <span className="w-2 h-2 rounded-[2px]" style={{ background: it.color }} />
          {it.label}
        </div>
      ))}
      <div className="mt-auto flex items-center gap-2.5 pt-3 px-2 border-t border-line-2 max-[900px]:hidden">
        <span
          className="w-[34px] h-[34px] rounded-full text-white font-bold flex items-center justify-center"
          style={{ background: user.avatarBg, fontSize: user.avatarSize ?? 13 }}
        >
          {user.initials}
        </span>
        <span className="flex flex-col gap-px">
          <span className="font-semibold text-[13px] text-ink">{user.name}</span>
          <span className="text-[12px] text-muted">{user.role}</span>
        </span>
      </div>
    </nav>
  );
}

export function AppHeader({ crumb, title, children }: { crumb: string; title: string; children?: ReactNode }) {
  return (
    <header className="app-header bg-white border-b border-line px-7 py-3.5 flex items-center justify-between gap-4 flex-wrap max-[900px]:px-4 max-[900px]:py-2.5">
      <div className="flex flex-col gap-0.5">
        <div className="app-header-crumb text-[12px] text-muted whitespace-pre">{crumb}</div>
        <div className="text-[21px] font-extrabold tracking-[-.025em]">{title}</div>
      </div>
      <div className="system-scrollbar app-header-actions flex items-center gap-2.5 flex-wrap max-[900px]:w-full max-[900px]:flex-nowrap max-[900px]:overflow-x-auto max-[900px]:pb-1">{children}</div>
    </header>
  );
}

export function AppShell({ sidebar, minHeight, layout = 'document', children }: { sidebar: ReactNode; minHeight?: number; layout?: 'document' | 'workspace'; children: ReactNode }) {
  return (
    <div className={`app-shell font-sans text-ink bg-soft${layout === 'workspace' ? ' app-shell--workspace' : ''}`} style={minHeight ? { minHeight } : undefined}>
      {sidebar}
      <div className="app-shell-content min-w-0 flex flex-col">{children}</div>
    </div>
  );
}
