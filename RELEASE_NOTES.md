# ORRALI 1.3.0 — Scaffolding & Smart Evaluation Release

## Summary
Milestone 1.3.0 completely revamps the learning pedagogy: introducing structured cognitive scaffolding (Discovery -> Recognition -> Comprehension -> Production) so learners are always taught new phrases before being asked to produce them, and deploys intelligent answer evaluation that accepts valid informal/formal variants, forgives missing accents, and tolerates minor typos.

## Pedagogical & Evaluation Upgrades in 1.3.0
- **Child-to-Fluency Scaffolding Ladder (`buildExercises`):**
  - **Phase 1 (Discovery):** Introduces each new word with an **Intro Card** (`'intro'`). Displays the French/German phrase in large typography, phonetics guide, English meaning, cultural/usage notes, and automatically plays native pronunciation. No typing or grading; learner simply taps *"I understand · Continue"*.
  - **Phase 2 (Guided Recognition):** Multiple-choice exercises (`'choice'`) to build recognition memory.
  - **Phase 3 (Auditory Comprehension):** Listening comprehension (`'listen'`) to associate native sound with spelling.
  - **Phase 4 (Active Recall):** Production exercises (`'type'`) only after the learner has encountered the phrase three times.
- **Smart Pedagogical Answer Evaluation (`evaluateAnswer`):**
  - **Accepted Alternatives:** Recognizes both formal and informal variants (e.g. accepts both *"S'il vous plaît"* and *"S'il te plaît"* for "Please").
  - **Typo & Phonetic Tolerance:** Recognizes near-misses and common learner typos (e.g. accepts *"S'il tu plait"* as valid with a constructive spelling hint).
  - **Accent & Punctuation Leniency:** Accepts unaccented inputs (e.g. *"plait"* or *"cafe"*) as correct, accompanied by a supportive educational reminder (*"Spot on! Note accents: S'il vous plaît"*).
- **Curriculum Enrichment (`content.ts`):**
  - Added phonetic pronunciation guides, cultural usage notes, and accepted translation alternatives for all French and German A1 curriculum items.
- **Automated Verification:**
  - Expanded test suite to 26 automated unit tests (`npm test`) covering smart evaluation, scaffolding progression, and lesson integrity.

---

# ORRALI 1.2.1 — Enhanced Audio & Learning Engine Release

## Summary
Milestone 1.2.1 upgrades the ORRALI audio engine to eliminate robotic speech synthesis, introducing dynamic ranking for Android Google Neural / WaveNet high-definition voices (`VoiceQuality.Enhanced`, network voices), and integrates `expo-audio` to support studio-recorded native human audio playback.
