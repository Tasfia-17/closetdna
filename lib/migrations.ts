import sql from './db'

export async function runMigrations() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email       TEXT UNIQUE NOT NULL,
      name        TEXT NOT NULL,
      password    TEXT NOT NULL,
      selfie_url  TEXT,
      created_at  TIMESTAMPTZ DEFAULT now()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS garments (
      id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name         TEXT NOT NULL,
      category     TEXT NOT NULL CHECK (category IN ('clothing','footwear','jewelry','bag','outerwear')),
      subcategory  TEXT,
      color        TEXT,
      pattern      TEXT,
      fabric       TEXT,
      formality    TEXT CHECK (formality IN ('casual','smart-casual','formal')),
      seasons      TEXT[],
      image_url    TEXT,
      purchase_price  NUMERIC(10,2),
      purchase_date   DATE,
      brand        TEXT,
      wear_count   INT DEFAULT 0,
      last_worn    DATE,
      cost_per_wear NUMERIC(10,2) GENERATED ALWAYS AS (
        CASE WHEN wear_count > 0 AND purchase_price IS NOT NULL
          THEN ROUND(purchase_price / wear_count, 2)
          ELSE NULL END
      ) STORED,
      tags         TEXT[],
      style_genome JSONB DEFAULT '{}',
      notes        TEXT,
      added_at     TIMESTAMPTZ DEFAULT now()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS outfits (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name        TEXT,
      occasion    TEXT,
      worn_at     DATE NOT NULL,
      weather     TEXT,
      notes       TEXT,
      created_at  TIMESTAMPTZ DEFAULT now()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS outfit_items (
      outfit_id   UUID NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
      garment_id  UUID NOT NULL REFERENCES garments(id) ON DELETE CASCADE,
      PRIMARY KEY (outfit_id, garment_id)
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS events (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name        TEXT NOT NULL,
      event_type  TEXT,
      event_date  DATE NOT NULL,
      location    TEXT,
      outfit_id   UUID REFERENCES outfits(id),
      created_at  TIMESTAMPTZ DEFAULT now()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS packing_trips (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      destination   TEXT NOT NULL,
      depart_date   DATE NOT NULL,
      return_date   DATE NOT NULL,
      weather_desc  TEXT,
      activities    TEXT[],
      created_at    TIMESTAMPTZ DEFAULT now()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS packing_items (
      trip_id     UUID NOT NULL REFERENCES packing_trips(id) ON DELETE CASCADE,
      garment_id  UUID NOT NULL REFERENCES garments(id) ON DELETE CASCADE,
      outfit_slot TEXT,
      PRIMARY KEY (trip_id, garment_id)
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS purchase_history (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      garment_id    UUID REFERENCES garments(id) ON DELETE SET NULL,
      item_name     TEXT NOT NULL,
      brand         TEXT,
      price         NUMERIC(10,2),
      purchased_at  DATE,
      store         TEXT,
      notes         TEXT,
      created_at    TIMESTAMPTZ DEFAULT now()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS decisions (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      decision_type TEXT NOT NULL,
      context       JSONB DEFAULT '{}',
      chosen_id     UUID,
      alternatives  UUID[],
      created_at    TIMESTAMPTZ DEFAULT now()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS weather_snapshots (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      location    TEXT,
      temperature NUMERIC(5,1),
      condition   TEXT,
      humidity    INT,
      recorded_at TIMESTAMPTZ DEFAULT now()
    )
  `

  // Useful indices
  await sql`CREATE INDEX IF NOT EXISTS idx_garments_user      ON garments(user_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_outfits_user       ON outfits(user_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_outfits_worn_at    ON outfits(worn_at DESC)`
  await sql`CREATE INDEX IF NOT EXISTS idx_decisions_user     ON decisions(user_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_packing_user       ON packing_trips(user_id)`

  console.log('✅ All migrations complete')
}
