import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export interface StyleGenome {
  colorDna: string[]
  fabricDna: string[]
  seasonDna: string[]
  comfortDna: number   // 0-10
  confidenceDna: number
  formalityDna: number
  versatilityDna: number
  sustainabilityDna: number
}

export async function analyzeGarment(description: string): Promise<StyleGenome> {
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are a fashion intelligence engine. Given a garment description, produce a StyleGenome JSON with:
colorDna (array of color descriptors), fabricDna (array of fabric qualities),
seasonDna (seasons it works for), comfortDna (0-10), confidenceDna (0-10),
formalityDna (0-10 where 0=ultra-casual, 10=black-tie), versatilityDna (0-10),
sustainabilityDna (0-10 based on fabric). Return ONLY valid JSON.`,
      },
      { role: 'user', content: description },
    ],
  })
  return JSON.parse(res.choices[0].message.content ?? '{}') as StyleGenome
}

export async function getOutfitDecision(params: {
  occasion: string
  weather?: string
  garments: Array<{ id: string; name: string; genome: StyleGenome }>
}): Promise<{ safe: string; fresh: string; remix: string; reasoning: string }> {
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are a personal fashion stylist AI. Given an occasion, optional weather, and a wardrobe list with style genomes, pick the 3 best garment IDs: safe (proven, high confidence), fresh (underused, great match), remix (unexpected but works). Return JSON: {safe, fresh, remix, reasoning}.`,
      },
      {
        role: 'user',
        content: JSON.stringify(params),
      },
    ],
  })
  return JSON.parse(res.choices[0].message.content ?? '{}')
}

export async function getPackingSuggestions(params: {
  destination: string
  weather: string
  activities: string[]
  durationDays: number
  garments: Array<{ id: string; name: string; category: string; genome: StyleGenome }>
}): Promise<{ selected: string[]; outfitCombos: number; reasoning: string }> {
  const res = await openai.chat.completions.create({
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
  return JSON.parse(res.choices[0].message.content ?? '{}')
}
