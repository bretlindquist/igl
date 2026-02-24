'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import type { SeasonId, ViewId } from '@/config/views'
import { useDismissibleMenu } from './hooks/useDismissibleMenu'

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
const TAB_ITEMS: ViewItem[] = [...OTHER_ITEMS, ...TQE_ITEMS]

export default function ViewSelector(props: {
  season: SeasonId
  seasonLabel: string
  availableViews: ViewId[]
}) {
  const { season, seasonLabel, availableViews } = props
  const pathname = usePathname() || '/'
  const searchParams = useSearchParams()
  const searchKey = searchParams.toString()
  const current: ViewId = (pathname === '/' ? 'oom' : pathname.slice(1)) as ViewId
  const [menuOpen, setMenuOpen] = useState(false)
  const [optimisticView, setOptimisticView] = useState<ViewId | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useDismissibleMenu({
    open: menuOpen,
    rootRef: menuRef,
    onDismiss: () => setMenuOpen(false),
  })

  useEffect(() => {
    setOptimisticView(null)
  }, [pathname, searchKey])

  function withSeason(href: string, seasonId: SeasonId): string {
    const params = new URLSearchParams(searchParams.toString())
    params.set('season', seasonId)
    const q = params.toString()
    return q ? `${href}?${q}` : href
  }

  function renderItem({ id, label, href }: ViewItem) {
    const active = id === (optimisticView ?? current)
    return (
      <Link
        key={id}
        href={withSeason(href, season)}
        aria-current={active ? 'page' : undefined}
        onClick={() => setOptimisticView(id)}
        className={[
          'px-4 py-2 rounded-full border text-sm whitespace-nowrap',
          'transition-all duration-300 ease-in-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500',
          active
            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm scale-[1.01] dark:bg-emerald-500 dark:border-emerald-500'
            : 'bg-white text-slate-800 border-slate-300 hover:border-slate-500 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700 dark:hover:border-slate-500'
        ].join(' ')}
      >
        {label}
      </Link>
    )
  }

  return (
    <>
      <div ref={menuRef} className="space-y-3">
        <button
          type="button"
          aria-label="Open season menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(v => !v)}
          className="season-menu-button inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 shadow-sm
                     dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <span className="text-lg leading-none">☰</span>
        </button>

        <div className="text-base font-semibold leading-tight tracking-tight text-slate-700 dark:text-slate-200">
          {seasonLabel}
        </div>

        {menuOpen ? (
          <div className="season-menu-panel rounded-xl border border-slate-300 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Seasons</div>
            <div className="flex flex-col gap-2">
              <Link
                href={withSeason(pathname, 'fall-2025')}
                onClick={() => setMenuOpen(false)}
                className={`rounded-lg border px-3 py-2 text-left text-sm font-medium ${
                  season === 'fall-2025'
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                }`}
              >
                2025
              </Link>
              <Link
                href={withSeason(pathname, 'spring-2026')}
                onClick={() => setMenuOpen(false)}
                className={`rounded-lg border px-3 py-2 text-left text-sm font-medium ${
                  season === 'spring-2026'
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                }`}
              >
                2026
              </Link>
            </div>
          </div>
        ) : null}
      </div>
      <div className="view-tabs-sticky -mx-1 rounded-xl border border-slate-200 bg-white/95 px-1 py-2 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
        <div className="hide-scrollbar overflow-x-auto">
          <div className="flex min-w-max flex-nowrap gap-2">
            {TAB_ITEMS.filter(v => availableViews.includes(v.id)).map(renderItem)}
          </div>
        </div>
      </div>
    </>
  )
}
