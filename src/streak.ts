import { Progress } from './types';

export const emptyProgress = (): Progress => ({
  xp: 0,
  courseXp: {},
  streak: 0,
  streakShields: 1, // Start with 1 complimentary streak freeze shield
  lastDay: '',
  dailyGoal: 20,
  dailyXp: 0,
  dailyXpDay: '',
  completed: {},
  completedStories: {},
  cards: {},
  checkpoints: {},
  badges: {},
});

export const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function touchStreak(p: Progress, now = new Date()): Progress {
  const today = dayKey(now);
  if (p.lastDay === today) return p;

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = dayKey(yesterday);

  const twoDaysAgo = new Date(now);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  const twoDaysAgoKey = dayKey(twoDaysAgo);

  let streak = 1;
  let shields = p.streakShields ?? 1;
  let shieldUsedDay = p.lastShieldUsed;

  if (p.lastDay === yesterdayKey) {
    // Normal consecutive day practice
    streak = p.streak + 1;
    // Recharge a shield on milestone streaks (every 3 or 7 days, max 2)
    if (streak === 3 || streak % 7 === 0) {
      shields = Math.min(2, shields + 1);
    }
  } else if (p.lastDay === twoDaysAgoKey && shields > 0) {
    // Missed exactly 1 day, but saved by Streak Shield!
    shields = shields - 1;
    streak = p.streak + 1;
    shieldUsedDay = today;
  } else {
    // Practice lapsed for more than 1 day or no shields remaining
    streak = 1;
  }

  return {
    ...p,
    streak,
    streakShields: shields,
    lastShieldUsed: shieldUsedDay,
    lastDay: today,
  };
}

export function getEffectiveStreak(p: Progress, now = new Date()): number {
  const today = dayKey(now);
  if (p.lastDay === today) return p.streak;

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (p.lastDay === dayKey(yesterday)) return p.streak;

  const twoDaysAgo = new Date(now);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  if (p.lastDay === dayKey(twoDaysAgo) && (p.streakShields ?? 0) > 0) {
    return p.streak;
  }

  return 0;
}
