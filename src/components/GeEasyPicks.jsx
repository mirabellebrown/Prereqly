'use client'

import { GE_AREA_LABELS, DAILY_NEXUS_GE_URL } from '../lib/gePlaceholder'

export function GeEasyPicks({
  areaKey,
  picks = [],
  isLoading = false,
  error = null,
  compact = false,
  onOpenCourseGrades,
}) {
  const areaLabel = GE_AREA_LABELS[areaKey] ?? `Area ${areaKey}`

  if (isLoading) {
    return (
      <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-400">
        Loading easiest {areaLabel} courses from Daily Nexus…
      </div>
    )
  }

  if (error) {
    return (
      <div className="mt-3 rounded-2xl border border-amber-400/25 bg-amber-400/10 px-3 py-2 text-xs text-amber-100">
        GE grade rankings unavailable. Check{' '}
        <a href={DAILY_NEXUS_GE_URL} target="_blank" rel="noreferrer" className="font-semibold underline">
          Daily Nexus GE grades
        </a>
        .
      </div>
    )
  }

  if (!picks.length) {
    return null
  }

  return (
    <div
      className={`mt-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/8 ${compact ? 'px-3 py-2' : 'p-3'}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-100">
          Top {picks.length} easiest {areaLabel} courses
        </p>
        <a
          href={DAILY_NEXUS_GE_URL}
          target="_blank"
          rel="noreferrer"
          className="text-[11px] font-semibold text-gold hover:text-gold-hover"
        >
          Daily Nexus GE grades →
        </a>
      </div>
      <p className="mt-1 text-[11px] leading-5 text-slate-400">
        Ranked by highest share of A-range grades (A+, A, A−) in Nexus historical data. Confirm the course
        still carries {areaLabel} credit in GOLD before you enroll.
      </p>
      <ol className={`mt-2 space-y-1.5 ${compact ? 'text-xs' : 'text-sm'}`}>
        {picks.map((pick, index) => (
          <li key={pick.courseCode}>
            {onOpenCourseGrades ? (
              <button
                type="button"
                onClick={() => onOpenCourseGrades({ code: pick.courseCode, title: pick.courseCode })}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-left transition hover:border-white/20"
              >
                <span className="font-semibold text-white">
                  {index + 1}. {pick.courseCode}
                </span>
                <span className="shrink-0 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-100">
                  {pick.aRangeRate != null ? `${pick.aRangeRate}% A-range` : 'N/A'}
                </span>
              </button>
            ) : (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2">
                <span className="font-semibold text-white">
                  {index + 1}. {pick.courseCode}
                </span>
                <span className="shrink-0 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-100">
                  {pick.aRangeRate != null ? `${pick.aRangeRate}% A-range` : 'N/A'}
                </span>
              </div>
            )}
          </li>
        ))}
      </ol>
    </div>
  )
}
