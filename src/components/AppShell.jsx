'use client'

import { useMemo, useState } from 'react'
import { GoldLink } from './GoldLink'
import { AppIcon } from './AppIcon'
import { ReminderPanel } from './ReminderPanel'
import { SilverLogo } from './SilverLogo'
import { countUpcomingEvents, getTimelineEvents } from '../lib/academicDates'

function InfoTile({ label, value }) {
  return (
    <div className="rounded-2xl border border-silver/30 bg-slate-950/50 p-3">
      <div className="text-xs uppercase tracking-[0.16em] text-slate-400">{label}</div>
      <div className="mt-2 font-medium text-white">{value}</div>
    </div>
  )
}

export function AppShell({
  studentProfile,
  navItems,
  activeView,
  onNavigate,
  sidebarRevealed,
  children,
  renderNavDescription,
}) {
  const [remindersOpen, setRemindersOpen] = useState(false)
  const timelineEvents = useMemo(() => getTimelineEvents(), [])
  const upcomingCount = useMemo(() => countUpcomingEvents(timelineEvents), [timelineEvents])
  const isDashboard = activeView === 'dashboard'
  const showSidebar = !isDashboard || sidebarRevealed

  return (
    <div className="app-page-bg relative min-h-screen text-slate-50">
      <div className="app-page-overlay pointer-events-none fixed inset-0" />

      <header className="fixed inset-x-0 top-0 z-50 border-b border-silver/30 bg-logo-navy shadow-[0_8px_32px_rgba(3,30,59,0.55)]">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <SilverLogo
              height={36}
              priority
              className="sm:!max-h-10"
              href={null}
              onClick={() => onNavigate('dashboard')}
            />
            <p className="hidden text-sm text-slate-300 sm:block">One stop shop when GOLD won&apos;t cut it</p>
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <div className="rounded-2xl border border-silver/30 bg-slate-950/50 px-4 py-2 text-sm text-slate-300">
              Winter 2026 planning snapshot for {studentProfile.firstName}
            </div>
            <GoldLink variant="pill">Open Gaucho GOLD</GoldLink>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open deadline reminders"
              onClick={() => setRemindersOpen(true)}
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-silver/30 bg-slate-950/50 text-slate-200 transition hover:border-silver/40 hover:text-silver"
            >
              <AppIcon name="bell" className="h-5 w-5" />
              {upcomingCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-silver px-1 text-[11px] font-bold text-ucsb-navy">
                  {upcomingCount}
                </span>
              )}
            </button>
            <div className="flex items-center gap-3 rounded-2xl border border-silver/30 bg-slate-950/50 px-2 py-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ucsb-navy text-sm font-semibold text-silver">
                {studentProfile.initials}
              </div>
              <div className="hidden pr-2 text-left sm:block">
                <div className="text-sm font-medium">{studentProfile.name}</div>
                <div className="text-xs text-slate-400">{studentProfile.major}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {remindersOpen && (
        <ReminderPanel
          events={timelineEvents}
          onClose={() => setRemindersOpen(false)}
          onOpenDates={() => onNavigate('dates')}
        />
      )}

      <div
        className={`relative mx-auto flex max-w-[1600px] flex-col gap-6 px-4 pb-6 pt-[4.75rem] sm:px-6 lg:px-8 ${
          showSidebar ? 'lg:flex-row' : 'lg:flex-col'
        }`}
      >
        <aside
          className={`w-full shrink-0 overflow-hidden transition-all duration-500 ease-out lg:sticky lg:top-[4.75rem] lg:w-80 lg:self-start ${
            showSidebar
              ? 'max-h-[2000px] opacity-100'
              : 'pointer-events-none max-h-0 opacity-0 lg:max-h-0 lg:w-0 lg:opacity-0'
          }`}
          aria-hidden={!showSidebar}
        >
          <div className="surface-card p-4">
            <div className="snapshot-card">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-label-caps">Student snapshot</p>
                  <h1 className="mt-3 text-2xl font-semibold tracking-tight">{studentProfile.name}</h1>
                  <p className="mt-1 text-sm text-slate-300">{studentProfile.major}</p>
                </div>
                <div className="badge-silver rounded-2xl px-3 py-1 text-xs font-semibold">
                  {studentProfile.year}
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>Graduation progress</span>
                  <span className="font-semibold text-white">{studentProfile.completedPercent}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-800/80">
                  <div
                    className="progress-silver h-full rounded-2xl"
                    style={{ width: `${studentProfile.completedPercent}%` }}
                  />
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <InfoTile label="Expected grad" value={studentProfile.expectedGraduation} />
                <InfoTile label="Standing" value={studentProfile.standing} />
              </div>
            </div>

            <nav className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-1">
              {navItems.map((item) => {
                const isActive = activeView === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onNavigate(item.id)}
                    className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                      isActive
                        ? 'nav-active'
                        : 'border-silver/30 bg-slate-950/50 text-slate-300 hover:border-silver/40 hover:bg-slate-950/60 hover:text-white'
                    }`}
                  >
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                        isActive ? 'nav-active-icon' : 'bg-slate-900/80 text-slate-300'
                      }`}
                    >
                      <AppIcon name={item.icon} className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block text-sm font-medium">{item.label}</span>
                      <span className="block text-xs text-slate-400">
                        {renderNavDescription(item.id)}
                      </span>
                    </span>
                  </button>
                )
              })}
            </nav>
          </div>
        </aside>

        <main
          key={activeView}
          className={`page-enter min-w-0 flex-1 ${isDashboard ? 'dashboard-main' : ''}`}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
