export function getOomRowBandClasses(rowIdx: number, oomEnabled: boolean): {
  rowClass: string
  cellBgClass: string
  cellHoverClass: string
} {
  if (!oomEnabled) {
    const isEven = rowIdx % 2 === 0
    return {
      rowClass: isEven
        ? 'bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800'
        : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800',
      cellBgClass: isEven ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-950',
      cellHoverClass: 'group-hover:bg-slate-100 dark:group-hover:bg-slate-800',
    }
  }

  if (rowIdx < 8) {
    return {
      rowClass: 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40',
      cellBgClass: 'bg-emerald-50 dark:bg-emerald-950/30',
      cellHoverClass: 'group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40',
    }
  }

  if (rowIdx < 16) {
    return {
      rowClass: 'bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/25 dark:hover:bg-sky-900/35',
      cellBgClass: 'bg-sky-50 dark:bg-sky-950/25',
      cellHoverClass: 'group-hover:bg-sky-100 dark:group-hover:bg-sky-900/35',
    }
  }

  if (rowIdx < 24) {
    return {
      rowClass: 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/20 dark:hover:bg-amber-900/30',
      cellBgClass: 'bg-amber-50 dark:bg-amber-950/20',
      cellHoverClass: 'group-hover:bg-amber-100 dark:group-hover:bg-amber-900/30',
    }
  }

  const isEven = rowIdx % 2 === 0
  return {
    rowClass: isEven
      ? 'bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800'
      : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800',
    cellBgClass: isEven ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-950',
    cellHoverClass: 'group-hover:bg-slate-100 dark:group-hover:bg-slate-800',
  }
}
