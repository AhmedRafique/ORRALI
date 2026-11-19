# ORRALI — Development Roadmap

**Current Release:** 7.0.0 (Ecosystem Release)  
**Status Date:** November 18, 2026  

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
| **1.7.0** | Studio Neural Audio | Pre-rendered studio neural voice recordings, 100% offline | **COMPLETED** |
| **2.0.0** | AI Companion | Mistake Clinic, Conversational Roleplay, "Ask ORRALI" AI Tutor | **COMPLETED** |
| **2.1.0** | A2 & B1 Curriculum Expansion | Past tenses (Passé Composé, Perfekt), future tenses, 20 intermediate units | **COMPLETED** |
| **2.2.0** | Smart Lexicon & Dictionary | Searchable 240-word dictionary, mastery filters, flashcard flip drill mode | **COMPLETED** |
| **2.3.0** | Sensory Polish & Themes | Tactile haptics (expo-haptics), Midnight OLED dark mode | **COMPLETED** |
| **3.0.0** | Master Release & B2 Expansion | Full 40 units (240 phrases), 240 studio MP3s, professional & idiomatic B2 | **COMPLETED** |
| **4.0.0** | The Ultimate Global Edition | Spanish world launch (Español 🇪🇸), close pedagogical distractors, Speech Lab live waveform, B2 stories, habit notifications, 300 studio MP3s | **COMPLETED** |
| **4.1.0** | Real Speech Recognition Engine | Native SpeechRecognizer integration (expo-speech-recognition), anti-gibberish transcript matching | **COMPLETED** |
| **5.0.0** | The Ultimate Store Edition | Complete European Triad (FR, DE, ES through B2, 60 chapters, 360 studio MP3s), Sentence Scramble drills, Google Play AAB bundle | **COMPLETED** |
| **5.1.0** | Acoustic Harmony & Speech Leniency | Fuzzy word alignment (contraction split fix), confidence leniency (>=50% pass), anti-trapping UI, acoustic chimes | **COMPLETED** |
| **5.2.0** | Speed Recall Arcade | 60-second rapid-fire matching challenge, combo multipliers, ranked tier XP rewards | **COMPLETED** |
| **5.3.0** | All-Stars Master Edition | Dual-speed audio (Normal 🔊 & Turtle 🐢), CEFR Milestone Exams & Diplomas, Sentence Anatomy, Daily Word of the Day | **COMPLETED** |
| **5.4.0** | Production Hardened Edition | Code audit remediation: roleplay intent validation, sequence-aware pronunciation alignment, Mistake Clinic workout preservation, Spanish tutor knowledge base, theme persistence, and audio player cleanup | **COMPLETED** |
| **5.5.0** | Hands-Free Commuter Audio | Pimsleur-style English prompt -> thinking pause -> normal speed (1.0x) -> slow phonetic repeat (0.72x) audio loop | **COMPLETED** |
| **5.6.0** | Visual Chromatic Gender Immersion | Cobalt Blue ♂ (Masc), Rose Crimson ♀ (Fem), Sage Emerald ⚲ (Neut) across Word Tiles, Anatomy Pills, and Lexicon | **COMPLETED** |
| **5.7.0** | Radio Lab Audio Dictation | Connected speech dictation engine, cloze gap assembly, and acoustic liaison analysis | **COMPLETED** |
| **5.8.0** | 3-Minute Express Review | 90-second swipe-based fast-track review to quickly clear 5 urgently due cards and save daily streak | **COMPLETED** |
| **5.9.0** | The Verb Gym | Slot-machine rapid conjugation drills across present and past tenses for French, German, and Spanish | **COMPLETED** |
| **6.0.0** | Shadowing Studio | Side-by-side native listening, microphone recording, acoustic cadence matching, and instant feedback | **COMPLETED** |
| **6.1.0** | Café Library Reading Lounge | Tap-to-read continuous cultural stories, inline chromatic gender popovers, and audiobook read-aloud | **COMPLETED** |
| **6.2.0** | Adaptive CEFR Placement Test | Dynamic multi-tier placement test with auto-unlocking of prerequisite chapters, mature SM-2 intervals, and retroactive Gold Diplomas | **COMPLETED** |
| **6.3.0** | Core Reliability Release | Authentic CEFR placement mapping from metadata, complete roleplay intent validation, dual-storage timestamp reconciliation, SQLite attempt tracking for Mistake Clinic, and speech recognition race fix | **COMPLETED** |
| **6.4.0** | Learning Intelligence Foundation | Standardized Learning Events system, Learner Knowledge Model (mastery vs. confidence), explainable Recommendation Engine, dynamic session generator | **COMPLETED** |
| **6.5.0** | Real-Life Missions & Writing Lab | 30-scenario branching missions (Travel, Everyday, Work), interactive writing exercises, targeted 8-point correction engine | **COMPLETED** |
| **6.6.0** | Speak Naturally & Listening World | Visual pronunciation skill map (FR/DE/ES), acoustic cadence & intonation metrics, progressive audio library | **COMPLETED** |
| **6.7.0** | Personal AI Coach & Smart Phrasebook | Contextual conversational memory, multi-mode tutor, personal phrase saving across all activities, Grammar Radar | **COMPLETED** |
| **6.8.0** | Learning World & Living Characters | Illustrated 2D world exploration, recurring character personas and narrative continuity across missions | **COMPLETED** |
| **6.9.0** | Supporting Ecosystem & Offline Packs | Daily Briefing, Smart Review Queue, Survival Mode, False Friends Trainer, downloadable offline packs | **COMPLETED** |
| **7.0.0** | Beyond the Familiar (Ecosystem Release) | Full architectural maturity, relational repository layer, cloud sync conflict resolution, verified release artifacts | **COMPLETED** |
| **7.0.1** | Post-Launch Audit | Bug fixes, version-driven release pipeline, and dependency resolutions | **COMPLETED** |

---

## ORRALI 8.0 Master Roadmap: "The Living Immersion"

### Phase 7.1.0 — CEFR Exhaustive Completeness (The Data Layer Restructure)
* **Curriculum Restructure:** Break down monolithic content files into a scalable, language-specific directory structure (`src/content/fr/`, `src/content/de/`, `src/content/es/`, `src/content/stories.ts`).
* **Exhaustive Grammar Mapping:** Symmetrical B2 units added for French (`fr-21`), German (`de-21`), and Spanish (`es-21`), covering complex concession, modal passive, and indirect speech.
* **Deep Semantic Distractors:** Upgrade multiple-choice exercises with contextually difficult, pedagogically valuable distractors.
* **Status:** **COMPLETED**

### Phase 7.2.0 — Visual Personas & Emotion Engine
* **2D Animated Portraits:** European Triad character personas with chromatic mood rings and emotion badges (`VisualAvatar.tsx`, `CHARACTER_ROSTER`).
* **Performance-Driven Reactions:** Characters visibly react to learner input (`derivePersonaReaction`: happy on communicative success, impressed on streaks, encouraging on grammar slips, confused on gibberish).
* **Lowering Affective Filter:** Transforming sterile text boxes into a warm, humanized conversational interface embedded in AI Roleplay.
* **Status:** **COMPLETED**

### Phase 7.3.0 — Interactive 2D World Map
* **Spatial Memory UI:** Interactive 2D spatial city grid replacing linear lists with exploration hubs (`WorldMapView.tsx`, `CITY_MAP_BUILDINGS`).
* **Location-Based Learning:** District hubs (Café District, Travel Hub, City Center, Cultural Quarter, University, Business Quarter) directly launching corresponding missions and exercises.
* **Dynamic Environment:** Real-world 4-phase day & night cycles (Dawn, Day, Twilight, Midnight OLED) with ambient lighting and street lamps.
* **Status:** **COMPLETED**

### Phase 7.4.0 — Generative Emotional TTS
* **Premium Voice Synthesis:** Upgrade from standard local device TTS to API-driven generative voice models (e.g., OpenAI / ElevenLabs capabilities).
* **Mood-Aware Audio:** NPC voices reflect the scenario's emotion—expressing surprise at a curveball, warmth in greetings, or hesitation.
* **Offline Fallback Strategy:** Graceful fallback to local device TTS if the network is unavailable.
* **Status:** **IN PROGRESS**

### Phase 7.5.0 — Video Immersion Lounge (Comprehensible Input)
* **Contextual Video Content:** A new Café Library feature focusing on short-form, real-life native video clips (e.g., street interviews, cultural snippets).
* **Interactive Bilingual Subtitles:** Tap a word in the subtitle to auto-pause the video, translate the word, and save it to the Phrasebook.
* **Status:** **PLANNED**

### Phase 8.0.0 — The Living Immersion (C1 Tier & Cooperative Learning)
* **C1 Advanced Fluency:** Expanding beyond B2 into C1—covering cultural idioms, complex debates, sarcasm, and literature nuances.
* **Global Community Missions:** Cooperative, non-toxic social learning (e.g., "The community needs to order 10,000 virtual coffees in Paris this week").
* **Ecosystem Maturity:** The final convergence of visual, emotional, and comprehensive language education.
* **Status:** **PLANNED**

---

## ORRALI 7.0 & 8.0 Master Development Architecture

```
                                  ┌───────────────────────────┐
                                  │   ORRALI Personal Coach   │
                                  │   (Adaptive Intelligence) │
                                  └─────────────┬─────────────┘
                                                │
                 ┌──────────────────────────────┼──────────────────────────────┐
                 ▼                              ▼                              ▼
  ┌─────────────────────────────┐┌─────────────────────────────┐┌─────────────────────────────┐
  │        Learning World       ││        Real-World           ││       Learning Engine       │
  │   (Immersion & Characters)  ││       Communication         ││    (Structured Education)   │
  │  • 2D Illustrated Hubs      ││  • Real-Life Missions       ││  • Multi-Tier CEFR (A1-B2)  │
  │  • Living Characters        ││  • Writing Lab & Radar      ││  • Spaced Repetition (SM-2) │
  │  • Cultural Stories         ││  • Natural Speech & Listen  ││  • Grammar Capsules         │
  └──────────────┬──────────────┘└──────────────┬──────────────┘└──────────────┬──────────────┘
                 │                              │                              │
                 └──────────────────────────────┼──────────────────────────────┘
                                                ▼
                                  ┌───────────────────────────┐
                                  │ Standardized Event Stream │
                                  │   & Knowledge Profile     │
                                  │ (Decoupled Mastery/Conf)  │
                                  └─────────────┬─────────────┘
                                                ▼
                                  ┌───────────────────────────┐
                                  │ Relational SQLite Core    │
                                  │ (Offline-First Storage)   │
                                  └───────────────────────────┘
```

