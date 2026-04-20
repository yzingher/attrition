# ATTRITION — Product Requirements Document

**Version:** 0.1
**Owner:** Yoav
**Date:** April 2026
**Status:** Draft — ready for Claude Code build

---

## 1. One-line pitch

A 2-player, same-screen, 20-minute web game about near-future drone warfare where you don't win by killing the enemy army — you win by collapsing their ability to build the next one.

## 2. Design thesis

Most drone war games simulate tactics. **Attrition** simulates production. The game is a playable argument — the Vershinin / Bronk / Brose argument — that 21st-century warfare is decided in the supply chain, not the engagement. A player who wins every skirmish 3:1 but is out-produced 5:1 loses. When a player loses, they should be able to point to the peacetime decision that cost them the war.

The game's closest conceptual cousins are **Factorio** (supply chain as legible puzzle), **AoE4** (economy-first RTS), and **Hearts of Iron IV** (production layer). It is explicitly *not* Command: Modern Operations or any tactical drone sim. Drones in flight are a *consequence* of decisions made minutes earlier.

## 3. Target player

Players who enjoy both games and geopolitics. Read-the-news-and-think-about-Taiwan-Strait types. Will recognise "Shahed production concentrated near Isfahan" as a real vulnerability, not flavour text. Wants the game to be *about* something.

Secondary: competitive couch play — two people, same laptop, 20 minutes, rematch energy.

## 4. Core loop

```
Peacetime (3–4 min)     →  Build supply chain, lock doctrine, stockpile, set trade
Opening exchange (2–3)  →  First waves reveal what each side built
Attrition phase (10–12) →  Sustained waves every 60–90s; strikes on production; intelligence; adaptation
Collapse (1–3)          →  One side's regen rate drops below loss rate; curve visible on dashboard
```

Total: ~20 minutes. Game ends by one of three victory conditions (§10).

## 5. Factions (v1 roster: 6)

Each faction ships with a **real-world supply-chain profile and doctrine bias**. The asymmetries are the replay value. Matchups are hand-tuned — China vs Taiwan plays fundamentally differently from Russia vs Ukraine.

| Faction | Doctrine | Supply chain strength | Supply chain weakness |
|---|---|---|---|
| **USA** | Exquisite + autonomous | Software, counter-drone, energy | TSMC chip dependency, slow fabs, high unit cost |
| **China** | Mass + exquisite hybrid | Vertically integrated, rare earths | Taiwan scenario cuts high-end chips; concentrated fabs |
| **Russia** | Mass attritable (Shahed-model) | EW, cheap production | Sanctions-degraded components, smuggled chips |
| **Ukraine** | Distributed FPV | High innovation rate, dispersed fabs | Limited stockpile, dependent on allied high-end imports |
| **Iran** | Mass-attritable specialist | Low cost-per-unit, proxy smuggling | Concentrated production (Isfahan single-point) |
| **Taiwan** | Defensive porcupine | Chip production, terrain | Small scale, chip fabs are *both* asset and target |

v1.1+: Israel, Turkey, India, North Korea. Explicitly not including European NATO as individual factions — too many similar profiles, low replay value.

Each faction has 3–5 doctrine modifiers (e.g. Russia: +20% Shahed production, -30% precision-guided, +15% EW effectiveness). These are static per faction in v1 — no pick-ban, no in-match doctrine shifts.

## 6. Supply chain model

The production stack is deliberately **legible at a glance** — 6 node types, not 30. Factorio-depth would kill the 20-minute format.

```
RAW INPUTS       →  COMPONENTS    →  ASSEMBLY     →  FIELDED UNITS
(rare earths,       (motors,          (drone             (swarms in flight)
 silicon,            seekers,          factories,
 energetics,         flight ctrl,      munition
 batteries)          warheads)         lines)

Cross-cutting:
  ENERGY       (power grid — degrading it slows everything above by %)
  HUMAN CAP    (engineers, operators — slowest to replace, can be struck)
```

**Key asymmetries:**

- **Raw inputs**: cheap, fast to re-source via trade, but trade routes are interdictable. Hitting a mine/port is a mid-value strike.
- **Components**: expensive, slow to rebuild (~3 min in-game). Hitting a component fab is a high-value strike.
- **Assembly**: fast to rebuild (~60s) but high throughput — many lines, dispersed. Hitting one assembly plant is low-value; hitting five is meaningful.
- **Energy**: force multiplier. Destroying 40% of grid imposes 40% throughput penalty across the whole stack. High-value but often heavily defended.
- **Human capital**: cannot be rebuilt in-match. Once engineers are lost, that tier of production is permanently degraded. Rarely-targeted but game-ending when it works.

**Dispersion vs. concentration tradeoff:** Players choose for each node whether to build *centralised* (cheaper, more throughput, one-strike-kills) or *dispersed* (20% more expensive, 30% less throughput, survives strikes). This is the single most important economic decision in the game.

## 7. The drone / counter-drone layer

### Offensive units (simplified, 5 classes)

| Class | Cost | Speed | Payload | Range | Counter |
|---|---|---|---|---|---|
| **FPV / kamikaze** | Very low | Fast | Light | Short | Nets, EW, small-arms |
| **Shahed-class loitering** | Low | Slow | Medium | Long | Interceptors, EW |
| **Recon / ISR** | Medium | Medium | None (sensor) | Long | Interceptors, EW, SAM |
| **Exquisite strike** (Bayraktar/Reaper class) | High | Medium | Heavy | Long | SAM, interceptors |
| **Swarm autonomous** | Medium (per unit, released as packs) | Fast | Light | Medium | EW, directed energy |

### Counter-drone stack (5 types — matching threats to counters *cheaply* is the skill)

| Counter | Best vs. | Cost per engagement | Weakness |
|---|---|---|---|
| **EW / jamming** | FPV, Shahed, recon | Very low (area effect) | Autonomous swarm ignores it |
| **Kinetic interceptors** | Exquisite, Shahed | Very high ($500k class) | Economically ruinous vs. mass |
| **Gun systems / nets** | FPV, close-in | Low | Short range, overwhelmed by mass |
| **Directed energy** | Swarm, FPV | Very low per shot (energy cost) | Weather-dependent, slow tracking |
| **SAM** | Exquisite, recon | High | Overkill vs. mass, limited magazine |

**The design lesson**: spending $500k interceptors on $400 FPVs loses you the war even if you kill every drone. Players should feel this math in their bones by match 3.

## 8. Intelligence layer

Fog of war is **not** just map-based. Both players see drones in flight on the shared map. What's hidden is each player's **production state** — fab queues, stockpiles, doctrine specifics.

Intelligence is a real sub-economy. Roughly 10–15% of a good build's spend.

- **Satellites**: persistent overhead, reveals enemy production node *locations* (not contents). Can be shot down (ASAT — costly, escalatory).
- **Recon drones**: reveals node *contents* (what's in the fab queue) for a few seconds. Attritable.
- **SIGINT stations**: reveals enemy *doctrine modifiers* being applied. Static building.

If you have no intelligence, you fight blind — build the wrong counters, defend the wrong targets. Misreading opponent doctrine is the single most common losing mistake, by design.

## 9. Map & geography

**Hybrid approach.** Each matchup ships with a **hand-designed map** loosely based on real geography.

- USA vs China → Pacific theatre (Taiwan Strait, Philippine Sea, Guam, first island chain)
- Russia vs Ukraine → Donbas / Black Sea
- China vs Taiwan → Strait + eastern Taiwan
- Iran vs Israel → Eastern Mediterranean / Gulf
- USA vs Iran → Gulf + Arabian Sea
- Iran vs Ukraine → fictional "sandbox" map (not every pairing gets real geography — some are gameplay-first)

Maps are 2D top-down, stylised. Real geography informs chokepoints, distances, and which faction's supply chain runs through which terrain. **Not a simulation of real war — a game that rhymes with real geopolitics.**

v1 ships with 6 hand-built maps. Procedural / random maps explicitly out of scope.

## 10. Victory conditions

Three paths, checked continuously:

1. **Production collapse** (most common): opponent's effective regeneration rate < 20% of starting rate, sustained for 60 seconds. Modelled as a rolling average to prevent spiky false triggers.
2. **Strategic decapitation** (rare, high-risk): destroy 3 of 5 critical enemy nodes — HQ, primary fab, primary energy, primary comms, human capital centre. Rewards a deep-strike gamble.
3. **Timeout / attrition score** (20-min expiry): whoever has greater (stockpile × 1 + production capacity × 2) wins. **Rewards the boring, correct, grinding play** — this should be the modal outcome between evenly-matched players.

**No path involves "destroy all enemy units."** This is the single most important rule. The game is not about killing the army.

On match-end, both players see a **post-match analytics screen** showing: production curves over time, kill-to-cost ratios, the specific node-destruction event or trade decision that turned the game. This is the "point at your losing decision" moment — critical for the design thesis.

## 11. Controls & same-screen UX

**Shared top-down map.** Both players see the whole world (drones, terrain, visible infrastructure).

**Asymmetric HUD**: each player has their own HUD — P1 left side of screen, P2 right side. Own economy private; opponent's economy inferred.

**Input**: two players, two input devices.
- **Mode A (default)**: both on keyboard. P1 uses WASD + QWER-TYUI hotkeys on left half. P2 uses arrow keys + IOP-JKL; hotkeys on right half. Each player has a cursor / selection indicator in their HUD colour.
- **Mode B**: one or both on gamepad via Gamepad API. Detected on game start.
- **Mode C (stretch)**: keyboard + mouse for P1, gamepad for P2.

Mouse is **not** used for same-screen play — it creates ownership conflicts. All selection is via hotkey + cursor-move, AoE-style but simpler.

**Pause**: single shared pause button. Either player can pause; game resumes when both confirm ready. This is critical for a 20-min game — avoids rage-quit UX.

## 12. Session & flow

```
Title screen
  ↓
Matchup picker (faction select × 2, map auto-selected from matchup)
  ↓
30-second doctrine briefing (shown to both players, text only, explains your faction's strengths and opponent's)
  ↓
Peacetime phase (3–4 min, game clock visible)
  ↓
Horn sounds → Opening exchange
  ↓
Attrition phase (10–12 min, sustained play)
  ↓
Collapse / timeout
  ↓
Post-match analytics (mandatory screen, both players review together)
  ↓
Rematch / new matchup / quit
```

No campaign, no tutorial-as-cutscene, no progression system, no unlockables in v1. The game is the game.

**Tutorial**: a 5-minute single-player guided match against a scripted opponent, triggered on first launch. Teaches supply chain, doctrine, intelligence. After that the player is on their own.

## 13. Tone & presentation

**Visual**: stylised top-down, clean vector graphics. Closer to *Mini Metro* clarity than to *Command: MO* density. Drones are readable silhouettes not photorealistic. Map terrain is flat-shaded. HUD is information-dense but typographically clean — think Bloomberg terminal meets a good strategy game. Dark palette, faction accent colours (not red vs. blue — too default; each faction has a real palette).

**Audio**: minimalist. Radio chatter (procedural, short), subtle ambient tension, impact sounds. No bombastic orchestral score — this is a thinking game, not a power fantasy.

**Language**: serious but not solemn. Reference real doctrine and real analysts in tooltips ("per Bronk 2024…"). Avoid glorification. No civilian casualties shown on-screen in v1 (see §14). Tone should be *The Economist*, not *Call of Duty*.

## 14. Civilian infrastructure & moral layer (v1 decision)

**In v1: civilian infrastructure targeting is allowed but penalised.**

- Power grid and ports are dual-use — striking them hurts opponent's military production *and* triggers a "political cost" meter.
- Political cost at high levels: third-party arms embargoes (simulated — no live third parties in v1), international sanctions modelling as supply chain penalties, reduced trade route options.
- **No civilian casualty depictions, no named civilian targets, no hospitals/schools.** The moral layer is economic (alliance penalties), not visceral.

This is a deliberate choice. It models a real dynamic (Russia targeting Ukrainian grid, Israel targeting Gaza infrastructure, the real political costs of both) without being a war-crimes simulator. Players *can* win via grid-strike strategies; they *will* face economic penalties for it.

Out of scope for v1: nuclear, cyber-as-first-class, anti-satellite as standard play (ASAT is in, but expensive and escalatory), live third-party alliances.

## 15. Out of scope for v1

Explicit non-goals, to protect the 20-min format and the shipping timeline:

- Online multiplayer / netcode
- Matchmaking / ranked / ELO
- Procedural maps
- Campaign mode, story missions
- Unit skins, cosmetics, progression, unlockables
- In-match doctrine pivots (commit to your build)
- Nuclear weapons, cyber warfare as core mechanic, full third-party diplomacy
- Mobile / tablet (desktop web only — two-player same-screen requires keyboard)
- Localisation beyond English

## 16. Technical architecture

**Stack** (per Yoav's global conventions):

- **Framework**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Rendering**: PixiJS for the game canvas (2D WebGL, good sprite perf for hundreds of drones). Not Three.js — overkill and hurts perf at sprite counts we'll hit. Not raw Canvas 2D — won't scale past ~500 sprites smoothly.
- **Game loop**: fixed-timestep simulation at 30Hz, decoupled from render. Deterministic simulation for replay.
- **State**: Zustand for UI state, custom ECS (Entity-Component-System) or flat typed-array stores for simulation state. No Redux, no MobX.
- **Input**: native keyboard events + Gamepad API for controllers.
- **Audio**: Howler.js for sound management.
- **Persistence** (optional / stretch): Supabase for match history, replay storage. Not required for v1 core play — everything runs client-side.
- **Deployment**: Vercel.
- **Package manager**: pnpm.

**Performance targets:**
- 60 FPS render on a mid-2020s laptop (integrated GPU acceptable)
- 30Hz simulation tick
- Up to 500 concurrent drone entities without frame drop
- Up to 200 static infrastructure entities
- Full 20-min match memory footprint < 500MB

**No server-side game logic in v1.** Everything runs in-browser. Supabase is storage only (optional replay upload).

## 17. Claude Code setup

### Environment variables

```bash
# .env.local template

# Supabase (optional — only for replay storage and match history)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Anthropic (optional — only if using AI for tutorial opponent or analytics narration)
ANTHROPIC_API_KEY=

# GitHub (for CI)
GITHUB_TOKEN=

# Vercel (for deployment)
VERCEL_TOKEN=
```

### Bootstrap script

```bash
#!/bin/bash
# bootstrap.sh

set -e

# Node check
node --version | grep -E "v(20|22)" || { echo "Node 20 or 22 required"; exit 1; }

# Install
pnpm install

# Env setup
cp .env.example .env.local
echo "Fill in .env.local then run: pnpm dev"

# Verify
pnpm typecheck
pnpm lint
pnpm test --run

echo "Bootstrap complete. pnpm dev to start."
```

### Dependencies (core)

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "typescript": "^5.6.0",
    "tailwindcss": "^3.4.0",
    "pixi.js": "^8.0.0",
    "zustand": "^5.0.0",
    "howler": "^2.2.4",
    "@supabase/supabase-js": "^2.45.0"
  },
  "devDependencies": {
    "@types/howler": "^2.2.11",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "vitest": "^2.1.0",
    "@vitest/ui": "^2.1.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "^15.0.0",
    "prettier": "^3.3.0"
  }
}
```

### Directory layout

```
/app                      # Next.js app router (marketing page, match launcher)
/game                     # Game engine (framework-agnostic, pure TS)
  /sim                    # Simulation — ECS, systems, deterministic logic
    /systems              # production, combat, intelligence, economy
    /entities             # drone, node, counter-drone, projectile
    /state                # world state, player state, match clock
  /render                 # PixiJS rendering layer
  /input                  # keyboard + gamepad handling
  /audio                  # Howler wrapper
  /data                   # faction definitions, map definitions, unit stats (JSON)
/components               # React UI (HUD, menus, post-match screen)
/lib                      # utilities, supabase client
/tests                    # Vitest
/public                   # sprites, audio, maps
```

### Build order (for Claude Code)

1. **Slice 1 — core loop stub**: title → matchup picker → empty game screen → timeout → post-match. No gameplay. Proves the flow.
2. **Slice 2 — one faction, one map, static**: place a single fab, produce a single unit type, send it at a target, destroy target. Single-player, no opponent.
3. **Slice 3 — supply chain**: the 6-node stack. Production curves. Stockpile. Energy/human-capital cross-cutting effects.
4. **Slice 4 — counter-drone**: all 5 counter types. Matching-problem gameplay.
5. **Slice 5 — second player**: same-screen input, asymmetric HUDs, shared pause.
6. **Slice 6 — intelligence**: fog, satellites, recon, SIGINT.
7. **Slice 7 — victory conditions + post-match analytics**: all three paths, the "point at your losing decision" screen.
8. **Slice 8 — remaining factions + maps**: scale from 2 factions to 6.
9. **Slice 9 — tutorial, polish, audio, art pass**.
10. **Slice 10 — (optional) Supabase replay storage**.

Each slice should ship end-to-end and be playable (even if ugly). No big-bang integration.

### Testing strategy

- **Vitest unit tests**: all simulation systems (production, combat, intelligence). Target: 70% line coverage on `/game/sim`.
- **Deterministic replay tests**: record a sequence of inputs, replay, assert end state is identical. Catches non-determinism.
- **Balance tests**: scripted matchups run headless, log economic curves. Used to tune faction modifiers.
- **No E2E in v1**. Manual playtest is the balance test.

## 18. Success criteria

**Design success** (qualitative, assessed after 20 playtests):
- Players can point to the specific decision that lost them the match in >70% of losses.
- Losing the opening exchange does not determine the match outcome in >60% of games.
- Match outcome distribution across victory conditions is roughly: 60% production collapse, 10% decapitation, 30% timeout-attrition.
- Median match length is 18–22 minutes.
- Players request rematch in >50% of sessions.

**Technical success**:
- 60 FPS sustained on target hardware
- < 3 second load-to-playable from URL
- Zero desyncs in replay tests over 100 recorded matches
- Lighthouse score > 85 on landing page

**Business success** (not a v1 priority, noted for later):
- Shareable via URL (no account required to play)
- Post-match screen is screenshot-worthy (drives organic sharing)
- Ready for embed in defence-analyst / geopolitics commentary contexts

## 19. Open questions deferred to v1.1+

- In-match doctrine pivots (probably never — commitment is the design)
- Third-party arms transfers / alliances as live mechanic
- Nuclear / cyber / ASAT as standard play (currently ASAT in, others out)
- AI single-player opponent beyond tutorial (scripted tutorial bot is v1; real adaptive AI is v1.1+ — Claude API call per doctrine decision is plausible)
- Online multiplayer (requires deterministic sim + rollback; architecture supports it but not scoped for v1)
- Replay sharing / spectator mode
- Mobile / touch controls
- Additional factions (Israel, Turkey, India, North Korea)

## 20. Appendix — design principles (non-negotiable)

1. **The game is not about killing the army.** It is about collapsing the system that builds the army.
2. **Every loss should be explainable.** The post-match screen must point to the turning decision.
3. **Legibility over fidelity.** Six node types, not thirty. Five drone classes, not fifty.
4. **Asymmetry is the replay.** Faction differences are real, not flavour.
5. **Intelligence is a real economy.** Playing blind is a choice with a cost.
6. **Twenty minutes or it doesn't ship.** Every feature is pressure-tested against the clock.
7. **Peacetime decisions decide wars.** The most important minutes are the first four.
