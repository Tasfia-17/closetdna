# ClosetDNA

**Your wardrobe has patterns. ClosetDNA discovers them.**

A Personal Fashion Intelligence Platform built on Aurora PostgreSQL and Vercel.
Submitted to the [H0 Hackathon: AWS Databases x Vercel](https://awsdbvercel.devpost.com/).

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FTasfia-17%2Fclosetdna&env=POSTGRES_URL,OPENAI_API_KEY,JWT_SECRET,NEXT_PUBLIC_APP_URL&envDescription=Required%20environment%20variables%20for%20ClosetDNA&envLink=https%3A%2F%2Fgithub.com%2FTasfia-17%2Fclosetdna%23environment-variables)

---

## The Problem We Solved

The average person owns between 120 and 166 clothing items. Studies consistently show that 82 percent of those items go unworn for at least 12 months. Every morning, people lose 10 to 15 minutes standing in front of a full wardrobe feeling like they have nothing to wear. In the United States alone, $18 billion worth of clothing sits completely idle in closets each year.

The root cause is not a shortage of clothes. It is a shortage of memory, structure, and decision support.

Existing wardrobe apps address the symptom by helping you catalogue what you own. They answer the question "what do I have?" but stop there. They do not help you decide what to wear today, whether a new purchase is actually needed, which items are costing you the most money per use, or how to pack efficiently for a trip.

We identified six decision points where people consistently fail and built a system that handles each one:

| Decision | What ClosetDNA does |
|---|---|
| Should I buy this? | Scans your wardrobe for duplicates and gaps before you spend |
| What do I wear today? | Matches your Style Genome against occasion, weather, and context |
| Which clothes are costing me money? | Computes cost-per-wear from purchase price and wear history |
| What should I pack for this trip? | AI optimizer picks the fewest garments that generate the most outfit combinations |
| Which items am I wasting? | Surfaces garments unworn for 90 or more days automatically |
| What have I worn to similar events? | Full outfit history with occasion tagging and timeline |

The application is not a wardrobe organizer. It is a decision engine that happens to store clothes.

---

## What We Built

ClosetDNA is a full-stack web application with six interconnected systems working together.

### 1. Style Genome Engine

Every garment added to the wardrobe is analyzed by GPT-4o-mini, which generates a multidimensional profile called a Style Genome. This profile is stored as JSONB in Aurora PostgreSQL alongside the garment record. The genome captures:

- Color DNA: warm, cool, neutral, saturated, muted
- Fabric DNA: weight, breathability, texture, formality signal
- Season DNA: which seasons the garment works across
- Confidence DNA: how often users historically reach for similar items
- Formality DNA: a 0 to 10 score from loungewear to black tie
- Versatility DNA: how many different contexts the garment unlocks
- Sustainability DNA: estimated lifespan based on fabric and care requirements

When the occasion engine runs, it cross-matches the user's full genome profile against occasion context, weather, and event history to produce ranked recommendations.

### 2. Occasion Engine (Smart 3 Algorithm)

The user types a plain English description of their event. The engine queries up to 40 garments from the database, passes the genomes and the occasion description to GPT-4o-mini, and always returns exactly three options:

- Safe: the highest genome match with proven wear history for similar contexts
- Fresh: a garment that has not been worn in 60 or more days but matches the occasion well
- Remix: a different category from Safe, an unexpected combination that the genome analysis supports

Every decision is logged to the `decisions` table with the full context JSON, the chosen garment ID, and the alternatives. This creates an auditable, improvable history of AI recommendations.

### 3. Cost-per-Wear Analytics

When a user adds a garment and provides the purchase price, ClosetDNA stores that in the `purchase_history` table and on the garment record. The `cost_per_wear` column on the `garments` table is a PostgreSQL GENERATED ALWAYS computed column. Every time the wear count increments (when an outfit is logged), the database recomputes the value automatically. No application code manages this calculation.

The analytics page ranks all garments by cost-per-wear, identifies the highest ROI purchases, and flags never-worn items with their purchase price as wasted spend.

### 4. AI Capsule Packing

The user provides a destination, travel dates, expected weather, and a list of activities. The application computes the trip duration in days and passes the user's full wardrobe (up to 60 garments with their genomes) to GPT-4o-mini. The AI selects the minimum number of garments that maximize outfit combinations for the specific trip context, explains its reasoning, and estimates how many distinct outfits the selection supports. The selected garments are stored in the `packing_items` table linked to the trip.

### 5. Rediscovery Engine

A SQL query on the analytics endpoint identifies garments where `last_worn` is either null or older than 90 days and `wear_count` is greater than zero. These surface on the dashboard as rediscoveries. The logic is entirely in SQL, requiring no application-layer filtering.

### 6. Outfit History and Preference Learning

Every outfit the user logs increments `wear_count` and updates `last_worn` on each garment through a transactional sequence of SQL updates. The history page renders a full timeline with occasion tags, weather notes, and the garment images from that day. Over time this data makes the occasion engine more accurate because the genome matching has real wear patterns to work with.

---

## How We Built It

### Tech stack

| Layer | Technology | Why we chose it |
|---|---|---|
| Framework | Next.js 15 (App Router) | Server components, API routes, and middleware in a single deployment unit |
| Language | TypeScript 5 | End-to-end type safety across database types, API responses, and UI components |
| Styling | Tailwind CSS 4 | Utility-first with custom design tokens for the botanical aesthetic |
| Database | Aurora PostgreSQL via Neon | Relational model, computed columns, JSONB, and complex aggregations |
| AI | OpenAI GPT-4o-mini | Fast, cheap, JSON-mode responses for genome generation and outfit decisions |
| Auth | jose (JWT) + bcryptjs | Stateless JWT in httpOnly cookies, no session database required |
| Deploy | Vercel | Zero-config Next.js deployment with edge middleware and serverless functions |

### Why Aurora PostgreSQL and not DynamoDB or a JSON file

The choice of database was deliberate. The application has a relational workload that cannot be handled by a key-value store:

**Computed columns.** The `cost_per_wear` field is defined directly in the schema as a GENERATED ALWAYS column. When `wear_count` updates, PostgreSQL recomputes the value automatically. This would require a trigger or application-level code in any other system.

```sql
cost_per_wear NUMERIC(10,2) GENERATED ALWAYS AS (
  CASE WHEN wear_count > 0 AND purchase_price IS NOT NULL
    THEN ROUND(purchase_price / wear_count, 2)
    ELSE NULL END
) STORED
```

**Multi-table aggregation.** The analytics dashboard requires a single query that counts items, sums spend, averages cost-per-wear, and finds the modal category all at once.

```sql
SELECT
  COUNT(*)                                              AS total_items,
  COALESCE(SUM(wear_count), 0)                          AS total_wears,
  COALESCE(SUM(purchase_price), 0)                      AS total_spend,
  COALESCE(AVG(cost_per_wear) FILTER (WHERE cost_per_wear IS NOT NULL), 0) AS avg_cpw,
  COUNT(*) FILTER (WHERE wear_count = 0)               AS unworn_count,
  MODE() WITHIN GROUP (ORDER BY category)              AS top_category
FROM garments WHERE user_id = $1
```

**JOIN across three tables.** The outfit history page assembles each outfit with its garment images in a single query.

```sql
SELECT o.*,
  json_agg(json_build_object('id', g.id, 'name', g.name, 'image_url', g.image_url))
  FILTER (WHERE g.id IS NOT NULL) AS garments
FROM outfits o
LEFT JOIN outfit_items oi ON oi.outfit_id = o.id
LEFT JOIN garments g ON g.id = oi.garment_id
WHERE o.user_id = $1
GROUP BY o.id
ORDER BY o.worn_at DESC
```

None of this is possible in a flat JSON file. DynamoDB can do some of it with careful access pattern design, but the relational integrity, computed columns, and ad-hoc aggregation make Aurora PostgreSQL the correct tool.

### Design system

The visual language is inherited from the ClosetMind botanical design system: a warm vellum background (`#f7f4ed`), parchment cards (`#ffffff`), charcoal typography (`#191919`), and a single green accent (`#50B33A`) for positive signals like cost-per-wear savings. Headings use Playfair Display (serif) and body text uses DM Sans (sans-serif). Decorative SVG botanicals (daisies, roses, tulips, wildflowers) and a CSS petal rain animation appear on the landing page and auth screens.

Every interactive element uses three shared CSS component classes: `.btn-primary` (charcoal pill button), `.btn-secondary` (outlined pill button), and `.card` (white rounded card with border). This keeps the visual language consistent across all 10 pages.

---

## System Architecture

```
+----------------------------------------------------------+
|                      USER BROWSER                        |
|                                                          |
|  / landing    /auth    /dashboard   /wardrobe            |
|  /add         /occasion /history   /packing  /analytics  |
+---------------------------+------------------------------+
                            |
                        HTTPS requests
                            |
+---------------------------v------------------------------+
|               VERCEL (Serverless + Edge)                 |
|                                                          |
|  middleware.ts                                           |
|  Runs on every request before it hits a page or route.  |
|  Reads the cdna_token httpOnly cookie, verifies JWT.    |
|  Redirects to /auth/signin if token missing or invalid. |
|                                                          |
|  Next.js App Router                                      |
|  +----------------------------------------------------+  |
|  |  Server Components (RSC)                           |  |
|  |  Pages fetch data via internal API calls           |  |
|  |  or directly from the database on the server.     |  |
|  +----------------------------------------------------+  |
|                                                          |
|  API Route Handlers (all server-side, keys never leak)  |
|  POST /api/auth/signup    register, hash pw, set cookie  |
|  POST /api/auth/signin    verify pw, sign JWT, set cookie|
|  POST /api/auth/signout   clear cookie                   |
|  GET  /api/garments       list wardrobe for user         |
|  POST /api/garments       add garment + generate genome  |
|  PATCH /api/garments/:id  update wear count              |
|  DELETE /api/garments/:id remove garment                 |
|  GET  /api/outfits        list outfit history            |
|  POST /api/outfits        log outfit OR get AI decision  |
|  GET  /api/packing        list trips                     |
|  POST /api/packing        create trip + AI capsule       |
|  GET  /api/analytics      aggregated SQL analytics       |
+----------+----------------------------+-----------------+
           |                            |
           v                            v
+--------------------+     +----------------------+
|  AURORA POSTGRESQL |     |  OPENAI GPT-4o-mini  |
|  (Neon serverless) |     |                      |
|                    |     |  analyzeGarment()    |
|  10 tables         |     |  -> Style Genome     |
|  FK constraints    |     |  JSON response       |
|  Computed columns  |     |                      |
|  JSONB genomes     |     |  getOutfitDecision() |
|  Array columns     |     |  -> safe/fresh/remix |
|  SQL aggregates    |     |  + reasoning text    |
|  Auto migrations   |     |                      |
|  on first request  |     |  getPackingSuggestions()|
+--------------------+     |  -> selected IDs     |
                           |  + outfit combo count|
                           +----------------------+
```

### Database schema

```
users
+------------------+
| id UUID PK       |
| email TEXT UNIQUE|
| name TEXT        |
| password TEXT    |  (bcrypt hash, never stored plain)
| selfie_url TEXT  |
| created_at       |
+------------------+
        |
        | 1:many
        v
garments
+------------------------+
| id UUID PK             |
| user_id UUID FK        |
| name TEXT              |
| category TEXT          |  clothing | footwear | jewelry | bag | outerwear
| subcategory TEXT       |
| color TEXT             |
| pattern TEXT           |
| fabric TEXT            |
| formality TEXT         |  casual | smart-casual | formal
| seasons TEXT[]         |
| image_url TEXT         |
| purchase_price NUMERIC |
| purchase_date DATE     |
| brand TEXT             |
| wear_count INT         |  default 0
| last_worn DATE         |
| cost_per_wear NUMERIC  |  GENERATED ALWAYS (purchase_price / wear_count)
| style_genome JSONB     |  AI-generated multidimensional profile
| tags TEXT[]            |
| added_at TIMESTAMPTZ   |
+------------------------+
        |
        +-----------------------------+
        |                             |
        v                             v
outfit_items                    packing_items
+-----------------------+       +-----------------------+
| outfit_id UUID FK     |       | trip_id UUID FK       |
| garment_id UUID FK    |       | garment_id UUID FK    |
| PRIMARY KEY (both)    |       | outfit_slot TEXT      |
+-----------------------+       | PRIMARY KEY (both)    |
        |                       +-----------------------+
        |                               |
        v                               v
outfits                          packing_trips
+-----------------------+       +-----------------------+
| id UUID PK            |       | id UUID PK            |
| user_id UUID FK       |       | user_id UUID FK       |
| occasion TEXT         |       | destination TEXT      |
| worn_at DATE          |       | depart_date DATE      |
| weather TEXT          |       | return_date DATE      |
| notes TEXT            |       | weather_desc TEXT     |
| created_at            |       | activities TEXT[]     |
+-----------------------+       +-----------------------+

purchase_history               decisions
+-----------------------+       +-----------------------+
| id UUID PK            |       | id UUID PK            |
| user_id UUID FK       |       | user_id UUID FK       |
| garment_id UUID FK    |       | decision_type TEXT    |
| item_name TEXT        |       | context JSONB         |
| brand TEXT            |       | chosen_id UUID        |
| price NUMERIC         |       | alternatives UUID[]   |
| purchased_at DATE     |       | created_at            |
| store TEXT            |       +-----------------------+
+-----------------------+

weather_snapshots              events
+-----------------------+       +-----------------------+
| id UUID PK            |       | id UUID PK            |
| user_id UUID FK       |       | user_id UUID FK       |
| location TEXT         |       | name TEXT             |
| temperature NUMERIC   |       | event_type TEXT       |
| condition TEXT        |       | event_date DATE       |
| humidity INT          |       | outfit_id UUID FK     |
| recorded_at           |       | created_at            |
+-----------------------+       +-----------------------+
```

### Request flow for AI outfit decision

```
Browser                API Route              PostgreSQL         OpenAI
   |                       |                       |               |
   | POST /api/outfits     |                       |               |
   | { mode: "decide",     |                       |               |
   |   occasion: "...",    |                       |               |
   |   weather: "..." }    |                       |               |
   |---------------------->|                       |               |
   |                       | verifyToken(cookie)   |               |
   |                       | SELECT garments       |               |
   |                       | WHERE user_id = $1    |               |
   |                       | LIMIT 40             |               |
   |                       |---------------------->|               |
   |                       |<-- garments + genomes-|               |
   |                       |                       |               |
   |                       | chat.completions      |               |
   |                       | model: gpt-4o-mini    |               |
   |                       | response_format: JSON |               |
   |                       |---------------------------------------->|
   |                       |<-- {safe, fresh, remix, reasoning}    |
   |                       |                       |               |
   |                       | INSERT INTO decisions |               |
   |                       | (context, chosen_id)  |               |
   |                       |---------------------->|               |
   |                       |                       |               |
   |                       | SELECT * FROM garments|               |
   |                       | WHERE id = ANY(ids)   |               |
   |                       |---------------------->|               |
   |<-- {decision, garments}                       |               |
```

### Auth flow

```
Sign Up / Sign In
       |
       v
  bcrypt.hash(password, 12)   -- 12 rounds, no plain text ever stored
       |
       v
  new SignJWT(payload)
    .setExpirationTime('7d')
    .sign(HS256_secret)
       |
       v
  Set-Cookie: cdna_token=<jwt>
  httpOnly: true               -- JS cannot read this cookie
  secure: true (production)
  sameSite: lax
       |
  Every subsequent request
       |
       v
  middleware.ts
  verifyToken(cookie)
  if invalid or missing --> redirect /auth/signin
  if valid --> request continues
```

---

## Page Map

```
/                     Landing page
                       Problem statistics
                       Decision questions ClosetDNA answers
                       Style Genome explainer
                       Database schema visualization
                       Call to action

/auth/signup           Create account
                       Email + password
                       bcrypt hash + JWT cookie on success
                       Redirect to /onboard

/auth/signin           Sign in
                       Verify password, refresh JWT cookie
                       Redirect to /dashboard

/onboard               3-step introduction
                       Step 1: what ClosetDNA does
                       Step 2: how each feature works
                       Step 3: get started prompt

/dashboard             Main hub after login
                       4 stat cards (items, wears, unworn, avg cost/wear)
                       6 quick action links
                       Rediscovery section (unworn 90+ days)
                       Recent outfit timeline

/wardrobe              Full wardrobe grid
                       Search by name, color, fabric, tag
                       Filter by category (all / clothing / footwear / jewelry / bag / outerwear)
                       Cost-per-wear badge on each card
                       Delete on hover

/add                   Add a garment
                       Photo upload or image URL
                       Metadata form (category, color, fabric, formality, seasons, brand)
                       Purchase price and date for analytics
                       AI generates Style Genome automatically on save

/occasion              Occasion engine
                       Plain English description input
                       Optional weather context
                       Returns 3 AI-ranked options: Safe, Fresh, Remix
                       Reasoning text from AI
                       Example prompts to get started

/history               Outfit log timeline
                       "Log today" panel with garment picker
                       Occasion and weather notes
                       Full history in reverse chronological order

/packing               AI capsule packing
                       Trip form: destination, dates, weather, activities
                       AI selects garments from wardrobe
                       Shows selected items with outfit combo count
                       Stored in packing_trips + packing_items tables

/analytics             Wardrobe intelligence dashboard
                       Summary cards (total spend, avg cost/wear, unworn count)
                       Cost-per-wear ranking table
                       Most worn item
                       Never-worn items with purchase price
```

---

## Deployment

### One-click Vercel deploy

Click the button below. Vercel will prompt you for each environment variable with a description of what it is and where to get it. You do not need to manually edit any files.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FTasfia-17%2Fclosetdna&env=POSTGRES_URL,OPENAI_API_KEY,JWT_SECRET,NEXT_PUBLIC_APP_URL&envDescription=Required%20environment%20variables%20for%20ClosetDNA&envLink=https%3A%2F%2Fgithub.com%2FTasfia-17%2Fclosetdna%23environment-variables)

### Environment variables

These are the four values you need to provide. All of them have free tiers.

| Variable | What it is | Where to get it |
|---|---|---|
| `POSTGRES_URL` | Aurora-compatible PostgreSQL connection string | Create a free database at [neon.tech](https://neon.tech), go to your project dashboard, copy the connection string |
| `OPENAI_API_KEY` | OpenAI API key for Style Genome + decisions | Sign up at [platform.openai.com](https://platform.openai.com/api-keys), create a key |
| `JWT_SECRET` | Random secret used to sign auth tokens | Any string of 32 or more characters. Example: `openssl rand -hex 32` in your terminal |
| `NEXT_PUBLIC_APP_URL` | The URL your app is deployed to | `https://your-app.vercel.app` (Vercel shows this after first deploy) |

### What happens on first deploy

1. Vercel builds the Next.js app
2. The first user to sign up triggers `runMigrations()` in the signup route handler
3. All 10 tables are created with `CREATE TABLE IF NOT EXISTS`, so this is safe to call multiple times
4. The app is fully operational with no manual database setup required

### Manual deploy via CLI

```bash
npm install -g vercel
vercel --prod
```

Vercel will prompt for environment variables during the first deploy.

---

## Local Development

### Prerequisites

- Node.js 18 or later
- A free Neon database (takes 2 minutes to create at [neon.tech](https://neon.tech))
- An OpenAI API key

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/Tasfia-17/closetdna.git
cd closetdna

# 2. Install dependencies
npm install

# 3. Copy the environment template
cp .env.example .env.local

# 4. Edit .env.local and fill in your values
#    POSTGRES_URL, OPENAI_API_KEY, JWT_SECRET, NEXT_PUBLIC_APP_URL

# 5. Start the development server
npm run dev

# 6. Open the app
open http://localhost:3000
```

Tables are created automatically when you first sign up. No migration command to run.

### Getting a free Neon database (2 minutes)

1. Go to [neon.tech](https://neon.tech) and sign up with GitHub
2. Click **New Project**
3. Name it `closetdna`, choose the region closest to you
4. Click **Create Project**
5. On the dashboard, click **Connection string** and copy the full URL
6. Paste it as `POSTGRES_URL` in `.env.local`

---

## Project Structure

```
closetdna/
|
+-- app/
|   |
|   +-- page.tsx                    Landing page
|   +-- layout.tsx                  Root layout, Google Fonts link
|   +-- globals.css                 Tailwind + design tokens + petal animation keyframes
|   |
|   +-- auth/
|   |   +-- signin/page.tsx         Sign in form with botanical layout
|   |   +-- signup/page.tsx         Sign up form with botanical layout
|   |
|   +-- onboard/page.tsx            3-step onboarding walkthrough
|   +-- dashboard/page.tsx          Main hub: stats, actions, rediscoveries, recent outfits
|   +-- wardrobe/page.tsx           Wardrobe grid with search and category filter
|   +-- add/page.tsx                Add garment form with AI genome generation
|   +-- occasion/page.tsx           AI occasion engine: 3 outfit options
|   +-- history/page.tsx            Outfit log timeline with log-today panel
|   +-- packing/page.tsx            AI capsule packing trip planner
|   +-- analytics/page.tsx          Cost-per-wear and ROI analytics dashboard
|   |
|   +-- api/
|       +-- auth/
|       |   +-- signup/route.ts     POST: register user, hash password, set JWT cookie
|       |   +-- signin/route.ts     POST: verify password, set JWT cookie
|       |   +-- signout/route.ts    POST: clear JWT cookie
|       |
|       +-- garments/
|       |   +-- route.ts            GET: list garments | POST: add + generate genome
|       |   +-- [id]/route.ts       PATCH: update wear count | DELETE: remove
|       |
|       +-- outfits/route.ts        GET: history | POST: log outfit or AI decide
|       +-- packing/route.ts        GET: trips | POST: create trip + AI capsule
|       +-- analytics/route.ts      GET: aggregated SQL analytics
|
+-- components/
|   +-- Flowers.tsx                 SVG flower primitives (Daisy, Rose, Tulip, Wildflower, Bud, Leaf)
|   +-- Botanicals.tsx              Composed botanical layouts and petal rain animation
|
+-- lib/
|   +-- db.ts                       Lazy Neon client with clear error message if POSTGRES_URL missing
|   +-- migrations.ts               CREATE TABLE IF NOT EXISTS for all 10 tables + indexes
|   +-- auth.ts                     hashPassword, comparePassword, signToken, verifyToken
|   +-- session.ts                  getSession, requireSession (reads JWT from cookie)
|   +-- ai.ts                       analyzeGarment, getOutfitDecision, getPackingSuggestions
|
+-- middleware.ts                   JWT auth guard on all protected routes
+-- types/index.ts                  Shared TypeScript interfaces
+-- .env.example                    Template with descriptions for all required variables
+-- vercel.json                     Vercel deployment config
+-- next.config.ts                  Image domain allowlist
+-- package.json                    Pinned dependency versions
```

---

## Design System

The visual language uses a botanical editorial aesthetic inspired by the ClosetMind design system.

**Color tokens defined in globals.css:**

```css
--color-vellum:     #f7f4ed   /* page background, warm off-white */
--color-parchment:  #ffffff   /* card surfaces */
--color-charcoal:   #191919   /* primary text, primary buttons */
--color-inkwell:    #242424   /* body text */
--color-bookgray:   #333333   /* secondary text */
--color-mutedgray:  #6b6b6b   /* captions and labels */
--color-storygreen: #50B33A   /* accent: cost savings, positive badges */
--color-border:     #e8e4da   /* card borders */
--color-borderdark: #d4cfc4   /* focused borders, dividers */
```

**Typography:** Playfair Display (serif) for all headings, DM Sans (sans-serif) for body text. Both loaded from Google Fonts in the root layout.

**Component classes:** `.btn-primary` (charcoal rounded pill), `.btn-secondary` (outlined rounded pill), `.card` (white rounded card with border), `.input` (form input with focus ring).

**Animations:** 12 CSS petals fall continuously across the landing page using three keyframe variants (`petalFall`, `petalFall2`, `petalFall3`) with staggered delays and durations. Each petal is a small SVG ellipse rendered in the `PetalRain` component.

---

## Hackathon Submission

**Competition:** H0 Hackathon: AWS Databases x Vercel

**Track:** Track 1 (Monetizable B2C App)

**AWS Database used:** Aurora PostgreSQL via Neon (Aurora-compatible serverless driver)

**Problem solved:** 82 percent of clothing goes unworn. People make poor fashion decisions because they lack structured data about what they own, what it costs per use, and what matches their current context.

**Why the database is the intelligence layer:** The application would not function correctly without relational integrity. The computed `cost_per_wear` column, multi-table joins for outfit history, JSONB storage for AI-generated genomes, array columns for seasons and tags, and aggregate SQL for analytics all require a production-grade relational database. A JSON file or key-value store would break the core features.

**Revenue paths:**
- Premium subscription for unlimited AI decisions per day
- Affiliate commissions when the purchase advisor links to retailers
- Resale recommendation engine (detect items worth selling)
- Brand partnership analytics (anonymized style genome data)
- Corporate stylist subscription tier

---

## License

MIT

---

*Built for the H0 Hackathon: AWS Databases x Vercel. #H0Hackathon*
