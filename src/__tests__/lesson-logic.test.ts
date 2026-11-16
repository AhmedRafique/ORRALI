import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { norm, stripAccents, evaluateAnswer, buildExercises } from '../exercises';
import { evaluatePronunciation, extractCleanWords } from '../scoring';
import { newCard, review, isDue } from '../srs';
import { emptyProgress, touchStreak, getEffectiveStreak, dayKey } from '../streak';
import { evaluateBadges, getBadgesWithProgress } from '../badges';
import { courses, stories } from '../content';

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

    it('strips accents for forgiving comparison', () => {
      assert.equal(stripAccents('café'), 'cafe');
      assert.equal(stripAccents("s'il vous plaît"), "s'il vous plait");
      assert.equal(stripAccents('Begrüßung'), 'Begrußung');
    });
  });

  describe('Smart Pedagogical Answer Evaluation', () => {
    const pleaseItem = courses[0].lessons[0].items.find((i) => i.id === 'fr-1-4')!;
    const enchanteItem = { id: 'test-1', target: 'Enchanté', en: 'Nice to meet you' };

    it('accepts exact formal target S\'il vous plaît', () => {
      const res = evaluateAnswer("S'il vous plaît", pleaseItem);
      assert.equal(res.ok, true);
      assert.equal(res.expected, "S'il vous plaît");
    });

    it('accepts valid informal alternative S\'il te plaît', () => {
      const res = evaluateAnswer("S'il te plaît", pleaseItem);
      assert.equal(res.ok, true);
      assert.ok(res.hint?.includes("S'il te plaît"));
    });

    it('accepts alternative S\'il tu plait as valid translation', () => {
      const res = evaluateAnswer("S'il tu plait", pleaseItem);
      assert.equal(res.ok, true);
      assert.ok(res.hint?.includes("S'il tu plait"));
    });

    it('accepts unaccented word with friendly educational hint when not in alternatives', () => {
      const res = evaluateAnswer("Enchante", enchanteItem);
      assert.equal(res.ok, true);
      assert.equal(res.isClose, true);
      assert.ok(res.hint?.includes("accents"));
    });

    it('accepts near-miss typo with constructive guidance', () => {
      const res = evaluateAnswer("Enchanti", enchanteItem);
      assert.equal(res.ok, true);
      assert.equal(res.isClose, true);
      assert.ok(res.hint?.includes("spelling"));
    });

    it('rejects genuinely incorrect translations', () => {
      const res = evaluateAnswer("Au revoir", pleaseItem);
      assert.equal(res.ok, false);
      assert.equal(res.expected, "S'il vous plaît");
    });
  });

  describe('Pronunciation & Speech Scoring Engine', () => {
    it('extractCleanWords strips punctuation and splits words', () => {
      const words = extractCleanWords("S'il vous plaît !");
      assert.deepEqual(words, ["Sil", "vous", "plaît"]);
    });

    it('rejects recordings that are too short (accidental taps or silence)', () => {
      const res = evaluatePronunciation('Bonjour', 200);
      assert.equal(res.passed, false);
      assert.equal(res.overallScore, 30);
      assert.ok(res.feedback.includes('too short'));
    });

    it('evaluates cadence and speech envelope for natural spoken duration', () => {
      const res = evaluatePronunciation('Bonjour', 1200, 'Bonjour');
      assert.equal(res.passed, true);
      assert.ok(res.overallScore >= 70);
      assert.equal(res.words.length, 1);
      assert.equal(res.words[0].word, 'Bonjour');
    });

    it('accurately scores transcript when speech recognition is supplied', () => {
      const res = evaluatePronunciation("Comment ça va", 1500, "Comment ca va");
      assert.equal(res.passed, true);
      assert.ok(res.overallScore >= 90);
      assert.equal(res.words[0].status, 'great');
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

    it('review with incorrect answer resets reps and interval and tracks lapses', () => {
      let card = newCard();
      assert.equal(card.lapses, 0);
      card = review(card, true);
      card = review(card, true);
      assert.equal(card.reps, 2);

      // Missed answer (lapse)
      card = review(card, false);
      assert.equal(card.reps, 0);
      assert.equal(card.interval, 0);
      assert.equal(card.lapses, 1);
      assert.ok(card.ease < 2.5);

      // Second lapse
      card = review(card, false);
      assert.equal(card.lapses, 2);
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

    it('touchStreak preserves streak when shielded after missing 1 day', () => {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      const p = { ...emptyProgress(), streak: 6, streakShields: 1, lastDay: dayKey(twoDaysAgo) };
      const touched = touchStreak(p);
      assert.equal(touched.streak, 7);
      assert.equal(touched.streakShields, 0); // 1 shield was consumed to preserve the streak!
      assert.equal(touched.lastDay, dayKey(new Date()));
    });

    it('touchStreak resets streak to 1 when shields are depleted', () => {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      const p = { ...emptyProgress(), streak: 12, streakShields: 0, lastDay: dayKey(twoDaysAgo) };
      const touched = touchStreak(p);
      assert.equal(touched.streak, 1);
    });

    it('touchStreak resets streak to 1 if practice lapsed for more than 2 days', () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const p = { ...emptyProgress(), streak: 12, streakShields: 2, lastDay: dayKey(threeDaysAgo) };
      const touched = touchStreak(p);
      assert.equal(touched.streak, 1);
    });

    it('getEffectiveStreak returns current streak when practiced today or yesterday', () => {
      const today = dayKey(new Date());
      const p1 = { ...emptyProgress(), streak: 5, lastDay: today };
      assert.equal(getEffectiveStreak(p1), 5);

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const p2 = { ...emptyProgress(), streak: 5, lastDay: dayKey(yesterday) };
      assert.equal(getEffectiveStreak(p2), 5);
    });

    it('getEffectiveStreak shows protected streak when shield is available after 1 missed day', () => {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      const p = { ...emptyProgress(), streak: 8, streakShields: 1, lastDay: dayKey(twoDaysAgo) };
      assert.equal(getEffectiveStreak(p), 8);
    });

    it('getEffectiveStreak returns 0 when practice lapsed without shield', () => {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      const p = { ...emptyProgress(), streak: 8, streakShields: 0, lastDay: dayKey(twoDaysAgo) };
      assert.equal(getEffectiveStreak(p), 0);
    });
  });

  describe('Achievement Badges & Trophy Shelf', () => {
    it('evaluates and unlocks First Words badge on completing 1 chapter', () => {
      let p = { ...emptyProgress(), completed: { 'fr-1': true as const } };
      const { updatedProgress, newlyUnlocked } = evaluateBadges(p, courses);
      assert.ok(updatedProgress.badges?.['first_words']);
      assert.equal(newlyUnlocked.length, 1);
      assert.equal(newlyUnlocked[0].id, 'first_words');
    });

    it('evaluates and unlocks XP Explorer on reaching 100 XP', () => {
      let p = { ...emptyProgress(), xp: 120 };
      const { updatedProgress, newlyUnlocked } = evaluateBadges(p, courses);
      assert.ok(updatedProgress.badges?.['xp_centurion']);
      assert.ok(newlyUnlocked.some((b) => b.id === 'xp_centurion'));
    });

    it('evaluates and unlocks Café Regular on completing Au Café', () => {
      let p = { ...emptyProgress(), completed: { 'fr-4': true as const } };
      const { updatedProgress } = evaluateBadges(p, courses);
      assert.ok(updatedProgress.badges?.['cafe_regular']);
    });

    it('getBadgesWithProgress computes accurate progress ratios', () => {
      const p = { ...emptyProgress(), xp: 50 };
      const badgeList = getBadgesWithProgress(p, courses);
      const xpBadge = badgeList.find((b) => b.id === 'xp_centurion')!;
      assert.equal(xpBadge.current, 50);
      assert.equal(xpBadge.target, 100);
      assert.equal(xpBadge.unlocked, false);
    });
  });

  describe('In-Progress Lesson Checkpoint Lifecycle', () => {
    it('emptyProgress initializes with empty checkpoints', () => {
      const p = emptyProgress();
      assert.deepEqual(p.checkpoints, {});
    });

    it('saves in-progress checkpoint when user exits mid-lesson', () => {
      let p = emptyProgress();
      const cp = {
        lessonId: 'fr-1',
        exerciseIndex: 6,
        totalExercises: 18,
        correctIds: ['fr-1-1', 'fr-1-2'],
        wrongIds: ['fr-1-3'],
        updatedAt: Date.now(),
      };
      p = { ...p, checkpoints: { ...(p.checkpoints ?? {}), [cp.lessonId]: cp } };

      assert.ok(p.checkpoints?.['fr-1']);
      assert.equal(p.checkpoints?.['fr-1'].exerciseIndex, 6);
      assert.deepEqual(p.checkpoints?.['fr-1'].correctIds, ['fr-1-1', 'fr-1-2']);
    });

    it('clears checkpoint upon lesson completion', () => {
      let p = emptyProgress();
      p = {
        ...p,
        checkpoints: {
          'fr-1': {
            lessonId: 'fr-1',
            exerciseIndex: 12,
            totalExercises: 18,
            correctIds: ['fr-1-1'],
            wrongIds: [],
            updatedAt: Date.now(),
          },
        },
      };

      // Simulate lesson finish
      const nextCheckpoints = { ...p.checkpoints };
      delete nextCheckpoints['fr-1'];
      p = { ...p, checkpoints: nextCheckpoints };

      assert.equal(p.checkpoints?.['fr-1'], undefined);
    });

    it('clears checkpoint when user decides to start from beginning', () => {
      let p = emptyProgress();
      p = {
        ...p,
        checkpoints: {
          'de-1': {
            lessonId: 'de-1',
            exerciseIndex: 8,
            totalExercises: 18,
            correctIds: ['de-1-1'],
            wrongIds: [],
            updatedAt: Date.now(),
          },
        },
      };

      // User chose Start from Beginning
      const cps = { ...p.checkpoints };
      delete cps['de-1'];
      p = { ...p, checkpoints: cps };

      assert.equal(p.checkpoints?.['de-1'], undefined);
    });
  });

  describe('Content integrity', () => {
    it('all courses have distinct valid lessons and items with ISO 639-1 speech codes', () => {
      assert.ok(courses.length >= 3);
      for (const course of courses) {
        assert.ok(['fr', 'de', 'es'].includes(course.code));
        assert.equal(course.speechLang, course.code);
      }

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

    it('buildExercises generates scaffolding with intro, choice, listen, speak, and type', () => {
      const fr = courses[0];
      const items = fr.lessons[0].items;
      const exercises = buildExercises(fr, items, false);

      // Verify the first exercise is an intro card (teaching the learner first!)
      assert.equal(exercises[0].kind, 'intro');

      const kinds = new Set(exercises.map((e) => e.kind));
      assert.ok(kinds.has('intro'));
      assert.ok(kinds.has('choice'));
      assert.ok(kinds.has('listen'));
      assert.ok(kinds.has('speak'));
      assert.ok(kinds.has('type'));
    });
it('buildExercises skips intro cards in review mode', () => {
  const fr = courses[0];
  const items = fr.lessons[0].items.slice(0, 3);
  const reviewExercises = buildExercises(fr, items, true);

  const kinds = new Set(reviewExercises.map((e) => e.kind));
  assert.ok(!kinds.has('intro'));
  assert.ok(kinds.has('choice'));
  assert.ok(kinds.has('listen'));
  assert.ok(kinds.has('speak'));
  assert.ok(kinds.has('type'));
});

it('all stories have valid dialog turns and comprehension checks', () => {
  assert.ok(stories.length >= 2);
  for (const story of stories) {
    assert.ok(story.dialog.length >= 4);
    assert.ok(story.question.options.length >= 2);
    assert.ok(story.question.correctIndex >= 0);
  }
});
  });
});
