import Link from 'next/link'
import { BotanicalLeft, BotanicalRight, GardenDivider, PetalRain } from '@/components/Botanicals'

const STATS = [
  { value: '82%',  label: 'of wardrobe items go unworn for 12+ months' },
  { value: '120+', label: 'items the average person owns' },
  { value: '15 min', label: 'lost every morning to decision paralysis' },
  { value: '$18B', label: 'annual value of unworn clothing in the US' },
]

const DECISIONS = [
  { q: 'Should I buy this?',             a: 'Checks your existing wardrobe for duplicates before you spend.' },
  { q: 'What matches today\'s weather?', a: 'Pulls weather-aware recommendations from your real closet.' },
  { q: 'Which items are costing most?',  a: 'Cost-per-wear analytics across your entire purchase history.' },
  { q: 'What to pack for the trip?',     a: 'AI capsule: 12 garments → 30+ outfit combinations.' },
  { q: 'What fits this client meeting?', a: 'Occasion engine returns exactly 3 options in 90 seconds.' },
  { q: 'Which pieces go unworn?',        a: 'Rediscovery engine flags items not touched in 90+ days.' },
]

const GENOME_AXES = [
  { name: 'Color DNA',         desc: 'Hex + perception (warm, muted, bold)' },
  { name: 'Fabric DNA',        desc: 'Texture, weight, breathability signals' },
  { name: 'Confidence DNA',    desc: 'How often you reach for it' },
  { name: 'Formality DNA',     desc: '0 = loungewear → 10 = black-tie' },
  { name: 'Versatility DNA',   desc: 'How many outfit contexts it unlocks' },
  { name: 'Sustainability DNA', desc: 'Lifespan × care label × cost-per-wear' },
]

const SCHEMA_TABLES = [
  'users', 'garments', 'outfits', 'outfit_items',
  'events', 'packing_trips', 'packing_items',
  'purchase_history', 'decisions', 'weather_snapshots',
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f7f4ed] relative overflow-x-hidden">
      <PetalRain />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-5xl mx-auto">
        <span className="font-serif text-xl text-[#191919] tracking-tight">ClosetDNA</span>
        <div className="flex items-center gap-3">
          <Link href="/auth/signin" className="btn-secondary text-xs px-4 py-1.5">Sign in</Link>
          <Link href="/auth/signup" className="btn-primary text-xs px-4 py-1.5">Get started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-16 pb-20">
        <div className="relative">
          <BotanicalLeft />
          <BotanicalRight />
          <div className="text-center max-w-3xl mx-auto relative">
            <div className="inline-flex items-center gap-2 text-xs text-[#6b6b6b] border border-[#e8e4da] rounded-full px-4 py-1.5 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-[#50B33A] inline-block" />
              Aurora PostgreSQL · Production-ready from day one
            </div>
            <h1 className="font-serif text-5xl md:text-6xl text-[#191919] leading-tight mb-6">
              Your wardrobe has<br />
              <em className="italic text-[#6b6b6b]">patterns.</em>
            </h1>
            <p className="text-lg text-[#6b6b6b] mb-4 max-w-xl mx-auto leading-relaxed">
              ClosetDNA is a Personal Fashion Intelligence Platform. Every garment, purchase,
              outfit, event, and trip becomes structured data — then answers.
            </p>
            <p className="text-sm text-[#9e9a91] mb-10">
              Not an organizer. A decision engine.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link href="/auth/signup" className="btn-primary px-7 py-2.5 text-base">
                Build your genome →
              </Link>
              <Link href="/auth/signin" className="btn-secondary px-7 py-2.5 text-base">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map(s => (
            <div key={s.value} className="card p-5 text-center">
              <div className="font-serif text-3xl text-[#191919] mb-1">{s.value}</div>
              <div className="text-xs text-[#9e9a91] leading-snug">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <GardenDivider />

      {/* Decision engine */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl text-[#191919] mb-3">
            The app isn&apos;t about clothes.
          </h2>
          <p className="text-[#6b6b6b]">It&apos;s about decisions.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {DECISIONS.map(d => (
            <div key={d.q} className="card p-5 hover:border-[#d4cfc4] transition-colors">
              <div className="font-medium text-[#191919] mb-1.5 text-sm">{d.q}</div>
              <div className="text-xs text-[#9e9a91] leading-relaxed">{d.a}</div>
            </div>
          ))}
        </div>
      </section>

      <GardenDivider />

      {/* Style Genome */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl text-[#191919] mb-3">Style Genome</h2>
          <p className="text-[#6b6b6b] max-w-lg mx-auto">
            Every garment gets a multidimensional profile. Your genome cross-matches with
            occasion, weather, and event context for a recommendation that actually fits your life.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-4 mb-10">
          {GENOME_AXES.map(g => (
            <div key={g.name} className="card p-5">
              <div className="font-medium text-[#191919] text-sm mb-1">{g.name}</div>
              <div className="text-xs text-[#9e9a91]">{g.desc}</div>
            </div>
          ))}
        </div>
        <div className="card p-6 text-center text-sm text-[#6b6b6b]">
          <span className="font-medium text-[#191919]">Garment Genome</span>
          {' × '}
          <span className="font-medium text-[#191919]">User Genome</span>
          {' × '}
          <span className="font-medium text-[#191919]">Occasion Genome</span>
          {' × '}
          <span className="font-medium text-[#191919]">Weather Genome</span>
          <span className="mx-3 text-[#d4cfc4]">→</span>
          <span className="font-serif text-[#191919] text-base">Best outfit</span>
        </div>
      </section>

      <GardenDivider />

      {/* Aurora schema */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-10">
          <h2 className="font-serif text-3xl text-[#191919] mb-3">Built on Aurora PostgreSQL</h2>
          <p className="text-[#6b6b6b] max-w-lg mx-auto text-sm">
            10 relational tables. Not a JSON file. Because every decision connects to every
            purchase connects to every wear connects to every event.
          </p>
        </div>
        <div className="card p-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {SCHEMA_TABLES.map(t => (
              <div key={t}
                className="bg-[#f7f4ed] border border-[#e8e4da] rounded-lg px-3 py-2 text-xs font-mono text-[#6b6b6b] text-center">
                {t}
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-[#e8e4da] text-xs text-[#9e9a91] text-center">
            Foreign keys · Joins · Computed columns (cost_per_wear) · JSONB style_genome
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="font-serif text-3xl text-[#191919] mb-4">
          Ready to discover your patterns?
        </h2>
        <p className="text-[#6b6b6b] mb-8">Add 5 items. Get your first decision in under 2 minutes.</p>
        <Link href="/auth/signup" className="btn-primary px-8 py-3 text-base">
          Start for free →
        </Link>
      </section>

      <footer className="relative z-10 text-center text-xs text-[#9e9a91] py-8 border-t border-[#e8e4da]">
        ClosetDNA 2026 · Built on Aurora PostgreSQL + Vercel · H0 Hackathon
      </footer>
    </div>
  )
}
