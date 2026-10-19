export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="home-brand" aria-label="NKC OneFlow">
      <svg className="home-brand__symbol" viewBox="0 0 256 256" aria-hidden="true">
        <g transform="translate(-10 10)" fill="currentColor">
          <path d="M224 128v32a64 64 0 0 1-64 64H96a64 64 0 0 1-64-64V96a64 64 0 0 1 64-64h32v48H96a16 16 0 0 0-16 16v64a16 16 0 0 0 16 16h64a16 16 0 0 0 16-16v-32Z" />
          <path transform="translate(20 -20)" d="M128 32h32a64 64 0 0 1 64 64v32h-48V96a16 16 0 0 0-16-16h-32Z" />
        </g>
      </svg>
      {!compact && (
        <span className="home-brand__type">
          <strong>NKC</strong>
          <span>OneFlow</span>
        </span>
      )}
    </span>
  );
}
