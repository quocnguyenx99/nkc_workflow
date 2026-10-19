import { useEffect, useRef, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, X } from 'lucide-react';
import { calc, formatFormulaResult, showValue, type Field } from '@/lib/formula';
import { diagnoseFormula } from '@/lib/formula-diagnostics';
import { findSemanticField } from '@/lib/field-semantics';

interface FormPreviewModalProps {
  fields: Field[];
  placedFields: Field[];
  open: boolean;
  onClose: () => void;
}

function PreviewValue({ field }: { field: Field }) {
  const value = showValue(field);
  const empty = value === '—';
  return (
    <div
      className={`v6-preview-control${empty ? ' is-empty' : ''}`}
      aria-label={`${field.label}: ${empty ? 'Chưa có dữ liệu' : value}`}
    >
      <span>{empty ? field.placeholder || `Nhập ${field.label.toLowerCase()}` : value}</span>
      {field.kind === 'select' && <span aria-hidden="true" className="v6-preview-chevron">⌄</span>}
    </div>
  );
}

export function FormPreviewModal({ fields, placedFields, open, onClose }: FormPreviewModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    window.requestAnimationFrame(() => closeButtonRef.current?.focus());
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, open]);

  if (!open || typeof document === 'undefined') return null;

  const dataCount = placedFields.filter((field) => field.kind !== 'formula').length;
  const formulaCount = placedFields.length - dataCount;
  const total = findSemanticField(placedFields, 'total');
  const totalValue = total ? calc(fields, total.id) : NaN;

  return createPortal(
    <div className="v6-preview-layer" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section
        className="v6-preview-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="v6-preview-title"
        aria-describedby="v6-preview-description"
      >
        <header className="v6-preview-header">
          <div className="v6-preview-heading">
            <span className="v6-preview-badge">Bản xem trước</span>
            <div>
              <h2 id="v6-preview-title">Phiếu bán hàng</h2>
              <p id="v6-preview-description">Giao diện người dùng cuối · {dataCount} trường nhập · {formulaCount} trường tự tính</p>
            </div>
          </div>
          <button ref={closeButtonRef} type="button" className="v6-preview-icon-close" onClick={onClose} aria-label="Đóng xem trước">
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        <div className="system-scrollbar v6-preview-body">
          <div className="v6-preview-content">
            <section aria-label="Thông tin phiếu" className="v6-preview-form-card">
              <div className="v6-preview-form-intro">
                <div>
                  <h3>Thông tin phiếu</h3>
                  <p>Dữ liệu mẫu và kết quả công thức theo cấu hình hiện tại.</p>
                </div>
                <span>* Bắt buộc</span>
              </div>

              {placedFields.length ? (
                <div className="v6-preview-field-grid">
                  {placedFields.map((field) => {
                    const style = { gridColumn: `span ${field.span} / span ${field.span}` } as CSSProperties;
                    if (field.kind === 'formula') {
                      const value = calc(fields, field.id);
                      const diagnostic = diagnoseFormula(fields, field.id);
                      const isTotal = field.id === total?.id;
                      return (
                        <div key={field.id} className="entry-cell v6-preview-formula" data-span={field.span} style={style}>
                          <div className="v6-preview-formula-meta">
                            <span>ƒx TỰ TÍNH</span>
                            <small>chỉ đọc</small>
                          </div>
                          <div className={`v6-preview-formula-value${isTotal ? ' is-total' : ''}`}>
                            <span>{field.label}</span>
                            <strong>{formatFormulaResult(field, value)}</strong>
                          </div>
                          {diagnostic.code !== 'valid' && <p className="v6-preview-formula-warning">{diagnostic.message}</p>}
                        </div>
                      );
                    }
                    return (
                      <div key={field.id} className="entry-cell v6-preview-field" data-span={field.span} style={style}>
                        <div className="v6-preview-label">
                          {field.label}{field.required && <span aria-label="bắt buộc"> *</span>}
                        </div>
                        <PreviewValue field={field} />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="v6-preview-empty">Form chưa có trường để xem trước.</div>
              )}
            </section>

            <aside aria-label="Tóm tắt phiếu" className="v6-preview-summary">
              <span>Tóm tắt</span>
              <h3>Phiếu bán hàng</h3>
              <p>Giá trị được tính trực tiếp từ Formula Engine hiện tại.</p>
              <div>
                <small>Tổng thanh toán</small>
                <strong>{total ? formatFormulaResult(total, totalValue) : 'Chưa xác định'}</strong>
              </div>
              <dl>
                <div><dt>Trường nhập</dt><dd>{dataCount}</dd></div>
                <div><dt>Trường tự tính</dt><dd>{formulaCount}</dd></div>
              </dl>
            </aside>
          </div>
        </div>

        <footer className="v6-preview-footer">
          <span>Đây là chế độ chỉ xem. Mọi thay đổi trong Form Workspace vẫn được giữ nguyên.</span>
          <button type="button" onClick={onClose}>
            <ArrowLeft size={16} aria-hidden="true" />
            Quay lại thiết kế
          </button>
        </footer>
      </section>
    </div>,
    document.body,
  );
}
