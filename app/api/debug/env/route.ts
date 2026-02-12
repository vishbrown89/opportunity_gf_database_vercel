import { NextResponse } from 'next/server'

export async function GET() {
  const key = process.env.OPENAI_API_KEY || ''
  return NextResponse.json({
    has_openai_key: key.length > 10,
    version: 'v2'
  })
}
