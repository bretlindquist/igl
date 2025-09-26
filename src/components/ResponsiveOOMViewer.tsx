'use client'
import React, { useEffect, useMemo, useState } from 'react'

/* ---------- CSV helpers ---------- */
function parseCSV(csv: string): string[][] {
  const rows: string[][] = []
  let i = 0, cur = '', inQuotes = false, row: string[] = []
  while (i < csv.length) {
    const ch = csv[i]
    if (ch === '"') {
      if (inQuotes && csv[i + 1] === '"') { cur += '"'; i++ } else { inQuotes = !inQuotes }
    } else if (ch === ',' && !inQuotes) {
      row.push(cur); cur = ''
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (cur.length || row.length) { row.push(cur); rows.push(row); row = []; cur = '' }
      if (ch === '\r' && csv[i + 1] === '\n') i++
    } else {
      cur += ch
    }
    i++
  }
  if (cur.length || row.length) { row.push(cur); rows.push(row) }
  return rows.filter(r => r.some(c => String(c).trim().length))
}

/** Robust header inference: skips single-cell title rows, prefers real header row (TQE-safe) */
function deriveHeaders(matrix: string[][]): { headers: string[]; dataStart: number } {
  let start = 0
  while (start < matrix.length && matrix[start].every(c => !String(c).trim())) start++
  if (start >= matrix.length) return { headers: [], dataStart: matrix.length }

  // Skip a single-cell course-title row like "1. Mission Hills Norman,,,,"
  const first = matrix[start].map(c => String(c).trim())
  if (first.filter(Boolean).length === 1 && (matrix[start + 1] ?? []).some(c => String(c).trim())) {
    start++
  }

  const r1 = (matrix[start] || []).map(c => String(c).trim())
  const r2 = (matrix[start + 1] || []).map(c => String(c).trim())

  const HEADER_HINT = /(screen|name|course|total|points|rank|appr|bonus)/i
  const hasHeaderHints = (row: string[]) => row.some(c => HEADER_HINT.test(c))
  const alphaRatio = (row: string[]) => {
    const cells = row.filter(Boolean)
    if (!cells.length) return 0
    const alpha = cells.filter(c => /[A-Za-z가-힣]/.test(c)).length
    return alpha / cells.length
  }

  let headers: string[]
  let dataStart: number
  const r1LooksLikeHeader = hasHeaderHints(r1) || alphaRatio(r1) >= 0.4
  const r2LooksLikeHeader = hasHeaderHints(r2) || alphaRatio(r2) >= 0.6

  if (r1LooksLikeHeader && !r2LooksLikeHeader) {
    headers = r1
    dataStart = start + 1
  } else if (!r1LooksLikeHeader && r2LooksLikeHeader) {
    headers = r2
    dataStart = start + 2
  } else {
    // tie-break: prefer r1 unless very sparse
    const r1NonEmpty = r1.filter(Boolean).length
    const r2NonEmpty = r2.filter(Boolean).length
    if (r1NonEmpty >= Math.floor(0.6 * Math.max(r1.length, r2.length))) {
      headers = r1
      dataStart = start + 1
    } else {
      headers = r2NonEmpty ? r2 : r1
      dataStart = r2NonEmpty ? start + 2 : start + 1
    }
  }

  headers = headers.map((c, i) => c || `Column ${i + 1}`)
  const seen = new Map<string, number>()
  headers = headers.map(h => {
    const n = (seen.get(h) || 0) + 1
    seen.set(h, n)
    return n > 1 ? `${h} (${n})` : h
  })

  return { headers, dataStart }
}

function toCSV(rows: (string | number)[][]): string {
  return rows
    .map(r => r.map(v => {
      const s = String(v ?? '')
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s
    }).join(','))
    .join('\n')
}

function norm(s: string): string {
  return s.toLowerCase().replace(/\s+/g, ' ').replace(/_/g, ' ').trim()
}

/* ---------- OOM preset helpers ---------- */

/** ------- OOM deadlines (static) ------- */
const OOM_DEADLINES: { iso: string; course: string }[] = [
  { iso: '2025-09-28', course: 'Mission Hills – Norman' },
  { iso: '2025-09-28', course: 'Purunsol' },
  { iso: '2025-09-28', course: 'St. Andrews' },
  { iso: '2025-10-12', course: 'Tani CC' },
  { iso: '2025-10-26', course: 'Ariji CC' },
  { iso: '2025-11-09', course: 'Sophia Green' },
  { iso: '2025-11-23', course: 'Phoenix Resort' },
]

function formatKST(iso: string): string {
  const d = new Date(iso + 'T00:00:00Z') // ensure no TZ drift
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'Asia/Seoul'
  }).format(d) + ' (KST)'
}

const OOM_COURSES: { id: string; patterns: RegExp[]; display: string }[] = [
  { id: 'tqe1', patterns: [/mission\s*hills\s*norman/i], display: 'Course 1 (TQE1) – Mission Hills Norman' },
  { id: 'tqe2', patterns: [/purunsol/i, /purun\s*sol/i], display: 'Course 2 (TQE2) – Purunsol' },
  { id: 'tqe3', patterns: [/st\.?\s*andrews/i], display: 'Course 3 (TQE3) – St Andrews' },
  { id: 'tqe4', patterns: [/tani\s*cc/i], display: 'Course 4 (TQE4) – Tani CC' },
  { id: 'tqe5', patterns: [/ariji\s*cc/i], display: 'Course 5 (TQE5) – Ariji CC' },
  { id: 'tqe6', patterns: [/soph?ia\s*green/i, /sohpia\s*green/i], display: 'Course 6 (TQE6) – Sophia Green' },
  { id: 'tqe7', patterns: [/phoenix/i], display: 'Course 7 (TQE7) – Phoenix Resort' },
]
const OOM_SUMMARY_LABELS = [
  { key: 'grandTotal', patterns: [/grand\s*total/i] },
  { key: 'appr', patterns: [/av\.?\s*points?\s*per\s*round/i, /\bappr\b/i] },
  { key: 'apprRank', patterns: [/rank.*appr/i, /rank\s*based\s*on\s*appr/i] },
]
function pickHeader(headers: string[], patterns: RegExp[]): string | null {
  for (const p of patterns) {
    const hit = headers.find(h => p.test(h))
    if (hit) return hit
  }
  return null
}
function buildOomHeaderOrder(headers: string[]): string[] {
  const out: string[] = []
  const screenName =
    pickHeader(headers, [/^screen\s*_?\s*name$/i, /^screen\s*name$/i, /^nickname$/i, /^name$/i]) ??
    (headers.includes('screen_name') ? 'screen_name' : headers[0])

  if (headers.includes(screenName)) out.push(screenName)
  for (const c of OOM_COURSES) {
    const h = pickHeader(headers, c.patterns)
    if (h) out.push(h)
  }
  for (const s of OOM_SUMMARY_LABELS) {
    const h = pickHeader(headers, s.patterns)
    if (h) out.push(h)
  }
  if (headers.includes(screenName)) out.push(screenName)

  const seen = new Set<string>()
  return out.filter(h => !seen.has(h) && seen.add(h))
}
function extractDeadlines(matrix: string[][]): string[] {
  const lines: string[] = []
  for (let i = Math.max(0, matrix.length - 40); i < matrix.length; i++) {
    const row = matrix[i].map(c => String(c).trim()).filter(Boolean)
    if (!row.length) continue
    const joined = row.join(' ')
    const hasKeyword = /deadline|due\s*date|due\s*by/i.test(joined)
    const mentionsCourse = OOM_COURSES.some(c => c.patterns.some(p => p.test(joined)))
    const looksLikeDate =
      /\b(20\d{2}|19\d{2})[-/\.](0?[1-9]|1[0-2])[-/\.](0?[1-9]|[12]\d|3[01])\b/i.test(joined) ||
      /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b/i.test(joined)
    if (hasKeyword || (mentionsCourse && looksLikeDate)) lines.push(joined)
  }
  const uniq: string[] = []
  const seen = new Set<string>()
  for (const s of lines) {
    const k = s.toLowerCase().replace(/\s+/g, ' ').trim()
    if (!seen.has(k)) { seen.add(k); uniq.push(s) }
  }
  return uniq
}

/* ---------- Component ---------- */
type Row = Record<string, string>

export default function ResponsiveOOMViewer(props: {
  csvUrl: string
  /** Use for OOM only: special column order + deadline footer */
  oomPreset?: boolean
  /** For non-OOM views (e.g., TQE): keep only these columns (order preserved). */
  columns?: string[]
}) {
  const { csvUrl, columns, oomPreset } = props

  const [rows, setRows] = useState<Row[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState('')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [pageSize, setPageSize] = useState<number | 'all'>('all')
  const [page, setPage] = useState(1)
  const [hiddenCols, setHiddenCols] = useState<Set<string>>(new Set())
  const [deadlines, setDeadlines] = useState<string[]>([])

  useEffect(() => {
    async function load() {
      if (!csvUrl) { setError('Missing CSV URL for this view'); return }
      setLoading(true); setError('')
      try {
        const res = await fetch(csvUrl)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const text = await res.text()
        const matrix = parseCSV(text)
        if (!matrix.length) return

        const { headers: hdr, dataStart } = deriveHeaders(matrix)
        const body = matrix.slice(dataStart)

        const data: Row[] = body.map(r => {
          const o: Row = {}
          for (let i = 0; i < hdr.length; i++) o[hdr[i]] = String(r[i] ?? '')
          return o
        })

        const dl = oomPreset ? extractDeadlines(matrix) : []
        setDeadlines(dl)

        const keepMask = hdr.map(h => data.some(r => String(r[h]).trim().length > 0))
        let finalHeaders = hdr.filter((_, i) => keepMask[i])
        let finalRows = data.map(r => {
          const o: Row = {}
          finalHeaders.forEach(h => { o[h] = r[h] })
          return o
        })

        if (oomPreset) {
          const ordered = buildOomHeaderOrder(finalHeaders)
          if (ordered.length) {
            finalHeaders = ordered
            finalRows = finalRows.map(r => {
              const o: Row = {}
              finalHeaders.forEach(h => { o[h] = r[h] })
              return o
            })
          }
        } else if (columns && columns.length) {
          const map = new Map(finalHeaders.map(h => [norm(h), h]))
          const ordered: string[] = []
          for (const wanted of columns) {
            const match = map.get(norm(wanted))
            if (match) ordered.push(match)
          }
          if (ordered.length) {
            finalHeaders = ordered
            finalRows = finalRows.map(r => {
              const o: Row = {}
              finalHeaders.forEach(h => { o[h] = r[h] })
              return o
            })
          }
        }

        setHeaders(finalHeaders)
        setRows(finalRows)
        setPage(1)
        setPageSize('all')
      } catch (e) {
        if (e instanceof Error) setError(e.message)
        else setError('Failed to fetch CSV')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [csvUrl, columns, oomPreset])

  /* ---------- Filtering (unlimited comma-separated names) ---------- */
  const filtered = useMemo(() => {
    if (!rows.length) return rows

    const visibleHeaders = headers.filter(h => !hiddenCols.has(h))
    const nameHeader = visibleHeaders.find(h => /screen\s*_?\s*name/i.test(h)) ?? visibleHeaders[0]

    const raw = query.trim()
    if (!raw) return rows

    const terms = raw
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)
      .map(t => t.toLowerCase())

    if (terms.length >= 2) {
      return rows.filter(r => {
        const hayName = String(r[nameHeader] ?? '').toLowerCase()
        if (nameHeader) return terms.some(t => hayName.includes(t))
        return terms.some(t =>
          visibleHeaders.some(h => String(r[h] ?? '').toLowerCase().includes(t))
        )
      })
    }

    const t = terms[0]
    return rows.filter(r =>
      visibleHeaders.some(h => String(r[h] ?? '').toLowerCase().includes(t))
    )
  }, [rows, query, headers, hiddenCols])

  /* ---------- Sorting & paging ---------- */
  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    const copy = [...filtered]
    copy.sort((a, b) => {
      const A = a[sortKey]; const B = b[sortKey]
      const nA = parseFloat(String(A).replace(/[^0-9.-]/g, ''))
      const nB = parseFloat(String(B).replace(/[^0-9.-]/g, ''))
      const bothNums = !Number.isNaN(nA) && !Number.isNaN(nB)
      if (bothNums) return sortDir === 'asc' ? nA - nB : nB - nA
      return sortDir === 'asc' ? String(A).localeCompare(String(B)) : String(B).localeCompare(String(A))
    })
    return copy
  }, [filtered, sortKey, sortDir])

  const totalPages = pageSize === 'all' ? 1 : Math.max(1, Math.ceil(sorted.length / pageSize))
  const pageRows = useMemo(() => {
    if (pageSize === 'all') return sorted
    const start = (page - 1) * pageSize
    return sorted.slice(start, start + pageSize)
  }, [sorted, page, pageSize])

  function toggleCol(h: string) {
    const next = new Set(hiddenCols)
    if (next.has(h)) next.delete(h)
    else next.add(h)
    setHiddenCols(next)
  }

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

  return (
    <div className="space-y-4">
      {error ? <div className="text-red-600 text-sm">{error}</div> : null}
      {loading ? <div className="text-slate-600 text-sm">Loading…</div> : null}

      {/* Controls: search (with clear ×) + page size */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
	<div className="relative w-full md:flex-1 md:min-w-[560px] lg:min-w-[680px] xl:min-w-[760px]">
  	    <input
   	      className="border rounded-lg px-3 pr-10 py-2 w-full
        		 bg-white text-slate-900 border-slate-300 placeholder-slate-400
               		 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700 dark:placeholder-slate-500
                	 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600"        
            placeholder="Search… use commas for multiple (e.g., Joe, Robert)"
            value={query}
            onChange={e => { setQuery(e.target.value); setPage(1) }}
            aria-label="Search players or values"
          />
          {query ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => { setQuery(''); setPage(1) }}
              className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center h-7 w-7
                 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100
                 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800
                 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600"
              >
              <span className="text-lg leading-none">&times;</span>
            </button>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500 dark:text-slate-400">Rows per page</span>
	  <select
   	    className="border rounded-lg px-2 py-2 bg-white text-slate-900 border-slate-300
                       dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700"
            value={pageSize === 'all' ? 'all' : String(pageSize)}
            onChange={e => {
              const v = e.target.value === 'all' ? 'all' : Number(e.target.value)
              setPageSize(v); setPage(1)
            }}
            aria-label="Rows per page"
          >
            <option value="all">All</option>
            {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      {/* Desktop table (sticky name col + row hover + ghost-bold) */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200 shadow-sm
                dark:border-slate-700">
        <table className="min-w-full text-sm">
           <thead className="bg-slate-100 sticky top-0 z-30 dark:bg-slate-800">
  <tr>
    {(() => {
      const visibleHeaders = headers.filter(h => !hiddenCols.has(h))
      const nameIdx = (() => {
        const i = visibleHeaders.findIndex(x => /screen\s*_?\s*name/i.test(x))
        return i >= 0 ? i : 0
      })()

      return visibleHeaders.map((h, colIdx) => {
        const stickyClasses =
          colIdx === nameIdx
            ? 'sticky left-0 z-40 bg-slate-100 border-r border-slate-200 dark:bg-slate-800 dark:border-slate-700'
            : ''
        return (
          <th
            key={h}
            className={`px-4 py-3 text-left font-semibold whitespace-nowrap ${stickyClasses}`}
          >
            <button
              onClick={() => {
                if (sortKey === h) setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
                else { setSortKey(h); setSortDir('asc') }
              }}
              className="inline-flex items-center gap-1"
            >
              {h}
              {sortKey === h ? <span>{sortDir === 'asc' ? '▲' : '▼'}</span> : null}
            </button>
          </th>
        )
      })
    })()}
  </tr>
</thead>

          <tbody>
  {(() => {
    const visibleHeaders = headers.filter(h => !hiddenCols.has(h))
    const nameColIdx = (() => {
      const i = visibleHeaders.findIndex(h => /screen\s*_?\s*name/i.test(h))
      return i >= 0 ? i : 0
    })()

    return pageRows.map((r, rowIdx) => (
      <tr
        key={rowIdx}
        className="group odd:bg-white even:bg-slate-50 hover:bg-slate-100 transition-colors
                   dark:odd:bg-slate-900 dark:even:bg-slate-950 dark:hover:bg-slate-800"
      >
        {visibleHeaders.map((h, colIdx) => {
          const value = String(r[h] ?? '')
          const isName = colIdx === nameColIdx
          const rowBg =
            rowIdx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-950'
          const hoverBg = 'group-hover:bg-slate-100 dark:group-hover:bg-slate-800'
          return (
            <td
              key={h}
              className={[
                'px-4 py-3 whitespace-nowrap',
                isName
                  ? `sticky left-0 z-20 ${rowBg} ${hoverBg} border-r border-slate-200 dark:border-slate-700`
                  : '',
              ].join(' ')}
            >
              {isName ? (
                <span className="inline-grid">
                  {/* reserve width so bold-on-hover doesn't shift layout */}
                  <span className="font-semibold invisible">{value}</span>
                  <span className="col-start-1 row-start-1 group-hover:font-semibold">
                    {value}
                  </span>
                </span>
              ) : (
                value
              )}
            </td>
          )
        })}
      </tr>
    ))
  })()}
</tbody>
        </table>
      </div>

     {/* Mobile cards */}
<div className="md:hidden grid grid-cols-1 gap-3">
  {pageRows.map((r, idx) => (
    <div
      key={idx}
      className="border rounded-2xl border-slate-200 bg-white shadow-sm p-4
                 dark:border-slate-700 dark:bg-slate-900"
    >
      <div className="grid grid-cols-2 gap-y-2 gap-x-4">
        {headers.filter(h => !hiddenCols.has(h)).map(h => (
          <React.Fragment key={h}>
            <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {h}
            </div>
            <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {String(r[h] ?? '')}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  ))}
</div>

{/* Column visibility & pagination */}
{headers.length > 0 ? (
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
    <div className="flex flex-wrap gap-2">
      {headers.map(h => (
        <button
          key={h}
          onClick={() => toggleCol(h)}
          className={`px-3 py-1 rounded-full border ${
            hiddenCols.has(h)
              ? 'bg-slate-200 border-slate-300 dark:bg-slate-800 dark:border-slate-700'
              : 'bg-white border-slate-300 dark:bg-slate-900 dark:border-slate-700'
          }`}
        >
          {hiddenCols.has(h) ? `Show: ${h}` : `Hide: ${h}`}
        </button>
      ))}
    </div>
    <div className="flex items-center gap-2">
      {pageSize !== 'all' ? (
        <>
          <button
            className="px-3 py-1 rounded-lg border border-slate-300 bg-white
                       dark:border-slate-700 dark:bg-slate-900"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Prev
          </button>
          <span className="text-sm text-slate-600 dark:text-slate-400">
            Page {page} / {totalPages}
          </span>
          <button
            className="px-3 py-1 rounded-lg border border-slate-300 bg-white
                       dark:border-slate-700 dark:bg-slate-900"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </>
      ) : (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          Showing all {sorted.length} rows
        </span>
      )}
      <button
        className="px-3 py-1 rounded-lg border border-slate-300 bg-white
                   dark:border-slate-700 dark:bg-slate-900"
        onClick={exportVisibleCSV}
      >
        Export
      </button>
    </div>
  </div>
) : null}

      {/* Deadline notice (OOM only, static list) */}
      {oomPreset ? (
        <div
          className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm
                     dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className="h-8 w-8 rounded-full border border-neutral-300 grid place-items-center
                         dark:border-slate-700"
            >
              <span className="text-sm font-serif">⛳️</span>
            </div>
            <div className="font-serif text-lg tracking-tight">Entry Deadlines</div>
          </div>
          <div className="text-neutral-500 dark:text-slate-400 text-sm mb-3">
            Please submit your scores by the dates below.
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-1 gap-x-6">
            {OOM_DEADLINES.map((d, i) => (
              <li key={i} className="text-[0.95rem]">
                {formatKST(d.iso)} — {d.course}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* end .space-y-4 wrapper */}
    </div>
  )
}
 
