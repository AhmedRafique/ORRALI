# ORRALI 1.1.1 — Stability Release

## Summary
Milestone 1.1.1 resolves the critical correctness defects identified during the codebase audit, guarantees answer-state mutual exclusion, fixes speech playback lifecycle issues, provides automated regression testing, and confirms full TypeScript typecheck clearance.

## Fixed
- **Bug 1: Conflicting Correct and Incorrect Answer Records:**
  - `LessonScreen.tsx` now enforces strict mutual exclusion between `correctIds` and `wrongIds`:
    - Marking an answer correct adds the item to `correctIds` and immediately removes it from `wrongIds`.
    - Marking an answer incorrect adds the item to `wrongIds` and immediately removes it from `correctIds`.
  - `App.tsx` finish callback applies disjoint filtering to guarantee consistent XP calculations (`earnedXp = finalCorrectIds.length * 5`) and accurate SM-2 spaced repetition (SRS) card review decisions.
- **Bug 2: Speech Playback Lifecycle & Audio Overlap:**
  - `LessonScreen.tsx` now calls `Speech.stop()` prior to triggering any new TTS utterance to cancel ongoing playback.
  - Added `useEffect` unmount cleanup to halt audio when exiting a lesson or unmounting the screen.
  - Added exercise transition hook to stop speech immediately when advancing to the next phrase.
  - Bound close button ("×") to an explicit `handleExit` handler that halts playback before returning to the dashboard.

## Added
- **Automated Unit & Regression Suite (`src/__tests__/lesson-logic.test.ts`):**
  - Added 16 automated tests covering:
    - Answer state transitions (wrong-then-right, right-then-wrong, multi-item).
    - Text normalization (`norm`) handling case, accents, punctuation, and apostrophes.
    - SM-2 spaced repetition algorithm (`newCard`, `review`, `isDue`).
    - Streak calculations and daily XP resets (`touchStreak`, `emptyProgress`).
    - Content integrity across French and German courses.
  - Added `npm test` script using `tsx --test`.
- **PlantUML Architecture Documentation (`docs/`):**
  - `docs/architecture.puml`: High-level system architecture and component diagram.
  - `docs/lesson-flow.puml`: Sequence diagram detailing lesson flow, speech lifecycle, and answer reconciliation.

## Validation
- **Dependencies:** Successfully installed and audited via `npm ci` (461 packages).
- **TypeScript Typecheck:** `npm run typecheck` (`tsc --noEmit`) passes with 0 errors.
- **Unit Tests:** `npm test` passes with 16/16 tests successful.
- **Expo Configuration:** Validated using `npx expo config --type public`.
- **EAS Build Status:** Cloud APK generation configured in `eas.json` (`preview` profile), ready for execution upon authenticating via `npx eas-cli login`.

---

# ORRALI 1.1.0 — Foundation Sprint 02

## New
- Added a bottom navigation structure: Home, Journey, and You.
- Added a Journey dashboard with XP, streak, lesson completion, practiced-card, and course progress summaries.
- Added a You/Profile screen with persistent learning-language and daily-goal preferences.
- Persisted selected language independently using AsyncStorage.
- Replaced the generic app icon artwork with an ORRALI monogram-based icon draft.
- Updated Android application ID to `com.orrali.app` and app version to `1.1.0`.

## Retained
- French and German A1 starter lessons.
- Lesson exercises, answer feedback, speech playback, XP, streak, and basic review scheduling.
- Local progress persistence and migration read from the previous Lingo key.

## Validation
- TypeScript/TSX transpilation syntax check: passed for 11 source files (0 syntax diagnostics).
- JSON parse checks: passed for `package.json`, `package-lock.json`, and `app.json`.
- Full TypeScript typecheck: not completed because dependencies are not installed.
- Android APK build: not completed. `npm ci` timed out on two attempts; this environment also has no configured Android SDK/Gradle or authenticated EAS build session.

## Known limitations
- This is not a production-ready release.
- Pronunciation scoring and speech-to-text are not implemented; TTS playback remains available.
- A complete CEFR curriculum, SQLite data layer, adaptive learning, stories, and AI companion remain future work.
