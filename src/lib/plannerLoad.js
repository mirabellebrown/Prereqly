/** UCSB full-time and typical load thresholds for demo warnings. */
export const QUARTER_UNIT_THRESHOLDS = {
  minFullTime: 12,
  maxTypical: 16,
  maxOverload: 20,
}

const LOAD_STYLES = {
  empty: 'border-white/15 bg-white/5 text-slate-400',
  light: 'border-amber-400/30 bg-amber-400/10 text-amber-100',
  balanced: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-100',
  heavy: 'border-gold/35 bg-gold/12 text-gold',
  overload: 'border-rose-400/30 bg-rose-500/12 text-rose-100',
}

export function getQuarterLoadStatus(units) {
  if (units === 0) {
    return {
      level: 'empty',
      label: 'Empty quarter',
      message: 'No courses planned yet. Add recommendations or drag courses from your pathway.',
      className: LOAD_STYLES.empty,
    }
  }

  if (units < QUARTER_UNIT_THRESHOLDS.minFullTime) {
    return {
      level: 'light',
      label: 'Under 12 units',
      message: `${units} units planned — below full-time. Confirm with L&S advising if you intend a reduced load.`,
      className: LOAD_STYLES.light,
    }
  }

  if (units > QUARTER_UNIT_THRESHOLDS.maxOverload) {
    return {
      level: 'overload',
      label: 'Overload risk',
      message: `${units} units exceeds the usual 20-unit cap. Petitions and department approval may be required.`,
      className: LOAD_STYLES.overload,
    }
  }

  if (units > QUARTER_UNIT_THRESHOLDS.maxTypical) {
    return {
      level: 'heavy',
      label: 'Heavy load',
      message: `${units} units is above the typical 12–16 range. Double-check prerequisites and workload in GOLD.`,
      className: LOAD_STYLES.heavy,
    }
  }

  return {
    level: 'balanced',
    label: 'Balanced load',
    message: `${units} units — within the usual 12–16 unit planning band for L&S students.`,
    className: LOAD_STYLES.balanced,
  }
}

export function getQuarterUnits(yearPlan, quarter) {
  return yearPlan.quarters[quarter].reduce((sum, course) => sum + course.units, 0)
}

export function parseQuarterKey(quarterKey) {
  const [year, quarter] = quarterKey.split('|')
  return { year, quarter }
}

export function isOfferedInQuarter(course, quarterName) {
  if (!course?.offeredQuarters?.length || !quarterName) {
    return false
  }
  return course.offeredQuarters.includes(quarterName)
}

export function getOfferedLabel(course, quarterName) {
  if (!isOfferedInQuarter(course, quarterName)) {
    return course?.offeredNote ?? 'Check GOLD schedule'
  }
  return `Typically offered · ${quarterName}`
}
