import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { courses } from '../content';
import { buildExercises } from '../exercises';

describe('Pedagogical Close-Distractor Engine (TDD)', () => {
  const de = courses.find((c) => c.code === 'de')!;
  const fr = courses.find((c) => c.code === 'fr')!;

  it('selects multiple-choice options from the same lesson or semantic topic', () => {
    // German Unit 2: Numbers (Zahlen & Zählen)
    const numbersLesson = de.lessons.find((l) => l.id === 'de-2')!;
    const exercises = buildExercises(de, numbersLesson.items);

    const choiceEx = exercises.filter((e) => e.kind === 'choice');
    assert.ok(choiceEx.length >= numbersLesson.items.length);

    for (const ex of choiceEx) {
      assert.ok(ex.options && ex.options.length >= 3);
      // Verify correct answer is in options
      assert.ok(ex.options.includes(ex.item.target));

      // Check distractors: they should be from the numbers lesson or closely related lessons,
      // NOT from far-away lessons like B2 Job Interviews or Ecology!
      const farAwayB2Targets = new Set(
        de.lessons
          .filter((l) => l.level?.startsWith('B2'))
          .flatMap((l) => l.items.map((i) => i.target))
      );

      for (const opt of ex.options) {
        assert.ok(
          !farAwayB2Targets.has(opt),
          `Distractor "${opt}" is from B2, which is pedagogically too far from A1 numbers!`
        );
      }
    }
  });

  it('ensures distractors have similar phrase complexity and length to target', () => {
    // French Unit 1: Greetings (short phrases)
    const greetingsLesson = fr.lessons.find((l) => l.id === 'fr-1')!;
    const exercises = buildExercises(fr, greetingsLesson.items);
    const choiceEx = exercises.filter((e) => e.kind === 'choice');

    for (const ex of choiceEx) {
      const targetLen = ex.item.target.length;
      for (const opt of ex.options!) {
        // Distractors should be within reasonable length ratio (not a 60-char sentence for a 10-char greeting)
        assert.ok(
          Math.abs(opt.length - targetLen) < 40,
          `Option "${opt}" length (${opt.length}) is too far from target "${ex.item.target}" (${targetLen})`
        );
      }
    }
  });
});
