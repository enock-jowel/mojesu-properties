import { NextResponse } from 'next/server'
import { getProperties } from '@/lib/properties'

export const revalidate = 60

/** Lightweight catalog for client hero filters — keeps the home RSC payload small. */
export async function GET() {
  const properties = await getProperties()
  return NextResponse.json(properties, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  })
}
