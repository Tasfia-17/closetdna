// Edge-runtime safe — only uses jose, no Node.js-only APIs
// Imported by middleware.ts which runs on the Edge Runtime
import { SignJWT, jwtVerify } from 'jose'

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'dev-secret-change-me-in-production'
)

export async function signToken(payload: Record<string, unknown>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export async function verifyToken(token: string): Promise<{ userId: string; email: string }> {
  const { payload } = await jwtVerify(token, secret)
  return payload as { userId: string; email: string }
}
