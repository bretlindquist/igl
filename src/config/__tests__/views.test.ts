import { describe, expect, it } from 'vitest'
import { getViews } from '@/config/views'

describe('views source strategies', () => {
  it('uses local-first for fall 2025 OOM', () => {
    const v = getViews('fall-2025').oom
    expect(v).toBeDefined()
    expect(v?.csv).toBe('/archive/fall-2025/oom.csv')
    expect(v?.fallbackCsv).toContain('docs.google.com/spreadsheets')
  })

  it('uses remote-first for spring 2026 OOM', () => {
    const v = getViews('spring-2026').oom
    expect(v).toBeDefined()
    expect(v?.csv).toContain('docs.google.com/spreadsheets')
    expect(v?.fallbackCsv).toBe('/archive/spring-2026/oom.csv')
  })

  it('exposes only intended spring 2026 views', () => {
    const views = getViews('spring-2026')
    expect(Object.keys(views).sort()).toEqual(['oom', 'tqe-1', 'tqe-2', 'tqe-3'])
  })
})
