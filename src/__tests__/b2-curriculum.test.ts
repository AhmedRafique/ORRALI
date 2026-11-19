import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { courses } from '../content/index';
import { evaluateAnswer } from '../exercises';

describe('CEFR B2 Upper-Intermediate & Professional Fluency Expansion (TDD)', () => {
  const fr = courses.find((c) => c.code === 'fr')!;
  const de = courses.find((c) => c.code === 'de')!;

  describe('1. B2 Curriculum Scale & Professional Units', () => {
    it('French course includes 21 progressive units (A1, A2, B1, and B2)', () => {
      assert.equal(fr.lessons.length, 21);

      const b2Lessons = fr.lessons.filter((l) => l.level?.startsWith('B2'));
      assert.equal(b2Lessons.length, 6);
      assert.ok(b2Lessons.some((l) => l.title.includes('Embauche')));
      assert.ok(b2Lessons.some((l) => l.title.includes('Négociations')));
      assert.ok(b2Lessons.some((l) => l.title.includes('Idiomatiques')));
      assert.ok(b2Lessons.some((l) => l.title.includes('Débats')));
    });

    it('German course includes 20 progressive units (A1, A2, B1, and B2)', () => {
      assert.equal(de.lessons.length, 20);

      const b2Lessons = de.lessons.filter((l) => l.level?.startsWith('B2'));
      assert.equal(b2Lessons.length, 5);
      assert.ok(b2Lessons.some((l) => l.title.includes('Bewerbungsgespräch')));
      assert.ok(b2Lessons.some((l) => l.title.includes('Verhandlungen')));
      assert.ok(b2Lessons.some((l) => l.title.includes('Redewendungen')));
    });

    it('all units contain exactly 6 items', () => {
      let total = 0;
      for (const course of [fr, de]) {
        for (const lesson of course.lessons) {
          assert.equal(lesson.items.length, 6, `Lesson ${lesson.id} does not have 6 items`);
          total += lesson.items.length;
        }
      }
      assert.equal(total, 246); // 21 * 6 (FR) + 20 * 6 (DE)
    });
  });

  describe('2. B2 Professional Item Integrity', () => {
    it('every B2 item has unique ID, phonetics, usage notes, and alternatives', () => {
      const b2Ids = new Set<string>();

      for (const course of [fr, de]) {
        for (const lesson of course.lessons.filter((l) => l.level?.startsWith('B2'))) {
          for (const item of lesson.items) {
            assert.ok(!b2Ids.has(item.id), `Duplicate B2 ID: ${item.id}`);
            b2Ids.add(item.id);

            assert.ok(item.target.length > 0);
            assert.ok(item.en.length > 0);
            assert.ok((item.phonetic ?? '').length > 0);
            assert.ok((item.notes ?? '').length > 0);
            assert.ok(Array.isArray(item.alternatives));
          }
        }
      }
    });

    it('all B2 units have professional grammar capsules', () => {
      for (const course of [fr, de]) {
        for (const lesson of course.lessons.filter((l) => l.level?.startsWith('B2'))) {
          assert.ok(lesson.grammarCapsule);
          assert.ok(lesson.grammarCapsule.examples.length >= 2);
        }
      }
    });
  });

  describe('3. B2 Advanced Phrasing Evaluation', () => {
    it('evaluates French professional correspondence with accent leniency', () => {
      const interviewLesson = fr.lessons.find((l) => l.id === 'fr-16')!;
      const item = interviewLesson.items[0]; // J'ai acquis une solide expérience en ingénierie
      const res = evaluateAnswer("J'ai acquis une solide experience en ingenierie", item);
      assert.equal(res.ok, true);
    });

    it('evaluates German business negotiation phrasing', () => {
      const negLesson = de.lessons.find((l) => l.id === 'de-17')!;
      const item = negLesson.items[0]; // Wir müssen einen fairen Kompromiss erzielen
      const res = evaluateAnswer('Wir muessen einen fairen Kompromiss erzielen', item);
      assert.equal(res.ok, true);
    });
  });
});
