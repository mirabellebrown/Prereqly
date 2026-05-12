import 'server-only'

import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { unstable_cache } from 'next/cache'

const SNAPSHOT_PATH = path.join(process.cwd(), 'src/data/rmp/ucsb-professors.json')
const CACHE_REVALIDATE_SECONDS = 60 * 60 * 24

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

async function readSnapshotFile() {
  try {
    const fileContents = await readFile(SNAPSHOT_PATH, 'utf8')
    const snapshot = JSON.parse(fileContents)

    return {
      meta: snapshot.meta ?? null,
      professorsByName: snapshot.professorsByName ?? {},
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {
        meta: null,
        professorsByName: {},
      }
    }

    throw error
  }
}

const getCachedSnapshot = unstable_cache(readSnapshotFile, ['rmp-quarterly-snapshot'], {
  revalidate: CACHE_REVALIDATE_SECONDS,
})

export async function getProfessorReviewsByInstructorNames(instructorNames) {
  const snapshot = await getCachedSnapshot()
  const professorReviewsByName = {}

  for (const instructorName of instructorNames) {
    const normalizedKey = normalizeInstructorNameKey(instructorName)
    if (!normalizedKey) {
      continue
    }

    professorReviewsByName[instructorName] = snapshot.professorsByName[normalizedKey] ?? null
  }

  return {
    professorReviewsByName,
    snapshotMeta: snapshot.meta,
  }
}

export { normalizeInstructorNameKey }
