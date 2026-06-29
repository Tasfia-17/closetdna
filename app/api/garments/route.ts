import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { requireSession } from '@/lib/session'
import { analyzeGarment } from '@/lib/ai'

// GET /api/garments — list all garments for current user
export async function GET() {
  try {
    const session = await requireSession()
    const garments = await sql`
      SELECT * FROM garments
      WHERE user_id = ${session.userId}
      ORDER BY added_at DESC
    `
    return NextResponse.json({ garments })
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST /api/garments — add a garment
export async function POST(req: NextRequest) {
  try {
    const session = await requireSession()
    const body = await req.json()
    const {
      name, category, subcategory, color, pattern, fabric,
      formality, seasons, image_url, purchase_price, purchase_date,
      brand, tags, notes,
    } = body

    // Generate style genome via AI
    let style_genome = {}
    try {
      const desc = [name, color, fabric, formality, category, subcategory].filter(Boolean).join(', ')
      style_genome = await analyzeGarment(desc)
    } catch {
      // non-fatal — genome generation is best-effort
    }

    const [garment] = await sql`
      INSERT INTO garments
        (user_id, name, category, subcategory, color, pattern, fabric,
         formality, seasons, image_url, purchase_price, purchase_date,
         brand, tags, style_genome, notes)
      VALUES
        (${session.userId}, ${name}, ${category}, ${subcategory ?? null},
         ${color ?? null}, ${pattern ?? null}, ${fabric ?? null},
         ${formality ?? null}, ${seasons ?? []}, ${image_url ?? null},
         ${purchase_price ?? null}, ${purchase_date ?? null},
         ${brand ?? null}, ${tags ?? []}, ${JSON.stringify(style_genome)},
         ${notes ?? null})
      RETURNING *
    `

    // Also log in purchase_history if price given
    if (purchase_price) {
      await sql`
        INSERT INTO purchase_history (user_id, garment_id, item_name, brand, price, purchased_at, store)
        VALUES (${session.userId}, ${garment.id}, ${name}, ${brand ?? null},
                ${purchase_price}, ${purchase_date ?? null}, ${null})
      `
    }

    return NextResponse.json({ garment }, { status: 201 })
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
