import { useEffect, useRef, useState } from 'react';
import { animate, motion, useReducedMotion } from 'motion/react';
import { formatFormulaResult, type Field } from '@/lib/formula';

/** Đếm số từ giá trị cũ → mới trong 600ms. */
export function useCountUp(value: number) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    const from = prev.current;
    prev.current = value;
    if (reduce || !Number.isFinite(from) || !Number.isFinite(value) || from === value) {
      setShown(value);
      return;
    }
    const ctrl = animate(from, value, { duration: 0.6, ease: 'easeOut', onUpdate: setShown });
    return () => ctrl.stop();
  }, [value, reduce]);
  return shown;
}

/** Ô "= TỰ TÍNH": số chạy + nháy nền tím nhạt khi kết quả đổi. */
export function AnimatedResult({ value, testing, large, field }: { value: number; testing: boolean; large: boolean; field: Field }) {
  const shown = useCountUp(value);
  const ok = Number.isFinite(value);
  const base = ok ? (testing ? '#F3EFFF' : '#FFFFFF') : '#F6F8FB';
  const first = useRef(true);
  const [flash, setFlash] = useState(0);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (ok) setFlash((n) => n + 1);
  }, [value, ok]);

  return (
    <motion.div
      key={flash}
      initial={flash ? { backgroundColor: '#E4DAFF' } : false}
      animate={{ backgroundColor: base }}
      transition={{ duration: 0.6 }}
      className="rounded-[9px] px-3 py-1.5 min-h-[42px] flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5"
      style={{ backgroundColor: base }}
    >
      <span className="text-[11px] text-violet-text font-extrabold tracking-[.08em] whitespace-nowrap">= TỰ TÍNH</span>
      <span
        className="font-extrabold tabular-nums whitespace-nowrap tracking-[-.01em]"
        style={{ fontSize: large ? 24 : 16, color: ok ? '#5B33E0' : '#5B6478' }}
      >
        {formatFormulaResult(field, ok ? shown : NaN)}
      </span>
    </motion.div>
  );
}
