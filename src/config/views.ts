// Map each view (OOM + TQEs) to a title and CSV URL.
// Fill the env vars below in `.env.local` (see step 5).

export type ViewId =
  | 'oom'
  | 'tqe-1'
  | 'tqe-2'
  | 'tqe-3'
  | 'tqe-4'
  | 'tqe-5'
  | 'tqe-6'
  | 'tqe-7';

export const VIEWS: Record<ViewId, { title: string; csv: string }> = {
  oom:   { title: 'OOM Table', csv: process.env.NEXT_PUBLIC_CSV_OOM   || '' },
  'tqe-1': { title: 'TQE 1 — Mission Hills Norman (L/L)', csv: process.env.NEXT_PUBLIC_CSV_TQE1 || '' },
  'tqe-2': { title: 'TQE 2 — Purunsol [Lake/Mountain] (R/R)', csv: process.env.NEXT_PUBLIC_CSV_TQE2 || '' },
  'tqe-3': { title: 'TQE 3 — St Andrews (L/L)', csv: process.env.NEXT_PUBLIC_CSV_TQE3 || '' },
  'tqe-4': { title: 'TQE 4 — Tani CC (R/R)', csv: process.env.NEXT_PUBLIC_CSV_TQE4 || '' },
  'tqe-5': { title: 'TQE 5 — Ariji CC (L/L)', csv: process.env.NEXT_PUBLIC_CSV_TQE5 || '' },
  'tqe-6': { title: 'TQE 6 — Sophia Green (R/R)', csv: process.env.NEXT_PUBLIC_CSV_TQE6 || '' },
  'tqe-7': { title: 'TQE 7 — Phoenix Resort [Phoenix] (L/L)', csv: process.env.NEXT_PUBLIC_CSV_TQE7 || '' },
};

export const DEFAULT_VIEW: ViewId = 'oom';

