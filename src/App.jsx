import { useMemo, useState } from 'react'
import {
  chatbotSeedMessages,
  dashboardMetrics,
  financialAid,
  navItems,
  plannerLegend,
  plannerSuggestions,
  plannerTemplate,
  quickAccessCards,
  requirementSections,
  studentProfile,
  upcomingDeadlines,
  winterDates,
} from './mockData'

const quarters = ['Fall', 'Winter', 'Spring']
const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

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

function buildChatResponse(input) {
  const normalized = input.toLowerCase()

  if (normalized.includes('aid') || normalized.includes('scholarship') || normalized.includes('loan')) {
    return {
      text: 'Your Winter 2026 aid package is projected to post to BARC on Jan 2, then any remaining credit is refunded after charges are covered. Stay at 12 or more units if you want to protect grant eligibility.',
      bullets: [
        'Check myBARC first to see whether tuition and campus fees have already been covered.',
        'If you are thinking about dropping a class, ask Financial Aid before going below full-time.',
      ],
      resources: financialAid.links,
    }
  }

  if (normalized.includes('deadline') || normalized.includes('drop') || normalized.includes('add')) {
    return {
      text: 'The next Winter 2026 milestone is the Jan 16 add deadline, followed by the Feb 2 drop deadline and the Mar 6 withdrawal deadline.',
      bullets: [
        'Use GOLD for add and drop actions before petition-based processing is required.',
        'Major declaration advising closes on Feb 13 if you are preparing engineering paperwork.',
      ],
      resources: [{ label: 'UCSB GOLD', url: 'https://my.sa.ucsb.edu/gold/' }],
    }
  }

  if (normalized.includes('elective') || normalized.includes('ge')) {
    return {
      text: 'A lighter GE Area D course or TMP 120 would balance your next quarter well while still moving degree progress forward.',
      bullets: [
        'GE D is still outstanding on your checklist and is an efficient way to improve breadth progress.',
        'TMP 120 is a strong choice if you want an entrepreneurship-oriented elective with a CS-friendly workload.',
      ],
      resources: [{ label: 'Course Search in GOLD', url: 'https://my.sa.ucsb.edu/gold/' }],
    }
  }

  return {
    text: 'For your current path, I would still prioritize CMPSC 130B, CMPSC 170, and one balanced GE or elective. That keeps the major sequence moving without overloading the quarter.',
    bullets: [
      'Confirm CMPSC 130A is fully cleared before you finalize 130B.',
      'Aim for 12 to 14 units if you want a manageable quarter and strong full-time status.',
    ],
    resources: chatbotSeedMessages[2].resources,
  }
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

function App() {
  const [activeView, setActiveView] = useState('dashboard')
  const [planner, setPlanner] = useState(createPlannerState)
  const [selectedQuarterKey, setSelectedQuarterKey] = useState('Year 2|Spring')
  const [transferCredits, setTransferCredits] = useState(false)
  const [requirementChecks, setRequirementChecks] = useState(() =>
    Object.fromEntries(
      requirementSections
        .flatMap((section) => section.items)
        .map((item) => [item.id, item.completed]),
    ),
  )
  const [chatMessages, setChatMessages] = useState(chatbotSeedMessages)
  const [draftMessage, setDraftMessage] = useState('')
  const [openFaq, setOpenFaq] = useState(financialAid.faqs[0].id)

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
          const isSatisfied = requirementChecks[item.id] || (transferCredits && item.transferEligible)
          const autoFilled = transferCredits && item.transferEligible && !requirementChecks[item.id]
          return { ...item, autoFilled, isSatisfied }
        })

        return {
          ...section,
          items,
          completedCount: items.filter((item) => item.isSatisfied).length,
        }
      }),
    [requirementChecks, transferCredits],
  )

  const allRequirementItems = checklistSections.flatMap((section) => section.items)
  const checklistPercent = Math.round(
    (allRequirementItems.filter((item) => item.isSatisfied).length / allRequirementItems.length) * 100,
  )
  const transferAutoFilled = allRequirementItems.filter(
    (item) => transferCredits && item.transferEligible && !requirementChecks[item.id],
  ).length

  function handleAddSuggestedCourse(course) {
    if (plannedCourseCodes.has(course.code)) {
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

  function handleToggleRequirement(itemId) {
    setRequirementChecks((current) => ({
      ...current,
      [itemId]: !current[itemId],
    }))
  }

  function handleSendMessage() {
    const trimmed = draftMessage.trim()
    if (!trimmed) {
      return
    }

    const reply = buildChatResponse(trimmed)
    setChatMessages((currentMessages) => [
      ...currentMessages,
      { id: `user-${Date.now()}`, sender: 'user', text: trimmed },
      {
        id: `bot-${Date.now() + 1}`,
        sender: 'bot',
        text: reply.text,
        bullets: reply.bullets,
        resources: reply.resources,
      },
    ])
    setDraftMessage('')
  }

  const activeContent = {
    dashboard: (
      <DashboardView
        checklistPercent={checklistPercent}
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
        plannedCourseCodes={plannedCourseCodes}
      />
    ),
    checklist: (
      <ChecklistView
        checklistPercent={checklistPercent}
        sections={checklistSections}
        transferAutoFilled={transferAutoFilled}
        transferCredits={transferCredits}
        onToggleTransferCredits={() => setTransferCredits((current) => !current)}
        onToggleRequirement={handleToggleRequirement}
      />
    ),
    chat: (
      <ChatView
        draftMessage={draftMessage}
        messages={chatMessages}
        onDraftChange={setDraftMessage}
        onSendMessage={handleSendMessage}
      />
    ),
    dates: <DatesView />,
    aid: <FinancialAidView openFaq={openFaq} onToggleFaq={setOpenFaq} />,
  }[activeView]

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(254,188,17,0.14),_transparent_28%),linear-gradient(180deg,_#04101d_0%,_#07192f_42%,_#020816_100%)] text-slate-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.14),transparent_18%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.08),transparent_20%)]" />

      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FEBC11] to-[#ffd95f] text-lg font-black text-[#003660] shadow-[0_0_30px_rgba(254,188,17,0.25)]">
              GG
            </div>
            <div>
              <div className="text-lg font-semibold tracking-tight">GauchoGuide</div>
              <div className="text-sm text-slate-400">UC Santa Barbara academic planning</div>
            </div>
          </div>

          <div className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 lg:flex">
            Winter 2026 planning snapshot for {studentProfile.firstName}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:border-[#FEBC11]/40 hover:text-[#FEBC11]"
            >
              <AppIcon name="bell" className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FEBC11] px-1 text-[11px] font-bold text-[#003660]">
                3
              </span>
            </button>
            <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-2 py-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#003660] text-sm font-semibold text-[#FEBC11]">
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

      <div className="mx-auto flex max-w-[1600px] flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:px-8">
        <aside className="w-full shrink-0 lg:sticky lg:top-24 lg:w-80 lg:self-start">
          <div className="rounded-[28px] border border-white/10 bg-white/6 p-4 shadow-[0_20px_80px_rgba(2,8,23,0.35)] backdrop-blur-xl">
            <div className="rounded-3xl border border-[#FEBC11]/25 bg-gradient-to-br from-[#003660] via-[#0b2d52] to-slate-950 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-[#FEBC11]">Student snapshot</p>
                  <h1 className="mt-3 text-2xl font-semibold tracking-tight">{studentProfile.name}</h1>
                  <p className="mt-1 text-sm text-slate-300">{studentProfile.major}</p>
                </div>
                <div className="rounded-full border border-[#FEBC11]/30 bg-[#FEBC11]/10 px-3 py-1 text-xs font-semibold text-[#FEBC11]">
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
                    className="h-full rounded-full bg-gradient-to-r from-[#FEBC11] via-[#ffd95f] to-[#fff1bd]"
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
                    onClick={() => setActiveView(item.id)}
                    className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                      isActive
                        ? 'border-[#FEBC11]/35 bg-[#FEBC11]/12 text-white shadow-[0_0_0_1px_rgba(254,188,17,0.12)]'
                        : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/8 hover:text-white'
                    }`}
                  >
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        isActive ? 'bg-[#FEBC11]/18 text-[#FEBC11]' : 'bg-slate-900/80 text-slate-300'
                      }`}
                    >
                      <AppIcon name={item.icon} className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block text-sm font-medium">{item.label}</span>
                      <span className="block text-xs text-slate-400">
                        {item.id === 'dashboard' && 'Overview, progress, and action cards'}
                        {item.id === 'planner' && 'Click-to-add roadmap across four years'}
                        {item.id === 'checklist' && 'Track requirements and transfer credit'}
                        {item.id === 'chat' && 'Mock advising with Gaucho Guide'}
                        {item.id === 'dates' && 'Winter 2026 deadlines and calendar'}
                        {item.id === 'aid' && 'Aid package, refunds, and FAQs'}
                      </span>
                    </span>
                  </button>
                )
              })}
            </nav>
          </div>
        </aside>

        <main key={activeView} className="page-enter min-w-0 flex-1">
          {activeContent}
        </main>
      </div>
    </div>
  )
}

function DashboardView({ checklistPercent, onNavigate, planner }) {
  const totalPlannedUnits = planner
    .flatMap((yearPlan) => quarters.flatMap((quarter) => yearPlan.quarters[quarter]))
    .reduce((sum, course) => sum + course.units, 0)

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.6fr,1fr]">
        <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-[#003660] via-[#0b2442] to-slate-950 p-6 shadow-[0_20px_90px_rgba(2,8,23,0.35)]">
          <div className="flex flex-col justify-between gap-6 lg:flex-row">
            <div className="max-w-2xl">
              <div className="inline-flex items-center rounded-full border border-[#FEBC11]/25 bg-[#FEBC11]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#FEBC11]">
                Welcome back
              </div>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight">
                {studentProfile.firstName}, you are on pace for a strong Spring registration.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
                Your planner and checklist are aligned, you have no active holds, and the next
                best move is to build a balanced Spring quarter around your CS sequence.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:w-[320px] lg:grid-cols-1">
              <StatHighlight label="Degree progress" value={`${checklistPercent}%`} tone="gold" />
              <StatHighlight label="Total planned units" value={String(totalPlannedUnits)} tone="sky" />
              <StatHighlight label="Major declaration" value="Window open Jan 12" tone="emerald" />
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-white/6 p-6 shadow-[0_20px_90px_rgba(2,8,23,0.3)] backdrop-blur-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-[#FEBC11]">Upcoming deadlines</p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight">Winter 2026 checklist</h3>
            </div>
            <AppIcon name="calendar" className="h-6 w-6 text-[#FEBC11]" />
          </div>

          <div className="mt-6 space-y-4">
            {upcomingDeadlines.map((deadline) => (
              <div
                key={deadline.title}
                className="rounded-2xl border border-white/10 bg-slate-950/45 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">
                    {deadline.date}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                      deadline.priority === 'urgent'
                        ? 'bg-rose-500/18 text-rose-200'
                        : deadline.priority === 'upcoming'
                          ? 'bg-[#FEBC11]/15 text-[#FEBC11]'
                          : 'bg-sky-500/15 text-sky-200'
                    }`}
                  >
                    {deadline.priority}
                  </span>
                </div>
                <h4 className="mt-3 text-base font-semibold">{deadline.title}</h4>
                <p className="mt-1 text-sm leading-6 text-slate-400">{deadline.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        {dashboardMetrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-[#FEBC11]">Quick access</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight">Jump into the tools you need</h3>
          </div>
          <div className="hidden text-sm text-slate-400 lg:block">All screens are interactive in this prototype.</div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-4">
          {quickAccessCards.map((card) => (
            <button
              key={card.id}
              type="button"
              onClick={() => onNavigate(card.id)}
              className={`group rounded-[28px] border border-white/10 bg-gradient-to-br ${card.accent} from-10% to-90% p-[1px] text-left transition hover:-translate-y-0.5`}
            >
              <div className="h-full rounded-[27px] bg-slate-950/85 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-lg font-semibold tracking-tight">{card.title}</h4>
                    <p className="mt-3 text-sm leading-6 text-slate-400">{card.description}</p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-200 transition group-hover:border-[#FEBC11]/25 group-hover:text-[#FEBC11]">
                    <AppIcon name="arrow-up-right" className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}

function PlannerView({
  planner,
  selectedQuarterKey,
  onSelectQuarter,
  onAddSuggestedCourse,
  plannedCourseCodes,
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.6fr,0.9fr]">
      <section className="space-y-6">
        <div className="rounded-[32px] border border-white/10 bg-white/6 p-6 backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-[#FEBC11]">4-Year Planner</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">Map every quarter at a glance</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                Click a quarter card to target it, then use the recommendation panel to add a course.
                The grid is pre-filled with a Computer Science pathway and color-coded by requirement type.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {Object.entries(plannerLegend).map(([key, value]) => (
                <span
                  key={key}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${value.badgeClass}`}
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
              className="rounded-[28px] border border-white/10 bg-white/5 p-4 shadow-[0_20px_60px_rgba(2,8,23,0.22)]"
            >
              <div className="flex items-center justify-between gap-3 px-2 pb-4">
                <div>
                  <h3 className="text-xl font-semibold tracking-tight">{yearPlan.year}</h3>
                  <p className="text-sm text-slate-400">Fall, Winter, and Spring planning block</p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs text-slate-300">
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

                  return (
                    <button
                      key={quarter}
                      type="button"
                      onClick={() => onSelectQuarter(quarterKey)}
                      className={`rounded-[24px] border p-4 text-left transition ${
                        isSelected
                          ? 'border-[#FEBC11]/40 bg-[#FEBC11]/10 shadow-[0_0_0_1px_rgba(254,188,17,0.14)]'
                          : 'border-white/10 bg-slate-950/45 hover:border-white/20 hover:bg-slate-900/70'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="text-sm uppercase tracking-[0.18em] text-slate-400">{quarter}</div>
                          <div className="mt-1 text-lg font-semibold">{quarterUnits} units</div>
                        </div>
                        {isSelected && (
                          <span className="rounded-full bg-[#FEBC11] px-3 py-1 text-xs font-bold text-[#003660]">
                            Selected
                          </span>
                        )}
                      </div>

                      <div className="mt-4 space-y-3">
                        {courses.map((course, index) => (
                          <div
                            key={`${course.code}-${index}`}
                            className={`rounded-2xl border p-3 ${plannerLegend[course.type].badgeClass}`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="font-semibold">{course.code}</div>
                              <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${plannerLegend[course.type].pillClass}`}>
                                {course.units} units
                              </span>
                            </div>
                            <div className="mt-1 text-sm leading-6 text-slate-100/90">{course.title}</div>
                          </div>
                        ))}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
        <div className="rounded-[32px] border border-[#FEBC11]/25 bg-gradient-to-br from-[#FEBC11]/16 via-[#003660] to-slate-950 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-[#FEBC11]">Selected quarter</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight">
            {selectedQuarterKey.replace('|', ' · ')}
          </h3>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Add one of the recommended courses below to simulate course planning without reloading the page.
          </p>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-white/6 p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-[#FEBC11]">Recommended adds</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight">Next quarter options</h3>
            </div>
            <AppIcon name="spark" className="h-6 w-6 text-[#FEBC11]" />
          </div>

          <div className="mt-5 space-y-4">
            {plannerSuggestions.map((course) => {
              const isAdded = plannedCourseCodes.has(course.code)
              return (
                <div
                  key={course.code}
                  className="rounded-2xl border border-white/10 bg-slate-950/45 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-semibold">{course.code}</span>
                        <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${plannerLegend[course.type].pillClass}`}>
                          {plannerLegend[course.type].label}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-300">{course.title}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-400">{course.note}</p>
                    </div>
                    <button
                      type="button"
                      disabled={isAdded}
                      onClick={() => onAddSuggestedCourse(course)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        isAdded
                          ? 'cursor-not-allowed border border-white/10 bg-white/5 text-slate-500'
                          : 'bg-[#FEBC11] text-[#003660] hover:bg-[#ffd457]'
                      }`}
                    >
                      {isAdded ? 'Added' : `Add to ${selectedQuarterKey.split('|')[1]}`}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </aside>
    </div>
  )
}

function ChecklistView({
  checklistPercent,
  sections,
  transferAutoFilled,
  transferCredits,
  onToggleTransferCredits,
  onToggleRequirement,
}) {
  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[0.9fr,1.4fr]">
        <div className="rounded-[32px] border border-white/10 bg-white/6 p-6 backdrop-blur-xl">
          <p className="text-sm uppercase tracking-[0.24em] text-[#FEBC11]">Degree Checklist</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">Requirement progress</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Toggle transfer credit to simulate incoming AP or community college work, then mark
            items complete as you plan.
          </p>

          <div className="mt-6 flex flex-col items-center gap-4 rounded-[28px] border border-white/10 bg-slate-950/45 p-6 text-center">
            <ProgressRing percent={checklistPercent} />
            <div>
              <div className="text-lg font-semibold">{checklistPercent}% complete</div>
              <div className="mt-1 text-sm text-slate-400">Across GE, core major courses, and electives</div>
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
            <div className="mt-4 rounded-2xl border border-emerald-400/25 bg-emerald-400/10 p-4 text-sm text-emerald-100">
              {transferAutoFilled} eligible requirements were auto-filled by the transfer credit toggle.
            </div>
          )}
        </div>

        <div className="grid gap-4">
          {sections.map((section) => (
            <div
              key={section.id}
              className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(2,8,23,0.22)]"
            >
              <div className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 className="text-xl font-semibold tracking-tight">{section.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-400">{section.description}</p>
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300">
                  {section.completedCount} / {section.items.length} complete
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                {section.items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onToggleRequirement(item.id)}
                    className={`flex items-start gap-4 rounded-2xl border p-4 text-left transition ${
                      item.isSatisfied
                        ? 'border-emerald-400/25 bg-emerald-400/10'
                        : 'border-white/10 bg-slate-950/45 hover:border-white/20'
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                        item.isSatisfied
                          ? 'border-emerald-300 bg-emerald-400/90 text-slate-950'
                          : 'border-slate-500 text-transparent'
                      }`}
                    >
                      <AppIcon name="check" className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold">{item.label}</span>
                        {item.autoFilled && (
                          <span className="rounded-full bg-[#FEBC11]/12 px-2 py-1 text-[11px] font-semibold text-[#FEBC11]">
                            Transfer
                          </span>
                        )}
                      </span>
                      <span className="mt-1 block text-sm leading-6 text-slate-400">{item.detail}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function ChatView({ draftMessage, messages, onDraftChange, onSendMessage }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.4fr,0.8fr]">
      <section className="rounded-[32px] border border-white/10 bg-white/6 p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-[#FEBC11]">AI Advisor Chatbot</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">Chat with Gaucho Guide</h2>
          </div>
          <div className="rounded-full border border-[#FEBC11]/25 bg-[#FEBC11]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#FEBC11]">
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
                className={`max-w-3xl rounded-[24px] border p-4 ${
                  message.sender === 'user'
                    ? 'border-[#FEBC11]/30 bg-[#FEBC11]/14 text-white'
                    : 'border-white/10 bg-slate-950/55'
                }`}
              >
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {message.sender === 'user' ? studentProfile.firstName : 'Gaucho Guide'}
                </div>
                <p className="text-sm leading-7 text-slate-100">{message.text}</p>

                {message.bullets && (
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
                    {message.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-2">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#FEBC11]" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {message.resources && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {message.resources.map((resource) => (
                      <a
                        key={resource.label}
                        href={resource.url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-[#FEBC11]/35 hover:text-[#FEBC11]"
                      >
                        {resource.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-[28px] border border-white/10 bg-slate-950/45 p-4">
          <label className="text-sm font-medium text-slate-300" htmlFor="advisor-input">
            Ask a mock question
          </label>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <input
              id="advisor-input"
              value={draftMessage}
              onChange={(event) => onDraftChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  onSendMessage()
                }
              }}
              placeholder="Ask about next quarter, deadlines, electives, or financial aid..."
              className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#FEBC11]/40"
            />
            <button
              type="button"
              onClick={onSendMessage}
              className="rounded-2xl bg-[#FEBC11] px-5 py-3 text-sm font-semibold text-[#003660] transition hover:bg-[#ffd457]"
            >
              Send
            </button>
          </div>
        </div>
      </section>

      <aside className="space-y-6">
        <div className="rounded-[32px] border border-[#FEBC11]/25 bg-gradient-to-br from-[#003660] via-[#17395f] to-slate-950 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-[#FEBC11]">Advisor summary</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight">Suggested next quarter</h3>
          <div className="mt-4 space-y-3">
            {['CMPSC 130B', 'CMPSC 170', 'GE Area D or TMP 120'].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-white/6 p-6 backdrop-blur-xl">
          <p className="text-sm uppercase tracking-[0.24em] text-[#FEBC11]">What the bot checks</p>
          <div className="mt-4 space-y-4 text-sm leading-6 text-slate-300">
            <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
              Looks at major sequencing and flags likely prerequisite issues before a student adds the next course.
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
              Suggests UCSB-specific planning tools like GOLD and student-facing research tools like Rate My Professor.
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
              Keeps responses grounded in a manageable unit load instead of recommending every remaining requirement at once.
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}

function DatesView() {
  const calendarHighlights = {
    0: new Set([2, 5, 12, 16]),
    1: new Set([2, 13]),
    2: new Set([6, 14]),
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr,1fr]">
      <section className="rounded-[32px] border border-white/10 bg-white/6 p-6 backdrop-blur-xl">
        <p className="text-sm uppercase tracking-[0.24em] text-[#FEBC11]">Important Dates</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">Winter 2026 timeline</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
          Key academic, advising, and financial aid milestones for the Winter quarter.
        </p>

        <div className="mt-6 space-y-4">
          {winterDates.map((event) => (
            <div key={event.date} className="relative rounded-[24px] border border-white/10 bg-slate-950/45 p-5">
              <div className="absolute left-6 top-5 h-[calc(100%-2.5rem)] w-px bg-white/10" />
              <div className="relative z-10 flex gap-4">
                <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-[#003660] text-center shadow-[0_10px_30px_rgba(0,54,96,0.35)]">
                  <span className="text-[11px] uppercase tracking-[0.18em] text-[#FEBC11]">{event.month}</span>
                  <span className="text-lg font-semibold">{event.day}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold tracking-tight">{event.title}</h3>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                      event.category === 'aid'
                        ? 'bg-emerald-400/15 text-emerald-200'
                        : event.category === 'major'
                          ? 'bg-[#FEBC11]/12 text-[#FEBC11]'
                          : 'bg-sky-500/15 text-sky-200'
                    }`}>
                      {event.category}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{event.detail}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="rounded-[32px] border border-[#FEBC11]/25 bg-gradient-to-br from-[#FEBC11]/14 via-[#003660] to-slate-950 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-[#FEBC11]">Calendar view</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight">Quarter at a glance</h3>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Highlighted dates mark aid, registration, and major advising milestones across January through March.
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

function FinancialAidView({ openFaq, onToggleFaq }) {
  const maxAidAmount = Math.max(...financialAid.breakdown.map((item) => item.amount))

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.1fr,1fr]">
        <div className="rounded-[32px] border border-[#FEBC11]/25 bg-gradient-to-br from-[#003660] via-[#132f52] to-slate-950 p-6 shadow-[0_20px_90px_rgba(2,8,23,0.35)]">
          <p className="text-sm uppercase tracking-[0.24em] text-[#FEBC11]">Financial Aid</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">Winter 2026 aid overview</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            A simple view of grants, loans, work-study, expected refund timing, and common questions students ask before changing units.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <AidStat label="Total aid" value={currencyFormatter.format(financialAid.summary.totalAid)} />
            <AidStat label="Remaining balance" value={currencyFormatter.format(financialAid.summary.remainingBalance)} />
            <AidStat label="Housing covered" value={`${financialAid.summary.housingCoveredPercent}%`} />
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-white/6 p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-[#FEBC11]">Aid breakdown</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight">How Winter is funded</h3>
            </div>
            <AppIcon name="aid" className="h-6 w-6 text-[#FEBC11]" />
          </div>

          <div className="mt-6 space-y-4">
            {financialAid.breakdown.map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-semibold">{item.label}</div>
                    <div className="mt-1 text-sm capitalize text-slate-400">{item.type}</div>
                  </div>
                  <div className="text-base font-semibold">{currencyFormatter.format(item.amount)}</div>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#FEBC11] to-[#ffe08a]"
                    style={{ width: `${(item.amount / maxAidAmount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
        <div className="rounded-[32px] border border-white/10 bg-white/6 p-6 backdrop-blur-xl">
          <p className="text-sm uppercase tracking-[0.24em] text-[#FEBC11]">Disbursement timeline</p>
          <div className="mt-5 space-y-4">
            {financialAid.timeline.map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[#FEBC11]">{item.title}</div>
                <div className="mt-2 text-sm leading-6 text-slate-300">{item.detail}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-[28px] border border-[#FEBC11]/20 bg-[#FEBC11]/8 p-5">
            <p className="text-sm uppercase tracking-[0.2em] text-[#FEBC11]">Need help?</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {financialAid.links.map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-[#FEBC11]/35 hover:text-[#FEBC11]"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-white/6 p-6 backdrop-blur-xl">
          <p className="text-sm uppercase tracking-[0.24em] text-[#FEBC11]">FAQ</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight">Common student questions</h3>

          <div className="mt-6 space-y-4">
            {financialAid.faqs.map((faq) => {
              const isOpen = openFaq === faq.id
              return (
                <div key={faq.id} className="rounded-2xl border border-white/10 bg-slate-950/45">
                  <button
                    type="button"
                    onClick={() => onToggleFaq(isOpen ? '' : faq.id)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="font-semibold">{faq.question}</span>
                    <AppIcon
                      name="chevron"
                      className={`h-5 w-5 transition ${isOpen ? 'rotate-180 text-[#FEBC11]' : 'text-slate-400'}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="border-t border-white/10 px-5 py-4 text-sm leading-7 text-slate-300">
                      {faq.answer}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}

function MonthCard({ label, monthIndex, highlightedDays }) {
  const cells = getMonthMatrix(2026, monthIndex)

  return (
    <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur-xl">
      <div className="text-lg font-semibold tracking-tight">{label}</div>
      <div className="mt-4 grid grid-cols-7 gap-2 text-center text-xs uppercase tracking-[0.18em] text-slate-500">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
          <div key={`${label}-${day}`}>{day}</div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-7 gap-2">
        {cells.map((day, index) => {
          const isHighlighted = day && highlightedDays.has(day)
          return (
            <div
              key={`${label}-${index}`}
              className={`flex aspect-square items-center justify-center rounded-xl text-sm ${
                day
                  ? isHighlighted
                    ? 'bg-[#FEBC11] font-semibold text-[#003660]'
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
        background: `conic-gradient(#FEBC11 0deg ${percent * 3.6}deg, rgba(255,255,255,0.08) ${percent * 3.6}deg 360deg)`,
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
    gold: 'from-[#FEBC11]/18 to-[#FEBC11]/0 text-[#fff1bd]',
    emerald: 'from-emerald-500/16 to-emerald-500/0 text-emerald-100',
    indigo: 'from-indigo-500/16 to-indigo-500/0 text-indigo-100',
  }

  return (
    <div className={`rounded-[28px] border border-white/10 bg-gradient-to-br ${toneStyles[metric.tone]} p-[1px]`}>
      <div className="rounded-[27px] bg-slate-950/85 p-5">
        <div className="text-sm text-slate-400">{metric.label}</div>
        <div className="mt-3 text-3xl font-semibold tracking-tight text-white">{metric.value}</div>
      </div>
    </div>
  )
}

function StatHighlight({ label, value, tone }) {
  const toneClasses = {
    gold: 'border-[#FEBC11]/25 bg-[#FEBC11]/10 text-[#FEBC11]',
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

function AidStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
      <div className="text-sm text-slate-300">{label}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
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

function AppIcon({ name, className = 'h-5 w-5' }) {
  const icons = {
    dashboard: (
      <path
        d="M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z"
        fill="currentColor"
      />
    ),
    planner: (
      <path
        d="M5 5h14v14H5zM9 3v4M15 3v4M5 9h14"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    ),
    checklist: (
      <path
        d="M9 7h10M9 12h10M9 17h10M5 7l1.5 1.5L8.5 6M5 12l1.5 1.5L8.5 11M5 17l1.5 1.5L8.5 16"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    ),
    chat: (
      <path
        d="M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v6A2.5 2.5 0 0 1 16.5 15H10l-4 4v-4H7.5A2.5 2.5 0 0 1 5 12.5z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    ),
    calendar: (
      <path
        d="M6 4v3M18 4v3M5 8h14M6 6h12a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zm3 5h2m4 0h2m-8 4h2"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    ),
    aid: (
      <path
        d="M12 3 3 7.5l9 4.5 9-4.5L12 3Zm-6.5 8.8V16L12 21l6.5-5v-4.2L12 15z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    ),
    bell: (
      <path
        d="M12 4a4 4 0 0 1 4 4v2.6c0 .7.2 1.4.6 2l1.1 1.7c.5.8-.1 1.7-1 1.7H7.3c-.9 0-1.5-.9-1-1.7l1.1-1.7c.4-.6.6-1.3.6-2V8a4 4 0 0 1 4-4Zm-1.5 14h3"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    ),
    'arrow-up-right': (
      <path
        d="M7 17 17 7M9 7h8v8"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    ),
    spark: (
      <path
        d="M12 3l1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7L12 3Zm6 11 1 2.5L21.5 18 19 19l-1 2.5L17 19l-2.5-1 2.5-1.5L18 14Zm-12 0 1 2.5L9.5 18 7 19l-1 2.5L5 19l-2.5-1L5 16.5 6 14Z"
        fill="currentColor"
      />
    ),
    check: (
      <path
        d="m5 12 4.2 4.2L19 6.5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    ),
    chevron: (
      <path
        d="m6 9 6 6 6-6"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    ),
  }

  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      {icons[name]}
    </svg>
  )
}

export default App
