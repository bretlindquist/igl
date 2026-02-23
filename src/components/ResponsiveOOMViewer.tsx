'use client'
import React, { useEffect, useMemo, useRef, useState } from 'react'

/* ---------- URL helper: route through our API & add cache-buster ---------- */
function toProxiedCsvUrl(original: string): string {
  // Route through our API using the full source URL so sheet id + gid are preserved.
  try {
    const u = new URL(original, typeof window !== 'undefined' ? window.location.origin : 'http://localhost')
    return `/api/sheet?src=${encodeURIComponent(u.toString())}&cb=${Date.now()}`
  } catch {
    // If original isn't a fully-qualified URL, just pass through (no proxy)
    return original
  }
}

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

/** Infer header row, skip single-cell title lines, TQE-safe */
function deriveHeaders(matrix: string[][]): { headers: string[]; dataStart: number } {
  let start = 0
  while (start < matrix.length && matrix[start].every(c => !String(c).trim())) start++
  if (start >= matrix.length) return { headers: [], dataStart: matrix.length }

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
  const r1LooksLike = hasHeaderHints(r1) || alphaRatio(r1) >= 0.4
  const r2LooksLike = hasHeaderHints(r2) || alphaRatio(r2) >= 0.6

  if (r1LooksLike && !r2LooksLike) { headers = r1; dataStart = start + 1 }
  else if (!r1LooksLike && r2LooksLike) { headers = r2; dataStart = start + 2 }
  else {
    const r1NonEmpty = r1.filter(Boolean).length
    const r2NonEmpty = r2.filter(Boolean).length
    if (r1NonEmpty >= Math.floor(0.6 * Math.max(r1.length, r2.length))) {
      headers = r1; dataStart = start + 1
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

/** Drop rows where all data cells are blank or numeric zero (ignores the name column) */
function isAllZeroOrBlank(row: Record<string, string>, headers: string[]): boolean {
  const nameIdx = headers.findIndex(h => /screen\s*_?\s*name/i.test(h))
  const skipHeader = nameIdx >= 0 ? headers[nameIdx] : headers[0]

  let sawNonNumericText = false
  for (const h of headers) {
    if (h === skipHeader) continue
    const v = String(row[h] ?? '').trim()
    if (!v) continue
    const n = Number(v.replace(/[^0-9.\-]/g, ''))
    if (!Number.isNaN(n)) {
      if (n !== 0) return false // keep row if any non-zero numeric
    } else {
      sawNonNumericText = true // textual value → keep
    }
  }
  return !sawNonNumericText
}

/** Keep only rows with a usable player name when a name-like column exists. */
function hasUsableName(row: Record<string, string>, headers: string[]): boolean {
  const nameHeader =
    headers.find(h => /^screen\s*_?\s*name$/i.test(h)) ??
    headers.find(h => /^name$/i.test(h)) ??
    headers.find(h => /^nickname$/i.test(h))

  if (!nameHeader) return true

  const raw = String(row[nameHeader] ?? '').trim()
  if (!raw) return false

  // Drop numeric-only artifacts like "22" / "9" that can appear in malformed rows.
  const normalized = raw.replace(/[,\s]/g, '')
  if (/^-?\d+(\.\d+)?$/.test(normalized)) return false

  return true
}

/* ---------- OOM helpers (unchanged aesthetics) ---------- */
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
  const d = new Date(iso + 'T00:00:00Z')
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
    const h = pickHeader(headers, c.patterns); if (h) out.push(h)
  }
  for (const s of OOM_SUMMARY_LABELS) {
    const h = pickHeader(headers, s.patterns); if (h) out.push(h)
  }
  if (headers.includes(screenName)) out.push(screenName)
  const seen = new Set<string>()
  return out.filter(h => !seen.has(h) && seen.add(h))
}

function pickDefaultSort(headers: string[]): { key: string; dir: 'asc' | 'desc' } | null {
  const candidates = [
    /final\s*points/i,
    /grand\s*total/i,
    /\btotal\b/i,
    /\bpoints?\b/i,
    /\bscore\b/i,
    /\brank\b/i,
  ]
  for (const pattern of candidates) {
    const key = headers.find(h => pattern.test(h))
    if (!key) continue
    return { key, dir: /rank/i.test(key) ? 'asc' : 'desc' }
  }
  if (!headers.length) return null
  return { key: headers[0], dir: 'asc' }
}

function getCourseNumberLabel(header: string): string | null {
  for (let i = 0; i < OOM_COURSES.length; i++) {
    const course = OOM_COURSES[i]
    if (course.patterns.some(p => p.test(header))) return String(i + 1)
  }
  return null
}

function getCourseHeaderParts(header: string): { number: string; name: string } | null {
  const courseNum = getCourseNumberLabel(header)
  if (!courseNum) return null
  const course = OOM_COURSES[Number(courseNum) - 1]
  const courseName = course
    ? course.display.replace(/^Course\s+\d+\s+\(TQE\d+\)\s+[–-]\s+/i, '')
    : header
  return { number: courseNum, name: courseName }
}

function renderStackedCourseHeader(course: { number: string; name: string }, compact = false) {
  const words = course.name.split(/\s+/).filter(Boolean)
  return (
    <span className="leading-snug text-center">
      <span className={`block font-extrabold leading-none ${compact ? 'text-[0.66rem]' : 'text-[0.72rem]'}`}>{course.number}</span>
      {words.map((word, idx) => (
        <span key={`${course.number}-${idx}`} className="compact-course-name block">
          {word}
        </span>
      ))}
    </span>
  )
}

function renderStackedHeaderText(label: string, compact = false) {
  const words = label.split(/\s+/).filter(Boolean)
  return (
    <span className="leading-snug text-center">
      {words.map((word, idx) => (
        <span key={`${label}-${idx}`} className={`block ${compact ? 'text-[0.69rem]' : ''}`}>
          {word}
        </span>
      ))}
    </span>
  )
}

function toDisplayHeader(header: string, compact: boolean): string {
  if (/^screen\s*_?\s*name$/i.test(header) || /^name$/i.test(header)) return 'Name'
  if (compact) {
    const course = getCourseHeaderParts(header)
    if (course) return `${course.number}. ${course.name}`
  }
  return header
}

/* ---------- Component ---------- */
type Row = Record<string, string>

export default function ResponsiveOOMViewer(props: {
  csvUrl: string
  oomPreset?: boolean
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
  const [selectedRowKey, setSelectedRowKey] = useState<string | null>(null)
  const lastTapRef = useRef<{ rowKey: string; time: number } | null>(null)

  useEffect(() => {
    async function load() {
      if (!csvUrl) { setError('Missing CSV URL for this view'); return }
      setLoading(true); setError('')
      try {
        const res = await fetch(toProxiedCsvUrl(csvUrl), { cache: 'no-store' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const text = await res.text()
        const matrix = parseCSV(text)
        if (!matrix.length) { setRows([]); setHeaders([]); return }

        const { headers: hdr, dataStart } = deriveHeaders(matrix)
        const body = matrix.slice(dataStart)

        // raw -> keyed rows
        const data: Row[] = body.map(r => {
          const o: Row = {}
          for (let i = 0; i < hdr.length; i++) o[hdr[i]] = String(r[i] ?? '')
          return o
        })

        // Remove columns that are completely empty across data
        // Remove columns that are entirely empty across data
const keepMask = hdr.map(h => data.some(r => String(r[h]).trim().length > 0))
let finalHeaders = hdr.filter((_, i) => keepMask[i])

// Build rows restricted to those headers
let finalRows: Row[] = data.map(r => {
  const o: Row = {}
  finalHeaders.forEach(h => { o[h] = r[h] })
  return o
})

// Drop rows that are all zeros/blanks (ignoring name-like column)
finalRows = finalRows.filter(r => !isAllZeroOrBlank(r, finalHeaders))
finalRows = finalRows.filter(r => hasUsableName(r, finalHeaders))

if (oomPreset) {
  const ordered = buildOomHeaderOrder(finalHeaders)
  if (ordered.length) {
    finalHeaders = ordered
    finalRows = finalRows.map(r => {
      const o: Row = {}
      finalHeaders.forEach(h => { o[h] = r[h] })
      return o
    })
    // Re-apply zero/blank row filter after reordering (header set changed)
    finalRows = finalRows.filter(r => !isAllZeroOrBlank(r, finalHeaders))
    finalRows = finalRows.filter(r => hasUsableName(r, finalHeaders))
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
    // Re-apply zero/blank row filter after reordering
    finalRows = finalRows.filter(r => !isAllZeroOrBlank(r, finalHeaders))
    finalRows = finalRows.filter(r => hasUsableName(r, finalHeaders))
  }
}

        setHeaders(finalHeaders)
        setRows(finalRows)
        const defaultSort = pickDefaultSort(finalHeaders)
        if (defaultSort) {
          setSortKey(defaultSort.key)
          setSortDir(defaultSort.dir)
        } else {
          setSortKey('')
          setSortDir('asc')
        }
        setPage(1)
        setPageSize('all')
        setSelectedRowKey(null)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to fetch CSV')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [csvUrl, columns, oomPreset])

  /* ---------- Filtering ---------- */
  const filtered = useMemo(() => {
    if (!rows.length) return rows
    const visibleHeaders = headers.filter(h => !hiddenCols.has(h))
    const nameHeader = visibleHeaders.find(h => /screen\s*_?\s*name/i.test(h)) ?? visibleHeaders[0]
    const raw = query.trim()
    if (!raw) return rows
    const terms = raw.split(',').map(t => t.trim()).filter(Boolean).map(t => t.toLowerCase())
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
    return rows.filter(r => visibleHeaders.some(h => String(r[h] ?? '').toLowerCase().includes(t)))
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

  const [pageSizeState, setPageSizeState] = useState<number | 'all'>('all')
  useEffect(() => { setPageSizeState(pageSize) }, [pageSize])
  const totalPages = pageSizeState === 'all' ? 1 : Math.max(1, Math.ceil(sorted.length / pageSizeState))
  const pageRows = useMemo(() => {
    if (pageSizeState === 'all') return sorted
    const start = (page - 1) * pageSizeState
    return sorted.slice(start, start + pageSizeState)
  }, [sorted, page, pageSizeState])

  const numericColumns = useMemo(() => {
    const set = new Set<string>()
    for (const h of headers) {
      const values = rows.map(r => String(r[h] ?? '').trim()).filter(Boolean)
      if (!values.length) continue
      const numericCount = values.filter(v => !Number.isNaN(parseFloat(v.replace(/[^0-9.-]/g, '')))).length
      if (numericCount / values.length >= 0.8) set.add(h)
    }
    return set
  }, [headers, rows])

  function toggleCol(h: string) {
    const next = new Set(hiddenCols)
    if (next.has(h)) next.delete(h); else next.add(h)
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

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
        <div className="w-full md:flex-1 md:min-w-[560px] lg:min-w-[680px] xl:min-w-[760px]">
          <label htmlFor="table-search" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
            Search players or values
          </label>
          <div className="relative">
            <input
              id="table-search"
              className="border rounded-lg px-3 pr-10 py-2 w-full
                         bg-white text-slate-900 border-slate-300 placeholder-slate-400
                         dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700 dark:placeholder-slate-500
                         focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600
                         focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500"
              placeholder="Search… use commas for multiple (e.g., Joe, Robert)"
              value={query}
              onChange={e => { setQuery(e.target.value); setPage(1) }}
              aria-describedby="table-search-help"
            />
            {query ? (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => { setQuery(''); setPage(1) }}
                className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center h-7 w-7
                           rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100
                           dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800
                           focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600
                           focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500"
              >
                <span className="text-lg leading-none">&times;</span>
              </button>
            ) : null}
          </div>
          <p id="table-search-help" className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Tip: separate terms with commas, for example `Joe, Robert`.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500 dark:text-slate-400">Rows per page</span>
          <select
            className="border rounded-lg px-2 py-2 bg-white text-slate-900 border-slate-300
                       dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500"
            value={pageSizeState === 'all' ? 'all' : String(pageSizeState)}
            onChange={e => {
              const v = e.target.value === 'all' ? 'all' : Number(e.target.value)
              setPageSize(v); setPageSizeState(v); setPage(1)
            }}
            aria-label="Rows per page"
          >
            <option value="all">All</option>
            {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hide-scrollbar hidden xl:block overflow-x-auto rounded-2xl border border-slate-200 shadow-sm dark:border-slate-700">
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
                  const isNumeric = numericColumns.has(h) && colIdx !== nameIdx
                  const stickyClasses =
                    colIdx === nameIdx
                      ? 'sticky left-0 z-40 bg-slate-100 border-r border-slate-200 dark:bg-slate-800 dark:border-slate-700'
                      : ''
                  return (
                    <th key={h} className={`p-0 font-semibold whitespace-normal break-words align-top ${isNumeric ? 'text-right' : 'text-left'} ${stickyClasses}`}>
                      <button
                        onClick={() => {
                          if (sortKey === h) setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
                          else { setSortKey(h); setSortDir('asc') }
                        }}
                        className={`inline-flex h-full min-h-[56px] w-full items-start gap-1 px-4 py-3 ${isNumeric ? 'justify-end text-right' : 'text-left'} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500 rounded`}
                      >
                        {(() => {
                          const course = getCourseHeaderParts(h)
                          if (!course) {
                            const label = toDisplayHeader(h, false)
                            if (/^name$/i.test(label)) return <span className="leading-snug">{label}</span>
                            return renderStackedHeaderText(label)
                          }
                          return renderStackedCourseHeader(course)
                        })()}
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
                    const rowBg = rowIdx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-950'
                    const hoverBg = 'group-hover:bg-slate-100 dark:group-hover:bg-slate-800'
                    return (
                      <td
                        key={h}
                        className={[
                          `px-4 py-3 whitespace-nowrap ${numericColumns.has(h) && !isName ? 'text-right tabular-nums' : 'text-left'}`,
                          isName ? `sticky left-0 z-20 ${rowBg} ${hoverBg} border-r border-slate-200 dark:border-slate-700` : '',
                        ].join(' ')}
                      >
                        {isName ? (
                          <span className="inline-grid">
                            <span className="font-semibold invisible">{value}</span>
                            <span className="col-start-1 row-start-1 group-hover:font-semibold">{value}</span>
                          </span>
                        ) : (value)}
                      </td>
                    )
                  })}
                </tr>
              ))
            })()}
          </tbody>
        </table>
      </div>

      {/* Mobile/tablet compact table */}
      <div className="hide-scrollbar xl:hidden overflow-x-auto rounded-2xl border border-slate-200 shadow-sm dark:border-slate-700">
        <div className="mx-auto w-max">
        <table className="w-max table-auto text-[10px]">
          <thead className="bg-slate-100 dark:bg-slate-800">
            <tr>
              {(() => {
                const visibleHeaders = headers.filter(h => !hiddenCols.has(h))
                return visibleHeaders.map((h) => (
                  <th
                    key={h}
                    className={`p-0 font-semibold ${
                      /^screen\s*_?\s*name$/i.test(h) || /^name$/i.test(h)
                        ? 'text-center align-middle whitespace-nowrap w-[7.8rem] max-w-[7.8rem]'
                      : /(grand\s*total|av\.?\s*points?\s*per\s*round|\bappr\b|rank.*appr)/i.test(h)
                          ? 'text-center align-middle min-w-[3.1rem]'
                          : 'text-center align-middle min-w-[1.9rem]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        if (sortKey === h) setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
                        else { setSortKey(h); setSortDir('asc') }
                        setPage(1)
                      }}
                      className="inline-flex h-full min-h-[74px] w-full items-center justify-center gap-1 rounded px-1 py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-emerald-500"
                    >
                      <span>
                        {(() => {
                          const course = getCourseHeaderParts(h)
                          if (!course) {
                            const label = toDisplayHeader(h, true)
                            if (/^name$/i.test(label)) return label
                            return renderStackedHeaderText(label, true)
                          }
                          return renderStackedCourseHeader(course, true)
                        })()}
                      </span>
                      {sortKey === h ? <span className="text-[0.65rem]">{sortDir === 'asc' ? '▲' : '▼'}</span> : null}
                    </button>
                  </th>
                ))
              })()}
            </tr>
          </thead>
          <tbody className="text-[11.5px]">
            {(() => {
              const visibleHeaders = headers.filter(h => !hiddenCols.has(h))
              const nameHeader =
                visibleHeaders.find(h => /^screen\s*_?\s*name$/i.test(h)) ??
                visibleHeaders.find(h => /^name$/i.test(h)) ??
                visibleHeaders[0]
              return pageRows.map((r, rowIdx) => (
                (() => {
                  const rowKey = `${String(r[nameHeader] ?? '')}__${rowIdx}`
                  const isSelected = selectedRowKey === rowKey
                  const handleRowTouch = () => {
                    const now = Date.now()
                    const last = lastTapRef.current
                    if (last && last.rowKey === rowKey && now - last.time < 320) {
                      setSelectedRowKey(rowKey)
                      lastTapRef.current = null
                      return
                    }
                    lastTapRef.current = { rowKey, time: now }
                  }
                  return (
                <tr
                  key={rowIdx}
                  className={[
                    'odd:bg-white even:bg-slate-50 dark:odd:bg-slate-900 dark:even:bg-slate-950',
                    'cursor-pointer active:bg-emerald-100 dark:active:bg-emerald-950/40',
                    isSelected ? 'ring-2 ring-emerald-500' : '',
                  ].join(' ')}
                  onTouchStart={handleRowTouch}
                  onDoubleClick={() => {
                    setSelectedRowKey(rowKey)
                  }}
                >
                  {visibleHeaders.map((h) => (
                    <td
                      key={h}
                      className={`py-0.5 ${
                        /^screen\s*_?\s*name$/i.test(h) || /^name$/i.test(h)
                          ? 'pl-1 pr-0 text-left whitespace-nowrap w-[7.8rem] max-w-[7.8rem] overflow-hidden text-ellipsis font-medium'
                          : 'px-0.5 text-center tabular-nums'
                      } ${isSelected ? 'bg-emerald-100 dark:bg-emerald-900/40' : ''}`}
                    >
                      {String(r[h] ?? '')}
                    </td>
                  ))}
                </tr>
                  )
                })()
              ))
            })()}
          </tbody>
        </table>
        </div>
      </div>

      {/* Column toggles + pagination + export */}
      {headers.length > 0 ? (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <details className="rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
              <summary className="cursor-pointer select-none text-sm font-medium text-slate-700 dark:text-slate-200 focus-visible:outline-none">
                Columns ({headers.length - hiddenCols.size}/{headers.length} shown)
              </summary>
              <div className="mt-3 flex flex-wrap gap-2">
                {headers.map(h => (
                  <label
                    key={h}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1 text-sm dark:border-slate-700 dark:bg-slate-900"
                  >
                    <input
                      type="checkbox"
                      checked={!hiddenCols.has(h)}
                      onChange={() => toggleCol(h)}
                      className="h-4 w-4 accent-emerald-600"
                    />
                    <span>{h}</span>
                  </label>
                ))}
              </div>
            </details>
          </div>
          <div className="flex items-center gap-2">
            {pageSizeState !== 'all' ? (
              <>
                <button
                  className="px-3 py-1 rounded-lg border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Prev
                </button>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Page {page} / {totalPages}
                </span>
                <button
                  className="px-3 py-1 rounded-lg border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </button>
              </>
            ) : (
              <span className="text-sm text-slate-600 dark:text-slate-400">Showing all {sorted.length} rows</span>
            )}
            <button
              className="px-3 py-1 rounded-lg border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500"
              onClick={exportVisibleCSV}
            >
              Export
            </button>
          </div>
        </div>
      ) : null}

      {/* OOM deadlines panel (only for oomPreset) */}
      {oomPreset ? (
        <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-8 rounded-full border border-neutral-300 grid place-items-center dark:border-slate-700">
              <span className="text-sm font-serif">⛳️</span>
            </div>
            <div className="font-serif text-lg tracking-tight">Entry Deadlines</div>
          </div>
          <div className="text-neutral-500 dark:text-slate-400 text-sm mb-3">Please submit your scores by the dates below.</div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-1 gap-x-6">
            {OOM_DEADLINES.map((d, i) => (
              <li key={i} className="text-[0.95rem]">
                {formatKST(d.iso)} — {d.course}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
