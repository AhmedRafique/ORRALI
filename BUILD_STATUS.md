# Build status — ORRALI 1.3.1 (Resumption & Checkpointing)

| Check | Result |
|---|---|
| Dependencies Installation | PASS — 464 packages installed and verified via `npm ci` |
| TypeScript syntax transpilation | PASS — zero syntax diagnostics |
| JSON configuration parsing | PASS — `app.json`, `package.json`, `eas.json` valid |
| Full TypeScript typecheck | PASS — `tsc --noEmit` 0 errors |
| Automated Unit & Logic Tests | PASS — 30 passing tests across checkpointing, smart evaluation, scaffolding, SRS, normalization, streak, and content integrity |
| Expo configuration validation | PASS — SDK 58.0.0 public config validated |
| In-Progress Checkpointing & Resumption | **PASS — Checkpoints auto-saved mid-lesson with 'Continue' vs 'Start Over' prompt** |
| Child-to-Fluency Scaffolding | **PASS — 'intro' card presentation -> 'choice' recognition -> 'listen' -> 'type' production** |
| Smart Answer Evaluation | **PASS — Accepts formal & informal variants, forgives missing accents, and tolerates minor typos** |
| High-Definition Neural Voice Ranking | **PASS — Android Google Neural / WaveNet / Enhanced voice prioritization** |
| Studio Audio Engine | **PASS — `expo-audio` integration for native human audio with neural TTS fallback** |
| SQLite Engine Integration | **PASS — `expo-sqlite` integrated with `progress_store` and `exercise_attempts`** |
| Dual-Layer Persistence | **PASS — SQLite primary + AsyncStorage backup with R8 ProGuard keep rules** |
| Native TTS Voice Selection | **PASS — ISO-639-1 language resolution + dynamic native voice binding** |
| Standalone Offline Bundle Packaging | **PASS — `index.android.bundle` embedded in release APK assets** |
| Android Hardware Back Press | **PASS — Intercepted via `BackHandler` with exit confirmation** |
| Android Keyboard Usability | **PASS — Wrapped in `KeyboardAvoidingView` and `ScrollView`** |
| GitHub Actions CI/CD Pipeline | PASS — Automated build & release workflow in `.github/workflows/build-android.yml` |
| Android APK Generation | **SUCCESS (1.3.1 Standalone Release APK)** |

---

## Direct APK Download Links

- **GitHub Release (v1.3.1):** [ORRALI v1.3.1 — In-Progress Lesson Resumption & Checkpointing](https://github.com/AhmedRafique/ORRALI/releases/tag/v1.3.1)
- **Direct APK Download:** [ORRALI-1.3.1.apk](https://github.com/AhmedRafique/ORRALI/releases/download/v1.3.1/ORRALI-1.3.1.apk)
- **CI Build Workflow:** [GitHub Actions Build Android APK](https://github.com/AhmedRafique/ORRALI/actions/workflows/build-android.yml)

---

## Device Installation (Redmi Note 14 Pro+ / Android)
1. Download `ORRALI-1.3.1.apk` directly to your phone via browser or transfer via USB.
2. Tap the downloaded APK to install (uninstall any previous version if prompted).
3. Launch **ORRALI** — start a lesson, leave at step 5, tap the lesson again to see the resume prompt, and pick up right where you left off!
