import { salesTemplate } from '@/data/template';
import { migrateLegacyFieldRoles } from '@/lib/field-semantics';
import type { Field } from '@/lib/formula';

export const FORM_STORAGE_KEY = 'oneflow-form';
export const FORM_V2_BACKUP_KEY = 'oneflow-form:v2-backup';
export const FORM_STORE_VERSION = 3;
export const BUILDER_VERSION_KEY = 'oneflow-builder-version';

type PersistedRecord = Record<string, unknown>;

export function normalizePersistedFields(fields: Field[]): Field[] {
  return migrateLegacyFieldRoles(fields).map((field) => {
    if (field.kind === 'formula') return { resultKind: 'money' as const, precision: 0, ...field };
    const required = field.required ?? Boolean(field.role);
    if (field.role === 'quantity') return { required, min: 1, integer: true, ...field };
    if (field.role === 'unitPrice') return { required, min: 0, ...field };
    if (field.role === 'discountRate') return { required, min: 0, max: 100, ...field };
    return { required, ...field };
  });
}

export function sanitizeFormOrder(fields: Field[], order: unknown): string[] {
  const validIds = new Set(fields.map((field) => field.id));
  const source = Array.isArray(order) ? order : fields.map((field) => field.id);
  const seen = new Set<string>();
  return source.flatMap((id) => {
    if (typeof id !== 'string' || !validIds.has(id) || seen.has(id)) return [];
    seen.add(id);
    return [id];
  });
}

export function safeNextSequence(fields: Field[], sequence: unknown): number {
  const persisted = typeof sequence === 'number' && Number.isFinite(sequence) ? Math.floor(sequence) : 1;
  const fromIds = fields.reduce((maximum, field) => {
    const match = /^n(\d+)$/.exec(field.id);
    return match ? Math.max(maximum, Number(match[1]) + 1) : maximum;
  }, 1);
  return Math.max(1, persisted, fromIds);
}

/** Pure and idempotent v2/v3 state migration. Unknown keys are deliberately preserved. */
export function migrateFormStateV3(persisted: unknown): PersistedRecord {
  const state = persisted && typeof persisted === 'object' ? persisted as PersistedRecord : {};
  const rawFields = Array.isArray(state.fields) ? state.fields as Field[] : salesTemplate();
  const fields = normalizePersistedFields(rawFields);
  const validIds = new Set(fields.map((field) => field.id));
  return {
    ...state,
    fields,
    formOrder: sanitizeFormOrder(fields, state.formOrder),
    sel: typeof state.sel === 'string' && validIds.has(state.sel) ? state.sel : null,
    seq: safeNextSequence(fields, state.seq),
    slips: Array.isArray(state.slips) ? state.slips : [],
    lastSaveFingerprint: typeof state.lastSaveFingerprint === 'string' ? state.lastSaveFingerprint : null,
    lastSaveAt: typeof state.lastSaveAt === 'number' ? state.lastSaveAt : 0,
    updatedAt: typeof state.updatedAt === 'number' ? state.updatedAt : Date.now(),
  };
}

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/** Back up the raw Zustand v2 envelope before a v3 store can persist over it. */
export function backupV2Envelope(storage: StorageLike, fallbackState?: unknown): boolean {
  try {
    if (storage.getItem(FORM_V2_BACKUP_KEY)) return false;
    const raw = storage.getItem(FORM_STORAGE_KEY);
    const envelope = raw ? JSON.parse(raw) as { version?: unknown } : null;
    const backup = envelope?.version === 2 ? raw : fallbackState !== undefined ? JSON.stringify({ state: fallbackState, version: 2 }) : null;
    if (!backup) return false;
    storage.setItem(FORM_V2_BACKUP_KEY, backup);
    return true;
  } catch {
    return false;
  }
}

/**
 * Performs the durable v2 -> v3 write before Zustand hydration. Keeping this
 * outside React makes the rollback copy and the migrated envelope atomic from
 * the application's point of view: backup first, then replace the live key.
 */
export function migrateStoredFormV3(storage: StorageLike): boolean {
  try {
    const raw = storage.getItem(FORM_STORAGE_KEY);
    if (!raw) return false;
    const envelope = JSON.parse(raw) as PersistedRecord;
    if (envelope.version !== 2) return false;
    backupV2Envelope(storage);
    if (!storage.getItem(FORM_V2_BACKUP_KEY)) return false;
    storage.setItem(FORM_STORAGE_KEY, JSON.stringify({
      ...envelope,
      state: migrateFormStateV3(envelope.state),
      version: FORM_STORE_VERSION,
    }));
    return true;
  } catch {
    return false;
  }
}

export function isV6BuilderEnabled(storage?: Pick<StorageLike, 'getItem'>): boolean {
  try {
    const override = storage?.getItem(BUILDER_VERSION_KEY);
    if (override === 'v5') return false;
    if (override === 'v6') return true;
  } catch {
    // A storage failure must not prevent the application from rendering.
  }
  return import.meta.env.VITE_FORM_BUILDER_V6 !== 'false';
}
