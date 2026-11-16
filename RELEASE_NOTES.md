# ORRALI 1.6.0 — Learning World, Badges, Streak Shields & Stories Release

## Summary
Milestone 1.6.0 brings the ORRALI Learning World to life: introducing the collectible Trophy Shelf with achievement medals, automatic Streak Freeze Shield protection against missed days, and interactive Real-World Conversational Stories with native audio dialog and comprehension checks.

## What's New in 1.6.0
- **Trophy Shelf & Achievement Badges (`src/badges.ts`):**
  - Added a collectible medal grid on the Profile screen to celebrate milestones:
    - 🌱 **First Words:** Complete your first chapter.
    - 🔥 **Habit Builder:** Reach a 3-day learning streak.
    - ⚡ **Week Champion:** Maintain a 7-day learning streak.
    - ☕ **Café Regular:** Complete *Au Café* or *Im Café*.
    - ✧ **XP Explorer:** Reach 100 total XP.
    - 🌐 **Dual Polyglot:** Earn 25+ XP in both French and German.
    - 🧠 **Memory Master:** Move 5 cards to long-term memory (interval ≥ 21 days).
    - 📖 **Story Listener:** Complete your first conversational story.
  - Cards show live progress counters and golden unlocked celebrations.
- **Streak Freeze & Shield Protection (`src/streak.ts`):**
  - Start with 1 complimentary Streak Protection Shield.
  - Missing a single day automatically consumes 1 shield to protect and preserve your streak without resetting.
  - Automatically recharges when you reach milestone streaks (every 3 or 7 days, max 2 shields).
  - Status displayed on both Home and Profile screens (`🛡️ 1/2 Shields`).
- **Interactive Conversational Stories (`src/content.ts`):**
  - Real-world dialog scenarios between illustrated native characters:
    - *French Story:* "Un matin à la boulangerie" (Sophie & Pierre ordering croissants and baguettes in Paris).
    - *German Story:* "Am Hauptbahnhof" (Max booking a train ticket to Munich).
  - Tap any speech bubble to hear native audio pronunciation.
  - Interactive comprehension check at the end of each story awarding +15 XP!
- **Automated Verification:**
  - Expanded test suite to **42 passing unit tests** (`npm test`) with **0 TypeScript errors** (`tsc --noEmit`).

---

# ORRALI 1.5.0 — Speaking Drills & Pronunciation Assessment Release

## Summary
Milestone 1.5.0 transforms ORRALI into an active speaking platform: introducing spoken pronunciation exercises (`'speak'`), microphone recording with Android `RECORD_AUDIO` permission, real-time pronunciation scoring, word-by-word visual feedback, and voice playback comparison.
