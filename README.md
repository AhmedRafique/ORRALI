# ORRALI — The Master Store Edition (v5.4.0)

A high-performance, offline-first language learning application for French, German, and Spanish, built with React Native / Expo, TypeScript, SQLite relational persistence, and pre-rendered studio-quality neural audio.

## Key Features & Highlights
- **Complete European Triad (French 🇫🇷, German 🇩🇪, Spanish 🇪🇸):** 60 progressive units (360 phrases and sentences) spanning CEFR A1, A2, B1, and B2.
- **360 Pre-Rendered Studio-Quality Neural Audio Files:** Pitch-preserved dual-speed playback (Normal 🔊 1.0x and Slow Turtle 🐢 0.72x) with sub-millisecond offline response via `expo-audio`.
- **Authentic Speech Recognition & Sequence Scoring:** Real native speech recognition via `expo-speech-recognition` with sequence-aware token matching and confidence-building leniency.
- **Interactive Sentence Scramble (Word Tiles):** Reconstruct complex sentence word order with interactive tiles and backtrack support.
- **AI Companion & Semantic Roleplay:** Contextual AI Tutor, Smart Mistake Clinic with custom workouts, and multi-turn roleplay simulations with intent validation.
- **Offline SQLite & Android Google Drive Backup:** High-speed SQLite relational database (`orrali.db`) with Write-Ahead Logging (WAL) and automated Google Drive AppData restore.
- **60-Second Speed Recall Arcade:** High-energy vocabulary challenge against the clock with combo streaks and ranked XP rewards.
- **Tactile Haptics & Midnight OLED Dark Theme:** Sensory haptic pulses and velvet dark mode toggle with persistent storage.
- **CEFR Milestone Exams & Official Gold Diplomas:** 12-question synthesis exams awarding Gold Diplomas in the Trophy Shelf.
- **Tap-to-Inspect Sentence Anatomy:** Interactive word pills revealing isolated root meanings and grammatical roles.
- **Daily Word of the Day Micro-Spark:** Rotating cultural idioms with flip insights and daily +5 XP streak igniters.

## Android App Download & Store Deliverables
The verified Android deliverables are generated via GitHub Actions:
- **Direct APK Download:** [ORRALI-5.4.0.apk](https://github.com/AhmedRafique/ORRALI/releases/download/v5.4.0/ORRALI-5.4.0.apk)
- **Google Play App Bundle (.aab):** [ORRALI-5.4.0.aab](https://github.com/AhmedRafique/ORRALI/releases/download/v5.4.0/ORRALI-5.4.0.aab)
- **Release Page:** [ORRALI v5.4.0 — Production Hardened Edition](https://github.com/AhmedRafique/ORRALI/releases/tag/v5.4.0)

### Installation Instructions
1. Download `ORRALI-5.4.0.apk` directly onto your Android device (e.g. Redmi Note 14 Pro+).
2. Tap the APK file to install (enable "Install unknown apps" if prompted).
3. Open ORRALI and start learning!

## Documentation & Artifacts
- `BUILD_STATUS.md`: Build readiness and status matrix.
- `TEST_REPORT.md`: Comprehensive test report with 151 automated tests passing.
- `RELEASE_NOTES.md`: Changelog for all versions through 5.4.0.
- `ROADMAP.md`: Project roadmap and milestone completion log.
- `docs/architecture.puml`: PlantUML component architecture diagram.
- `docs/lesson-flow.puml`: PlantUML lesson sequence and audio lifecycle diagram.
