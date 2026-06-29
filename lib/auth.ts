// Node.js runtime only — never import this from middleware.ts
// Use lib/jwt.ts for edge-safe token operations
import bcrypt from 'bcryptjs'

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12)
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}

// Re-export from jwt.ts for convenience so existing API routes
// can still do: import { signToken } from '@/lib/auth'
export { signToken, verifyToken } from './jwt'
