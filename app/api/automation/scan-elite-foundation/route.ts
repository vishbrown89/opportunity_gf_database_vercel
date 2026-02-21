import { NextResponse } from 'next/server'

import { runAgentScan } from '@/lib/automation/runAgentScan'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const result = await runAgentScan(request, 'elite_foundation_scan')
  return NextResponse.json(result.body, { status: result.status })
}
