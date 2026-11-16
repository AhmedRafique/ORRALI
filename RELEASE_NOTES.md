# ORRALI 1.7.0 — Pre-Rendered Native Studio Audio Release

## Summary
Milestone 1.7.0 completes Option 2 of the master roadmap: replacing on-device synthetic speech with 120 pre-rendered, high-definition studio neural audio recordings bundled directly inside the app. Every French and German phrase in the curriculum now plays with authentic human breathing, natural pitch cadence, and native liaisons with sub-millisecond start time and 100% offline support.

## What's New in 1.7.0
- **120 Bundled Native Studio Audio Recordings:**
  - Generated using Microsoft Azure Neural Studio voices (`fr-FR-VivienneMultilingualNeural` for French, `de-DE-TanjaNeural` for German).
  - All 60 French phrases and 60 German phrases across the 20 A1 units are pre-rendered into high-clarity 24kHz MP3 assets inside `assets/audio/`.
  - Zero latency: instant audio playback using `expo-audio` without reliance on phone-specific speech synthesizers.
  - Native French liaisons (*c'est délicieux*, *les toilettes*, *s'il vous plaît*) and German compound word cadences pronounced authentically.
  - Ultra-lightweight: entire studio audio catalog is only 1.4 MB total.
- **Dynamic Asset Mapping (`src/audioMap.ts`):**
  - Statically maps every curriculum item ID to its bundled audio asset.
  - Dual-mode fallback in `src/audio.ts`: plays the bundled studio audio first; seamlessly falls back to enhanced Google Neural TTS if an asset is not found.
- **Automated Verification:**
  - Clean TypeScript typecheck (`tsc --noEmit`) and 42 unit tests passing (`npm test`).

---

# ORRALI 1.6.0 — Learning World, Badges, Streak Shields & Stories Release

## Summary
Milestone 1.6.0 brings the ORRALI Learning World to life: introducing the collectible Trophy Shelf with achievement medals, automatic Streak Freeze Shield protection against missed days, and interactive Real-World Conversational Stories with native audio dialog and comprehension checks.
