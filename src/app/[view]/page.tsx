export const dynamic = 'force-dynamic';

import { getAvailableViews, getSeasonLabel, getViews, normalizeSeason, type ViewId } from '@/config/views'
import ResponsiveOOMViewer from '@/components/ResponsiveOOMViewer'
import ViewSelector from '@/components/ViewSelector'

export default async function ViewPage({
  params,
  searchParams,
}: {
  params: Promise<{ view: ViewId }>
  searchParams: Promise<{ season?: string }>
}) {
  const { view } = await params
  const { season: rawSeason } = await searchParams
  const season = normalizeSeason(rawSeason)
  const views = getViews(season)
  const def = views[view] ?? views.oom
  return (
    <main className="page-shell">
      <div className="max-w-6xl mx-auto space-y-6">
        <ViewSelector
          season={season}
          seasonLabel={getSeasonLabel(season)}
          availableViews={getAvailableViews(season)}
        />
        <ResponsiveOOMViewer
          csvUrl={def?.csv ?? ''}
          fallbackCsvUrl={def?.fallbackCsv}
          oomPreset={!def?.columns}
          columns={def?.columns}
          oomMeta={def?.oomMeta}
        />
      </div>
    </main>
  )
}
