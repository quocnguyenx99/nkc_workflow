import { describe, expect, it } from 'vitest';
import { reportRows } from './export';
import type { SavedSlip } from '@/store/form';

const valid: SavedSlip = { code: 'PBH-X', customer: 'Minh Phát', staff: 'Thu Hà', qty: 2, subtotal: 200, vat: 20, total: 210, savedAt: '2026-10-16T00:00:00.000Z' };

describe('reportRows safety', () => {
  it('keeps invalid legacy data in storage input but excludes it from report output', () => {
    const invalid: SavedSlip = { ...valid, code: 'PBH-BAD', qty: -1, total: -100 };
    const slips = [invalid, valid];
    const rows = reportRows(slips);
    expect(slips).toHaveLength(2);
    expect(rows.some((row) => row.code === 'PBH-BAD')).toBe(false);
    expect(rows.some((row) => row.code === 'PBH-X')).toBe(true);
  });
});
