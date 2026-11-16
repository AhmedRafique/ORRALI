import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { stories } from '../content';
import { emptyProgress } from '../streak';
import { getNextStreakReminder } from '../notifications';

describe('Deep Immersion & Daily Habit Engine (TDD)', () => {
  describe('1. Advanced B2 Dialog Stories', () => {
    it('contains advanced B2 real-world stories for both French and German', () => {
      const b2Stories = stories.filter((s) => s.level.startsWith('B2'));
      assert.ok(b2Stories.length >= 2);

      const frB2 = b2Stories.find((s) => s.courseCode === 'fr')!;
      assert.ok(frB2.title.includes('Entretien'));
      assert.ok(frB2.dialog.length >= 4);
      assert.ok(frB2.question.prompt.length > 0);
      assert.ok(frB2.question.options.length >= 3);

      const deB2 = b2Stories.find((s) => s.courseCode === 'de')!;
      assert.ok(deB2.title.includes('Wohnungsbesichtigung'));
      assert.ok(deB2.dialog.length >= 4);
      assert.ok(deB2.question.prompt.length > 0);
      assert.ok(deB2.question.options.length >= 3);
    });
  });

  describe('2. Smart Streak & Shield Protection Notification Scheduler', () => {
    it('schedules urgent evening reminder when learner has not practiced today', () => {
      const p = {
        ...emptyProgress(),
        streak: 5,
        lastDay: '2026-11-15', // Practiced yesterday, not today (today is 2026-11-16)
        streakShields: 1,
      };

      const reminder = getNextStreakReminder(p, new Date('2026-11-16T10:00:00Z'));
      assert.equal(reminder.isShieldAtRisk, true);
      assert.ok(reminder.title.includes('Streak'));
      assert.ok(reminder.body.includes('5-day streak'));
    });

    it('schedules routine next-day reminder when learner has already practiced today', () => {
      const p = {
        ...emptyProgress(),
        streak: 6,
        lastDay: '2026-11-16', // Practiced today
        streakShields: 2,
      };

      const reminder = getNextStreakReminder(p, new Date('2026-11-16T14:00:00Z'));
      assert.equal(reminder.isShieldAtRisk, false);
      assert.ok(reminder.body.includes('6-day streak'));
    });
  });
});
