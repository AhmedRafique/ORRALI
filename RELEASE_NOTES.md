# ORRALI 1.1.2 — Standalone Android Release

## Summary
Milestone 1.1.2 fixes the standalone offline APK runtime crash (Metro connection failure) by compiling an offline embedded JavaScript/Hermes bundle into the release APK, intercepts Android hardware back button events, and improves keyboard ergonomics.

## Fixed & Improved
- **Standalone Offline APK Packaging (Fix for Red Screen `loadJSBundleFromAssets` / Metro Error):**
  - Switched APK generation from `assembleDebug` to `assembleRelease`.
  - In React Native / Expo, `assembleDebug` expects Metro bundler on `localhost:8081` and does not package the JS bundle into assets, causing the red screen crash when launched standalone on a phone.
  - `assembleRelease` runs the `bundleReleaseJsAndAssets` task, pre-compiling all TypeScript/JavaScript into Hermes bytecode embedded directly in the APK as `index.android.bundle`.
  - Signed with the debug certificate for immediate sideloading and testing on Android devices.
- **Android Hardware / Gesture Back Handling:**
  - Added `BackHandler` interception in `LessonScreen.tsx` so pressing the Android back button or swiping back shows a confirmation dialog instead of exiting the entire application.
- **Keyboard Ergonomics in Text Exercises:**
  - Wrapped `LessonScreen.tsx` inside `KeyboardAvoidingView` and `ScrollView` with `keyboardShouldPersistTaps="handled"` so typing answers does not push action buttons off-screen.

---

# ORRALI 1.1.1 — Stability Release

## Summary
Milestone 1.1.1 resolves the critical correctness defects identified during the codebase audit, guarantees answer-state mutual exclusion, fixes speech playback lifecycle issues, provides automated regression testing, and confirms full TypeScript typecheck clearance.

## Fixed
- **Bug 1: Conflicting Correct and Incorrect Answer Records:**
  - `LessonScreen.tsx` enforces strict mutual exclusion between `correctIds` and `wrongIds`.
- **Bug 2: Speech Playback Lifecycle & Audio Overlap:**
  - `LessonScreen.tsx` calls `Speech.stop()` prior to triggering any new TTS utterance, on unmount, and on exercise transitions.
