interface Props {
  open: boolean;
  title: string;
  description: string;
  details?: string[];
  confirmLabel: string;
  danger?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmAction({ open, title, description, details = [], confirmLabel, danger = true, onCancel, onConfirm }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] bg-[rgba(11,18,32,.46)] p-4 flex items-center justify-center" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onCancel()}>
      <section role="dialog" aria-modal="true" aria-labelledby="confirm-title" className="w-full max-w-[480px] bg-white rounded-[18px] p-5 shadow-[0_28px_70px_-28px_rgba(11,18,32,.75)]">
        <h2 id="confirm-title" className="m-0 text-[18px] font-extrabold text-ink">{title}</h2>
        <p className="mt-2 mb-0 text-[14px] leading-[1.55] text-body">{description}</p>
        {details.length > 0 && (
          <div className="mt-3 rounded-xl bg-amber-soft px-3 py-2.5 text-[13px] text-amber-deep">
            <div className="font-bold mb-1">Các công thức bị ảnh hưởng:</div>
            <div>{details.join(' → ')}</div>
          </div>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" autoFocus onClick={onCancel} className="border border-line-3 bg-white rounded-[10px] px-4 min-h-11 text-[14px] font-semibold cursor-pointer">Quay lại</button>
          <button type="button" onClick={onConfirm} className="border-0 rounded-[10px] px-4 min-h-11 text-[14px] font-bold text-white cursor-pointer" style={{ background: danger ? '#B42318' : '#2F54EB' }}>{confirmLabel}</button>
        </div>
      </section>
    </div>
  );
}
