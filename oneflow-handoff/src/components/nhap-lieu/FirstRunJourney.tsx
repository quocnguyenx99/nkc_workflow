import { useEffect, useState } from 'react';

interface Props {
  visible: boolean;
  step: 1 | 2 | 3 | 4;
  onDismiss: () => void;
  onEnterData: () => void;
}

const STEPS = ['Chọn trường', 'Kiểm tra công thức', 'Nhập phiếu', 'Lưu phiếu'];
const COPY = [
  'Mẫu bán hàng đã sẵn sàng. Bấm một trường để xem cách chỉnh, hoặc thêm trường từ thư viện.',
  'Chọn một ô công thức màu tím. Kết quả và lỗi công thức sẽ hiện ngay trong Thuộc tính.',
  'Biểu mẫu đã sẵn sàng. Chuyển sang Nhập phiếu để điền dữ liệu mà không thấy công cụ thiết kế.',
  'Kiểm tra phần Tóm tắt rồi lưu. Hệ thống sẽ hiển thị mã phiếu và bước tiếp theo.',
];

export function FirstRunJourney({ visible, step, onDismiss, onEnterData }: Props) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    if (!detailsOpen) return;
    const close = (event: KeyboardEvent) => event.key === 'Escape' && setDetailsOpen(false);
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [detailsOpen]);

  if (!visible) return null;
  return (
    <section aria-label="Hướng dẫn bắt đầu" className="first-run-journey">
      <div className="first-run-summary">
        <span className="first-run-count">{step}/4</span>
        <span className="text-[13px] font-extrabold whitespace-nowrap">{STEPS[step - 1]}</span>
        <span className="first-run-copy">{COPY[step - 1]}</span>
        <button type="button" aria-expanded={detailsOpen} onClick={() => setDetailsOpen((open) => !open)} className="ghost border border-line-3 bg-white rounded-lg px-3 min-h-9 text-[12px] font-bold cursor-pointer whitespace-nowrap">Chi tiết</button>
        <button type="button" onClick={onDismiss} className="border-0 bg-transparent px-2 min-h-9 text-[12px] font-semibold text-muted cursor-pointer whitespace-nowrap">Bỏ qua</button>
      </div>

      {detailsOpen && (
        <div className="system-scrollbar first-run-popover" role="dialog" aria-label="Chi tiết hướng dẫn">
          <div className="flex items-center justify-between gap-3">
            <div className="text-[14px] font-extrabold">Bắt đầu với Phiếu bán hàng</div>
            <button type="button" onClick={() => setDetailsOpen(false)} aria-label="Đóng chi tiết hướng dẫn" className="border-0 bg-hover rounded-lg w-9 h-9 text-[20px] cursor-pointer">×</button>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2" aria-label={`Bước ${step} trong 4`}>
            {STEPS.map((label, index) => {
              const number = index + 1;
              const active = number === step;
              const done = number < step;
              return (
                <div key={label} className="min-w-0 flex flex-col items-center gap-1.5 text-center">
                  <span className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-extrabold" style={{ background: active ? '#2F54EB' : done ? '#0E9F6E' : '#F2F4F8', color: active || done ? '#FFFFFF' : '#5B6478' }}>{done ? '✓' : number}</span>
                  <span className="text-[11px] leading-tight font-semibold" style={{ color: active ? '#0B1220' : '#7A8499' }}>{label}</span>
                </div>
              );
            })}
          </div>
          <p className="mt-3 mb-0 text-[13px] leading-[1.55] text-body">{COPY[step - 1]}</p>
          {step === 3 && <button type="button" onClick={onEnterData} className="mt-3 w-full border-0 bg-primary text-white rounded-[9px] px-3.5 min-h-10 text-[13px] font-bold cursor-pointer">Tiếp tục nhập phiếu</button>}
        </div>
      )}
    </section>
  );
}
