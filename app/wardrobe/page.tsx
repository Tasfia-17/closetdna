'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Garment } from '@/types'

const CATEGORIES = ['all', 'clothing', 'footwear', 'jewelry', 'bag', 'outerwear']

export default function WardrobePage() {
  const [garments, setGarments] = useState<Garment[]>([])
  const [filtered, setFiltered] = useState<Garment[]>([])
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/garments')
      .then(r => r.json())
      .then(d => { setGarments(d.garments ?? []); setLoading(false) })
  }, [])

  useEffect(() => {
    let list = garments
    if (category !== 'all') list = list.filter(g => g.category === category)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(g =>
        g.name.toLowerCase().includes(q) ||
        (g.color ?? '').toLowerCase().includes(q) ||
        (g.fabric ?? '').toLowerCase().includes(q) ||
        (g.tags ?? []).some(t => t.toLowerCase().includes(q))
      )
    }
    setFiltered(list)
  }, [garments, category, search])

  async function deleteItem(id: string) {
    if (!confirm('Remove this item from your wardrobe?')) return
    await fetch(`/api/garments/${id}`, { method: 'DELETE' })
    setGarments(g => g.filter(x => x.id !== id))
  }

  return (
    <div className="min-h-screen bg-[#f7f4ed]">
      <nav className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#e8e4da] sticky top-0 z-10">
        <Link href="/dashboard" className="font-serif text-lg text-[#191919]">ClosetDNA</Link>
        <Link href="/add" className="btn-primary text-xs px-4 py-1.5">+ Add item</Link>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl text-[#191919] mb-1">Wardrobe</h1>
            <p className="text-sm text-[#9e9a91]">{filtered.length} items</p>
          </div>
        </div>

        {/* Search + filter */}
        <div className="flex flex-col md:flex-row gap-3 mb-8">
          <input
            className="input flex-1"
            placeholder="Search by name, color, fabric, tag…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3 py-1.5 rounded-full text-xs border transition-colors capitalize ${
                  category === c
                    ? 'bg-[#191919] text-white border-[#191919]'
                    : 'border-[#d4cfc4] text-[#333] hover:border-[#191919]'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card overflow-hidden animate-pulse">
                <div className="aspect-square bg-[#e8e4da]" />
                <div className="p-3">
                  <div className="h-3 bg-[#e8e4da] rounded mb-2" />
                  <div className="h-2 bg-[#e8e4da] rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-[#9e9a91] mb-4">
              {garments.length === 0 ? 'No items yet.' : 'No items match your search.'}
            </p>
            {garments.length === 0 && (
              <Link href="/add" className="btn-primary px-6 py-2">Add first item</Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {filtered.map(item => (
              <div key={item.id} className="card overflow-hidden group relative">
                <div className="aspect-square overflow-hidden bg-[#f7f4ed]">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">👗</div>
                  )}
                </div>
                <div className="p-3">
                  <div className="font-medium text-[#191919] text-sm truncate">{item.name}</div>
                  <div className="text-[10px] text-[#9e9a91] mt-0.5 capitalize">
                    {item.category}{item.color ? ` · ${item.color}` : ''} · {item.wear_count}×
                  </div>
                  {item.cost_per_wear && (
                    <div className="text-[10px] text-[#50B33A] mt-0.5">
                      ${Number(item.cost_per_wear).toFixed(2)}/wear
                    </div>
                  )}
                </div>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity
                    w-6 h-6 bg-white rounded-full border border-[#e8e4da] text-[#9e9a91]
                    hover:text-red-500 hover:border-red-200 text-xs flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
