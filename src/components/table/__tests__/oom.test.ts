import { describe, expect, it } from 'vitest'
import { buildOomHeaderOrder, getCourseHeaderParts } from '@/components/table/oom'

describe('OOM schema projection', () => {
  it('keeps only name, slots 1..7, and APPR summary columns', () => {
    const headers = [
      'screen_name',
      '1. Mission Hills Norman',
      '2. Purunsol',
      '3.',
      '4. Tani CC',
      '5.',
      '6.',
      '7.',
      'Grand Total',
      'Av. Points Per Round - (APPR)',
      'Rank based on APPR',
      'Column 1',
      'Column 13',
      'Final',
      'Column 15',
    ]

    const ordered = buildOomHeaderOrder(headers)
    expect(ordered).toEqual([
      'screen_name',
      '1. Mission Hills Norman',
      '2. Purunsol',
      '3.',
      '4. Tani CC',
      '5.',
      '6.',
      '7.',
      'Grand Total',
      'Av. Points Per Round - (APPR)',
      'Rank based on APPR',
    ])
  })

  it('parses generic numbered headers and applies season labels when provided', () => {
    const fallback = getCourseHeaderParts('3. ', {
      slotNames: { 3: 'St Andrews' },
      deadlines: [],
    })
    expect(fallback).toEqual({ number: '3', name: 'St Andrews' })
  })
})
