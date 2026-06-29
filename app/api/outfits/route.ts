import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { requireSession } from '@/lib/session'
import { getOutfitDecision } from '@/lib/ai'

// GET /api/outfits
export async function GET() {
  try {
    const session = await requireSession()
    const outfits = await sql`
      SELECT o.*,
        json_agg(json_build_object(
          'id', g.id, 'name', g.name, 'image_url', g.image_url,
          'category', g.category, 'color', g.color
        )) FILTER (WHERE g.id IS NOT NULL) AS garments
      FROM outfits o
      LEFT JOIN outfit_items oi ON oi.outfit_id = o.id
      LEFT JOIN garments g ON g.id = oi.garment_id
      WHERE o.user_id = ${session.userId}
      GROUP BY o.id
      ORDER BY o.worn_at DESC
      LIMIT 50
    `
    return NextResponse.json({ outfits })
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST /api/outfits — log an outfit or get AI decision
export async function POST(req: NextRequest) {
  try {
    const session = await requireSession()
    const body = await req.json()

    // AI decision mode
    if (body.mode === 'decide') {
      const { occasion, weather } = body
      const garments = await sql`
        SELECT id, name, style_genome, wear_count, last_worn FROM garments
        WHERE user_id = ${session.userId}
        ORDER BY wear_count DESC
        LIMIT 40
      `
      const formatted = garments.map((g: Record<string, unknown>) => ({
        id: g.id as string,
        name: g.name as string,
        genome: (g.style_genome ?? {}) as Record<string, unknown>,
      }))
      const decision = await getOutfitDecision({ occasion, weather, garments: formatted as Parameters<typeof getOutfitDecision>[0]['garments'] })

      // Log the decision
      await sql`
        INSERT INTO decisions (user_id, decision_type, context, chosen_id, alternatives)
        VALUES (
          ${session.userId}, 'outfit',
          ${JSON.stringify({ occasion, weather })},
          ${decision.safe ?? null},
          ${[decision.fresh, decision.remix].filter(Boolean)}
        )
      `

      // Fetch the 3 chosen garments
      const ids = [decision.safe, decision.fresh, decision.remix].filter(Boolean)
      const chosen = await sql`SELECT * FROM garments WHERE id = ANY(${ids}::uuid[])`
      return NextResponse.json({ decision, garments: chosen })
    }

    // Log outfit mode
    const { garment_ids, occasion, worn_at, weather, notes } = body
    const [outfit] = await sql`
      INSERT INTO outfits (user_id, occasion, worn_at, weather, notes)
      VALUES (${session.userId}, ${occasion ?? null}, ${worn_at}, ${weather ?? null}, ${notes ?? null})
      RETURNING *
    `
    if (garment_ids?.length) {
      for (const gid of garment_ids) {
        await sql`INSERT INTO outfit_items (outfit_id, garment_id) VALUES (${outfit.id}, ${gid})`
        await sql`
          UPDATE garments
          SET wear_count = wear_count + 1, last_worn = ${worn_at}
          WHERE id = ${gid} AND user_id = ${session.userId}
        `
      }
    }
    return NextResponse.json({ outfit }, { status: 201 })
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
