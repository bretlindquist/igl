'use client'

import { VIEWS, DEFAULT_VIEW } from '@/config/views'
import ResponsiveOOMViewer from '@/components/ResponsiveOOMViewer'
import ViewSelector from '@/components/ViewSelector'

export default function Page() {
  const def = VIEWS[DEFAULT_VIEW]
  const isOom = !def.columns

  return (
    <main className="p-4 md:p-8">
      {/* Full-width for OOM; normal centered for others */}
      <div className={isOom ? 'w-full max-w-none space-y-6' : 'max-w-6xl mx-auto space-y-6'}>
        <h1 className="text-2xl md:text-4xl font-semibold tracking-tight">{def.title}</h1>
        <ViewSelector />
        <ResponsiveOOMViewer
          csvUrl={def.csv}
          oomPreset={isOom}
          columns={def.columns}
        />
      </div>
    </main>
  )
}

