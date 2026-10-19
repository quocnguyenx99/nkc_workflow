import { useEffect, useMemo, useState } from 'react';
import type { Field, FormulaResultKind, Token } from '@/lib/formula';
import { useFormStore } from '@/store/form';

export interface FormulaDraft {
  id: string;
  label: string;
  tokens: Token[];
  resultKind: FormulaResultKind;
  precision: number;
}

const copyTokens = (tokens: Token[] = []) => tokens.map((token) => ({ ...token }));

function fromField(field: Field): FormulaDraft {
  return {
    id: field.id,
    label: field.label,
    tokens: copyTokens(field.tokens),
    resultKind: field.resultKind ?? 'money',
    precision: field.precision ?? 0,
  };
}

export function useFormulaDraft(fields: Field[], selectedId: string | null) {
  const committed = fields.find((field) => field.id === selectedId && field.kind === 'formula') ?? null;
  const [draft, setDraft] = useState<FormulaDraft | null>(() => committed ? fromField(committed) : null);

  useEffect(() => {
    setDraft(committed ? fromField(committed) : null);
  }, [committed]);

  const dirty = Boolean(committed && draft && JSON.stringify(fromField(committed)) !== JSON.stringify(draft));
  const previewFields = useMemo(() => {
    if (!draft) return fields;
    return fields.map((field) => field.id === draft.id ? { ...field, ...draft, tokens: copyTokens(draft.tokens) } : field);
  }, [draft, fields]);

  const patchDraft = (patch: Partial<Omit<FormulaDraft, 'id'>>) => setDraft((current) => current ? { ...current, ...patch } : current);
  const apply = () => {
    if (!draft) return;
    useFormStore.getState().updateField(draft.id, {
      label: draft.label,
      tokens: copyTokens(draft.tokens),
      resultKind: draft.resultKind,
      precision: draft.precision,
    });
  };
  const discard = () => setDraft(committed ? fromField(committed) : null);

  return { committed, draft, dirty, setDraft, patchDraft, previewFields, apply, discard };
}
