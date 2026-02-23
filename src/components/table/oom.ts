import type { OomSeasonMeta } from '@/config/views'

export type OomDeadline = { iso: string; course: string }

const OOM_SUMMARY_LABELS = [
  { key: 'grandTotal', patterns: [/grand\s*total/i] },
  { key: 'appr', patterns: [/av\.?\s*points?\s*per\s*round/i, /\bappr\b/i] },
  { key: 'apprRank', patterns: [/rank.*appr/i, /rank\s*based\s*on\s*appr/i] },
]

function pickHeader(headers: string[], patterns: RegExp[]): string | null {
  for (const p of patterns) {
    const hit = headers.find(h => p.test(h))
    if (hit) return hit
  }
  return null
}

function slotFromHeader(header: string): number | null {
  const m = header.match(/^\s*([1-7])\s*[.)]?/)
  if (!m) return null
  return Number(m[1])
}

function slotLabel(slot: number, meta?: OomSeasonMeta): string {
  const name = meta?.slotNames?.[slot as 1 | 2 | 3 | 4 | 5 | 6 | 7]
  return (name || '').trim()
}

function cleanCourseName(name: string): string {
  return name.replace(/\s*\([^)]*\)\s*$/g, '').trim()
}

export function buildOomHeaderOrder(headers: string[]): string[] {
  const out: string[] = []
  const screenName =
    pickHeader(headers, [/^screen\s*_?\s*name$/i, /^screen\s*name$/i, /^nickname$/i, /^name$/i]) ??
    (headers.includes('screen_name') ? 'screen_name' : headers[0])

  if (headers.includes(screenName)) out.push(screenName)

  for (let slot = 1; slot <= 7; slot++) {
    const col = headers.find(h => slotFromHeader(h) === slot)
    if (col) out.push(col)
  }

  for (const s of OOM_SUMMARY_LABELS) {
    const h = pickHeader(headers, s.patterns)
    if (h) out.push(h)
  }

  const seen = new Set<string>()
  return out.filter(h => !seen.has(h) && seen.add(h))
}

export function pickDefaultSort(headers: string[]): { key: string; dir: 'asc' | 'desc' } | null {
  const candidates = [/final\s*points/i, /grand\s*total/i, /\btotal\b/i, /\bpoints?\b/i, /\bscore\b/i, /\brank\b/i]
  for (const pattern of candidates) {
    const key = headers.find(h => pattern.test(h))
    if (!key) continue
    return { key, dir: /rank/i.test(key) ? 'asc' : 'desc' }
  }
  if (!headers.length) return null
  return { key: headers[0], dir: 'asc' }
}

export function getCourseHeaderParts(header: string, meta?: OomSeasonMeta): { number: string; name: string } | null {
  const slot = slotFromHeader(header)
  if (!slot) return null

  const fromHeader = cleanCourseName(header.replace(/^\s*[1-7]\s*[.)]?\s*/, '').trim())
  const fromMeta = cleanCourseName(slotLabel(slot, meta))

  return {
    number: String(slot),
    name: fromMeta || fromHeader,
  }
}

export function toDisplayHeader(header: string, compact: boolean, meta?: OomSeasonMeta): string {
  if (/^screen\s*_?\s*name$/i.test(header) || /^name$/i.test(header)) return 'Name'
  if (compact) {
    const course = getCourseHeaderParts(header, meta)
    if (course) return course.name ? `${course.number}. ${course.name}` : `${course.number}.`
  }
  return header
}

export function formatKST(iso: string): string {
  const d = new Date(iso + 'T00:00:00Z')
  return (
    new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'Asia/Seoul',
    }).format(d) + ' (KST)'
  )
}

export function formatDeadlineDMY(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number)
  if (!year || !month || !day) return iso
  return `${day}/${month}/${year}`
}
