'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Outfit, Garment } from '@/types'

export default function HistoryPage() {
  const [outfits, setOutfits] = useState<Outfit[]>([])
  const [garments, setGarments] = useState<Garment[]>([])
  const [logging, setLogging] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [occasion, setOccasion] = useState('')
  const [weather, setWeather] = useState('')
  const [wornAt, setWornAt] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/outfits').then(r => r.json()),
      fetch('/api/garments').then(r => r.json()),
    ]).then(([o, g]) => {
      setOutfits(o.outfits ?? [])
      setGarments(g.garments ?? [])
      setLoading(false)
    })
  }, [])

  async function logToday() {
    if (selected.length === 0) return
    const res = await fetch('/api/outfits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ garment_ids: selected, occasion, weather, worn_at: wornAt }),
    })
    if (res.ok) {
      const data = await res.json()
      setOutfits(prev => [{ ...data.outfit, garments: garments.filter(g => selected.includes(g.id)) }, ...prev])
      setSelected([]); setOccasion(''); setWeather(''); setLogging(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f4ed]">
      <nav className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#e8e4da] sticky top-0 z-10">
        <Link href="/dashboard" className="font-serif text-lg text-[#191919]">ClosetDNA</Link>
        <button onClick={() => setLogging(!logging)} className="btn-primary text-xs px-4 py-1.5">
          Log today
        </button>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="font-serif text-3xl text-[#191919] mb-2">Outfit history</h1>
        <p className="text-sm text-[#9e9a91] mb-8">
          Track what you wear. Every log improves your Style Genome.
        </p>

        {/* Log today panel */}
        {logging && (
          <div className="card p-6 mb-8">
            <h3 className="font-serif text-lg text-[#191919] mb-4">What did you wear today?</h3>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-4 max-h-64 overflow-y-auto">
              {garments.map(item => (
                <button key={item.id}
                  onClick={() => setSelected(prev =>
                    prev.includes(item.id) ? prev.filter(x => x !== item.id) : [...prev, item.id]
                  )}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                    selected.includes(item.id) ? 'border-[#191919]' : 'border-transparent hover:border-[#d4cfc4]'
                  }`}
                >
                  {item.image_url
                    ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-[#f7f4ed] flex items-center justify-center text-xl">👗</div>
                  }
                </button>
              ))}
            </div>
            <div className="space-y-3 mb-4">
              <input className="input" placeholder="Occasion (e.g. work, dinner)"
                value={occasion} onChange={e => setOccasion(e.target.value)} />
              <input className="input" placeholder="Weather (optional)"
                value={weather} onChange={e => setWeather(e.target.value)} />
              <input className="input" type="date" value={wornAt}
                onChange={e => setWornAt(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setLogging(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={logToday} disabled={selected.length === 0}
                className="btn-primary flex-1">
                Save outfit
              </button>
            </div>
          </div>
        )}

        {/* Timeline */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="h-4 bg-[#e8e4da] rounded w-40 mb-3" />
                <div className="flex gap-2">
                  {[...Array(3)].map((_, j) => <div key={j} className="w-12 h-12 bg-[#e8e4da] rounded-full" />)}
                </div>
              </div>
            ))}
          </div>
        ) : outfits.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">📅</div>
            <p className="text-[#9e9a91] mb-2">No outfits logged yet.</p>
            <p className="text-xs text-[#c8c3b8]">Click &quot;Log today&quot; to start tracking.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {outfits.map(entry => {
              const items: Garment[] = (entry.garments as Garment[] | null) ?? []
              return (
                <div key={entry.id} className="card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-medium text-[#191919] text-sm">
                        {new Date(entry.worn_at).toLocaleDateString('en-US', {
                          weekday: 'long', month: 'long', day: 'numeric',
                        })}
                      </div>
                      {entry.occasion && (
                        <div className="text-xs text-[#9e9a91] mt-0.5">{entry.occasion}</div>
                      )}
                    </div>
                    <span className="text-xs text-[#9e9a91] bg-[#f7f4ed] px-3 py-1 rounded-full">
                      {items.length} items
                    </span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {items.map(item => (
                      <div key={item.id} className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-[#e8e4da] bg-[#f7f4ed]">
                          {item.image_url
                            ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-sm">👗</div>
                          }
                        </div>
                        <span className="text-xs text-[#6b6b6b]">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
