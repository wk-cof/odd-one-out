# Odd One Out – Project Plan

## 1. Goals & Audience
- Deliver a browser-based emoji pattern-detection game suited for kids and families.
- Emphasize quick rounds, intuitive interactions, and gentle feedback loops.
- Support both casual play (Practice, Kid Mode) and competitive streak chasing (Endless).

## 2. Functional Requirements
- Present 2×2 emoji grids; exactly one tile must violate the active rule.
- Game modes:
  - Endless: timed rounds, limited lives, accelerating difficulty.
  - Practice: untimed, infinite lives, explanations after mistakes.
  - Kid Mode: similar to Endless with longer timers and softer difficulty ramp.
- Pattern types (each toggleable): category, attribute, orientation.
- Theme selection: Animals, Food, Nature, Space, Sports, Transport, Shapes.
- Scoring: +1 per correct pick, streak bonuses based on speed, persist best scores per mode.
- Lives: decrement on wrong picks (Endless/Kid), display remaining lives.
- Settings UI: toggle themes, pattern types, mode, timers; persist last settings.
- Provide restart option and HUD showing round, timer, score, streak, lives.

## 3. Non-Functional Requirements
- Responsive layout with large tap targets (≥ 64×64 px) and high contrast.
- Accessible keyboard navigation (arrow navigation + Enter/Space activation).
- Screen reader support via ARIA live regions for status updates.
- Respect `prefers-reduced-motion`; offer reduced animations.
- No external asset dependencies; rely purely on emoji glyphs.
- Runs smoothly on modern browsers (Chrome, Edge, Safari, Firefox) on desktop and mobile.

## 4. Technical Stack & Tooling
- Framework: Vite + TypeScript, modular vanilla DOM rendering.
- State management: custom game state pure functions (`createRound`, `tick`, etc.).
- Persistence: `localStorage` keys `ooo:lastSettings` and `ooo:bestScore:<mode>`.
- Build & deploy: Vite build, GitHub Pages via `vite` + `gh-pages`.
- Code quality: TypeScript types for game entities, prefer pure logic for rules.

## 5. Architecture Overview
- `src/main.ts`: bootstrap, initialize UI/event wiring.
- `src/styles.css`: responsive layout, animations, focus styles, reduced-motion rules.
- `src/game/engine.ts`: configuration, round lifecycle, timers, scoring, streak tracking.
- `src/game/rules.ts`: rule evaluation (category, attribute, orientation) and odd-tile selection.
- `src/game/types.ts`: define `GameState`, `Tile`, `Rule`, `Settings`.
- `src/game/storage.ts`: save/load settings and best scores.
- `src/data/emojis.ts`: emoji pools by theme; attribute metadata for advanced rules.
- `src/ui/render.ts`: render HUD, board, dialogs/modals.
- `src/ui/events.ts`: attach handlers for mouse/touch/keyboard input.
- `src/ui/a11y.ts`: ARIA live region management, focus helpers.

## 6. Data & Rule Generation
- Emoji pools keyed by theme; each tile holds `emoji`, `isOdd`, optional `attrTags`.
- Attribute metadata enables attribute-based rules (e.g., “round-ish”).
- Orientation rule achieved via CSS transforms on three tiles; odd tile stays default.
- Round generator selects:
  1. Active theme subset.
  2. Rule type consistent with toggles.
  3. Three matching emojis + one odd from different theme/attribute.
  4. Timer length adjusted from configuration/difficulty ramp.

## 7. Gameplay Loop
1. Initialize settings from defaults or persisted values.
2. Generate new round (`createRound`); start per-round timer.
3. On selection:
   - If odd tile: update score/streak, accelerate difficulty (time reduction or rule complexity), push new round.
   - Else: decrement lives or show explanation (Practice). Reset streak if needed.
4. Timer tick (`tick`): when time hits zero treat as incorrect guess and proceed per mode rules.
5. When lives exhausted (Endless/Kid) show game-over dialog with summary and best score.

## 8. Accessibility Checklist
- Focus state visible on all interactive elements.
- Arrow key navigation across grid cells; wrap-around support for edges.
- Announce round start, correct/incorrect feedback, lives remaining via ARIA live region.
- Return focus to grid when closing settings or dialogs.
- Provide visual + textual feedback; allow reduced motion variant.

## 9. Persistence & Settings
- On load, hydrate settings from `ooo:lastSettings`; fallback to defaults.
- After each settings change, persist selection.
- Update `ooo:bestScore:<mode>` when streak surpasses saved value; surface best score in HUD.

## 10. Deployment Notes
- Configure `base: "/odd-one-out/"` in `vite.config.ts` for project pages.
- `npm run deploy` runs `vite build` then publishes `dist` via `gh-pages`.
- For `username.github.io` root sites, update base to `/`.

## 11. Milestones & Tasks
1. **Scaffold** Vite + TypeScript project; configure linting/types.
2. **Data setup**: emoji pools + attribute metadata.
3. **Core engine**: state types, round generator, scoring, timer logic.
4. **Rules module**: category, attribute, orientation implementations + tests.
5. **UI layer**: render grid/HUD, responsive layout, animations.
6. **Input handlers**: keyboard navigation, touch/mouse selection, restart, settings.
7. **Accessibility**: ARIA live region, focus cycling, reduced motion.
8. **Persistence**: localStorage integration for settings/best scores.
9. **Polish**: sound toggles (if added later), game over dialogs, explanations (roadmap).
10. **Deploy**: configure GitHub Pages script, validate production build.

## 12. Risks & Mitigations
- **Emoji rendering differences**: test across major OS/browsers; avoid ambiguous glyphs.
- **Accessibility regressions**: add manual QA checklist; consider automated a11y scan.
- **Difficulty tuning**: expose configuration constants for quick iteration; gather user feedback.
- **Orientation rule complexity**: ensure CSS transforms align with attribute metadata to avoid confusion.

## 13. Future Enhancements
- Provide per-round explanations (“Why this was odd?”).
- Allow custom emoji sets uploaded by parents/teachers.
- Convert to PWA for offline resilience and “resume last game” capability.
- Add sound feedback with mute toggle and respect reduced-motion/audio-prefers-reduced.

