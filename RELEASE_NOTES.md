# ORRALI 4.0.0 — The Ultimate Global Release (Spanish Expansion, Speech Lab & Immersion Engine)

## Summary
Milestone 4.0.0 is ORRALI's monumental Global Edition, developed under rigorous Test-Driven Development (TDD). It introduces close, plausible multiple-choice distractors for genuine pedagogical challenge, launches the complete Spanish course (Español 🇪🇸) with 60 neural studio phrases and Madrid tapas roleplay, expands immersion with B2 professional dialog stories, adds the Live Acoustic Waveform Speech Lab visualizer, and implements the Smart Streak & Shield Protection Notification Scheduler.

## What's New in 4.0.0
- **Pedagogical Close-Distractor Engine (`src/exercises.ts`):**
  - Upgraded multiple-choice option generation to select close, plausible distractors from the *same chapter* and *same CEFR level* with matching phrase complexity and length.
  - No more easy guesses! E.g. for numbers ("one, two, three"), choices test against other numbers ("Eins, zwei, drei" vs "Zehn, zwanzig, dreißig" vs "Vier, fünf, sechs").
- **Spanish Language World Launch (Español 🇪🇸):**
  - Complete 10-unit curriculum spanning A1 & A2 (60 vocabulary items & sentences).
  - Pre-rendered 24kHz studio neural audio using Azure Neural voice (`es-ES-ElviraNeural`).
  - Interactive Spanish Grammar Capsules (*Tú vs Usted*, *Ser vs Estar*, *El Verbo Gustar*, *Pretérito Indefinido*).
  - Authentic Madrid Tapas Bar Conversational Roleplay (*Tapas en la Taberna Madrileña*).
  - Madrid Market Dialog Story (*En el Mercado de San Miguel*).
- **Deep Immersion & Advanced B2 Dialog Stories (`src/content.ts`):**
  - French B2 Story: *L'Entretien d'Embauche à La Défense* (Paris executive software leadership interview).
  - German B2 Story: *Die Wohnungsbesichtigung in München* (Schwabing apartment lease inspection and negotiation).
- **Real-Time Acoustic Waveform & Speech Lab (`src/screens/LessonScreen.tsx` & `src/scoring.ts`):**
  - Live animated pulsating audio waveform during voice recording.
  - Real-time cadence matching evaluating speech rhythm envelope and phoneme delivery.
- **Smart Streak & Shield Protection Scheduler (`src/notifications.ts`):**
  - Calculates automated offline-safe evening reminders when learner streaks or Streak Freeze Shields are at risk.
- **300 Bundled Studio Neural Audio Files:**
  - Expanded native audio asset catalog to 300 studio MP3 files in `assets/audio/` (100% offline, zero latency).
- **TDD Quality Assurance:**
  - **88 automated unit tests passing** (`npm test`) across all 30 test suites with **0 TypeScript errors** (`tsc --noEmit`).

---

# ORRALI 3.0.0 — The Master Release (Lexicon, Sensory Polish & B2 Professional Expansion)

## Summary
Milestone 3.0.0 introduced the Smart Lexicon with Flashcard Flip drills, Sensory Polish with tactile haptics (`expo-haptics`) and Midnight OLED Dark Mode, and the complete CEFR B2 Upper-Intermediate & Professional Fluency expansion.
