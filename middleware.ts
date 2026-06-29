import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

const PUBLIC = ['/', '/auth/signin', '/auth/signup']
const PUBLIC_PREFIXES = ['/api/auth', '/_next', '/favicon']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (
    PUBLIC.includes(pathname) ||
    PUBLIC_PREFIXES.some(p => pathname.startsWith(p))
  ) {
    return NextResponse.next()
  }

  const token = req.cookies.get('cdna_token')?.value
  if (!token) {
    return NextResponse.redirect(new URL('/auth/signin', req.url))
  }

  try {
    await verifyToken(token)
    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL('/auth/signin', req.url))
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
