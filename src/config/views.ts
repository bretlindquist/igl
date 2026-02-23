import {
  SEASON_VIEW_SOURCES,
  type OomSeasonMeta,
  type SeasonId,
  type ViewId,
} from './data-sources'

export type { SeasonId, ViewId, OomSeasonMeta }

export type ViewDef = {
  title: string
  csv: string
  fallbackCsv?: string
  columns?: string[]
  oomMeta?: OomSeasonMeta
}

const DEFAULT_SEASON: SeasonId = 'spring-2026'

function archiveCsv(season: SeasonId, file: string): string {
  return `/archive/${season}/${file}.csv`
}

function toViewDef(season: SeasonId, src: NonNullable<(typeof SEASON_VIEW_SOURCES)[SeasonId][ViewId]>): ViewDef {
  const local = archiveCsv(season, src.localArchiveFile)
  const csv = src.strategy === 'local-first' ? local : src.remoteUrl
  const fallbackCsv = src.strategy === 'local-first' ? src.remoteUrl : local

  return {
    title: src.title,
    csv,
    fallbackCsv,
    columns: src.columns,
    oomMeta: src.oomMeta,
  }
}

function buildViews(season: SeasonId): Partial<Record<ViewId, ViewDef>> {
  const out: Partial<Record<ViewId, ViewDef>> = {}
  const byView = SEASON_VIEW_SOURCES[season]
  const ids = Object.keys(byView) as ViewId[]
  for (const id of ids) {
    const src = byView[id]
    if (!src) continue
    out[id] = toViewDef(season, src)
  }
  return out
}

const SEASON_LABELS: Record<SeasonId, string> = {
  'fall-2025': 'Fall 2025',
  'spring-2026': 'Spring 2026',
}

export function normalizeSeason(input?: string | null): SeasonId {
  if (input === 'spring-2026') return 'spring-2026'
  if (input === 'fall-2025') return 'fall-2025'
  return DEFAULT_SEASON
}

export function getSeasonLabel(season: SeasonId): string {
  return SEASON_LABELS[season]
}

export function getViews(season: SeasonId): Partial<Record<ViewId, ViewDef>> {
  return buildViews(season)
}

export function getAvailableViews(season: SeasonId): ViewId[] {
  return Object.keys(SEASON_VIEW_SOURCES[season]) as ViewId[]
}

export const DEFAULT_VIEW: ViewId = 'oom'
