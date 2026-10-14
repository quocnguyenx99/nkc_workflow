import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Approval = 'pending' | 'ok' | 'back';
export type ExportFmt = 'x' | 'w' | 'p';
export type DownloadState = null | 'locked' | 'done' | 'working' | 'error';

interface ReportState {
  ap: Approval;
  fmt: ExportFmt;
  dl: DownloadState;
  note: string;
  approve: () => void;
  reject: () => void;
  reset: () => void;
  pick: (fmt: ExportFmt) => void;
  setDl: (dl: DownloadState) => void;
  setNote: (note: string) => void;
}

export const useReportStore = create<ReportState>()(
  persist(
    (set) => ({
      ap: 'pending',
      fmt: 'x',
      dl: null,
      note: '',
      approve: () => set({ ap: 'ok', dl: null }),
      reject: () => set({ ap: 'back', dl: null }),
      reset: () => set({ ap: 'pending', dl: null, note: '' }),
      pick: (fmt) => set({ fmt, dl: null }),
      setDl: (dl) => set({ dl }),
      setNote: (note) => set({ note }),
    }),
    { name: 'oneflow-report', partialize: (s) => ({ ap: s.ap, fmt: s.fmt, note: s.note }) },
  ),
);
