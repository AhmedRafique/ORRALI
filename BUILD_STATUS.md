# Build status — ORRALI 1.2.0 (Learning Engine Release)

| Check | Result |
|---|---|
| Dependencies Installation | PASS — 463 packages installed and verified via `npm ci` |
| TypeScript syntax transpilation | PASS — zero syntax diagnostics |
| JSON configuration parsing | PASS — `app.json`, `package.json`, `eas.json` valid |
| Full TypeScript typecheck | PASS — `tsc --noEmit` 0 errors |
| Automated Unit & Logic Tests | PASS — 18 passing tests across SRS (with lapses), lesson state, normalization, streak, and content integrity |
| Expo configuration validation | PASS — SDK 58.0.0 public config validated |
| SQLite Engine Integration | **PASS — `expo-sqlite` integrated with `progress_store` and `exercise_attempts`** |
| Dual-Layer Persistence | **PASS — SQLite primary + AsyncStorage backup with R8 ProGuard keep rules** |
| Native TTS Voice Selection | **PASS — ISO-639-1 language resolution + dynamic native voice binding** |
| Standalone Offline Bundle Packaging | **PASS — `index.android.bundle` embedded in release APK assets** |
| Android Hardware Back Press | **PASS — Intercepted via `BackHandler` with exit confirmation** |
| Android Keyboard Usability | **PASS — Wrapped in `KeyboardAvoidingView` and `ScrollView`** |
| GitHub Actions CI/CD Pipeline | PASS — Automated build & release workflow in `.github/workflows/build-android.yml` |
| Android APK Generation | **SUCCESS (1.2.0 Standalone Release APK)** |

---

## Direct APK Download Links

- **GitHub Release (v1.2.0):** [ORRALI v1.2.0 — Learning Engine & Persistence Release](https://github.com/AhmedRafique/ORRALI/releases/tag/v1.2.0)
- **Direct APK Download:** [ORRALI-1.2.0.apk](https://github.com/AhmedRafique/ORRALI/releases/download/v1.2.0/ORRALI-1.2.0.apk)
- **CI Build Workflow:** [GitHub Actions Build Android APK](https://github.com/AhmedRafique/ORRALI/actions/workflows/build-android.yml)

---

## Device Installation (Redmi Note 14 Pro+ / Android)
1. Download `ORRALI-1.2.0.apk` directly to your phone via browser or transfer via USB.
2. Tap the downloaded APK to install (uninstall any previous version if prompted).
3. Launch **ORRALI** — test French audio pronunciation, complete a lesson, restart the app, and verify that progress and XP persist!
