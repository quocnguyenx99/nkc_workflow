const TIPS = [
  { n: '1', title: 'Kéo thả trường dữ liệu', text: 'Kéo thẻ ở cột trái thả vào lưới, hoặc bấm để thêm nhanh.' },
  { n: '2', title: 'Ghép công thức', text: 'Bấm một ô tím, chọn công thức có sẵn hoặc tự ghép ở cột phải.' },
  { n: '3', title: 'Nhập liệu thử', text: 'Chuyển sang “② Nhập liệu thử”, gõ số — ô tím tự tính ngay.' },
];

export function CoachTips({ active }: { active: number }) {
  return (
    <div className="bg-white border-b border-line px-7 py-3.5 grid gap-3 grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] max-[900px]:px-4">
      {TIPS.map((t, i) => {
        const on = i + 1 === active;
        return (
          <div
            key={t.n}
            className="flex gap-3 items-center rounded-[14px] px-3.5 py-3 transition-colors duration-300"
            style={{ border: `1.5px solid ${on ? '#2F54EB' : '#E7EAF0'}`, background: on ? '#EEF2FF' : '#FFFFFF' }}
          >
            <span
              className="w-8 h-8 rounded-[10px] font-extrabold text-[14px] flex items-center justify-center shrink-0 transition-colors duration-300"
              style={{ background: on ? '#2F54EB' : '#F2F4F8', color: on ? '#FFFFFF' : '#5B6478' }}
            >
              {t.n}
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="text-[14px] font-bold text-ink">{t.title}</span>
              <span className="text-[13px] text-muted leading-[1.4]">{t.text}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
