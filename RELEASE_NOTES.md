# ORRALI 3.0.0 — The Master Release (Lexicon, Sensory Polish & B2 Professional Expansion)

## Summary
Milestone 3.0.0 represents ORRALI's crowning release, uniting all three strategic horizons under strict Test-Driven Development (TDD): the Smart Lexicon & Searchable Dictionary with rapid-fire Flashcard Flip drills, Sensory Polish with tactile haptics (`expo-haptics`) and Midnight OLED Dark Mode, and the complete CEFR B2 Upper-Intermediate & Professional Fluency expansion (40 total units, 240 phrases, and 240 pre-rendered studio neural MP3 recordings).

## What's New in 3.0.0
- **Smart Lexicon & Searchable Dictionary (`src/lexicon.ts` & `LexiconModal.tsx`):**
  - Instant search across all 240 vocabulary words and phrases in French, German, English, and phonetics with accent leniency.
  - Spaced Repetition Mastery filter chips:
    - 🌟 **Mastered (21+ days):** Long-term retained vocabulary.
    - ⏳ **In Progress:** Actively scheduled SM-2 review cards.
    - ⚠️ **Stumbles (Lapses):** Error-prone items flagged by the Mistake Clinic.
    - 🌱 **New:** Unpracticed curriculum phrases.
  - Instant studio neural audio pronunciation on every word entry.
  - **Flashcard Flip Drill Mode (🎴):** Interactive card flip mode to test your memory anytime, anywhere.
- **Sensory Polish, Haptics & Midnight Dark Mode (`src/sensory.ts` & `src/theme.ts`):**
  - **Tactile Haptic Feedback (`expo-haptics`):** Delightful tactile pulses on correct answers (success), typos (error), recording start (light), and card flips (selection).
  - **Midnight Dark Mode (OLED):** Elegant velvet-dark night theme toggle in Profile settings to protect learners' eyes during late-night practice.
- **CEFR B2 Upper-Intermediate & Professional Expansion (`src/content.ts`):**
  - Added 10 new advanced units (5 French, 5 German):
    - *Entretien d'Embauche & Carrière* / *Bewerbungsgespräch & Karriere* (Professional interviews)
    - *Négociations & Affaires* / *Verhandlungen & Wirtschaft* (Business contracts, passive voice)
    - *Débats de Société & Environnement* / *Gesellschaft & Nachhaltigkeit* (Civic debates, concession)
    - *Expressions Idiomatiques & Familier* / *Redewendungen & Umgangssprache* (Authentic colloquial idioms)
    - *Nuances Avancées & Subjonctif Passé* / *Stilistik & Konjunktiv I* (Reported speech, advanced stylistics)
- **240 Bundled Studio Neural Audio Recordings:**
  - Full catalog of 240 pre-rendered 24kHz studio MP3 recordings in `assets/audio/`.
  - Sub-millisecond instant playback, zero network reliance, 100% offline.
- **Exhaustive TDD Quality Assurance:**
  - **76 automated unit tests passing** (`npm test`) across all 24 test suites with **0 TypeScript errors** (`tsc --noEmit`).

---

# ORRALI 2.1.0 — CEFR A2 & B1 Intermediate Curriculum Expansion Release

## Summary
Milestone 2.1.0 expands ORRALI into CEFR A2 (Elementary) and B1 (Intermediate Threshold) fluency: adding 10 new progressive units across French and German.
