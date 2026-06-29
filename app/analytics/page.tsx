'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Garment, Outfit } from '@/types'

interface AnalyticsData {
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
  cpwRanking: Garment[]
  rediscoveries: Garment[]
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics').then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-[#f7f4ed] flex items-center justify-center">
      <div className="text-[#9e9a91] text-sm">Loading intelligence…</div>
    </div>
  )

  const s = data?.summary
  const summaryCards = s ? [
    { label: 'Total items',      value: s.total_items },
    { label: 'Total wears',      value: s.total_wears },
    { label: 'Total spent',      value: `$${Number(s.total_spend).toFixed(0)}` },
    { label: 'Avg cost/wear',    value: s.avg_cpw ? `$${Number(s.avg_cpw).toFixed(2)}` : '—' },
    { label: 'Unworn items',     value: s.unworn_count },
    { label: 'Top category',     value: s.top_category ?? '—' },
  ] : []

  return (
    <div className="min-h-screen bg-[#f7f4ed]">
      <nav className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#e8e4da] sticky top-0 z-10">
        <Link href="/dashboard" className="font-serif text-lg text-[#191919]">ClosetDNA</Link>
        <Link href="/dashboard" className="text-sm text-[#6b6b6b] hover:text-[#191919]">← Dashboard</Link>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="font-serif text-3xl text-[#191919] mb-2">Wardrobe intelligence</h1>
        <p className="text-sm text-[#9e9a91] mb-8">
          Cost-per-wear, ROI analysis, and decision patterns across your entire wardrobe history.
        </p>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          {summaryCards.map(c => (
            <div key={c.label} className="card p-5">
              <div className="font-serif text-2xl text-[#191919] mb-1 capitalize">{c.value}</div>
              <div className="text-xs text-[#9e9a91]">{c.label}</div>
            </div>
          ))}
        </div>

        {/* Best CPW */}
        {data?.cpwRanking && data.cpwRanking.length > 0 && (
          <div className="mb-10">
            <h2 className="font-serif text-xl text-[#191919] mb-4">Best cost-per-wear</h2>
            <p className="text-xs text-[#9e9a91] mb-4">
              These are your highest-ROI purchases — you get the most value per dollar spent.
            </p>
            <div className="space-y-3">
              {data.cpwRanking.map((item, i) => (
                <div key={item.id} className="card p-4 flex items-center gap-4">
                  <div className="font-serif text-2xl text-[#d4cfc4] w-8 text-center">{i + 1}</div>
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#f7f4ed] flex-shrink-0">
                    {item.image_url
                      ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center">👗</div>
                    }
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-[#191919] text-sm">{item.name}</div>
                    <div className="text-xs text-[#9e9a91] capitalize">{item.category} · {item.wear_count} wears</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-[#50B33A]">
                      ${Number(item.cost_per_wear).toFixed(2)}/wear
                    </div>
                    {item.purchase_price && (
                      <div className="text-xs text-[#9e9a91]">${Number(item.purchase_price).toFixed(0)} paid</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Most worn */}
        {data?.mostWorn && (
          <div className="mb-10">
            <h2 className="font-serif text-xl text-[#191919] mb-4">Most worn item</h2>
            <div className="card p-5 flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#f7f4ed]">
                {data.mostWorn.image_url
                  ? <img src={data.mostWorn.image_url} alt={data.mostWorn.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-2xl">👗</div>
                }
              </div>
              <div>
                <div className="font-medium text-[#191919]">{data.mostWorn.name}</div>
                <div className="text-sm text-[#9e9a91] capitalize">{data.mostWorn.category}</div>
                <div className="text-sm text-[#50B33A] mt-1">
                  {data.mostWorn.wear_count} wears
                  {data.mostWorn.cost_per_wear
                    ? ` · $${Number(data.mostWorn.cost_per_wear).toFixed(2)}/wear`
                    : ''}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Never worn */}
        {data?.leastWorn && data.leastWorn.length > 0 && (
          <div className="mb-10">
            <h2 className="font-serif text-xl text-[#191919] mb-2">Never worn</h2>
            <p className="text-xs text-[#9e9a91] mb-4">These items have 0 logged wears. Consider wearing, donating, or reselling.</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {data.leastWorn.map(item => (
                <div key={item.id} className="card overflow-hidden">
                  <div className="aspect-square bg-[#f7f4ed]">
                    {item.image_url
                      ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-2xl">👗</div>
                    }
                  </div>
                  <div className="p-2">
                    <div className="text-xs font-medium text-[#191919] truncate">{item.name}</div>
                    {item.purchase_price && (
                      <div className="text-[10px] text-[#9e9a91]">${Number(item.purchase_price).toFixed(0)} spent</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty */}
        {!loading && (!s || s.total_items === 0) && (
          <div className="card p-12 text-center">
            <div className="text-4xl mb-4">◈</div>
            <h3 className="font-serif text-xl text-[#191919] mb-2">No data yet</h3>
            <p className="text-sm text-[#9e9a91] mb-6">Add garments and log outfits to start building your analytics.</p>
            <Link href="/add" className="btn-primary px-6 py-2">Add first item →</Link>
          </div>
        )}
      </main>
    </div>
  )
}
