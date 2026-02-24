export const dynamic = 'force-dynamic';

import { DEFAULT_VIEW, getAvailableViews, getSeasonLabel, getViews, normalizeSeason } from '@/config/views'
import ResponsiveOOMViewer from '@/components/ResponsiveOOMViewer'
import ViewSelector from '@/components/ViewSelector'

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ season?: string }>
}) {
  const { season: rawSeason } = await searchParams
  const season = normalizeSeason(rawSeason)
  const views = getViews(season)
  const def = views[DEFAULT_VIEW]
  const prefetchSources = Object.values(views)
    .filter((v): v is NonNullable<typeof v> => Boolean(v))
    .map(v => ({ csvUrl: v.csv, fallbackCsvUrl: v.fallbackCsv }))
  if (!def) return null
  const isOom = !def.columns

  return (
    <main className="page-shell">
      {/* Full-width for OOM; normal centered for others */}
      <div className={isOom ? 'w-full max-w-none space-y-6' : 'max-w-6xl mx-auto space-y-6'}>
        <ViewSelector
          season={season}
          seasonLabel={getSeasonLabel(season)}
          availableViews={getAvailableViews(season)}
        />
        <ResponsiveOOMViewer
          csvUrl={def.csv}
          fallbackCsvUrl={def.fallbackCsv}
          oomPreset={isOom}
          columns={def.columns}
          oomMeta={def.oomMeta}
          prefetchSources={prefetchSources}
        />
      </div>
    </main>
  )
}
