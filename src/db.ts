import * as SQLite from 'expo-sqlite';

let dbInstance: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<SQLite.SQLiteDatabase | null> | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase | null> {
  if (dbInstance) return dbInstance;
  if (!initPromise) {
    initPromise = (async () => {
      try {
        const db = await SQLite.openDatabaseAsync('orrali.db');
        await db.execAsync(`
          PRAGMA journal_mode = WAL;
          CREATE TABLE IF NOT EXISTS progress_store (
            id TEXT PRIMARY KEY,
            data TEXT NOT NULL,
            updated_at INTEGER NOT NULL
          );
          CREATE TABLE IF NOT EXISTS exercise_attempts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_id TEXT NOT NULL,
            course_code TEXT NOT NULL,
            kind TEXT NOT NULL,
            is_correct INTEGER NOT NULL,
            timestamp INTEGER NOT NULL
          );
          CREATE INDEX IF NOT EXISTS idx_attempts_course_item ON exercise_attempts (course_code, item_id);
        `);
        dbInstance = db;
        return db;
      } catch (err) {
        console.warn('[ORRALI SQLite] Init failed, falling back to AsyncStorage:', err);
        return null;
      }
    })();
  }
  return initPromise;
}

export async function saveProgressToDb(jsonString: string): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;
    await db.runAsync(
      'INSERT OR REPLACE INTO progress_store (id, data, updated_at) VALUES (?, ?, ?);',
      'main',
      jsonString,
      Date.now()
    );
    return true;
  } catch (err) {
    console.warn('[ORRALI SQLite] saveProgressToDb error:', err);
    return false;
  }
}

export async function loadProgressFromDb(): Promise<string | null> {
  try {
    const db = await getDb();
    if (!db) return null;
    const row = await db.getFirstAsync<{ data: string }>(
      'SELECT data FROM progress_store WHERE id = ?;',
      'main'
    );
    return row?.data ?? null;
  } catch (err) {
    console.warn('[ORRALI SQLite] loadProgressFromDb error:', err);
    return null;
  }
}

export async function recordAttemptToDb(
  itemId: string,
  courseCode: string,
  kind: string,
  isCorrect: boolean
): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;
    await db.runAsync(
      'INSERT INTO exercise_attempts (item_id, course_code, kind, is_correct, timestamp) VALUES (?, ?, ?, ?, ?);',
      itemId,
      courseCode,
      kind,
      isCorrect ? 1 : 0,
      Date.now()
    );
  } catch (err) {
    console.warn('[ORRALI SQLite] recordAttemptToDb error:', err);
  }
}

export async function getAttemptsCountFromDb(): Promise<{ total: number; correct: number }> {
  try {
    const db = await getDb();
    if (!db) return { total: 0, correct: 0 };
    const row = await db.getFirstAsync<{ total: number; correct: number }>(
      'SELECT COUNT(*) as total, SUM(is_correct) as correct FROM exercise_attempts;'
    );
    return {
      total: row?.total ?? 0,
      correct: row?.correct ?? 0,
    };
  } catch (err) {
    console.warn('[ORRALI SQLite] getAttemptsCountFromDb error:', err);
    return { total: 0, correct: 0 };
  }
}
