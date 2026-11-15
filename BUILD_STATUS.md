# Build status — ORRALI 1.1.2 (Standalone Release)

| Check | Result |
|---|---|
| Dependencies Installation | PASS — 461 packages installed and verified via `npm ci` |
| TypeScript syntax transpilation | PASS — zero syntax diagnostics |
| JSON configuration parsing | PASS — `app.json`, `package.json`, `eas.json` valid |
| Full TypeScript typecheck | PASS — `tsc --noEmit` 0 errors |
| Automated Unit & Logic Tests | PASS — 16 passing tests across SRS, lesson state, normalization, streak, and content integrity |
| Expo configuration validation | PASS — SDK 58.0.0 public config validated |
| PlantUML Architecture Synchronization | PASS — `docs/architecture.puml` and `docs/lesson-flow.puml` synchronized |
| Bug 1: Answer State Reconciliation | PASS — `correctIds` and `wrongIds` strictly disjoint; XP & SRS consistency verified |
| Bug 2: Speech Playback Lifecycle | PASS — `Speech.stop()` integrated on exercise transitions, exit, unmount, and utterance starts |
| Standalone Offline Bundle Packaging | **PASS — `index.android.bundle` embedded in release APK assets** |
| Android Hardware Back Press | **PASS — Intercepted via `BackHandler` with exit confirmation** |
| Android Keyboard Usability | **PASS — Wrapped in `KeyboardAvoidingView` and `ScrollView`** |
| GitHub Actions CI/CD Pipeline | PASS — Automated build & release workflow in `.github/workflows/build-android.yml` |
| Android APK Generation | **SUCCESS (1.1.2 Standalone Release APK Generated)** |

---

## Direct APK Download Links

- **GitHub Release (v1.1.2):** [ORRALI v1.1.2 — Standalone Android Release](https://github.com/AhmedRafique/ORRALI/releases/tag/v1.1.2)
- **Direct APK Download:** [ORRALI-1.1.2.apk](https://github.com/AhmedRafique/ORRALI/releases/download/v1.1.2/ORRALI-1.1.2.apk)
- **CI Build Run:** [GitHub Actions Run #43767088557](https://github.com/AhmedRafique/ORRALI/actions/runs/43767088557)
- **Local File:** `ORRALI-1.1.2.apk` (63.6 MB, standalone offline bundle verified)

---

## Device Installation (Redmi Note 14 Pro+ / Android)
1. Download `ORRALI-1.1.2.apk` directly to your phone via browser or transfer via USB.
2. Tap the downloaded APK to install (uninstall any previous version if prompted).
3. Launch **ORRALI** — the app will load instantly offline without requiring a computer or Metro bundler connection!
