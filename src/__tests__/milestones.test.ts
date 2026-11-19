import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { courses } from '../content';
import { emptyProgress } from '../streak';
import {
  getMilestoneDefs,
  buildMilestoneExamExercises,
  evaluateMilestoneExam,
} from '../milestones';

describe('CEFR Level Milestone Exams & Gold Diplomas (TDD)', () => {
  const fr = courses.find((c) => c.code === 'fr')!;
  const de = courses.find((c) => c.code === 'de')!;
  const es = courses.find((c) => c.code === 'es')!;

  describe('1. Milestone Exam Definitions & Unlock Gate', () => {
    it('defines official milestone exams for A1, A2, B1, B2, and C1', () => {
      const defs = getMilestoneDefs();
      assert.equal(defs.length, 5);

      const ids = defs.map((d) => d.level);
      assert.ok(ids.includes('A1'));
      assert.ok(ids.includes('A2'));
      assert.ok(ids.includes('B1'));
      assert.ok(ids.includes('B2'));
      assert.ok(ids.includes('C1'));
    });
  });

  describe('2. Comprehensive Exam Builder', () => {
    it('builds a 12-question comprehensive exam drawing from the CEFR level units', () => {
      const a1Exam = buildMilestoneExamExercises(fr, 'A1');
      assert.equal(a1Exam.length, 12);

      // Verify all items belong to A1 units
      const a1ItemIds = new Set(
        fr.lessons.filter((l) => l.level?.startsWith('A1')).flatMap((l) => l.items.map((i) => i.id))
      );
      for (const ex of a1Exam) {
        assert.ok(a1ItemIds.has(ex.item.id));
        assert.ok(ex.options && ex.options.length === 4);
      }
    });

    it('builds valid B2 milestone exams for all languages', () => {
      for (const course of [fr, de, es]) {
        const b2Exam = buildMilestoneExamExercises(course, 'B2');
        assert.equal(b2Exam.length, 12);
        assert.ok(b2Exam.every((e) => e.options?.length === 4));
      }
    });
  });

  describe('3. Exam Evaluation & Gold Diploma Award', () => {
    it('awards Gold Diploma and +50 XP for scores >= 80% (e.g. 10/12)', () => {
      const result = evaluateMilestoneExam(10, 12);
      assert.equal(result.passed, true);
      assert.ok(result.scorePct >= 80);
      assert.equal(result.earnedXp, 50);
    });

    it('rejects scores below 80% without awarding diploma', () => {
      const result = evaluateMilestoneExam(8, 12); // 66.7%
      assert.equal(result.passed, false);
      assert.ok(result.scorePct < 80);
      assert.equal(result.earnedXp, 16); // Encouraging consolation XP (8 * 2 = 16 XP)
    });
  });
});
