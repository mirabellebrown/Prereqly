import 'server-only'

import { unstable_cache } from 'next/cache'
import { parse } from 'csv-parse/sync'

const DAILY_NEXUS_GRADES_URL =
  'https://raw.githubusercontent.com/dailynexusdata/grades-data/main/courseGrades.csv'
const CACHE_REVALIDATE_SECONDS = 60 * 60 * 24
const QUARTER_ORDER = {
  Winter: 1,
  Spring: 2,
  Summer: 3,
  Fall: 4,
}
const LETTER_GRADE_COLUMNS = [
  { column: 'Ap', label: 'A+' },
  { column: 'A', label: 'A' },
  { column: 'Am', label: 'A-' },
  { column: 'Bp', label: 'B+' },
  { column: 'B', label: 'B' },
  { column: 'Bm', label: 'B-' },
  { column: 'Cp', label: 'C+' },
  { column: 'C', label: 'C' },
  { column: 'Cm', label: 'C-' },
  { column: 'Dp', label: 'D+' },
  { column: 'D', label: 'D' },
  { column: 'Dm', label: 'D-' },
  { column: 'F', label: 'F' },
]

function normalizeCourseCode(courseCode) {
  return courseCode?.trim().replace(/\s+/g, ' ').toUpperCase() ?? ''
}

function readNumber(value) {
  const parsedValue = Number(value)
  return Number.isFinite(parsedValue) ? parsedValue : 0
}

function toRoundedNumber(value, digits = 2) {
  return Number(value.toFixed(digits))
}

function createEmptyLetterGradeCounts() {
  return Object.fromEntries(LETTER_GRADE_COLUMNS.map(({ column }) => [column, 0]))
}

function compareTerms(left, right) {
  const yearDifference = left.year - right.year
  if (yearDifference !== 0) {
    return yearDifference
  }

  return (QUARTER_ORDER[left.quarter] ?? 0) - (QUARTER_ORDER[right.quarter] ?? 0)
}

function buildTermLabel(quarter, year) {
  return `${quarter} ${year}`
}

function buildQuarterListLabel(quarters) {
  if (quarters.length === 0) {
    return 'Varies'
  }

  if (quarters.length === 1) {
    return quarters[0]
  }

  if (quarters.length === 2) {
    return `${quarters[0]} and ${quarters[1]}`
  }

  return `${quarters.slice(0, -1).join(', ')}, and ${quarters.at(-1)}`
}

function buildHistoricalInstructorList(offerings) {
  const seenInstructors = new Set()
  const historicalInstructors = []

  for (const offering of [...offerings].sort((left, right) => compareTerms(right, left))) {
    if (!offering.instructor || seenInstructors.has(offering.instructor)) {
      continue
    }

    seenInstructors.add(offering.instructor)
    historicalInstructors.push(offering.instructor)
  }

  return historicalInstructors
}

function buildOfferingHistory(offerings) {
  const offeringsByTerm = offerings.reduce((history, offering) => {
    const termKey = `${offering.year}-${offering.quarter}`

    history[termKey] ??= {
      instructorSet: new Set(),
      offeringCount: 0,
      quarter: offering.quarter,
      term: buildTermLabel(offering.quarter, offering.year),
      totalGpaPoints: 0,
      totalLetterStudents: 0,
      totalStudents: 0,
      year: offering.year,
    }

    const termHistory = history[termKey]
    termHistory.offeringCount += 1
    termHistory.totalGpaPoints += offering.avgGpa * offering.nLetterStudents
    termHistory.totalLetterStudents += offering.nLetterStudents
    termHistory.totalStudents += offering.totalStudents

    if (offering.instructor) {
      termHistory.instructorSet.add(offering.instructor)
    }

    return history
  }, {})

  return Object.values(offeringsByTerm)
    .sort((left, right) => compareTerms(right, left))
    .map((termHistory) => ({
      avgGpa:
        termHistory.totalLetterStudents > 0
          ? toRoundedNumber(termHistory.totalGpaPoints / termHistory.totalLetterStudents)
          : null,
      instructors: [...termHistory.instructorSet],
      offeringCount: termHistory.offeringCount,
      quarter: termHistory.quarter,
      term: termHistory.term,
      totalStudents: termHistory.totalStudents,
      year: termHistory.year,
    }))
}

function aggregateLatestOfferings(offerings, latestTerm) {
  const latestOfferings = offerings.filter(
    (offering) => offering.year === latestTerm.year && offering.quarter === latestTerm.quarter,
  )

  const totalLetterStudents = latestOfferings.reduce(
    (sum, offering) => sum + offering.nLetterStudents,
    0,
  )

  const weightedLatestGpa = latestOfferings.reduce(
    (sum, offering) => sum + offering.avgGpa * offering.nLetterStudents,
    0,
  )

  return {
    instructorCount: latestOfferings.length,
    instructors: latestOfferings.map((offering) => offering.instructor).filter(Boolean),
    latestAvgGpa:
      totalLetterStudents > 0 ? toRoundedNumber(weightedLatestGpa / totalLetterStudents) : null,
  }
}

function summarizeCourseOfferings(course, offerings) {
  const totals = offerings.reduce(
    (summary, offering) => {
      summary.totalOfferings += 1
      summary.totalStudents += offering.totalStudents
      summary.totalLetterStudents += offering.nLetterStudents
      summary.totalGpaPoints += offering.avgGpa * offering.nLetterStudents
      summary.aRangeStudents += offering.aRangeStudents
      summary.bRangeStudents += offering.bRangeStudents
      summary.cOrBelowStudents += offering.cOrBelowStudents
      for (const { column } of LETTER_GRADE_COLUMNS) {
        summary.letterGradeCounts[column] += offering.letterGradeCounts[column]
      }
      return summary
    },
    {
      aRangeStudents: 0,
      bRangeStudents: 0,
      cOrBelowStudents: 0,
      letterGradeCounts: createEmptyLetterGradeCounts(),
      totalGpaPoints: 0,
      totalLetterStudents: 0,
      totalOfferings: 0,
      totalStudents: 0,
    },
  )
  const quarterCounts = offerings.reduce(
    (counts, offering) => {
      if (offering.quarter) {
        counts[offering.quarter] = (counts[offering.quarter] ?? 0) + 1
      }
      return counts
    },
    {},
  )

  const latestTerm = offerings.reduce(
    (currentLatest, offering) =>
      compareTerms(offering, currentLatest) > 0 ? offering : currentLatest,
    offerings[0],
  )

  const latestSummary = aggregateLatestOfferings(offerings, latestTerm)
  const historicalInstructors = buildHistoricalInstructorList(offerings)
  const offeringHistory = buildOfferingHistory(offerings)
  const letterStudentsForRates =
    totals.aRangeStudents + totals.bRangeStudents + totals.cOrBelowStudents
  const sortedQuarterCounts = Object.entries(quarterCounts)
    .filter(([, count]) => count > 0)
    .sort(
      ([leftQuarter, leftCount], [rightQuarter, rightCount]) =>
        rightCount - leftCount || (QUARTER_ORDER[leftQuarter] ?? 0) - (QUARTER_ORDER[rightQuarter] ?? 0),
    )
  const highestQuarterCount = sortedQuarterCounts[0]?.[1] ?? 0
  const usualQuarters = sortedQuarterCounts
    .filter(([, count]) => count === highestQuarterCount || count >= Math.max(2, Math.ceil(totals.totalOfferings / 3)))
    .map(([quarter]) => quarter)
    .sort((left, right) => (QUARTER_ORDER[left] ?? 0) - (QUARTER_ORDER[right] ?? 0))
  const gradeBreakdown = LETTER_GRADE_COLUMNS.map(({ column, label }) => {
    const count = totals.letterGradeCounts[column]
    return {
      count,
      grade: label,
      rate: letterStudentsForRates > 0 ? toRoundedNumber((count / letterStudentsForRates) * 100, 1) : null,
    }
  })

  return {
    aRangeRate:
      letterStudentsForRates > 0
        ? Math.round((totals.aRangeStudents / letterStudentsForRates) * 100)
        : null,
    avgGpa:
      totals.totalLetterStudents > 0
        ? toRoundedNumber(totals.totalGpaPoints / totals.totalLetterStudents)
        : null,
    bRangeRate:
      letterStudentsForRates > 0
        ? Math.round((totals.bRangeStudents / letterStudentsForRates) * 100)
        : null,
    cOrBelowRate:
      letterStudentsForRates > 0
        ? Math.round((totals.cOrBelowStudents / letterStudentsForRates) * 100)
        : null,
    course,
    historicalInstructors,
    latestAvgGpa: latestSummary.latestAvgGpa,
    latestInstructors: latestSummary.instructors,
    latestInstructorCount: latestSummary.instructorCount,
    latestTerm: buildTermLabel(latestTerm.quarter, latestTerm.year),
    offeringCount: totals.totalOfferings,
    offeringHistory,
    gradeBreakdown,
    letterStudentCount: letterStudentsForRates,
    totalStudents: totals.totalStudents,
    usualOffered: usualQuarters,
    usualOfferedLabel: buildQuarterListLabel(usualQuarters),
  }
}

function normalizeOffering(row) {
  const letterGradeCounts = Object.fromEntries(
    LETTER_GRADE_COLUMNS.map(({ column }) => [column, readNumber(row[column])]),
  )
  const aRangeStudents = letterGradeCounts.A + letterGradeCounts.Ap + letterGradeCounts.Am
  const bRangeStudents = letterGradeCounts.B + letterGradeCounts.Bp + letterGradeCounts.Bm
  const cOrBelowStudents =
    letterGradeCounts.C +
    letterGradeCounts.Cp +
    letterGradeCounts.Cm +
    letterGradeCounts.D +
    letterGradeCounts.Dp +
    letterGradeCounts.Dm +
    letterGradeCounts.F

  return {
    aRangeStudents,
    avgGpa: readNumber(row.avgGPA),
    bRangeStudents,
    cOrBelowStudents,
    course: normalizeCourseCode(row.course),
    instructor: row.instructor?.trim() ?? '',
    letterGradeCounts,
    nLetterStudents: readNumber(row.nLetterStudents),
    quarter: row.quarter?.trim() ?? '',
    totalStudents:
      readNumber(row.nLetterStudents) +
      readNumber(row.nPNPStudents) +
      readNumber(row.S) +
      readNumber(row.su),
    year: readNumber(row.year),
  }
}

async function fetchGradesCsv() {
  const response = await fetch(DAILY_NEXUS_GRADES_URL, {
    next: { revalidate: CACHE_REVALIDATE_SECONDS },
  })

  if (!response.ok) {
    throw new Error(`Daily Nexus grades fetch failed with status ${response.status}`)
  }

  return response.text()
}

async function buildGradesIndex() {
  const csv = await fetchGradesCsv()
  const rows = parse(csv, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  })

  const offeringsByCourse = {}

  for (const row of rows) {
    const offering = normalizeOffering(row)
    if (!offering.course) {
      continue
    }

    offeringsByCourse[offering.course] ??= []
    offeringsByCourse[offering.course].push(offering)
  }

  return Object.fromEntries(
    Object.entries(offeringsByCourse).map(([course, offerings]) => [
      course,
      summarizeCourseOfferings(course, offerings),
    ]),
  )
}

const getCachedGradesIndex = unstable_cache(buildGradesIndex, ['daily-nexus-grades-index'], {
  revalidate: CACHE_REVALIDATE_SECONDS,
})

export async function getCourseGradeSummaries(courseCodes) {
  const index = await getCachedGradesIndex()
  const summaries = {}

  for (const courseCode of courseCodes) {
    const normalizedCourseCode = normalizeCourseCode(courseCode)
    if (!normalizedCourseCode) {
      continue
    }

    summaries[normalizedCourseCode] = index[normalizedCourseCode] ?? null
  }

  return summaries
}

export { normalizeCourseCode }
