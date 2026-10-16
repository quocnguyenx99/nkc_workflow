import type { Field } from '@/lib/formula';

export interface FieldDependency {
  id: string;
  label: string;
  direct: boolean;
}

/** Returns direct and transitive formula dependants in form order. */
export function findDependents(fields: Field[], fieldId: string): FieldDependency[] {
  const directIds = new Set(
    fields
      .filter((field) => field.kind === 'formula' && field.tokens?.some((token) => 'f' in token && token.f === fieldId))
      .map((field) => field.id),
  );
  const affected = new Set(directIds);
  const queue = [...directIds];

  while (queue.length) {
    const current = queue.shift()!;
    for (const field of fields) {
      if (field.kind !== 'formula' || affected.has(field.id)) continue;
      if (field.tokens?.some((token) => 'f' in token && token.f === current)) {
        affected.add(field.id);
        queue.push(field.id);
      }
    }
  }

  return fields
    .filter((field) => affected.has(field.id))
    .map((field) => ({ id: field.id, label: field.label, direct: directIds.has(field.id) }));
}
