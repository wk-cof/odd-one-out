# Odd One Out – Project Plan

## 1. Goals & Audience
- Deliver a browser-based emoji pattern-detection game suited for kids and families.
- Emphasize quick rounds, intuitive interactions, and gentle feedback loops.
- Support both casual play (Practice, Kid Mode) and competitive streak chasing (Endless).

## Progress Summary
- ✅ Scaffolded React + Emotion foundation with testing harness.
- ✅ Added curated emoji pools, attribute metadata, and validation tests.
- ✅ Implemented pure game engine with timers, scoring, and failure handling.
- ✅ Added rule generator covering category, attribute, and orientation puzzles.
- ✅ Assembled interactive React UI with HUD, board, keyboard navigation, and settings drawer.
- ✅ Layered in live ARIA announcements, focus management, and keyboard hotkeys for full accessibility.
- ✅ Persisted player settings and per-mode best scores via localStorage.

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
- Keep React components lean, focused, and reusable; avoid monolithic components.
- Encourage DRY patterns with shared utility hooks/components.
- Maintain a reliable automated test suite and ensure it passes after each milestone.

## 4. Technical Stack & Tooling
- Framework: Vite + React + TypeScript (functional components + hooks).
- Styling: Emotion CSS-in-JS (`@emotion/react`/`@emotion/styled`); may incorporate MUI components where helpful.
- State management: custom game state pure functions (`createRound`, `tick`, etc.) consumed via React context/hooks.
- Persistence: `localStorage` keys `ooo:lastSettings` and `ooo:bestScore:<mode>`.
- Build & deploy: Vite build, GitHub Pages via `vite` + `gh-pages`.
- Testing: Vitest + React Testing Library + jsdom environment; run suite between phases.
- Code quality: TypeScript types for game entities, prefer pure logic for rules; ESLint + Prettier integration.

## 5. Architecture Overview
- `src/main.tsx`: bootstrap React app with providers.
- `src/app/App.tsx`: root layout, routing between modes/screens.
- `src/styles/global.ts`: Emotion global styles, responsive layout, reduced-motion rules.
- `src/game/engine.ts`: configuration, round lifecycle, timers, scoring, streak tracking.
- `src/game/rules.ts`: rule evaluation (category, attribute, orientation) and odd-tile selection.
- `src/game/types.ts`: define `GameState`, `Tile`, `Rule`, `Settings`.
- `src/game/storage.ts`: save/load settings and best scores.
- `src/data/emojis.ts`: emoji pools by theme; attribute metadata for advanced rules.
- `src/components/`: reusable React components (Board, TileButton, Hud, Modals, SettingsPanel) kept focused and composable.
- `src/hooks/`: shared React hooks (useGameEngine, useKeyboardNavigation, usePersistentState).
- `src/a11y/aria.ts`: ARIA live region helpers and focus management utilities.
- `src/test/`: shared test utilities and component render helpers.

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
1. ✅ **Scaffold** Vite + React + TypeScript project with Emotion, MUI deps, ESLint/Prettier, Vitest/RTL setup; validate tests pass.
2. ✅ **Data setup**: implement emoji pools + attribute metadata with accompanying unit tests.
3. ✅ **Core engine**: build state types, round generator, scoring, timer logic with test coverage.
4. ✅ **Rules module**: finalize category, attribute, orientation rules + tests.
5. ✅ **UI foundation**: assemble reusable components (Board, Tile, HUD) with Emotion styles and snapshot/interaction tests.
6. ✅ **Settings & input handlers**: implement settings panel, keyboard/touch handlers, restart flow with integration tests.
7. ✅ **Accessibility pass**: ARIA live regions, focus management, reduced-motion adjustments; add targeted tests where feasible.
8. ✅ **Persistence**: integrate localStorage for settings/best scores with tests; confirm suite passes.
9. ✅ **Polish**: refine animations, responsiveness, add roadmap hooks (explanations placeholders); ensure clean component boundaries.
10. ✅ **Deploy**: configure GitHub Pages script, run full test/build pipeline, validate production output.

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
