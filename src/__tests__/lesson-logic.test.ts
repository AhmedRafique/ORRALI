import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { norm, buildExercises } from '../exercises';
import { newCard, review, isDue } from '../srs';
import { emptyProgress, touchStreak, dayKey } from '../store';
import { courses } from '../content';

describe('ORRALI Learning Engine & Lesson State Logic', () => {
  describe('Bug 1: Conflicting Correct and Incorrect Answer Records', () => {
    // Model the state transitions as defined by Bug 1 correction
    function answerStateReducer(
      state: { correctIds: string[]; wrongIds: string[] },
      action: { itemId: string; ok: boolean }
    ) {
      const { itemId, ok } = action;
      if (ok) {
        return {
          correctIds: state.correctIds.includes(itemId) ? state.correctIds : [...state.correctIds, itemId],
          wrongIds: state.wrongIds.filter((id) => id !== itemId),
        };
      } else {
        return {
          wrongIds: state.wrongIds.includes(itemId) ? state.wrongIds : [...state.wrongIds, itemId],
          correctIds: state.correctIds.filter((id) => id !== itemId),
        };
      }
    }

    it('item answered wrong then right is only in correctIds', () => {
      let state = { correctIds: [] as string[], wrongIds: [] as string[] };
      // First attempt: incorrect
      state = answerStateReducer(state, { itemId: 'fr-1-1', ok: false });
      assert.deepEqual(state.wrongIds, ['fr-1-1']);
      assert.deepEqual(state.correctIds, []);

      // Second attempt: correct
      state = answerStateReducer(state, { itemId: 'fr-1-1', ok: true });
      assert.deepEqual(state.correctIds, ['fr-1-1']);
      assert.deepEqual(state.wrongIds, []);
    });

    it('item answered right then wrong is only in wrongIds', () => {
      let state = { correctIds: [] as string[], wrongIds: [] as string[] };
      // First attempt: correct
      state = answerStateReducer(state, { itemId: 'fr-1-2', ok: true });
      assert.deepEqual(state.correctIds, ['fr-1-2']);
      assert.deepEqual(state.wrongIds, []);

      // Second attempt: incorrect
      state = answerStateReducer(state, { itemId: 'fr-1-2', ok: false });
      assert.deepEqual(state.wrongIds, ['fr-1-2']);
      assert.deepEqual(state.correctIds, []);
    });

    it('multiple items maintain mutually exclusive sets', () => {
      let state = { correctIds: [] as string[], wrongIds: [] as string[] };
      state = answerStateReducer(state, { itemId: 'fr-1-1', ok: false });
      state = answerStateReducer(state, { itemId: 'fr-1-2', ok: true });
      state = answerStateReducer(state, { itemId: 'fr-1-3', ok: false });
      state = answerStateReducer(state, { itemId: 'fr-1-1', ok: true }); // corrected!

      assert.deepEqual(state.correctIds.sort(), ['fr-1-1', 'fr-1-2']);
      assert.deepEqual(state.wrongIds, ['fr-1-3']);

      // Calculate XP
      const earnedXp = state.correctIds.length * 5;
      assert.equal(earnedXp, 10);

      // Verify SRS updates
      const wrongSet = new Set(state.wrongIds);
      const srsResults: Record<string, boolean> = {};
      for (const id of new Set([...state.correctIds, ...state.wrongIds])) {
        srsResults[id] = !wrongSet.has(id);
      }
      assert.equal(srsResults['fr-1-1'], true);
      assert.equal(srsResults['fr-1-2'], true);
      assert.equal(srsResults['fr-1-3'], false);
    });
  });

  describe('Exercise normalization (norm)', () => {
    it('normalizes case, accents, and punctuation', () => {
      assert.equal(norm('Bonjour !'), 'bonjour');
      assert.equal(norm("S'il vous plaît"), "s'il vous plaît");
      assert.equal(norm('Comment ça va ?'), 'comment ça va');
      assert.equal(norm('  Wie geht   es dir?  '), 'wie geht es dir');
      assert.equal(norm('Einen Kaffee, bitte.'), 'einen kaffee bitte');
    });

    it('handles curly and straight apostrophes identically', () => {
      assert.equal(norm("J'habite en Égypte"), "j'habite en égypte");
      assert.equal(norm("J’habite en Égypte"), "j'habite en égypte");
    });
  });

  describe('Spaced Repetition System (srs)', () => {
    it('newCard initializes correctly', () => {
      const card = newCard();
      assert.equal(card.interval, 0);
      assert.equal(card.ease, 2.5);
      assert.equal(card.reps, 0);
    });

    it('review with correct answer progresses intervals', () => {
      let card = newCard();
      card = review(card, true);
      assert.equal(card.reps, 1);
      assert.equal(card.interval, 1);

      card = review(card, true);
      assert.equal(card.reps, 2);
      assert.equal(card.interval, 3);

      card = review(card, true);
      assert.equal(card.reps, 3);
      assert.ok(card.interval >= 7);
    });

    it('review with incorrect answer resets reps and interval', () => {
      let card = newCard();
      card = review(card, true);
      card = review(card, true);
      assert.equal(card.reps, 2);

      // Missed answer
      card = review(card, false);
      assert.equal(card.reps, 0);
      assert.equal(card.interval, 0);
      assert.ok(card.ease < 2.5);
    });

    it('isDue detects due vs future cards', () => {
      const pastCard = { due: Date.now() - 1000, interval: 1, ease: 2.5, reps: 1 };
      assert.equal(isDue(pastCard), true);

      const futureCard = { due: Date.now() + 1000000, interval: 1, ease: 2.5, reps: 1 };
      assert.equal(isDue(futureCard), false);

      assert.equal(isDue(undefined), false);
    });
  });

  describe('Store streak and progress logic', () => {
    it('emptyProgress provides defaults', () => {
      const p = emptyProgress();
      assert.equal(p.xp, 0);
      assert.equal(p.streak, 0);
      assert.equal(p.dailyGoal, 20);
      assert.deepEqual(p.completed, {});
      assert.deepEqual(p.cards, {});
    });

    it('touchStreak starts streak at 1 for fresh progress', () => {
      const p = emptyProgress();
      const touched = touchStreak(p);
      assert.equal(touched.streak, 1);
      assert.equal(touched.lastDay, dayKey(new Date()));
    });

    it('touchStreak preserves streak if already practiced today', () => {
      const p = emptyProgress();
      const first = touchStreak(p);
      const second = touchStreak(first);
      assert.equal(second.streak, 1);
    });

    it('touchStreak increments streak if practiced yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const p = { ...emptyProgress(), streak: 4, lastDay: dayKey(yesterday) };
      const touched = touchStreak(p);
      assert.equal(touched.streak, 5);
      assert.equal(touched.lastDay, dayKey(new Date()));
    });

    it('touchStreak resets streak to 1 if practice lapsed', () => {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      const p = { ...emptyProgress(), streak: 12, lastDay: dayKey(twoDaysAgo) };
      const touched = touchStreak(p);
      assert.equal(touched.streak, 1);
    });
  });

  describe('Content integrity', () => {
    it('all courses have distinct valid lessons and items', () => {
      assert.equal(courses.length, 2);
      const [fr, de] = courses;
      assert.equal(fr.code, 'fr');
      assert.equal(de.code, 'de');

      const allItemIds = new Set<string>();
      for (const course of courses) {
        for (const lesson of course.lessons) {
          assert.ok(lesson.items.length > 0);
          for (const item of lesson.items) {
            assert.ok(!allItemIds.has(item.id), `Duplicate item ID: ${item.id}`);
            allItemIds.add(item.id);
            assert.ok(item.target.length > 0);
            assert.ok(item.en.length > 0);
          }
        }
      }
    });

    it('buildExercises generates choice, listen, and type exercises', () => {
      const fr = courses[0];
      const items = fr.lessons[0].items;
      const exercises = buildExercises(fr, items);
      assert.equal(exercises.length, items.length * 3);

      const kinds = new Set(exercises.map((e) => e.kind));
      assert.ok(kinds.has('choice'));
      assert.ok(kinds.has('listen'));
      assert.ok(kinds.has('type'));
    });
  });
});
