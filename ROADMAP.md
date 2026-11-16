# ORRALI — Development Roadmap

**Current Release:** 1.1.1 (Stability Release)  
**Status Date:** November 15, 2026  

---

## Milestone Progress Overview

| Milestone | Title | Focus Area | Status |
|---|---|---|---|
| **1.1.0** | Foundation Sprint 02 | Bottom tabs, AsyncStorage, French/German courses | **COMPLETED** |
| **1.1.1** | Stability Release | Bug fixes (answer state, TTS lifecycle), test suite, typecheck | **COMPLETED** |
| **1.1.2** | Standalone Android Release | Offline embedded JS bundle, Android BackHandler, keyboard view | **COMPLETED** |
| **1.2.0** | Learning Engine | SQLite integration, SM-2 lapse tracking, dual persistence, native voice selection | **COMPLETED** |
| **1.2.1** | Neural Audio Upgrade | Android Google Neural WaveNet voices, expo-audio integration | **COMPLETED** |
| **1.3.0** | Scaffolding & Smart Evaluation | Child-to-fluency scaffolding, intro cards, informal/formal alternatives, typo leniency | **COMPLETED** |
| **1.3.1** | In-Progress Resumption | Mid-lesson checkpointing, resume prompt modal, state preservation | **COMPLETED** |
| **1.4.0** | Complete A1 Curriculum & Grammar | Full 20 CEFR A1 units (120 items), interactive Grammar Capsules with rules & examples | **COMPLETED** |
| **1.5.0** | Speaking & Pronunciation | Spoken drills ('speak'), mic recording, pronunciation scoring engine | **COMPLETED** |
| **1.6.0** | Learning World & Retention | Trophy shelf, achievement badges, streak shields, conversational stories | **COMPLETED** |
| **1.7.0** | Studio Human Audio | Pre-rendered studio neural voice recordings, 100% offline | **COMPLETED** |
| **2.0.0** | AI Companion | Mistake Clinic, Conversational Roleplay, "Ask ORRALI" AI Tutor | **COMPLETED** |
| **2.1.0** | A2 & B1 Curriculum Expansion | Past tenses (Passé Composé, Perfekt), future tenses, 20 intermediate units | **NEXT UP** |

---

## Detailed Milestone Breakdown

### Milestone 1.1.1 — Stability Release (Completed)
- [x] **Bug 1: Answer State Reconciliation**: Enforced strict mutual exclusion between `correctIds` and `wrongIds`.
- [x] **Bug 2: Speech Playback Lifecycle**: Added `Speech.stop()` guard on unmount, exercise transition, and early exit.
- [x] **XP Calculation Integrity**: Fixed XP calculations to only count final correct answers.
- [x] **Automated Testing Suite**: Implemented `src/__tests__/lesson-logic.test.ts` with 16 automated unit tests.
- [x] **Full TypeScript Typecheck**: Resolved dependencies and passed `tsc --noEmit` with 0 errors.
- [x] **PlantUML Synchronization**: Synchronized `docs/architecture.puml` and `docs/lesson-flow.puml`.
- [x] **Version Bumps**: Synchronized `1.1.1` across `package.json`, `app.json`, and `ProfileScreen.tsx`.

---

### Milestone 1.2.0 — Learning Engine & Scalable Persistence (Next Up)
**Objective:** Transition from basic AsyncStorage to a structured, offline-first SQLite database and enhance the Spaced Repetition System.
- [ ] Evaluate `expo-sqlite` with continuous native generation (CNG) support.
- [ ] Design relational schema:
  - `courses` (code, name, speechLang)
  - `lessons` (id, course_id, title, subtitle, level, sort_order)
  - `items` (id, lesson_id, target, en, phonetic, audio_url)
  - `cards` (item_id, course_id, due, interval, ease, reps, lapses)
  - `attempts` (id, item_id, exercise_kind, is_correct, timestamp)
  - `sessions` (id, course_id, start_time, end_time, earned_xp)
- [ ] Implement database migrations and automated migration from AsyncStorage.
- [ ] Refine SM-2 spaced repetition algorithm with configurable ease limits and lapse penalties.
- [ ] Add explicit mistake and repeated-mistake tracking.
- [ ] Provide course-isolated statistics and independent review schedules.

---

### Milestone 1.3.0 — Structured A1 Content
**Objective:** Deliver an authentic, structured A1 beginner curriculum for French and German.
- [ ] Design complete CEFR A1 curriculum syllabus (10+ thematic units per language).
- [ ] Author vocabulary, context sentences, cultural notes, and grammar explanations.
- [ ] Add rich distractor generation and exercise variations.
- [ ] Content validation and linguistic review.

---

### Milestone 1.4.0 — Speaking & Listening
**Objective:** Introduce voice capabilities, active pronunciation, and audio comprehension.
- [ ] Integrate native audio recording permissions.
- [ ] Evaluate on-device speech-to-text / pronunciation scoring solutions.
- [ ] Design listening comprehension exercises and spoken repeat drills.
- [ ] Actionable pronunciation feedback.

---

### Milestone 1.5.0 — Learning World & Gamification
**Objective:** Deepen engagement through structured progression, rewards, and immersion.
- [ ] Daily streak freezes and streak recovery mechanisms.
- [ ] Achievement badges and milestones.
- [ ] Interactive mini-stories and real-world dialog scenarios.

---

### Milestone 2.0.0 — AI Learning Companion
**Objective:** Introduce adaptive, personalized language learning.
- [ ] Contextual AI chat companion with conversational practice.
- [ ] Dynamic difficulty scaling based on learner performance metrics.
- [ ] Intelligent mistake analysis and custom revision recommendations.
