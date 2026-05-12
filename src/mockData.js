export const navItems = [
  { id: 'dashboard', label: 'Dashboard', shortLabel: 'Home', icon: 'dashboard' },
  { id: 'planner', label: '4-Year Planner', shortLabel: 'Planner', icon: 'planner' },
  { id: 'checklist', label: 'Degree Checklist', shortLabel: 'Checklist', icon: 'checklist' },
  { id: 'chat', label: 'AI Advisor', shortLabel: 'Advisor', icon: 'chat' },
  { id: 'dates', label: 'Important Dates', shortLabel: 'Dates', icon: 'calendar' },
  { id: 'aid', label: 'Financial Aid', shortLabel: 'Aid', icon: 'aid' },
]

export const studentProfile = {
  name: 'Maya Hernandez',
  firstName: 'Maya',
  initials: 'MH',
  major: 'B.S. Computer Science',
  college: 'College of Engineering',
  year: 'Second Year',
  completedPercent: 68,
  unitsCompleted: 112,
  expectedGraduation: 'Spring 2028',
  standing: 'Good standing',
}

export const dashboardMetrics = [
  { label: 'Completed units', value: '112 / 180', tone: 'sky' },
  { label: 'Current GPA', value: '3.72', tone: 'gold' },
  { label: 'Planned next quarter units', value: '14', tone: 'emerald' },
  { label: 'Registration hold status', value: 'No holds', tone: 'indigo' },
]

export const quickAccessCards = [
  {
    id: 'planner',
    title: 'Plan Spring quarter',
    description: 'Add your next set of CMPSC and GE courses while keeping unit load balanced.',
    accent: 'from-sky-500/20 to-sky-400/0',
  },
  {
    id: 'checklist',
    title: 'Review degree progress',
    description: 'See which GE areas, major requirements, and electives are still outstanding.',
    accent: 'from-amber-400/20 to-amber-300/0',
  },
  {
    id: 'chat',
    title: 'Ask Gaucho Guide',
    description: 'Get mock advising guidance on prerequisites, sequencing, and UCSB planning tools.',
    accent: 'from-indigo-400/20 to-indigo-300/0',
  },
  {
    id: 'aid',
    title: 'Check your aid package',
    description: 'Review Winter 2026 aid timing, coverage, and what happens if units change.',
    accent: 'from-emerald-400/20 to-emerald-300/0',
  },
]

export const upcomingDeadlines = [
  {
    date: 'Jan 16',
    title: 'Last day to add Winter 2026 classes',
    description: 'Use GOLD to add courses or adjust grading options before the registrar deadline.',
    priority: 'urgent',
  },
  {
    date: 'Feb 13',
    title: 'Computer Science major declaration window closes',
    description: 'Meet with advising and submit any remaining paperwork before the window ends.',
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
        { code: 'CMPSC 8', title: 'Intro to Computer Science', units: 4, type: 'major' },
        { code: 'MATH 3A', title: 'Calculus with Applications I', units: 4, type: 'major' },
        { code: 'WRIT 2', title: 'Academic Writing', units: 4, type: 'ge' },
      ],
      Winter: [
        { code: 'CMPSC 16', title: 'Problem Solving with Computers', units: 4, type: 'major' },
        { code: 'MATH 3B', title: 'Calculus with Applications II', units: 4, type: 'major' },
        { code: 'GE A2', title: 'Oral Communication', units: 4, type: 'ge' },
      ],
      Spring: [
        { code: 'CMPSC 24', title: 'Problem Solving with Computers II', units: 4, type: 'major' },
        { code: 'MATH 4A', title: 'Linear Algebra', units: 4, type: 'major' },
        { code: 'PHYS 1', title: 'Physics for Scientists and Engineers', units: 4, type: 'major' },
      ],
    },
  },
  {
    year: 'Year 2',
    quarters: {
      Fall: [
        { code: 'CMPSC 40', title: 'Foundations of Computer Science', units: 4, type: 'major' },
        { code: 'CMPSC 64', title: 'Computer Organization', units: 4, type: 'major' },
        { code: 'PSTAT 120A', title: 'Probability and Statistics', units: 4, type: 'major' },
      ],
      Winter: [
        { code: 'CMPSC 130A', title: 'Data Structures and Algorithms I', units: 4, type: 'major' },
        { code: 'CMPSC 138', title: 'Computer Systems and Networks', units: 4, type: 'major' },
        { code: 'GE C', title: 'Arts and Culture', units: 4, type: 'ge' },
      ],
      Spring: [
        { code: 'CMPSC 130B', title: 'Data Structures and Algorithms II', units: 4, type: 'major' },
        { code: 'CMPSC 170', title: 'Computer Architecture', units: 4, type: 'major' },
        { code: 'GE D', title: 'Social Sciences', units: 4, type: 'ge' },
      ],
    },
  },
  {
    year: 'Year 3',
    quarters: {
      Fall: [
        { code: 'CMPSC 154', title: 'Human-Computer Interaction', units: 4, type: 'major' },
        { code: 'CMPSC 156', title: 'Programming Languages', units: 4, type: 'major' },
        { code: 'GE F', title: 'World Cultures', units: 4, type: 'ge' },
      ],
      Winter: [
        { code: 'CMPSC 160', title: 'Machine Learning', units: 4, type: 'major' },
        { code: 'CMPSC 165A', title: 'Artificial Intelligence', units: 4, type: 'major' },
        { code: 'TMP 120', title: 'Innovation and Entrepreneurship', units: 4, type: 'elective' },
      ],
      Spring: [
        { code: 'CS Elective', title: 'Upper-Division CS Elective', units: 4, type: 'elective' },
        { code: 'GE E', title: 'Lifelong Learning', units: 4, type: 'ge' },
      ],
    },
  },
  {
    year: 'Year 4',
    quarters: {
      Fall: [
        { code: 'CS Elective', title: 'Systems or Security Elective', units: 4, type: 'elective' },
        { code: 'Tech Elective', title: 'Approved Technical Elective', units: 4, type: 'elective' },
      ],
      Winter: [
        { code: 'CS Capstone', title: 'Senior Project or Research', units: 4, type: 'major' },
        { code: 'Free Elective', title: 'Open Elective', units: 4, type: 'elective' },
      ],
      Spring: [
        { code: 'Free Elective', title: 'Final Elective Block', units: 4, type: 'elective' },
      ],
    },
  },
]

export const plannerSuggestions = [
  {
    code: 'CMPSC 130B',
    title: 'Data Structures and Algorithms II',
    units: 4,
    type: 'major',
    note: 'Recommended next step after CMPSC 130A.',
  },
  {
    code: 'CMPSC 170',
    title: 'Computer Architecture',
    units: 4,
    type: 'major',
    note: 'Pairs well with CMPSC 130B for Spring planning.',
  },
  {
    code: 'PSTAT 120B',
    title: 'Mathematical Statistics',
    units: 4,
    type: 'elective',
    note: 'Helpful if you plan to lean into AI or data courses.',
  },
  {
    code: 'GE D',
    title: 'Social Sciences',
    units: 4,
    type: 'ge',
    note: 'Keeps GE progress moving without overloading technical units.',
  },
  {
    code: 'TMP 120',
    title: 'Innovation and Entrepreneurship',
    units: 4,
    type: 'elective',
    note: 'Popular elective for CS students interested in startups and product.',
  },
]

export const requirementSections = [
  {
    id: 'ge',
    title: 'General Education Areas',
    description: 'Letters & Science breadth and campus-wide foundations.',
    items: [
      { id: 'req-a1', label: 'Area A1: Writing', detail: 'WRIT 2 or approved equivalent', completed: true, transferEligible: true },
      { id: 'req-a2', label: 'Area A2: Oral Communication', detail: 'Public speaking or oral communication requirement', completed: true, transferEligible: true },
      { id: 'req-b', label: 'Area B: Science and Mathematics', detail: 'Satisfied through math and physics sequence', completed: true, transferEligible: false },
      { id: 'req-c', label: 'Area C: Arts', detail: 'One approved arts and culture course', completed: true, transferEligible: false },
      { id: 'req-d', label: 'Area D: Social Sciences', detail: 'Still needs one approved course', completed: false, transferEligible: false },
      { id: 'req-e', label: 'Area E: Lifelong Learning', detail: 'Can be met by approved health or human development coursework', completed: false, transferEligible: true },
      { id: 'req-f', label: 'Area F: World Cultures', detail: 'Upper- or lower-division approved course', completed: true, transferEligible: false },
    ],
  },
  {
    id: 'major',
    title: 'Computer Science Core',
    description: 'Core lower-division and upper-division courses for the major.',
    items: [
      { id: 'req-cs8', label: 'CMPSC 8', detail: 'Intro to Computer Science', completed: true, transferEligible: false },
      { id: 'req-cs16', label: 'CMPSC 16', detail: 'Problem Solving with Computers', completed: true, transferEligible: false },
      { id: 'req-cs24', label: 'CMPSC 24', detail: 'Problem Solving with Computers II', completed: true, transferEligible: false },
      { id: 'req-cs40', label: 'CMPSC 40', detail: 'Foundations of Computer Science', completed: true, transferEligible: false },
      { id: 'req-cs64', label: 'CMPSC 64', detail: 'Computer Organization', completed: true, transferEligible: false },
      { id: 'req-cs130a', label: 'CMPSC 130A', detail: 'Data Structures and Algorithms I', completed: true, transferEligible: false },
      { id: 'req-cs130b', label: 'CMPSC 130B', detail: 'Data Structures and Algorithms II', completed: false, transferEligible: false },
      { id: 'req-cs154', label: 'CMPSC 154', detail: 'Human-Computer Interaction', completed: false, transferEligible: false },
      { id: 'req-cs156', label: 'CMPSC 156', detail: 'Programming Languages', completed: false, transferEligible: false },
      { id: 'req-cs170', label: 'CMPSC 170', detail: 'Computer Architecture', completed: false, transferEligible: false },
    ],
  },
  {
    id: 'support',
    title: 'Support Courses and Electives',
    description: 'Math, physics, statistics, and elective flexibility.',
    items: [
      { id: 'req-math3a', label: 'MATH 3A', detail: 'Calculus I', completed: true, transferEligible: true },
      { id: 'req-math3b', label: 'MATH 3B', detail: 'Calculus II', completed: true, transferEligible: false },
      { id: 'req-math4a', label: 'MATH 4A', detail: 'Linear Algebra', completed: true, transferEligible: false },
      { id: 'req-phys1', label: 'PHYS 1', detail: 'Physics I', completed: true, transferEligible: false },
      { id: 'req-phys2', label: 'PHYS 2', detail: 'Physics II', completed: false, transferEligible: false },
      { id: 'req-pstat120a', label: 'PSTAT 120A', detail: 'Probability and Statistics', completed: true, transferEligible: false },
      { id: 'req-tech1', label: 'Approved technical elective', detail: 'One upper-division elective outside core', completed: false, transferEligible: false },
      { id: 'req-free1', label: 'Open elective block', detail: 'Flexible unit space toward 180 units', completed: false, transferEligible: true },
    ],
  },
]

export const chatbotSeedMessages = [
  {
    id: 'bot-intro',
    sender: 'bot',
    text: 'Hi Maya. I am Gaucho Guide, your planning assistant for UCSB. I can help with course sequencing, deadlines, and financial aid basics.',
  },
  {
    id: 'user-question',
    sender: 'user',
    text: 'What classes do I need to take next quarter?',
  },
  {
    id: 'bot-answer',
    sender: 'bot',
    text: 'Based on your current plan, I would target CMPSC 130B and CMPSC 170 next quarter, then round out the schedule with one lighter GE or elective. That keeps you moving through core CS sequencing without stacking too many heavy theory courses.',
    bullets: [
      'Take CMPSC 130B after CMPSC 130A so you stay on pace for upper-division CS electives.',
      'Add CMPSC 170 if you are comfortable with your Winter workload and want to keep architecture on track.',
      'Use a GE Area D or TMP 120 as your third class to keep the quarter around 12 to 14 units.',
      'Prereq warning: if CMPSC 130A is still in progress, do not waitlist 130B without confirming the department will clear you after grades post.',
    ],
    resources: [
      { label: 'Rate My Professor', url: 'https://www.ratemyprofessors.com/search/professors/1076?q=UCSB' },
      { label: 'Gaucho Gold', url: 'https://my.sa.ucsb.edu/gold/' },
      { label: 'CS Advising', url: 'https://cs.ucsb.edu/education/undergraduate' },
    ],
  },
]

export const winterDates = [
  {
    date: '2026-01-02',
    month: 'Jan',
    day: '02',
    title: 'Financial aid posts to BARC',
    detail: 'Most grants, loans, and scholarships are scheduled to appear before instruction begins.',
    category: 'aid',
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
    date: '2026-01-12',
    month: 'Jan',
    day: '12',
    title: 'Major declaration advising opens',
    detail: 'Computer Science advising appointments begin for students preparing declaration materials.',
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
    date: '2026-02-13',
    month: 'Feb',
    day: '13',
    title: 'Major declaration window closes',
    detail: 'Submit final paperwork to Engineering advising before the window closes.',
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

export const financialAid = {
  summary: {
    totalAid: 11089,
    remainingBalance: 1240,
    housingCoveredPercent: 78,
  },
  breakdown: [
    { label: 'Federal Pell Grant', amount: 3247, type: 'grant' },
    { label: 'Cal Grant A', amount: 4842, type: 'grant' },
    { label: 'Direct Subsidized Loan', amount: 1750, type: 'loan' },
    { label: 'Work-Study Offer', amount: 1250, type: 'work-study' },
  ],
  timeline: [
    { title: 'Jan 2', detail: 'Aid disburses to BARC and outstanding Winter charges are applied first.' },
    { title: 'Jan 5', detail: 'If aid exceeds charges, refund processing begins.' },
    { title: 'Jan 9', detail: 'Direct deposit typically lands for students with eRefund enrollment.' },
  ],
  links: [
    { label: 'UCSB Financial Aid FAQ', url: 'https://www.finaid.ucsb.edu/faq' },
    { label: 'myBARC billing portal', url: 'https://mybarc.ucsb.edu/' },
    { label: 'GOLD registration', url: 'https://my.sa.ucsb.edu/gold/' },
  ],
  faqs: [
    {
      id: 'faq-units',
      question: 'What happens if I drop below 12 units?',
      answer: 'Dropping below full-time enrollment can affect grant eligibility, loan deferment, and work-study. Check with Financial Aid before finalizing any schedule reduction.',
    },
    {
      id: 'faq-refund',
      question: 'When do refunds hit my bank account?',
      answer: 'After aid applies to BARC charges, remaining credit is usually released within a few business days to the bank account tied to eRefund.',
    },
    {
      id: 'faq-holds',
      question: 'Will an enrollment hold stop disbursement?',
      answer: 'Some registration or document holds can delay aid until the required item is resolved. Review your BARC and Financial Aid status pages for alerts.',
    },
  ],
}
