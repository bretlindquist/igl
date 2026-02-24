'use client'

import React, { useRef } from 'react'
import type { OomSeasonMeta } from '@/config/views'
import type { Row } from './csv'
import { renderHeaderLabel } from './renderers'
import { getOomRowBandClasses } from './rowBands'

type Props = {
  headers: string[]
  hiddenCols: Set<string>
  pageRows: Row[]
  sortKey: string
  sortDir: 'asc' | 'desc'
  selectedRowKeys: Set<string>
  onSort: (header: string) => void
  onToggleRow: (rowKey: string) => void
  oomMeta?: OomSeasonMeta
  oomPreset?: boolean
}

export default function TableMobile(props: Props) {
  const { headers, hiddenCols, pageRows, sortKey, sortDir, selectedRowKeys, onSort, onToggleRow, oomMeta, oomPreset } = props
  const visibleHeaders = headers.filter(h => !hiddenCols.has(h))
  const nameHeader =
    visibleHeaders.find(h => /^screen\s*_?\s*name$/i.test(h)) ??
    visibleHeaders.find(h => /^name$/i.test(h)) ??
    visibleHeaders[0]

  const lastTapRef = useRef<{ rowKey: string; time: number } | null>(null)
  const suppressDblClickUntilRef = useRef(0)

  return (
    <div className="hide-scrollbar xl:hidden overflow-x-auto rounded-2xl border border-slate-200 shadow-sm dark:border-slate-700">
      <div className="mx-auto w-max">
        <table className="w-max table-auto text-[10px]">
          <thead className="bg-slate-100 dark:bg-slate-800">
            <tr>
              {visibleHeaders.map(h => (
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
                    onClick={() => onSort(h)}
                    className="inline-flex h-full min-h-[74px] w-full items-center justify-center gap-1 rounded px-1 py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-emerald-500"
                  >
                    <span>{renderHeaderLabel(h, true, oomMeta)}</span>
                    {sortKey === h ? <span className="text-[0.65rem]">{sortDir === 'asc' ? '▲' : '▼'}</span> : null}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-[11.5px]">
            {pageRows.map((r, rowIdx) => {
              const rowKey = String(r.__row_id ?? `${String(r[nameHeader] ?? '')}__${rowIdx}`)
              const isSelected = selectedRowKeys.has(rowKey)
              const handleRowTouch = () => {
                const now = Date.now()
                const last = lastTapRef.current
                if (last && last.rowKey === rowKey && now - last.time < 320) {
                  onToggleRow(rowKey)
                  suppressDblClickUntilRef.current = now + 500
                  lastTapRef.current = null
                  return
                }
                lastTapRef.current = { rowKey, time: now }
              }

              const band = getOomRowBandClasses(rowIdx, Boolean(oomPreset))

              return (
                <tr
                  key={rowIdx}
                  className={[
                    band.rowClass,
                    band.rowOverlayClass,
                    'cursor-pointer',
                    isSelected ? 'ring-2 ring-emerald-500' : '',
                  ].join(' ')}
                  onTouchStart={handleRowTouch}
                  onDoubleClick={() => {
                    if (Date.now() < suppressDblClickUntilRef.current) return
                    onToggleRow(rowKey)
                  }}
                >
                  {visibleHeaders.map(h => (
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
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
