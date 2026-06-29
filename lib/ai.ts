import OpenAI from 'openai'

export interface StyleGenome {
  colorDna: string[]
  fabricDna: string[]
  seasonDna: string[]
  comfortDna: number
  confidenceDna: number
  formalityDna: number
  versatilityDna: number
  sustainabilityDna: number
}

// Lazy client — instantiated on first request, not at build time
// This prevents "OPENAI_API_KEY missing" errors during next build
let _openai: OpenAI | null = null

function getOpenAI(): OpenAI {
  if (!_openai) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error(
        'OPENAI_API_KEY is not configured. ' +
        'Add it in Vercel Dashboard > Settings > Environment Variables.'
      )
    }
    _openai = new OpenAI({ apiKey })
  }
  return _openai
}

export async function analyzeGarment(description: string): Promise<StyleGenome> {
  const res = await getOpenAI().chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are a fashion intelligence engine. Given a garment description, produce a StyleGenome JSON with:
colorDna (array of color descriptors), fabricDna (array of fabric qualities),
seasonDna (seasons it works for), comfortDna (0-10), confidenceDna (0-10),
formalityDna (0-10 where 0=ultra-casual 10=black-tie), versatilityDna (0-10),
sustainabilityDna (0-10 based on fabric). Return ONLY valid JSON.`,
      },
      { role: 'user', content: description },
    ],
  })
  try {
    return JSON.parse(res.choices[0].message.content ?? '{}') as StyleGenome
  } catch {
    return { colorDna: [], fabricDna: [], seasonDna: [], comfortDna: 5, confidenceDna: 5, formalityDna: 5, versatilityDna: 5, sustainabilityDna: 5 }
  }
}

export async function getOutfitDecision(params: {
  occasion: string
  weather?: string
  garments: Array<{ id: string; name: string; genome: StyleGenome }>
}): Promise<{ safe: string; fresh: string; remix: string; reasoning: string }> {
  const res = await getOpenAI().chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are a personal fashion stylist AI. Given an occasion, optional weather, and a wardrobe list with style genomes, pick the 3 best garment IDs: safe (proven high confidence), fresh (underused great match), remix (unexpected but works). Return JSON: {safe, fresh, remix, reasoning}.`,
      },
      { role: 'user', content: JSON.stringify(params) },
    ],
  })
  try {
    return JSON.parse(res.choices[0].message.content ?? '{}')
  } catch {
    return { safe: '', fresh: '', remix: '', reasoning: 'Could not parse AI response' }
  }
}

export async function getPackingSuggestions(params: {
  destination: string
  weather: string
  activities: string[]
  durationDays: number
  garments: Array<{ id: string; name: string; category: string; genome: StyleGenome }>
}): Promise<{ selected: string[]; outfitCombos: number; reasoning: string }> {
  const res = await getOpenAI().chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are a capsule wardrobe optimizer. Select the minimum garments that maximize outfit combinations for the trip. Return JSON: {selected (array of garment IDs), outfitCombos (integer), reasoning}.`,
      },
      { role: 'user', content: JSON.stringify(params) },
    ],
  })
  try {
    return JSON.parse(res.choices[0].message.content ?? '{}')
  } catch {
    return { selected: [], outfitCombos: 0, reasoning: 'Could not parse AI response' }
  }
}
