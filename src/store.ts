import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadProgressFromDb, saveProgressToDb } from './db';
import { Progress } from './types';
import { emptyProgress } from './streak';

export * from './streak';

const KEY = 'orrali.progress.v2';
const LEGACY_KEY = 'lingo.progress.v1';
const LANGUAGE_KEY = 'orrali.language.v1';

export async function loadProgress(): Promise<Progress> {
  try {
    // 1. Try primary SQLite database
    let raw = await loadProgressFromDb();

    // 2. Fall back to AsyncStorage if SQLite had no record
    if (!raw) {
      raw = (await AsyncStorage.getItem(KEY)) ?? (await AsyncStorage.getItem(LEGACY_KEY));
      // Auto-migrate from AsyncStorage into SQLite
      if (raw) {
        void saveProgressToDb(raw);
      }
    }

    if (!raw) return emptyProgress();

    const parsed = JSON.parse(raw) as Partial<Progress>;
    return {
      ...emptyProgress(),
      ...parsed,
      courseXp: parsed.courseXp ?? {},
      checkpoints: parsed.checkpoints ?? {},
      dailyGoal: parsed.dailyGoal ?? 20,
      dailyXp: parsed.dailyXp ?? 0,
      dailyXpDay: parsed.dailyXpDay ?? '',
    };
  } catch (err) {
    console.warn('[ORRALI Store] loadProgress error:', err);
    return emptyProgress();
  }
}

export async function saveProgress(p: Progress): Promise<void> {
  const json = JSON.stringify(p);
  // Dual-layer persistence: SQLite primary + AsyncStorage backup
  try {
    await saveProgressToDb(json);
  } catch (err) {
    console.warn('[ORRALI Store] saveProgress SQLite error:', err);
  }

  try {
    await AsyncStorage.setItem(KEY, json);
  } catch (err) {
    console.warn('[ORRALI Store] saveProgress AsyncStorage error:', err);
  }
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
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, value);
  } catch {
    /* best-effort */
  }
}
