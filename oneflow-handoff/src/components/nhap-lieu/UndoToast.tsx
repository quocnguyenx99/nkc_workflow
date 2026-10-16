import { useEffect } from 'react';
import { useFormStore } from '@/store/form';

export function UndoToast() {
  const label = useFormStore((state) => state.undoLabel);
  const undo = useFormStore((state) => state.undoLast);
  const dismiss = useFormStore((state) => state.dismissUndo);

  useEffect(() => {
    if (!label) return;
    const timer = window.setTimeout(dismiss, 8000);
    return () => window.clearTimeout(timer);
  }, [dismiss, label]);

  if (!label) return null;
  return (
    <div role="status" className="fixed z-50 left-1/2 bottom-5 -translate-x-1/2 bg-ink text-white rounded-xl px-4 py-3 flex items-center gap-4 shadow-[0_18px_40px_-16px_rgba(11,18,32,.65)] max-[520px]:left-4 max-[520px]:right-4 max-[520px]:translate-x-0 max-[520px]:bottom-[calc(76px+env(safe-area-inset-bottom))]">
      <span className="text-[13px] font-semibold">{label}</span>
      <button type="button" onClick={undo} className="border-0 bg-transparent text-[#B4C3FF] font-extrabold text-[13px] cursor-pointer whitespace-nowrap">Hoàn tác</button>
      <button type="button" onClick={dismiss} aria-label="Đóng thông báo" className="border-0 bg-transparent text-white/70 text-[17px] cursor-pointer">×</button>
    </div>
  );
}
