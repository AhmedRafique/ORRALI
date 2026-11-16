# ORRALI 5.0.0 — The Ultimate Store Edition (Complete European Triad, Scramble Drills & Google Play Bundle)

## Summary
Milestone 5.0.0 is the crowning Store-Ready release of ORRALI, tested and validated under strict Test-Driven Development (TDD). It achieves full symmetry across the European Triad (French, German, and Spanish all spanning A1 to B2 across 60 chapters and 360 studio MP3s), introduces interactive Sentence Scramble (Word Tiles) drills, and adds automated Google Play Android App Bundle (`.aab`) packaging alongside the standalone release APK (`.apk`).

## What's New in 5.0.0
- **Complete European Triad Symmetry (French 🇫🇷, German 🇩🇪, Spanish 🇪🇸):**
  - Spanish expanded to full 20 progressive units (120 phrases & sentences) covering A1, A2, B1, and B2:
    - *Planes & Futuro* (A2)
    - *Comparaciones & Preferencias* (A2)
    - *Opiniones & Argumentación* (B1)
    - *Condicional & Hipótesis* (B1)
    - *Deseos & El Subjuntivo* (B1)
    - *Entrevista de Trabajo & Carrera* (B2)
    - *Negociaciones & Contratos* (B2)
    - *Sociedad & Medio Ambiente* (B2)
    - *Modismos & Refranes Auténticos* (B2)
    - *Matices Avanzados & Subjuntivo* (B2)
- **Interactive Sentence Scramble (Word Tiles) Drills (`src/exercises.ts` & `LessonScreen.tsx`):**
  - New cognitive assembly drill added to the scaffolding ladder: `intro` -> `choice` -> `scramble` -> `listen` -> `speak` -> `type`.
  - Scrambles sentences into interactive word tiles that learners tap in grammatical sequence.
  - Supports tapping placed tiles to undo/backtrack.
- **Google Play Store Android App Bundle (`.aab`) Packaging:**
  - Automated CI/CD workflow compiles both:
    - **Standalone Release APK (`ORRALI-5.0.0.apk`)** for direct phone installation.
    - **Google Play App Bundle (`ORRALI-5.0.0.aab`)** for Google Play Store publishing.
- **360 Bundled Studio Neural Audio Files:**
  - Full catalog of 360 pre-rendered 24kHz studio MP3 recordings in `assets/audio/` (100% offline, zero latency).
- **TDD Quality Assurance:**
  - **104 automated unit tests passing** (`npm test`) across all 36 test suites with **0 TypeScript errors** (`tsc --noEmit`).

---

# ORRALI 4.1.0 — Real Speech Recognition & Anti-Gibberish Pronunciation Engine

## Summary
Milestone 4.1.0 eliminated simulated pronunciation evaluation and delivered authentic native speech recognition on Android and iOS using `expo-speech-recognition`.
