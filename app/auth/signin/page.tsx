'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BotanicalLeft, BotanicalRight } from '@/components/Botanicals'

export default function SignInPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setLoading(false); return }
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#f7f4ed] flex items-center justify-center px-4">
      <div className="relative w-full max-w-md">
        <BotanicalLeft />
        <BotanicalRight />
        <div className="card p-8 relative z-10">
          <div className="text-center mb-8">
            <Link href="/" className="font-serif text-2xl text-[#191919]">ClosetDNA</Link>
            <p className="text-sm text-[#9e9a91] mt-2">Welcome back</p>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-xs text-[#6b6b6b] mb-1.5 block">Email</label>
              <input
                className="input"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="text-xs text-[#6b6b6b] mb-1.5 block">Password</label>
              <input
                className="input"
                type="password"
                placeholder="Your password"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                required
              />
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>
          <p className="text-center text-xs text-[#9e9a91] mt-6">
            No account?{' '}
            <Link href="/auth/signup" className="text-[#191919] underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
