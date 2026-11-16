# ORRALI 2.0.0 — The AI Learning Companion & Roleplay Release

## Summary
Milestone 2.0.0 marks the launch of ORRALI's AI Learning Companion era, built using rigorous Test-Driven Development (TDD). It introduces the Smart Mistake Clinic to diagnose SQLite error patterns and generate custom remedial workouts, interactive multi-turn Conversational AI Roleplay with in-character native dialogue, and the "Ask ORRALI" AI contextual tutor explaining complex grammar in child-friendly terms.

## What's New in 2.0.0
- **Smart Mistake Clinic (`src/companion/clinic.ts` & `MistakeClinicModal.tsx`):**
  - Analyzes learner's historical attempts and card lapses stored in SQLite.
  - Automatically diagnoses recurring error patterns, computes item accuracy rates, and generates targeted linguistic coaching tips.
  - One-tap launcher: *"Start 5-min Remedial Workout"* dynamically builds a focused session targeting only the phrases you struggled with.
- **Conversational AI Roleplay (`src/companion/roleplay.ts` & `RoleplayModal.tsx`):**
  - Dynamic, multi-turn conversational roleplay simulations in French and German:
    - *Au Café de Paris* (with Pierre the Bistro Waiter)
    - *À la Réception de l’Hôtel* (with Claire the Concierge)
    - *Am Hauptbahnhof* (with Hans the Ticket Agent)
    - *In der Bäckerei* (with Frau Schmidt the Baker)
  - Features speaker avatars, native audio pronunciation on every message, suggested quick-reply chips, and free-form input.
  - In-line linguistic coaching cards providing real-time feedback on politeness, grammar, and vocabulary.
  - Completion detection: Completing the scenario objective awards +20 XP!
- **"Ask ORRALI" Contextual AI Tutor (`src/companion/tutor.ts` & `TutorModal.tsx`):**
  - "Explain to me like a child" interactive grammar and pronunciation tutor.
  - Search any question or tap popular query chips (*Tu vs. Vous*, *Un vs. Une*, *Einen Kaffee (Akkusativ)*, *Telling Time*).
  - Provides simple child-friendly summaries, detailed explanations, golden rules, and translated example sentences with instant audio playback.
- **TDD Quality & Architecture Verification:**
  - Designed and validated using Test-Driven Development (TDD).
  - 53 automated unit tests passing (`npm test`) covering all AI Companion systems, speech evaluation, scaffolding, and streak protection with 0 TypeScript diagnostics (`tsc --noEmit`).

---

# ORRALI 1.7.0 — Pre-Rendered Native Studio Audio Release

## Summary
Milestone 1.7.0 replaces on-device synthetic speech with 120 pre-rendered, high-definition studio neural audio recordings bundled directly inside the app. Every French and German phrase in the curriculum plays with authentic human breathing, natural pitch cadence, and native liaisons with sub-millisecond start time and 100% offline support.
