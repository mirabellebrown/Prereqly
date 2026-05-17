import 'server-only'

import { unstable_cache } from 'next/cache'
import { parse } from 'csv-parse/sync'

import { getGradesIndex } from './dailyNexusGrades'
import { DAILY_NEXUS_GE_URL } from './gePlaceholder'

const GES_CSV_URL = 'https://raw.githubusercontent.com/dailynexusdata/grades-data/main/ges.csv'
const CACHE_REVALIDATE_SECONDS = 60 * 60 * 24
const MIN_LETTER_STUDENTS = 30
const TOP_N = 5

/** SILVER area key → column in Daily Nexus ges.csv */
const GE_AREA_COLUMN_MAP = {
  A2: 'Writing',
  B: 'Area B',
  C: 'Area C',
  D: 'Area D',
  E: 'Area E',
  F: 'Area F',
  G: 'Area G',
}

function normalizeCourseCode(courseCode) {
  return courseCode?.trim().replace(/\s+/g, ' ').toUpperCase() ?? ''
}

async function fetchGesCsv() {
  const response = await fetch(GES_CSV_URL, {
    next: { revalidate: CACHE_REVALIDATE_SECONDS },
  })

  if (!response.ok) {
    throw new Error(`Daily Nexus GE catalog fetch failed with status ${response.status}`)
  }

  return response.text()
}

async function buildGeEasyPicksIndex() {
  const [gesCsv, gradesIndex] = await Promise.all([fetchGesCsv(), getGradesIndex()])

  const gesRows = parse(gesCsv, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  })

  const picksByArea = {}

  for (const [areaKey, columnName] of Object.entries(GE_AREA_COLUMN_MAP)) {
    const eligibleCourses = gesRows
      .filter((row) => Number(row[columnName]) === 1)
      .map((row) => normalizeCourseCode(row.Course))
      .filter(Boolean)

    const ranked = eligibleCourses
      .map((courseCode) => {
        const summary = gradesIndex[courseCode]
        if (!summary || (summary.letterStudentCount ?? 0) < MIN_LETTER_STUDENTS) {
          return null
        }

        return {
          courseCode,
          aRangeRate: summary.aRangeRate,
          avgGpa: summary.avgGpa,
          letterStudentCount: summary.letterStudentCount,
          usualOfferedLabel: summary.usualOfferedLabel,
        }
      })
      .filter(Boolean)
      .sort(
        (left, right) =>
          (right.aRangeRate ?? -1) - (left.aRangeRate ?? -1) ||
          (right.avgGpa ?? -1) - (left.avgGpa ?? -1) ||
          (right.letterStudentCount ?? 0) - (left.letterStudentCount ?? 0),
      )
      .slice(0, TOP_N)

    picksByArea[areaKey] = ranked
  }

  return {
    picksByArea,
    sourceUrl: DAILY_NEXUS_GE_URL,
    updatedFrom: 'dailynexusdata/grades-data (ges.csv + courseGrades.csv)',
  }
}

const getCachedGeEasyPicksIndex = unstable_cache(
  buildGeEasyPicksIndex,
  ['daily-nexus-ge-easy-picks'],
  { revalidate: CACHE_REVALIDATE_SECONDS },
)

/**
 * @param {string[]} areaKeys Area keys such as "E", "D", "A2". Empty = all areas.
 */
export async function getGeEasyPicks(areaKeys = []) {
  const index = await getCachedGeEasyPicksIndex()
  const normalizedKeys =
    areaKeys.length > 0
      ? [...new Set(areaKeys.map((key) => key.toUpperCase()))]
      : Object.keys(index.picksByArea)

  const picksByArea = {}

  for (const areaKey of normalizedKeys) {
    picksByArea[areaKey] = index.picksByArea[areaKey] ?? []
  }

  return {
    picksByArea,
    sourceUrl: index.sourceUrl,
  }
}
