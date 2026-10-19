import type { ComponentProps } from 'react';
import { FormulaSetupPanel } from './FormulaSetupPanel';

export function FormulaWorkspace({ onBack, ...props }: ComponentProps<typeof FormulaSetupPanel> & { onBack: () => void }) {
  return (
    <section className="v6-formula-workspace" aria-label="Formula Workspace">
      <div className="v6-workspace-backbar"><button type="button" onClick={onBack}>← Quay lại bốn cột</button><div><strong>{props.draft?.label ?? 'Formula Workspace'}</strong><span>Không gian chỉnh công thức số học mở rộng</span></div></div>
      <FormulaSetupPanel {...props} expanded />
    </section>
  );
}
