import { Progress } from './types';

export const emptyProgress = (): Progress => ({
  xp: 0,
  courseXp: {},
  streak: 0,
  lastDay: '',
  dailyGoal: 20,
  dailyXp: 0,
  dailyXpDay: '',
  completed: {},
  cards: {},
  checkpoints: {},
});

export const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function touchStreak(p: Progress): Progress {
  const today = dayKey(new Date());
  if (p.lastDay === today) return p;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const streak = p.lastDay === dayKey(yesterday) ? p.streak + 1 : 1;
  return { ...p, streak, lastDay: today, dailyXp: p.dailyXpDay === today ? p.dailyXp : 0, dailyXpDay: today };
}

export function getEffectiveStreak(p: Progress): number {
  const today = dayKey(new Date());
  if (p.lastDay === today) return p.streak;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (p.lastDay === dayKey(yesterday)) return p.streak;
  return 0; // Streak lapsed
}
