import { NextResponse } from 'next/server'

import { getCourseGradeSummaries, normalizeCourseCode } from '../../../lib/dailyNexusGrades'

export const revalidate = 86400

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const requestedCourses = searchParams.getAll('course')
  const normalizedRequestedCourses = [...new Set(requestedCourses.map(normalizeCourseCode).filter(Boolean))]

  if (normalizedRequestedCourses.length === 0) {
    return NextResponse.json(
      {
        error: 'Add one or more course query parameters, for example ?course=CMPSC%20130B',
      },
      { status: 400 },
    )
  }

  try {
    const summaries = await getCourseGradeSummaries(normalizedRequestedCourses)

    return NextResponse.json(
      {
        summaries,
      },
      {
        headers: {
          'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
        },
      },
    )
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Unable to load Daily Nexus grades data right now.',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
