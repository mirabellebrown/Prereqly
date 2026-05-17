import { resolveGeAreaKey } from './gePlaceholder'

const DEGREE_UNIT_TARGET = 180

/**
 * @param {object} params
 * @param {{ unitsCompleted: number, expectedGraduation: string }} params.studentProfile
 * @param {Array<{ id: string, title: string, items: Array<{ id: string, label: string, detail: string, isSatisfied: boolean, isPlanned: boolean }> }>} params.checklistSections
 */
export function buildGraduationSummary({ studentProfile, checklistSections }) {
  const unitsCompleted = studentProfile.unitsCompleted ?? 0
  const unitsRemaining = Math.max(0, DEGREE_UNIT_TARGET - unitsCompleted)

  const allItems = checklistSections.flatMap((section) =>
    section.items.map((item) => ({ ...item, sectionId: section.id, sectionTitle: section.title })),
  )

  const completedCount = allItems.filter((item) => item.isSatisfied).length
  const checklistPercent =
    allItems.length > 0 ? Math.round((completedCount / allItems.length) * 100) : 0

  const whatsLeft = allItems
    .filter((item) => !item.isSatisfied)
    .map((item) => {
      return {
        id: item.id,
        sectionTitle: item.sectionTitle,
        label: item.label,
        detail: item.detail,
        isPlanned: item.isPlanned,
        geAreaKey: resolveGeAreaKey(item),
      }
    })
    .slice(0, 8)

  const riskFlags = []

  const geIncomplete = allItems.filter(
    (item) => (item.sectionId === 'ge' || item.sectionId === 'ge-special') && !item.isSatisfied,
  )
  if (geIncomplete.length > 0) {
    riskFlags.push({
      severity: 'info',
      message: `${geIncomplete.length} GE ${geIncomplete.length === 1 ? 'area' : 'areas'} still open (next: ${geIncomplete[0].label})`,
    })
  }

  const econ101 = allItems.find((item) => item.id === 'req-econ101')
  if (econ101 && !econ101.isSatisfied && !econ101.isPlanned) {
    riskFlags.push({
      severity: 'warn',
      message: 'ECON 101 is not on your plan yet — a common gate for upper-division economics',
    })
  }

  const udIncomplete = allItems.filter(
    (item) =>
      item.sectionId === 'major' &&
      !item.isSatisfied &&
      [
        'req-econ100b',
        'req-econ101',
        'req-econ140a',
        'req-ud-electives',
        'req-econ5',
      ].includes(item.id),
  )
  if (udIncomplete.length >= 3) {
    riskFlags.push({
      severity: 'info',
      message: `${udIncomplete.length} Economics major items still open — pace UD core (100B, 101, 140A) and electives`,
    })
  }

  const unitsLow = unitsRemaining > 68
  if (unitsLow) {
    riskFlags.push({
      severity: 'info',
      message: `${unitsRemaining} units remaining toward ${DEGREE_UNIT_TARGET} — confirm pace with L&S advising`,
    })
  }

  return {
    checklistPercent,
    expectedGraduation: studentProfile.expectedGraduation,
    unitsCompleted,
    unitsTarget: DEGREE_UNIT_TARGET,
    unitsRemaining,
    whatsLeft,
    riskFlags: riskFlags.slice(0, 3),
    onTrack:
      checklistPercent >= 55 &&
      !riskFlags.some((flag) => flag.severity === 'warn'),
  }
}
