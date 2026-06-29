'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CornerSprig } from '@/components/Botanicals'
import type { Garment, Outfit } from '@/types'

interface Analytics {
  summary: {
    total_items: number
    total_wears: number
    total_spend: string
    avg_cpw: string
    unworn_count: number
    top_category: string
  }
  mostWorn: Garment | null
  leastWorn: Garment[]
  recentOutfits: Outfit[]
  rediscoveries: Garment[]
  cpwRanking: Garment[]
}

export default function DashboardPage() {
  const [data, setData] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const stats = data ? [
    { label: 'Total items',      value: data.summary.total_items },
    { label: 'Total wears',      value: data.summary.total_wears },
    { label: 'Unworn items',     value: data.summary.unworn_count },
    { label: 'Avg cost/wear',    value: data.summary.avg_cpw ? `$${Number(data.summary.avg_cpw).toFixed(2)}` : '—' },
  ] : []

  const quickActions = [
    { href: '/wardrobe',  icon: '👔', label: 'Wardrobe',      desc: 'Browse all items' },
    { href: '/add',       icon: '＋', label: 'Add garment',   desc: 'Upload & tag' },
    { href: '/occasion',  icon: '✦',  label: 'Occasion',      desc: 'Get 3 outfit options' },
    { href: '/history',   icon: '📅', label: 'History',       desc: 'Outfit log' },
    { href: '/packing',   icon: '🧳', label: 'Pack a trip',   desc: 'AI capsule wardrobe' },
    { href: '/analytics', icon: '◈',  label: 'Analytics',     desc: 'Cost-per-wear & insights' },
  ]

  return (
    <div className="min-h-screen bg-[#f7f4ed]">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#e8e4da] sticky top-0 z-10">
        <span className="font-serif text-lg text-[#191919]">ClosetDNA</span>
        <div className="flex items-center gap-3">
          <Link href="/wardrobe" className="text-sm text-[#6b6b6b] hover:text-[#191919]">Wardrobe</Link>
          <Link href="/add" className="btn-primary text-xs px-4 py-1.5">+ Add item</Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl text-[#191919] mb-1">Your wardrobe</h1>
            <p className="text-sm text-[#9e9a91]">
              Everything you own — structured, searchable, intelligent.
            </p>
          </div>
          <CornerSprig />
        </div>

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="h-7 bg-[#e8e4da] rounded mb-2 w-12" />
                <div className="h-3 bg-[#e8e4da] rounded w-20" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map(s => (
              <div key={s.label} className="card p-5">
                <div className="font-serif text-2xl text-[#191919] mb-1">{s.value}</div>
                <div className="text-xs text-[#9e9a91]">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Quick actions */}
        <div className="mb-10">
          <h2 className="font-serif text-xl text-[#191919] mb-4">Quick actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {quickActions.map(a => (
              <Link key={a.href} href={a.href}
                className="card p-4 hover:border-[#191919] transition-colors group">
                <div className="text-lg mb-2">{a.icon}</div>
                <div className="font-medium text-[#191919] text-sm group-hover:text-[#333]">{a.label}</div>
                <div className="text-xs text-[#9e9a91] mt-0.5">{a.desc}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Rediscoveries */}
        {data?.rediscoveries && data.rediscoveries.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl text-[#191919]">Rediscover these</h2>
              <span className="text-xs text-[#9e9a91] bg-[#e8e4da] px-3 py-1 rounded-full">
                Unworn 90+ days
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {data.rediscoveries.map(item => (
                <div key={item.id} className="card overflow-hidden group">
                  <div className="aspect-square overflow-hidden bg-[#f7f4ed]">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">👗</div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="font-medium text-[#191919] text-xs truncate">{item.name}</div>
                    <div className="text-[10px] text-[#9e9a91] mt-0.5">
                      {item.last_worn
                        ? `Last worn ${new Date(item.last_worn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                        : 'Never worn'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent outfits */}
        {data?.recentOutfits && data.recentOutfits.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl text-[#191919]">Recent outfits</h2>
              <Link href="/history" className="text-xs text-[#6b6b6b] underline">See all</Link>
            </div>
            <div className="space-y-3">
              {data.recentOutfits.map(outfit => (
                <div key={outfit.id} className="card p-4 flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {(outfit.garments ?? []).slice(0, 3).map((g: Garment) => (
                      <div key={g.id}
                        className="w-10 h-10 rounded-full border-2 border-white bg-[#f7f4ed] overflow-hidden">
                        {g.image_url
                          ? <img src={g.image_url} alt={g.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-sm">👗</div>
                        }
                      </div>
                    ))}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-[#191919]">
                      {outfit.occasion ?? 'Outfit'}
                    </div>
                    <div className="text-xs text-[#9e9a91]">
                      {new Date(outfit.worn_at).toLocaleDateString('en-US', {
                        weekday: 'short', month: 'short', day: 'numeric'
                      })}
                      {' · '}{(outfit.garments ?? []).length} items
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && data?.summary.total_items === 0 && (
          <div className="card p-12 text-center">
            <div className="text-4xl mb-4">👗</div>
            <h3 className="font-serif text-xl text-[#191919] mb-2">Your wardrobe is empty</h3>
            <p className="text-sm text-[#9e9a91] mb-6">Add your first garment to start building your fashion intelligence profile.</p>
            <Link href="/add" className="btn-primary px-6 py-2">Add first item →</Link>
          </div>
        )}
      </main>
    </div>
  )
}
