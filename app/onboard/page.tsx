'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const STEPS = [
  { title: 'Welcome to ClosetDNA', desc: 'Your personal fashion intelligence platform.' },
  { title: 'How it works',         desc: 'Add garments. Log outfits. Let AI learn your genome.' },
  { title: 'You\'re ready',        desc: 'Start building your wardrobe intelligence.' },
]

export default function OnboardPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)

  const CONTENT = [
    (
      <div className="space-y-4 text-sm text-[#6b6b6b]">
        <p>ClosetDNA transforms your wardrobe into a living intelligence system stored in Aurora PostgreSQL.</p>
        <p>Every garment, purchase, outfit, event, and trip becomes structured data that answers real questions.</p>
        <ul className="space-y-2 list-none">
          {['Should I buy this?', 'What matches today\'s weather?', 'Which items are costing most per wear?', 'What to pack for this trip?'].map(q => (
            <li key={q} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#50B33A]" />{q}
            </li>
          ))}
        </ul>
      </div>
    ),
    (
      <div className="space-y-4">
        {[
          { icon: '📸', title: 'Add garments', desc: 'Upload photos + metadata. AI generates your Style Genome automatically.' },
          { icon: '✦',  title: 'Get decisions', desc: 'Describe an occasion. The AI returns 3 outfit options in 90 seconds.' },
          { icon: '🧳', title: 'Plan trips',    desc: 'AI selects the optimal capsule wardrobe for any trip.' },
          { icon: '◈',  title: 'See analytics', desc: 'Cost-per-wear, ROI, and decision patterns across your history.' },
        ].map(f => (
          <div key={f.title} className="flex items-start gap-3">
            <span className="text-xl">{f.icon}</span>
            <div>
              <div className="font-medium text-[#191919] text-sm">{f.title}</div>
              <div className="text-xs text-[#9e9a91]">{f.desc}</div>
            </div>
          </div>
        ))}
      </div>
    ),
    (
      <div className="text-center space-y-4">
        <div className="text-5xl">✦</div>
        <p className="text-sm text-[#6b6b6b]">Your Style Genome starts empty and grows smarter with every garment you add and every outfit you log.</p>
        <p className="text-xs text-[#9e9a91]">Start with 5 items to see your first patterns emerge.</p>
      </div>
    ),
  ]

  return (
    <div className="min-h-screen bg-[#f7f4ed] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-serif text-2xl text-[#191919]">ClosetDNA</Link>
        </div>

        <div className="card p-8">
          {/* Progress */}
          <div className="flex gap-1.5 mb-8">
            {STEPS.map((_, i) => (
              <div key={i} className={`flex-1 h-1 rounded-full transition-colors ${
                i <= step ? 'bg-[#191919]' : 'bg-[#e8e4da]'
              }`} />
            ))}
          </div>

          <h2 className="font-serif text-2xl text-[#191919] mb-2">{STEPS[step].title}</h2>
          <p className="text-sm text-[#9e9a91] mb-6">{STEPS[step].desc}</p>

          <div className="mb-8">{CONTENT[step]}</div>

          <div className="flex gap-3">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} className="btn-secondary flex-1">
                Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button onClick={() => setStep(s => s + 1)} className="btn-primary flex-1">
                Next →
              </button>
            ) : (
              <button onClick={() => router.push('/add')} className="btn-primary flex-1">
                Add first item →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
