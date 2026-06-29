export interface User {
  id: string
  email: string
  name: string
  selfie_url?: string
  created_at: string
}

export interface Garment {
  id: string
  user_id: string
  name: string
  category: 'clothing' | 'footwear' | 'jewelry' | 'bag' | 'outerwear'
  subcategory?: string
  color?: string
  pattern?: string
  fabric?: string
  formality?: 'casual' | 'smart-casual' | 'formal'
  seasons?: string[]
  image_url?: string
  purchase_price?: number
  purchase_date?: string
  brand?: string
  wear_count: number
  last_worn?: string
  cost_per_wear?: number
  tags?: string[]
  style_genome?: Record<string, unknown>
  notes?: string
  added_at: string
}

export interface Outfit {
  id: string
  user_id: string
  name?: string
  occasion?: string
  worn_at: string
  weather?: string
  notes?: string
  created_at: string
  garments?: Garment[]
}

export interface PackingTrip {
  id: string
  user_id: string
  destination: string
  depart_date: string
  return_date: string
  weather_desc?: string
  activities?: string[]
  created_at: string
  items?: Garment[]
}

export interface Purchase {
  id: string
  user_id: string
  garment_id?: string
  item_name: string
  brand?: string
  price?: number
  purchased_at?: string
  store?: string
  notes?: string
  created_at: string
}

export interface Decision {
  id: string
  user_id: string
  decision_type: string
  context: Record<string, unknown>
  chosen_id?: string
  alternatives?: string[]
  created_at: string
}

export interface AnalyticsSummary {
  totalItems: number
  totalWears: number
  totalSpend: number
  avgCostPerWear: number
  mostWorn: Garment | null
  leastWorn: Garment[]
  unwornCount: number
  topCategory: string
  recentOutfits: Outfit[]
  wardrobeValue: number
}
