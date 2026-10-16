import { describe, expect, it } from 'vitest';
import { findDependents } from '@/lib/field-dependencies';
import { salesTemplate } from '@/data/template';

describe('findDependents', () => {
  it('trả về phụ thuộc trực tiếp và bắc cầu theo thứ tự form', () => {
    const deps = findDependents(salesTemplate(), 'c5');
    expect(deps.map((item) => item.id)).toEqual(['f1', 'f2', 'f3', 'f4']);
    expect(deps.find((item) => item.id === 'f1')?.direct).toBe(true);
    expect(deps.find((item) => item.id === 'f4')?.direct).toBe(false);
  });

  it('trả về rỗng khi field không được dùng', () => {
    expect(findDependents(salesTemplate(), 'c1')).toEqual([]);
  });
});
