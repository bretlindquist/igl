'use client'

import React from 'react'
import type { OomSeasonMeta } from '@/config/views'
import { formatDeadlineDMY } from './table/oom'
import { toCSV } from './table/csv'
import { useCsvTable } from './table/useCsvTable'
import TableDesktop from './table/TableDesktop'
import TableMobile from './table/TableMobile'

const TABLE_HEIGHT_KEY = 'igg-table-height-lock-v2'
let sessionTableHeightLock: number | null = null

function getInitialTableHeightLock(): number {
  if (sessionTableHeightLock != null) return sessionTableHeightLock
  if (typeof window === 'undefined') return 1160
  const raw = window.sessionStorage.getItem(TABLE_HEIGHT_KEY)
  const parsed = raw ? Number.parseInt(raw, 10) : Number.NaN
  if (Number.isFinite(parsed) && parsed > 300) {
    sessionTableHeightLock = parsed
    return parsed
  }
  return 1160
}

export default function ResponsiveOOMViewer(props: {
  csvUrl: string
  fallbackCsvUrl?: string
  oomPreset?: boolean
  columns?: string[]
  oomMeta?: OomSeasonMeta
  prefetchSources?: { csvUrl: string; fallbackCsvUrl?: string }[]
}) {
  const { csvUrl, fallbackCsvUrl, columns, oomPreset, oomMeta, prefetchSources } = props

  const {
    headers,
    loading,
    error,
    query,
    setQuery,
    sortKey,
    sortDir,
    setSort,
    setPage,
    hiddenCols,
    toggleCol,
    numericColumns,
    selectedRowKeys,
    toggleSelectedRow,
    sorted,
    pageRows,
  } = useCsvTable({ csvUrl, fallbackCsvUrl, columns, oomPreset, oomMeta, prefetchSources })

  function exportVisibleCSV() {
    const hdr = headers.filter(h => !hiddenCols.has(h))
    const data = [hdr, ...sorted.map(r => hdr.map(h => r[h]))]
    const csv = toCSV(data)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'export.csv'
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  const showInitialSkeleton = headers.length === 0 && !error
  const showSwitchVeil = false
  const tableFrameRef = React.useRef<HTMLElement | null>(null)
  const [stableTableMinHeight, setStableTableMinHeight] = React.useState<number>(() => getInitialTableHeightLock())

  React.useEffect(() => {
    if (loading || headers.length === 0) return

    const el = tableFrameRef.current
    if (!el) return

    const h = Math.round(el.getBoundingClientRect().height)
    if (!Number.isFinite(h) || h < 300) return

    const prev = sessionTableHeightLock ?? stableTableMinHeight
    const next = Math.max(prev, h)
    if (next <= prev) return

    sessionTableHeightLock = next
    setStableTableMinHeight(next)
    try {
      window.sessionStorage.setItem(TABLE_HEIGHT_KEY, String(next))
    } catch {
      // no-op: storage may be unavailable in private mode
    }
  }, [loading, headers.length, pageRows.length])

  return (
    <div className="space-y-4">
      {error ? <div className="text-red-600 text-sm">{error}</div> : null}
      <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
        <div className="w-full md:flex-1 md:min-w-[560px] lg:min-w-[680px] xl:min-w-[760px]">
          <label htmlFor="table-search" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
            Search players or values
          </label>
          <div className="relative">
            <input
              id="table-search"
              className="border rounded-lg px-3 pr-10 py-2 w-full bg-white text-slate-900 border-slate-300 placeholder-slate-400 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500"
              placeholder="Search… use commas for multiple (e.g., Joe, Robert)"
              value={query}
              onChange={e => {
                setQuery(e.target.value)
                setPage(1)
              }}
              aria-describedby="table-search-help"
            />
            {query ? (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setQuery('')
                  setPage(1)
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center h-7 w-7 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500"
              >
                <span className="text-lg leading-none">&times;</span>
              </button>
            ) : null}
          </div>
          <p id="table-search-help" className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Tip: separate terms with commas, for example `Joe, Robert`.
          </p>
          {loading && !showInitialSkeleton ? (
            <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300" aria-live="polite">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse motion-reduce:animate-none" />
              Updating table…
            </div>
          ) : null}
        </div>

      </div>

      <section
        ref={tableFrameRef}
        className="relative space-y-4"
        style={{ minHeight: `${stableTableMinHeight}px` }}
      >
        {showInitialSkeleton ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900" aria-live="polite" aria-busy="true">
            <div className="mb-3 h-8 w-56 rounded-lg bg-slate-200/90 skeleton-shimmer dark:bg-slate-700/80" />
            <div className="space-y-2">
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="h-8 rounded-md bg-slate-100/95 skeleton-shimmer dark:bg-slate-800/80" />
              ))}
            </div>
          </div>
        ) : null}

        <div className="opacity-100">
          <TableDesktop
          headers={headers}
          hiddenCols={hiddenCols}
          numericColumns={numericColumns}
          pageRows={pageRows}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={setSort}
          oomMeta={oomMeta}
          oomPreset={oomPreset}
        />

          <TableMobile
            headers={headers}
            hiddenCols={hiddenCols}
            pageRows={pageRows}
            sortKey={sortKey}
            sortDir={sortDir}
            selectedRowKeys={selectedRowKeys}
            onSort={setSort}
            onToggleRow={toggleSelectedRow}
            oomMeta={oomMeta}
            oomPreset={oomPreset}
          />
        </div>

        {showSwitchVeil ? (
          <div
            className="pointer-events-none absolute inset-0 z-30 rounded-2xl bg-[color:var(--background)]/45 backdrop-blur-[0.8px] transition-opacity duration-200 ease-in-out motion-reduce:transition-none"
            aria-hidden="true"
          />
        ) : null}

      {headers.length > 0 ? (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <details className="rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
              <summary className="cursor-pointer select-none text-sm font-medium text-slate-700 dark:text-slate-200 focus-visible:outline-none">
                Columns ({headers.length - hiddenCols.size}/{headers.length} shown)
              </summary>
              <div className="mt-3 flex flex-wrap gap-2">
                {headers.map(h => (
                  <label key={h} className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1 text-sm dark:border-slate-700 dark:bg-slate-900">
                    <input type="checkbox" checked={!hiddenCols.has(h)} onChange={() => toggleCol(h)} className="h-4 w-4 accent-emerald-600" />
                    <span>{h}</span>
                  </label>
                ))}
              </div>
            </details>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600 dark:text-slate-400">Showing all {sorted.length} rows</span>
            <button
              className="px-3 py-1 rounded-lg border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500"
              onClick={exportVisibleCSV}
            >
              Export
            </button>
          </div>
        </div>
      ) : null}
      </section>

      {(oomMeta?.deadlines?.length ?? 0) > 0 ? (
        <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-8 rounded-full border border-neutral-300 grid place-items-center dark:border-slate-700">
              <span className="text-sm font-serif">⛳️</span>
            </div>
            <div className="font-serif text-lg tracking-tight">Entry Deadlines</div>
          </div>
          <div className="text-neutral-500 dark:text-slate-400 text-sm mb-3">Please submit your scores by the dates below.</div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-1 gap-x-6">
            {oomMeta?.deadlines.map((d, i) => (
              <li key={i} className="text-[0.95rem] border-b border-slate-200 pb-2 last:border-b-0 dark:border-slate-700">
                <div>{d.course}</div>
                <div className="text-neutral-500 dark:text-slate-400">Deadline {formatDeadlineDMY(d.iso)}</div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
