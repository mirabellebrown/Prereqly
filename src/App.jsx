'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { AppShell } from './components/AppShell'
import { AppIcon } from './components/AppIcon'
import { GoldLink, GoldSourceChip } from './components/GoldLink'
import {
  advisorSuggestedCourses,
  chatbotSeedMessages,
  dashboardMetrics,
  navItems,
  plannerLegend,
  plannerSuggestions,
  plannerTemplate,
  quickAccessCards,
  requirementSections,
  studentProfile,
} from './mockData'
import {
  DATE_CATEGORY_FILTERS,
  daysUntil,
  filterTimelineByCategory,
  formatEventShortDate,
  getCategoryChipClass,
  getTimelineEvents,
  getUpcomingEvents,
  inferPriority,
} from './lib/academicDates'
import { useCourseGradeSummaries } from './lib/useCourseGradeSummaries'
import { buildGraduationSummary } from './lib/graduationProgress'
import {
  buildPrerequisiteChatReply,
  checkPrerequisitesMet,
  extractCourseCodesFromText,
} from './lib/econPrerequisites'
import { getRequirementStatusDisplay, requirementStatusClassName } from './lib/requirementStatus'
import {
  getOfferedLabel,
  getQuarterLoadStatus,
  getQuarterUnits,
  isOfferedInQuarter,
  parseQuarterKey,
} from './lib/plannerLoad'
import { GeExplainer } from './components/GeExplainer'
import { ResourcesView } from './components/ResourcesView'
import { politicalScienceMinorPreview } from './data/politicalScienceMinorPreview'
import { chatPromptSuggestions } from './data/campusResources'
import { buildChatReply, ensureOfficialSources, OFFICIAL_SOURCE } from './lib/chatIntents'

const quarters = ['Fall', 'Winter', 'Spring']
const storageKeys = {
  planner: 'ucsb-silver-planner',
  transferCredits: 'ucsb-silver-transfer-credits',
  manualRequirementCompletions: 'ucsb-silver-manual-requirements',
}

const legacyStorageKeys = {
  planner: 'prereqly-planner',
  transferCredits: 'prereqly-transfer-credits',
  manualRequirementCompletions: 'prereqly-manual-requirements',
}

function createPlannerState() {
  return plannerTemplate.map((yearPlan) => ({
    ...yearPlan,
    quarters: Object.fromEntries(
      quarters.map((quarter) => [
        quarter,
        yearPlan.quarters[quarter].map((course) => ({ ...course })),
      ]),
    ),
  }))
}

function getMonthMatrix(year, monthIndex) {
  const firstWeekday = new Date(year, monthIndex, 1).getDay()
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const cells = Array.from({ length: firstWeekday }, () => null)

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(day)
  }

  while (cells.length % 7 !== 0) {
    cells.push(null)
  }

  return cells
}

function readStoredValue(key, legacyKey) {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const storedValue =
      window.localStorage.getItem(key) ??
      (legacyKey ? window.localStorage.getItem(legacyKey) : null)
    return storedValue ? JSON.parse(storedValue) : null
  } catch {
    return null
  }
}

function writeStoredValue(key, value) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(key, JSON.stringify(value))
}

function plannerMatchesRequirement(item, plannedCourseCodes) {
  if (!item.courseCodes?.length) {
    return false
  }

  return item.courseCodes.some((courseCode) => plannedCourseCodes.has(courseCode))
}

function App() {
  const [activeView, setActiveView] = useState('dashboard')
  const [planner, setPlanner] = useState(() => {
    const storedPlanner = readStoredValue(storageKeys.planner, legacyStorageKeys.planner)
    return Array.isArray(storedPlanner) ? storedPlanner : createPlannerState()
  })
  const [selectedQuarterKey, setSelectedQuarterKey] = useState('Year 2|Spring')
  const [transferCredits, setTransferCredits] = useState(() => {
    const storedTransferCredits = readStoredValue(
      storageKeys.transferCredits,
      legacyStorageKeys.transferCredits,
    )
    return typeof storedTransferCredits === 'boolean' ? storedTransferCredits : false
  })
  const [manualRequirementCompletions, setManualRequirementCompletions] = useState(() => {
    const storedManualRequirementCompletions = readStoredValue(
      storageKeys.manualRequirementCompletions,
      legacyStorageKeys.manualRequirementCompletions,
    )

    return storedManualRequirementCompletions &&
      typeof storedManualRequirementCompletions === 'object' &&
      !Array.isArray(storedManualRequirementCompletions)
      ? storedManualRequirementCompletions
      : {}
  })
  const [chatMessages, setChatMessages] = useState(chatbotSeedMessages)
  const [draftMessage, setDraftMessage] = useState('')
  const [selectedCourseGrades, setSelectedCourseGrades] = useState(null)
  const hasLoadedSavedState = true

  useEffect(() => {
    writeStoredValue(storageKeys.planner, planner)
    writeStoredValue(storageKeys.transferCredits, transferCredits)
    writeStoredValue(storageKeys.manualRequirementCompletions, manualRequirementCompletions)
  }, [planner, transferCredits, manualRequirementCompletions])

  const plannedCourseCodes = useMemo(
    () =>
      new Set(
        planner.flatMap((yearPlan) =>
          quarters.flatMap((quarter) =>
            yearPlan.quarters[quarter].map((course) => course.code),
          ),
        ),
      ),
    [planner],
  )

  const checklistSections = useMemo(
    () =>
      requirementSections.map((section) => {
        const items = section.items.map((item) => {
          const matchesPlanner = plannerMatchesRequirement(item, plannedCourseCodes)
          const isManualCompletion = Boolean(manualRequirementCompletions[item.id])
          const isTransferCompletion = transferCredits && item.transferEligible && !item.completed

          let status = 'pending'
          let source = 'pending'

          if (item.completed) {
            status = 'completed'
            source = 'record'
          } else if (isManualCompletion) {
            status = 'completed'
            source = 'manual'
          } else if (isTransferCompletion) {
            status = 'completed'
            source = 'transfer'
          } else if (matchesPlanner) {
            status = 'planned'
            source = 'planner'
          }

          return {
            ...item,
            autoFilled: source === 'transfer',
            isInteractive: source !== 'record' && source !== 'transfer',
            isPlanned: status === 'planned',
            isSatisfied: status === 'completed',
            actionLabel:
              source === 'manual'
                ? 'Clear manual mark'
                : source === 'record'
                  ? 'Already completed'
                  : source === 'transfer'
                    ? 'Covered by transfer credit'
                    : 'Mark completed',
            source,
            status,
          }
        })

        return {
          ...section,
          items,
          completedCount: items.filter((item) => item.isSatisfied).length,
          plannedCount: items.filter((item) => item.isPlanned).length,
        }
      }),
    [manualRequirementCompletions, plannedCourseCodes, transferCredits],
  )

  const allRequirementItems = checklistSections.flatMap((section) => section.items)
  const completedRequirementCount = allRequirementItems.filter((item) => item.isSatisfied).length
  const plannedRequirementCount = allRequirementItems.filter((item) => item.isPlanned).length
  const checklistPercent = Math.round(
    (completedRequirementCount / allRequirementItems.length) * 100,
  )
  const plannedCoveragePercent = Math.round(
    ((completedRequirementCount + plannedRequirementCount) / allRequirementItems.length) * 100,
  )
  const transferAutoFilled = allRequirementItems.filter((item) => item.source === 'transfer').length

  const satisfiedCourseCodes = useMemo(() => {
    const codes = new Set(plannedCourseCodes)
    for (const item of allRequirementItems) {
      if (item.isSatisfied && item.courseCodes?.length) {
        for (const code of item.courseCodes) {
          codes.add(code)
        }
      }
    }
    return codes
  }, [allRequirementItems, plannedCourseCodes])

  function handleAddSuggestedCourse(course) {
    if (plannedCourseCodes.has(course.code)) {
      return
    }

    const prereqCheck = checkPrerequisitesMet(course.code, satisfiedCourseCodes)
    if (!prereqCheck.ok) {
      return
    }

    const [selectedYear, selectedQuarter] = selectedQuarterKey.split('|')
    setPlanner((currentPlanner) =>
      currentPlanner.map((yearPlan) => {
        if (yearPlan.year !== selectedYear) {
          return yearPlan
        }

        return {
          ...yearPlan,
          quarters: {
            ...yearPlan.quarters,
            [selectedQuarter]: [...yearPlan.quarters[selectedQuarter], { ...course }],
          },
        }
      }),
    )
  }

  function handleToggleRequirement(item) {
    if (!item.isInteractive) {
      return
    }

    setManualRequirementCompletions((current) => {
      const next = { ...current }

      if (current[item.id]) {
        delete next[item.id]
      } else {
        next[item.id] = true
      }

      return next
    })
  }

  function handleSendMessage() {
    const trimmed = draftMessage.trim()
    if (!trimmed) {
      return
    }

    const courseCodesInQuestion = extractCourseCodesFromText(trimmed)
    const reply = ensureOfficialSources(
      courseCodesInQuestion.length > 0
        ? {
            ...buildPrerequisiteChatReply(courseCodesInQuestion[0], satisfiedCourseCodes),
            resources: [
              OFFICIAL_SOURCE.catalog,
              OFFICIAL_SOURCE.gold,
              { label: 'Economics prep flowchart (demo)', url: '/econ-prep-map' },
            ],
          }
        : buildChatReply(trimmed),
    )
    setChatMessages((currentMessages) => [
      ...currentMessages,
      { id: `user-${Date.now()}`, sender: 'user', text: trimmed },
      {
        id: `bot-${Date.now() + 1}`,
        sender: 'bot',
        text: reply.text,
        bullets: reply.bullets,
        resources: reply.resources,
        policySnippet: reply.policySnippet ?? null,
        intentId: reply.intentId ?? null,
      },
    ])
    setDraftMessage('')
  }

  function handleAskAboutSnippet(snippet) {
    setActiveView('chat')
    setDraftMessage(`What should I know about: ${snippet.title}?`)
  }

  function handleChatPrompt(prompt) {
    setDraftMessage(prompt)
    setActiveView('chat')
  }

  function handleOpenCourseGrades(course, summary) {
    setSelectedCourseGrades({
      ...course,
      summary,
    })
  }

  const activeContent = {
    dashboard: (
      <DashboardView
        checklistSections={checklistSections}
        onNavigate={setActiveView}
        planner={planner}
      />
    ),
    planner: (
      <PlannerView
        planner={planner}
        selectedQuarterKey={selectedQuarterKey}
        onSelectQuarter={setSelectedQuarterKey}
        onAddSuggestedCourse={handleAddSuggestedCourse}
        onOpenCourseGrades={handleOpenCourseGrades}
        plannedCourseCodes={plannedCourseCodes}
        satisfiedCourseCodes={satisfiedCourseCodes}
      />
    ),
    checklist: (
      <ChecklistView
        checklistPercent={checklistPercent}
        completedRequirementCount={completedRequirementCount}
        plannedCoveragePercent={plannedCoveragePercent}
        plannedRequirementCount={plannedRequirementCount}
        sections={checklistSections}
        transferAutoFilled={transferAutoFilled}
        transferCredits={transferCredits}
        hasLoadedSavedState={hasLoadedSavedState}
        onToggleTransferCredits={() => setTransferCredits((current) => !current)}
        onToggleRequirement={handleToggleRequirement}
      />
    ),
    resources: (
      <ResourcesView onNavigate={setActiveView} onAskAboutSnippet={handleAskAboutSnippet} />
    ),
    chat: (
      <ChatView
        draftMessage={draftMessage}
        messages={chatMessages}
        onDraftChange={setDraftMessage}
        onNavigate={setActiveView}
        onOpenCourseGrades={handleOpenCourseGrades}
        onSelectPrompt={handleChatPrompt}
        onSendMessage={handleSendMessage}
        promptSuggestions={chatPromptSuggestions}
      />
    ),
    dates: <DatesView />,
  }[activeView]

  const navDescriptions = {
    dashboard: 'Overview, progress, and action cards',
    planner: 'Click-to-add roadmap across four years',
    checklist: 'Track requirements and transfer credit',
    resources: 'Official links and policy snippet library',
    chat: 'General UCSB questions with official source links',
    dates: 'Winter 2026 deadlines and calendar',
  }

  return (
    <>
      <AppShell
        studentProfile={studentProfile}
        navItems={navItems}
        activeView={activeView}
        onNavigate={setActiveView}
        renderNavDescription={(id) => navDescriptions[id] ?? ''}
      >
        {activeContent}
      </AppShell>

      <CourseGradesDetailModal
        course={selectedCourseGrades}
        onClose={() => setSelectedCourseGrades(null)}
      />
    </>
  )
}

function DashboardView({ checklistSections, onNavigate, planner }) {
  const totalPlannedUnits = planner
    .flatMap((yearPlan) => quarters.flatMap((quarter) => yearPlan.quarters[quarter]))
    .reduce((sum, course) => sum + course.units, 0)

  const graduation = buildGraduationSummary({ studentProfile, checklistSections })

  return (
    <div className="space-y-6">
      <section className="panel-hero border border-gold/20 bg-gradient-to-br from-ucsb-navy via-[#0b2442] to-slate-950 p-6 shadow-[0_20px_90px_rgba(2,8,23,0.35)]">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <ProgressRing percent={graduation.checklistPercent} />
            <div>
              <p className="text-label-caps">Graduation progress</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                {graduation.onTrack ? 'On track' : 'Needs attention'} for {graduation.expectedGraduation}
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Demo record for {studentProfile.firstName} · verify in Gaucho GOLD before enrolling
              </p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Units completed</span>
                  <div className="font-semibold text-white">
                    {graduation.unitsCompleted} / {graduation.unitsTarget}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Units remaining</span>
                  <div className="font-semibold text-white">{graduation.unitsRemaining}</div>
                </div>
                <div>
                  <span className="text-slate-400">Planned in roadmap</span>
                  <div className="font-semibold text-white">{totalPlannedUnits} units</div>
                </div>
              </div>
            </div>
          </div>

          {graduation.riskFlags.length > 0 && (
            <div className="w-full max-w-md space-y-2 lg:max-w-sm">
              {graduation.riskFlags.map((flag) => (
                <div
                  key={flag.message}
                  className={`rounded-2xl border px-3 py-2 text-sm leading-6 ${
                    flag.severity === 'warn'
                      ? 'border-amber-400/30 bg-amber-400/10 text-amber-100'
                      : 'border-silver/25 bg-silver/8 text-slate-200'
                  }`}
                >
                  {flag.message}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
        <div className="panel border border-white/10 bg-white/6 p-6 backdrop-blur-xl">
          <p className="text-label-caps">What&apos;s left</p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight">Requirements still open</h3>
          <p className="mt-1 text-sm text-slate-400">
            {graduation.checklistPercent}% of checklist items satisfied in this demo path.
          </p>
          <ul className="mt-4 divide-y divide-white/10">
            {graduation.whatsLeft.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-3 py-3 text-sm">
                <div>
                  <div className="font-medium text-white">{item.label}</div>
                  <div className="text-slate-400">{item.detail}</div>
                </div>
                <span
                  className={`shrink-0 rounded-2xl px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                    item.isPlanned ? 'badge-silver' : 'border border-white/15 bg-white/5 text-slate-400'
                  }`}
                >
                  {item.isPlanned ? 'In planner' : 'Open'}
                </span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => onNavigate('checklist')}
            className="mt-4 text-sm font-medium text-silver hover:text-silver-bright"
          >
            Open degree checklist →
          </button>
        </div>

        <div className="panel border border-white/10 bg-white/6 p-6 backdrop-blur-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-label-caps">Next up</p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight">Winter 2026</h3>
            </div>
            <AppIcon name="calendar" className="h-6 w-6 text-silver" />
          </div>

          <div className="mt-4 space-y-3">
            {getUpcomingEvents(getTimelineEvents(), { limit: 3 }).map((event) => {
              const priority = inferPriority(event)
              const until = daysUntil(event)
              return (
                <div
                  key={event.date + event.title}
                  className="rounded-2xl border border-white/10 bg-slate-950/45 p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-2xl bg-white/8 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-200">
                      {formatEventShortDate(event)}
                      {until >= 0 && (
                        <span className="text-slate-500">
                          {' '}
                          · {until === 0 ? 'today' : `${until}d`}
                        </span>
                      )}
                    </span>
                    <span
                      className={`rounded-2xl px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                        priority === 'urgent'
                          ? 'bg-rose-500/18 text-rose-200'
                          : priority === 'upcoming'
                            ? 'badge-silver-strong'
                            : 'bg-sky-500/15 text-sky-200'
                      }`}
                    >
                      {priority}
                    </span>
                  </div>
                  <h4 className="mt-2 text-sm font-semibold">{event.title}</h4>
                  <p className="mt-1 text-xs leading-5 text-slate-400">{event.detail}</p>
                  {event.category === 'registration' && (
                    <div className="mt-2">
                      <GoldLink variant="pill">Open enrollment in GOLD</GoldLink>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <button
            type="button"
            onClick={() => onNavigate('dates')}
            className="mt-4 text-sm font-medium text-silver hover:text-silver-bright"
          >
            Full calendar →
          </button>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
        {dashboardMetrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-label-caps">Quick access</p>
            <h3 className="mt-1 text-xl font-semibold tracking-tight">Tools</h3>
          </div>
        </div>

        <div className="grid gap-3 xl:grid-cols-2 2xl:grid-cols-4">
          {quickAccessCards.map((card) => {
            const shellClass = `group panel border border-white/10 bg-gradient-to-br ${card.accent} from-10% to-90% p-[1px] text-left transition hover:-translate-y-0.5`
            const inner = (
              <div className="h-full bg-slate-950/85 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-base font-semibold tracking-tight">{card.title}</h4>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{card.description}</p>
                  </div>
                  <span className="rounded-2xl border border-white/10 bg-white/5 p-2 text-slate-200 transition group-hover:border-silver/25 group-hover:text-silver">
                    <AppIcon name="arrow-up-right" className="h-4 w-4" />
                  </span>
                </div>
              </div>
            )
            if (card.href) {
              return (
                <Link key={card.id} href={card.href} className={shellClass}>
                  {inner}
                </Link>
              )
            }
            return (
              <button key={card.id} type="button" onClick={() => onNavigate(card.id)} className={shellClass}>
                {inner}
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}


function QuarterLoadBanner({ load, compact = false, className = '' }) {
  if (!load) {
    return null
  }

  return (
    <div
      className={`rounded-2xl border px-3 py-2 text-xs leading-5 ${load.className} ${compact ? 'mt-3' : ''} ${className}`.trim()}
    >
      <div className="font-semibold uppercase tracking-wide">{load.label}</div>
      {!compact && <p className="mt-1">{load.message}</p>}
      {compact && load.level !== 'balanced' && <p className="mt-1">{load.message}</p>}
    </div>
  )
}

function PlannerView({
  planner,
  selectedQuarterKey,
  onSelectQuarter,
  onAddSuggestedCourse,
  onOpenCourseGrades,
  plannedCourseCodes,
  satisfiedCourseCodes,
}) {
  const plannerCourseCodes = useMemo(
    () =>
      planner.flatMap((yearPlan) =>
        quarters.flatMap((quarter) => yearPlan.quarters[quarter].map((course) => course.code)),
      ),
    [planner],
  )
  const { error: gradesError, isLoading: isLoadingGrades, summaries: gradeSummaries } =
    useCourseGradeSummaries([...plannerCourseCodes, ...plannerSuggestions.map((course) => course.code)])

  const { quarter: selectedQuarterName } = parseQuarterKey(selectedQuarterKey)
  const selectedYearPlan = planner.find((yearPlan) => yearPlan.year === parseQuarterKey(selectedQuarterKey).year)
  const selectedQuarterUnits = selectedYearPlan ? getQuarterUnits(selectedYearPlan, selectedQuarterName) : 0
  const selectedQuarterLoad = getQuarterLoadStatus(selectedQuarterUnits)

  return (
    <div className="grid gap-6 xl:grid-cols-[1.6fr,0.9fr]">
      <section className="space-y-6">
        <div className="panel border border-white/10 bg-white/6 p-6 backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-label-caps">4-Year Planner</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">Map every quarter at a glance</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                Click a quarter card to target it, then use the recommendation panel to add a course.
                The grid is pre-filled with a sample L&S Economics pathway and color-coded by requirement type.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {Object.entries(plannerLegend).map(([key, value]) => (
                <span
                  key={key}
                  className={`rounded-2xl border px-3 py-1 text-xs font-semibold ${value.badgeClass}`}
                >
                  {value.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {planner.map((yearPlan) => (
            <div
              key={yearPlan.year}
              className="panel border border-white/10 bg-white/5 p-4 shadow-[0_20px_60px_rgba(2,8,23,0.22)]"
            >
              <div className="flex items-center justify-between gap-3 px-2 pb-4">
                <div>
                  <h3 className="text-xl font-semibold tracking-tight">{yearPlan.year}</h3>
                  <p className="text-sm text-slate-400">Fall, Winter, and Spring planning block</p>
                </div>
                <span className="rounded-2xl border border-white/10 bg-white/6 px-3 py-1 text-xs text-slate-300">
                  {quarters.reduce(
                    (sum, quarter) =>
                      sum +
                      yearPlan.quarters[quarter].reduce((quarterSum, course) => quarterSum + course.units, 0),
                    0,
                  )}{' '}
                  units planned
                </span>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                {quarters.map((quarter) => {
                  const quarterKey = `${yearPlan.year}|${quarter}`
                  const isSelected = quarterKey === selectedQuarterKey
                  const courses = yearPlan.quarters[quarter]
                  const quarterUnits = courses.reduce((sum, course) => sum + course.units, 0)
                  const quarterLoad = getQuarterLoadStatus(quarterUnits)

                  return (
                    <div
                      key={quarter}
                      onClick={() => onSelectQuarter(quarterKey)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          onSelectQuarter(quarterKey)
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      className={`rounded-2xl border p-4 text-left transition ${
                        isSelected
                          ? 'border-silver/40 bg-silver/10 shadow-[0_0_0_1px_rgba(203,213,225,0.14)]'
                          : 'border-white/10 bg-slate-950/45 hover:border-white/20 hover:bg-slate-900/70'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="text-sm uppercase tracking-[0.18em] text-slate-400">{quarter}</div>
                          <div className="mt-1 text-lg font-semibold">{quarterUnits} units</div>
                        </div>
                        {isSelected && (
                          <span className="rounded-2xl bg-silver px-3 py-1 text-xs font-bold text-ucsb-navy">
                            Selected
                          </span>
                        )}
                      </div>

                      <QuarterLoadBanner load={quarterLoad} compact />

                      <div className="mt-4 space-y-3">
                        {courses.map((course, index) => (
                          <button
                            key={`${course.code}-${index}`}
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              if (!isLoadingGrades) {
                                onOpenCourseGrades(course, gradeSummaries[course.code] ?? null)
                              }
                            }}
                            className={`w-full rounded-2xl border p-3 text-left transition hover:border-white/30 ${plannerLegend[course.type].badgeClass}`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="font-semibold">{course.code}</div>
                              <span className={`rounded-2xl px-2 py-1 text-[11px] font-semibold ${plannerLegend[course.type].pillClass}`}>
                                {course.units} units
                              </span>
                            </div>
                            <div className="mt-1 text-sm leading-6 text-slate-100/90">{course.title}</div>
                            <CourseGradesSummary
                              isLoading={isLoadingGrades}
                              summary={gradeSummaries[course.code] ?? null}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
        <div className="panel border border-gold/30 bg-gradient-to-br from-gold/14 via-silver/12 via-ucsb-navy to-slate-950 p-6">
          <p className="text-label-caps-gold">Selected quarter</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight">
            {selectedQuarterKey.replace('|', ' · ')}
          </h3>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Add one of the recommended courses below to simulate course planning without reloading the page.
          </p>
          <QuarterLoadBanner load={selectedQuarterLoad} className="mt-4" />
        </div>

        <div className="panel border border-white/10 bg-white/6 p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-label-caps">Recommended adds</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight">Next quarter options</h3>
            </div>
            <AppIcon name="spark" className="h-6 w-6 text-silver" />
          </div>

          <div className="mt-5 space-y-4">
            {plannerSuggestions.map((course) => {
              const isAdded = plannedCourseCodes.has(course.code)
              const prereqCheck = checkPrerequisitesMet(course.code, satisfiedCourseCodes)
              const canAdd = !isAdded && prereqCheck.ok
              const offeredInTarget = isOfferedInQuarter(course, selectedQuarterName)
              const offeredLabel = getOfferedLabel(course, selectedQuarterName)
              return (
                <div
                  key={course.code}
                  className="rounded-2xl border border-white/10 bg-slate-950/45 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        if (!isLoadingGrades) {
                          onOpenCourseGrades(course, gradeSummaries[course.code] ?? null)
                        }
                      }}
                      className="min-w-0 flex-1 text-left"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-semibold">{course.code}</span>
                        <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${plannerLegend[course.type].pillClass}`}>
                          {plannerLegend[course.type].label}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            offeredInTarget ? 'badge-gold' : 'border border-white/15 bg-white/5 text-slate-400'
                          }`}
                        >
                          {offeredLabel}
                        </span>
                      </div>
                      {course.reasonTags?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {course.reasonTags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-silver/25 bg-silver/10 px-2.5 py-0.5 text-[11px] font-semibold text-silver-bright"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="mt-2 text-sm text-slate-300">{course.title}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-400">{course.note}</p>
                      {!prereqCheck.ok && (
                        <p className="mt-2 text-xs leading-5 text-amber-200">
                          Missing prerequisites: {prereqCheck.missing.join(', ')}.{' '}
                          <Link href="/econ-prep-map" className="font-semibold underline">
                            View prep flowchart
                          </Link>
                        </p>
                      )}
                      <CourseGradesSummary
                        isLoading={isLoadingGrades}
                        summary={gradeSummaries[course.code] ?? null}
                      />
                    </button>
                    <button
                      type="button"
                      disabled={!canAdd}
                      onClick={() => onAddSuggestedCourse(course)}
                      className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                        isAdded
                          ? 'cursor-not-allowed border border-white/10 bg-white/5 text-slate-500'
                          : !canAdd
                            ? 'cursor-not-allowed border border-amber-400/30 bg-amber-400/10 text-amber-100'
                            : 'bg-silver text-ucsb-navy hover:bg-silver-bright'
                      }`}
                    >
                      {isAdded
                        ? 'Added'
                        : !canAdd
                          ? 'Prereqs missing'
                          : `Add to ${selectedQuarterKey.split('|')[1]}`}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {gradesError && (
            <div className="mt-4 rounded-2xl border border-rose-400/25 bg-rose-500/10 p-4 text-sm text-rose-100">
              Daily Nexus grade data is temporarily unavailable. Planner cards will keep working
              without it.
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <GoldLink variant="button">Verify in Gaucho GOLD</GoldLink>
          </div>
        </div>
      </aside>
    </div>
  )
}

function CourseGradesSummary({ summary, isLoading }) {
  if (isLoading) {
    return (
      <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
        Loading Daily Nexus grades...
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="mt-3 flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-400">
        <span>Daily Nexus grades unavailable for this course.</span>
        <span className="text-slate-500">Click for details</span>
      </div>
    )
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
      <span className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 font-semibold text-emerald-100">
        Avg A range {summary.aRangeRate != null ? `${summary.aRangeRate}%` : 'N/A'}
      </span>
      <span className="rounded-2xl border border-sky-400/20 bg-sky-400/10 px-3 py-1.5 font-semibold text-sky-100">
        Usually {summary.usualOfferedLabel}
      </span>
      <span className="text-slate-400">Click for grade breakdown</span>
    </div>
  )
}

function GradeStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
      <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400">{label}</div>
      <div className="mt-1 text-sm font-semibold text-white">{value}</div>
    </div>
  )
}

function getSnapshotFreshnessLabel(snapshotMeta) {
  if (!snapshotMeta?.quarter || !snapshotMeta?.year) {
    return 'Quarterly snapshot'
  }

  return `Updated after ${snapshotMeta.quarter} ${snapshotMeta.year}`
}

function formatReviewDate(date) {
  const parsedDate = new Date(date)
  if (Number.isNaN(parsedDate.getTime())) {
    return date
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsedDate)
}

function formatCompactPercent(value) {
  if (value == null || Number.isNaN(Number(value))) {
    return 'N/A'
  }

  return `${Number(value).toFixed(2).replace(/\.?0+$/, '')}%`
}

function getGradeBarClass(grade) {
  if (grade.startsWith('A')) {
    return 'bg-[#3f9142]'
  }

  if (grade.startsWith('B')) {
    return 'bg-[#3e92cc]'
  }

  if (grade.startsWith('C')) {
    return 'bg-[#dd6b20]'
  }

  if (grade.startsWith('D')) {
    return 'bg-[#e11d48]'
  }

  return 'bg-slate-100'
}

function OfferingDistributionChart({ offering }) {
  const maxCount = Math.max(...offering.gradeBreakdown.map((entry) => entry.count), 1)
  const tickCount = 5
  const ticks = Array.from({ length: tickCount }, (_, index) =>
    Math.round((maxCount * (tickCount - index)) / tickCount),
  )

  return (
    <div className="panel border border-white/10 bg-slate-950/80 p-4 text-slate-100 shadow-[0_20px_60px_rgba(2,8,23,0.3)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-white">{offering.instructor}</div>
          <div className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
            {offering.term}
          </div>
        </div>
        <div className="text-sm font-semibold text-slate-300">Total: {offering.letterStudentCount}</div>
      </div>

      <div className="mt-5 grid grid-cols-[36px_1fr] gap-3">
        <div className="flex h-52 flex-col justify-between pb-8 text-[11px] text-slate-500">
          {ticks.map((tick) => (
            <span key={tick}>{tick}</span>
          ))}
          <span>0</span>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between pb-8">
            {ticks.map((tick) => (
              <div key={tick} className="border-t border-white/10" />
            ))}
            <div className="border-t border-white/20" />
          </div>

          <div className="relative grid h-52 grid-cols-[repeat(13,minmax(0,1fr))] items-end gap-3 px-2">
            {offering.gradeBreakdown.map((entry) => (
              <div key={entry.grade} className="flex flex-col items-center justify-end">
                <div className="mb-2 text-center text-[11px] leading-4 text-slate-400">
                  <div className="font-semibold text-white">{entry.count}</div>
                  <div>{entry.rate != null ? `${entry.rate}%` : 'N/A'}</div>
                </div>
                <div
                  className={`w-full min-w-4 rounded-t-xl shadow-[0_6px_18px_rgba(15,23,42,0.35)] ${getGradeBarClass(entry.grade)}`}
                  style={{
                    height: `${Math.max((entry.count / maxCount) * 144, entry.count > 0 ? 6 : 0)}px`,
                  }}
                />
                <div className="mt-2 text-[11px] font-medium text-slate-300">{entry.grade}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function OfferingDistributionCharts({ offeringDistributions }) {
  return (
    <div className="grid gap-4">
      {offeringDistributions.map((offering) => (
        <OfferingDistributionChart key={offering.id} offering={offering} />
      ))}
    </div>
  )
}

function ProfessorReviewSection({ instructorName, professorReview, snapshotMeta }) {
  if (!professorReview) {
    return (
      <div className="panel border border-white/10 bg-white/5 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-lg font-semibold text-white">{instructorName}</div>
            <div className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
              {getSnapshotFreshnessLabel(snapshotMeta)}
            </div>
          </div>
        </div>
        <div className="mt-4 text-sm leading-6 text-slate-300">
          No Rate My Professor snapshot is available for this instructor yet.
        </div>
      </div>
    )
  }

  return (
    <div className="panel border border-white/10 bg-white/5 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-lg font-semibold text-white">
            {professorReview.firstName} {professorReview.lastName}
          </div>
          <div className="mt-1 text-sm text-slate-300">{instructorName}</div>
          <div className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">
            {getSnapshotFreshnessLabel(snapshotMeta)}
          </div>
        </div>
        {professorReview.profileUrl && (
          <a
            href={professorReview.profileUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-silver/35 hover:text-silver"
          >
            View on Rate My Professors
          </a>
        )}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <GradeStat label="Avg rating" value={professorReview.avgRating ?? 'N/A'} />
        <GradeStat label="Difficulty" value={professorReview.avgDifficulty ?? 'N/A'} />
        <GradeStat
          label="Would take again"
          value={
            professorReview.wouldTakeAgainPercent != null
              ? formatCompactPercent(professorReview.wouldTakeAgainPercent)
              : 'N/A'
          }
        />
        <GradeStat label="Ratings" value={professorReview.numRatings ?? 'N/A'} />
      </div>

      <div className="mt-5">
        <div className="text-sm font-semibold text-white">10 most recent reviews</div>
        <div className="mt-1 text-sm text-slate-400">
          Recent student feedback pulled from the latest quarterly snapshot.
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {professorReview.reviews.map((review) => (
          <div
            key={review.id}
            className="rounded-2xl border border-white/10 bg-slate-950/45 p-4 text-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="font-semibold text-white">{review.class || 'Course not listed'}</div>
              <div className="text-slate-400">{formatReviewDate(review.date)}</div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {review.grade && (
                <span className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 font-semibold text-emerald-100">
                  Grade {review.grade}
                </span>
              )}
              <span className="rounded-2xl border border-white/10 bg-white/5 px-3 py-1.5 font-semibold text-slate-200">
                Helpfulness {review.helpfulRating ?? 'N/A'}/5
              </span>
              <span className="rounded-2xl border border-white/10 bg-white/5 px-3 py-1.5 font-semibold text-slate-200">
                Clarity {review.clarityRating ?? 'N/A'}/5
              </span>
              <span className="rounded-2xl border border-white/10 bg-white/5 px-3 py-1.5 font-semibold text-slate-200">
                Difficulty {review.difficultyRating ?? 'N/A'}/5
              </span>
              {review.isForOnlineClass && (
                <span className="rounded-2xl border border-sky-400/20 bg-sky-400/10 px-3 py-1.5 font-semibold text-sky-100">
                  Online class
                </span>
              )}
            </div>

            <p className="mt-4 leading-7 text-slate-200">{review.comment || 'No written review.'}</p>

            {review.ratingTags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {review.ratingTags.map((tag) => (
                  <span
                    key={`${review.id}-${tag}`}
                    className="badge-silver rounded-2xl px-3 py-1 text-xs font-semibold"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function HistoricalInstructorsList({ instructors }) {
  if (instructors.length === 0) {
    return <div className="mt-3 text-sm leading-6 text-slate-400">Instructor history unavailable.</div>
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {instructors.map((instructor) => (
        <span
          key={instructor}
          className="rounded-2xl border border-white/10 bg-white/6 px-3 py-1.5 text-sm text-slate-100"
        >
          {instructor}
        </span>
      ))}
    </div>
  )
}

function CourseGradesDetailModal({ course, onClose }) {
  const [expandedCourseCode, setExpandedCourseCode] = useState('')

  if (!course) {
    return null
  }

  const { summary } = course
  const showAllHistory = expandedCourseCode === course.code
  const visibleOfferingDistributions = showAllHistory
    ? summary.offeringDistributions
    : summary.offeringDistributions.filter((offering) => offering.year >= summary.latestYear - 2)
  const visibleInstructorNames = [...new Set(visibleOfferingDistributions.map((offering) => offering.instructor))]
  const hasOlderOfferingData = summary.offeringDistributions.some(
    (offering) => offering.year < summary.latestYear - 2,
  )

  function handleClose() {
    setExpandedCourseCode('')
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-6 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-4xl overflow-y-auto panel border border-white/10 bg-[#07192f] p-6 shadow-[0_30px_120px_rgba(2,8,23,0.7)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <p className="text-label-caps">Daily Nexus grade history</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight">{course.code}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-300">{course.title}</p>
            {course.note && <p className="mt-2 text-sm leading-6 text-slate-400">{course.note}</p>}
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-2xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-semibold text-slate-200 transition hover:border-white/20"
          >
            Close
          </button>
        </div>

        {!summary ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm leading-6 text-slate-300">
            Daily Nexus grade history is not available for this course yet.
          </div>
        ) : (
          <>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <GradeStat label="Avg GPA" value={summary.avgGpa ?? 'N/A'} />
              <GradeStat
                label="Avg A range"
                value={summary.aRangeRate != null ? `${summary.aRangeRate}%` : 'N/A'}
              />
              <GradeStat label="Usually offered" value={summary.usualOfferedLabel} />
              <GradeStat label="Latest term" value={summary.latestTerm} />
            </div>

            <div className="mt-6 panel border border-white/10 bg-slate-950/45 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-white">Recent grade distributions</div>
                  <div className="mt-1 text-sm text-slate-400">
                    Showing the last three years first so each chart stays tied to the instructor who
                    taught that offering.
                  </div>
                </div>
                <AppIcon name="spark" className="h-5 w-5 text-silver" />
              </div>

              <OfferingDistributionCharts offeringDistributions={visibleOfferingDistributions} />

              {hasOlderOfferingData && (
                <button
                  type="button"
                  onClick={() =>
                    setExpandedCourseCode((current) => (current === course.code ? '' : course.code))
                  }
                  className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-white/20 hover:bg-white/8"
                >
                  {showAllHistory ? 'Show only last three years' : 'View all data'}
                </button>
              )}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Historically taught by</div>
                <HistoricalInstructorsList instructors={summary.historicalInstructors} />
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Best planning signal</div>
                <div className="mt-2 text-sm leading-6 text-slate-300">
                  This course is most commonly offered in {summary.usualOfferedLabel.toLowerCase()}, so
                  those quarters are your safest targets when building future terms.
                </div>
              </div>
            </div>

            <div className="mt-6 panel border border-white/10 bg-slate-950/45 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-white">Rate My Professor</div>
                  <div className="mt-1 text-sm text-slate-400">
                    Recent reviews for the instructors shown in the current offering charts.
                  </div>
                </div>
                <AppIcon name="arrow-up-right" className="h-5 w-5 text-silver" />
              </div>

              <div className="mt-5 space-y-4">
                {visibleInstructorNames.map((instructorName) => (
                  <ProfessorReviewSection
                    key={instructorName}
                    instructorName={instructorName}
                    professorReview={summary.professorReviewsByName?.[instructorName] ?? null}
                    snapshotMeta={summary.snapshotMeta}
                  />
                ))}
              </div>
            </div>

          </>
        )}
      </div>
    </div>
  )
}

function RequirementStatusChip({ item }) {
  const { label, tone } = getRequirementStatusDisplay(item)
  return (
    <span
      className={`rounded-2xl border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${requirementStatusClassName(tone)}`}
    >
      {label}
    </span>
  )
}

function ChecklistView({
  checklistPercent,
  completedRequirementCount,
  plannedCoveragePercent,
  plannedRequirementCount,
  sections,
  transferAutoFilled,
  transferCredits,
  hasLoadedSavedState,
  onToggleTransferCredits,
  onToggleRequirement,
}) {
  const [showMinorPreview, setShowMinorPreview] = useState(false)

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[0.9fr,1.4fr]">
        <div className="panel border border-white/10 bg-white/6 p-6 backdrop-blur-xl">
          <p className="text-label-caps">Degree Checklist</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">Requirement progress</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Toggle transfer credit, review what is already mapped in the planner, and manually mark
            requirements completed when they happen outside the current roadmap.
          </p>

          <div className="mt-6 flex flex-col items-center gap-4 panel border border-white/10 bg-slate-950/45 p-6 text-center">
            <ProgressRing percent={checklistPercent} />
            <div>
              <div className="text-lg font-semibold">{checklistPercent}% complete</div>
              <div className="mt-1 text-sm text-slate-400">
                Completed requirements based on your record, transfer credit, and manual confirmations
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Completed now</div>
              <div className="mt-2 text-2xl font-semibold">{completedRequirementCount}</div>
            </div>
            <div className="rounded-2xl border border-sky-400/20 bg-sky-400/10 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-sky-200">Covered if planned</div>
              <div className="mt-2 text-2xl font-semibold text-white">{plannedCoveragePercent}%</div>
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleTransferCredits}
            className={`mt-6 flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition ${
              transferCredits
                ? 'border-emerald-400/30 bg-emerald-400/10'
                : 'border-white/10 bg-white/5 hover:border-white/20'
            }`}
          >
            <div>
              <div className="text-sm font-semibold">Apply transfer credit</div>
              <div className="mt-1 text-sm text-slate-400">
                Auto-fill eligible GE and support requirements.
              </div>
            </div>
            <div
              className={`relative h-7 w-12 rounded-full transition ${
                transferCredits ? 'bg-emerald-400/80' : 'bg-slate-700'
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                  transferCredits ? 'left-6' : 'left-1'
                }`}
              />
            </div>
          </button>

          {transferCredits && (
            <div className="mt-4 rounded-2xl border border-silver/25 bg-silver/8 p-4 text-sm leading-6 text-slate-200">
              <span className="font-semibold text-silver-bright">Transfer credit applied (demo).</span>{' '}
              {transferAutoFilled} eligible requirements were marked from your transfer toggle. Confirm
              every area in Gaucho GOLD — SILVER does not read your transcript.
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowMinorPreview((current) => !current)}
            className={`mt-4 flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition ${
              showMinorPreview
                ? 'border-silver/35 bg-silver/10'
                : 'border-white/10 bg-white/5 hover:border-white/20'
            }`}
          >
            <span>
              <span className="font-semibold text-white">Considering a minor?</span>
              <span className="mt-1 block text-slate-400">
                Preview a sample Political Science minor pathway (read-only).
              </span>
            </span>
            <span className="badge-silver rounded-2xl px-2 py-1 text-xs font-semibold">
              {showMinorPreview ? 'Hide' : 'Show'}
            </span>
          </button>

          <div className="mt-4 rounded-2xl border border-silver/20 bg-silver/5 p-4 text-sm text-slate-300">
            {plannedRequirementCount} additional requirements are already accounted for in the 4-year
            planner.
            {hasLoadedSavedState && (
              <span className="mt-2 block text-slate-400">
                Checklist and planner changes are saved automatically in this browser.
              </span>
            )}
          </div>

          <div className="mt-4 flex justify-end">
            <GoldLink variant="button">Open degree audit in GOLD</GoldLink>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="flex flex-wrap items-center gap-2 border border-white/10 bg-slate-950/40 px-3 py-2 text-[11px]">
            <span className="uppercase tracking-wide text-slate-500">Status:</span>
            <RequirementStatusChip item={{ source: 'record', status: 'completed' }} />
            <RequirementStatusChip item={{ source: 'transfer', status: 'completed' }} />
            <RequirementStatusChip item={{ source: 'planner', status: 'planned' }} />
            <RequirementStatusChip item={{ source: 'pending', status: 'pending' }} />
          </div>

          {sections.map((section) => (
            <div
              key={section.id}
              className="panel border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(2,8,23,0.22)]"
            >
              <div className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 className="text-xl font-semibold tracking-tight">{section.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-400">{section.description}</p>
                  {section.id === 'major' && (
                    <Link
                      href="/econ-prep-map"
                      className="mt-2 inline-block text-sm font-medium text-silver hover:text-silver-bright"
                    >
                      View Economics prep flowchart →
                    </Link>
                  )}
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300">
                  {section.completedCount} complete
                  {section.plannedCount > 0 && ` • ${section.plannedCount} planned`}
                </div>
              </div>

              {section.id === 'ge' && <GeExplainer />}

              <div className="mt-4 grid gap-3">
                {section.items.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-start gap-4 rounded-2xl border p-4 text-left transition ${
                      item.status === 'completed'
                        ? 'border-emerald-400/25 bg-emerald-400/10'
                        : item.status === 'planned'
                          ? 'border-sky-400/25 bg-sky-400/10'
                          : 'border-white/10 bg-slate-950/45'
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-2xl border ${
                        item.status === 'completed'
                          ? 'border-emerald-300 bg-emerald-400/90 text-slate-950'
                          : item.status === 'planned'
                            ? 'border-sky-300 bg-sky-400/90 text-slate-950'
                            : 'border-slate-500 text-transparent'
                      }`}
                    >
                      <AppIcon name="check" className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold">{item.label}</span>
                        <RequirementStatusChip item={item} />
                      </span>
                      <span className="mt-1 block text-sm leading-6 text-slate-400">{item.detail}</span>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => onToggleRequirement(item)}
                          disabled={!item.isInteractive}
                          className={`rounded-2xl px-3 py-1.5 text-xs font-semibold transition ${
                            item.isInteractive
                              ? 'border border-white/10 bg-white/5 text-slate-100 hover:border-white/20 hover:bg-white/8'
                              : 'cursor-not-allowed border border-white/10 bg-white/5 text-slate-500'
                          }`}
                        >
                          {item.actionLabel}
                        </button>
                      </div>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {showMinorPreview && (
            <div className="panel border border-dashed border-silver/30 bg-slate-950/50 p-5">
              <p className="text-label-caps">Minor preview</p>
              <h3 className="mt-2 text-lg font-semibold tracking-tight">
                {politicalScienceMinorPreview.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {politicalScienceMinorPreview.description}
              </p>
              <ul className="mt-4 space-y-2">
                {politicalScienceMinorPreview.items.map((minorItem) => (
                  <li
                    key={minorItem.id}
                    className="flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
                  >
                    <div>
                      <div className="font-medium text-white">{minorItem.label}</div>
                      <div className="text-slate-400">{minorItem.detail}</div>
                    </div>
                    <span className="shrink-0 rounded-2xl border border-white/15 bg-white/5 px-2 py-0.5 text-[11px] font-semibold text-slate-300">
                      {minorItem.statusLabel}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function ChatView({
  draftMessage,
  messages,
  onDraftChange,
  onNavigate,
  onOpenCourseGrades,
  onSelectPrompt,
  onSendMessage,
  promptSuggestions,
}) {
  const { error: gradesError, isLoading: isLoadingGrades, summaries: gradeSummaries } =
    useCourseGradeSummaries(advisorSuggestedCourses.map((course) => course.code))

  return (
    <div className="grid gap-6 xl:grid-cols-[1.4fr,0.8fr]">
      <section className="panel border border-white/10 bg-white/6 p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <p className="text-label-caps">L&S Campus Q&A</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">General questions, official sources</h2>
          </div>
          <div className="badge-silver rounded-2xl px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">
            Demo mode
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3xl rounded-2xl border p-4 ${
                  message.sender === 'user'
                    ? 'border-silver/30 bg-silver/14 text-white'
                    : 'border-white/10 bg-slate-950/55'
                }`}
              >
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {message.sender === 'user' ? studentProfile.firstName : 'Campus Q&A'}
                </div>
                <p className="text-sm leading-7 text-slate-100">{message.text}</p>

                {message.bullets && (
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
                    {message.bullets.map((bullet, index) => (
                      <li key={`${message.id}-b-${index}`} className="flex gap-2">
                        <span className="mt-2 h-1.5 w-1.5 rounded-2xl bg-silver" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {message.sender === 'bot' && message.policySnippet && (
                  <div className="mt-4 rounded-2xl border border-gold/25 bg-gold/8 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                      Related policy snippet
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white">{message.policySnippet.title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{message.policySnippet.excerpt}</p>
                    <div className="mt-3">
                      <GoldSourceChip
                        href={message.policySnippet.sourceUrl}
                        label={`${message.policySnippet.sourceLabel} (source)`}
                      />
                    </div>
                  </div>
                )}

                {message.sender === 'bot' && message.resources?.length > 0 && (
                  <div className="mt-4 border-t border-white/10 pt-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                      Official sources for this answer
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Open these links to verify dates, policies, and requirements on live UCSB sites. Complex or
                      student-specific questions belong with L&S General Academic Advising.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.resources.map((resource) => (
                        <GoldSourceChip
                          key={resource.url}
                          href={resource.url}
                          label={resource.label}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 panel border border-white/10 bg-slate-950/45 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="text-sm font-medium text-slate-300" htmlFor="campus-qa-input">
              Ask a general question
            </label>
            <button
              type="button"
              onClick={() => onNavigate('resources')}
              className="text-xs font-semibold text-gold hover:text-gold-hover"
            >
              Browse Resource Hub →
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {promptSuggestions.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => onSelectPrompt(prompt)}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-gold/30 hover:bg-gold/10 hover:text-gold"
              >
                {prompt}
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <input
              id="campus-qa-input"
              value={draftMessage}
              onChange={(event) => onDraftChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  onSendMessage()
                }
              }}
              placeholder="Try deadlines, GE, prerequisites, or billing — then read the linked sources…"
              className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus-silver focus:border-silver/40"
            />
            <button
              type="button"
              onClick={onSendMessage}
              className="btn-silver rounded-2xl px-5 py-3"
            >
              Send
            </button>
          </div>
        </div>
      </section>

      <aside className="space-y-6">
        <div className="panel border border-gold/25 bg-gradient-to-br from-ucsb-navy via-[#17395f] to-slate-950 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">Gaucho GOLD</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight">Courses to explore in GOLD</h3>
          <div className="mt-4 space-y-3">
            {advisorSuggestedCourses.map((course) => (
              <button
                key={course.code}
                type="button"
                onClick={() => {
                  if (!isLoadingGrades) {
                    onOpenCourseGrades(course, gradeSummaries[course.code] ?? null)
                  }
                }}
                className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-left transition hover:border-white/20"
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{course.code}</span>
                  <span className={`rounded-2xl px-2 py-1 text-[11px] font-semibold ${plannerLegend[course.type].pillClass}`}>
                    {plannerLegend[course.type].label}
                  </span>
                </div>
                <div className="mt-2 text-sm text-slate-100">{course.title}</div>
                <div className="mt-2 text-sm leading-6 text-slate-300">{course.note}</div>
                <CourseGradesSummary
                  isLoading={isLoadingGrades}
                  summary={gradeSummaries[course.code] ?? null}
                />
              </button>
            ))}
          </div>

          {gradesError && (
            <div className="mt-4 rounded-2xl border border-rose-400/25 bg-rose-500/10 p-4 text-sm text-rose-100">
              Course grade summaries are temporarily unavailable; use L&S and department advising plus GOLD for enrollment decisions.
            </div>
          )}
        </div>

        <div className="panel border border-white/10 bg-white/6 p-6 backdrop-blur-xl">
          <p className="text-label-caps">How this panel works</p>
          <div className="mt-4 space-y-4 text-sm leading-6 text-slate-300">
            <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
              Every bot reply includes at least one official UCSB link so you can verify information yourself.
            </div>
            <div className="rounded-2xl border border-gold/20 bg-gold/8 p-4">
              Matching questions may attach a policy snippet from the Resource Hub—always confirm on the linked
              official page.
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
              Questions about petitions, standing, exceptions, or your specific transcript are routed to L&S General
              Academic Advising rather than answered in detail here.
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
              The course tiles are only sample ideas for this Economics demo; GOLD and your advisors decide what you
              may actually enroll in.
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}

function DatesView() {
  const [categoryFilter, setCategoryFilter] = useState('all')
  const timelineEvents = useMemo(() => getTimelineEvents(), [])
  const filteredEvents = useMemo(
    () => filterTimelineByCategory(timelineEvents, categoryFilter),
    [timelineEvents, categoryFilter],
  )

  const calendarHighlights = {
    0: new Set([2, 5, 8, 12, 16]),
    1: new Set([2, 10, 13]),
    2: new Set([6, 14]),
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr,1fr]">
      <section className="panel border border-white/10 bg-white/6 p-6 backdrop-blur-xl">
        <p className="text-label-caps">Important Dates</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">Winter 2026 timeline</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
          Key academic and advising milestones for the Winter quarter, plus billing timing on BARC when relevant.
          Registration events link to Gaucho GOLD.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {DATE_CATEGORY_FILTERS.map((filter) => {
            const isActive = categoryFilter === filter.id
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setCategoryFilter(filter.id)}
                className={`rounded-2xl border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
                  isActive
                    ? 'border-silver/35 bg-silver/15 text-silver-bright'
                    : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-white'
                }`}
              >
                {filter.label}
              </button>
            )
          })}
        </div>

        <div className="mt-6 space-y-4">
          {filteredEvents.map((event) => (
            <div key={event.date} className="relative rounded-2xl border border-white/10 bg-slate-950/45 p-5">
              <div className="absolute left-6 top-5 h-[calc(100%-2.5rem)] w-px bg-white/10" />
              <div className="relative z-10 flex gap-4">
                <div
                  className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl text-center shadow-[0_10px_30px_rgba(0,54,96,0.35)] ${
                    event.category === 'registration'
                      ? 'border border-gold/35 bg-gold/15'
                      : 'bg-[#003660]'
                  }`}
                >
                  <span
                    className={`text-[11px] uppercase tracking-[0.18em] ${
                      event.category === 'registration' ? 'text-gold' : 'text-silver'
                    }`}
                  >
                    {event.month}
                  </span>
                  <span className="text-lg font-semibold">{event.day}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold tracking-tight">{event.title}</h3>
                    <span
                      className={`rounded-2xl px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${getCategoryChipClass(event.category)}`}
                    >
                      {event.category}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{event.detail}</p>
                  {event.category === 'registration' && (
                    <div className="mt-3">
                      <GoldLink variant="pill">Open enrollment in GOLD</GoldLink>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="panel border border-silver/25 bg-gradient-to-br from-silver/14 via-ucsb-navy to-slate-950 p-6">
          <p className="text-label-caps">Calendar view</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight">Quarter at a glance</h3>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Highlighted dates mark registration, billing timing on BARC, and major advising milestones across January through March.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-1 2xl:grid-cols-3">
          {[
            { label: 'January 2026', monthIndex: 0 },
            { label: 'February 2026', monthIndex: 1 },
            { label: 'March 2026', monthIndex: 2 },
          ].map((month) => (
            <MonthCard
              key={month.label}
              label={month.label}
              monthIndex={month.monthIndex}
              highlightedDays={calendarHighlights[month.monthIndex]}
            />
          ))}
        </div>
      </section>
    </div>
  )
}

function MonthCard({ label, monthIndex, highlightedDays }) {
  const cells = getMonthMatrix(2026, monthIndex)

  return (
    <div className="panel border border-white/10 bg-white/6 p-5 backdrop-blur-xl">
      <div className="text-lg font-semibold tracking-tight">{label}</div>
      <div className="mt-4 grid grid-cols-7 gap-2 text-center text-xs uppercase tracking-[0.18em] text-slate-500">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <div key={`${label}-${day}-${index}`}>{day}</div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-7 gap-2">
        {cells.map((day, index) => {
          const isHighlighted = day && highlightedDays.has(day)
          return (
            <div
              key={`${label}-${index}`}
              className={`flex aspect-square items-center justify-center rounded-2xl text-sm ${
                day
                  ? isHighlighted
                    ? 'bg-silver font-semibold text-ucsb-navy'
                    : 'bg-slate-950/45 text-slate-200'
                  : 'bg-transparent'
              }`}
            >
              {day ?? ''}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ProgressRing({ percent }) {
  return (
    <div
      className="relative flex h-36 w-36 items-center justify-center rounded-full"
      style={{
        background: `conic-gradient(var(--color-gold) 0deg ${percent * 0.72}deg, var(--color-silver) ${percent * 0.72}deg ${percent * 3.6}deg, rgba(255,255,255,0.08) ${percent * 3.6}deg 360deg)`,
      }}
    >
      <div className="flex h-28 w-28 items-center justify-center rounded-full bg-slate-950 text-3xl font-semibold">
        {percent}%
      </div>
    </div>
  )
}

function MetricCard({ metric }) {
  const toneStyles = {
    sky: 'from-sky-500/16 to-sky-500/0 text-sky-100',
    silver: 'from-silver/18 to-silver/0 text-slate-100',
    emerald: 'from-emerald-500/16 to-emerald-500/0 text-emerald-100',
    indigo: 'from-indigo-500/16 to-indigo-500/0 text-indigo-100',
  }

  return (
    <div className={`panel border border-white/10 bg-gradient-to-br ${toneStyles[metric.tone]} p-[1px]`}>
      <div className=" bg-slate-950/85 p-5">
        <div className="text-sm text-slate-400">{metric.label}</div>
        <div className="mt-3 text-3xl font-semibold tracking-tight text-white">{metric.value}</div>
      </div>
    </div>
  )
}

function StatHighlight({ label, value, tone }) {
  const toneClasses = {
    silver: 'border-silver/25 bg-silver/10 text-silver',
    sky: 'border-sky-400/25 bg-sky-400/10 text-sky-200',
    emerald: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-200',
  }

  return (
    <div className={`rounded-2xl border px-4 py-4 ${toneClasses[tone]}`}>
      <div className="text-xs uppercase tracking-[0.18em]">{label}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-white">{value}</div>
    </div>
  )
}

function InfoTile({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/6 p-3">
      <div className="text-xs uppercase tracking-[0.16em] text-slate-400">{label}</div>
      <div className="mt-2 font-medium text-white">{value}</div>
    </div>
  )
}

export default App
