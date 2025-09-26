  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize
    return sorted.slice(start, start + pageSize)
  }, [sorted, page, pageSize])

  function toggleCol(h: string) {
    const next = new Set(hiddenCols)
    if (next.has(h)) {
      next.delete(h)
    } else {
      next.add(h)
    }
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
            value={String(pageSize)}
            onChange={e => { setPageSize(Number(e.target.value)); setPage(1) }}
          >
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
                      if (sortKey === h) {
                        setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
                      } else {
                        setSortKey(h); setSortDir('asc')
                      }
                    }}
                    className="inline-flex items-center gap-1"
                  >
                    {h}
                    {sortKey === h && <span>{sortDir === 'asc' ? '▲' : '▼'}</span>}
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
      {headers.length > 0 && (
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
            <button
              className="px-3 py-1 rounded-lg border"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Prev
            </button>
            <span className="text-sm text-slate-600">Page {page} / {totalPages}</span>
            <button
              className="px-3 py-1 rounded-lg border"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
            <button className="px-3 py-1 rounded-lg border" onClick={exportVisibleCSV}>Export</button>
          </div>
        </div>
      )}
    </div>
  )
}


