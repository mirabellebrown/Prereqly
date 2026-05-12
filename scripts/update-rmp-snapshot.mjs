import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { parse } from 'csv-parse/sync'

import { advisorSuggestedCourses, plannerSuggestions, plannerTemplate } from '../src/mockData.js'

const DAILY_NEXUS_GRADES_URL =
  'https://raw.githubusercontent.com/dailynexusdata/grades-data/main/courseGrades.csv'
const RMP_GRAPHQL_URL = 'https://www.ratemyprofessors.com/graphql'
const UCSB_SCHOOL_NAME = 'University of California Santa Barbara'
const UCSB_CITY = 'Santa Barbara'
const UCSB_STATE = 'CA'
const RECENT_INSTRUCTOR_LOOKBACK_YEARS = 3
const REQUEST_TIMEOUT_MS = 15000
const REQUEST_RETRY_COUNT = 2
const SNAPSHOT_FETCH_CONCURRENCY = 4
const SNAPSHOT_PATH = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'src',
  'data',
  'rmp',
  'ucsb-professors.json',
)

const SCHOOL_SEARCH_QUERY = `
  query NewSearchSchoolsQuery($query: SchoolSearchQuery!) {
    newSearch {
      schools(query: $query) {
        edges {
          node {
            id
            legacyId
            name
            city
            state
          }
        }
      }
    }
  }
`

const TEACHER_SEARCH_QUERY = `
  query NewSearchTeachersQuery($query: TeacherSearchQuery!) {
    newSearch {
      teachers(query: $query) {
        edges {
          node {
            id
            legacyId
            firstName
            lastName
            department
            school {
              id
              name
            }
          }
        }
      }
    }
  }
`

const TEACHER_DETAILS_QUERY = `
  query TeacherSnapshotQuery($id: ID!) {
    node(id: $id) {
      __typename
      ... on Teacher {
        id
        legacyId
        firstName
        lastName
        department
        avgRating
        avgDifficulty
        wouldTakeAgainPercent
        numRatings
        ratings(first: 10) {
          edges {
            node {
              id
              legacyId
              date
              class
              comment
              grade
              helpfulRating
              clarityRating
              difficultyRating
              wouldTakeAgain
              isForOnlineClass
              ratingTags
            }
          }
        }
      }
    }
  }
`

function normalizeCourseCode(courseCode) {
  return courseCode?.trim().replace(/\s+/g, ' ').toUpperCase() ?? ''
}

function normalizeInstructorNameKey(name = '') {
  const cleanedName = name
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!cleanedName) {
    return ''
  }

  const parts = cleanedName.split(' ')
  if (parts.length === 1) {
    return `${parts[0]}|`
  }

  const trailingToken = parts.at(-1)
  if (trailingToken.length <= 2) {
    return `${parts.slice(0, -1).join(' ')}|${trailingToken[0] ?? ''}`
  }

  return `${parts.slice(1).join(' ')}|${parts[0][0] ?? ''}`
}

function readNumber(value) {
  const parsedValue = Number(value)
  return Number.isFinite(parsedValue) ? parsedValue : 0
}

function isCatalogCourseCode(courseCode) {
  return /\d/.test(courseCode) && !/^GE\b/i.test(courseCode) && !/elective/i.test(courseCode)
}

function getCurrentQuarterLabel(date = new Date()) {
  const month = date.getUTCMonth()

  if (month <= 2) {
    return 'Winter'
  }

  if (month <= 5) {
    return 'Spring'
  }

  if (month <= 8) {
    return 'Summer'
  }

  return 'Fall'
}

function parseCliArgs() {
  const args = process.argv.slice(2)
  const cliConfig = {
    quarter: '',
    year: 0,
  }

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index]
    if (argument === '--quarter') {
      cliConfig.quarter = args[index + 1] ?? ''
      index += 1
      continue
    }

    if (argument === '--year') {
      cliConfig.year = Number(args[index + 1] ?? 0)
      index += 1
    }
  }

  return {
    quarter: cliConfig.quarter || getCurrentQuarterLabel(),
    year: cliConfig.year || new Date().getUTCFullYear(),
  }
}

function collectTargetCourseCodes() {
  const plannerCourseCodes = plannerTemplate.flatMap((yearPlan) =>
    Object.values(yearPlan.quarters).flatMap((quarterCourses) =>
      quarterCourses.map((course) => course.code),
    ),
  )

  return [...new Set([...plannerCourseCodes, ...plannerSuggestions.map((course) => course.code), ...advisorSuggestedCourses.map((course) => course.code)])]
    .map(normalizeCourseCode)
    .filter((courseCode) => courseCode && isCatalogCourseCode(courseCode))
    .sort()
}

function normalizeRatingTags(rawTags) {
  if (Array.isArray(rawTags)) {
    return rawTags.filter(Boolean)
  }

  if (typeof rawTags !== 'string') {
    return []
  }

  return rawTags
    .split('--')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function getInstructorSearchQueries(instructorName) {
  const trimmedName = instructorName.trim()
  const parts = trimmedName.split(/\s+/)
  const queries = new Set([trimmedName])

  if (parts.length >= 1) {
    queries.add(parts[0])
  }

  if (parts.length >= 2) {
    queries.add(`${parts[0]} ${parts.at(-1)}`)
    queries.add(parts.at(-1))
  }

  return [...queries].filter(Boolean)
}

function buildProfessorAliases(dailyInstructorName, professor) {
  return [...new Set([
    dailyInstructorName,
    `${professor.firstName} ${professor.lastName}`.trim(),
    `${professor.lastName} ${professor.firstName}`.trim(),
    `${professor.lastName} ${professor.firstName?.[0] ?? ''}`.trim(),
  ])].filter(Boolean)
}

function buildSnapshotProfessor(dailyInstructorName, professor) {
  return {
    aliases: buildProfessorAliases(dailyInstructorName, professor),
    avgDifficulty: professor.avgDifficulty,
    avgRating: professor.avgRating,
    department: professor.department,
    firstName: professor.firstName,
    id: professor.id,
    lastName: professor.lastName,
    legacyId: professor.legacyId,
    numRatings: professor.numRatings,
    profileUrl: professor.legacyId
      ? `https://www.ratemyprofessors.com/professor/${professor.legacyId}`
      : null,
    reviews: professor.ratings.edges.map(({ node }) => ({
      class: node.class,
      clarityRating: node.clarityRating,
      comment: node.comment,
      date: node.date,
      difficultyRating: node.difficultyRating,
      grade: node.grade,
      helpfulRating: node.helpfulRating,
      id: node.id,
      isForOnlineClass: node.isForOnlineClass,
      legacyId: node.legacyId,
      ratingTags: normalizeRatingTags(node.ratingTags),
      wouldTakeAgain: node.wouldTakeAgain,
    })),
    wouldTakeAgainPercent: professor.wouldTakeAgainPercent,
  }
}

async function fetchGraphqlAuthKey() {
  const response = await fetchWithRetry('https://www.ratemyprofessors.com', {
    headers: {
      Accept: 'text/html,application/xhtml+xml',
      'User-Agent': 'Mozilla/5.0 (compatible; PrereqlySnapshotBot/1.0)',
    },
  })

  if (!response.ok) {
    throw new Error(`Unable to load Rate My Professors auth key: ${response.status}`)
  }

  const html = await response.text()
  const match =
    html.match(/REACT_APP_GRAPHQL_AUTH":"([^"]+)"/) ??
    html.match(/REACT_APP_GRAPHQL_AUTH\\":\\"([^"]+)"/)

  if (!match?.[1]) {
    throw new Error('Unable to locate Rate My Professors GraphQL auth key.')
  }

  return match[1]
}

async function fetchWithRetry(url, options) {
  let lastError = null

  for (let attempt = 0; attempt <= REQUEST_RETRY_COUNT; attempt += 1) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      })

      if (response.status === 429 && attempt < REQUEST_RETRY_COUNT) {
        await wait(1500 * (attempt + 1))
        continue
      }

      return response
    } catch (error) {
      lastError = error
      if (attempt === REQUEST_RETRY_COUNT) {
        break
      }

      await wait(500 * (attempt + 1))
    }
  }

  throw lastError
}

async function requestGraphql(query, variables, authKey) {
  const response = await fetchWithRetry(RMP_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Basic ${authKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (compatible; PrereqlySnapshotBot/1.0)',
    },
    body: JSON.stringify({ query, variables }),
  })

  if (!response.ok) {
    throw new Error(`RMP GraphQL request failed with status ${response.status}`)
  }

  const payload = await response.json()
  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join('; '))
  }

  return payload.data
}

async function fetchDailyNexusTargetInstructors(targetCourseCodes) {
  const response = await fetchWithRetry(DAILY_NEXUS_GRADES_URL, {})
  if (!response.ok) {
    throw new Error(`Unable to load Daily Nexus grades CSV: ${response.status}`)
  }

  const csv = await response.text()
  const rows = parse(csv, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  })

  const targetCourses = new Set(targetCourseCodes)
  const relevantRows = []

  for (const row of rows) {
    const courseCode = normalizeCourseCode(row.course)
    const instructorName = row.instructor?.trim() ?? ''
    if (!targetCourses.has(courseCode) || !instructorName) {
      continue
    }

    const letterStudents = readNumber(row.nLetterStudents)
    const totalStudents =
      readNumber(row.nLetterStudents) +
      readNumber(row.nPNPStudents) +
      readNumber(row.S) +
      readNumber(row.su)

    if (letterStudents === 0 && totalStudents === 0) {
      continue
    }

    relevantRows.push({
      instructorName,
      year: readNumber(row.year),
    })
  }

  const latestYear = relevantRows.reduce(
    (currentLatest, row) => Math.max(currentLatest, row.year),
    0,
  )
  const earliestIncludedYear = latestYear - (RECENT_INSTRUCTOR_LOOKBACK_YEARS - 1)
  const instructors = new Set(
    relevantRows
      .filter((row) => row.year >= earliestIncludedYear)
      .map((row) => row.instructorName),
  )

  return [...instructors].sort()
}

async function resolveUcsbSchool(authKey) {
  const data = await requestGraphql(
    SCHOOL_SEARCH_QUERY,
    { query: { text: UCSB_SCHOOL_NAME } },
    authKey,
  )

  const schools = data.newSearch.schools.edges.map((edge) => edge.node)
  const exactMatch = schools.find(
    (school) =>
      school.name === UCSB_SCHOOL_NAME &&
      school.city === UCSB_CITY &&
      school.state === UCSB_STATE,
  )

  if (!exactMatch) {
    throw new Error('Unable to resolve UCSB school entry on Rate My Professors.')
  }

  return exactMatch
}

async function searchTeacherCandidates(instructorName, schoolId, authKey) {
  const candidatesById = new Map()

  for (const searchText of getInstructorSearchQueries(instructorName)) {
    const data = await requestGraphql(
      TEACHER_SEARCH_QUERY,
      {
        query: {
          schoolID: schoolId,
          text: searchText,
        },
      },
      authKey,
    )

    for (const edge of data.newSearch.teachers.edges) {
      candidatesById.set(edge.node.id, edge.node)
    }
  }

  return [...candidatesById.values()]
}

function selectTeacherMatch(instructorName, candidates) {
  const targetKey = normalizeInstructorNameKey(instructorName)
  return candidates.find(
    (candidate) =>
      normalizeInstructorNameKey(`${candidate.firstName} ${candidate.lastName}`) === targetKey,
  )
}

async function fetchTeacherSnapshot(teacherId, authKey) {
  const data = await requestGraphql(TEACHER_DETAILS_QUERY, { id: teacherId }, authKey)

  if (data.node?.__typename !== 'Teacher') {
    return null
  }

  return data.node
}

async function buildSnapshot() {
  const { quarter, year } = parseCliArgs()
  const targetCourseCodes = collectTargetCourseCodes()
  const targetInstructorNames = await fetchDailyNexusTargetInstructors(targetCourseCodes)
  const authKey = await fetchGraphqlAuthKey()
  const school = await resolveUcsbSchool(authKey)

  const professorsByName = {}
  const unmatchedInstructorNames = []

  for (let startIndex = 0; startIndex < targetInstructorNames.length; startIndex += SNAPSHOT_FETCH_CONCURRENCY) {
    const instructorBatch = targetInstructorNames.slice(
      startIndex,
      startIndex + SNAPSHOT_FETCH_CONCURRENCY,
    )

    const batchResults = await Promise.all(
      instructorBatch.map(async (instructorName) => {
        console.log(`Resolving RMP profile for ${instructorName}...`)

        try {
          const candidates = await searchTeacherCandidates(instructorName, school.id, authKey)
          const matchedCandidate = selectTeacherMatch(instructorName, candidates)

          if (!matchedCandidate) {
            return {
              instructorName,
              professor: null,
            }
          }

          const professor = await fetchTeacherSnapshot(matchedCandidate.id, authKey)
          return {
            instructorName,
            professor,
          }
        } catch (error) {
          console.warn(`Failed to resolve ${instructorName}: ${error.message}`)
          return {
            instructorName,
            professor: null,
          }
        }
      }),
    )

    for (const result of batchResults) {
      if (!result.professor) {
        unmatchedInstructorNames.push(result.instructorName)
        continue
      }

      const normalizedKey = normalizeInstructorNameKey(result.instructorName)
      professorsByName[normalizedKey] = buildSnapshotProfessor(
        result.instructorName,
        result.professor,
      )
    }
  }

  return {
    meta: {
      instructorLookbackYears: RECENT_INSTRUCTOR_LOOKBACK_YEARS,
      matchedProfessorCount: Object.keys(professorsByName).length,
      quarter,
      schoolId: school.id,
      schoolLegacyId: school.legacyId,
      schoolName: school.name,
      source: 'Rate My Professors unofficial GraphQL quarterly snapshot',
      targetCourseCodes,
      targetInstructorNames,
      unmatchedInstructorNames,
      updatedAt: new Date().toISOString(),
      year,
    },
    professorsByName,
  }
}

async function main() {
  const snapshot = await buildSnapshot()
  await writeFile(SNAPSHOT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8')

  console.log(
    `Saved ${snapshot.meta.matchedProfessorCount} professor snapshots to ${SNAPSHOT_PATH}.`,
  )
  if (snapshot.meta.unmatchedInstructorNames.length > 0) {
    console.log(
      `Unmatched instructors: ${snapshot.meta.unmatchedInstructorNames.join(', ')}`,
    )
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
