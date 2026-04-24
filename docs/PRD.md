# Product Requirements Document: Nored Farms Sales Quest

## 1. Overview

**Product Name**: Nored Farms Sales Quest
**Type**: Gamified sales & wholesale management app
**Engine**: Phaser 4.0.0 "Caladan" (HTML5 game framework, released April 2026)
**Backend**: Supabase (existing instance `uqyfsqenjakqyzixfcta`)
**Theme**: Botanical farm world — plants, extracts, and healing knowledge as game elements

### Problem Statement

Sales reps and wholesale partners currently use separate, utilitarian dashboards (Next.js reps portal, vanilla JS wholesale portal) to manage contacts, orders, KPIs, and follow-ups. Engagement is low — reps check in when required, wholesalers place orders reactively. There's no motivation loop, no competitive element, and no connection between product knowledge and sales performance.

### Solution

A single Phaser-based game app where sales reps and wholesalers log in and interact with a living farm world. All real business functions (order placement, contact logging, KPI tracking, goal management, inventory requests) are embedded inside game mechanics — harvest cycles for quotas, potion-crafting for orders, territory maps for regions, knowledge scrolls for product articles, and leaderboards for competition.

### Success Metrics

- Rep weekly check-in rate: 50% -> 90%
- Average contacts per week per rep: +30%
- Wholesale reorder frequency: +20%
- Time-to-first-order for new wholesale accounts: -40%
- Product knowledge quiz completion: >70% of reps within 30 days

---

## 2. Users & Roles

### Sales Rep (`role: rep`)
- Assigned to a **region** (territory on the game map)
- Tracks contacts, leads, follow-ups, orders
- Has KPI scores (composite score from 7 weighted metrics)
- Earns XP, levels, and unlockables
- Competes on leaderboard

### Wholesale Partner (`role: wholesale`)
- Has a **discount tier** (standard 30%, preferred 40%, premium 50%, custom)
- Places orders from product catalog
- Views invoices, order status, account info
- Earns loyalty badges and tier progression

### Admin (`role: admin`)
- Views all rep activity, KPI leaderboard
- Manages settings, territories, quotas
- Sends announcements/quests to reps
- No game view needed (uses existing admin dashboard)

---

## 3. Core Game Concepts

### 3.1 The Farm World (Hub Screen)

A top-down or isometric Phaser scene representing Nored Farms. Interactive areas include:

| Zone | Function | Real Action |
|------|----------|-------------|
| **The Greenhouse** | Contact logging station | Log calls, emails, visits |
| **The Apothecary** | Order crafting table | Create/submit orders |
| **The Map Room** | Territory overview | View region, leads, accounts |
| **The Library** | Knowledge scrolls | Read articles, take quizzes |
| **The Harvest Field** | Quota progress | Weekly/monthly goal tracker |
| **The Trading Post** | Wholesale catalog | Browse products, place wholesale orders |
| **The Notice Board** | Announcements & quests | View tasks, announcements, challenges |
| **The Hall of Champions** | Leaderboard | KPI rankings, badges, streaks |

### 3.2 XP & Leveling System

| Action | XP Earned |
|--------|-----------|
| Log a contact | +10 XP |
| Complete a follow-up on time | +15 XP |
| Convert a lead | +50 XP |
| Submit an order | +25 XP |
| Complete a knowledge quiz | +20 XP |
| Hit weekly contact quota | +100 XP (bonus) |
| Hit monthly revenue target | +500 XP (bonus) |
| Streak: 5 consecutive check-in days | +75 XP |

**Levels**: Every 500 XP = 1 level. Levels unlock cosmetic farm upgrades (new plant sprites, greenhouse skins, title badges).

### 3.3 Quest System

Quests are time-bound objectives pushed by admin or auto-generated:

- **Daily**: "Log 10 contacts today" / "Complete 2 follow-ups"
- **Weekly**: "Hit your contact quota" / "Place at least 1 order"
- **Monthly**: "Convert 3 new leads" / "Achieve KPI score of 75+"
- **Special**: Admin-created challenges ("Launch week blitz: most orders wins a bonus")

### 3.4 Knowledge Scrolls

The 190+ articles from `/articles/` become in-game "scrolls" organized by plant/compound. Reps can:

- Read scrolls to learn product knowledge
- Take short quizzes (3-5 questions per article) for XP
- Earn "Scholar" badges for completing categories
- Use knowledge to assist wholesale partners with product recommendations

### 3.5 Territory Map (Reps Only)

An interactive map showing the rep's assigned region with:

- Pin markers for accounts (color-coded by status: active, pending, cold)
- Lead clusters to claim
- Heat zones showing sales density
- Region stats overlay (total revenue, active accounts, conversion rate)

### 3.6 Wholesale Partner View

Wholesalers get a simplified game view focused on:

- **Trading Post**: Product catalog with tier pricing, add-to-cart, place order
- **Order Tracker**: Visual pipeline showing order status (pending -> confirmed -> processing -> shipped -> delivered)
- **Loyalty Garden**: Visual progression toward next discount tier
- **Knowledge Corner**: Curated articles relevant to their product purchases
- **Reorder Reminders**: Animated notifications when typical reorder window approaches

---

## 4. Technical Architecture

### 4.1 Stack

```
Frontend:   Phaser 4.0.0 + Vite (bundler)
UI Overlay: HTML/CSS overlay for forms, modals, data tables (Phaser handles game world only)
Backend:    Supabase (existing instance)
Auth:       Supabase Auth (existing — shared with reps/wholesale portals)
Database:   PostgreSQL via Supabase
  - Schema `reps`: rep_profiles, contacts, leads, orders, follow_ups, kpi_snapshots, settings
  - Schema `public`: wholesale_accounts, wholesale_orders, wholesale_invoices, wholesale_pricing
  - Schema `game` (NEW): player_profiles, xp_log, quests, quest_progress, achievements, quiz_results
Hosting:    Netlify (same as main site)
```

### 4.1.1 Why Phaser 4

Phaser 4.0.0 "Caladan" (released April 10, 2026) is a ground-up rebuild:

- **Render Node Architecture**: Replaces v3 pipeline system with clean node-based renderer. WebGL state is fully managed with built-in context restoration — critical for tab-switching sales reps.
- **SpriteGPULayer**: Render 1M+ sprites in a single draw call (up to 100x faster). Future-proofs the farm world for rich visual scenes.
- **Unified Filter System**: v3's separate FX and Masks merged into one Filter system. Apply blur, glow, bloom, shadow to any game object or camera — used for zone highlights, level-up effects, notification glow.
- **Improved Tilemaps**: Render as single quads with per-pixel shader cost instead of per-tile — better performance for the farm hub tilemap.
- **API Compatibility**: Keeps the familiar Phaser API, so community resources and patterns still apply.

**Setup**: `npm create @phaserjs/game@latest` with Vite bundler option, or manual `npm install phaser@v4.0.0`.

### 4.2 New Database Schema (`game` schema)

```sql
-- Player profile linking to auth user
CREATE TABLE game.player_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('rep', 'wholesale', 'admin')),
  display_name TEXT NOT NULL,
  avatar_key TEXT DEFAULT 'default',
  level INTEGER DEFAULT 1,
  total_xp INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_active DATE,
  farm_state JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- XP transaction log
CREATE TABLE game.xp_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES game.player_profiles(id) NOT NULL,
  amount INTEGER NOT NULL,
  source TEXT NOT NULL,
  source_id UUID,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Quests (admin-created or system-generated)
CREATE TABLE game.quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  quest_type TEXT NOT NULL CHECK (quest_type IN ('daily', 'weekly', 'monthly', 'special')),
  target_role TEXT CHECK (target_role IN ('rep', 'wholesale', 'all')),
  metric_key TEXT NOT NULL,
  target_value INTEGER NOT NULL,
  xp_reward INTEGER NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  created_by UUID,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Player quest progress
CREATE TABLE game.quest_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES game.player_profiles(id) NOT NULL,
  quest_id UUID REFERENCES game.quests(id) NOT NULL,
  current_value INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  claimed BOOLEAN DEFAULT false,
  UNIQUE(player_id, quest_id)
);

-- Achievement definitions
CREATE TABLE game.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon_key TEXT,
  category TEXT,
  criteria JSONB NOT NULL,
  xp_reward INTEGER DEFAULT 0
);

-- Player achievements
CREATE TABLE game.player_achievements (
  player_id UUID REFERENCES game.player_profiles(id),
  achievement_id UUID REFERENCES game.achievements(id),
  earned_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (player_id, achievement_id)
);

-- Quiz results
CREATE TABLE game.quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES game.player_profiles(id) NOT NULL,
  article_slug TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 4.3 Supabase Integration Points

The game reads/writes to the **existing** `reps` and `public` schemas — no data duplication:

| Game Action | Supabase Call | Schema |
|-------------|---------------|--------|
| Log contact | INSERT `contacts` | reps |
| Submit order (rep) | INSERT `orders` | reps |
| View leads | SELECT `leads` | reps |
| Complete follow-up | UPDATE `follow_ups` | reps |
| Get KPI score | SELECT `kpi_snapshots` | reps |
| Place wholesale order | INSERT `wholesale_orders` | public |
| View wholesale catalog | SELECT products + `wholesale_pricing` | public |
| View invoices | SELECT `wholesale_invoices` | public |
| Award XP | INSERT `xp_log` + UPDATE `player_profiles` | game |
| Track quest progress | UPSERT `quest_progress` | game |
| Save farm state | UPDATE `player_profiles.farm_state` | game |

### 4.4 Auth Flow

1. User visits `noredfarms.com/sales-game/` (or standalone URL)
2. Supabase Auth checks session (shared cookies with main site)
3. If no session -> show login screen (game-themed)
4. On login -> check `game.player_profiles` for user
5. If no profile -> onboarding flow creates one (detects role from `reps.rep_profiles` or `public.wholesale_accounts`)
6. Load game world for appropriate role

### 4.5 API Layer

Use Supabase client directly (CDN) — same pattern as existing `courses/supabase-config.js`:

```javascript
const SUPABASE_URL = 'https://uqyfsqenjakqyzixfcta.supabase.co';
const SUPABASE_ANON_KEY = '...existing key...';

// Game schema access
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  db: { schema: 'game' },
  auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true }
});

// Cross-schema access via RPC or separate client instances
const repsClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  db: { schema: 'reps' }
});
```

**Important**: The `game` schema must be exposed in Supabase Dashboard > API Settings (same as was required for `reps`).

---

## 5. Phaser Scene Architecture

```
BootScene          -> Load assets, check auth
LoginScene         -> Game-themed login (if no session)
OnboardingScene    -> First-time profile creation
FarmHubScene       -> Main hub world with interactive zones
GreenhouseScene    -> Contact logging interface
ApothecaryScene    -> Order creation interface
MapRoomScene       -> Territory map (reps only)
LibraryScene       -> Article browser + quizzes
HarvestFieldScene  -> Goal/quota progress visualization
TradingPostScene   -> Wholesale catalog + cart (wholesale role)
NoticeBoardScene   -> Quests, announcements
HallOfChampions    -> Leaderboard, achievements
```

### Scene Transitions

- Hub scene has clickable zones that transition to sub-scenes
- Sub-scenes have a "back to farm" button
- Persistent HUD overlay shows: player name, level, XP bar, notification bell
- Animated transitions (fade, slide) between scenes

---

## 6. Visual Design

### Art Direction

- **Style**: Clean pixel art or flat illustration (farm/botanical theme)
- **Palette**: Deep Iron design system adapted for game — dark backgrounds (#12181a), teal accents (#50e8c0), warm botanical greens
- **Typography**: Inter font for all UI overlays (matches main site)
- **Sprites**: Plants from product catalog as collectible/visual elements
  - Blue Lotus flowers, Kanna plants, Kava roots
  - Dragon fruit cacti, elderberry bushes, prickly pear
  - Glass jars with extract gradients (#28584e -> #1e4640 -> #163430)

### UI Overlay Rules (HTML/CSS on top of Phaser canvas)

- Follow Deep Iron design system from `styles.css`
- Pill buttons: `border-radius: 99em`, weight 350
- Cards: `bg: #1e2628`, border `rgba(80,232,192,0.05)`
- Modals: frosted glass backdrop `rgba(18,24,26,0.85) + blur(12px)`
- All colors reference existing CSS custom properties

---

## 7. MVP Scope (Phase 1)

### Must Have

1. **Auth + onboarding**: Login, role detection, profile creation
2. **Farm Hub**: Navigable hub with clickable zones (even if some are "coming soon")
3. **Greenhouse (Contact Logging)**: Log contacts with type, notes, account — awards XP
4. **Harvest Field (Quota Tracker)**: Visual weekly contact progress + monthly revenue target
5. **Notice Board (Quests)**: Display active quests, track progress, claim rewards
6. **Hall of Champions (Leaderboard)**: KPI leaderboard pulled from existing `kpi_snapshots`
7. **XP & Level System**: Functional XP tracking, level-ups with visual feedback
8. **Trading Post (Wholesale)**: Product catalog with tier pricing, cart, order submission

### Nice to Have (Phase 2)

- Map Room with interactive territory
- Library with article reader + quizzes
- Apothecary (order crafting with drag-and-drop)
- Farm customization (cosmetic unlocks)
- Push notifications / email digests
- Mobile-responsive touch controls

### Out of Scope

- Real-time multiplayer interactions
- Payment processing (handled by existing systems)
- Inventory management backend
- Mobile native app (web-only for now)

---

## 8. File Structure (Actual)

```
sales-game/
  docs/
    PRD.md                          <- this file
  index.html                        <- entry point
  package.json
  vite.config.js                    <- Vite bundler config (Phaser chunked separately)
  src/
    main.js                         <- Phaser 4 Game config + boot
    config/
      supabase.js                   <- Supabase client setup (game + reps + public schemas)
      products.js                   <- Full 16-product catalog with science + pitch data
      austin-locations.js           <- Real Austin shop locations with quest data
      quizzes.js                    <- Product knowledge quizzes per location
    scenes/
      BootScene.js                  <- Load assets, generate textures, init HUD
      AustinMapScene.js             <- Interactive Austin map with quest pins
      QuestScene.js                 <- Multi-phase quest (intro -> learn -> quiz -> pitch -> reward)
      SettingsScene.js              <- Quality toggle (low/medium/high), display name, stats
    systems/
      XPManager.js                  <- XP award, level calc, streak tracking, localStorage
      HUD.js                        <- Persistent HUD overlay controller
      Settings.js                   <- Quality presets (low/medium/high), localStorage
    styles/
      game.css                      <- Full Deep Iron game overlay styles
```

---

## 9. Data Flow Examples

### Rep Logs a Contact

```
1. Rep clicks Greenhouse zone in FarmHub
2. GreenhouseScene loads -> shows contact form (HTML overlay)
3. Rep fills in: account, contact type, notes
4. On submit:
   a. INSERT into reps.contacts via repsClient
   b. XPManager.award(player, 10, 'contact_logged', contactId)
      -> INSERT into game.xp_log
      -> UPDATE game.player_profiles SET total_xp = total_xp + 10
   c. QuestManager.increment(player, 'contacts_logged', 1)
      -> UPSERT game.quest_progress
      -> Check if any quest completed -> award bonus XP
   d. Show Toast: "+10 XP - Contact Logged!"
   e. Check level-up -> if yes, show level-up animation
5. Return to Greenhouse or FarmHub
```

### Wholesaler Places an Order

```
1. Wholesaler clicks Trading Post in FarmHub
2. TradingPostScene loads -> product grid with tier pricing
3. Wholesaler adds items to cart, clicks "Place Order"
4. On submit:
   a. INSERT into public.wholesale_orders + wholesale_order_items
   b. XPManager.award(player, 25, 'order_placed', orderId)
   c. QuestManager.increment(player, 'orders_placed', 1)
   d. Show Toast: "+25 XP - Order Submitted!"
   e. Update loyalty progress toward next tier
5. Order confirmation screen with order number
```

---

## 10. Non-Functional Requirements

- **Performance**: 60fps Phaser rendering, <2s scene transitions
- **Browser Support**: Chrome, Firefox, Safari, Edge (latest 2 versions)
- **Responsive**: Minimum 1024px width (desktop-first, tablet-friendly)
- **Offline**: Graceful degradation — show cached farm state, queue actions
- **Security**: RLS policies on all `game` schema tables, same auth as existing portals
- **Analytics**: Track scene visits, quest completions, feature usage via existing GA (`G-050E36TGR9`)

---

## 11. Open Questions

1. Should the game app replace the existing reps/wholesale dashboards or complement them?
2. What regions/territories exist currently? Need a territory list for the map.
3. Should wholesalers see rep-like gamification (XP/levels) or just loyalty progression?
4. Is there budget for custom pixel art assets, or should we use free/generated sprites?
5. Should quizzes be manually authored or auto-generated from article content?
6. Real-time notifications (Supabase Realtime) or polling for quest updates?
