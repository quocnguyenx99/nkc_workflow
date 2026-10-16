import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { calc, parseNumber, type Field, type Span, type Token } from '@/lib/formula';
import { findSemanticField, migrateLegacyFieldRoles } from '@/lib/field-semantics';
import { validateFormForSave, type FormValidationIssue } from '@/lib/form-validation';
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
  saleDate?: string;
  product?: string;
  discountRate?: number;
  fingerprint?: string;
  valid?: boolean;
}

export type SaveResult =
  | { ok: true; slip: SavedSlip }
  | { ok: false; reason: 'validation'; issues: FormValidationIssue[] }
  | { ok: false; reason: 'duplicate'; slip: SavedSlip };

type UndoAction =
  | { kind: 'delete'; field: Field; index: number; previousSelection: string | null }
  | { kind: 'replace'; fields: Field[]; previousSelection: string | null };

interface FormState {
  fields: Field[];
  mode: Mode;
  sel: string | null;
  seq: number;
  saved: number;
  toast: boolean;
  slips: SavedSlip[];
  validation: FormValidationIssue[];
  undoAction: UndoAction | null;
  undoLabel: string | null;
  lastSaveFingerprint: string | null;
  lastSaveAt: number;
  updatedAt: number;

  setMode: (m: Mode) => void;
  select: (id: string | null) => void;
  add: (p: PaletteItem, index?: number) => string;
  updateField: (id: string, patch: Partial<Field>) => void;
  setRole: (id: string, role: Field['role']) => void;
  remove: (id: string) => void;
  widen: (id: string) => void;
  move: (from: number, to: number) => void;
  setValue: (id: string, value: string) => void;
  applyPreset: (key: PresetKey) => void;
  pushToken: (tok: Token) => void;
  insertToken: (index: number, tok: Token) => void;
  replaceToken: (index: number, tok: Token) => void;
  removeToken: (index: number) => void;
  moveToken: (from: number, to: number) => void;
  undoToken: () => void;
  clearTokens: () => void;
  loadTemplate: () => void;
  clearAll: () => void;
  undoLast: () => void;
  dismissUndo: () => void;
  clearValidation: () => void;
  save: () => SaveResult;
}

const WIDEN_ORDER: Span[] = [2, 3, 4, 6, 12];
const SAMPLE: Record<string, string> = {
  text: '', number: '1', money: '100000', percent: '10', date: '14/10/2026', select: 'Lựa chọn 1', person: 'Nguyễn Văn A',
};

export function kpiOf(fields: Field[]): number {
  const t = findSemanticField(fields, 'total');
  return t ? calc(fields, t.id) : NaN;
}

function slipFrom(fields: Field[], code: string, fingerprint: string): SavedSlip {
  const val = (f?: Field) => (f ? (f.kind === 'formula' ? calc(fields, f.id) : parseNumber(f.value)) : NaN);
  const num = (n: number) => (Number.isFinite(n) ? n : 0);
  return {
    code,
    customer: findSemanticField(fields, 'customer')?.value || '—',
    staff: findSemanticField(fields, 'staff')?.value || '—',
    qty: num(val(findSemanticField(fields, 'quantity'))),
    subtotal: num(val(findSemanticField(fields, 'subtotal'))),
    vat: num(val(findSemanticField(fields, 'vat'))),
    total: num(kpiOf(fields)),
    savedAt: new Date().toISOString(),
    saleDate: findSemanticField(fields, 'saleDate')?.value,
    product: findSemanticField(fields, 'product')?.value,
    discountRate: num(val(findSemanticField(fields, 'discountRate'))),
    fingerprint,
    valid: true,
  };
}

function formFingerprint(fields: Field[]) {
  return JSON.stringify(fields.map((field) => ({
    id: field.id,
    value: field.kind === 'formula' ? calc(fields, field.id) : String(field.value ?? '').trim(),
  })));
}

function sameLegacyContent(left: SavedSlip, right: SavedSlip) {
  return left.customer === right.customer
    && left.staff === right.staff
    && left.qty === right.qty
    && left.subtotal === right.subtotal
    && left.vat === right.vat
    && left.total === right.total;
}

function migratedFields(fields: Field[]): Field[] {
  return migrateLegacyFieldRoles(fields).map((field) => {
    if (field.kind === 'formula') return { resultKind: 'money' as const, precision: 0, ...field };
    const required = field.required ?? Boolean(field.role);
    if (field.role === 'quantity') return { required, min: 1, integer: true, ...field };
    if (field.role === 'unitPrice') return { required, min: 0, ...field };
    if (field.role === 'discountRate') return { required, min: 0, max: 100, ...field };
    return { required, ...field };
  });
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
      validation: [],
      undoAction: null,
      undoLabel: null,
      lastSaveFingerprint: null,
      lastSaveAt: 0,
      updatedAt: Date.now(),

      setMode: (mode) => set({ mode }),
      select: (sel) => set({ sel }),

      add: (p, index) => {
        const s = get();
        const id = 'n' + s.seq;
        let field: Field;
        if (p.kind === 'formula') field = { id, kind: 'formula', label: p.name ?? 'Trường công thức', span: 4, resultKind: 'money', precision: 0, tokens: presetTokens(p.preset ?? 'free') };
        else {
          const isNum = ['number', 'money', 'percent'].includes(p.kind);
          field = { id, kind: p.kind, label: p.label + ' ' + s.seq, span: isNum ? 3 : 4, value: SAMPLE[p.kind] ?? '', required: false };
        }
        const fields = [...s.fields];
        fields.splice(index ?? fields.length, 0, field);
        set({ fields, sel: id, seq: s.seq + 1, toast: false, validation: [], updatedAt: Date.now() });
        return id;
      },

      updateField: (id, patch) => set((s) => ({
        fields: s.fields.map((f) => (f.id === id ? { ...f, ...patch } : f)),
        toast: false,
        validation: [],
        updatedAt: Date.now(),
      })),

      setRole: (id, role) => set((s) => ({
        fields: s.fields.map((field) => {
          if (field.id === id) return { ...field, role };
          return role && field.role === role ? { ...field, role: undefined } : field;
        }),
        toast: false,
        validation: [],
        updatedAt: Date.now(),
      })),

      remove: (id) => set((s) => {
        const index = s.fields.findIndex((field) => field.id === id);
        if (index < 0) return s;
        const field = s.fields[index];
        return {
          fields: s.fields.filter((item) => item.id !== id),
          sel: s.sel === id ? null : s.sel,
          toast: false,
          validation: [],
          undoAction: { kind: 'delete', field, index, previousSelection: s.sel },
          undoLabel: `Đã xóa “${field.label}”.`,
          updatedAt: Date.now(),
        };
      }),

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
          return { fields, toast: false, validation: [], updatedAt: Date.now() };
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

      insertToken: (index, tok) => {
        const s = get();
        const sel = s.fields.find((f) => f.id === s.sel && f.kind === 'formula');
        if (!sel) return;
        const tokens = [...(sel.tokens ?? [])];
        tokens.splice(Math.max(0, Math.min(index, tokens.length)), 0, tok);
        s.updateField(sel.id, { tokens });
      },

      replaceToken: (index, tok) => {
        const s = get();
        const sel = s.fields.find((f) => f.id === s.sel && f.kind === 'formula');
        if (!sel?.tokens?.[index]) return;
        const tokens = [...sel.tokens];
        tokens[index] = tok;
        s.updateField(sel.id, { tokens });
      },

      removeToken: (index) => {
        const s = get();
        const sel = s.fields.find((f) => f.id === s.sel && f.kind === 'formula');
        if (!sel) return;
        s.updateField(sel.id, { tokens: (sel.tokens ?? []).filter((_, tokenIndex) => tokenIndex !== index) });
      },

      moveToken: (from, to) => {
        const s = get();
        const sel = s.fields.find((f) => f.id === s.sel && f.kind === 'formula');
        if (!sel?.tokens?.[from] || to < 0 || to >= sel.tokens.length) return;
        const tokens = [...sel.tokens];
        const [token] = tokens.splice(from, 1);
        tokens.splice(to, 0, token);
        s.updateField(sel.id, { tokens });
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

      loadTemplate: () => set((s) => ({
        fields: salesTemplate(),
        sel: 'f4',
        toast: false,
        validation: [],
        undoAction: { kind: 'replace', fields: s.fields, previousSelection: s.sel },
        undoLabel: 'Đã nạp lại mẫu Phiếu bán hàng.',
        updatedAt: Date.now(),
      })),
      clearAll: () => set((s) => ({
        fields: [],
        sel: null,
        toast: false,
        validation: [],
        undoAction: { kind: 'replace', fields: s.fields, previousSelection: s.sel },
        undoLabel: 'Đã làm trống biểu mẫu.',
        updatedAt: Date.now(),
      })),

      undoLast: () => set((s) => {
        if (!s.undoAction) return s;
        if (s.undoAction.kind === 'replace') {
          return { fields: s.undoAction.fields, sel: s.undoAction.previousSelection, undoAction: null, undoLabel: null, validation: [] };
        }
        const fields = [...s.fields];
        fields.splice(Math.min(s.undoAction.index, fields.length), 0, s.undoAction.field);
        return { fields, sel: s.undoAction.previousSelection, undoAction: null, undoLabel: null, validation: [] };
      }),
      dismissUndo: () => set({ undoAction: null, undoLabel: null }),
      clearValidation: () => set({ validation: [] }),

      save: () => {
        const s = get();
        const issues = validateFormForSave(s.fields);
        if (issues.length) {
          set({ validation: issues, toast: false });
          return { ok: false as const, reason: 'validation' as const, issues };
        }
        const fingerprint = formFingerprint(s.fields);
        const now = Date.now();
        const candidate = slipFrom(s.fields, '', fingerprint);
        const duplicate = s.slips.find((slip) => slip.fingerprint === fingerprint || (!slip.fingerprint && sameLegacyContent(slip, candidate)))
          ?? (fingerprint === s.lastSaveFingerprint ? s.slips[0] : undefined);
        if (duplicate) {
          return { ok: false as const, reason: 'duplicate' as const, slip: duplicate };
        }
        let saved = s.saved + 1;
        let code = 'PBH-' + (1038 + saved);
        while (s.slips.some((slip) => slip.code === code)) {
          saved += 1;
          code = 'PBH-' + (1038 + saved);
        }
        const slip = slipFrom(s.fields, code, fingerprint);
        set({
          saved,
          toast: true,
          mode: 'test',
          slips: [slip, ...s.slips],
          validation: [],
          lastSaveFingerprint: fingerprint,
          lastSaveAt: now,
          updatedAt: now,
        });
        return { ok: true as const, slip };
      },
    }),
    {
      name: 'oneflow-form',
      version: 2,
      migrate: (persisted) => {
        const state = persisted as Partial<FormState> | undefined;
        if (!state) return persisted;
        return {
          ...state,
          fields: migratedFields(state.fields ?? salesTemplate()),
          slips: state.slips ?? [],
          lastSaveFingerprint: state.lastSaveFingerprint ?? null,
          lastSaveAt: state.lastSaveAt ?? 0,
          updatedAt: state.updatedAt ?? Date.now(),
        } as FormState;
      },
      partialize: (s) => ({ fields: s.fields, mode: s.mode, sel: s.sel, seq: s.seq, saved: s.saved, slips: s.slips, lastSaveFingerprint: s.lastSaveFingerprint, lastSaveAt: s.lastSaveAt, updatedAt: s.updatedAt }),
    },
  ),
);
