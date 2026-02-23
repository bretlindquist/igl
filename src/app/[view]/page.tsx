export const dynamic = 'force-dynamic';

import { VIEWS, type ViewId } from '@/config/views'
import ResponsiveOOMViewer from '@/components/ResponsiveOOMViewer'
import ViewSelector from '@/components/ViewSelector'

export default async function ViewPage({ params }: { params: Promise<{ view: ViewId }> }) {
  const { view } = await params
  const def = VIEWS[view]
  return (
    <main className="page-shell">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl md:text-4xl font-semibold tracking-tight">{def?.title ?? 'Unknown View'}</h1>
        <ViewSelector />
        <ResponsiveOOMViewer csvUrl={def?.csv ?? ''} columns={def?.columns} />
      </div>
    </main>
  )
}
