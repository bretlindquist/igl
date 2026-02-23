import React from 'react'
import type { OomSeasonMeta } from '@/config/views'
import { getCourseHeaderParts, toDisplayHeader } from './oom'

export function renderStackedCourseHeader(course: { number: string; name: string }, compact = false) {
  const words = course.name.split(/\s+/).filter(Boolean)
  return (
    <span className="leading-snug text-center">
      <span className={`block font-extrabold leading-none ${compact ? 'text-[0.66rem]' : 'text-[0.72rem]'}`}>{course.number}</span>
      {words.map((word, idx) => (
        <span key={`${course.number}-${idx}`} className="compact-course-name block">
          {word}
        </span>
      ))}
    </span>
  )
}

export function renderStackedHeaderText(label: string, compact = false) {
  const words = label.split(/\s+/).filter(Boolean)
  return (
    <span className="leading-snug text-center">
      {words.map((word, idx) => (
        <span key={`${label}-${idx}`} className={`block ${compact ? 'text-[0.69rem]' : ''}`}>
          {word}
        </span>
      ))}
    </span>
  )
}

export function renderHeaderLabel(header: string, compact: boolean, oomMeta?: OomSeasonMeta) {
  const course = getCourseHeaderParts(header, oomMeta)
  if (!course) {
    const label = toDisplayHeader(header, compact, oomMeta)
    if (/^name$/i.test(label)) return <span className="leading-snug">{label}</span>
    return renderStackedHeaderText(label, compact)
  }
  return renderStackedCourseHeader(course, compact)
}
