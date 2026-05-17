/** Short, cite-ready policy excerpts for the demo library (verify on live UCSB sites). */
export const POLICY_SNIPPET_CATEGORIES = [
  { id: 'all', label: 'All topics' },
  { id: 'enrollment', label: 'Enrollment' },
  { id: 'ge', label: 'General Education' },
  { id: 'major', label: 'Major & department' },
  { id: 'financial', label: 'Billing & aid' },
  { id: 'standing', label: 'Academic standing' },
]

export const policySnippets = [
  {
    id: 'full-time-units',
    category: 'enrollment',
    title: 'Full-time status (typical L&S planning band)',
    excerpt:
      'Many L&S students plan 12–16 units per quarter to stay on track for 180 units. Fewer than 12 units is often considered part-time and can affect financial aid, housing, or visa status—confirm your situation before you drop below full time.',
    keywords: ['units', 'full time', 'full-time', '12 units', 'part time', 'unit load', 'overload'],
    sourceLabel: 'L&S General Academic Advising',
    sourceUrl: 'https://uged.ucsb.edu/advising',
  },
  {
    id: 'pass-time-gold',
    category: 'enrollment',
    title: 'Pass times and registration in GOLD',
    excerpt:
      'Enrollment runs through Gaucho GOLD by assigned pass time. Check holds, prerequisites, and your planned unit total before your window opens; SILVER planning does not reserve a seat.',
    keywords: ['pass time', 'pass-time', 'registration', 'enroll', 'gold', 'hold', 'waitlist'],
    sourceLabel: 'GOLD',
    sourceUrl: 'https://my.sa.ucsb.edu/gold/',
  },
  {
    id: 'add-drop-deadlines',
    category: 'enrollment',
    title: 'Add, drop, and withdrawal deadlines',
    excerpt:
      'Add, drop, and withdrawal dates are published each quarter by the Office of the Registrar. After a deadline, changes usually require petitions or advisor involvement—use the live calendar for your term, not demo dates alone.',
    keywords: ['add', 'drop', 'withdraw', 'deadline', 'late add', 'late drop', 'census'],
    sourceLabel: 'Office of the Registrar',
    sourceUrl: 'https://registrar.sa.ucsb.edu/',
  },
  {
    id: 'ge-catalog-audit',
    category: 'ge',
    title: 'GE requirements and degree audit',
    excerpt:
      'General Education breadth for L&S is defined in the General Catalog. Your GOLD degree audit shows which GE areas are complete; course titles alone do not prove GE credit until the audit updates.',
    keywords: ['ge', 'general education', 'breadth', 'area a', 'area b', 'area c', 'area d', 'area e', 'area f'],
    sourceLabel: 'UCSB General Catalog',
    sourceUrl: 'https://catalog.ucsb.edu/',
  },
  {
    id: 'econ-major-sheet',
    category: 'major',
    title: 'Economics major requirements',
    excerpt:
      '2025–26 Economics B.A.: pre-major ECON 1, 2, 10A (2.85 GPA); prep ECON 5 or PSTAT 120A plus calculus; 40 UD units including 100B, 101, 140A, and seven electives. Max 4 units of ECON 199; 199RA does not count. Confirm in GOLD and with the department.',
    keywords: ['economics', 'econ', 'major', 'declaration', 'prep', 'upper division', 'b.a.'],
    sourceLabel: 'Economics undergraduate program',
    sourceUrl: 'https://www.econ.ucsb.edu/undergraduate',
  },
  {
    id: 'prereq-enforcement',
    category: 'major',
    title: 'Prerequisites in GOLD',
    excerpt:
      'Prerequisites listed in the catalog are enforced at registration. A course on your SILVER planner does not waive prereqs; complete or concurrent prerequisites must appear on your record as GOLD allows.',
    keywords: ['prereq', 'prerequisite', 'coreq', 'sequencing', 'prep course'],
    sourceLabel: 'UCSB General Catalog',
    sourceUrl: 'https://catalog.ucsb.edu/',
  },
  {
    id: 'barc-aid-timing',
    category: 'financial',
    title: 'Charges and aid on myBARC',
    excerpt:
      'Tuition, fees, and most financial aid post to myBARC on registrar-published dates. Aid eligibility can change if enrollment drops below full time—confirm with Financial Aid before making large schedule changes.',
    keywords: ['barc', 'billing', 'tuition', 'fee', 'aid', 'scholarship', 'loan', 'refund'],
    sourceLabel: 'myBARC',
    sourceUrl: 'https://mybarc.ucsb.edu/',
  },
  {
    id: 'probation-advisor',
    category: 'standing',
    title: 'Probation, petitions, and exceptions',
    excerpt:
      'Academic probation, dismissal, readmission, and most petitions are decided by campus policy and staff review. SILVER and Campus Q&A cannot evaluate your standing—schedule L&S General Academic Advising for record-specific guidance.',
    keywords: ['probation', 'disqualif', 'petition', 'appeal', 'dismiss', 'readmission', 'standing', 'sap'],
    sourceLabel: 'L&S General Academic Advising',
    sourceUrl: 'https://uged.ucsb.edu/advising',
  },
  {
    id: 'graduation-filing',
    category: 'standing',
    title: 'Graduation filing and degree audit',
    excerpt:
      'Candidates file for graduation through GOLD when major and college requirements on the degree audit are complete or nearly complete. L&S and your department confirm major certification; demo progress rings are illustrative only.',
    keywords: ['graduate', 'graduation', 'diploma', 'degree audit', 'filing', 'commencement'],
    sourceLabel: 'Office of the Registrar',
    sourceUrl: 'https://registrar.sa.ucsb.edu/',
  },
]

export function filterPolicySnippets(categoryId) {
  if (categoryId === 'all') {
    return policySnippets
  }
  return policySnippets.filter((snippet) => snippet.category === categoryId)
}

export function findPolicySnippetByKeywords(normalizedText) {
  const scored = policySnippets
    .map((snippet) => {
      const hits = snippet.keywords.filter((keyword) => normalizedText.includes(keyword.toLowerCase()))
      return { snippet, score: hits.length }
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)

  return scored[0]?.snippet ?? null
}
