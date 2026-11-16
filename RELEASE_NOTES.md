# ORRALI 4.1.0 — Real Speech Recognition & Anti-Gibberish Pronunciation Engine

## Summary
Milestone 4.1.0 eliminates simulated pronunciation evaluation and delivers authentic, real-time native speech recognition on Android and iOS using `expo-speech-recognition`. Speaking gibberish, speaking in the wrong language, or producing unintelligible sounds is now strictly detected and rejected with accurate, constructive feedback and real word-by-word visual matching.

## What's Fixed & Upgraded in 4.1.0
- **Real Speech Recognition Integration (`expo-speech-recognition`):**
  - Integrated native Android `SpeechRecognizer` and iOS speech recognition engine directly into `LessonScreen.tsx`.
  - Speech recognition executes in the target language (`fr-FR`, `de-DE`, `es-ES`) simultaneously with native audio recording.
  - Live transcript is captured and displayed directly on the score card (*Recognized: "..."*).
- **Anti-Gibberish & Wrong-Language Rejection Engine (`src/scoring.ts`):**
  - **Zero Fake Passes:** Removed the timing-based simulation fallback that previously awarded ~88% passing scores on unverified recordings.
  - **Strict Levenshtein Similarity:** Compares each spoken word against the target phrase after diacritic stripping and normalization.
  - **Wrong Language Detection:** Speaking English in a French/German/Spanish drill results in an immediate failing score (< 40%) with explicit guidance: *"Unrecognized speech or wrong language. Speak the phrase in the target language."*
  - **Empty/Mumbled Speech:** Fails with a 25% score and prompts the learner to speak clearly into their microphone.
- **TDD Verification:**
  - Added dedicated unit test suite `src/__tests__/real-speech.test.ts` verifying rejection of gibberish, rejection of wrong languages, rejection of empty speech, and acceptance of authentic native pronunciation.
  - **93 automated unit tests passing** (`npm test`) across all 31 test suites with **0 TypeScript errors** (`tsc --noEmit`).

---

# ORRALI 4.0.0 — The Ultimate Global Release (Spanish Expansion, Speech Lab & Immersion Engine)

## Summary
Milestone 4.0.0 introduced close, plausible multiple-choice distractors, launched the Spanish course (Español 🇪🇸), added B2 dialog stories, and implemented the Live Speech Lab waveform visualizer.
