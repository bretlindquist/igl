'use client'

import React from 'react'
import type { OomSeasonMeta } from '@/config/views'
import type { Row } from './csv'
import { renderHeaderLabel } from './renderers'
import { getOomRowBandClasses } from './rowBands'

type Props = {
  headers: string[]
  hiddenCols: Set<string>
  numericColumns: Set<string>
  pageRows: Row[]
  sortKey: string
  sortDir: 'asc' | 'desc'
  onSort: (header: string) => void
  oomMeta?: OomSeasonMeta
  oomPreset?: boolean
}

export default function TableDesktop(props: Props) {
  const { headers, hiddenCols, numericColumns, pageRows, sortKey, sortDir, onSort, oomMeta, oomPreset } = props
  const visibleHeaders = headers.filter(h => !hiddenCols.has(h))
  const nameIdx = (() => {
    const i = visibleHeaders.findIndex(x => /screen\s*_?\s*name/i.test(x))
    return i >= 0 ? i : 0
  })()

  return (
    <div className="hide-scrollbar hidden xl:block overflow-x-auto rounded-2xl border border-slate-200 shadow-sm dark:border-slate-700">
      <div className="mx-auto w-max">
        <table className="w-max table-auto text-[13px] leading-tight">
          <thead className="bg-slate-100 sticky top-0 z-30 dark:bg-slate-800">
            <tr>
              {visibleHeaders.map((h, colIdx) => {
                const isNumeric = numericColumns.has(h) && colIdx !== nameIdx
                const stickyClasses =
                  colIdx === nameIdx
                    ? 'sticky left-0 z-40 bg-slate-100 border-r border-slate-200 dark:bg-slate-800 dark:border-slate-700'
                    : ''
                return (
                  <th key={h} className={`p-0 font-semibold whitespace-normal break-words align-top ${isNumeric ? 'text-right' : 'text-left'} ${stickyClasses}`}>
                    <button
                      onClick={() => onSort(h)}
                      className={`inline-flex h-full min-h-[46px] w-full items-start gap-1 px-2.5 py-1.5 ${isNumeric ? 'justify-end text-right' : 'text-left'} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500 rounded`}
                    >
                      {renderHeaderLabel(h, false, oomMeta)}
                      {sortKey === h ? <span>{sortDir === 'asc' ? '▲' : '▼'}</span> : null}
                    </button>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((r, rowIdx) => {
              const band = getOomRowBandClasses(rowIdx, Boolean(oomPreset))
              return (
                <tr
                  key={rowIdx}
                  className={`group transition-colors ${band.rowClass}`}
                >
                {visibleHeaders.map((h, colIdx) => {
                  const value = String(r[h] ?? '')
                  const isName = colIdx === nameIdx
                  return (
                    <td
                      key={h}
                      className={[
                        `px-2.5 py-1.5 whitespace-nowrap ${numericColumns.has(h) && !isName ? 'text-right tabular-nums' : 'text-left'}`,
                        isName ? `sticky left-0 z-20 ${band.cellBgClass} ${band.cellHoverClass} border-r border-slate-200 dark:border-slate-700` : '',
                      ].join(' ')}
                    >
                      {isName ? (
                        <span className="inline-grid">
                          <span className="font-semibold invisible">{value}</span>
                          <span className="col-start-1 row-start-1 group-hover:font-semibold">{value}</span>
                        </span>
                      ) : (
                        value
                      )}
                    </td>
                  )
                })}
              </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
