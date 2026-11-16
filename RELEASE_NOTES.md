# ORRALI 1.2.1 — Enhanced Audio & Learning Engine Release

## Summary
Milestone 1.2.1 upgrades the ORRALI audio engine to eliminate robotic speech synthesis, introducing dynamic ranking for Android Google Neural / WaveNet high-definition voices (`VoiceQuality.Enhanced`, network voices), and integrates `expo-audio` to support studio-recorded native human audio playback.

## Audio Enhancements in 1.2.1
- **Human-Like Neural Voice Discovery (`src/audio.ts`):**
  - Upgraded voice ranking to prioritize Google Neural / WaveNet and `VoiceQuality.Enhanced` voices on Android over flat, metallic local synthesizers.
  - Automatically identifies and attaches available high-fidelity French and German voices at runtime.
- **Unified Audio Architecture (`expo-audio`):**
  - Integrated `expo-audio` to support pre-rendered native human audio files (`item.audio`) with instant offline playback.
  - Graceful fallback: seamlessly switches to enhanced neural speech synthesis if a pre-rendered studio asset is unavailable.
  - Added ProGuard keep rules for `expo.modules.audio` to ensure native audio bindings are preserved in release builds.

---

# ORRALI 1.2.0 — Learning Engine & Persistence Release

## Summary
Milestone 1.2.0 delivers the core Learning Engine foundation: fixes Android TTS voice selection so French and German words are spoken with native accents, introduces dual-layer persistence (SQLite via `expo-sqlite` and AsyncStorage with R8 Proguard rules), fixes state updater persistence race conditions, enhances the Spaced Repetition System with mistake (lapse) tracking, and establishes course-isolated XP and progress tracking.
