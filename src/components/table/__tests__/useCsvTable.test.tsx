import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useCsvTable } from '@/components/table/useCsvTable'

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

describe('useCsvTable loading behavior', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('clears stale rows and ignores out-of-order responses when source changes', async () => {
    const csv1 = 'screen_name,1. A,Grand Total,Av. Points Per Round - (APPR),Rank based on APPR\nOld,10,10,10,1\n'
    const csv2 = 'screen_name,1. A,Grand Total,Av. Points Per Round - (APPR),Rank based on APPR\nNew,20,20,20,1\n'

    const d1 = deferred<Response>()
    const d2 = deferred<Response>()

    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('first.csv')) return d1.promise
      if (url.includes('second.csv')) return d2.promise
      return Promise.resolve(new Response('', { status: 404 }))
    })

    vi.stubGlobal('fetch', fetchMock)

    const { result, rerender } = renderHook((props: { csvUrl: string }) =>
      useCsvTable({ csvUrl: props.csvUrl, oomPreset: true })
    , {
      initialProps: { csvUrl: 'https://example.com/first.csv' },
    })

    await waitFor(() => expect(result.current.loading).toBe(true))

    rerender({ csvUrl: 'https://example.com/second.csv' })

    expect(result.current.rows).toEqual([])

    d2.resolve(new Response(csv2, { status: 200 }))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.rows.length).toBe(1)
      expect(result.current.rows[0].screen_name).toBe('New')
    })

    d1.resolve(new Response(csv1, { status: 200 }))

    await waitFor(() => {
      expect(result.current.rows.length).toBe(1)
      expect(result.current.rows[0].screen_name).toBe('New')
    })
  })

  it('keeps zero-value player rows for non-OOM views (TQE completeness)', async () => {
    const csv = [
      'screen_name,SUM of gross,SUM of absolute_net,SUM of Comp_score,Handi bonus,Final Points',
      'Player One,71,74.0,73,0,40',
      'Player Two,0,0,0,0,0',
    ].join('\\n')

    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(new Response(csv, { status: 200 })))
    )

    const { result } = renderHook(() =>
      useCsvTable({ csvUrl: 'https://example.com/tqe-1.csv', columns: ['screen_name', 'SUM of gross', 'Final Points'] })
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.rows.length).toBe(2)
      expect(result.current.rows.map(r => r.screen_name)).toEqual(['Player One', 'Player Two'])
    })
  })
})
