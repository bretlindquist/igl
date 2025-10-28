export type ViewId =
  | 'oom'
  | 'tqe-1'
  | 'tqe-2'
  | 'tqe-3'
  | 'tqe-4'
  | 'tqe-5'
  | 'tqe-6'
  | 'tqe-7';

type ViewDef = { title: string; csv: string; columns?: string[] }

/** One canonical TQE column set (order preserved for all TQEs) */
export const TQE_COLUMNS: string[] = [
  'screen_name',
  'SUM of gross',
  'SUM of absolute_net',
  'SUM of Comp_score',
  'Handi bonus',
  'Final Points',
];

export const VIEWS: Record<ViewId, ViewDef> = {
  // OOM: no whitelist → show everything (or add its own list if you want)
  oom: { title: 'OOM Table', csv: process.env.NEXT_PUBLIC_CSV_OOM || '' },

  // All TQEs: share the same columns
  'tqe-1': {
    title: 'TQE 1 — Mission Hills Norman (L/L)',
    csv: process.env.NEXT_PUBLIC_CSV_TQE1 || '',
    columns: TQE_COLUMNS,
  },
  'tqe-2': {
    title: 'TQE 2 — Purunsol [Lake/Mountain] (R/R)',
    csv: process.env.NEXT_PUBLIC_CSV_TQE2 || '',
    columns: TQE_COLUMNS,
  },
  'tqe-3': {
    title: 'TQE 3 — St Andrews (L/L)',
    csv: process.env.NEXT_PUBLIC_CSV_TQE3 || '',
    columns: TQE_COLUMNS,
  },
  'tqe-4': {
    title: 'TQE 4 — Tani CC (R/R)',
    csv: process.env.NEXT_PUBLIC_CSV_TQE4 || '',
    columns: TQE_COLUMNS,
  },
  'tqe-5': {
    title: 'TQE 5 — Ariji CC (L/L)',
    csv: process.env.NEXT_PUBLIC_CSV_TQE5 || '',
    columns: TQE_COLUMNS,
  },
  'tqe-6': {
    title: 'TQE 6 — Sophia Green (R/R)',
    csv: process.env.NEXT_PUBLIC_CSV_TQE6 || '',
    columns: TQE_COLUMNS,
  },
  'tqe-7': {
    title: 'TQE 7 — Phoenix Resort [Phoenix] (L/L)',
    csv: process.env.NEXT_PUBLIC_CSV_TQE7 || '',
    columns: TQE_COLUMNS,
  },
};

export const DEFAULT_VIEW: ViewId = 'oom';

