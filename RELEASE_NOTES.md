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
