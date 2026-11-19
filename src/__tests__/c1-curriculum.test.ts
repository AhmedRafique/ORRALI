import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  MILESTONE_DEFS,
  getMilestoneDefs,
  evaluateMilestoneExam,
  buildMilestoneExamExercises,
} from '../milestones';
import { courses } from '../content/index';

describe('CEFR C1 Advanced Fluency & Living Immersion Ecosystem (TDD)', () => {
  const fr = courses.find((c) => c.code === 'fr')!;
  const de = courses.find((c) => c.code === 'de')!;
  const es = courses.find((c) => c.code === 'es')!;

  describe('1. C1 Milestone Exam & Diploma Definition', () => {
    it('defines official CEFR C1 Advanced Fluency Diploma with +75 XP reward', () => {
      const defs = getMilestoneDefs();
      const c1Def = defs.find((d) => d.level === 'C1');

      assert.ok(c1Def);
      assert.equal(c1Def.level, 'C1');
      assert.equal(c1Def.questionCount, 12);
      assert.equal(c1Def.passingScorePct, 80);
      assert.equal(c1Def.xpReward, 75);
    });

    it('evaluates passing score (>= 80%) with official diploma and XP bounty', () => {
      const pass = evaluateMilestoneExam(10, 12);
      assert.equal(pass.passed, true);
      assert.ok(pass.scorePct >= 80);
      assert.equal(pass.earnedXp, 50);

      const fail = evaluateMilestoneExam(8, 12);
      assert.equal(fail.passed, false);
      assert.ok(fail.scorePct < 80);
    });
  });

  describe('2. C1 Curriculum Scale & European Triad Symmetry', () => {
    it('verifies French, German, and Spanish all contain at least 21 units spanning A1 through B2/C1', () => {
      for (const course of [fr, de, es]) {
        assert.ok(course.lessons.length >= 21);
        for (const lesson of course.lessons) {
          assert.equal(lesson.items.length, 6, `Lesson ${lesson.id} does not have 6 items`);
          assert.ok(lesson.grammarCapsule, `Lesson ${lesson.id} missing grammar capsule`);
          assert.ok(lesson.grammarCapsule.examples.length >= 2);
        }
      }
    });

    it('builds valid multiple-choice milestone exam exercises from C1/B2 units without crashing', () => {
      for (const course of [fr, de, es]) {
        const examExercises = buildMilestoneExamExercises(course, 'B2', 12);
        assert.equal(examExercises.length, 12);
        for (const ex of examExercises) {
          assert.equal(ex.kind, 'choice');
          assert.equal(ex.options?.length, 4);
          assert.ok(ex.options.includes(ex.item.target));
        }
      }
    });
  });
});
