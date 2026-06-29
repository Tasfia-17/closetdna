'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { Garment } from '@/types'

const EXAMPLES = [
  'Client dinner tonight, confident but not flashy',
  'Casual brunch with friends this weekend',
  'Job interview at a tech startup',
  'First date at a nice restaurant',
  'Work from home but have a video call',
  'Weekend farmers market',
]

interface Decision {
  safe: string
  fresh: string
  remix: string
  reasoning: string
}

const SLOTS = [
  { key: 'safe',  label: 'Safe choice',  desc: 'Proven, high-confidence match', color: 'bg-[#50B33A]/10 text-[#50B33A]' },
  { key: 'fresh', label: 'Fresh pick',   desc: 'Underused, great genome match',  color: 'bg-blue-50 text-blue-600' },
  { key: 'remix', label: 'Remix',        desc: 'Unexpected combo that works',    color: 'bg-purple-50 text-purple-600' },
] as const

export default function OccasionPage() {
  const [query, setQuery] = useState('')
  const [weather, setWeather] = useState('')
  const [loading, setLoading] = useState(false)
  const [decision, setDecision] = useState<Decision | null>(null)
  const [garments, setGarments] = useState<Garment[]>([])
  const [error, setError] = useState('')

  async function solve() {
    if (!query.trim()) return
    setLoading(true)
    setError('')
    const res = await fetch('/api/outfits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'decide', occasion: query, weather }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Failed'); setLoading(false); return }
    setDecision(data.decision)
    setGarments(data.garments)
    setLoading(false)
  }

  function garmentFor(id: string) {
    return garments.find(g => g.id === id)
  }

  return (
    <div className="min-h-screen bg-[#f7f4ed]">
      <nav className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#e8e4da] sticky top-0 z-10">
        <Link href="/dashboard" className="font-serif text-lg text-[#191919]">ClosetDNA</Link>
        <Link href="/dashboard" className="text-sm text-[#6b6b6b] hover:text-[#191919]">← Dashboard</Link>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="font-serif text-3xl text-[#191919] mb-2">Occasion engine</h1>
        <p className="text-sm text-[#9e9a91] mb-8">
          Describe your event. Get exactly 3 outfit decisions from your wardrobe in 90 seconds.
        </p>

        <div className="card p-6 mb-8 space-y-4">
          <div>
            <label className="text-xs text-[#6b6b6b] mb-1.5 block">What&apos;s the occasion?</label>
            <input className="input" placeholder="Client dinner tonight, confident but not flashy"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && solve()} />
          </div>
          <div>
            <label className="text-xs text-[#6b6b6b] mb-1.5 block">Weather (optional)</label>
            <input className="input" placeholder="e.g. cool and rainy, hot summer evening"
              value={weather}
              onChange={e => setWeather(e.target.value)} />
          </div>
          <button onClick={solve} disabled={loading || !query.trim()} className="btn-primary w-full py-2.5">
            {loading ? '✦ Analyzing your wardrobe genome…' : 'Get my 3 options →'}
          </button>
          {error && <p className="text-red-500 text-xs text-center">{error}</p>}
        </div>

        {/* Examples */}
        {!decision && !loading && (
          <div>
            <div className="text-xs text-[#9e9a91] mb-3 uppercase tracking-wide">Try these</div>
            <div className="space-y-2">
              {EXAMPLES.map(ex => (
                <button key={ex} onClick={() => setQuery(ex)}
                  className="w-full text-left px-4 py-3 card hover:border-[#191919] transition-colors text-sm text-[#333]">
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {decision && (
          <div>
            <div className="text-sm text-[#6b6b6b] mb-5">
              Smart 3 for: <em>&quot;{query}&quot;</em>
            </div>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {SLOTS.map(slot => {
                const g = garmentFor(decision[slot.key])
                return (
                  <div key={slot.key} className="card overflow-hidden">
                    <div className="aspect-square bg-[#f7f4ed] overflow-hidden">
                      {g?.image_url ? (
                        <img src={g.image_url} alt={g.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">👗</div>
                      )}
                    </div>
                    <div className="p-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${slot.color}`}>
                        {slot.label}
                      </span>
                      <div className="font-medium text-[#191919] mt-2 text-sm">
                        {g?.name ?? '—'}
                      </div>
                      <div className="text-xs text-[#9e9a91] mt-0.5 capitalize">
                        {g?.color ? `${g.color} · ` : ''}{g?.formality ?? ''}
                      </div>
                      <div className="text-xs text-[#9e9a91] mt-1">{slot.desc}</div>
                    </div>
                  </div>
                )
              })}
            </div>

            {decision.reasoning && (
              <div className="card p-4 mb-4">
                <div className="text-xs text-[#6b6b6b] mb-1 uppercase tracking-wide">AI reasoning</div>
                <p className="text-sm text-[#333]">{decision.reasoning}</p>
              </div>
            )}

            <button
              onClick={() => { setDecision(null); setGarments([]); setQuery(''); setWeather('') }}
              className="btn-secondary mx-auto block"
            >
              Try another occasion
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
