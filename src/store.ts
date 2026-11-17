import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadProgressFromDb, saveProgressToDb } from './db';
import { LangCode, Progress } from './types';
import { ThemeMode } from './theme';
import { emptyProgress } from './streak';

export * from './streak';

const KEY = 'orrali.progress.v2';
const LEGACY_KEY = 'orrali.progress.v1';
const LANGUAGE_KEY = 'orrali.lang.v1';
const THEME_KEY = 'orrali.theme.v1';

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

export async function loadLanguage(): Promise<LangCode> {
  try {
    const value = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (value === 'de' || value === 'es') return value;
    return 'fr';
  } catch {
    return 'fr';
  }
}

export async function saveLanguage(value: LangCode): Promise<void> {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, value);
  } catch {
    /* best-effort */
  }
}

export async function loadThemeMode(): Promise<ThemeMode> {
  try {
    const value = await AsyncStorage.getItem(THEME_KEY);
    return value === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export async function saveThemeMode(value: ThemeMode): Promise<void> {
  try {
    await AsyncStorage.setItem(THEME_KEY, value);
  } catch {
    /* best-effort */
  }
}
