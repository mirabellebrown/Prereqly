import { NextResponse } from 'next/server'

import { getGeEasyPicks } from '../../../../lib/dailyNexusGes'

export const revalidate = 86400

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const areaParams = searchParams.getAll('area')

  try {
    const payload = await getGeEasyPicks(areaParams)

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Unable to load Daily Nexus GE grade rankings right now.',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
