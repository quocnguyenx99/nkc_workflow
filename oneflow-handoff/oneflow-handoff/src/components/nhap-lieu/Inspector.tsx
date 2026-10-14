import { calc, fmtMoney, type Op, type Span } from '@/lib/formula';
import { KINDS, PRESETS } from '@/data/template';
import { useFormStore } from '@/store/form';
import { TokenChips } from './TokenChips';

const WIDTHS: { n: Span; label: string }[] = [
  { n: 3, label: '1/4' },
  { n: 4, label: '1/3' },
  { n: 6, label: '1/2' },
  { n: 12, label: 'Cả dòng' },
];
const OPS: Op[] = ['+', '−', '×', '÷', '(', ')'];

export function Inspector() {
  const fields = useFormStore((s) => s.fields);
  const selId = useFormStore((s) => s.sel);
  const { updateField, remove, applyPreset, pushToken, undoToken, clearTokens } = useFormStore.getState();
  const sel = fields.find((f) => f.id === selId) ?? null;
  const isF = sel?.kind === 'formula';

  return (
    <aside
      aria-label="Cấu hình trường"
      className="flex-[1_1_270px] max-w-[310px] bg-white border-l border-line p-5 flex flex-col gap-[18px] box-border max-[900px]:max-w-none max-[900px]:flex-[1_1_100%] max-[900px]:border-l-0 max-[900px]:border-t"
    >
      {!sel && (
        <div className="flex flex-col gap-2.5 text-muted text-[14px] leading-[1.6]">
          <div className="text-[16px] font-extrabold text-ink">Cấu hình trường</div>
          Bấm vào tên một trường trên biểu mẫu để đổi tên, độ rộng hoặc ghép công thức.
        </div>
      )}
      {sel && (
        <div className="flex flex-col gap-[18px]">
          <div className="flex justify-between items-center gap-2">
            <div className="flex flex-col gap-0.5 min-w-0">
              <div className="text-[11px] font-extrabold tracking-[.12em]" style={{ color: isF ? '#5B33E0' : '#2F54EB' }}>
                {KINDS[sel.kind]?.name.toUpperCase()}
              </div>
              <div className="text-[18px] font-extrabold tracking-[-.01em] break-words">{sel.label}</div>
            </div>
            <button
              type="button"
              onClick={() => remove(sel.id)}
              className="ghost border border-line bg-white rounded-lg px-2.5 min-h-9 text-[13px] text-red-text cursor-pointer"
            >
              Xoá
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="nl-name" className="text-[13px] font-semibold text-body">
              Tên trường
            </label>
            <input
              id="nl-name"
              value={sel.label}
              onChange={(e) => updateField(sel.id, { label: e.target.value })}
              className="border border-line-3 rounded-[9px] px-3 min-h-[42px] text-[14px] text-ink"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="text-[13px] font-semibold text-body">Độ rộng trên lưới</div>
            <div className="grid grid-cols-4 gap-1.5">
              {WIDTHS.map((w) => {
                const on = sel.span === w.n;
                return (
                  <button
                    key={w.n}
                    type="button"
                    onClick={() => updateField(sel.id, { span: w.n })}
                    className="rounded-lg min-h-9 text-[13px] font-semibold cursor-pointer"
                    style={{ border: `1px solid ${on ? '#0B1220' : '#D5DBE6'}`, background: on ? '#0B1220' : '#FFFFFF', color: on ? '#FFFFFF' : '#0B1220' }}
                  >
                    {w.label}
                  </button>
                );
              })}
            </div>
          </div>

          {!isF && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="nl-val" className="text-[13px] font-semibold text-body">
                Giá trị mẫu
              </label>
              <input
                id="nl-val"
                value={sel.value ?? ''}
                onChange={(e) => updateField(sel.id, { value: e.target.value })}
                className="border border-line-3 rounded-[9px] px-3 min-h-[42px] text-[14px] text-ink"
              />
              <div className="text-[12px] text-muted">Đổi số ở đây — các ô tím dùng trường này sẽ tự tính lại.</div>
            </div>
          )}

          {isF && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="text-[13px] font-semibold text-body">Công thức hiện tại</div>
                <div className="border-[1.5px] border-violet bg-violet-card rounded-xl p-2.5 min-h-[52px] flex flex-wrap gap-1 items-center font-mono text-[12px] box-border">
                  <TokenChips fields={fields} tokens={sel.tokens ?? []} size="inspector" />
                </div>
                <div className="flex justify-between items-center text-[14px]">
                  <span className="text-muted">Kết quả</span>
                  <span className="font-extrabold text-violet-text tabular-nums">{fmtMoney(calc(fields, sel.id))}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="text-[13px] font-bold text-ink">Cách 1 · Chọn công thức có sẵn</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {PRESETS.map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => applyPreset(p.key)}
                      className="ghost border border-line bg-white rounded-[9px] px-2.5 py-2 min-h-12 text-left cursor-pointer flex flex-col gap-0.5"
                    >
                      <span className="text-[13px] font-bold text-ink">{p.label}</span>
                      <span className="text-[11px] text-muted font-mono">{p.expr}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="text-[13px] font-bold text-ink">Cách 2 · Tự ghép: bấm trường, rồi bấm phép tính</div>
                <div className="flex flex-wrap gap-1.5">
                  {fields
                    .filter((f) => f.id !== sel.id && ['number', 'money', 'percent', 'formula'].includes(f.kind))
                    .map((f) => {
                      const fF = f.kind === 'formula';
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => pushToken({ f: f.id })}
                          className="chipbtn rounded-lg px-2.5 min-h-[34px] text-[13px] font-semibold cursor-pointer"
                          style={{
                            border: `1px solid ${fF ? '#DCD1FF' : '#C7D2FF'}`,
                            background: fF ? '#F3EFFF' : '#EEF2FF',
                            color: fF ? '#5B33E0' : '#2F54EB',
                          }}
                        >
                          {f.label}
                        </button>
                      );
                    })}
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {OPS.map((o) => (
                    <button
                      key={o}
                      type="button"
                      onClick={() => pushToken({ o })}
                      className="chipbtn border border-line-3 bg-soft text-ink rounded-lg min-h-10 text-[15px] font-semibold font-mono cursor-pointer"
                    >
                      {o}
                    </button>
                  ))}
                  {[10, 100].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => pushToken({ n })}
                      className="chipbtn border border-line-3 bg-soft text-ink rounded-lg min-h-10 text-[15px] font-semibold font-mono cursor-pointer"
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={undoToken}
                    className="ghost border border-line-3 bg-white rounded-lg min-h-10 text-[13px] font-semibold cursor-pointer text-ink"
                  >
                    ↶ Xoá ký hiệu cuối
                  </button>
                  <button
                    type="button"
                    onClick={clearTokens}
                    className="ghost border border-line-3 bg-white rounded-lg min-h-10 text-[13px] font-semibold cursor-pointer text-ink"
                  >
                    Xoá công thức
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
