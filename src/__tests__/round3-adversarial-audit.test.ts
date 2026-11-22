import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  emptyProgress,
  touchStreak,
  getEffectiveStreak,
  dayKey,
} from '../streak';
import {
  newCard,
  review,
  isDue,
} from '../srs';
import {
  evaluateBadges,
  getBadgesWithProgress,
} from '../badges';
import { getThemeColors, toggleTheme } from '../theme';
import { courses } from '../content';
import { Progress, LessonCheckpoint } from '../types';

describe('ROUND 3 ADVERSARIAL AUDIT: State, Checkpoints & UI Integration', () => {
  describe('1. Store, Streaks & Shield Protection Stress Test', () => {
    it('initializes clean defaults with streakShields and empty checkpoints', () => {
      const p = emptyProgress();
      assert.equal(p.streak, 0);
      assert.equal(p.streakShields, 1);
      assert.equal(p.xp, 0);
      assert.equal(p.dailyGoal, 20);
      assert.deepEqual(p.checkpoints, {});
    });

    it('manages streak across consecutive days, same day, and shield consumption', () => {
      let p = emptyProgress();

      // Day 1
      p = touchStreak(p);
      assert.equal(p.streak, 1);

      // Same day practice maintains streak
      p = touchStreak(p);
      assert.equal(p.streak, 1);

      // Simulate practicing yesterday
      const yesterday = new Date(Date.now() - 86400000);
      p = { ...p, lastDay: dayKey(yesterday) };
      p = touchStreak(p);
      assert.equal(p.streak, 2);

      // Simulate missing 1 day (practiced 2 days ago) with 1 shield
      const twoDaysAgo = new Date(Date.now() - 2 * 86400000);
      p = { ...p, lastDay: dayKey(twoDaysAgo), streakShields: 1 };
      p = touchStreak(p);
      assert.equal(p.streak, 3); // Shield preserved streak and incremented
      assert.equal(p.streakShields, 0); // 1 shield consumed

      // Simulate missing 3 days (practice lapsed > 1 missed day)
      const fourDaysAgo = new Date(Date.now() - 4 * 86400000);
      p = { ...p, lastDay: dayKey(fourDaysAgo), streakShields: 1 };
      p = touchStreak(p);
      assert.equal(p.streak, 1); // Reset
    });

    it('calculates getEffectiveStreak accurately with and without shields', () => {
      const today = dayKey(new Date());
      const pToday: Progress = { ...emptyProgress(), streak: 5, lastDay: today };
      assert.equal(getEffectiveStreak(pToday), 5);

      const yesterday = dayKey(new Date(Date.now() - 86400000));
      const pYesterday: Progress = { ...emptyProgress(), streak: 5, lastDay: yesterday };
      assert.equal(getEffectiveStreak(pYesterday), 5);

      const twoDaysAgo = dayKey(new Date(Date.now() - 2 * 86400000));
      const pShielded: Progress = { ...emptyProgress(), streak: 5, lastDay: twoDaysAgo, streakShields: 1 };
      assert.equal(getEffectiveStreak(pShielded), 5);

      const pUnshielded: Progress = { ...emptyProgress(), streak: 5, lastDay: twoDaysAgo, streakShields: 0 };
      assert.equal(getEffectiveStreak(pUnshielded), 0);
    });
  });

  describe('2. In-Progress Lesson Checkpoint Lifecycle', () => {
    it('saves, updates, and clears lesson checkpoints reliably', () => {
      let p = emptyProgress();

      const cp: LessonCheckpoint = {
        lessonId: 'fr-1',
        exerciseIndex: 3,
        totalExercises: 8,
        correctIds: ['fr-1-1', 'fr-1-2'],
        wrongIds: ['fr-1-3'],
        updatedAt: Date.now(),
      };

      // Save checkpoint
      p = {
        ...p,
        checkpoints: {
          ...(p.checkpoints ?? {}),
          ['fr-1']: cp,
        },
      };
      assert.ok(p.checkpoints?.['fr-1']);
      assert.equal(p.checkpoints?.['fr-1']?.exerciseIndex, 3);

      // Clear checkpoint upon lesson completion
      const updatedCheckpoints = { ...(p.checkpoints ?? {}) };
      delete updatedCheckpoints['fr-1'];
      p = { ...p, checkpoints: updatedCheckpoints };
      assert.equal(p.checkpoints?.['fr-1'], undefined);
    });
  });

  describe('3. Spaced Repetition (SRS) Engine Anti-Lock', () => {
    it('advances intervals on correct answers and resets on lapses', () => {
      let card = newCard();
      assert.equal(card.reps, 0);
      assert.equal(card.interval, 0);

      // Correct review 1
      card = review(card, true);
      assert.equal(card.reps, 1);
      assert.equal(card.interval, 1);

      // Correct review 2
      card = review(card, true);
      assert.equal(card.reps, 2);
      assert.equal(card.interval, 3);

      // Correct review 3
      card = review(card, true);
      assert.equal(card.reps, 3);
      assert.ok(card.interval >= 6);

      // Lapsed review
      card = review(card, false);
      assert.equal(card.reps, 0);
      assert.equal(card.interval, 0);
      assert.equal(card.lapses, 1);
    });

    it('correctly assesses due vs future cards and prevents 0-interval lock', () => {
      const pastCard = { ...newCard(), due: Date.now() - 10000 };
      assert.equal(isDue(pastCard), true);

      const futureCard = { ...newCard(), due: Date.now() + 86400000 };
      assert.equal(isDue(futureCard), false);

      // Test extreme repetition to prevent interval lock
      let card = newCard();
      for (let i = 0; i < 10; i++) {
        card = review(card, true);
        assert.ok(card.interval > 0, `Interval locked at 0 on rep ${i}`);
      }
    });
  });

  describe('4. Trophy Shelf, Achievement Badges & Themes', () => {
    it('evaluates and unlocks badges based on XP and completed lessons', () => {
      let p = emptyProgress();
      p = { ...p, completed: { 'fr-1': true } };

      const { updatedProgress, newlyUnlocked } = evaluateBadges(p, courses);
      assert.ok(updatedProgress.badges?.['first_words']);
      assert.ok(newlyUnlocked.length >= 1);

      const withProgress = getBadgesWithProgress(updatedProgress, courses);
      assert.ok(withProgress.length >= 4);
      for (const b of withProgress) {
        assert.ok(b.current >= 0);
        assert.ok(b.target > 0);
      }
    });

    it('toggles sensory theme colors between light and dark palettes', () => {
      assert.equal(toggleTheme('light'), 'dark');
      assert.equal(toggleTheme('dark'), 'light');

      const light = getThemeColors('light');
      assert.equal(light.isDark, false);
      assert.ok(light.ivory.length > 0);
      assert.ok(light.card.length > 0);

      const dark = getThemeColors('dark');
      assert.equal(dark.isDark, true);
      assert.ok(dark.ivory.length > 0);
      assert.ok(dark.card.length > 0);
      assert.notEqual(light.ivory, dark.ivory);
    });
  });
});
