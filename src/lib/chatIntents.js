import { OFFICIAL_SOURCE } from '../data/officialSources'
import { findPolicySnippetByKeywords } from '../data/policySnippets'

function chatNeedsCampusAdvisor(normalized) {
  const hints = [
    'petition',
    'probation',
    'appeal',
    'dismiss',
    'disqualif',
    'readmission',
    'reinstate',
    'concurrent enrollment',
    'grade dispute',
    'grade change',
    'transcript hold',
    'enrollment hold',
    'registration hold',
    'substitution',
    'waiver',
    'retroactive',
    'medical withdrawal',
    'medical leave',
    'degree audit',
    'graduation filing',
    'double major',
    'two majors',
    'triple major',
    'minor in ',
    'academic dishonesty',
    'satisfactory academic',
    ' sap ',
    ' ferpa',
  ]
  return hints.some((fragment) => normalized.includes(fragment))
}

export function ensureOfficialSources(reply) {
  const resources = Array.isArray(reply.resources) ? [...reply.resources] : []
  if (resources.length === 0) {
    resources.push(OFFICIAL_SOURCE.lsAdvising)
  }
  const seen = new Set()
  const deduped = resources.filter((item) => {
    if (!item?.url) {
      return false
    }
    if (seen.has(item.url)) {
      return false
    }
    seen.add(item.url)
    return true
  })
  return { ...reply, resources: deduped }
}

function withSnippet(reply, normalized) {
  const policySnippet = findPolicySnippetByKeywords(normalized)
  if (!policySnippet) {
    return reply
  }
  return { ...reply, policySnippet }
}

const INTENT_HANDLERS = [
  {
    id: 'advisor_routing',
    matches: (n) => chatNeedsCampusAdvisor(n),
    reply: () => ({
      text: 'That usually depends on your specific record, policies for your term, or staff judgment. Campus Q&A is only for general information with links to official UCSB sources—not for decisions about petitions, standing, or exceptions.',
      bullets: [
        'Talk with L&S General Academic Advising about transcripts, progress checks, readmission, most petitions, and cross-college questions.',
        'For major requirements, substitutions, or department paperwork, use your department’s undergraduate advising (for this demo, Economics).',
      ],
      resources: [OFFICIAL_SOURCE.lsAdvising, OFFICIAL_SOURCE.catalog],
    }),
  },
  {
    id: 'pass_time',
    matches: (n) =>
      n.includes('pass time') ||
      n.includes('pass-time') ||
      n.includes('registration window') ||
      (n.includes('register') && n.includes('when')),
    reply: () => ({
      text: 'Registration windows are assigned by pass time in Gaucho GOLD. This Winter 2026 demo highlights Jan 8 for Priority 2—verify your exact window, holds, and prerequisites in GOLD before you enroll.',
      bullets: [
        'Open the Important Dates view or reminder bell in SILVER for the demo timeline, then confirm on the registrar site.',
        'Plan your unit total in the 4-year planner before your pass time opens.',
      ],
      resources: [OFFICIAL_SOURCE.gold, OFFICIAL_SOURCE.registrar],
    }),
  },
  {
    id: 'holds',
    matches: (n) => n.includes('hold') || n.includes('block') && n.includes('register'),
    reply: () => ({
      text: 'Enrollment holds appear in GOLD and must be cleared before you can register. SILVER cannot see or remove holds on your account.',
      bullets: [
        'Check GOLD for hold type and contact office listed on the hold message.',
        'L&S General Advising can help interpret how a hold interacts with your degree plan, but may not be the office that clears it.',
      ],
      resources: [OFFICIAL_SOURCE.gold, OFFICIAL_SOURCE.lsAdvising],
    }),
  },
  {
    id: 'unit_load',
    matches: (n) =>
      n.includes('how many units') ||
      n.includes('unit load') ||
      n.includes('units should') ||
      n.includes('below 12') ||
      n.includes('overload') ||
      (n.includes('units') && (n.includes('take') || n.includes('full'))),
    reply: () => ({
      text: 'For many L&S students, 12–16 units per quarter is a common planning band toward 180 units. The planner shows load warnings when a quarter is light, heavy, or above typical caps—use those as prompts, not automatic approval.',
      bullets: [
        'Dropping below 12 units may affect financial aid, housing, or visa status—confirm before you finalize a part-time schedule.',
        'More than 16–20 units usually needs careful planning; check GOLD and an advisor if you are considering an overload.',
      ],
      resources: [OFFICIAL_SOURCE.lsAdvising, OFFICIAL_SOURCE.catalog],
    }),
  },
  {
    id: 'financial',
    matches: (n) =>
      n.includes('aid') ||
      n.includes('scholarship') ||
      n.includes('loan') ||
      n.includes('barc') ||
      n.includes('tuition') ||
      n.includes('billing'),
    reply: () => ({
      text: 'Billing and aid are handled outside this planner. Use myBARC for account detail and the Financial Aid office for policy questions; L&S General Advising can help interpret how enrollment choices interact with degree progress, but not replace those offices.',
      bullets: [
        'Review posted aid and charges in myBARC rather than relying on any mock numbers in demos.',
        'If a schedule change might drop you below full time, confirm aid impact with Financial Aid before you finalize the change.',
      ],
      resources: [OFFICIAL_SOURCE.mybarc, OFFICIAL_SOURCE.finAid],
    }),
  },
  {
    id: 'deadlines',
    matches: (n) =>
      n.includes('deadline') ||
      n.includes('drop') ||
      n.includes('add') ||
      n.includes('withdraw') ||
      n.includes('calendar'),
    reply: () => ({
      text: 'Registrar-published deadlines drive add, drop, and withdrawal dates each quarter. Your Winter 2026 prototype timeline highlights Jan 16 (add), Feb 2 (drop), and Mar 6 (withdrawal), but you should always verify the live calendar for your term.',
      bullets: [
        'Perform adds and drops in GOLD before late deadlines so you understand fees and grading options in real time.',
        'Use L&S General Advising if you are unsure how a deadline interacts with probation, part-time status, or major certification.',
      ],
      resources: [OFFICIAL_SOURCE.registrar, OFFICIAL_SOURCE.gold],
    }),
  },
  {
    id: 'graduation',
    matches: (n) =>
      n.includes('graduat') ||
      n.includes('diploma') ||
      n.includes('commencement') ||
      n.includes('180 units'),
    reply: () => ({
      text: 'Graduation requires completing degree requirements shown on your GOLD degree audit and filing for graduation on registrar timelines. SILVER’s progress ring is a demo snapshot for Maya’s Economics path only.',
      bullets: [
        'Meet L&S General Advising for a progress check before your expected term.',
        'Confirm major certification with Economics if you are finishing upper-division major courses.',
      ],
      resources: [OFFICIAL_SOURCE.registrar, OFFICIAL_SOURCE.gold, OFFICIAL_SOURCE.lsAdvising],
    }),
  },
  {
    id: 'transfer',
    matches: (n) =>
      n.includes('transfer') ||
      n.includes('cc credit') ||
      n.includes('community college') ||
      n.includes('ap credit') ||
      n.includes('articulation'),
    reply: () => ({
      text: 'Transfer and exam credit are evaluated against UCSB articulation rules and appear on your transcript and degree audit—not in SILVER’s demo toggle alone. Use GOLD and L&S advising to see what credit applied.',
      bullets: [
        'The checklist transfer toggle in this demo illustrates how transfer might fill GE—it does not replace an official evaluation.',
        'Bring syllabi and transcripts to L&S General Advising for transfer questions.',
      ],
      resources: [OFFICIAL_SOURCE.lsAdvising, OFFICIAL_SOURCE.catalog, OFFICIAL_SOURCE.gold],
    }),
  },
  {
    id: 'ge',
    matches: (n) =>
      n.includes('elective') ||
      n.includes('general education') ||
      /\bge\b/.test(n) ||
      n.includes('breadth'),
    reply: () => ({
      text: 'GE planning for L&S students is spelled out in the General Catalog and your GOLD degree audit. This prototype shows one possible mix of breadth courses alongside an Economics major, but your remaining letters depend on what you have already completed.',
      bullets: [
        'Use GOLD and the catalog’s General Education section to confirm which courses carry which GE credit.',
        'Open the degree checklist GE explainer in SILVER for how GOLD categories map to Areas A–F in this demo.',
      ],
      resources: [OFFICIAL_SOURCE.catalog, OFFICIAL_SOURCE.gold, OFFICIAL_SOURCE.lsAdvising],
    }),
  },
  {
    id: 'prerequisites',
    matches: (n) =>
      n.includes('prereq') ||
      n.includes('prerequisite') ||
      n.includes('sequence') ||
      (n.includes('requirement') && !n.includes('ge')),
    reply: () => ({
      text: 'Prerequisites and major requirements are defined in the General Catalog and enforced through GOLD. Ask about a specific course code (for example “Can I take ECON 101?”) for a demo prerequisite check against your plan.',
      bullets: [
        'Open the Economics prep flowchart from the dashboard or Resource Hub for this demo path.',
        'L&S General Advising and Economics undergraduate advising confirm substitutions and edge cases.',
      ],
      resources: [OFFICIAL_SOURCE.catalog, OFFICIAL_SOURCE.gold, OFFICIAL_SOURCE.econAdvising],
    }),
  },
  {
    id: 'declaration',
    matches: (n) =>
      n.includes('declare') ||
      n.includes('declaration') ||
      n.includes('change major') ||
      n.includes('switch major'),
    reply: () => ({
      text: 'Major declaration rules sit with your department and L&S. Economics and L&S publish deadlines each term—confirm on live sites rather than demo copy alone.',
      bullets: [
        'Use the department website for declaration forms and faculty advisor assignment.',
        'L&S General Advising helps with college requirements and overlapping major plans.',
      ],
      resources: [OFFICIAL_SOURCE.econAdvising, OFFICIAL_SOURCE.lsAdvising, OFFICIAL_SOURCE.catalog],
    }),
  },
]

export function buildChatReply(input) {
  const normalized = input.toLowerCase().trim()

  for (const intent of INTENT_HANDLERS) {
    if (intent.matches(normalized)) {
      return ensureOfficialSources(
        withSnippet(
          {
            ...intent.reply(normalized),
            intentId: intent.id,
          },
          normalized,
        ),
      )
    }
  }

  const fallback = {
    text: 'For general L&S questions, compare any sample roadmap to your GOLD degree audit and the General Catalog. Browse the Resource Hub for official links and policy snippets, or ask about pass times, units, GE, prerequisites, billing, or graduation.',
    bullets: [
      'Use L&S General Academic Advising when you need a human review of progress, exceptions, or long-term plans.',
      'Try a specific course question such as “Can I take ECON 101?” for a demo prerequisite check.',
    ],
    resources: [OFFICIAL_SOURCE.catalog, OFFICIAL_SOURCE.lsAdvising, OFFICIAL_SOURCE.gold],
    intentId: 'general',
  }

  return ensureOfficialSources(withSnippet(fallback, normalized))
}

export { OFFICIAL_SOURCE }
