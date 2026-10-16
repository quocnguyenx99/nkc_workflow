import type { Field, FieldRole } from '@/lib/formula';

const LEGACY_ROLE_BY_ID: Record<string, FieldRole> = {
  c1: 'customer',
  c2: 'staff',
  c3: 'saleDate',
  c4: 'product',
  c5: 'quantity',
  c6: 'unitPrice',
  c7: 'discountRate',
  f1: 'subtotal',
  f2: 'discountAmount',
  f3: 'vat',
  f4: 'total',
};

const LABELS: Partial<Record<FieldRole, RegExp>> = {
  customer: /khách hàng/i,
  staff: /nhân viên|người phụ trách/i,
  quantity: /số lượng/i,
  subtotal: /thành tiền/i,
  vat: /vat|thuế/i,
  total: /tổng thanh toán|tổng cộng/i,
};

/** Adds only roles that are unambiguous in the shipped template. */
export function migrateLegacyFieldRoles(fields: Field[]): Field[] {
  return fields.map((field) => (field.role || !LEGACY_ROLE_BY_ID[field.id] ? field : { ...field, role: LEGACY_ROLE_BY_ID[field.id] }));
}

/** Resolve a report field without changing legacy data or relying on labels first. */
export function findSemanticField(fields: Field[], role: FieldRole): Field | undefined {
  const explicit = fields.find((field) => field.role === role);
  if (explicit) return explicit;

  const legacyId = Object.entries(LEGACY_ROLE_BY_ID).find(([, candidate]) => candidate === role)?.[0];
  const legacy = legacyId ? fields.find((field) => field.id === legacyId) : undefined;
  if (legacy) return legacy;

  const labelPattern = LABELS[role];
  if (labelPattern) {
    const byLabel = fields.find((field) => labelPattern.test(field.label));
    if (byLabel) return byLabel;
  }

  if (role === 'customer') return fields.find((field) => field.kind === 'text');
  if (role === 'staff') return fields.find((field) => field.kind === 'person');
  if (role === 'quantity') return fields.find((field) => field.kind === 'number');
  if (role === 'total') return fields.filter((field) => field.kind === 'formula').slice(-1)[0];
  return undefined;
}
