# Fitness journal

A minimal, plan-aware workout journal. Local-first (IndexedDB), built for functional training.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # progress engine unit tests
npm run typecheck
npm run build
```

## Structure

```
packages/core   pure TypeScript: types, progress engine, seed exercises, Repo interface (no DOM)
apps/web        React + Vite + Tailwind v4 UI, Dexie implementation of Repo
```

`core` never imports browser code, so a future React Native app can reuse it and swap Dexie for SQLite
by implementing `Repo`.

## What works now (phase 0 + start of phase 1)

- Home: week track bar, today's session card with live progress, open/continue button
- Today's workout: tick-style set logging, editable numbers, saved to IndexedDB
- Quiet "new best" message when a set beats your history (weight at same-or-more reps, reps, hold time)
- Style presets (Paper, Midnight, Sage) under Me
- CI: typecheck, tests, build on every push

## Next (see roadmap)

- [ ] PWA shell (manifest + service worker via vite-plugin-pwa)
- [ ] Plan builder replaces `apps/web/src/defaultPlan.ts`
- [ ] Phase 2: progress screen, body metrics, goals
- [ ] Phase 3: saved reels import (Instagram export), tags, search (MiniSearch), Add to plan
- [ ] Phase 4: capture extension
- [ ] Phase 5: Supabase auth + sync
