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
      return summary
    },
    {
      aRangeStudents: 0,
      bRangeStudents: 0,
      cOrBelowStudents: 0,
      totalGpaPoints: 0,
      totalLetterStudents: 0,
      totalOfferings: 0,
      totalStudents: 0,
    },
  )

  const latestTerm = offerings.reduce(
    (currentLatest, offering) =>
      compareTerms(offering, currentLatest) > 0 ? offering : currentLatest,
    offerings[0],
  )

  const latestSummary = aggregateLatestOfferings(offerings, latestTerm)
  const letterStudentsForRates =
    totals.aRangeStudents + totals.bRangeStudents + totals.cOrBelowStudents

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
    latestAvgGpa: latestSummary.latestAvgGpa,
    latestInstructors: latestSummary.instructors,
    latestInstructorCount: latestSummary.instructorCount,
    latestTerm: buildTermLabel(latestTerm.quarter, latestTerm.year),
    offeringCount: totals.totalOfferings,
    totalStudents: totals.totalStudents,
  }
}

function normalizeOffering(row) {
  const aRangeStudents = readNumber(row.A) + readNumber(row.Ap) + readNumber(row.Am)
  const bRangeStudents = readNumber(row.B) + readNumber(row.Bp) + readNumber(row.Bm)
  const cOrBelowStudents =
    readNumber(row.C) +
    readNumber(row.Cp) +
    readNumber(row.Cm) +
    readNumber(row.D) +
    readNumber(row.Dp) +
    readNumber(row.Dm) +
    readNumber(row.F)

  return {
    aRangeStudents,
    avgGpa: readNumber(row.avgGPA),
    bRangeStudents,
    cOrBelowStudents,
    course: normalizeCourseCode(row.course),
    instructor: row.instructor?.trim() ?? '',
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
