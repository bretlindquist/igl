export function getOomRowBandClasses(rowIdx: number, oomEnabled: boolean): {
  rowClass: string
  rowOverlayClass: string
  cellBgClass: string
  cellOverlayClass: string
  cellHoverClass: string
} {
  const isEven = rowIdx % 2 === 0
  const baseRowClass = isEven
    ? 'bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800'
    : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800'
  const baseCellBgClass = isEven ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-950'

  if (!oomEnabled) {
    return {
      rowClass: baseRowClass,
      rowOverlayClass: '',
      cellBgClass: baseCellBgClass,
      cellOverlayClass: '',
      cellHoverClass: 'group-hover:bg-slate-100 dark:group-hover:bg-slate-800',
    }
  }

  const overlay =
    rowIdx < 8
      ? '[background-image:linear-gradient(rgba(16,185,129,0.10),rgba(16,185,129,0.10))] dark:[background-image:linear-gradient(rgba(16,185,129,0.14),rgba(16,185,129,0.14))]'
      : rowIdx < 16
        ? '[background-image:linear-gradient(rgba(14,165,233,0.10),rgba(14,165,233,0.10))] dark:[background-image:linear-gradient(rgba(14,165,233,0.14),rgba(14,165,233,0.14))]'
        : rowIdx < 24
          ? '[background-image:linear-gradient(rgba(245,158,11,0.10),rgba(245,158,11,0.10))] dark:[background-image:linear-gradient(rgba(245,158,11,0.14),rgba(245,158,11,0.14))]'
          : ''

  return {
    rowClass: baseRowClass,
    rowOverlayClass: overlay,
    cellBgClass: baseCellBgClass,
    cellOverlayClass: overlay,
    cellHoverClass: 'group-hover:bg-slate-100 dark:group-hover:bg-slate-800',
  }
}
