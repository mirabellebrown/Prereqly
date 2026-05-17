/** Maps SILVER GE placeholder codes (e.g. "GE E") to catalog area keys. */
export const GE_AREA_LABELS = {
  A2: 'Area A2 (Writing)',
  B: 'Area B',
  C: 'Area C',
  D: 'Area D',
  E: 'Area E',
  F: 'Area F',
  G: 'Area G',
}

export const DAILY_NEXUS_GE_URL = 'https://dailynexus.com/interactives/grades/ges'

/**
 * @param {string | undefined} courseCode
 * @returns {string | null} Area key such as "E" or "A2"
 */
export function parseGePlaceholderCode(courseCode) {
  if (!courseCode) {
    return null
  }
  const match = courseCode.trim().match(/^GE\s+(A2|[A-G])$/i)
  return match ? match[1].toUpperCase() : null
}

/**
 * @param {string | undefined} label Checklist label such as "Area E: Lifelong Learning"
 */
export function parseGeAreaFromLabel(label) {
  if (!label) {
    return null
  }
  const match = label.match(/Area\s+(A2|[A-G])\b/i)
  return match ? match[1].toUpperCase() : null
}

/**
 * @param {{ courseCodes?: string[], label?: string }} item
 */
export function resolveGeAreaKey(item) {
  if (!item) {
    return null
  }
  for (const code of item.courseCodes ?? []) {
    const fromCode = parseGePlaceholderCode(code)
    if (fromCode) {
      return fromCode
    }
  }
  return parseGeAreaFromLabel(item.label)
}
