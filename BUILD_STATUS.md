# Build status — ORRALI 1.1.1 (Stability Release)

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
| GitHub Actions CI/CD Pipeline | PASS — Automated build & release workflow in `.github/workflows/build-android.yml` |
| Android APK Generation | **SUCCESS (1.1.1 APK Generated)** |

---

## Direct APK Download Links

- **GitHub Release (v1.1.1):** [ORRALI v1.1.1 — Stability Release](https://github.com/AhmedRafique/ORRALI/releases/tag/v1.1.1)
- **Direct APK Download:** [ORRALI-1.1.1.apk](https://github.com/AhmedRafique/ORRALI/releases/download/v1.1.1/ORRALI-1.1.1.apk)
- **CI Build Run:** [GitHub Actions Run #43752631705](https://github.com/AhmedRafique/ORRALI/actions/runs/43752631705)
- **Local File:** `ORRALI-1.1.1.apk` in project root

---

## Device Installation (Redmi Note 14 Pro+ / Android)
1. Download `ORRALI-1.1.1.apk` directly to your phone via browser or transfer via USB.
2. Tap the downloaded APK to install.
3. If prompted, allow "Install unknown apps" from your browser or file manager.
4. Launch **ORRALI** and begin practicing French or German!
