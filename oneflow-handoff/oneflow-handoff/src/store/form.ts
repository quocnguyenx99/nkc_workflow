import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { calc, parseNumber, type Field, type Span, type Token } from '@/lib/formula';
import { presetTokens, salesTemplate, type PaletteItem, type PresetKey } from '@/data/template';

export type Mode = 'design' | 'test';

export interface SavedSlip {
  code: string;
  customer: string;
  staff: string;
  qty: number;
  subtotal: number;
  vat: number;
  total: number;
  savedAt: string;
}

interface FormState {
  fields: Field[];
  mode: Mode;
  sel: string | null;
  seq: number;
  saved: number;
  toast: boolean;
  slips: SavedSlip[];

  setMode: (m: Mode) => void;
  select: (id: string | null) => void;
  add: (p: PaletteItem, index?: number) => string;
  updateField: (id: string, patch: Partial<Field>) => void;
  remove: (id: string) => void;
  widen: (id: string) => void;
  move: (from: number, to: number) => void;
  setValue: (id: string, value: string) => void;
  applyPreset: (key: PresetKey) => void;
  pushToken: (tok: Token) => void;
  undoToken: () => void;
  clearTokens: () => void;
  loadTemplate: () => void;
  clearAll: () => void;
  save: () => SavedSlip;
}

const WIDEN_ORDER: Span[] = [2, 3, 4, 6, 12];
const SAMPLE: Record<string, string> = {
  text: '', number: '1', money: '100000', percent: '10', date: '14/10/2026', select: 'Lựa chọn 1', person: 'Nguyễn Văn A',
};

function totalField(fields: Field[]) {
  return fields.filter((f) => f.kind === 'formula').slice(-1)[0];
}

export function kpiOf(fields: Field[]): number {
  const t = totalField(fields);
  return t ? calc(fields, t.id) : NaN;
}

function slipFrom(fields: Field[], code: string): SavedSlip {
  const byLabel = (re: RegExp) => fields.find((f) => re.test(f.label));
  const val = (f?: Field) => (f ? (f.kind === 'formula' ? calc(fields, f.id) : parseNumber(f.value)) : NaN);
  const num = (n: number) => (Number.isFinite(n) ? n : 0);
  return {
    code,
    customer: fields.find((f) => f.kind === 'text')?.value || '—',
    staff: fields.find((f) => f.kind === 'person')?.value || '—',
    qty: num(val(byLabel(/số lượng/i) ?? fields.find((f) => f.kind === 'number'))),
    subtotal: num(val(byLabel(/thành tiền/i))),
    vat: num(val(byLabel(/vat/i))),
    total: num(kpiOf(fields)),
    savedAt: new Date().toISOString(),
  };
}

export const useFormStore = create<FormState>()(
  persist(
    (set, get) => ({
      fields: salesTemplate(),
      mode: 'design',
      sel: 'f4',
      seq: 1,
      saved: 0,
      toast: false,
      slips: [],

      setMode: (mode) => set({ mode }),
      select: (sel) => set({ sel }),

      add: (p, index) => {
        const s = get();
        const id = 'n' + s.seq;
        let field: Field;
        if (p.kind === 'formula') field = { id, kind: 'formula', label: p.name ?? 'Trường công thức', span: 4, tokens: presetTokens(p.preset ?? 'free') };
        else {
          const isNum = ['number', 'money', 'percent'].includes(p.kind);
          field = { id, kind: p.kind, label: p.label + ' ' + s.seq, span: isNum ? 3 : 4, value: SAMPLE[p.kind] ?? '' };
        }
        const fields = [...s.fields];
        fields.splice(index ?? fields.length, 0, field);
        set({ fields, sel: id, seq: s.seq + 1 });
        return id;
      },

      updateField: (id, patch) => set((s) => ({ fields: s.fields.map((f) => (f.id === id ? { ...f, ...patch } : f)) })),

      remove: (id) => set((s) => ({ fields: s.fields.filter((x) => x.id !== id), sel: s.sel === id ? null : s.sel })),

      widen: (id) => {
        const f = get().fields.find((x) => x.id === id);
        if (!f) return;
        const i = WIDEN_ORDER.indexOf(f.span);
        get().updateField(id, { span: WIDEN_ORDER[(i + 1) % WIDEN_ORDER.length] });
      },

      move: (from, to) =>
        set((s) => {
          const fields = [...s.fields];
          const [item] = fields.splice(from, 1);
          fields.splice(to, 0, item);
          return { fields };
        }),

      setValue: (id, value) => {
        get().updateField(id, { value });
        if (get().toast) set({ toast: false });
      },

      applyPreset: (key) => {
        const { sel } = get();
        if (sel) get().updateField(sel, { tokens: presetTokens(key) });
      },

      pushToken: (tok) => {
        const s = get();
        const sel = s.fields.find((f) => f.id === s.sel);
        if (!sel) return;
        const toks = (sel.tokens ?? []).map((t) => ({ ...t })) as Token[];
        const slot = toks.findIndex((t) => 's' in t);
        if ('f' in tok && slot >= 0) toks[slot] = tok;
        else toks.push(tok);
        s.updateField(sel.id, { tokens: toks });
      },

      undoToken: () => {
        const s = get();
        const sel = s.fields.find((f) => f.id === s.sel);
        if (sel?.tokens) s.updateField(sel.id, { tokens: sel.tokens.slice(0, -1) });
      },

      clearTokens: () => {
        const { sel } = get();
        if (sel) get().updateField(sel, { tokens: [] });
      },

      loadTemplate: () => set({ fields: salesTemplate(), sel: 'f4', toast: false }),
      clearAll: () => set({ fields: [], sel: null, toast: false }),

      save: () => {
        const s = get();
        const saved = s.saved + 1;
        const slip = slipFrom(s.fields, 'PBH-' + (1038 + saved));
        set({ saved, toast: true, mode: 'test', slips: [slip, ...s.slips].slice(0, 20) });
        return slip;
      },
    }),
    {
      name: 'oneflow-form',
      partialize: (s) => ({ fields: s.fields, mode: s.mode, sel: s.sel, seq: s.seq, saved: s.saved, slips: s.slips }),
    },
  ),
);
