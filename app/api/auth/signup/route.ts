import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { hashPassword, signToken } from '@/lib/auth'
import { runMigrations } from '@/lib/migrations'

export async function POST(req: NextRequest) {
  try {
    await runMigrations()
    const { name, email, password } = await req.json()
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
    }
    const hashed = await hashPassword(password)
    const [user] = await sql`
      INSERT INTO users (name, email, password)
      VALUES (${name}, ${email}, ${hashed})
      RETURNING id, email, name
    `
    const token = await signToken({ userId: user.id, email: user.email })
    const res = NextResponse.json({ user }, { status: 201 })
    res.cookies.set('cdna_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    return res
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
