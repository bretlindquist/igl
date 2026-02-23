'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { OomSeasonMeta } from '@/config/views'
import { buildOomHeaderOrder, pickDefaultSort } from './oom'
import { deriveHeaders, hasUsableName, isAllZeroOrBlank, norm, parseCSV, type Row } from './csv'

function toProxiedCsvUrl(original: string): string {
  try {
    const u = new URL(original, typeof window !== 'undefined' ? window.location.origin : 'http://localhost')
    const isLocal = typeof window !== 'undefined' && u.origin === window.location.origin
    if (isLocal) {
      u.searchParams.set('cb', String(Date.now()))
      return u.toString()
    }
    return `/api/sheet?src=${encodeURIComponent(u.toString())}&cb=${Date.now()}`
  } catch {
    return original
  }
}

export type CsvTableOptions = {
  csvUrl: string
  fallbackCsvUrl?: string
  columns?: string[]
  oomPreset?: boolean
  oomMeta?: OomSeasonMeta
}

export function useCsvTable(options: CsvTableOptions) {
  const { csvUrl, fallbackCsvUrl, columns, oomPreset } = options

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
  const [selectedRowKeys, setSelectedRowKeys] = useState<Set<string>>(new Set())
  const requestSeqRef = useRef(0)

  useEffect(() => {
    async function fetchCsvText(url: string): Promise<string> {
      const res = await fetch(toProxiedCsvUrl(url), { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.text()
    }

    const requestId = ++requestSeqRef.current

    async function load() {
      if (!csvUrl) {
        setError('Missing CSV URL for this view')
        setRows([])
        setHeaders([])
        return
      }

      setLoading(true)
      setError('')
      setRows([])
      setHeaders([])
      setSelectedRowKeys(new Set())
      setPage(1)
      setPageSize('all')

      try {
        let text = ''
        try {
          text = await fetchCsvText(csvUrl)
        } catch (primaryErr) {
          if (!fallbackCsvUrl) throw primaryErr
          text = await fetchCsvText(fallbackCsvUrl)
        }

        if (requestId !== requestSeqRef.current) return

        const matrix = parseCSV(text)
        if (!matrix.length) {
          setRows([])
          setHeaders([])
          return
        }

        const { headers: hdr, dataStart } = deriveHeaders(matrix)
        const body = matrix.slice(dataStart)

        const data: Row[] = body.map((r, rowIdx) => {
          const o: Row = {}
          for (let i = 0; i < hdr.length; i++) o[hdr[i]] = String(r[i] ?? '')
          // Stable identity for row selection across sorting/filtering.
          o.__row_id = String(rowIdx + 1)
          return o
        })

        function projectRows(source: Row[], keepHeaders: string[]): Row[] {
          return source.map(r => {
            const o: Row = {}
            keepHeaders.forEach(h => {
              o[h] = r[h]
            })
            o.__row_id = r.__row_id
            return o
          })
        }

        const keepMask = hdr.map(h => data.some(r => String(r[h]).trim().length > 0))
        let finalHeaders = hdr.filter((_, i) => keepMask[i])

        let finalRows: Row[] = projectRows(data, finalHeaders)

        // For OOM, suppress all-zero artifact rows.
        // For TQE/other views, keep zero rows so incomplete players remain visible.
        if (oomPreset) {
          finalRows = finalRows.filter(r => !isAllZeroOrBlank(r, finalHeaders))
        }
        finalRows = finalRows.filter(r => hasUsableName(r, finalHeaders))

        if (oomPreset) {
          const ordered = buildOomHeaderOrder(finalHeaders)
          if (ordered.length) {
            finalHeaders = ordered
            finalRows = projectRows(finalRows, finalHeaders)
            if (oomPreset) {
              finalRows = finalRows.filter(r => !isAllZeroOrBlank(r, finalHeaders))
            }
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
            finalRows = projectRows(finalRows, finalHeaders)
            if (oomPreset) {
              finalRows = finalRows.filter(r => !isAllZeroOrBlank(r, finalHeaders))
            }
            finalRows = finalRows.filter(r => hasUsableName(r, finalHeaders))
          }
        }

        if (requestId !== requestSeqRef.current) return

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
        setSelectedRowKeys(new Set())
      } catch (e) {
        if (requestId !== requestSeqRef.current) return
        setError(e instanceof Error ? e.message : 'Failed to fetch CSV')
      } finally {
        if (requestId === requestSeqRef.current) setLoading(false)
      }
    }

    load()
  }, [csvUrl, fallbackCsvUrl, columns, oomPreset])

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
        return terms.some(t => hayName.includes(t))
      })
    }

    const t = terms[0]
    return rows.filter(r => visibleHeaders.some(h => String(r[h] ?? '').toLowerCase().includes(t)))
  }, [rows, query, headers, hiddenCols])

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

  function setSort(next: string) {
    if (sortKey === next) setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    else {
      setSortKey(next)
      setSortDir('asc')
    }
    setPage(1)
  }

  function toggleCol(h: string) {
    const next = new Set(hiddenCols)
    if (next.has(h)) next.delete(h)
    else next.add(h)
    setHiddenCols(next)
  }

  function toggleSelectedRow(rowKey: string) {
    setSelectedRowKeys(prev => {
      const next = new Set(prev)
      if (next.has(rowKey)) next.delete(rowKey)
      else next.add(rowKey)
      return next
    })
  }

  return {
    headers,
    rows,
    loading,
    error,
    query,
    setQuery,
    sortKey,
    sortDir,
    setSort,
    page,
    setPage,
    pageSize,
    setPageSize,
    hiddenCols,
    toggleCol,
    numericColumns,
    selectedRowKeys,
    toggleSelectedRow,
    sorted,
    pageRows,
    totalPages,
  }
}
