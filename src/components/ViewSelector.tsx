'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ViewId } from '@/config/views'

type ViewItem = { id: ViewId; label: string; href: string }

const TQE_ITEMS: ViewItem[] = [
  { id: 'tqe-1', label: 'TQE-1', href: '/tqe-1' },
  { id: 'tqe-2', label: 'TQE-2', href: '/tqe-2' },
  { id: 'tqe-3', label: 'TQE-3', href: '/tqe-3' },
  { id: 'tqe-4', label: 'TQE-4', href: '/tqe-4' },
  { id: 'tqe-5', label: 'TQE-5', href: '/tqe-5' },
  { id: 'tqe-6', label: 'TQE-6', href: '/tqe-6' },
  { id: 'tqe-7', label: 'TQE-7', href: '/tqe-7' },
]

const OTHER_ITEMS: ViewItem[] = [
  { id: 'oom', label: 'OOM', href: '/' },
  { id: 'eclectic', label: 'ECLECTIC', href: '/eclectic' },
]

export default function ViewSelector() {
  const pathname = usePathname() || '/'
  const current: ViewId = (pathname === '/' ? 'oom' : pathname.slice(1)) as ViewId

  function renderItem({ id, label, href }: ViewItem) {
    const active = id === current
    return (
      <Link
        key={id}
        href={href}
        aria-current={active ? 'page' : undefined}
        className={[
          'px-4 py-2 rounded-full border text-sm transition-colors whitespace-nowrap',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500',
          active
            ? 'bg-emerald-600 text-white border-emerald-600 dark:bg-emerald-500 dark:border-emerald-500'
            : 'bg-white text-slate-800 border-slate-300 hover:border-slate-500 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700 dark:hover:border-slate-500'
        ].join(' ')}
      >
        {label}
      </Link>
    )
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">TQE</div>
        <div className="flex flex-wrap gap-2">
          {TQE_ITEMS.map(renderItem)}
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Leaderboard</div>
        <div className="flex flex-wrap gap-2">
          {OTHER_ITEMS.map(renderItem)}
        </div>
      </div>
    </div>
  )
}
