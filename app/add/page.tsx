'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const CATEGORIES = ['clothing', 'footwear', 'jewelry', 'bag', 'outerwear'] as const
const FORMALITIES = ['casual', 'smart-casual', 'formal'] as const
const SEASONS = ['spring', 'summer', 'fall', 'winter']

export default function AddGarmentPage() {
  const router = useRouter()
  const [preview, setPreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [genomeLoading, setGenomeLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', category: 'clothing' as typeof CATEGORIES[number],
    subcategory: '', color: '', pattern: 'solid', fabric: '',
    formality: 'casual' as typeof FORMALITIES[number],
    seasons: [] as string[], tags: '',
    purchase_price: '', purchase_date: '', brand: '',
    image_url: '', notes: '',
  })

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setPreview(URL.createObjectURL(f))
    setForm(p => ({ ...p, image_url: '' })) // will use preview URL for demo
  }

  function toggleSeason(s: string) {
    setForm(prev => ({
      ...prev,
      seasons: prev.seasons.includes(s)
        ? prev.seasons.filter(x => x !== s)
        : [...prev.seasons, s],
    }))
  }

  async function save() {
    if (!form.name) return
    setSaving(true)
    setGenomeLoading(true)

    const payload = {
      ...form,
      image_url: form.image_url || preview || null,
      seasons: form.seasons.length ? form.seasons : SEASONS,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      purchase_price: form.purchase_price ? Number(form.purchase_price) : null,
      purchase_date: form.purchase_date || null,
    }

    const res = await fetch('/api/garments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    setGenomeLoading(false)
    if (res.ok) {
      router.push('/wardrobe')
    } else {
      const d = await res.json()
      alert(d.error ?? 'Failed to save')
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f4ed]">
      <nav className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#e8e4da] sticky top-0 z-10">
        <Link href="/dashboard" className="font-serif text-lg text-[#191919]">ClosetDNA</Link>
        <Link href="/wardrobe" className="text-sm text-[#6b6b6b] hover:text-[#191919]">← Wardrobe</Link>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="font-serif text-3xl text-[#191919] mb-2">Add to wardrobe</h1>
        <p className="text-sm text-[#9e9a91] mb-8">
          AI will generate a Style Genome from your description.
        </p>

        <div className="space-y-6">
          {/* Photo */}
          <div>
            <label className="text-xs text-[#6b6b6b] mb-2 block">Photo</label>
            <label className="block cursor-pointer">
              <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
              {preview ? (
                <img src={preview} alt="Preview"
                  className="w-full max-h-64 object-cover rounded-xl border border-[#e8e4da]" />
              ) : (
                <div className="w-full h-40 border-2 border-dashed border-[#d4cfc4] rounded-xl
                  flex flex-col items-center justify-center gap-2 hover:border-[#191919] transition-colors">
                  <div className="text-3xl">👗</div>
                  <div className="text-sm text-[#9e9a91]">Upload photo</div>
                  <div className="text-xs text-[#c8c3b8]">JPG, PNG up to 10MB</div>
                </div>
              )}
            </label>
            <div className="mt-2">
              <input className="input text-xs" placeholder="Or paste an image URL…"
                value={form.image_url}
                onChange={e => { setForm(p => ({ ...p, image_url: e.target.value })); setPreview(e.target.value) }}
              />
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-xs text-[#6b6b6b] mb-1.5 block">Item name *</label>
            <input className="input" placeholder="e.g. Navy Wool Blazer"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          </div>

          {/* Category + Subcategory */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#6b6b6b] mb-1.5 block">Category</label>
              <select className="input" value={form.category}
                onChange={e => setForm(p => ({ ...p, category: e.target.value as typeof CATEGORIES[number] }))}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-[#6b6b6b] mb-1.5 block">Subcategory</label>
              <input className="input" placeholder="e.g. blazer, midi dress"
                value={form.subcategory}
                onChange={e => setForm(p => ({ ...p, subcategory: e.target.value }))} />
            </div>
          </div>

          {/* Color + Fabric */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#6b6b6b] mb-1.5 block">Color</label>
              <input className="input" placeholder="e.g. navy, ivory"
                value={form.color}
                onChange={e => setForm(p => ({ ...p, color: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-[#6b6b6b] mb-1.5 block">Fabric</label>
              <input className="input" placeholder="e.g. wool, silk, cotton"
                value={form.fabric}
                onChange={e => setForm(p => ({ ...p, fabric: e.target.value }))} />
            </div>
          </div>

          {/* Formality + Brand */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#6b6b6b] mb-1.5 block">Formality</label>
              <select className="input" value={form.formality}
                onChange={e => setForm(p => ({ ...p, formality: e.target.value as typeof FORMALITIES[number] }))}>
                {FORMALITIES.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-[#6b6b6b] mb-1.5 block">Brand</label>
              <input className="input" placeholder="e.g. Zara, Uniqlo"
                value={form.brand}
                onChange={e => setForm(p => ({ ...p, brand: e.target.value }))} />
            </div>
          </div>

          {/* Seasons */}
          <div>
            <label className="text-xs text-[#6b6b6b] mb-2 block">Seasons</label>
            <div className="flex gap-2">
              {SEASONS.map(s => (
                <button key={s} type="button" onClick={() => toggleSeason(s)}
                  className={`px-3 py-1.5 rounded-full text-xs border transition-colors capitalize ${
                    form.seasons.includes(s)
                      ? 'bg-[#191919] text-white border-[#191919]'
                      : 'border-[#d4cfc4] text-[#333] hover:border-[#191919]'
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Purchase info */}
          <div className="card p-4 space-y-4">
            <div className="text-xs font-medium text-[#6b6b6b] uppercase tracking-wide">
              Purchase info (for cost-per-wear analytics)
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[#6b6b6b] mb-1.5 block">Price paid</label>
                <input className="input" type="number" placeholder="0.00" min="0" step="0.01"
                  value={form.purchase_price}
                  onChange={e => setForm(p => ({ ...p, purchase_price: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-[#6b6b6b] mb-1.5 block">Purchase date</label>
                <input className="input" type="date"
                  value={form.purchase_date}
                  onChange={e => setForm(p => ({ ...p, purchase_date: e.target.value }))} />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs text-[#6b6b6b] mb-1.5 block">Tags (comma separated)</label>
            <input className="input" placeholder="office, evening, comfortable"
              value={form.tags}
              onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} />
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs text-[#6b6b6b] mb-1.5 block">Notes</label>
            <textarea className="input resize-none" rows={3} placeholder="Care instructions, fit notes…"
              value={form.notes}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
          </div>

          {genomeLoading && (
            <div className="card p-4 text-center text-sm text-[#9e9a91]">
              ✦ Generating Style Genome…
            </div>
          )}

          <button
            onClick={save}
            disabled={saving || !form.name}
            className="btn-primary w-full py-3 text-base"
          >
            {saving ? 'Saving & generating genome…' : 'Add to wardrobe →'}
          </button>
        </div>
      </main>
    </div>
  )
}
