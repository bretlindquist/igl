'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ViewId } from '@/config/views'

const ITEMS: { id: ViewId; label: string; href: string }[] = [
  { id: 'oom',       label: 'OOM',      href: '/' },
  { id: 'tqe-1',     label: 'TQE-1',    href: '/tqe-1' },
  { id: 'tqe-2',     label: 'TQE-2',    href: '/tqe-2' },
  { id: 'tqe-3',     label: 'TQE-3',    href: '/tqe-3' },
  { id: 'tqe-4',     label: 'TQE-4',    href: '/tqe-4' },
  { id: 'tqe-5',     label: 'TQE-5',    href: '/tqe-5' },
  { id: 'tqe-6',     label: 'TQE-6',    href: '/tqe-6' },
  { id: 'tqe-7',     label: 'TQE-7',    href: '/tqe-7' },
  { id: 'eclectic',  label: 'ECLECTIC', href: '/eclectic' },
]

export default function ViewSelector() {
  const pathname = usePathname() || '/'
  const current: ViewId = (pathname === '/' ? 'oom' : pathname.slice(1)) as ViewId

  return (
    <div className="flex flex-wrap gap-3">
      {ITEMS.map(({ id, label, href }) => {
        const active = id === current
        return (
          <Link
            key={id}
            href={href}
            className={[
              'px-5 py-2 rounded-full border transition',
              active
                ? 'bg-white text-black border-white dark:bg-white dark:text-black'
                : 'bg-transparent text-white border-white/40 hover:border-white'
            ].join(' ')}
          >
            {label}
          </Link>
        )
      })}
    </div>
  )
}

