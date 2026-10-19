interface BrandMarkProps {
  compact?: boolean;
  variant?: 'home' | 'app';
  size?: 'default' | 'small';
}

export function BrandMark({ compact = false, variant = 'home', size = 'default' }: BrandMarkProps) {
  const app = variant === 'app';
  const symbolClass = app
    ? `${size === 'small' ? 'w-7 h-7' : 'w-8 h-8'} text-primary shrink-0`
    : 'home-brand__symbol';
  return (
    <span
      className={app ? `inline-flex items-center ${size === 'small' ? 'gap-2' : 'gap-2.5'} text-ink` : 'home-brand'}
      aria-label="NKC OneFlow"
    >
      <svg className={symbolClass} viewBox="0 0 256 256" aria-hidden="true">
        <g transform="translate(-10 10)" fill="currentColor">
          <path d="M224 128v32a64 64 0 0 1-64 64H96a64 64 0 0 1-64-64V96a64 64 0 0 1 64-64h32v48H96a16 16 0 0 0-16 16v64a16 16 0 0 0 16 16h64a16 16 0 0 0 16-16v-32Z" />
          <path transform="translate(20 -20)" d="M128 32h32a64 64 0 0 1 64 64v32h-48V96a16 16 0 0 0-16-16h-32Z" />
        </g>
      </svg>
      {!compact && (
        <span className={app ? `inline-flex items-baseline ${size === 'small' ? 'gap-1 text-[13px]' : 'gap-1.5 text-[16px]'} tracking-[-.035em] whitespace-nowrap` : 'home-brand__type'}>
          <strong className={app ? 'font-extrabold' : undefined}>NKC</strong>
          <span className={app ? 'font-extrabold text-primary' : undefined}>OneFlow</span>
        </span>
      )}
    </span>
  );
}
