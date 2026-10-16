import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { salesTemplate } from '@/data/template';
import { useFormStore } from './form';

function resetStore() {
  useFormStore.setState({
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
  });
}

describe('form store safety guards', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    resetStore();
  });
  afterEach(() => vi.restoreAllMocks());

  it('does not create a slip when an input needed by a formula is empty', () => {
    useFormStore.getState().setValue('c5', '');

    const result = useFormStore.getState().save();

    expect(result.ok).toBe(false);
    expect(result.ok ? null : result.reason).toBe('validation');
    expect(useFormStore.getState().slips).toHaveLength(0);
    expect(useFormStore.getState().saved).toBe(0);
  });

  it('blocks two immediate saves of the same form state', () => {
    const first = useFormStore.getState().save();
    const second = useFormStore.getState().save();

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(false);
    expect(second.ok ? null : second.reason).toBe('duplicate');
    expect(useFormStore.getState().slips).toHaveLength(1);
  });

  it('blocks the same saved content even after the old time window', () => {
    const first = useFormStore.getState().save();
    useFormStore.setState({ lastSaveAt: 0 });
    const second = useFormStore.getState().save();
    expect(first.ok).toBe(true);
    expect(second.ok).toBe(false);
    expect(second.ok ? null : second.reason).toBe('duplicate');
  });

  it('blocks a duplicate against a legacy slip that has no fingerprint', () => {
    const first = useFormStore.getState().save();
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    const { fingerprint: _fingerprint, ...legacySlip } = first.slip;
    useFormStore.setState({ slips: [legacySlip], lastSaveFingerprint: null, lastSaveAt: 0 });
    const duplicate = useFormStore.getState().save();
    expect(duplicate.ok).toBe(false);
    expect(duplicate.ok ? null : duplicate.reason).toBe('duplicate');
    expect(useFormStore.getState().slips).toHaveLength(1);
  });

  it('keeps more than 20 valid saved slips instead of silently truncating history', () => {
    for (let index = 0; index < 25; index += 1) {
      useFormStore.getState().setValue('c1', `Khách hàng ${index}`);
      expect(useFormStore.getState().save().ok).toBe(true);
    }
    expect(useFormStore.getState().slips).toHaveLength(25);
  });

  it('restores a deleted field at its original index', () => {
    useFormStore.getState().remove('c5');
    expect(useFormStore.getState().fields.some((field) => field.id === 'c5')).toBe(false);

    useFormStore.getState().undoLast();

    expect(useFormStore.getState().fields[4].id).toBe('c5');
    expect(useFormStore.getState().sel).toBe('f4');
  });
});
