# ORRALI — Stability Release 1.1.1

An Expo / React Native language-learning app foundation for French and German (A1 starter content).

## What's New in 1.1.1
- **Bug 1 Fix**: Enforced mutual exclusion between `correctIds` and `wrongIds` in `LessonScreen.tsx` and `App.tsx`, guaranteeing consistent XP calculations and SRS card reviews.
- **Bug 2 Fix**: Speech playback lifecycle management via `Speech.stop()` to eliminate overlapping TTS audio across exercise transitions, unmounting, and early exit.
- **Automated Test Suite**: Added regression test suite (`npm test`) using Node's test runner and `tsx` (16 passing tests).
- **TypeScript Strictness**: Clean typecheck across all files (`npm run typecheck`).
- **PlantUML Documentation**: Added `docs/architecture.puml` and `docs/lesson-flow.puml`.

## Learning Features
- French and German independent courses.
- Home, Journey, and You/Profile bottom navigation tabs.
- Spaced Repetition System (SRS) using simplified SM-2 algorithm.
- Daily goal tracking (10, 20, 30 XP) with streak progression.
- Interactive exercises: multiple choice, listening comprehension, and typed translation.
- High-contrast, brand-aligned visual design (Midnight Purple, Champagne Gold, Ivory).

## Run Locally
```bash
# Install dependencies
npm ci

# Run automated tests
npm test

# Run TypeScript validation
npm run typecheck

# Start Expo development server
npx expo start
```
## Android APK Download
[![Build Android APK](https://github.com/AhmedRafique/ORRALI/actions/workflows/build-android.yml/badge.svg)](https://github.com/AhmedRafique/ORRALI/actions/workflows/build-android.yml)

The verified Android APK is generated via GitHub Actions and available for direct installation:
- **Direct Download:** [ORRALI-1.3.0.apk](https://github.com/AhmedRafique/ORRALI/releases/download/v1.3.0/ORRALI-1.3.0.apk)
- **Release Page:** [ORRALI v1.3.0 — Scaffolding & Smart Evaluation Release](https://github.com/AhmedRafique/ORRALI/releases/tag/v1.3.0)

### Installation Instructions
1. Download `ORRALI-1.3.0.apk` directly onto your Android device (e.g. Redmi Note 14 Pro+).
2. Tap the APK file to install (enable "Install unknown apps" if prompted).
3. Open ORRALI and start learning!

## Documentation & Artifacts
- `BUILD_STATUS.md`: Build readiness and status matrix.
- `TEST_REPORT.md`: Exhaustive test execution report.
- `RELEASE_NOTES.md`: Detailed changelog for version 1.1.1 and 1.1.0.
- `ROADMAP.md`: Project roadmap from 1.1.1 through 2.0.0.
- `docs/architecture.puml`: PlantUML component architecture diagram.
- `docs/lesson-flow.puml`: PlantUML lesson sequence and audio lifecycle diagram.
