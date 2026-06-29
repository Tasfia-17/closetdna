import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { requireSession } from '@/lib/session'
import { getPackingSuggestions } from '@/lib/ai'

export async function GET() {
  try {
    const session = await requireSession()
    const trips = await sql`
      SELECT pt.*,
        json_agg(json_build_object(
          'id', g.id, 'name', g.name, 'image_url', g.image_url, 'category', g.category
        )) FILTER (WHERE g.id IS NOT NULL) AS items
      FROM packing_trips pt
      LEFT JOIN packing_items pi ON pi.trip_id = pt.id
      LEFT JOIN garments g ON g.id = pi.garment_id
      WHERE pt.user_id = ${session.userId}
      GROUP BY pt.id
      ORDER BY pt.depart_date DESC
    `
    return NextResponse.json({ trips })
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession()
    const { destination, depart_date, return_date, weather_desc, activities } = await req.json()

    const [trip] = await sql`
      INSERT INTO packing_trips (user_id, destination, depart_date, return_date, weather_desc, activities)
      VALUES (${session.userId}, ${destination}, ${depart_date}, ${return_date},
              ${weather_desc ?? null}, ${activities ?? []})
      RETURNING *
    `

    // AI capsule packing
    const garments = await sql`
      SELECT id, name, category, style_genome FROM garments
      WHERE user_id = ${session.userId}
      LIMIT 60
    `
    const durationDays = Math.ceil(
      (new Date(return_date).getTime() - new Date(depart_date).getTime()) / 86400000
    )
    const formatted = garments.map((g: Record<string, unknown>) => ({
      id: g.id as string,
      name: g.name as string,
      category: g.category as string,
      genome: (g.style_genome ?? {}) as Parameters<typeof getPackingSuggestions>[0]['garments'][0]['genome'],
    }))
    const suggestion = await getPackingSuggestions({
      destination, weather: weather_desc ?? '', activities: activities ?? [],
      durationDays, garments: formatted,
    })

    // Insert packing items
    for (const gid of suggestion.selected) {
      try {
        await sql`INSERT INTO packing_items (trip_id, garment_id) VALUES (${trip.id}, ${gid})`
      } catch { /* skip invalid id */ }
    }

    return NextResponse.json({ trip, suggestion }, { status: 201 })
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
