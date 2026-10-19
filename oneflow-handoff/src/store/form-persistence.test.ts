import { describe, expect, it } from 'vitest';
import { salesTemplate } from '@/data/template';
import {
  FORM_STORAGE_KEY,
  FORM_V2_BACKUP_KEY,
  backupV2Envelope,
  migrateFormStateV3,
  migrateStoredFormV3,
  safeNextSequence,
  sanitizeFormOrder,
} from './form-persistence';

describe('form persistence v3 contract', () => {
  it('migrates a production-shaped v2 fixture without changing IDs, tokens, order, slips or unknown keys', () => {
    const fields = salesTemplate().map((field) => field.id === 'c1' ? { ...field, label: 'Khách hàng đã đổi tên' } : field);
    const slips = [{ code: 'PBH-1040', customer: 'Minh Phát', staff: 'Hà', qty: 12, subtotal: 15_000_000, vat: 1_425_000, total: 15_675_000, savedAt: '2026-10-19T00:00:00.000Z' }];
    const migrated = migrateFormStateV3({ fields, sel: 'missing', seq: 1, slips, futureFlag: { enabled: true } });

    expect(migrated.formOrder).toEqual(fields.map((field) => field.id));
    expect((migrated.fields as typeof fields).map((field) => field.id)).toEqual(fields.map((field) => field.id));
    expect((migrated.fields as typeof fields).find((field) => field.id === 'f4')?.tokens).toEqual(fields.find((field) => field.id === 'f4')?.tokens);
    expect(migrated.slips).toEqual(slips);
    expect(migrated.sel).toBeNull();
    expect(migrated.futureFlag).toEqual({ enabled: true });
  });

  it('sanitizes stale placement and sequence without duplicating entries', () => {
    const fields = [...salesTemplate(), { id: 'n7', kind: 'number' as const, label: 'Legacy', span: 3 as const, value: '1' }];
    expect(sanitizeFormOrder(fields, ['c1', 'missing', 'c1', 'n7'])).toEqual(['c1', 'n7']);
    expect(safeNextSequence(fields, 2)).toBe(8);
  });

  it('is idempotent for an existing v3 placement, including intentionally detached formulas', () => {
    const first = migrateFormStateV3({ fields: salesTemplate(), formOrder: ['c1', 'c2', 'f4'], sel: 'f4', seq: 4, slips: [] });
    const second = migrateFormStateV3(first);
    expect(second).toEqual(first);
  });

  it('backs up a raw v2 envelope once and never overwrites the rollback copy', () => {
    const data = new Map<string, string>();
    const storage = { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => data.set(key, value) };
    const raw = JSON.stringify({ state: { fields: salesTemplate() }, version: 2 });
    data.set(FORM_STORAGE_KEY, raw);
    expect(backupV2Envelope(storage)).toBe(true);
    expect(data.get(FORM_V2_BACKUP_KEY)).toBe(raw);
    data.set(FORM_STORAGE_KEY, JSON.stringify({ state: {}, version: 2 }));
    expect(backupV2Envelope(storage)).toBe(false);
    expect(data.get(FORM_V2_BACKUP_KEY)).toBe(raw);
  });

  it('backs up and durably replaces a v2 envelope before hydration', () => {
    const data = new Map<string, string>();
    const storage = { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => data.set(key, value) };
    const fields = salesTemplate();
    const raw = JSON.stringify({ state: { fields, sel: 'stale', seq: 0, legacyFlag: 'keep' }, version: 2, envelopeFlag: 'keep' });
    data.set(FORM_STORAGE_KEY, raw);

    expect(migrateStoredFormV3(storage)).toBe(true);
    expect(data.get(FORM_V2_BACKUP_KEY)).toBe(raw);
    const migrated = JSON.parse(data.get(FORM_STORAGE_KEY)!);
    expect(migrated.version).toBe(3);
    expect(migrated.envelopeFlag).toBe('keep');
    expect(migrated.state.formOrder).toEqual(fields.map((field) => field.id));
    expect(migrated.state.sel).toBeNull();
    expect(migrated.state.legacyFlag).toBe('keep');
    expect(migrateStoredFormV3(storage)).toBe(false);
  });
});
