# ORRALI 1.2.0 — Learning Engine & Persistence Release

## Summary
Milestone 1.2.0 delivers the core Learning Engine foundation: fixes Android TTS voice selection so French and German words are spoken with native accents, introduces dual-layer persistence (SQLite via `expo-sqlite` and AsyncStorage with R8 Proguard rules), fixes state updater persistence race conditions, enhances the Spaced Repetition System with mistake (lapse) tracking, and establishes course-isolated XP and progress tracking.

## What's Fixed & Added in 1.2.0
- **Native TTS Voice Selection & Accent Fix:**
  - Resolved Android `expo-speech` bug where `Locale.Builder().setLanguage("fr-FR")` threw `IllformedLocaleException` and silently reverted to the default system voice (English).
  - Normalized language codes to ISO 639-1 (`'fr'`, `'de'`), allowing Android TextToSpeech to resolve native French and German engines without exceptions.
  - Added dynamic native voice resolution (`Speech.getAvailableVoicesAsync()`) in `LessonScreen.tsx` to automatically match and bind available French and German voices.
- **Dual-Layer Persistence (SQLite + AsyncStorage):**
  - Integrated `expo-sqlite` as the primary local relational database (`src/db.ts`).
  - Added auto-migration from legacy AsyncStorage keys (`orrali.progress.v2`, `lingo.progress.v1`) into SQLite.
  - Synchronizes updates to both SQLite and AsyncStorage for maximum reliability across Android ROMs.
  - Added explicit ProGuard keep rules for both `@react-native-async-storage/async-storage` and `expo-sqlite` to prevent R8 from stripping native JNI classes in release builds.
- **Persistence Race Condition Resolved in Root (`App.tsx`):**
  - Removed async side effects from React state updaters. `saveProgress` is now directly invoked on committed state objects.
- **Enhanced Spaced Repetition (SRS) Engine:**
  - Added `lapses` (number of times forgotten) and `lastReviewed` timestamp tracking to each SM-2 `Card`.
  - Tuned ease bounds and reset penalties.
- **Course-Isolated Progress & Fresh Streak Calculation:**
  - Track `courseXp` independently for French and German.
  - Added `getEffectiveStreak` to prevent stale streak displays after periods of inactivity.
  - Logged each exercise attempt to SQLite (`exercise_attempts`).

---

# ORRALI 1.1.2 — Standalone Android Release

## Summary
Milestone 1.1.2 fixes the standalone offline APK runtime crash (Metro connection failure) by compiling an offline embedded JavaScript/Hermes bundle into the release APK, intercepts Android hardware back button events, and improves keyboard ergonomics.
