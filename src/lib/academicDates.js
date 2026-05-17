import { winterDates } from '../mockData'

/** Demo “today” for Winter 2026 prototype timelines. */
export const DEMO_TODAY = '2026-01-10'

export const DATE_CATEGORY_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'academic', label: 'Academic' },
  { id: 'registration', label: 'Registration' },
  { id: 'billing', label: 'Billing' },
  { id: 'major', label: 'Major' },
]

const CATEGORY_CHIP = {
  academic: 'bg-sky-500/15 text-sky-200',
  billing: 'bg-emerald-400/15 text-emerald-200',
  major: 'badge-silver-strong',
  registration: 'border-gold/30 bg-gold/12 text-gold',
}

const PRIORITY_FROM_CATEGORY = {
  registration: 'urgent',
  academic: 'upcoming',
  major: 'upcoming',
  billing: 'normal',
}

export function getTimelineEvents() {
  return [...winterDates].sort((a, b) => a.date.localeCompare(b.date))
}

export function filterTimelineByCategory(events, categoryId) {
  if (categoryId === 'all') {
    return events
  }
  return events.filter((event) => event.category === categoryId)
}

export function getUpcomingEvents(events, { today = DEMO_TODAY, limit } = {}) {
  const upcoming = events.filter((event) => event.date >= today)
  return typeof limit === 'number' ? upcoming.slice(0, limit) : upcoming
}

export function countUpcomingEvents(events, today = DEMO_TODAY) {
  return events.filter((event) => event.date >= today).length
}

export function formatEventShortDate(event) {
  return `${event.month} ${event.day}`
}

export function getCategoryChipClass(category) {
  return CATEGORY_CHIP[category] ?? 'bg-white/10 text-slate-300'
}

export function inferPriority(event) {
  return event.priority ?? PRIORITY_FROM_CATEGORY[event.category] ?? 'normal'
}

export function daysUntil(event, today = DEMO_TODAY) {
  const start = new Date(`${today}T00:00:00`)
  const end = new Date(`${event.date}T00:00:00`)
  return Math.round((end - start) / (1000 * 60 * 60 * 24))
}
