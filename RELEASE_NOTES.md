# ORRALI 2.1.0 — CEFR A2 & B1 Intermediate Curriculum Expansion Release

## Summary
Milestone 2.1.0 expands ORRALI into CEFR A2 (Elementary) and B1 (Intermediate Threshold) fluency: adding 10 new progressive units across French and German (60 new vocabulary items, sentences, and grammar capsules). Total curriculum now spans 30 units and 180 phrases, each with pre-rendered studio neural audio, interactive grammar capsules, and phonetic guides.

## What's New in 2.1.0
- **CEFR A2 & B1 French Expansion (Units 11 to 15):**
  - Unit 11 (A2): *Raconter le Passé* (The Past: Passé Composé with avoir & être)
  - Unit 12 (A2): *Projets & Futur* (Future Plans: Futur Proche & Futur Simple)
  - Unit 13 (B1): *Exprimer son Opinion* (Opinions & Nuanced Perspective: Penser que & À mon avis)
  - Unit 14 (B1): *Hypothèses & Conditions* (Hypotheticals with Conditionnel & Si-clauses)
  - Unit 15 (B1): *Doutes, Souhaits & Subjonctif* (Wishes, Necessity & Subjunctive Mood)
- **CEFR A2 & B1 German Expansion (Units 11 to 15):**
  - Unit 11 (A2): *Vergangenes erzählen* (The Conversational Past: Das Perfekt with haben & sein)
  - Unit 12 (A2): *Zukunft & Pläne* (Future Plans & Goals with 'werden')
  - Unit 13 (B1): *Meinung & Argumentation* (Subordinate Clauses & Word Order with weil/dass)
  - Unit 14 (B1): *Wünsche & Konjunktiv II* (Hypotheticals & Polite Requests with hätte/wäre/würde)
  - Unit 15 (B1): *Bedingungen & Zweifel* (Concessive Clauses & Complex Conditions with obwohl & wenn)
- **180 Bundled Studio Neural Audio Files:**
  - Generated 60 new 24kHz studio MP3 recordings (`fr-11-1` to `fr-15-6` and `de-11-1` to `de-15-6`).
  - Total bundled studio MP3 recordings in `assets/audio/` now stands at 180 files.
  - Zero latency, 100% offline playback via `expo-audio`.
- **TDD Quality Verification:**
  - Expanded test suite to **62 automated unit tests** (`npm test`) covering intermediate grammar, tense evaluations, and curriculum integrity with **0 TypeScript errors** (`tsc --noEmit`).

---

# ORRALI 2.0.0 — The AI Learning Companion & Roleplay Release

## Summary
Milestone 2.0.0 marks the launch of ORRALI's AI Learning Companion era, built using rigorous Test-Driven Development (TDD). It introduces the Smart Mistake Clinic to diagnose SQLite error patterns and generate custom remedial workouts, interactive multi-turn Conversational AI Roleplay with in-character native dialogue, and the "Ask ORRALI" AI contextual tutor explaining complex grammar in child-friendly terms.
