# ClosetDNA

> **Your wardrobe has patterns. ClosetDNA discovers them.**

A Personal Fashion Intelligence Platform built on **Aurora PostgreSQL** + **Vercel** for the [H0 Hackathon — AWS Databases × Vercel](https://awsdbvercel.devpost.com/).

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Tasfia-17/closetdna&env=POSTGRES_URL,OPENAI_API_KEY,JWT_SECRET,NEXT_PUBLIC_APP_URL)

---

## The Problem

The average person owns **120–166 clothing items**, yet **82% go unworn** for at least 12 months. Every morning, 15 minutes evaporate to decision paralysis. **$18 billion** worth of clothing sits idle in US closets annually.

Existing apps stop at cataloguing. They answer *"what do I own?"* — not *"what should I do?"*

**ClosetDNA answers the harder questions:**

| Question | ClosetDNA's answer |
|---|---|
| Should I buy this jacket? | Checks your wardrobe for duplicates before you spend |
| What fits today's weather and a client dinner? | AI cross-matches your Style Genome with occasion + weather |
| Which items are my best investment? | Cost-per-wear computed column, ranked across your history |
| What to pack for Tokyo for 5 days? | AI capsule optimizer: 12 garments → 30+ outfit combos |
| Which clothes am I wasting money on? | Never-worn and 90-day-unworn surfaces automatically |

The app isn't about clothes. **It's about decisions.**

---

## What We Built

ClosetDNA is a **Personal Fashion Intelligence Platform** — not a wardrobe organizer, but a decision engine. Every garment becomes a structured asset connected to purchases, outfits, events, travel, and wear history. The database is the intelligence layer, not just storage.

### Core features

**Style Genome** — Every garment receives an AI-generated multidimensional profile via GPT-4o-mini:

```
Color DNA       · Fabric DNA     · Season DNA
Comfort DNA     · Confidence DNA · Formality DNA (0–10)
Versatility DNA · Sustainability DNA
```

**Occasion Engine** — Describe an event in plain English, get exactly 3 AI-ranked outfit options in 90 seconds:
- **Safe** — highest genome match, proven for similar occasions
- **Fresh** — underused garment, excellent context match
- **Remix** — unexpected combination that works

**AI Capsule Packing** — Input destination, dates, weather, and activities. AI selects the minimum garments that maximize outfit combinations. Optimization problem, not a checklist.

**Cost-per-Wear Analytics** — `cost_per_wear` is a PostgreSQL **computed column** (`purchase_price / wear_count`). Ranked ROI across your entire purchase history. Every decision you log makes this more accurate.

**Rediscovery Engine** — SQL query surfaces garments unworn 90+ days. Turns the 82% waste statistic into recoverable value.

**Decision Log** — Every AI recommendation is written to the `decisions` table with full context. Auditable, trainable, improvable.

---

## Architecture

### System overview

```
┌─────────────────────────────────────────────────────────────┐
│                        USER BROWSER                          │
│                                                              │
│  Landing → Sign Up → Onboard → Dashboard                    │
│                ↓          ↓         ↓                        │
│           Wardrobe   Add Item   Occasion                     │
│                               History  Analytics  Packing   │
└─────────────────────┬───────────────────────────────────────┘
                      │  HTTPS (Next.js App Router)
┌─────────────────────▼───────────────────────────────────────┐
│                    VERCEL EDGE / SERVERLESS                  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              NEXT.JS 15 (App Router)                  │   │
│  │                                                        │   │
│  │  Pages (RSC + Client Components)                      │   │
│  │  ├── app/page.tsx          Landing                    │   │
│  │  ├── app/auth/             Sign in / Sign up          │   │
│  │  ├── app/dashboard/        Main hub                   │   │
│  │  ├── app/wardrobe/         Browse + filter            │   │
│  │  ├── app/add/              Add garment + genome       │   │
│  │  ├── app/occasion/         AI outfit decision         │   │
│  │  ├── app/history/          Outfit log timeline        │   │
│  │  ├── app/packing/          AI capsule packing         │   │
│  │  └── app/analytics/        Cost-per-wear + ROI        │   │
│  │                                                        │   │
│  │  API Route Handlers (server-side only)                │   │
│  │  ├── /api/auth/signup      Register + set JWT cookie  │   │
│  │  ├── /api/auth/signin      Login + set JWT cookie     │   │
│  │  ├── /api/auth/signout     Clear cookie               │   │
│  │  ├── /api/garments         CRUD + AI genome on POST   │   │
│  │  ├── /api/garments/[id]    PATCH wear count / DELETE  │   │
│  │  ├── /api/outfits          Log outfit / AI decide     │   │
│  │  ├── /api/packing          AI capsule trip planner    │   │
│  │  └── /api/analytics        Aggregated SQL analytics   │   │
│  │                                                        │   │
│  │  Middleware (middleware.ts)                            │   │
│  │  └── JWT auth guard on all protected routes           │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────┬──────────────────────┬───────────────────────────┘
           │                      │
           ▼                      ▼
┌──────────────────┐   ┌─────────────────────┐
│  AURORA          │   │  OPENAI             │
│  POSTGRESQL      │   │  GPT-4o-mini        │
│  (Neon)          │   │                     │
│                  │   │  · Style Genome     │
│  10 tables       │   │    generation       │
│  Computed cols   │   │  · Occasion AI      │
│  JSONB genome    │   │    decisions        │
│  FK + joins      │   │  · Capsule packing  │
│  SQL aggregates  │   │    optimizer        │
└──────────────────┘   └─────────────────────┘
```

### Database schema (Aurora PostgreSQL)

```
┌──────────────┐        ┌───────────────────────────────────────┐
│    users     │        │               garments                 │
├──────────────┤        ├───────────────────────────────────────┤
│ id (PK)      │◄──┐    │ id (PK)                               │
│ email        │   │    │ user_id (FK → users)                  │
│ name         │   │    │ name, category, subcategory           │
│ password     │   │    │ color, pattern, fabric, formality      │
│ selfie_url   │   │    │ seasons TEXT[]                        │
│ created_at   │   │    │ image_url                             │
└──────────────┘   │    │ purchase_price, purchase_date, brand  │
                   │    │ wear_count, last_worn                 │
                   │    │ cost_per_wear  ← COMPUTED COLUMN      │
                   │    │   (purchase_price / wear_count)       │
                   │    │ style_genome   ← JSONB                │
                   │    │ tags TEXT[]                           │
                   └────┤ added_at                              │
                        └──────────────┬────────────────────────┘
                                       │
              ┌────────────────────────┼────────────────────────┐
              │                        │                         │
              ▼                        ▼                         ▼
┌─────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│       outfits        │  │    packing_trips      │  │  purchase_history    │
├─────────────────────┤  ├──────────────────────┤  ├──────────────────────┤
│ id (PK)             │  │ id (PK)              │  │ id (PK)              │
│ user_id (FK)        │  │ user_id (FK)         │  │ user_id (FK)         │
│ occasion, worn_at   │  │ destination          │  │ garment_id (FK)      │
│ weather, notes      │  │ depart/return_date   │  │ item_name, brand     │
└──────────┬──────────┘  │ weather_desc         │  │ price, purchased_at  │
           │             │ activities TEXT[]    │  └──────────────────────┘
           ▼             └──────────┬───────────┘
┌──────────────────┐               ▼
│  outfit_items    │    ┌──────────────────────┐
├──────────────────┤    │   packing_items      │
│ outfit_id (FK)   │    ├──────────────────────┤
│ garment_id (FK)  │    │ trip_id (FK)         │
│ PRIMARY KEY both │    │ garment_id (FK)      │
└──────────────────┘    │ outfit_slot          │
                        └──────────────────────┘

┌──────────────────────┐   ┌──────────────────────┐
│      decisions       │   │   weather_snapshots  │
├──────────────────────┤   ├──────────────────────┤
│ id (PK)              │   │ id (PK)              │
│ user_id (FK)         │   │ user_id (FK)         │
│ decision_type        │   │ location             │
│ context JSONB        │   │ temperature          │
│ chosen_id            │   │ condition            │
│ alternatives UUID[]  │   │ recorded_at          │
└──────────────────────┘   └──────────────────────┘
```

### Request flow — Occasion Engine

```
Browser                  Vercel API            Aurora PostgreSQL     OpenAI
   │                         │                        │                 │
   │  POST /api/outfits       │                        │                 │
   │  { mode: "decide",       │                        │                 │
   │    occasion: "...",  ───►│                        │                 │
   │    weather: "..." }      │                        │                 │
   │                          │  SELECT id, name,      │                 │
   │                          │  style_genome FROM     │                 │
   │                          │  garments WHERE    ───►│                 │
   │                          │  user_id = $1 LIMIT 40 │                 │
   │                          │◄───────── garments ────┤                 │
   │                          │                        │                 │
   │                          │  chat.completions      │                 │
   │                          │  (occasion + genomes)──┼────────────────►│
   │                          │◄─── {safe,fresh,remix, │                 │
   │                          │      reasoning}        │◄────────────────┤
   │                          │                        │                 │
   │                          │  INSERT INTO decisions │                 │
   │                          │  (context, chosen_id)─►│                 │
   │                          │                        │                 │
   │                          │  SELECT * FROM garments│                 │
   │                          │  WHERE id = ANY(...)──►│                 │
   │◄── { decision, garments }│◄───────────────────────┤                 │
```

### Frontend page map

```
/                    Landing — stats, decisions, genome explainer, schema
├── /auth/signup     Create account (email + password)
├── /auth/signin     Sign in
├── /onboard         3-step intro walkthrough
├── /dashboard       Stats hub + quick actions + rediscoveries + recent outfits
├── /wardrobe        Full grid — search, filter by category, delete
├── /add             Add garment — photo, metadata, purchase info → AI genome
├── /occasion        Occasion engine — plain-English → 3 AI outfit options
├── /history         Outfit timeline — log today, browse past
├── /packing         AI capsule packing — trip form → AI garment selection
└── /analytics       Cost-per-wear ranking, most worn, never worn, ROI
```

### Auth flow

```
Sign up / Sign in
      │
      ▼
 bcrypt hash (12 rounds)
      │
      ▼
 JWT signed (HS256, 7 day expiry)
      │
      ▼
 httpOnly cookie  ←  never exposed to JS
      │
      ▼
 middleware.ts verifies token on every protected route
 → redirect /auth/signin if invalid or missing
```

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 15 (App Router) | RSC + API routes in one deploy |
| Language | TypeScript 5 | End-to-end type safety |
| Styling | Tailwind CSS 4 | Same design system as ClosetMind — vellum/parchment/charcoal tokens |
| Fonts | Playfair Display + DM Sans | Botanical editorial aesthetic |
| Database | Aurora PostgreSQL via Neon | Relational model required for joins, computed columns, JSONB |
| AI | OpenAI GPT-4o-mini | Style Genome + occasion decisions + packing optimization |
| Auth | JWT (jose) + bcryptjs | Stateless, httpOnly cookie, no session store needed |
| Deploy | Vercel | Zero-config Next.js, edge middleware, serverless functions |

---

## Why Aurora PostgreSQL (not DynamoDB, not a JSON file)

The relational model **is** the intelligence:

```sql
-- cost_per_wear is a GENERATED ALWAYS column — impossible in key-value stores
cost_per_wear NUMERIC GENERATED ALWAYS AS (
  CASE WHEN wear_count > 0 AND purchase_price IS NOT NULL
    THEN ROUND(purchase_price / wear_count, 2)
    ELSE NULL END
) STORED

-- analytics dashboard requires multi-table aggregation
SELECT
  COUNT(*)                                         AS total_items,
  SUM(wear_count)                                  AS total_wears,
  SUM(purchase_price)                              AS total_spend,
  AVG(cost_per_wear) FILTER (WHERE cost_per_wear IS NOT NULL) AS avg_cpw,
  COUNT(*) FILTER (WHERE wear_count = 0)           AS unworn_count,
  MODE() WITHIN GROUP (ORDER BY category)          AS top_category
FROM garments WHERE user_id = $1

-- outfit history requires JOINs across 3 tables
SELECT o.*, json_agg(json_build_object('id', g.id, 'name', g.name, ...))
FROM outfits o
JOIN outfit_items oi ON oi.outfit_id = o.id
JOIN garments g ON g.id = oi.garment_id
WHERE o.user_id = $1
GROUP BY o.id ORDER BY o.worn_at DESC
```

A JSON file cannot do any of this. A key-value store would require denormalizing everything and lose the computed relationships. Aurora PostgreSQL is the correct tool for this workload.

---

## Local Setup

### 1. Clone and install

```bash
git clone https://github.com/Tasfia-17/closetdna.git
cd closetdna
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
# Edit .env.local with your values
```

Required variables:

| Variable | Where to get it |
|---|---|
| `POSTGRES_URL` | [neon.tech](https://neon.tech) → New Project → Connection string |
| `OPENAI_API_KEY` | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| `JWT_SECRET` | Any 32+ char random string |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` for local dev |

### 3. Run

```bash
npm run dev
# open http://localhost:3000
```

Tables are created automatically on the first signup request. No manual migration needed.

### 4. First run walkthrough

1. Visit `/` — landing page with architecture overview
2. Click **Get started** → create account
3. Complete the 3-step onboarding at `/onboard`
4. Add your first garment at `/add` — AI generates a Style Genome
5. Describe an occasion at `/occasion` — get 3 AI outfit options
6. Log today's outfit at `/history`
7. View cost-per-wear analytics at `/analytics`
8. Plan a trip at `/packing` — AI builds a capsule wardrobe

---

## Vercel Deployment

### One-click

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Tasfia-17/closetdna&env=POSTGRES_URL,OPENAI_API_KEY,JWT_SECRET,NEXT_PUBLIC_APP_URL)

### Manual

```bash
npm i -g vercel
vercel --prod
```

Set these environment variables in **Vercel Dashboard → Settings → Environment Variables**:

```
POSTGRES_URL          postgres://...neon.tech/closetdna?sslmode=require
OPENAI_API_KEY        sk-...
JWT_SECRET            (32+ random chars)
NEXT_PUBLIC_APP_URL   https://your-app.vercel.app
```

No other configuration needed. `vercel.json` handles the rest.

---

## Project Structure

```
closetdna/
├── app/
│   ├── page.tsx                   # Landing page
│   ├── layout.tsx                 # Root layout + Google Fonts
│   ├── globals.css                # Tailwind + design tokens + petal animations
│   ├── auth/
│   │   ├── signin/page.tsx        # Sign in form
│   │   └── signup/page.tsx        # Sign up form
│   ├── dashboard/page.tsx         # Main hub — stats, actions, rediscoveries
│   ├── wardrobe/page.tsx          # Wardrobe grid — search + filter
│   ├── add/page.tsx               # Add garment + purchase info
│   ├── occasion/page.tsx          # AI occasion engine — 3 outfit options
│   ├── history/page.tsx           # Outfit log timeline
│   ├── packing/page.tsx           # AI capsule packing
│   ├── analytics/page.tsx         # Cost-per-wear + ROI dashboard
│   ├── onboard/page.tsx           # 3-step intro
│   └── api/
│       ├── auth/signup/route.ts   # POST — register, hash password, set JWT cookie
│       ├── auth/signin/route.ts   # POST — verify password, set JWT cookie
│       ├── auth/signout/route.ts  # POST — clear cookie
│       ├── garments/route.ts      # GET list / POST create + AI genome
│       ├── garments/[id]/route.ts # PATCH wear count / DELETE
│       ├── outfits/route.ts       # GET list / POST log outfit or AI decide
│       ├── packing/route.ts       # GET trips / POST create + AI capsule
│       └── analytics/route.ts     # GET aggregated SQL analytics
├── components/
│   ├── Botanicals.tsx             # BotanicalLeft, BotanicalRight, GardenDivider, PetalRain
│   └── Flowers.tsx                # SVG flower components (Daisy, Rose, Tulip, Wildflower…)
├── lib/
│   ├── db.ts                      # Neon serverless SQL client
│   ├── migrations.ts              # CREATE TABLE IF NOT EXISTS — auto-runs on first signup
│   ├── auth.ts                    # hashPassword, comparePassword, signToken, verifyToken
│   ├── session.ts                 # getSession, requireSession (reads JWT from cookie)
│   └── ai.ts                      # analyzeGarment, getOutfitDecision, getPackingSuggestions
├── middleware.ts                   # JWT auth guard — redirects unauthenticated requests
├── types/index.ts                  # Shared TypeScript interfaces
├── .env.example                    # Template for required env vars
├── vercel.json                     # Vercel deployment config
├── next.config.ts                  # Image domains
├── postcss.config.mjs              # Tailwind CSS 4 PostCSS plugin
└── tsconfig.json                   # TypeScript config
```

---

## Design System

Inherited from the ClosetMind botanical design language:

| Token | Value | Usage |
|---|---|---|
| `vellum` | `#f7f4ed` | Page background |
| `parchment` | `#ffffff` | Card surfaces |
| `charcoal` | `#191919` | Primary text + buttons |
| `bookgray` | `#333333` | Secondary text |
| `mutedgray` | `#6b6b6b` | Captions |
| `storygreen` | `#50B33A` | Accent — cost-per-wear, badges |
| `border` | `#e8e4da` | Card borders |
| Serif font | Playfair Display | Headings |
| Sans font | DM Sans | Body text |

CSS classes: `.btn-primary`, `.btn-secondary`, `.card`, `.input` — consistent across all pages.

Botanical SVG components (`Daisy`, `Rose`, `Tulip`, `Wildflower`, `Bud`, `Leaf`) and petal rain animation are used on landing, auth, and key pages to maintain the editorial aesthetic.

---

## Hackathon — H0 Submission Details

**Track:** Track 1 — Monetizable B2C App

**AWS Database used:** Aurora PostgreSQL (via Neon serverless driver — Aurora-compatible)

**Why this solves a real problem:** 82% of owned clothing goes unworn. This is not a taste problem — it's a memory, analytics, and decision problem. ClosetDNA turns a wardrobe into a structured dataset and applies AI to every decision point: buying, wearing, packing, and reselling.

**Why it's shippable:** The architecture is production-grade from day one. JWT auth, parameterized SQL queries, server-side API keys, computed columns, proper indexes, and a migration system that auto-initializes on first deploy. No localStorage. No JSON files. Real relational data.

**Revenue paths:**
- Premium AI (higher decision frequency)
- Affiliate commissions on purchase recommendations
- Personal shopper marketplace
- Brand partnership data insights
- Resale optimization recommendations
- Corporate stylist subscriptions

---

## License

MIT
