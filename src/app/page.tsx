'use client'
import { VIEWS, DEFAULT_VIEW } from '@/config/views'
import ResponsiveOOMViewer from '@/components/ResponsiveOOMViewer'
import ViewSelector from '@/components/ViewSelector'

export default function Page() {
  const def = VIEWS[DEFAULT_VIEW]
  return (
    <main className="p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl md:text-4xl font-semibold tracking-tight">{def.title}</h1>
        <p className="text-slate-600">Switch between OOM and each TQE round. Fully responsive with search, sort, pagination, column toggles, and export.</p>
        <ViewSelector />
        <ResponsiveOOMViewer csvUrl={def.csv} />
      </div>
    </main>
  )
}

