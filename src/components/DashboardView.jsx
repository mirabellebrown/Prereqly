'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { AppIcon } from './AppIcon'
import { GoldLink } from './GoldLink'
import { ProgressRing } from './ProgressRing'
import {
  dashboardDestinations,
  dashboardMetrics,
  studentProfile,
} from '../mockData'
import {
  daysUntil,
  formatEventShortDate,
  getTimelineEvents,
  getUpcomingEvents,
  inferPriority,
} from '../lib/academicDates'
import { buildGraduationSummary } from '../lib/graduationProgress'

const quarters = ['Fall', 'Winter', 'Spring', 'Summer']

function ProfileStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-silver/30 bg-white/[0.06] px-4 py-3">
      <div className="text-xs uppercase tracking-[0.16em] text-gold/80">{label}</div>
      <div className="mt-1 text-lg font-semibold text-white">{value}</div>
    </div>
  )
}

function DestinationCard({ destination, onNavigate }) {
  const shellClass = `group panel w-full border border-silver/30 bg-gradient-to-br ${destination.accent} from-10% to-90% p-[1px] text-left transition hover:-translate-y-0.5 hover:border-silver/50 hover:shadow-[0_12px_40px_rgba(203,213,225,0.1)]`

  const inner = (
    <div className="flex h-full flex-col bg-white/[0.07] p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gold/20 bg-gold/8 text-gold transition group-hover:border-gold/40 group-hover:bg-gold/14">
          <AppIcon name={destination.icon} className="h-5 w-5" />
        </span>
        <AppIcon
          name="arrow-up-right"
          className="h-4 w-4 shrink-0 text-slate-500 transition group-hover:text-gold"
        />
      </div>
      <h3 className="mt-4 text-lg font-semibold tracking-tight text-white">{destination.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-slate-400">{destination.description}</p>
      {destination.tags?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {destination.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-silver/30 bg-gold/6 px-2.5 py-0.5 text-[11px] font-medium text-slate-200"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )

  if (destination.href) {
    return (
      <Link href={destination.href} className={shellClass}>
        {inner}
      </Link>
    )
  }

  return (
    <button type="button" onClick={() => onNavigate(destination.viewId)} className={shellClass}>
      {inner}
    </button>
  )
}

export function DashboardView({ checklistSections, onNavigate, planner }) {
  const graduation = useMemo(
    () => buildGraduationSummary({ studentProfile, checklistSections }),
    [checklistSections],
  )

  const totalPlannedUnits = useMemo(
    () =>
      planner
        .flatMap((yearPlan) => quarters.flatMap((quarter) => yearPlan.quarters[quarter] ?? []))
        .reduce((sum, course) => sum + course.units, 0),
    [planner],
  )

  const openCount = graduation.whatsLeft.length
  const upcoming = getUpcomingEvents(getTimelineEvents(), { limit: 2 })

  return (
    <div className="dashboard-landing space-y-8">
      <section className="panel-hero min-h-[min(42vh,420px)] border border-silver/35 bg-gradient-to-br from-gold/8 via-[#041018] to-app-bg p-6 shadow-[0_20px_90px_rgba(1,8,16,0.65)] sm:p-8">
        <div className="flex h-full flex-col justify-between gap-8">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex min-w-0 flex-1 flex-col gap-5 sm:flex-row sm:items-start">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-gold/25 to-slate-100 text-2xl font-black text-ucsb-navy shadow-[0_0_36px_var(--gold-glow)] ring-2 ring-gold/30">
                {studentProfile.initials}
              </div>
              <div className="min-w-0">
                <p className="text-label-caps-gold">Your profile</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                  {studentProfile.name}
                </h1>
                <p className="mt-1 text-lg text-slate-200">{studentProfile.major}</p>
                <p className="mt-1 text-sm text-slate-400">{studentProfile.college}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="badge-gold rounded-2xl px-3 py-1 text-xs font-semibold">
                    {studentProfile.year}
                  </span>
                  <span className="rounded-2xl border border-silver/30 bg-gold/6 px-3 py-1 text-xs text-slate-200">
                    {studentProfile.standing}
                  </span>
                  <span className="rounded-2xl border border-silver/30 bg-gold/6 px-3 py-1 text-xs text-slate-200">
                    Expected {studentProfile.expectedGraduation}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center xl:max-w-xl">
              <ProgressRing percent={graduation.checklistPercent} />
              <div className="min-w-0">
                <p className="text-label-caps-gold">Degree progress</p>
                <p className="mt-2 text-xl font-semibold text-white">
                  {graduation.onTrack ? 'On track' : 'Needs attention'} for {graduation.expectedGraduation}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {openCount > 0
                    ? `${openCount} requirement${openCount === 1 ? '' : 's'} still open in this demo path.`
                    : 'All demo checklist items are satisfied.'}{' '}
                  Verify in Gaucho GOLD before you enroll.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <ProfileStat
                    label="Units completed"
                    value={`${graduation.unitsCompleted} / ${graduation.unitsTarget}`}
                  />
                  <ProfileStat label="Units remaining" value={graduation.unitsRemaining} />
                  <ProfileStat label="Planned in roadmap" value={`${totalPlannedUnits} units`} />
                  <ProfileStat label="Checklist" value={`${graduation.checklistPercent}%`} />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 border-t border-silver/30 pt-6">
            <div className="flex items-center justify-between text-sm text-slate-300">
              <span>Overall completion (demo)</span>
              <span className="font-semibold text-gold">{studentProfile.completedPercent}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-800/80 ring-1 ring-gold/10">
              <div
                className="progress-silver h-full rounded-full"
                style={{ width: `${studentProfile.completedPercent}%` }}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {dashboardMetrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-2xl border border-silver/28 bg-white/[0.05] px-4 py-3"
                >
                  <div className="text-xs text-slate-400">{metric.label}</div>
                  <div className="mt-1 font-semibold text-white">{metric.value}</div>
                </div>
              ))}
            </div>
          </div>

          {graduation.riskFlags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {graduation.riskFlags.map((flag) => (
                <div
                  key={flag.message}
                  className={`rounded-2xl border px-3 py-2 text-sm leading-6 ${
                    flag.severity === 'warn'
                      ? 'border-amber-400/30 bg-amber-400/10 text-amber-100'
                      : 'border-gold/20 bg-gold/8 text-slate-200'
                  }`}
                >
                  {flag.message}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="dashboard-destinations">
        <p className="text-label-caps-gold">Get started</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          What do you need help with?
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          Pick an area below to plan your four years, check GEs and major requirements, open the Economics
          prep flowchart, browse resources, ask questions, or review Winter deadlines.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {dashboardDestinations.map((destination) => (
            <DestinationCard
              key={destination.viewId ?? destination.href}
              destination={destination}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </section>

      {upcoming.length > 0 && (
        <section className="panel border border-silver/30 bg-gradient-to-br from-gold/8 via-white/[0.06] to-app-bg/90 p-5 backdrop-blur-xl sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-label-caps-gold">Coming up</p>
              <h3 className="mt-1 text-lg font-semibold tracking-tight">Winter 2026 deadlines</h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('dates')}
              className="text-sm font-medium text-gold hover:text-gold-hover"
            >
              All dates & links →
            </button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {upcoming.map((event) => {
              const priority = inferPriority(event)
              const until = daysUntil(event)
              return (
                <div
                  key={event.date + event.title}
                  className="rounded-2xl border border-silver/28 bg-white/[0.05] p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {formatEventShortDate(event)}
                      {until >= 0 && (
                        <span className="text-slate-500">
                          {' '}
                          · {until === 0 ? 'today' : `${until}d`}
                        </span>
                      )}
                    </span>
                    <span
                      className={`rounded-2xl px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                        priority === 'urgent'
                          ? 'bg-rose-500/18 text-rose-200'
                          : 'badge-gold'
                      }`}
                    >
                      {priority}
                    </span>
                  </div>
                  <h4 className="mt-2 text-sm font-semibold text-white">{event.title}</h4>
                  <p className="mt-1 text-xs leading-5 text-slate-400 line-clamp-2">{event.detail}</p>
                </div>
              )
            })}
          </div>
        </section>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-silver/30 bg-gradient-to-r from-gold/10 via-white/[0.05] to-app-bg px-5 py-4">
        <p className="text-sm text-slate-300">
          SILVER plans alongside <span className="text-gold">Gaucho GOLD</span> — enroll and verify your
          record in the official system.
        </p>
        <GoldLink variant="pill">Open Gaucho GOLD</GoldLink>
      </div>
    </div>
  )
}
