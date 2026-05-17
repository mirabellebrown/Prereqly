export const navItems = [
  { id: 'dashboard', label: 'Dashboard', shortLabel: 'Home', icon: 'dashboard' },
  { id: 'planner', label: '4-Year Planner', shortLabel: 'Planner', icon: 'planner' },
  { id: 'checklist', label: 'Degree Checklist', shortLabel: 'Checklist', icon: 'checklist' },
  { id: 'chat', label: 'Campus Q&A', shortLabel: 'Q&A', icon: 'chat' },
  { id: 'dates', label: 'Important Dates', shortLabel: 'Dates', icon: 'calendar' },
]

export const studentProfile = {
  name: 'Maya Hernandez',
  firstName: 'Maya',
  initials: 'MH',
  major: 'B.A. Economics',
  college: 'College of Letters & Science',
  year: 'Second Year',
  completedPercent: 68,
  unitsCompleted: 112,
  expectedGraduation: 'Spring 2028',
  standing: 'Good standing',
}

export const dashboardMetrics = [
  { label: 'Completed units', value: '112 / 180', tone: 'sky' },
  { label: 'Current GPA', value: '3.72', tone: 'silver' },
  { label: 'Planned next quarter units', value: '14', tone: 'emerald' },
  { label: 'Registration hold status', value: 'No holds', tone: 'indigo' },
]

export const quickAccessCards = [
  {
    id: 'planner',
    title: 'Plan Spring quarter',
    description: 'Add your next set of major, GE, and elective courses while keeping unit load balanced.',
    accent: 'from-sky-500/20 to-sky-400/0',
  },
  {
    id: 'checklist',
    title: 'Review degree progress',
    description: 'See which GE areas, major requirements, and electives are still outstanding.',
    accent: 'from-amber-400/20 to-amber-300/0',
  },
  {
    id: '_flowchart',
    title: 'Economics prep flowchart',
    description: 'Full-page prerequisite map with color-coded paths (opens in its own view).',
    accent: 'from-violet-500/22 to-violet-400/0',
    href: '/econ-prep-map',
  },
  {
    id: 'chat',
    title: 'Campus Q&A',
    description: 'Ask general questions with links to official UCSB pages; see L&S advising for your specific record.',
    accent: 'from-indigo-400/20 to-indigo-300/0',
  },
  {
    id: 'dates',
    title: 'Review Winter deadlines',
    description: 'See add and drop dates, declaration windows, and the quarter calendar.',
    accent: 'from-emerald-400/20 to-emerald-300/0',
  },
]

export const upcomingDeadlines = [
  {
    date: 'Jan 8',
    title: 'Winter pass time — Priority 2',
    description: 'Your assigned registration window opens. Plan in SILVER, then add courses in Gaucho GOLD.',
    priority: 'urgent',
  },
  {
    date: 'Jan 16',
    title: 'Last day to add Winter 2026 classes',
    description: 'Use GOLD to add courses or adjust grading options before the registrar deadline.',
    priority: 'urgent',
  },
  {
    date: 'Feb 13',
    title: 'Department and L&S declaration prep deadlines',
    description: 'Confirm Economics and L&S paperwork deadlines with your department and L&S General Advising.',
    priority: 'upcoming',
  },
  {
    date: 'Mar 6',
    title: 'Quarter withdrawal deadline',
    description: 'Final day to withdraw from Winter 2026 without a late petition.',
    priority: 'normal',
  },
]

export const plannerLegend = {
  major: {
    label: 'Major requirement',
    badgeClass: 'border-sky-400/30 bg-sky-500/15 text-sky-100',
    pillClass: 'bg-sky-400/20 text-sky-100',
  },
  ge: {
    label: 'GE area',
    badgeClass: 'border-amber-400/30 bg-amber-400/15 text-amber-100',
    pillClass: 'bg-amber-400/20 text-amber-100',
  },
  elective: {
    label: 'Elective',
    badgeClass: 'border-emerald-400/30 bg-emerald-400/15 text-emerald-100',
    pillClass: 'bg-emerald-400/20 text-emerald-100',
  },
}

export const plannerTemplate = [
  {
    year: 'Year 1',
    quarters: {
      Fall: [
        { code: 'ECON 1', title: 'Principles of Microeconomics', units: 4, type: 'major' },
        { code: 'MATH 3A', title: 'Calculus with Applications I', units: 4, type: 'major' },
        { code: 'WRIT 2', title: 'Academic Writing', units: 4, type: 'ge' },
      ],
      Winter: [
        { code: 'ECON 2', title: 'Principles of Macroeconomics', units: 4, type: 'major' },
        { code: 'MATH 3B', title: 'Calculus with Applications II', units: 4, type: 'major' },
        { code: 'GE A2', title: 'Oral Communication', units: 4, type: 'ge' },
      ],
      Spring: [
        { code: 'ECON 10A', title: 'Intermediate Microeconomic Theory', units: 4, type: 'major' },
        { code: 'PSTAT 109', title: 'Statistics for Economics', units: 4, type: 'major' },
        { code: 'GE C', title: 'Arts and Culture', units: 4, type: 'ge' },
      ],
    },
  },
  {
    year: 'Year 2',
    quarters: {
      Fall: [
        { code: 'ECON 10B', title: 'Intermediate Macroeconomic Theory', units: 4, type: 'major' },
        { code: 'GE D', title: 'Social Sciences', units: 4, type: 'ge' },
        { code: 'GE F', title: 'World Cultures', units: 4, type: 'ge' },
      ],
      Winter: [
        { code: 'ECON 101', title: 'Statistics for Economists', units: 4, type: 'major' },
        { code: 'ECON 134A', title: 'Intermediate Financial Economics I', units: 4, type: 'major' },
        { code: 'GE E', title: 'Lifelong Learning', units: 4, type: 'ge' },
      ],
      Spring: [
        { code: 'ECON 140A', title: 'Intermediate Microeconomic Theory II', units: 4, type: 'major' },
        { code: 'ECON 115', title: 'International Macroeconomics', units: 4, type: 'major' },
        { code: 'ENGL 10', title: 'Introduction to Literary Study', units: 4, type: 'elective' },
      ],
    },
  },
  {
    year: 'Year 3',
    quarters: {
      Fall: [
        { code: 'ECON 140B', title: 'Intermediate Microeconomic Theory III', units: 4, type: 'major' },
        { code: 'ECON 171', title: 'Econometrics', units: 4, type: 'major' },
        { code: 'Free Elective', title: 'Open Elective', units: 4, type: 'elective' },
      ],
      Winter: [
        { code: 'ECON 134B', title: 'Intermediate Financial Economics II', units: 4, type: 'major' },
        { code: 'Free Elective', title: 'Open Elective', units: 4, type: 'elective' },
        { code: 'Free Elective', title: 'Open Elective', units: 4, type: 'elective' },
      ],
      Spring: [
        { code: 'ECON 199RA', title: 'Research Assistance in Economics', units: 4, type: 'major' },
        { code: 'PSTAT 120A', title: 'Probability and Statistics', units: 4, type: 'elective' },
        { code: 'Free Elective', title: 'Open Elective', units: 4, type: 'elective' },
      ],
    },
  },
  {
    year: 'Year 4',
    quarters: {
      Fall: [
        { code: 'ECON 199', title: 'Senior Thesis / Capstone', units: 4, type: 'major' },
        { code: 'Free Elective', title: 'Open Elective', units: 4, type: 'elective' },
      ],
      Winter: [
        { code: 'Free Elective', title: 'Open Elective', units: 4, type: 'elective' },
        { code: 'Free Elective', title: 'Open Elective', units: 4, type: 'elective' },
      ],
      Spring: [
        { code: 'Free Elective', title: 'Open Elective', units: 4, type: 'elective' },
      ],
    },
  },
]

export const plannerSuggestions = [
  {
    code: 'ECON 101',
    title: 'Statistics for Economists',
    units: 4,
    type: 'major',
    note: 'Common next step after ECON 10A and PSTAT 109; confirm sequencing with the catalog and L&S advising.',
    offeredQuarters: ['Winter', 'Fall'],
    offeredNote: 'Usually Winter & Fall',
    reasonTags: ['Major sequence', 'Prereqs met', 'Fills theory gap'],
  },
  {
    code: 'ECON 134A',
    title: 'Intermediate Financial Economics I',
    units: 4,
    type: 'major',
    note: 'Pairs with the core theory sequence; verify prerequisites in GOLD before enrolling.',
    offeredQuarters: ['Winter'],
    offeredNote: 'Winter offering in demo schedule',
    reasonTags: ['Upper-div core', 'Pairs with ECON 10B'],
  },
  {
    code: 'ECON 140A',
    title: 'Intermediate Microeconomic Theory II',
    units: 4,
    type: 'major',
    note: 'Upper-division core course; check department guidance if you are considering a double major.',
    offeredQuarters: ['Spring'],
    offeredNote: 'Spring offering — plan ahead',
    reasonTags: ['Major requirement', 'Not offered Winter'],
  },
  {
    code: 'GE E',
    title: 'Lifelong Learning',
    units: 4,
    type: 'ge',
    note: 'Completes another GE letter while keeping unit load near 12 to 14.',
    offeredQuarters: ['Winter', 'Spring', 'Fall'],
    offeredNote: 'Multiple quarters',
    reasonTags: ['GE progress', 'Balances unit load'],
  },
  {
    code: 'ENGL 10',
    title: 'Introduction to Literary Study',
    units: 4,
    type: 'elective',
    note: 'Breadth elective option if you want reading and writing outside economics this quarter.',
    offeredQuarters: ['Winter'],
    offeredNote: 'Winter elective option',
    reasonTags: ['Breadth elective', 'Writing intensive option'],
  },
]

export const advisorSuggestedCourses = [
  {
    code: 'ECON 101',
    title: 'Statistics for Economists',
    type: 'major',
    note: 'Typical bridge course after introductory theory and statistics; confirm your personal plan with L&S or Economics advising.',
  },
  {
    code: 'ECON 134A',
    title: 'Intermediate Financial Economics I',
    type: 'major',
    note: 'Upper-division economics option once core prerequisites are satisfied.',
  },
  {
    code: 'GE E',
    title: 'Lifelong Learning',
    type: 'ge',
    note: 'Keeps GE progress moving alongside heavier theory courses.',
  },
]

export const requirementSections = [
  {
    id: 'ge',
    title: 'General Education Areas',
    description: 'Letters & Science breadth and campus-wide foundations.',
    items: [
      { id: 'req-a1', label: 'Area A1: Writing', detail: 'WRIT 2 or approved equivalent', completed: true, transferEligible: true, courseCodes: ['WRIT 2'] },
      { id: 'req-a2', label: 'Area A2: Oral Communication', detail: 'Public speaking or oral communication requirement', completed: true, transferEligible: true, courseCodes: ['GE A2'] },
      { id: 'req-b', label: 'Area B: Science and Mathematics', detail: 'Met through calculus and statistics supporting the major', completed: true, transferEligible: false, courseCodes: ['MATH 3A', 'MATH 3B', 'PSTAT 109'] },
      { id: 'req-c', label: 'Area C: Arts', detail: 'One approved arts and culture course', completed: true, transferEligible: false, courseCodes: ['GE C'] },
      { id: 'req-d', label: 'Area D: Social Sciences', detail: 'One approved social science course', completed: true, transferEligible: false, courseCodes: ['GE D'] },
      { id: 'req-e', label: 'Area E: Lifelong Learning', detail: 'Can be met by approved health or human development coursework', completed: false, transferEligible: true, courseCodes: ['GE E'] },
      { id: 'req-f', label: 'Area F: World Cultures', detail: 'Upper- or lower-division approved course', completed: true, transferEligible: false, courseCodes: ['GE F'] },
    ],
  },
  {
    id: 'major',
    title: 'Economics major preparation and core',
    description: 'Lower- and upper-division economics courses for the L&S B.A.',
    items: [
      { id: 'req-econ1', label: 'ECON 1', detail: 'Principles of Microeconomics', completed: true, transferEligible: true, courseCodes: ['ECON 1'] },
      { id: 'req-econ2', label: 'ECON 2', detail: 'Principles of Macroeconomics', completed: true, transferEligible: true, courseCodes: ['ECON 2'] },
      { id: 'req-econ10a', label: 'ECON 10A', detail: 'Intermediate Microeconomic Theory', completed: true, transferEligible: false, courseCodes: ['ECON 10A'] },
      { id: 'req-econ10b', label: 'ECON 10B', detail: 'Intermediate Macroeconomic Theory', completed: true, transferEligible: false, courseCodes: ['ECON 10B'] },
      { id: 'req-econ101', label: 'ECON 101', detail: 'Statistics for Economists', completed: false, transferEligible: false, courseCodes: ['ECON 101'] },
      { id: 'req-econ134a', label: 'ECON 134A', detail: 'Intermediate Financial Economics I', completed: false, transferEligible: false, courseCodes: ['ECON 134A'] },
      { id: 'req-econ140a', label: 'ECON 140A', detail: 'Intermediate Microeconomic Theory II', completed: false, transferEligible: false, courseCodes: ['ECON 140A'] },
      { id: 'req-econ140b', label: 'ECON 140B', detail: 'Intermediate Microeconomic Theory III', completed: false, transferEligible: false, courseCodes: ['ECON 140B'] },
      { id: 'req-econ171', label: 'ECON 171', detail: 'Econometrics', completed: false, transferEligible: false, courseCodes: ['ECON 171'] },
      { id: 'req-econud', label: 'Upper-division economics electives', detail: 'Department-approved upper-division economics coursework', completed: false, transferEligible: false, courseCodes: ['ECON 115', 'ECON 134B', 'ECON 199RA', 'ECON 199'] },
    ],
  },
  {
    id: 'support',
    title: 'Support courses and electives',
    description: 'Calculus, statistics, breadth, and open elective space toward 180 units.',
    items: [
      { id: 'req-math3a', label: 'MATH 3A', detail: 'Calculus I', completed: true, transferEligible: true, courseCodes: ['MATH 3A'] },
      { id: 'req-math3b', label: 'MATH 3B', detail: 'Calculus II', completed: true, transferEligible: false, courseCodes: ['MATH 3B'] },
      { id: 'req-pstat109', label: 'PSTAT 109', detail: 'Statistics for Economics', completed: true, transferEligible: false, courseCodes: ['PSTAT 109'] },
      { id: 'req-pstat120a', label: 'PSTAT 120A', detail: 'Probability and Statistics', completed: false, transferEligible: false, courseCodes: ['PSTAT 120A'] },
      { id: 'req-breadth', label: 'Non-major breadth course', detail: 'Elective outside the major for breadth', completed: false, transferEligible: true, courseCodes: ['ENGL 10'] },
      { id: 'req-free1', label: 'Open elective blocks', detail: 'Flexible unit space toward 180 units', completed: false, transferEligible: true, courseCodes: ['Free Elective'] },
    ],
  },
]

export const chatbotSeedMessages = [
  {
    id: 'bot-intro',
    sender: 'bot',
    text: 'Hi Maya. I answer broad, high-level questions about UCSB and L&S planning using links to official sources. Anything about your specific transcript, exceptions, petitions, or degree progress should go to L&S General Academic Advising or your department.',
    resources: [
      { label: 'L&S General Academic Advising (source)', url: 'https://uged.ucsb.edu/advising' },
    ],
  },
  {
    id: 'user-question',
    sender: 'user',
    text: 'What classes should I think about for next quarter?',
  },
  {
    id: 'bot-answer',
    sender: 'bot',
    text: 'Based on this sample L&S Economics roadmap, many students look at ECON 101 and ECON 134A after finishing ECON 10A and PSTAT 109, then balance the quarter with a remaining GE such as Area E. Your real schedule depends on prerequisites you have already satisfied—confirm every course in GOLD and with L&S or Economics advising.',
    bullets: [
      'Use the General Catalog and GOLD class search to verify prerequisites and major requirements before you enroll.',
      'If you are considering a double major, minor, or substitution, treat that as advisor-level planning rather than something to finalize from chat alone.',
    ],
    resources: [
      { label: 'L&S General Academic Advising (source)', url: 'https://uged.ucsb.edu/advising' },
      { label: 'UCSB General Catalog (source)', url: 'https://catalog.ucsb.edu/' },
      { label: 'GOLD class search and schedule (source)', url: 'https://my.sa.ucsb.edu/gold/' },
    ],
  },
]

export const winterDates = [
  {
    date: '2026-01-02',
    month: 'Jan',
    day: '02',
    title: 'Aid and charges post to BARC',
    detail: 'Typical timing for Winter aid to appear against tuition and fees before instruction begins.',
    category: 'billing',
  },
  {
    date: '2026-01-05',
    month: 'Jan',
    day: '05',
    title: 'Winter 2026 instruction begins',
    detail: 'Classes start for the Winter quarter.',
    category: 'academic',
  },
  {
    date: '2026-01-08',
    month: 'Jan',
    day: '08',
    title: 'Winter pass time — Priority 2',
    detail:
      'Registration window for your assigned pass time. Finalize your planned schedule here, then add courses in Gaucho GOLD when your window opens.',
    category: 'registration',
    priority: 'urgent',
  },
  {
    date: '2026-01-12',
    month: 'Jan',
    day: '12',
    title: 'L&S and department advising for spring planning',
    detail: 'Many L&S students meet General Advising or their department about spring enrollment and major paperwork.',
    category: 'major',
  },
  {
    date: '2026-01-16',
    month: 'Jan',
    day: '16',
    title: 'Add deadline',
    detail: 'Last day to add classes in GOLD without a late petition.',
    category: 'academic',
  },
  {
    date: '2026-02-02',
    month: 'Feb',
    day: '02',
    title: 'Drop deadline',
    detail: 'Last day to drop most classes without a petition.',
    category: 'academic',
  },
  {
    date: '2026-02-10',
    month: 'Feb',
    day: '10',
    title: 'Spring pass time — Priority 2',
    detail: 'Next-quarter enrollment by pass time. Check holds, prerequisites, and unit load before GOLD opens for your window.',
    category: 'registration',
    priority: 'upcoming',
  },
  {
    date: '2026-02-13',
    month: 'Feb',
    day: '13',
    title: 'Department and L&S declaration deadlines',
    detail: 'Confirm Economics and L&S paperwork deadlines with your department and L&S General Advising.',
    category: 'major',
  },
  {
    date: '2026-03-06',
    month: 'Mar',
    day: '06',
    title: 'Withdrawal deadline',
    detail: 'Final day to withdraw from the quarter before finals week.',
    category: 'academic',
  },
  {
    date: '2026-03-14',
    month: 'Mar',
    day: '14',
    title: 'Winter finals begin',
    detail: 'Final exam period begins and runs through March 20.',
    category: 'academic',
  },
]

/**
 * Flowchart layout for the demo L&S Economics prep path (nodes + edges).
 * `kind: 'gate'` nodes are visual “All” joins only; only `course` nodes are tappable.
 * Verify real rules in GOLD and the UCSB General Catalog.
 */
export const econPrepFlowchart = {
  width: 1380,
  height: 640,
  edges: [
    { from: 'econ1', to: 'econ2', fromSide: 'bottom', toSide: 'top', stroke: '#38bdf8' },
    { from: 'econ1', to: 'gate10a', fromSide: 'right', toSide: 'left', stroke: '#fbbf24' },
    { from: 'math3a', to: 'gate10a', fromSide: 'right', toSide: 'left', stroke: '#a855f7' },
    { from: 'gate10a', to: 'econ10a', fromSide: 'right', toSide: 'left', stroke: '#2dd4bf' },
    { from: 'math3a', to: 'math3b', fromSide: 'bottom', toSide: 'top', stroke: '#60a5fa' },
    { from: 'econ1', to: 'gatePstat', fromSide: 'right', toSide: 'left', stroke: '#fb7185' },
    { from: 'math3a', to: 'gatePstat', fromSide: 'right', toSide: 'left', stroke: '#c084fc' },
    { from: 'gatePstat', to: 'pstat109', fromSide: 'right', toSide: 'left', stroke: '#4ade80' },
    { from: 'econ10a', to: 'econ10b', fromSide: 'bottom', toSide: 'top', stroke: '#fcd34d' },
    { from: 'econ2', to: 'gateFull', fromSide: 'right', toSide: 'left', stroke: '#22d3ee' },
    { from: 'math3b', to: 'gateFull', fromSide: 'right', toSide: 'left', stroke: '#818cf8' },
    { from: 'econ10a', to: 'gateFull', fromSide: 'right', toSide: 'left', stroke: '#f97316' },
    { from: 'pstat109', to: 'gateFull', fromSide: 'right', toSide: 'left', stroke: '#14b8a6' },
    { from: 'econ10b', to: 'gateFull', fromSide: 'right', toSide: 'left', stroke: '#e879f9' },
    { from: 'gateFull', to: 'fullMajor', fromSide: 'right', toSide: 'left', stroke: '#fde047' },
  ],
  nodes: [
    {
      id: 'econ1',
      kind: 'course',
      label: 'ECON 1',
      subtitle: 'Micro principles',
      x: 32,
      y: 45,
      w: 192,
      h: 83,
      requires: [],
    },
    {
      id: 'econ2',
      kind: 'course',
      label: 'ECON 2',
      subtitle: 'Macro principles',
      x: 32,
      y: 160,
      w: 192,
      h: 83,
      requires: ['econ1'],
    },
    {
      id: 'math3a',
      kind: 'course',
      label: 'MATH 3A',
      subtitle: 'Calculus I',
      x: 32,
      y: 307,
      w: 192,
      h: 83,
      requires: [],
    },
    {
      id: 'math3b',
      kind: 'course',
      label: 'MATH 3B',
      subtitle: 'Calculus II',
      x: 32,
      y: 422,
      w: 192,
      h: 83,
      requires: ['math3a'],
    },
    {
      id: 'gate10a',
      kind: 'gate',
      gateKind: 'all',
      label: 'All',
      x: 301,
      y: 83,
      w: 77,
      h: 58,
    },
    {
      id: 'gatePstat',
      kind: 'gate',
      gateKind: 'all',
      label: 'All',
      x: 301,
      y: 346,
      w: 77,
      h: 58,
    },
    {
      id: 'econ10a',
      kind: 'course',
      label: 'ECON 10A',
      subtitle: 'Intermediate micro',
      x: 467,
      y: 58,
      w: 218,
      h: 96,
      requires: ['econ1', 'math3a'],
    },
    {
      id: 'pstat109',
      kind: 'course',
      label: 'PSTAT 109',
      subtitle: 'Statistics for economics',
      x: 467,
      y: 320,
      w: 218,
      h: 96,
      requires: ['econ1', 'math3a'],
    },
    {
      id: 'econ10b',
      kind: 'course',
      label: 'ECON 10B',
      subtitle: 'Intermediate macro',
      x: 467,
      y: 467,
      w: 218,
      h: 96,
      requires: ['econ10a'],
    },
    {
      id: 'gateFull',
      kind: 'gate',
      gateKind: 'all',
      label: 'All',
      x: 787,
      y: 269,
      w: 83,
      h: 70,
    },
    {
      id: 'fullMajor',
      kind: 'course',
      label: 'Upper-division ECON',
      subtitle: 'Full major coursework & electives',
      x: 979,
      y: 224,
      w: 320,
      h: 166,
      requires: ['econ2', 'math3b', 'econ10a', 'pstat109', 'econ10b'],
    },
  ],
}

/** Course nodes only (used for completion / prerequisite logic). */
export const econPrepMapNodes = econPrepFlowchart.nodes
  .filter((n) => n.kind === 'course')
  .map(({ id, label, subtitle, requires }) => ({ id, label, subtitle, requires }))
