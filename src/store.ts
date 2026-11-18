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
  let sqliteRaw: string | null = null;
  let asyncRaw: string | null = null;

  try {
    sqliteRaw = await loadProgressFromDb();
  } catch {
    sqliteRaw = null;
  }

  try {
    asyncRaw = (await AsyncStorage.getItem(KEY)) ?? (await AsyncStorage.getItem(LEGACY_KEY));
  } catch {
    asyncRaw = null;
  }

  // Parse both sources to pick whichever has the newer _savedAt timestamp
  let sqliteData: (Progress & { _savedAt?: number }) | null = null;
  let asyncData: (Progress & { _savedAt?: number }) | null = null;

  if (sqliteRaw) {
    try {
      sqliteData = JSON.parse(sqliteRaw);
    } catch {
      sqliteData = null;
    }
  }

  if (asyncRaw) {
    try {
      asyncData = JSON.parse(asyncRaw);
    } catch {
      asyncData = null;
    }
  }

  // Reconcile: Pick whichever source has the newer timestamp
  let chosen = sqliteData;
  if (!chosen || (asyncData && (asyncData._savedAt ?? 0) > (chosen._savedAt ?? 0))) {
    chosen = asyncData;
  }

  if (!chosen) return emptyProgress();

  // If AsyncStorage was newer than SQLite, heal and re-synchronize SQLite
  if (
    asyncData &&
    chosen === asyncData &&
    (!sqliteData || (asyncData._savedAt ?? 0) > (sqliteData._savedAt ?? 0))
  ) {
    void saveProgressToDb(JSON.stringify(chosen));
  }

  return {
    ...emptyProgress(),
    ...chosen,
    courseXp: chosen.courseXp ?? {},
    checkpoints: chosen.checkpoints ?? {},
    dailyGoal: chosen.dailyGoal ?? 20,
    dailyXp: chosen.dailyXp ?? 0,
    dailyXpDay: chosen.dailyXpDay ?? '',
  };
}

export async function saveProgress(p: Progress): Promise<void> {
  const payload = {
    ...p,
    _savedAt: Date.now(),
  };
  const json = JSON.stringify(payload);

  // Dual-layer persistence: SQLite primary + AsyncStorage backup
  let sqliteSuccess = false;
  try {
    sqliteSuccess = await saveProgressToDb(json);
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
