import { describe, expect, it } from 'vitest';
import { salesTemplate } from '@/data/template';
import { findSemanticField, migrateLegacyFieldRoles } from './field-semantics';

describe('legacy field semantics', () => {
  it('adds stable roles to legacy template ids without changing field data', () => {
    const legacy = salesTemplate().map(({ role: _role, ...field }) => ({ ...field }));
    const before = JSON.stringify(legacy);

    const migrated = migrateLegacyFieldRoles(legacy);

    expect(findSemanticField(migrated, 'quantity')?.id).toBe('c5');
    expect(findSemanticField(migrated, 'total')?.id).toBe('f4');
    expect(JSON.stringify(migrated.map(({ role: _role, ...field }) => field))).toBe(before);
  });

  it('prefers an explicit role after fields are renamed and reordered', () => {
    const fields = salesTemplate().map((field) => ({ ...field, label: `Đã đổi ${field.id}` })).reverse();

    expect(findSemanticField(fields, 'customer')?.id).toBe('c1');
    expect(findSemanticField(fields, 'total')?.id).toBe('f4');
  });
});
