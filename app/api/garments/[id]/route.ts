import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { requireSession } from '@/lib/session'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession()
    const { id } = await params
    await sql`DELETE FROM garments WHERE id = ${id} AND user_id = ${session.userId}`
    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession()
    const { id } = await params
    const body = await req.json()
    const { wear_count, last_worn } = body
    const [garment] = await sql`
      UPDATE garments
      SET wear_count = ${wear_count}, last_worn = ${last_worn}
      WHERE id = ${id} AND user_id = ${session.userId}
      RETURNING *
    `
    return NextResponse.json({ garment })
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
