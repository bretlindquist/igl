export type ViewId =
  | 'oom'
  | 'tqe-1'
  | 'tqe-2'
  | 'tqe-3'
  | 'tqe-4'
  | 'tqe-5'
  | 'tqe-6'
  | 'tqe-7'
  | 'eclectic'

export type SeasonId = 'fall-2025' | 'spring-2026'

export type SourceStrategy = 'local-first' | 'remote-first'

export type OomDeadline = { iso: string; course: string }
export type OomSeasonMeta = {
  slotNames: Partial<Record<1 | 2 | 3 | 4 | 5 | 6 | 7, string>>
  deadlines: OomDeadline[]
}

export type SeasonViewSource = {
  title: string
  strategy: SourceStrategy
  localArchiveFile: string
  remoteUrl: string
  columns?: string[]
  oomMeta?: OomSeasonMeta
}

const FALL_2025_BASE =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vTLICxWkOzCBLlCLTUM5hQAy04hyZ2G4qZBTPVff9QiMKwxzMISEsbdRFp_1qWfWH7WMUt-c5w8QJ6n/pub'

const SPRING_2026_BASE =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ76ygkivaadAW5ln88ZUZpVSasm4WDsgLIn6ZupJrwhfafTYLgdYhrjmMizcKzA4Ikzr3t-3Zdzl-0/pub'

function csvUrl(base: string, gid: string): string {
  return `${base}?gid=${gid}&output=csv`
}

export const TQE_COLUMNS: string[] = [
  'screen_name',
  'SUM of gross',
  'SUM of absolute_net',
  'SUM of Comp_score',
  'Handi bonus',
  'Final Points',
]

const SPRING_2026_OOM_META: OomSeasonMeta = {
  slotNames: {
    1: 'Mauna Ocean Resort',
    2: 'Turnberry Ailsa',
    4: 'Bugok CC',
  },
  deadlines: [
    { iso: '2026-03-08', course: 'Mauna Ocean Resort (Mauna/Ocean)' },
    { iso: '2026-03-22', course: 'Turnberry (Ailsa)' },
  ],
}

export const SEASON_VIEW_SOURCES: Record<SeasonId, Partial<Record<ViewId, SeasonViewSource>>> = {
  'fall-2025': {
    oom: {
      title: 'OOM Table',
      strategy: 'local-first',
      localArchiveFile: 'oom',
      remoteUrl: csvUrl(FALL_2025_BASE, '1778336569'),
      oomMeta: {
        slotNames: {
          1: 'Mission Hills Norman',
          2: 'Purunsol',
          3: 'St Andrews',
          4: 'Tani CC',
          5: 'Ariji CC',
          6: 'Sophia Green',
          7: 'Phoenix Resort',
        },
        deadlines: [
          { iso: '2025-09-28', course: 'Mission Hills – Norman' },
          { iso: '2025-09-28', course: 'Purunsol' },
          { iso: '2025-09-28', course: 'St. Andrews' },
          { iso: '2025-10-12', course: 'Tani CC' },
          { iso: '2025-10-26', course: 'Ariji CC' },
          { iso: '2025-11-09', course: 'Sophia Green' },
          { iso: '2025-11-23', course: 'Phoenix Resort' },
        ],
      },
    },
    'tqe-1': {
      title: 'TQE 1 — Mission Hills Norman (L/L)',
      strategy: 'local-first',
      localArchiveFile: 'tqe-1',
      remoteUrl: csvUrl(FALL_2025_BASE, '1208158980'),
      columns: TQE_COLUMNS,
    },
    'tqe-2': {
      title: 'TQE 2 — Purunsol [Lake/Mountain] (R/R)',
      strategy: 'local-first',
      localArchiveFile: 'tqe-2',
      remoteUrl: csvUrl(FALL_2025_BASE, '1521728872'),
      columns: TQE_COLUMNS,
    },
    'tqe-3': {
      title: 'TQE 3 — St Andrews (L/L)',
      strategy: 'local-first',
      localArchiveFile: 'tqe-3',
      remoteUrl: csvUrl(FALL_2025_BASE, '1845609019'),
      columns: TQE_COLUMNS,
    },
    'tqe-4': {
      title: 'TQE 4 — Tani CC (R/R)',
      strategy: 'local-first',
      localArchiveFile: 'tqe-4',
      remoteUrl: csvUrl(FALL_2025_BASE, '1340015654'),
      columns: TQE_COLUMNS,
    },
    'tqe-5': {
      title: 'TQE 5 — Ariji CC (L/L)',
      strategy: 'local-first',
      localArchiveFile: 'tqe-5',
      remoteUrl: csvUrl(FALL_2025_BASE, '1087142582'),
      columns: TQE_COLUMNS,
    },
    'tqe-6': {
      title: 'TQE 6 — Sophia Green (R/R)',
      strategy: 'local-first',
      localArchiveFile: 'tqe-6',
      remoteUrl: csvUrl(FALL_2025_BASE, '1087206475'),
      columns: TQE_COLUMNS,
    },
    'tqe-7': {
      title: 'TQE 7 — Phoenix Resort [Phoenix] (L/L)',
      strategy: 'local-first',
      localArchiveFile: 'tqe-7',
      remoteUrl: csvUrl(FALL_2025_BASE, '639052434'),
      columns: TQE_COLUMNS,
    },
    eclectic: {
      title: 'Eclectic Leaderboard',
      strategy: 'local-first',
      localArchiveFile: 'eclectic',
      remoteUrl: csvUrl(FALL_2025_BASE, '1602664288'),
    },
  },
  'spring-2026': {
    oom: {
      title: 'OOM Table',
      strategy: 'remote-first',
      localArchiveFile: 'oom',
      remoteUrl: csvUrl(SPRING_2026_BASE, '1778336569'),
      oomMeta: SPRING_2026_OOM_META,
    },
    'tqe-1': {
      title: 'TQE 1 — Mauna Ocean Resort (Mauna/Ocean)',
      strategy: 'remote-first',
      localArchiveFile: 'tqe-1',
      remoteUrl: csvUrl(SPRING_2026_BASE, '1208158980'),
      columns: TQE_COLUMNS,
      oomMeta: SPRING_2026_OOM_META,
    },
    'tqe-2': {
      title: 'TQE 2 — Turnberry Ailsa',
      strategy: 'remote-first',
      localArchiveFile: 'tqe-2',
      remoteUrl: csvUrl(SPRING_2026_BASE, '1521728872'),
      columns: TQE_COLUMNS,
      oomMeta: SPRING_2026_OOM_META,
    },
    'tqe-3': {
      title: 'TQE 3',
      strategy: 'remote-first',
      localArchiveFile: 'tqe-3',
      remoteUrl: csvUrl(SPRING_2026_BASE, '1845609019'),
      columns: TQE_COLUMNS,
      oomMeta: SPRING_2026_OOM_META,
    },
  },
}

// Centralized API key map for /api/sheet?k=...
export const SHEET_KEY_TO_URL: Record<string, string> = {
  OOM: csvUrl(FALL_2025_BASE, '1778336569'),
  TQE1: csvUrl(FALL_2025_BASE, '1208158980'),
  TQE2: csvUrl(FALL_2025_BASE, '1521728872'),
  TQE3: csvUrl(FALL_2025_BASE, '1845609019'),
  TQE4: csvUrl(FALL_2025_BASE, '1340015654'),
  TQE5: csvUrl(FALL_2025_BASE, '1087142582'),
  TQE6: csvUrl(FALL_2025_BASE, '1087206475'),
  TQE7: csvUrl(FALL_2025_BASE, '639052434'),
  ECLECTIC: csvUrl(FALL_2025_BASE, '1602664288'),
  S26_OOM: csvUrl(SPRING_2026_BASE, '1778336569'),
  S26_TQE1: csvUrl(SPRING_2026_BASE, '1208158980'),
  S26_TQE2: csvUrl(SPRING_2026_BASE, '1521728872'),
  S26_TQE3: csvUrl(SPRING_2026_BASE, '1845609019'),
}
