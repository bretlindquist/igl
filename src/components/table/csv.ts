export type Row = Record<string, string>

export function parseCSV(csv: string): string[][] {
  const rows: string[][] = []
  let i = 0
  let cur = ''
  let inQuotes = false
  let row: string[] = []

  while (i < csv.length) {
    const ch = csv[i]
    if (ch === '"') {
      if (inQuotes && csv[i + 1] === '"') {
        cur += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      row.push(cur)
      cur = ''
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (cur.length || row.length) {
        row.push(cur)
        rows.push(row)
        row = []
        cur = ''
      }
      if (ch === '\r' && csv[i + 1] === '\n') i++
    } else {
      cur += ch
    }
    i++
  }

  if (cur.length || row.length) {
    row.push(cur)
    rows.push(row)
  }

  return rows.filter(r => r.some(c => String(c).trim().length))
}

export function deriveHeaders(matrix: string[][]): { headers: string[]; dataStart: number } {
  let start = 0
  while (start < matrix.length && matrix[start].every(c => !String(c).trim())) start++
  if (start >= matrix.length) return { headers: [], dataStart: matrix.length }

  const first = matrix[start].map(c => String(c).trim())
  if (first.filter(Boolean).length === 1 && (matrix[start + 1] ?? []).some(c => String(c).trim())) {
    start++
  }

  const r1 = (matrix[start] || []).map(c => String(c).trim())
  const r2 = (matrix[start + 1] || []).map(c => String(c).trim())

  const headerHint = /(screen|name|course|total|points|rank|appr|bonus)/i
  const hasHeaderHints = (row: string[]) => row.some(c => headerHint.test(c))
  const alphaRatio = (row: string[]) => {
    const cells = row.filter(Boolean)
    if (!cells.length) return 0
    const alpha = cells.filter(c => /[A-Za-z가-힣]/.test(c)).length
    return alpha / cells.length
  }

  let headers: string[]
  let dataStart: number
  const r1LooksLike = hasHeaderHints(r1) || alphaRatio(r1) >= 0.4
  const r2LooksLike = hasHeaderHints(r2) || alphaRatio(r2) >= 0.6

  if (r1LooksLike && !r2LooksLike) {
    headers = r1
    dataStart = start + 1
  } else if (!r1LooksLike && r2LooksLike) {
    headers = r2
    dataStart = start + 2
  } else {
    const r1NonEmpty = r1.filter(Boolean).length
    const r2NonEmpty = r2.filter(Boolean).length
    if (r1NonEmpty >= Math.floor(0.6 * Math.max(r1.length, r2.length))) {
      headers = r1
      dataStart = start + 1
    } else {
      headers = r2NonEmpty ? r2 : r1
      dataStart = r2NonEmpty ? start + 2 : start + 1
    }
  }

  headers = headers.map((c, i) => c || `Column ${i + 1}`)
  const seen = new Map<string, number>()
  headers = headers.map(h => {
    const n = (seen.get(h) || 0) + 1
    seen.set(h, n)
    return n > 1 ? `${h} (${n})` : h
  })

  return { headers, dataStart }
}

export function toCSV(rows: (string | number)[][]): string {
  return rows
    .map(r =>
      r
        .map(v => {
          const s = String(v ?? '')
          return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s
        })
        .join(',')
    )
    .join('\n')
}

export function norm(s: string): string {
  return s.toLowerCase().replace(/\s+/g, ' ').replace(/_/g, ' ').trim()
}

export function isAllZeroOrBlank(row: Row, headers: string[]): boolean {
  const nameIdx = headers.findIndex(h => /screen\s*_?\s*name/i.test(h))
  const skipHeader = nameIdx >= 0 ? headers[nameIdx] : headers[0]

  let sawNonNumericText = false
  for (const h of headers) {
    if (h === skipHeader) continue
    const v = String(row[h] ?? '').trim()
    if (!v) continue
    const n = Number(v.replace(/[^0-9.\-]/g, ''))
    if (!Number.isNaN(n)) {
      if (n !== 0) return false
    } else {
      sawNonNumericText = true
    }
  }
  return !sawNonNumericText
}

export function hasUsableName(row: Row, headers: string[]): boolean {
  const nameHeader =
    headers.find(h => /^screen\s*_?\s*name$/i.test(h)) ??
    headers.find(h => /^name$/i.test(h)) ??
    headers.find(h => /^nickname$/i.test(h))

  if (!nameHeader) return true

  const raw = String(row[nameHeader] ?? '').trim()
  if (!raw) return false

  const normalized = raw.replace(/[,\s]/g, '')
  if (/^-?\d+(\.\d+)?$/.test(normalized)) return false

  return true
}
