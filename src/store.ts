import AsyncStorage from '@react-native-async-storage/async-storage';
import { Progress } from './types';

const KEY = 'orrali.progress.v2';
const LEGACY_KEY = 'lingo.progress.v1';
const LANGUAGE_KEY = 'orrali.language.v1';

export const emptyProgress = (): Progress => ({
  xp: 0,
  streak: 0,
  lastDay: '',
  dailyGoal: 20,
  dailyXp: 0,
  dailyXpDay: '',
  completed: {},
  cards: {},
});

export async function loadProgress(): Promise<Progress> {
  try {
    const raw = (await AsyncStorage.getItem(KEY)) ?? (await AsyncStorage.getItem(LEGACY_KEY));
    if (!raw) return emptyProgress();
    const parsed = JSON.parse(raw) as Partial<Progress>;
    return { ...emptyProgress(), ...parsed, dailyGoal: parsed.dailyGoal ?? 20, dailyXp: parsed.dailyXp ?? 0, dailyXpDay: parsed.dailyXpDay ?? '' };
  } catch {
    return emptyProgress();
  }
}

export async function saveProgress(p: Progress): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    // Persistence is best-effort; the current session remains usable.
  }
}

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

export async function loadLanguage(): Promise<'fr' | 'de'> {
  try {
    const value = await AsyncStorage.getItem(LANGUAGE_KEY);
    return value === 'de' ? 'de' : 'fr';
  } catch {
    return 'fr';
  }
}

export async function saveLanguage(value: 'fr' | 'de'): Promise<void> {
  try { await AsyncStorage.setItem(LANGUAGE_KEY, value); } catch { /* best-effort */ }
}
