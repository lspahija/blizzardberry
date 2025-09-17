import { NextRequest, NextResponse } from 'next/server'
import { logger } from '../../lib/logger/logger'
import { getLogStats } from '../../lib/store/logStore'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || undefined

    const stats = await getLogStats(userId)

    return NextResponse.json({ stats })
  } catch (error) {
    logger.error({ error }, 'Failed to retrieve log stats')
    return NextResponse.json(
      { error: 'Failed to retrieve log stats' },
      { status: 500 }
    )
  }
}