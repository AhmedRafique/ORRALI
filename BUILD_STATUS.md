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
| Android APK generation | READY FOR BUILD — Requires authenticated EAS session (`npx eas-cli login` / `EXPO_TOKEN`) or local Android SDK/Gradle |

## APK Build Instructions
To build the Android preview APK in EAS Cloud:
```bash
npx eas-cli login
npm run build:preview
```
Alternatively, with an Expo token:
```bash
$env:EXPO_TOKEN = "your-expo-token"
npm run build:preview
```
