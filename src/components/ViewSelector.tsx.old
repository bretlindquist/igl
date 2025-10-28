'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ViewId } from '@/config/views'

const ORDER: ViewId[] = ['oom','tqe-1','tqe-2','tqe-3','tqe-4','tqe-5','tqe-6','tqe-7']

export default function ViewSelector() {
  const pathname = usePathname() // e.g. '/', '/tqe-1'
  const active = (pathname === '/' ? 'oom' : (pathname.slice(1) as ViewId))

  return (
    <div className="flex flex-wrap gap-2">
      {ORDER.map(id => {
        const href = id === 'oom' ? '/' : `/${id}`
        const isActive = active === id
        return (
          <Link
            key={id}
            href={href}
            className={`px-3 py-1 rounded-full border ${isActive ? 'bg-black text-white' : 'bg-white text-black'}`}
          >
            {id.toUpperCase()}
          </Link>
        )
      })}
    </div>
  )
}

