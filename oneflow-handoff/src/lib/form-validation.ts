import { calc, parseNumber, type Field, type FieldRole } from '@/lib/formula';
import { diagnoseFormula } from '@/lib/formula-diagnostics';
import { findSemanticField } from '@/lib/field-semantics';

export interface FormValidationIssue {
  code: string;
  message: string;
  fieldId?: string;
}

interface SavedSlipLike {
  customer: string;
  staff: string;
  qty: number;
  subtotal: number;
  vat: number;
  total: number;
  valid?: boolean;
}

const REQUIRED_ROLES: { role: FieldRole; label: string }[] = [
  { role: 'customer', label: 'Khách hàng' },
  { role: 'staff', label: 'Nhân viên bán' },
  { role: 'saleDate', label: 'Ngày bán' },
  { role: 'product', label: 'Sản phẩm' },
  { role: 'quantity', label: 'Số lượng' },
  { role: 'unitPrice', label: 'Đơn giá' },
  { role: 'discountRate', label: 'Chiết khấu' },
  { role: 'subtotal', label: 'Thành tiền' },
  { role: 'vat', label: 'Thuế VAT' },
  { role: 'total', label: 'Tổng thanh toán' },
];

const REPORT_NUMERIC_FIELDS: { role: FieldRole; label: string; min: number; max?: number; integer?: boolean }[] = [
  { role: 'quantity', label: 'Số lượng', min: 1, integer: true },
  { role: 'unitPrice', label: 'Đơn giá', min: 0 },
  { role: 'discountRate', label: 'Chiết khấu', min: 0, max: 100 },
  { role: 'subtotal', label: 'Thành tiền', min: 0 },
  { role: 'vat', label: 'Thuế VAT', min: 0 },
  { role: 'total', label: 'Tổng thanh toán', min: 0 },
];

const empty = (value: unknown) => String(value ?? '').trim() === '';

export function isValidCalendarDate(value: string | undefined): boolean {
  const raw = String(value ?? '').trim();
  const vi = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const day = Number(vi?.[1] ?? iso?.[3]);
  const month = Number(vi?.[2] ?? iso?.[2]);
  const year = Number(vi?.[3] ?? iso?.[1]);
  if ((!vi && !iso) || !Number.isFinite(day + month + year)) return false;
  const date = new Date(Date.UTC(year, month - 1, day));
  return year >= 1900 && date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function validateInputField(field: Field): FormValidationIssue[] {
  if (field.kind === 'formula') return [];
  const issues: FormValidationIssue[] = [];
  const value = field.value ?? '';
  if (field.required && empty(value)) {
    issues.push({ code: 'required', message: `${field.label} là thông tin bắt buộc.`, fieldId: field.id });
    return issues;
  }
  if (empty(value)) return issues;

  if (field.kind === 'date' && !isValidCalendarDate(value)) {
    issues.push({ code: 'invalid_date', message: `${field.label} không phải ngày hợp lệ.`, fieldId: field.id });
  }
  if (field.kind === 'select' && field.options?.length && !field.options.includes(value)) {
    issues.push({ code: 'invalid_option', message: `${field.label} phải là một lựa chọn trong danh sách.`, fieldId: field.id });
  }
  if (['number', 'money', 'percent'].includes(field.kind)) {
    const numeric = parseNumber(value);
    if (!Number.isFinite(numeric)) {
      issues.push({ code: 'invalid_number', message: `${field.label} phải là một số hợp lệ.`, fieldId: field.id });
      return issues;
    }
    if (field.integer && !Number.isInteger(numeric)) issues.push({ code: 'not_integer', message: `${field.label} phải là số nguyên.`, fieldId: field.id });
    if (field.min != null && numeric < field.min) issues.push({ code: 'below_min', message: `${field.label} phải từ ${field.min.toLocaleString('vi-VN')} trở lên.`, fieldId: field.id });
    if (field.max != null && numeric > field.max) issues.push({ code: 'above_max', message: `${field.label} không được vượt quá ${field.max.toLocaleString('vi-VN')}.`, fieldId: field.id });
  }
  return issues;
}

function reachableFormulaIds(fields: Field[], roots: Iterable<string>): Set<string> {
  const reachable = new Set<string>();
  const queue = [...roots];
  while (queue.length) {
    const id = queue.shift()!;
    const field = fields.find((item) => item.id === id);
    if (!field || field.kind !== 'formula' || reachable.has(id)) continue;
    reachable.add(id);
    for (const token of field.tokens ?? []) if ('f' in token) queue.push(token.f);
  }
  return reachable;
}

export function validateFormForSave(fields: Field[], formOrder = fields.map((field) => field.id)): FormValidationIssue[] {
  const placed = new Set(formOrder);
  const placedFields = formOrder.flatMap((id) => {
    const field = fields.find((item) => item.id === id);
    return field ? [field] : [];
  });
  if (!placedFields.length) return [{ code: 'empty_form', message: 'Biểu mẫu chưa có trường dữ liệu.' }];
  const issues: FormValidationIssue[] = [];
  const requiredFormulaIds = new Set<string>();

  for (const required of REQUIRED_ROLES) {
    const field = findSemanticField(fields, required.role);
    if (!field || !placed.has(field.id)) issues.push({ code: `missing_${required.role}`, message: `Thiếu trường ${required.label} cần cho phiếu bán hàng và báo cáo.` });
    else if (field.kind === 'formula') requiredFormulaIds.add(field.id);
  }

  for (const field of placedFields) issues.push(...validateInputField(field));

  const formulaRoots = placedFields.filter((field) => field.kind === 'formula').map((field) => field.id);
  const formulaIds = reachableFormulaIds(fields, [...formulaRoots, ...requiredFormulaIds]);
  for (const field of fields.filter((item) => item.kind === 'formula' && formulaIds.has(item.id))) {
    const diagnostic = diagnoseFormula(fields, field.id);
    const alreadyExplained = diagnostic.code === 'input_missing' && diagnostic.fieldId && issues.some((issue) => issue.fieldId === diagnostic.fieldId);
    if (diagnostic.code !== 'valid' && !alreadyExplained) {
      issues.push({ code: `formula_${diagnostic.code}`, message: `${field.label}: ${diagnostic.message}`, fieldId: diagnostic.fieldId ?? field.id });
    }
  }

  for (const required of REPORT_NUMERIC_FIELDS) {
    const field = findSemanticField(fields, required.role);
    if (!field || !placed.has(field.id)) continue;
    const value = field.kind === 'formula' ? calc(fields, field.id) : parseNumber(field.value);
    if (!Number.isFinite(value)) {
      if (!issues.some((issue) => issue.fieldId === field.id)) issues.push({ code: `invalid_${required.role}`, message: `${required.label} chưa có giá trị hợp lệ.`, fieldId: field.id });
      continue;
    }
    if (value < required.min && !issues.some((issue) => issue.fieldId === field.id)) {
      issues.push({ code: `below_min_${required.role}`, message: `${required.label} phải từ ${required.min.toLocaleString('vi-VN')} trở lên.`, fieldId: field.id });
    }
    if (required.max != null && value > required.max && !issues.some((issue) => issue.fieldId === field.id)) {
      issues.push({ code: `above_max_${required.role}`, message: `${required.label} không được vượt quá ${required.max.toLocaleString('vi-VN')}.`, fieldId: field.id });
    }
    if (required.integer && !Number.isInteger(value) && !issues.some((issue) => issue.fieldId === field.id)) {
      issues.push({ code: `not_integer_${required.role}`, message: `${required.label} phải là số nguyên.`, fieldId: field.id });
    }
  }

  return issues;
}

/** Invalid legacy slips are kept in storage, but are quarantined from reports and exports. */
export function isSavedSlipReportable(slip: SavedSlipLike): boolean {
  if (slip.valid === false) return false;
  const named = [slip.customer, slip.staff].every((value) => !empty(value) && String(value).trim() !== '—');
  const values = [slip.qty, slip.subtotal, slip.vat, slip.total];
  if (!named || !values.every(Number.isFinite)) return false;
  if (!Number.isInteger(slip.qty) || slip.qty <= 0 || slip.subtotal < 0 || slip.vat < 0 || slip.total < 0) return false;
  const discount = slip.subtotal + slip.vat - slip.total;
  return discount >= 0 && discount <= slip.subtotal;
}
