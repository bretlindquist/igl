'use client'
import React, { useEffect, useMemo, useState } from 'react'

function parseCSV(csv: string): string[][] {
  const rows: string[][] = []
  let i = 0
  let cur = ''
  let inQuotes = false
  let row: string[] = []
  while (i < csv.length) {
    const ch = csv[i]
    if (ch === '"') {
      if (inQuotes && csv[i + 1] === '"') { cur += '"'; i++ }
      else { inQuotes = !inQuotes }
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

/** Detect/merge 2-row headers like ["Course", ...] + ["1. Mission...", ...] */
function deriveHeaders(matrix: string[][]): { headers: string[]; dataStart: number } {
  let start = 0
  while (start < matrix.length && matrix[start].every(c => !String(c).trim())) start++
  if (start >= matrix.length) return { headers: [], dataStart: matrix.length }

  const r1 = matrix[start].map(c => String(c).trim())
  const r2 = (matrix[start + 1] || []).map(c => String(c).trim())
  const empties1 = r1.filter(h => !h).length
  const nonEmpty2 = r2.filter(h => h).length
  const r1HasCourse = r1.some(h => /course/i.test(h))

  let headers = r1
  let dataStart = start + 1

  if (r1HasCourse && nonEmpty2 > 0) {
    headers = r2
    dataStart = start + 2
  } else if (empties1 > Math.floor(r1.length * 0.3) && nonEmpty2 > 0) {
    const len = Math.max(r1.length, r2.length)
    headers = Array.from({ length: len }, (_, i) => {
      const a = r1[i] || ''
      const b = r2[i] || ''
      const merged = (a && b) ? `${a} — ${b}` : (a || b)
      return merged.trim()
    })
    dataStart = start + 2
  }

  headers = headers.map((h, i) => (h ? h : `Column ${i + 1}`))
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

type Row = Record<string, string>

export default function ResponsiveOOMViewer({ csvUrl, columns }: { csvUrl: string; columns?: string[] }) {
  const [rows, setRows] = useState<Row[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState('')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [pageSize, setPageSize] = useState<number | 'all'>('all') // default = ALL
  const [page, setPage] = useState(1)
  const [hiddenCols, setHiddenCols] = useState<Set<string>>(new Set())

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

        // Build row objects using inferred headers
        const data: Row[] = body.map(r => {
          const o: Row = {}
          for (let i = 0; i < hdr.length; i++) o[hdr[i]] = String(r[i] ?? '')
          return o
        })

        // Drop columns that are entirely empty
        const keepMask = hdr.map(h => data.some(r => String(r[h]).trim().length > 0))
        let finalHeaders = hdr.filter((_, i) => keepMask[i])
        let finalRows = data.map(r => {
          const o: Row = {}
          finalHeaders.forEach(h => { o[h] = r[h] })
          return o
        })

        // If a whitelist is provided, keep exactly those columns, in that order
        if (columns && columns.length) {
          const map = new Map(finalHeaders.map(h => [norm(h), h]))
          const ordered: string[] = []
          for (const wanted of columns) {
            const match = map.get(norm(wanted))
            if (match) ordered.push(match)
          }
          finalHeaders = ordered
          finalRows = finalRows.map(r => {
            const o: Row = {}
            finalHeaders.forEach(h => { o[h] = r[h] })
            return o
          })
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
    // include columns in deps (stringify to keep it serializable)
  }, [csvUrl, JSON.stringify(columns)])

  const filtered = useMemo(() => {
    if (!query.trim()) return rows
    const q = query.toLowerCase()
    return rows.filter(r => headers.some(h => String(r[h]).toLowerCase().includes(q)))
  }, [rows, query, headers])

  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    const copy = [...filtered]
    copy.sort((a, b) => {
      const A = a[sortKey]
      const B = b[sortKey]
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

      <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
        <input
          className="border rounded-lg px-3 py-2 md:max-w-sm"
          placeholder="Search all columns…"
          value={query}
          onChange={e => { setQuery(e.target.value); setPage(1) }}
        />
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Rows per page</span>
          <select
            className="border rounded-lg px-2 py-2"
            value={pageSize === 'all' ? 'all' : String(pageSize)}
            onChange={e => {
              const v = e.target.value === 'all' ? 'all' : Number(e.target.value)
              setPageSize(v); setPage(1)
            }}
          >
            <option value="all">All</option>
            {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 sticky top-0">
            <tr>
              {headers.filter(h => !hiddenCols.has(h)).map(h => (
                <th key={h} className="px-4 py-3 text-left font-semibold whitespace-nowrap">
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
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((r, idx) => (
              <tr key={idx} className="odd:bg-white even:bg-slate-50">
                {headers.filter(h => !hiddenCols.has(h)).map(h => (
                  <td key={h} className="px-4 py-3 whitespace-nowrap">{String(r[h] ?? '')}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden grid grid-cols-1 gap-3">
        {pageRows.map((r, idx) => (
          <div key={idx} className="border rounded-2xl border-slate-200 bg-white shadow-sm p-4">
            <div className="grid grid-cols-2 gap-y-2 gap-x-4">
              {headers.filter(h => !hiddenCols.has(h)).map(h => (
                <React.Fragment key={h}>
                  <div className="text-xs uppercase tracking-wide text-slate-500">{h}</div>
                  <div className="text-sm font-medium text-slate-900">{String(r[h] ?? '')}</div>
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
                className={`px-3 py-1 rounded-full border ${hiddenCols.has(h) ? 'bg-slate-200' : 'bg-white'}`}
              >
                {hiddenCols.has(h) ? `Show: ${h}` : `Hide: ${h}`}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {pageSize !== 'all' ? (
              <>
                <button className="px-3 py-1 rounded-lg border" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
                <span className="text-sm text-slate-600">Page {page} / {totalPages}</span>
                <button className="px-3 py-1 rounded-lg border" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</button>
              </>
            ) : (
              <span className="text-sm text-slate-600">Showing all {sorted.length} rows</span>
            )}
            <button className="px-3 py-1 rounded-lg border" onClick={exportVisibleCSV}>Export</button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

