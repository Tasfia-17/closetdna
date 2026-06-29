import { cookies } from 'next/headers'
import { verifyToken } from './auth'

export async function getSession() {
  try {
    const store = await cookies()
    const token = store.get('cdna_token')?.value
    if (!token) return null
    return await verifyToken(token)
  } catch {
    return null
  }
}

export async function requireSession() {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')
  return session
}
