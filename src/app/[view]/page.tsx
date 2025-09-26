'use client'
import { VIEWS, type ViewId } from '@/config/views'
import ResponsiveOOMViewer from '@/components/ResponsiveOOMViewer'
import ViewSelector from '@/components/ViewSelector'

export default function ViewPage({ params }: { params: { view: ViewId } }) {
  const id = params.view
  const def = VIEWS[id]
  const title = def?.title ?? 'Unknown View'
  const csv = def?.csv ?? ''

  return (
    <main className="p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl md:text-4xl font-semibold tracking-tight">{title}</h1>
        <ViewSelector />
        <ResponsiveOOMViewer csvUrl={csv} />
      </div>
    </main>
  )
}

