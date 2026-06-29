'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { PackingTrip } from '@/types'

export default function PackingPage() {
  const [trips, setTrips] = useState<PackingTrip[]>([])
  const [creating, setCreating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    destination: '', depart_date: '', return_date: '',
    weather_desc: '', activities: '',
  })

  useEffect(() => {
    fetch('/api/packing').then(r => r.json())
      .then(d => { setTrips(d.trips ?? []); setLoading(false) })
  }, [])

  async function create() {
    if (!form.destination || !form.depart_date || !form.return_date) return
    setSaving(true)
    const res = await fetch('/api/packing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        activities: form.activities.split(',').map(a => a.trim()).filter(Boolean),
      }),
    })
    const data = await res.json()
    if (res.ok) {
      setTrips(prev => [data.trip, ...prev])
      setCreating(false)
      setSaving(false)
      setForm({ destination: '', depart_date: '', return_date: '', weather_desc: '', activities: '' })
    } else {
      alert(data.error ?? 'Failed'); setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f4ed]">
      <nav className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#e8e4da] sticky top-0 z-10">
        <Link href="/dashboard" className="font-serif text-lg text-[#191919]">ClosetDNA</Link>
        <button onClick={() => setCreating(!creating)} className="btn-primary text-xs px-4 py-1.5">
          + New trip
        </button>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="font-serif text-3xl text-[#191919] mb-2">AI Capsule Packing</h1>
        <p className="text-sm text-[#9e9a91] mb-8">
          Describe your trip. AI selects the minimum garments for maximum outfit combinations.
        </p>

        {/* Create form */}
        {creating && (
          <div className="card p-6 mb-8 space-y-4">
            <h3 className="font-serif text-lg text-[#191919]">Plan a trip</h3>
            <div>
              <label className="text-xs text-[#6b6b6b] mb-1.5 block">Destination *</label>
              <input className="input" placeholder="e.g. Tokyo, Japan"
                value={form.destination} onChange={e => setForm(p => ({ ...p, destination: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[#6b6b6b] mb-1.5 block">Depart *</label>
                <input className="input" type="date"
                  value={form.depart_date} onChange={e => setForm(p => ({ ...p, depart_date: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-[#6b6b6b] mb-1.5 block">Return *</label>
                <input className="input" type="date"
                  value={form.return_date} onChange={e => setForm(p => ({ ...p, return_date: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="text-xs text-[#6b6b6b] mb-1.5 block">Expected weather</label>
              <input className="input" placeholder="e.g. warm and humid, occasional rain"
                value={form.weather_desc} onChange={e => setForm(p => ({ ...p, weather_desc: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-[#6b6b6b] mb-1.5 block">Activities (comma separated)</label>
              <input className="input" placeholder="meetings, dining, hiking, beach"
                value={form.activities} onChange={e => setForm(p => ({ ...p, activities: e.target.value }))} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setCreating(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={create} disabled={saving || !form.destination}
                className="btn-primary flex-1">
                {saving ? '✦ Building capsule…' : 'Generate capsule →'}
              </button>
            </div>
          </div>
        )}

        {/* Trip list */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="h-5 bg-[#e8e4da] rounded w-48 mb-3" />
                <div className="h-3 bg-[#e8e4da] rounded w-32" />
              </div>
            ))}
          </div>
        ) : trips.length === 0 && !creating ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">🧳</div>
            <p className="text-[#9e9a91] mb-4">No trips planned yet.</p>
            <button onClick={() => setCreating(true)} className="btn-primary px-6 py-2">
              Plan first trip →
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {trips.map(trip => {
              const nights = Math.ceil(
                (new Date(trip.return_date).getTime() - new Date(trip.depart_date).getTime()) / 86400000
              )
              return (
                <div key={trip.id} className="card p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-serif text-lg text-[#191919]">{trip.destination}</div>
                      <div className="text-xs text-[#9e9a91] mt-0.5">
                        {new Date(trip.depart_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {' – '}
                        {new Date(trip.return_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {' · '}{nights} nights
                      </div>
                    </div>
                    <span className="text-xs bg-[#f7f4ed] border border-[#e8e4da] px-3 py-1 rounded-full text-[#6b6b6b]">
                      {(trip.items ?? []).length} items packed
                    </span>
                  </div>
                  {trip.weather_desc && (
                    <div className="text-xs text-[#9e9a91] mb-3">☁ {trip.weather_desc}</div>
                  )}
                  {(trip.activities ?? []).length > 0 && (
                    <div className="flex gap-2 flex-wrap mb-3">
                      {(trip.activities ?? []).map(a => (
                        <span key={a} className="text-[10px] bg-[#f7f4ed] border border-[#e8e4da] px-2 py-0.5 rounded-full text-[#6b6b6b] capitalize">
                          {a}
                        </span>
                      ))}
                    </div>
                  )}
                  {(trip.items ?? []).length > 0 && (
                    <div className="flex gap-1.5 flex-wrap">
                      {(trip.items ?? []).map((item: { id: string; name: string; image_url?: string }) => (
                        <div key={item.id} title={item.name}
                          className="w-10 h-10 rounded-lg overflow-hidden border border-[#e8e4da] bg-[#f7f4ed]">
                          {item.image_url
                            ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-sm">👗</div>
                          }
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
