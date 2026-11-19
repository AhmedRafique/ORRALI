# ORRALI 8.0.0 — The Living Immersion

## Summary
The landmark 8.0.0 milestone converges visual, emotional, and comprehensive language education into an alive personal ecosystem.

## What's New
- **CEFR C1 Advanced Fluency Tier:** Sarcasm, cultural irony, philosophical debate, and literary analysis across French, German, and Spanish with the official C1 Milestone Exam and Gold Diploma (+75 XP).
- **Interactive 2D World Map:** Spatial memory UI replacing linear lesson lists with pan-and-zoom city districts (The Café, Train Station, City Center, Cultural Quarter, Tech Campus, University) with real-world 4-phase day/night lighting cycles.
- **Visual Personas & Dynamic Emotion Engine:** 9 European Triad characters with glowing chromatic mood rings and performance-driven facial reactions (happy on success, impressed on streaks, encouraging on grammar slips, confused on gibberish).
- **Generative Emotional TTS:** Mood-aware prosody synthesis modulating speech rate and pitch for surprised curveballs, warm greetings, and authoritative announcements with bulletproof offline device TTS fallback.
- **Video Immersion Lounge:** Native cultural video clips with interactive tap-to-pause bilingual subtitles, instant tap-to-save phrasebook integration, and global community cooperative goals.
- **Exhaustive Curriculum Completeness:** Modular data architecture (`src/content/`) with zero grammatical or lexical gaps across A1, A2, B1, B2, and C1.

---

# ORRALI 7.5.0 — Video Immersion Lounge & Cooperative Goals
- Contextual native video clips across culinary, cultural, and transit themes.
- Interactive bilingual subtitles with word-by-word inspector and auto-pause.
- Cooperative global community goals (e.g. collective 10,000 Parisian coffees ordered).

---

# ORRALI 7.4.0 — Generative Emotional TTS
- Dynamic prosody shaping for European Triad character personas.
- Mood-aware inflections (`surprised_curveball`, `warm_greeting`, `encouraging_correction`, `authoritative`, `celebratory`).
- Offline-first device TTS fallback.

---

# ORRALI 7.3.0 — Interactive 2D World Map
- Spatial memory navigation across 6 European Triad city districts.
- 4-phase real-world day/night lighting cycles (Dawn, Day, Twilight, Midnight OLED).

---

# ORRALI 7.2.0 — Visual Personas & Dynamic Emotion Engine
- 2D animated character portraits with glowing chromatic mood rings.
- European Triad character roster with progressive relationship tiers.

---

# ORRALI 7.1.0 — CEFR Exhaustive Completeness
- Modular content data layer restructuring into `src/content/`.
- Symmetrical European Triad Unit 21 expansion across French, German, and Spanish.

---

# ORRALI 7.0.0 — Beyond the Familiar

## Summary
The 7.0.0 ecosystem release establishes a relational repository layer and advances the app's architecture for reliable data access and synchronization.

## What's New
- **Relational Repository Layer:** Added a repository abstraction over the app's persistence model, with focused tests.
- **Learning Ecosystem:** Builds on the 6.4.0–6.9.0 learning intelligence, real-life missions, writing, listening, coaching, learning-world, and offline-pack releases.

---

# ORRALI 6.9.0 — Supporting Ecosystem & Offline Packs
- Daily Briefing, Smart Review Queue, and Survival Mode.
- False Friends Trainer and downloadable offline pack management.

---

# ORRALI 6.8.0 — Learning World & Living Characters
- Illustrated 2D world exploration.
- Recurring character personas and narrative continuity across missions.

---

# ORRALI 6.7.0 — Personal AI Coach & Smart Phrasebook
- Contextual conversational memory and a multi-mode personal tutor.
- Saved phrases across activities and Grammar Radar.

---

# ORRALI 6.6.0 — Speak Naturally & Listening World
- Visual pronunciation skill maps for French, German, and Spanish.
- Acoustic cadence and intonation metrics with a progressive audio library.

---

# ORRALI 6.5.0 — Writing Lab & Pedagogical Correction Engine
- Interactive writing challenges with an eight-point correction debrief.
- Deterministic grammar scanners for French, German, and Spanish.

---

# ORRALI 6.4.0 — Learning Intelligence Foundation
- Standardized learning events and a learner knowledge model that separates mastery from confidence.
- Explainable recommendations and dynamically generated Quick, Balanced, and Deep sessions.
- Real-life mission framework with communicative intent validation and multi-metric scoring.

---

# ORRALI 6.3.0 — Core Reliability Edition (Full System Audit & Correctness Certified)

## Summary
Milestone 6.3.0 is ORRALI's landmark reliability release, resolving all architectural and pedagogical findings from independent static audits and adversarial stress tests. It rebuilds the CEFR placement engine around authentic curriculum metadata, implements full intent validation across all conversational roleplay scenarios and turns, resolves dual-storage race conditions with timestamp reconciliation, and integrates real historical attempt data from SQLite into the Mistake Clinic.

## What's New in 6.3.0
- **Authentic CEFR Placement Mapping (`src/placement.ts` & `src/screens/PlacementTestModal.tsx`):**
  - Rebuilt question pools and lesson unlocks around authentic `lesson.level` metadata rather than fixed index offsets.
  - Dynamically unlocks 10 units for A2 and 12 units for B1 in French and German, and 8 units for A2 and 12 units for B1 in Spanish.
  - Requires explicit passing evidence across all prerequisite tiers and B2 questions before awarding B2 certification.
- **Complete Roleplay Intent Validation (`src/companion/roleplay.ts` & `src/screens/RoleplayModal.tsx`):**
  - Implemented strict semantic keyword and communicative objective validation for every turn across all 5 scenarios (Paris Café, Paris Hotel, Munich Station, Munich Bakery, Madrid Tapas).
  - Fixed Spanish completion message bug that previously identified all non-French conversations as German.
- **Dual-Storage Timestamp Reconciliation (`src/store.ts`):**
  - Added internal `_savedAt` timestamps to serialized progress payloads.
  - `loadProgress()` reads both SQLite and AsyncStorage, compares timestamps, loads the newer record, and heals the lagging store automatically.
- **SQLite Historical Attempt Tracking for Mistake Clinic (`src/db.ts` & `src/screens/MistakeClinicModal.tsx`):**
  - Added `getItemAttemptStatsFromDb()` querying real lifetime pass/fail counts from the relational `exercise_attempts` table.
- **Speech Recognition Settlement Window (`src/screens/ShadowStudioModal.tsx`):**
  - Added a 350ms settlement window and `latestTranscriptRef` to eliminate timing race conditions on recognition stop.
- **Honest Local Checkpoint Labeling (`src/screens/ProfileScreen.tsx`):**
  - Clarified UI to accurately represent local SQLite WAL checkpoints with AsyncStorage mirroring.
- **TDD Quality Score:**
  - **208 automated unit tests passing** (`npm test`) across all 88 test suites with **0 TypeScript errors** (`tsc --noEmit`).

---

# ORRALI 6.2.0 — Adaptive CEFR Placement Test Edition
- Dynamic multi-tier placement test allowing experienced learners to test out of elementary units.
- Auto-completes prerequisite chapters, sets mature SM-2 intervals (21 days), and awards retroactive Gold Diplomas and XP bounties.

---

# ORRALI 6.1.0 — Café Library Reading Lounge Edition
- Continuous multi-paragraph cultural stories in Paris, Munich, and Madrid.
- Tap-to-inspect anatomy popovers with chromatic gender badges and neural audiobook read-aloud.
- Cultural comprehension certification quiz awarding +20 XP.

---

# ORRALI 6.0.0 — Shadowing Studio Mimicry Engine Edition
- Side-by-side native listening, microphone recording, acoustic cadence matching, and instant feedback pills.
- Clean native microphone and speech recognition lifecycle management.

---

# ORRALI 5.9.0 — The Verb Gym Edition
- Slot-machine rapid conjugation drills across present and past tenses for French, German, and Spanish.
- Form input evaluation ignoring case, whitespace, and punctuation.

---

# ORRALI 5.8.0 — 3-Minute Express Review Edition
- 90-second swipe-based fast-track review to quickly clear 5 urgently due cards and save daily streaks.
- Contextual Home screen widget appearing dynamically when reviews are due.

---

# ORRALI 5.7.0 — Radio Lab Audio Dictation Edition
- Native connected speech dictation, cloze target blank generation, and distractor bank assembly.
- Acoustic liaison (/z/, /t/), German contraction, and Spanish sinalefa analysis.

---

# ORRALI 5.6.0 — Visual Chromatic Gender Immersion Edition
- Subconscious color-coding: Cobalt Blue ♂ (Masc), Rose Crimson ♀ (Fem), Sage Emerald ⚲ (Neut) across Word Tiles, Anatomy Pills, and Lexicon.
- Elided French noun gender resolution (l'addition, l'eau, l'hôtel).

---

# ORRALI 5.5.0 — Hands-Free Commuter Audio Edition
- Pimsleur-style English prompt -> thinking pause -> normal speed (1.0x) -> slow phonetic repeat (0.72x) audio loop.
- One-handed walking player UI with large touch controls.

---

# ORRALI 5.4.0 — Production Hardened Edition
- Fixed cloud sync checksums, roleplay intent checking, sequence-aware pronunciation alignment, clinic workout preservation, Spanish tutor knowledge, theme persistence, and audio resource cleanup.

---

# ORRALI 5.3.0 — The All-Stars Master Edition
- Dual-speed audio (Normal 🔊 & Turtle 🐢), CEFR Milestone Exams & Diplomas, Sentence Anatomy, Daily Word of the Day.
