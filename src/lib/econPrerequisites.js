import { econPrepMapNodes } from '../mockData'
import { econPrepMapById } from './econPrepFlowchartUtils'

/** Course code → prerequisite course codes (demo L&S Economics path). */
const COURSE_PREREQUISITES = Object.fromEntries(
  econPrepMapNodes.map((node) => [
    node.label,
    (node.requires ?? [])
      .map((id) => econPrepMapById[id]?.label)
      .filter(Boolean),
  ]),
)

// Upper-division courses in the planner that are not on the prep flowchart nodes.
Object.assign(COURSE_PREREQUISITES, {
  'ECON 101': ['ECON 10A', 'PSTAT 109'],
  'ECON 134A': ['ECON 10A', 'PSTAT 109'],
  'ECON 140A': ['ECON 10A', 'ECON 10B'],
  'ECON 140B': ['ECON 140A'],
  'ECON 171': ['ECON 101', 'PSTAT 109'],
  'ECON 115': ['ECON 10A'],
  'ECON 134B': ['ECON 134A'],
  'PSTAT 120A': ['MATH 3B'],
})

export function getPrerequisiteCodes(courseCode) {
  return COURSE_PREREQUISITES[courseCode] ?? []
}

/**
 * @param {string} courseCode
 * @param {Set<string>} satisfiedCodes Planned or completed course codes
 */
export function checkPrerequisitesMet(courseCode, satisfiedCodes) {
  const required = getPrerequisiteCodes(courseCode)
  const missing = required.filter((code) => !satisfiedCodes.has(code))
  return {
    ok: missing.length === 0,
    missing,
    required,
  }
}

const COURSE_CODE_PATTERN = /\b(econ|pstat|math)\s*\d+[a-z]?\b/gi

export function extractCourseCodesFromText(text) {
  const matches = text.match(COURSE_CODE_PATTERN) ?? []
  return matches.map((fragment) => {
    const parts = fragment.trim().split(/\s+/)
    const dept = parts[0].toUpperCase()
    const num = parts[1]?.toUpperCase() ?? ''
    return `${dept} ${num}`.trim()
  })
}

export function buildPrerequisiteChatReply(courseCode, satisfiedCodes) {
  const { ok, missing, required } = checkPrerequisitesMet(courseCode, satisfiedCodes)

  if (required.length === 0) {
    return {
      text: `I do not have prerequisite rules for ${courseCode} in this Economics demo. Check the UCSB General Catalog and your GOLD degree audit.`,
      bullets: ['Use the Economics prep flowchart for prep-course sequencing in this prototype.'],
      resources: [],
    }
  }

  if (ok) {
    return {
      text: `For this demo path, ${courseCode} looks reachable: the listed prerequisites (${required.join(', ')}) appear on your plan or completed record. Confirm enrollment eligibility in Gaucho GOLD before you register.`,
      bullets: [
        'Department and L&S advising should still confirm substitutions, concurrent enrollment, and term offerings.',
      ],
      resources: [],
    }
  }

  return {
    text: `For this demo path, ${courseCode} still needs: ${missing.join(', ')}. Add or complete those courses first, then verify in GOLD.`,
    bullets: [
      `Required before ${courseCode}: ${required.join(', ')}.`,
      'Open the Economics prep flowchart to see how prep courses connect.',
    ],
    resources: [],
  }
}
