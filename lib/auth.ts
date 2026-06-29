import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'

const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? 'dev-secret-change-me')

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 12)
}

export async function comparePassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash)
}

export async function signToken(payload: Record<string, unknown>) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, secret)
  return payload as { userId: string; email: string }
}
