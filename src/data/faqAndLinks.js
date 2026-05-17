import { OFFICIAL_SOURCE } from './officialSources'

export const FAQ_CATEGORIES = [
  { id: 'all', label: 'All topics' },
  { id: 'planning', label: 'Planning' },
  { id: 'registration', label: 'Registration' },
  { id: 'ge-major', label: 'GE & major' },
  { id: 'financial', label: 'Billing & aid' },
  { id: 'silver', label: 'Using SILVER' },
]

export const frequentlyAskedQuestions = [
  {
    id: 'faq-gold-audit',
    category: 'planning',
    question: 'Where do I see my official degree progress?',
    answer:
      'Your GOLD degree audit is the source of truth for completed requirements, in-progress courses, and what is still open. SILVER’s checklist and progress ring are demo views for this Economics pathway—they do not replace GOLD.',
    links: [OFFICIAL_SOURCE.gold, OFFICIAL_SOURCE.catalog],
    chatPrompt: 'How do I read my GOLD degree audit?',
  },
  {
    id: 'faq-units',
    category: 'planning',
    question: 'How many units should I take each quarter?',
    answer:
      'Many L&S students plan 12–16 units per quarter toward 180 total units. Fewer than 12 is often part-time and can affect aid or housing; more than 16–20 needs careful planning. Use the planner’s load warnings as prompts, then confirm with an advisor if you are unsure.',
    links: [OFFICIAL_SOURCE.lsAdvising],
    chatPrompt: 'How many units should I take?',
  },
  {
    id: 'faq-pass-time',
    category: 'registration',
    question: 'When is my pass time and how do I register?',
    answer:
      'Pass times and enrollment are in Gaucho GOLD. Check holds and prerequisites before your window opens. This Winter 2026 demo highlights sample dates (for example Jan 8 for Priority 2)—always verify your assigned time on the registrar site.',
    links: [OFFICIAL_SOURCE.gold, OFFICIAL_SOURCE.registrar],
    chatPrompt: 'When is my Winter pass time?',
  },
  {
    id: 'faq-holds',
    category: 'registration',
    question: 'Why can’t I register even though I have a pass time?',
    answer:
      'Enrollment holds, unpaid balances, incomplete requirements, or other blocks appear in GOLD and must be cleared by the office listed on the hold. SILVER cannot see or remove holds on your account.',
    links: [OFFICIAL_SOURCE.gold, OFFICIAL_SOURCE.lsAdvising],
    chatPrompt: 'Where do I check holds before registration?',
  },
  {
    id: 'faq-add-drop',
    category: 'registration',
    question: 'What are add, drop, and withdrawal deadlines?',
    answer:
      'The Office of the Registrar publishes deadlines each quarter. After a deadline, changes usually require petitions or advisor support. Use Important Dates in SILVER for the demo timeline, then confirm live dates for your term.',
    links: [OFFICIAL_SOURCE.registrar, OFFICIAL_SOURCE.gold],
    chatPrompt: 'What are the Winter add and drop deadlines?',
  },
  {
    id: 'faq-ge',
    category: 'ge-major',
    question: 'How do I know which GE areas I still need?',
    answer:
      'GE breadth for L&S is defined in the General Catalog. Your GOLD audit shows which Areas A–F are complete. Course titles alone do not prove GE credit until the audit updates—use the checklist GE explainer in SILVER for how this demo maps categories.',
    links: [OFFICIAL_SOURCE.catalog, OFFICIAL_SOURCE.gold],
    chatPrompt: 'What GE areas do I still need?',
  },
  {
    id: 'faq-econ-prereq',
    category: 'ge-major',
    question: 'Can I take ECON 101 or other upper-div courses next quarter?',
    answer:
      'Prerequisites are in the catalog and enforced in GOLD. Ask Campus Q&A with a specific course code (for example “Can I take ECON 101?”) for a demo check against your plan, or open the Economics prep flowchart. Department and L&S advising confirm edge cases.',
    links: [OFFICIAL_SOURCE.catalog, OFFICIAL_SOURCE.econAdvising],
    chatPrompt: 'Can I take ECON 101 next quarter?',
  },
  {
    id: 'faq-declare',
    category: 'ge-major',
    question: 'How do I declare or change my major?',
    answer:
      'Declaration rules sit with your department and L&S. Economics publishes requirements and deadlines on its undergraduate site. L&S General Advising helps with college requirements and plans involving more than one major.',
    links: [OFFICIAL_SOURCE.econAdvising, OFFICIAL_SOURCE.lsAdvising],
    chatPrompt: 'How do I declare Economics as my major?',
  },
  {
    id: 'faq-barc',
    category: 'financial',
    question: 'Where do I see tuition, fees, and financial aid?',
    answer:
      'Charges and most aid post to myBARC on registrar-published dates. Aid eligibility can change if you drop below full time—contact Financial Aid before making large schedule changes.',
    links: [OFFICIAL_SOURCE.mybarc, OFFICIAL_SOURCE.finAid],
    chatPrompt: 'Where do I check myBARC and financial aid?',
  },
  {
    id: 'faq-petition',
    category: 'planning',
    question: 'Can SILVER or Campus Q&A approve a petition or exception?',
    answer:
      'No. Petitions, probation, readmission, substitutions, and record-specific decisions require campus staff. Campus Q&A links to official sources and routes complex cases to L&S General Academic Advising.',
    links: [OFFICIAL_SOURCE.lsAdvising],
    chatPrompt: null,
  },
  {
    id: 'faq-transfer',
    category: 'planning',
    question: 'How does transfer credit work in this demo?',
    answer:
      'The checklist transfer toggle illustrates how transfer might fill GE—it does not replace an official evaluation. Real transfer and exam credit appear on your transcript and GOLD audit after UCSB articulation rules are applied.',
    links: [OFFICIAL_SOURCE.lsAdvising, OFFICIAL_SOURCE.gold],
    chatPrompt: 'How does transfer credit show up on my record?',
  },
  {
    id: 'faq-silver-gold',
    category: 'silver',
    question: 'What is the difference between SILVER and Gaucho GOLD?',
    answer:
      'Gaucho GOLD is UCSB’s official system of record for enrollment, audits, and registration. SILVER is a planning companion prototype: roadmap, checklist, deadlines, and Q&A with links to official pages. Plan in SILVER; enroll and verify in GOLD.',
    links: [OFFICIAL_SOURCE.gold],
    chatPrompt: null,
  },
  {
    id: 'faq-silver-data',
    category: 'silver',
    question: 'Is my data in SILVER saved?',
    answer:
      'This demo stores your planner, transfer toggle, and checklist marks in your browser’s local storage on this device. It is not a secure campus system and does not sync with GOLD.',
    links: [],
    chatPrompt: null,
  },
]

export const usefulLinkGroups = [
  {
    id: 'essential',
    title: 'Start here',
    description: 'The pages most students open first for planning and enrollment.',
    links: [
      { ...OFFICIAL_SOURCE.gold, description: 'Degree audit, class search, registration, holds' },
      { ...OFFICIAL_SOURCE.catalog, description: 'GE, major, and course prerequisite rules' },
      { ...OFFICIAL_SOURCE.lsAdvising, description: 'L&S progress checks and college-wide questions' },
    ],
  },
  {
    id: 'registration',
    title: 'Registration & calendar',
    description: 'Deadlines, pass times, and quarter calendars.',
    links: [
      { ...OFFICIAL_SOURCE.registrar, description: 'Official academic calendar and deadlines' },
      { ...OFFICIAL_SOURCE.gold, description: 'Pass times, enroll, drop, and waitlists' },
    ],
  },
  {
    id: 'major',
    title: 'Economics & L&S major',
    description: 'Department and college resources for this demo path.',
    links: [
      { ...OFFICIAL_SOURCE.econAdvising, description: 'Economics B.A. requirements and advising' },
      { ...OFFICIAL_SOURCE.catalog, description: 'Course descriptions and prerequisites' },
      {
        label: 'Economics prep flowchart (SILVER demo)',
        url: '/econ-prep-map',
        description: 'Visual prerequisite map for the sample major path',
      },
    ],
  },
  {
    id: 'financial',
    title: 'Billing & financial aid',
    description: 'Account balances and aid eligibility.',
    links: [
      { ...OFFICIAL_SOURCE.mybarc, description: 'Tuition, fees, and aid posting' },
      { ...OFFICIAL_SOURCE.finAid, description: 'Scholarships, loans, and enrollment requirements' },
    ],
  },
  {
    id: 'campus-life',
    title: 'Campus services',
    description: 'Support beyond degree requirements.',
    links: [
      {
        label: 'UCSB Basic Needs (source)',
        url: 'https://food.ucsb.edu/',
        description: 'Food security and basic needs resources',
      },
      {
        label: 'Counseling & Psychological Services (source)',
        url: 'https://caps.sa.ucsb.edu/',
        description: 'Mental health and crisis support',
      },
      {
        label: 'Campus Learning Assistance (source)',
        url: 'https://clrc.sa.ucsb.edu/',
        description: 'Tutoring and academic skills support',
      },
    ],
  },
]

export function filterFaqByCategory(categoryId) {
  if (categoryId === 'all') {
    return frequentlyAskedQuestions
  }
  return frequentlyAskedQuestions.filter((item) => item.category === categoryId)
}
