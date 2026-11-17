# ORRALI 5.1.0 — Acoustic Harmony, Anti-Trapping Speech & Pedagogical Leniency

## Summary
Milestone 5.1.0 resolves the speech alignment and screen trapping bug reported by real-device testing, implements confidence-building pedagogical leniency with fuzzy word alignment, introduces acoustic earcons & sound chimes (`chime_success`, `chime_error`, and `chime_fanfare`), and ensures learners are never stuck or blocked.

## What's New & Fixed in 5.1.0
- **Fuzzy Token Alignment & Anti-Index Shift Bug Fix (`src/scoring.ts`):**
  - Resolved the rigid 1-to-1 index alignment bug where contraction splits (e.g. French *"S'il"* recognized as *"s il"*) caused downstream words to compare against the wrong index and collapse scores to 50–60%.
  - Added best-match fuzzy token alignment with compound contraction matching.
- **Pedagogical Confidence-Building Leniency (Pass at ≥ 50%):**
  - If the speech recognizer catches and understands your words (score ≥ 50%), you are granted a pass with constructive, encouraging guidance:
    > *"Understood! Good effort — tap the audio button to polish your accent."*
- **Complete Elimination of Screen Trapping in Speaking Drills (`LessonScreen.tsx`):**
  - The **"Skip"** button remains visible and accessible at all times.
  - After recording, if a drill is not passed, learners are given TWO clear actions:
    1. Secondary: **"🎙️ Try Again to Improve Score"**
    2. Primary: **"Continue Anyway ›"**
  - Learners are never trapped on a screen again.
- **Acoustic Earcons & Melodic Sound Chimes (`src/earcons.ts`):**
  - **Success Chime (`chime_success.wav`):** Uplifting, two-tone rising harmonic bell (E5 -> B5) on correct answers.
  - **Error Notice (`chime_error.wav`):** Gentle, muted minor harmonic note (G4 -> E4) on typos and incorrect attempts.
  - **Chapter Victory Fanfare (`chime_fanfare.wav`):** Ascending major arpeggio fanfare (C5 -> E5 -> G5 -> C6) upon completing a chapter.
- **TDD Quality Score:**
  - **109 automated unit tests passing** (`npm test`) across all 37 test suites with **0 TypeScript errors** (`tsc --noEmit`).

---

# ORRALI 5.0.0 — The Ultimate Store Edition (Complete European Triad, Scramble Drills & Google Play Bundle)

## Summary
Milestone 5.0.0 achieved full symmetry across the European Triad (French, German, and Spanish all spanning A1 to B2 across 60 chapters and 360 studio MP3s), introduced Sentence Scramble drills, and added automated Google Play Android App Bundle (`.aab`) packaging.
