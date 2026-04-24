# Pure Extracts Adventures (PEA) — Full Context Document

> This document captures the complete state of the project for context handoff.
> Read this to fully understand what exists, what works, and what comes next.

---

## 1. What Is This?

A **Phaser 4.0.0 "Caladan"** browser game for Nored Farms sales reps and wholesale partners. Players visit real Austin TX shops on an interactive map, learn about botanical products (Blue Lotus, Kanna, Kava), pass knowledge quizzes, and run pitch simulations — all earning XP and leveling up. It uses a **retro hacker/terminal aesthetic** with scanlines, CRT effects, monospace fonts, and chat-bubble dialogue.

**Stack**: Phaser 4 + Vite + Supabase + vanilla JS (no React)
**Location**: `/home/koh/Documents/noredFarms/pea/`
**Hosting**: Netlify at `noredfarms.netlify.app/pea/`
**Supabase**: Project `uqyfsqenjakqyzixfcta` — `game` schema with 7 tables

---

## 2. File Structure (Current)

```
pea/
  docs/
    PRD.md                              # Full product requirements document
    CONTEXT.md                          # This file
  index.html                            # Entry point — scanlines, CRT vignette, HUD, bottom nav bar
  package.json                          # phaser@^4.0.0, @supabase/supabase-js@^2.49.0, vite@^6.3.0
  vite.config.js                        # base: '/pea/', phaser chunked separately
  src/
    main.js                             # Phaser 4 Game config + bottom nav routing + system exports
    config/
      supabase.js                       # 3 Supabase clients (game/reps/public schemas)
      products.js                       # 16 products with science + pitch fields
      austin-locations.js               # 9 real Austin shops (2 unlocked, 7 locked by level)
      quizzes.js                        # 5 questions per location (all 9 locations have quizzes)
      library-articles.js               # 14 articles across 5 categories for Ancient Wisdom Library
    scenes/
      BootScene.js                      # Terminal boot sequence, procedural textures, DataBridge init
      AustinMapScene.js                 # Interactive Austin map with hex grid, scan rings, daily quests panel
      QuestScene.js                     # Multi-phase quest with chat-bubble pitch system
      LibraryScene.js                   # Ancient Wisdom Library — articles, search, filters, XP tracking
      SettingsScene.js                  # Quality toggle, sound, achievements gallery, stats, login/logout
      LoginScene.js                     # Email/password auth with Supabase, login + signup modes
      LeaderboardScene.js               # Overlay leaderboard with top players, rank tiers, personal stats
    systems/
      Settings.js                       # Quality presets (low/med/high), localStorage
      XPManager.js                      # XP award, level calc, streak tracking, toast system, localStorage
      HUD.js                            # Persistent HUD overlay — XP bar, daily quest dots, achievements
      DataBridge.js                     # Supabase sync layer — localStorage-first, background sync
      Achievements.js                   # 10 achievements with runtime checking + popup notifications
      SoundManager.js                   # Procedural Web Audio API sounds (8 effects, no audio files)
      DailyQuests.js                    # 3 random daily quests, time-limited, seeded by date
      OfflineQueue.js                   # Queues failed Supabase calls for retry when back online
    styles/
      game.css                          # Full retro hacker CSS — scanlines, chat bubbles, terminal style
```

---

## 3. Tech Details

### Phaser 4.0.0 "Caladan" (CRITICAL)
- Released April 10, 2026
- Uses **named exports**, NOT default export
- `import { Game, AUTO, Scale } from 'phaser'` (correct)
- `import Phaser from 'phaser'` (WRONG — will break build)
- `import { Scene } from 'phaser'` for scenes
- `import { Scene, Math as PMath } from 'phaser'` for random/math
- All Phaser 3 patterns like `Phaser.Scene`, `Phaser.AUTO`, `Phaser.Scale.RESIZE` must be updated

### Supabase Configuration
- **URL**: `https://uqyfsqenjakqyzixfcta.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxeWZzcWVuamFrcXl6aXhmY3RhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1NTQzMjAsImV4cCI6MjA4NTEzMDMyMH0.SFFaYsDxdlHCFU30aV3Qzi6SI7759o2bePCaqKAHkTA`
- **Service Role**: (see CLAUDE.md in parent repo — not committed here)
- **DB Password**: (see CLAUDE.md in parent repo)
- **Pooler URL**: (see CLAUDE.md in parent repo)
- **Direct psql DOES NOT work** — use pooler URL
- **Three schemas**: `game` (this app), `reps` (existing rep portal), `public` (courses/wholesale)
- **`game` schema**: Must be exposed in Supabase Dashboard > API Settings

### Test User
- **Email**: `test@noredfarms.com`
- **Password**: `nored1`
- **User ID**: `85e8d714-ba12-4c4d-8b4c-78d41d570b5c`

### Three Supabase Client Instances
```js
gameClient  = createClient(url, key, { db: { schema: 'game' } })
repsClient  = createClient(url, key, { db: { schema: 'reps' } })
publicClient = createClient(url, key, { db: { schema: 'public' } })
```

### Vite Config
- `base: '/pea/'` (for Netlify subdirectory)
- Phaser is chunked separately (`manualChunks: { phaser: ['phaser'] }`)
- Dev server port: 5173

### Build Output (verified working)
```
dist/index.html                     3.30 kB
dist/assets/index-EZODyCmC.css    29.63 kB
dist/assets/index-DKn2EJkU.js    390.19 kB
dist/assets/phaser-JQjKh_Pe.js  1,656.70 kB
```

---

## 4. Database Schema (`game` schema)

Migration file: `/home/koh/Documents/noredFarms/supabase/migrations/008_game_schema.sql`
**Status: APPLIED to live database successfully**

### Tables (all have RLS enabled)
| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `player_profiles` | Links auth.users to game state | user_id, role, display_name, level, total_xp, current_streak, quests_completed[], quiz_results{}, farm_state{}, settings{} |
| `xp_log` | Immutable XP transaction log | player_id, amount, source, source_id, note |
| `quests` | Admin-created objectives | title, quest_type, location_id, metric_key, target_value, xp_reward |
| `quest_progress` | Per-player quest tracking | player_id, quest_id, current_value, completed, claimed |
| `achievements` | Badge definitions | key, title, description, icon_key, category, criteria{} |
| `player_achievements` | Earned badges | player_id, achievement_id, earned_at |
| `quiz_results` | Knowledge check history | player_id, location_id, quiz_title, score, total_questions, passed |

### RPC Functions (SECURITY DEFINER)
- `game.award_xp(p_player_id, p_amount, p_source, p_source_id, p_note)` — Atomic XP award + level calc
- `game.get_or_create_player(p_display_name, p_role)` — Auto-creates player, auto-detects role from reps/wholesale schemas
- `game.update_streak(p_player_id)` — Streak management (consecutive daily logins)

### Seed Data
- 2 quests: "The Apothecary Apprentice" (herb-bar) + "Light the Lighthouse" (la-lighthouse)
- 8 achievements: first_quest, all_austin, perfect_quiz, streak_7, streak_30, pitch_ace, level_5, level_10

---

## 5. Game Scenes & Flow

### Scene Registry (7 scenes)
1. **BootScene** — Terminal boot sequence with typing effect, procedural texture generation (pins, particles, buildings, trees, hex), DataBridge init (async with status display), HUD init, nav bar show, daily quest refresh, streak update
2. **AustinMapScene** — Interactive map with hex grid background, road grid, Lady Bird Lake, 9 shop pins (level-gated), corner bracket frame, coordinate readout, daily quests panel (floating top-right with claim buttons)
3. **QuestScene** — Multi-phase quest engine:
   - **Intro** — Shop info, mission briefing, pitch tips
   - **Learn** — Product cards with science + pitch data
   - **Quiz** — 5 multiple choice questions, need 3/5 to pass, +50 XP on pass
   - **Pitch** — Chat-bubble dialogue with NPC (typing indicator, player choices, score feedback)
   - **Reward** — Grade badge (A-D), XP breakdown, knowledge summary
4. **LibraryScene** — Ancient Wisdom Library with 14 articles, category filters, search, read tracking, XP awards
5. **SettingsScene** — Overlay panel with: quality toggle (low/med/high), effect toggles (particles, glow, animated bg, screen shake), sound controls (mute + volume slider), display name editor, stats grid, achievements gallery (10 badges, earned vs locked), Supabase connection status, login/logout button
6. **LoginScene** — Email/password auth overlay with login/signup toggle, validation, "Continue Offline" option
7. **LeaderboardScene** — Overlay with: top 10 players, rank tiers (Rookie/Apprentice/Expert/Master/Legend), personal stats, rank badge animation

### Navigation
- **Bottom nav bar** (Map / Library / Ranks / Settings) — 4 buttons, always visible (including during quests)
- **Scene transitions** use camera fadeIn/fadeOut (300-400ms)
- **Overlays** (Settings, Leaderboard, Login) launch on top of current scene

---

## 6. Systems

### XPManager (`systems/XPManager.js`)
- Award XP with source tracking, automatic level calculation
- Level curve: `level * 500` XP per level
- Streak tracking: consecutive daily logins
- `showToast(title, message, variant)` — exported named function, supports variants: `'xp'`, `'success'`, `'error'`, `'levelup'`
- Level-up triggers: HUD glow animation (1.5s), levelup sound, celebratory toast
- onChange callbacks for HUD updates

### HUD (`systems/HUD.js` + `index.html`)
- Top bar: player name, level badge, XP progress bar, XP text
- Right side: 3 daily quest dots (clickable, shows completion), achievement counter (clickable, opens settings), streak counter
- Updates on every XP change via `xpManager.onChange()`

### DataBridge (`systems/DataBridge.js`)
- localStorage-first for instant feedback, Supabase background sync for durability
- Methods: `init()`, `awardXP()`, `completeQuest()`, `saveQuizResult()`, `updateDisplayName()`, `saveSettings()`, `getLeaderboard()`, `getMyAchievements()`, `login()`, `logout()`
- Integration: BootScene (init), QuestScene (award/complete/quiz), SettingsScene (name/settings/login/logout), LeaderboardScene (getLeaderboard)

### Achievements (`systems/Achievements.js`)
- 10 definitions: first_quest, five_quests, all_austin, perfect_quiz, streak_7, streak_30, pitch_ace, level_5, level_10, library_reader
- Runtime auto-checking after XP awards and quest completions
- Popup notification system with queue, backdrop, glitch text animation
- Procedural achievement sound effect
- Syncs to Supabase `player_achievements` table

### SoundManager (`systems/SoundManager.js`)
- 8 procedural sounds via Web Audio API oscillators (no audio files):
  - `xp` — ascending blip
  - `levelup` — triumphant 4-note arpeggio (C5-E5-G5-C6)
  - `correct` — happy high ping
  - `wrong` — descending buzz
  - `achievement` — fanfare flourish (6-note ascending)
  - `click` — subtle tick
  - `transition` — noise swoosh with filter sweep
  - `typing` — soft keyboard click with randomized pitch
- Volume/mute persisted to localStorage
- Respects browser autoplay policy (lazy AudioContext creation)

### DailyQuests (`systems/DailyQuests.js`)
- 5 quest definitions in pool, 3 selected per day via date-seeded deterministic shuffle
- Quests: Knowledge Seeker (read article), Quiz Master (pass quiz), Explorer (visit location), Silver Tongue (B+ pitch), Consistency (login)
- XP rewards: 15-40 per quest
- State persists in localStorage, resets at local midnight
- API: `getToday()`, `markCompleted()`, `claimReward()`, `getTimeRemaining()`

### OfflineQueue (`systems/OfflineQueue.js`)
- Queues failed Supabase calls for retry when connection restored
- Auto-flushes on startup if online with pending items

---

## 7. Visual Design System

### Retro Hacker Aesthetic
- **Fonts**: Inter (body/headings) + JetBrains Mono (terminal/system text)
- **Scanlines**: CSS repeating-linear-gradient overlay
- **CRT vignette**: Radial gradient darkening edges
- **Glitch text**: RGB-split text-shadow animation on headings
- **Pixel corners**: `::before`/`::after` corner bracket decorations
- **Terminal style**: `> ` prefix on names, `//` prefix on section headers, uppercase monospace labels

### Color Tokens
- `--bg: #12181a` (main background)
- `--teal: #50e8c0` (primary accent)
- `--text-heading: #bccac4`, `--text-body: #8e9c98`, `--text-muted: #506460`
- `--error: #c45c4b`

### Chat Bubble System
- NPC bubbles: left-aligned, dark card background, speech tail pointing left
- Player bubbles: right-aligned, teal-tinted, speech tail pointing right
- System messages: centered, no bubble, monospace
- Typing indicator: 3-dot bouncing animation
- Score feedback: inline system messages with color-coded quality

### CSS Features (game.css)
- Focus-visible states on all interactive elements (teal outline + glow)
- Toast variants: `.toast-success` (teal border), `.toast-error` (red border), `.toast-levelup` (teal glow)
- Level-up HUD animations: `hudLevelPulse` (badge glow), `hudBarPulse` (bar brightness)
- HUD daily quest dots + achievement counter styles
- Achievement gallery grid (earned vs locked)
- Sound slider (custom range input, teal thumb)
- Daily quests floating panel (top-right, 240px)
- Leaderboard entries, rank badges, tier styling

### Quality Presets
| Setting | Low | Medium | High |
|---------|-----|--------|------|
| Particles | Off | 50 | 200 |
| Glow | Off | On | On |
| Animated BG | Off | On | On |
| BG Stars | 0 | 30 | 80 |
| Ambient Anim | Off | On | On |

---

## 8. Products (16 total, 6 categories)

| Category | Product | Price |
|----------|---------|-------|
| Tinctures | 5000mg Blue Lotus Tincture | $60 |
| Tinctures | 3000mg Kanna Tincture | $80 |
| Gummies | 500mg Kanna Gummies | $40 |
| Gummies | 2500mg Blue Lotus Gummies | $40 |
| Extracts | 1g Blue Lotus Resin Extract | $30 |
| Extracts | 1g High Potency Kanna Extract | $40 |
| Extracts | High Potency Kava Kava CO2 Extract | $30 |
| Dried Botanicals | Dried Blue Lotus (1 oz) | $30 |
| Dried Botanicals | Dried Kanna (1 oz) | $30 |
| Live Plants | Purple Dragon Fruit | $20 |
| Live Plants | Bob Gordon Elderberry | $20 |
| Live Plants | Central Texas Prickly Pear | $20 |
| Live Plants | Davis Mountain Yucca | $25 |
| Seeds | Heirloom Sugarcane Seeds | $20 |
| Seeds | Hibiscus Seeds | $20 |
| Seeds | Nicotiana Rustica (Hape) Seeds | $40 |

Each product in `products.js` has `science` and `pitch` fields with detailed text.

---

## 9. Austin Quest Locations (9 total)

| ID | Name | Status | Unlock | XP | Difficulty |
|----|------|--------|--------|-----|-----------|
| `herb-bar` | The Herb Bar | Unlocked | -- | 150 | 1/3 |
| `la-lighthouse` | La Lighthouse at Casa de Luz | Unlocked | -- | 200 | 2/3 |
| `in-gredients` | in.gredients | Locked | Lv 2 | 175 | 1/3 |
| `rabbit-food` | Rabbit Food Grocery | Locked | Lv 2 | 175 | 1/3 |
| `ace-of-cups` | Ace of Cups Apothecary | Locked | Lv 3 | 200 | 2/3 |
| `peoples-pharmacy` | Peoples Rx Pharmacy | Locked | Lv 4 | 250 | 2/3 |
| `south-congress-books` | South Congress Books | Locked | Lv 4 | 225 | 2/3 |
| `texas-medicinals` | Texas Medicinals | Locked | Lv 5 | 300 | 3/3 |
| `antonelli-cheese` | Antonelli's Cheese Shop | Locked | Lv 6 | 300 | 3/3 |

All 9 locations have full quest content: quiz (5 questions each), pitch dialogue, owner personality, pitch tips, best products.

---

## 10. Library Articles (14 total)

| Category | Count | Topics |
|----------|-------|--------|
| Plants | 4 | Blue Lotus history, Kanna origins, Kava Pacific tradition, Dragon Fruit growing |
| Science | 3 | Alkaloids 101, Extraction methods, Serotonin system & natural SRIs |
| Healing | 3 | Blue Lotus wellness, Kanna daily use, Kava circles |
| Sales | 3 | S.E.E.D. pitch framework, Objection handling, Territory strategy |
| Products | 2 | Complete product lineup guide, Wholesale pricing & terms |

Each article awards 10-20 XP on completion. Read status tracked in localStorage (`nf_sq_library_read`).

---

## 11. What Works (All Features)

- Build compiles cleanly (`npm run build` — 0 errors, 0 type errors)
- Dev server starts (`npm run dev` on port 5173/5174)
- All 7 scenes render and transition correctly
- Terminal boot sequence with typing effect, async Supabase status, DataBridge init
- Interactive Austin map with 9 pins (level-gated), hex grid, Lady Bird Lake, scan rings
- Daily quests panel on map (floating top-right, claim buttons, time remaining)
- Quiz system with 5 questions per location, scoring, sound feedback
- Chat-bubble pitch dialogue with typing indicators, NPC personality, grade system
- XP/level system with localStorage persistence and Supabase sync
- Level-up celebration: HUD glow animation, triumphant sound, toast notification
- Quality settings toggle (low/med/high) with scene restart
- Effect toggles: particles, glow, animated bg, screen shake
- Sound system: 8 procedural effects via Web Audio API, volume/mute controls
- Library with search, category filters, article reading, XP awards
- Bottom nav bar routing between scenes (visible during quests)
- Achievement system: 10 badges, runtime checking, popup notifications with glitch animation
- Leaderboard overlay with top players, rank tiers, personal stats
- Login/signup UI with email/password, guest mode support
- Settings panel with: quality, effects, sound, display name, stats, achievements gallery, login/logout
- HUD with XP bar, daily quest dots, achievement counter, streak
- Toast notification system with variants (xp, success, error, levelup)
- Focus-visible states on all interactive elements
- DataBridge Supabase sync layer (localStorage-first architecture)
- Offline queue for failed Supabase calls
- Database schema applied to live Supabase (7 tables, RLS, RPCs, seed data)
- Retro hacker CSS aesthetic throughout
- Netlify deploy configuration (netlify.toml, SPA redirect, build command)

---

## 12. What's NOT Done Yet (Next Steps)

### Must Do
1. **Verify `game` schema is exposed in Supabase Dashboard API Settings** — REST API calls will fail until schema is exposed
2. **Test DataBridge end-to-end** — Login with test user (test@noredfarms.com / nored1), verify XP sync, quiz persistence, leaderboard data
3. **Deploy to Netlify** — Push to master, verify at `noredfarms.netlify.app/pea/`

### Should Do
4. **Territory/region system** — PRD mentions regions but not yet implemented
5. **Wholesale features** — Order placement, catalog browsing, loyalty tiers from PRD
6. **More quest content** — The 7 locked locations have quiz questions but could have richer pitch dialogue scenarios
7. **Push notifications** — When new quests or achievements are available
8. **21st.dev components** — User mentioned using 21st.dev for UI polish (not yet integrated)

### Nice to Have
9. **Admin panel** — Manage quests, view player stats, add locations
10. **Social features** — Share achievements, challenge friends
11. **Team leaderboards** — Filter by region or team
12. **Product catalog in-game** — Browse full product line with ordering

---

## 13. Known Issues / Gotchas

1. **Phaser 4 imports** — Must use named exports. `import Phaser from 'phaser'` will crash the build.
2. **Direct psql blocked** — `db.uqyfsqenjakqyzixfcta.supabase.co` is unreachable. Use the pooler URL.
3. **Game schema API access** — Schema needs to be exposed in Supabase Dashboard > Project Settings > API > Exposed schemas. Without this, all gameClient REST calls return 404.
4. **Supabase password minimum** — Supabase Auth requires minimum 6 characters. LoginScene enforces this client-side.
5. **Dynamic import warnings** — Vite warns about SoundManager.js and supabase.js being both statically and dynamically imported. Pre-existing, does not affect functionality.
6. **Port conflict** — Dev server may start on 5174 if 5173 is occupied.

---

## 14. Netlify Deploy

### Configuration
- **netlify.toml** handles: SPA redirect for `/pea/*`, build command, security headers
- **Build command**: `npm ci && cd pea && npm ci && npm run build && cp dist/index.html . && cp -r dist/assets . && cd ..`
- **Publish dir**: `.` (repo root)
- Game assets end up at `pea/index.html` and `pea/assets/` in the published tree

### Deploy Checklist
1. Ensure `game` schema is exposed in Supabase Dashboard
2. Push to master branch
3. Netlify auto-builds and deploys
4. Verify at `noredfarms.netlify.app/pea/`

---

## 15. Broader Project Context

PEA lives inside the larger Nored Farms repository:
- `styles.css` — Main site Deep Iron design system
- `reps/` — Next.js sales rep portal (Supabase `reps` schema)
- `courses/` — Course platform (Supabase `public` schema)
- `classroom/` — Classroom sub-pages
- `supabase/` — Migration files
- Hosted on Netlify at `noredfarms.netlify.app`
- Google Analytics: `G-050E36TGR9`
