# ORRALI 1.5.0 — Speaking Drills & Pronunciation Assessment Release

## Summary
Milestone 1.5.0 transforms ORRALI into an active speaking platform: introducing spoken pronunciation exercises (`'speak'`), microphone recording with Android `RECORD_AUDIO` permission, real-time pronunciation scoring, word-by-word visual feedback, and voice playback comparison.

## What's New in 1.5.0
- **Spoken Pronunciation Drills (`'speak'`):**
  - Integrated into the natural cognitive scaffolding ladder:
    `intro` (See & Hear) -> `choice` (Recognition) -> `listen` (Comprehension) -> `speak` (Pronunciation) -> `type` (Recall).
  - Learners can listen to the native neural pronunciation, tap the microphone to speak, and see their pronunciation evaluated immediately.
  - Includes a *"Can't speak right now? Skip"* option for quiet or public environments.
- **Pronunciation Assessment Engine (`src/scoring.ts`):**
  - Evaluates spoken rhythm, cadence, and phonetics against the target phrase.
  - Generates an overall percentage match (e.g. 94%, 82%).
  - Provides word-by-word visual breakdown:
    - **Green pills:** Words pronounced clearly and accurately.
    - **Amber pills:** Words that were slightly approximate or need minor polish.
    - **Red pills:** Words missed or unclear.
  - Supports comparing your pronunciation by tapping *"Hear yourself 🔊"* to play back your recording.
- **Microphone Permissions & Audio Recording (`expo-audio`):**
  - Configured Android `RECORD_AUDIO` permission in `app.json`.
  - Seamless permission request dialog with graceful fallback.
  - High-quality audio capture using `useAudioRecorder`.
- **Automated Verification:**
  - Expanded automated test suite to 34 unit tests (`npm test`) covering speech scoring, word extraction, cadence evaluation, and scaffolding with 0 TypeScript diagnostics (`tsc --noEmit`).

---

# ORRALI 1.4.0 — Complete A1 Curriculum & Grammar Capsules Release

## Summary
Milestone 1.4.0 delivers the full CEFR A1 curriculum for French and German across 20 comprehensive thematic units (120 vocabulary items and sentences), complete with embedded Grammar Capsules, visual rule cards, phonetic guides, and cultural usage notes.
