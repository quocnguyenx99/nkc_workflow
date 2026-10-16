import { useMemo, useState } from 'react';
import { AppHeader, AppShell, AppSidebar } from '@/components/app/AppShell';
import { BuilderWorkspace } from '@/components/nhap-lieu/BuilderWorkspace';
import { ConfirmAction } from '@/components/nhap-lieu/ConfirmAction';
import { EntryWorkspace } from '@/components/nhap-lieu/EntryWorkspace';
import { FirstRunJourney } from '@/components/nhap-lieu/FirstRunJourney';
import { UndoToast } from '@/components/nhap-lieu/UndoToast';
import { findDependents } from '@/lib/field-dependencies';
import { useFormStore, type Mode } from '@/store/form';

const GUIDE_KEY = 'oneflow-nhap-lieu-guide:v1';
type ConfirmState = { type: 'delete'; fieldId: string } | { type: 'clear' } | { type: 'template' } | null;

export default function NhapLieuPage() {
  const mode = useFormStore((state) => state.mode);
  const fields = useFormStore((state) => state.fields);
  const setMode = useFormStore((state) => state.setMode);
  const remove = useFormStore((state) => state.remove);
  const clearAll = useFormStore((state) => state.clearAll);
  const loadTemplate = useFormStore((state) => state.loadTemplate);
  const save = useFormStore((state) => state.save);
  const updatedAt = useFormStore((state) => state.updatedAt);
  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const [duplicateNotice, setDuplicateNotice] = useState<string | null>(null);
  const [guideVisible, setGuideVisible] = useState(() => {
    try {
      return window.localStorage.getItem(GUIDE_KEY) !== 'done';
    } catch {
      return true;
    }
  });
  const [guideStep, setGuideStep] = useState<1 | 2 | 3 | 4>(1);

  const requestedField = confirm?.type === 'delete' ? fields.find((field) => field.id === confirm.fieldId) : undefined;
  const dependents = useMemo(() => (requestedField ? findDependents(fields, requestedField.id) : []), [fields, requestedField]);

  const finishGuide = () => {
    try {
      window.localStorage.setItem(GUIDE_KEY, 'done');
    } catch {
      // The guide remains session-only when storage is unavailable.
    }
    setGuideVisible(false);
  };

  const replayGuide = () => {
    setGuideStep(1);
    setGuideVisible(true);
  };

  const progressGuide = (next: 2 | 3) => setGuideStep((current) => (Math.max(current, next) as 1 | 2 | 3 | 4));

  const switchMode = (nextMode: Mode) => {
    setMode(nextMode);
    setDuplicateNotice(null);
    if (nextMode === 'test') setGuideStep((current) => (Math.max(current, 4) as 1 | 2 | 3 | 4));
  };

  const handleSave = () => {
    setDuplicateNotice(null);
    const result = save();
    if (result.ok) {
      finishGuide();
      return;
    }
    if (result.reason === 'duplicate') {
      setDuplicateNotice(`Nội dung này đã được lưu thành phiếu ${result.slip.code}. Hãy thay đổi dữ liệu phiếu trước khi lưu bản mới.`);
      return;
    }
    window.setTimeout(() => {
      const first = result.issues.find((issue) => issue.fieldId);
      if (first?.fieldId) document.getElementById(`entry-${first.fieldId}`)?.focus();
    }, 0);
  };

  const confirmAction = () => {
    if (!confirm) return;
    if (confirm.type === 'delete') remove(confirm.fieldId);
    if (confirm.type === 'clear') clearAll();
    if (confirm.type === 'template') loadTemplate();
    setConfirm(null);
  };

  const confirmCopy = (() => {
    if (confirm?.type === 'delete' && requestedField) {
      return {
        title: `Xóa trường “${requestedField.label}”?`,
        description: dependents.length
          ? 'Trường này đang được dùng trong công thức. Nếu vẫn xóa, các kết quả liên quan sẽ tạm thời không tính được.'
          : 'Bạn có thể hoàn tác ngay sau khi xóa.',
        details: dependents.map((item) => item.label),
        label: dependents.length ? 'Vẫn xóa trường' : 'Xóa trường',
      };
    }
    if (confirm?.type === 'clear') {
      return { title: 'Làm trống toàn bộ biểu mẫu?', description: 'Tất cả trường đang có sẽ bị xóa khỏi canvas. Bạn có thể hoàn tác ngay sau đó.', details: [], label: 'Làm trống' };
    }
    return { title: 'Nạp lại mẫu Phiếu bán hàng?', description: 'Cấu trúc và dữ liệu mẫu hiện tại sẽ được thay bằng mẫu mặc định. Bạn có thể hoàn tác ngay sau đó.', details: [], label: 'Nạp mẫu' };
  })();

  const testing = mode === 'test';
  const segmentStyle = (active: boolean) => ({
    background: active ? '#FFFFFF' : 'transparent',
    color: active ? '#0B1220' : '#5B6478',
    boxShadow: active ? '0 1px 3px rgba(11,18,32,.15)' : 'none',
  });

  return (
    <AppShell
      layout={testing ? 'document' : 'workspace'}
      minHeight={testing ? 1100 : undefined}
      sidebar={
        <AppSidebar
          active="form"
          pendingCount="3"
          group={{
            heading: 'BIỂU MẪU · KINH DOANH',
            items: [
              { label: 'Phiếu bán hàng', color: '#2F54EB', active: true },
              { label: 'Báo giá', color: '#C7D2FF' },
              { label: 'Hợp đồng', color: '#C7D2FF' },
            ],
          }}
          user={{ initials: 'TH', name: 'Trần Thu Hà', role: 'Kinh doanh', avatarBg: '#2F54EB' }}
        />
      }
    >
      <AppHeader crumb="Kinh doanh  /  Biểu mẫu" title="Phiếu bán hàng">
        <button type="button" onClick={replayGuide} className="border-0 hidden bg-transparent rounded-[9px] px-2.5 min-h-10 text-[13px] font-semibold text-muted cursor-pointer hover:bg-hover">? Hướng dẫn</button>
        <div role="tablist" aria-label="Không gian làm việc" className="flex bg-hover rounded-xl p-1 gap-1">
          <button type="button" role="tab" aria-selected={!testing} onClick={() => switchMode('design')} className="border-0 rounded-[9px] px-4 min-h-[38px] text-[14px] font-semibold cursor-pointer transition-colors" style={segmentStyle(!testing)}>
            Thiết kế biểu mẫu
          </button>
          <button type="button" role="tab" aria-selected={testing} onClick={() => switchMode('test')} className="border-0 rounded-[9px] px-4 min-h-[38px] text-[14px] font-semibold cursor-pointer transition-colors" style={segmentStyle(testing)}>
            Nhập phiếu
          </button>
        </div>
        {!testing ? (
          <>
            <span className="text-[12px] font-semibold text-green-text whitespace-nowrap">✓ Tự lưu lúc {new Date(updatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
            <button type="button" onClick={() => setConfirm({ type: 'template' })} className="ghost border border-line-3 bg-white rounded-[10px] px-3.5 min-h-11 text-[14px] font-semibold text-ink cursor-pointer">Nạp mẫu</button>
            <button type="button" onClick={() => setConfirm({ type: 'clear' })} className="ghost border border-line-3 bg-white rounded-[10px] px-3.5 min-h-11 text-[14px] font-semibold text-red-text cursor-pointer">Làm trống</button>
            <button type="button" onClick={() => switchMode('test')} className="border-0 bg-primary text-white rounded-[10px] px-4 min-h-11 text-[14px] font-bold cursor-pointer">Tiếp tục nhập phiếu →</button>
          </>
        ) : (
          <button type="button" onClick={handleSave} className="border-0 bg-primary hover:bg-primary-hover text-white rounded-[10px] px-[18px] min-h-11 text-[14px] font-bold cursor-pointer shadow-[0_10px_22px_-10px_rgba(47,84,235,.7)] max-[640px]:hidden">Kiểm tra & lưu phiếu</button>
        )}
      </AppHeader>

      <FirstRunJourney visible={guideVisible} step={guideStep} onDismiss={finishGuide} onEnterData={() => switchMode('test')} />

      {!testing ? (
        <BuilderWorkspace
          onGuideProgress={progressGuide}
          onRequestDelete={(fieldId) => setConfirm({ type: 'delete', fieldId })}
          onLoadTemplate={() => setConfirm({ type: 'template' })}
        />
      ) : (
        <EntryWorkspace onSave={handleSave} duplicateNotice={duplicateNotice} />
      )}

      <UndoToast />
      <ConfirmAction
        open={confirm !== null}
        title={confirmCopy.title}
        description={confirmCopy.description}
        details={confirmCopy.details}
        confirmLabel={confirmCopy.label}
        danger={confirm?.type !== 'template'}
        onCancel={() => setConfirm(null)}
        onConfirm={confirmAction}
      />
    </AppShell>
  );
}
