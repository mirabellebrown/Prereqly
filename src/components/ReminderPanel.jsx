'use client'

import { useEffect, useState } from 'react'
import { GoldLink } from './GoldLink'
import {
  daysUntil,
  formatEventShortDate,
  getCategoryChipClass,
  getUpcomingEvents,
  inferPriority,
} from '../lib/academicDates'

const REMINDER_PREFS_KEY = 'ucsb-silver-reminder-prefs'

function readReminderPrefs() {
  if (typeof window === 'undefined') {
    return { emailReminders: true, pushReminders: false }
  }
  try {
    const raw = window.localStorage.getItem(REMINDER_PREFS_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    return {
      emailReminders: parsed?.emailReminders ?? true,
      pushReminders: false,
    }
  } catch {
    return { emailReminders: true, pushReminders: false }
  }
}

function writeReminderPrefs(prefs) {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(REMINDER_PREFS_KEY, JSON.stringify(prefs))
}

export function ReminderPanel({ events, onClose, onOpenDates }) {
  const [emailReminders, setEmailReminders] = useState(true)
  const [pushReminders, setPushReminders] = useState(false)

  useEffect(() => {
    const prefs = readReminderPrefs()
    setEmailReminders(prefs.emailReminders)
    setPushReminders(prefs.pushReminders)
  }, [])

  useEffect(() => {
    writeReminderPrefs({ emailReminders, pushReminders })
  }, [emailReminders, pushReminders])

  const upcoming = getUpcomingEvents(events)

  return (
    <>
      <button
        type="button"
        aria-label="Close reminders"
        className="fixed inset-0 z-40 bg-app-bg/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-silver/30 bg-app-bg shadow-[-20px_0_80px_rgba(3,30,59,0.65)]">
        <div className="flex items-center justify-between border-b border-silver/30 px-5 py-4">
          <div>
            <p className="text-label-caps">Reminders</p>
            <h2 className="text-xl font-semibold tracking-tight">Deadlines & pass times</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-silver/30 px-3 py-1.5 text-sm text-slate-300 hover:border-silver/40 hover:text-white"
          >
            Close
          </button>
        </div>

        <div className="border-b border-silver/30 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Notification preferences</p>
          <label className="mt-3 flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-silver/30 bg-slate-950/50 px-3 py-3">
            <span className="text-sm text-slate-200">Email reminders (demo)</span>
            <input
              type="checkbox"
              checked={emailReminders}
              onChange={(event) => setEmailReminders(event.target.checked)}
              className="h-4 w-4 accent-silver"
            />
          </label>
          <label className="mt-2 flex cursor-not-allowed items-center justify-between gap-3 rounded-2xl border border-silver/30 bg-slate-950/50 px-3 py-3 opacity-60">
            <span className="text-sm text-slate-400">
              Push notifications <span className="text-slate-500">(coming soon)</span>
            </span>
            <input type="checkbox" checked={pushReminders} disabled className="h-4 w-4" />
          </label>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <p className="text-xs text-slate-500">
            {upcoming.length} upcoming items in this Winter 2026 demo. Verify every date in the registrar
            calendar and GOLD.
          </p>
          <ul className="mt-4 space-y-3">
            {upcoming.map((event) => {
              const until = daysUntil(event)
              const priority = inferPriority(event)
              return (
                <li
                  key={event.date + event.title}
                  className="rounded-2xl border border-silver/30 bg-slate-950/50 p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {formatEventShortDate(event)}
                      {until >= 0 && (
                        <span className="text-slate-500">
                          {' '}
                          · {until === 0 ? 'Today' : `${until}d`}
                        </span>
                      )}
                    </span>
                    <span
                      className={`rounded-2xl px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${getCategoryChipClass(event.category)}`}
                    >
                      {event.category}
                    </span>
                  </div>
                  <h3 className="mt-2 text-sm font-semibold text-white">{event.title}</h3>
                  <p className="mt-1 text-xs leading-5 text-slate-400">{event.detail}</p>
                  {event.category === 'registration' && (
                    <div className="mt-2">
                      <GoldLink variant="pill">Open enrollment in GOLD</GoldLink>
                    </div>
                  )}
                  {priority === 'urgent' && (
                    <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-rose-200">
                      High priority
                    </p>
                  )}
                </li>
              )
            })}
          </ul>
        </div>

        <div className="border-t border-silver/30 px-5 py-4">
          <button
            type="button"
            onClick={() => {
              onOpenDates()
              onClose()
            }}
            className="w-full rounded-2xl border border-silver/25 bg-silver/10 px-4 py-2.5 text-sm font-semibold text-silver-bright hover:bg-silver/15"
          >
            View all dates & links
          </button>
        </div>
      </aside>
    </>
  )
}
