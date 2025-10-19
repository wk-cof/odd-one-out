# Odd One Out (TypeScript)

A fast, kid-friendly **pattern detection** game for the browser. Built with **TypeScript** and **Vite**, the game shows 2×2 emoji grids where **three tiles follow a rule and one breaks it**. Spot the odd one out before the timer expires to keep your streak alive. Perfect for visual scanning, categorization, and attention skills.

---

## Overview

Each round presents a 2×2 grid of emojis. Three follow the same rule (e.g., all **animals**) and one **breaks** the rule (e.g., a **food**). Click or select the odd one to score and advance. Rounds get **faster** and patterns get **trickier** the longer you play.

- **No assets**: emojis only
- **Themes**: Animals, Food, Nature, Space, Sports, Transport, Shapes
- **Modes**: Endless (timed), Practice (no timer), Kid Mode (longer timers)
- **A11y**: keyboard support, ARIA live updates, reduced-motion support

---

## Features

- **Multiple pattern types** (toggle in Settings):
  - **Category**: three share a category; one does not (🐼 🦊 🐯 **🍎**)
  - **Attribute**: three share an attribute (e.g., “round-ish”); one doesn’t
  - **Orientation** (optional): three rotated/flipped similarly via CSS; one isn’t
- **Difficulty scaling**: decrease per-round time or increase pattern complexity
- **Score & streaks**: +1 for correct answers, speed-based streak bonus; **LocalStorage** persists best scores
- **Kid-friendly UI**: large tap targets, gentle feedback, zero ads
- **Accessibility**: focus ring, keyboard navigation, screen reader announcements
- **Customization**: choose themes, toggle pattern types, adjust timers

---

## Quick Start

### Prerequisites

- **Node.js** 18+ (20+ recommended)
- **npm** 9+ (or `pnpm`/`yarn`)

### Install & Run

```bash
npm install
npm run dev
```

Open http://localhost:5173 (port may vary).

### Build & Preview

```bash
npm run build
npm run preview
```

---

## Gameplay Loop

1. Choose a mode, theme set, and pattern types in Settings.
2. A 2×2 grid appears with 3 tiles matching the current rule and 1 odd one out.
3. Click or press the odd tile:
   - Correct → score, advance to the next round (slightly faster or harder)
   - Wrong → lose a life (Endless) or show an explanation (Practice)
4. Keep your streak going and beat your best score!

### Controls

- **Keyboard**: arrow keys to move focus; `Enter`/`Space` to select; `R` to restart; `S` to toggle settings
- **Mouse/Touch**: tap a tile to select; tap Restart to replay

---

## Project Structure

```text
.
├── index.html
├── src
│   ├── main.ts              # app bootstrap
│   ├── styles.css           # responsive styles & animations
│   ├── game
│   │   ├── engine.ts        # round generation, scoring, timers
│   │   ├── rules.ts         # pattern rules (category, attribute, orientation)
│   │   ├── types.ts         # types: GameState, Settings, Rule, Theme
│   │   └── storage.ts       # localStorage (best score, settings)
│   ├── data
│   │   └── emojis.ts        # emoji pools organized by theme/attributes
│   └── ui
│       ├── render.ts        # DOM rendering (grid/HUD/modals)
│       ├── events.ts        # input handlers (click/keyboard)
│       └── a11y.ts          # ARIA live regions, focus helpers
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Configuration

Edit `src/game/engine.ts` and `src/data/emojis.ts` to tune defaults.

```ts
// src/game/engine.ts (excerpt)
export const CONFIG = {
  mode: "endless" as "endless" | "practice" | "kid",
  startLives: 3,
  startTimeMs: 6000,          // per round
  minTimeMs: 2500,            // cap difficulty
  timeStepMs: 200,            // decrement each round (endless)
  patterns: { category: true, attribute: true, orientation: false },
  themes: ["animals", "food", "nature", "space", "sports", "transport", "shapes"],
};
```

```ts
// src/data/emojis.ts (excerpt)
export const POOLS = {
  animals:  ["🐼","🦊","🐨","🦁","🐯","🐸","🐙","🐢","🐧","🐝"],
  food:     ["🍎","🍌","🍓","🍕","🍔","🍣","🍩","🧁","🥑","🧀"],
  nature:   ["🍁","🍄","🌻","🌈","❄️","🌊","⛰️","🌵"],
  space:    ["🚀","🛰️","🛸","🪐","🌟","🌕"],
  sports:   ["⚽️","🏀","🏈","🏓","🏸","⛳️"],
  transport:["🚗","🚌","🚲","🚂","🚁","✈️","🚇","🚜"],
  shapes:   ["🔵","🔺","⬛️","⭐️","🟩","🟥","🟨","🟪"]
};

export const ATTRIBUTES: Record<string, string[]> = {
  "🔵": ["round"],
  "⚽️": ["round", "sports"],
  "🍩": ["round", "food"],
  "🌕": ["round", "space"],
  "🟪": ["square-ish"],
  "⬛️": ["square-ish"],
  "🍕": ["triangle-ish"]
};
```

---

## State Model

- **GameState**: `{ round, timeLeftMs, lives, score, streak, tiles, rule, status }`
- **Tile**: `{ id, emoji, isOdd, attrTags? }`
- **Rule**: `{ type: 'category' | 'attribute' | 'orientation', meta: {...} }`

Pure functions drive gameplay: `createRound(settings)`, `evaluatePick(state, tileId)`, `tick(state, dt)`, `nextRound(state)`.

---

## Accessibility

- ARIA live status updates announce “Correct!”, “Try again”, “1 life left”, and “Round 5”
- Focus returns to the grid after dialogs; keyboard grid supports arrow navigation
- Respects `prefers-reduced-motion` to shorten or skip transitions
- High-contrast palette; tiles are ≥ 64×64 CSS px for smaller screens

---

## Persistence

- `ooo:lastSettings` → last chosen patterns, themes, mode
- `ooo:bestScore:<mode>` → best score per mode

---

## Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview --strictPort",
    "deploy": "vite build && gh-pages -d dist"
  },
  "devDependencies": {
    "gh-pages": "^6.0.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0"
  }
}
```

---

## Deploy to GitHub Pages

Set the Vite base for the repository name (`odd-one-out`):

```ts
// vite.config.ts
import { defineConfig } from "vite";

export default defineConfig({
  base: "/odd-one-out/"
});
```

For `username.github.io` sites, use `base: "/"`.

Publish the site:

```bash
npm run build
npm run deploy
```

Then open:

```
https://<your-username>.github.io/odd-one-out/
```

---

## Roadmap

- Add short “why this was odd” hints after each round
- Allow custom emoji sets and rules for parents/teachers
- Ship a PWA for offline play and quick resume

---

## Alternate Name Ideas

1. Odd Squad Emojis
2. Rule Breaker Roundup
3. Emoji Mismatch Mayhem
4. Spot the Sneaky Sprite
5. Outlier Outburst
6. Emoji Misfit Mash
7. Rule Bender Rally
8. Icon Oddball Hunt
9. Quirky Quartet Quest
10. Emoti-Oops Arena

