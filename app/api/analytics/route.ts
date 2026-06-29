import { NextResponse } from 'next/server'
import sql from '@/lib/db'
import { requireSession } from '@/lib/session'

export async function GET() {
  try {
    const session = await requireSession()
    const uid = session.userId

    const [counts] = await sql`
      SELECT
        COUNT(*)::int                                               AS total_items,
        COALESCE(SUM(wear_count), 0)::int                          AS total_wears,
        COALESCE(SUM(purchase_price), 0)::numeric                  AS total_spend,
        COALESCE(AVG(cost_per_wear) FILTER (WHERE cost_per_wear IS NOT NULL), 0)::numeric AS avg_cpw,
        COUNT(*) FILTER (WHERE wear_count = 0)::int                AS unworn_count,
        MODE() WITHIN GROUP (ORDER BY category)                    AS top_category
      FROM garments WHERE user_id = ${uid}
    `
    const mostWorn = await sql`
      SELECT * FROM garments WHERE user_id = ${uid}
      ORDER BY wear_count DESC LIMIT 1
    `
    const leastWorn = await sql`
      SELECT * FROM garments WHERE user_id = ${uid} AND wear_count = 0
      ORDER BY added_at DESC LIMIT 5
    `
    const recentOutfits = await sql`
      SELECT o.*,
        json_agg(json_build_object('id', g.id, 'name', g.name, 'image_url', g.image_url))
          FILTER (WHERE g.id IS NOT NULL) AS garments
      FROM outfits o
      LEFT JOIN outfit_items oi ON oi.outfit_id = o.id
      LEFT JOIN garments g ON g.id = oi.garment_id
      WHERE o.user_id = ${uid}
      GROUP BY o.id ORDER BY o.worn_at DESC LIMIT 5
    `
    const cpwRanking = await sql`
      SELECT id, name, image_url, purchase_price, wear_count, cost_per_wear, category
      FROM garments
      WHERE user_id = ${uid} AND cost_per_wear IS NOT NULL
      ORDER BY cost_per_wear ASC LIMIT 5
    `
    const rediscoveries = await sql`
      SELECT * FROM garments
      WHERE user_id = ${uid}
        AND (last_worn IS NULL OR last_worn < CURRENT_DATE - INTERVAL '90 days')
        AND wear_count > 0
      ORDER BY last_worn ASC NULLS FIRST LIMIT 8
    `

    return NextResponse.json({
      summary: counts,
      mostWorn: mostWorn[0] ?? null,
      leastWorn,
      recentOutfits,
      cpwRanking,
      rediscoveries,
    })
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
