import { dayKey } from './streak';
import { Progress } from './types';

export interface StreakReminder {
  scheduledTime: Date;
  title: string;
  body: string;
  isShieldAtRisk: boolean;
}

/**
 * Calculates offline-safe notification schedule to help learners preserve their streaks
 * and protect their Streak Freeze Shields.
 */
export function getNextStreakReminder(progress: Progress, now = new Date()): StreakReminder {
  const today = dayKey(now);
  const alreadyPracticedToday = progress.lastDay === today;
  const streak = progress.streak;
  const shields = progress.streakShields ?? 1;

  if (!alreadyPracticedToday && streak > 0) {
    // Has not practiced today -> urgent evening reminder
    const target = new Date(now);
    if (now.getHours() >= 20) {
      // It is already past 20:00 tonight, schedule in 15 minutes before midnight
      target.setMinutes(target.getMinutes() + 15);
    } else {
      target.setHours(20, 0, 0, 0);
    }

    const shieldText =
      shields > 0
        ? `Your Streak Freeze Shield (${shields} remaining) is on standby.`
        : 'No shields remaining — practice now to keep your streak!';

    return {
      scheduledTime: target,
      title: '🔥 Protect Your Streak Today!',
      body: `Don't let your ${streak}-day streak expire tonight! ${shieldText}`,
      isShieldAtRisk: true,
    };
  }

  // Already practiced today -> schedule for tomorrow at 19:00 (7 PM)
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(19, 0, 0, 0);

  return {
    scheduledTime: tomorrow,
    title: '✨ Keep Your Momentum Going!',
    body: `Ready for day ${streak + 1}? Jump into ORRALI to maintain your ${streak}-day streak!`,
    isShieldAtRisk: false,
  };
}
