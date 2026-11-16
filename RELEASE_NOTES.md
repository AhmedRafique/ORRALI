# ORRALI 1.3.1 — In-Progress Lesson Resumption & Checkpointing

## Summary
Milestone 1.3.1 introduces in-progress lesson checkpointing and resumption: when you leave a lesson mid-way (via the close button or Android back gesture), ORRALI automatically saves your exact step index, correct answers, and wrong answers. When you tap the lesson again, you are given the option to continue from where you stopped or start fresh from the beginning.

## Features Added in 1.3.1
- **In-Progress Lesson Checkpointing:**
  - Automatically records `LessonCheckpoint` (`lessonId`, `exerciseIndex`, `totalExercises`, `correctIds`, `wrongIds`, `updatedAt`) whenever the learner advances through a lesson or exits early.
  - Persisted across app restarts and device power cycles through the dual-layer SQLite/AsyncStorage persistence engine.
- **Interactive Resume Prompt Modal:**
  - When opening a lesson with an existing checkpoint, a branded ORRALI modal appears:
    - *"Continue from Step X"* — resumes immediately at the saved exercise with all previously answered items preserved.
    - *"Start from Beginning"* — clears the saved checkpoint and starts the chapter fresh from Step 1.
    - *"Cancel"* — dismisses the prompt and stays on the home dashboard.
- **Automatic Checkpoint Clearance:**
  - When a lesson is finished, its checkpoint is automatically cleared from storage.
- **PlantUML Flow Update:**
  - Synchronized `docs/lesson-flow.puml` with the new checkpoint detection and resumption lifecycle.
- **Automated Verification:**
  - Added unit test suite covering checkpoint creation, state restoration, and cleanup on completion (30 passing tests).

---

# ORRALI 1.3.0 — Scaffolding & Smart Evaluation Release

## Summary
Milestone 1.3.0 completely revamps the learning pedagogy: introducing structured cognitive scaffolding (Discovery -> Recognition -> Comprehension -> Production) so learners are always taught new phrases before being asked to produce them, and deploys intelligent answer evaluation that accepts valid informal/formal variants, forgives missing accents, and tolerates minor typos.
