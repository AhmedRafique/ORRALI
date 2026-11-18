import * as SQLite from 'expo-sqlite';
import { LearningEvent, LearningEventFilter, LangCode } from './types';

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
          CREATE TABLE IF NOT EXISTS learning_events (
            id TEXT PRIMARY KEY,
            language_id TEXT NOT NULL,
            activity_id TEXT NOT NULL,
            objective_ids TEXT NOT NULL,
            result TEXT NOT NULL,
            score REAL,
            difficulty TEXT NOT NULL,
            duration_ms INTEGER NOT NULL,
            hints_used INTEGER NOT NULL,
            attempts_count INTEGER NOT NULL,
            confidence REAL NOT NULL,
            error_category TEXT,
            payload TEXT,
            created_at INTEGER NOT NULL
          );
          CREATE INDEX IF NOT EXISTS idx_learning_events_lang_created ON learning_events (language_id, created_at);
          CREATE INDEX IF NOT EXISTS idx_learning_events_activity ON learning_events (activity_id);
          CREATE INDEX IF NOT EXISTS idx_learning_events_error_cat ON learning_events (error_category);
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

export interface ItemAttemptStats {
  itemId: string;
  totalAttempts: number;
  passCount: number;
  failCount: number;
  lastFailedAt: number;
}

export async function getItemAttemptStatsFromDb(
  courseCode: string
): Promise<Record<string, ItemAttemptStats>> {
  try {
    const db = await getDb();
    if (!db) return {};
    const rows = await db.getAllAsync<{
      item_id: string;
      total: number;
      correct: number;
      fails: number;
      last_fail: number;
    }>(
      `SELECT 
        item_id, 
        COUNT(*) as total, 
        SUM(is_correct) as correct,
        SUM(CASE WHEN is_correct = 0 THEN 1 ELSE 0 END) as fails,
        MAX(CASE WHEN is_correct = 0 THEN timestamp ELSE 0 END) as last_fail
      FROM exercise_attempts
      WHERE course_code = ?
      GROUP BY item_id;`,
      courseCode
    );

    const stats: Record<string, ItemAttemptStats> = {};
    for (const r of rows) {
      stats[r.item_id] = {
        itemId: r.item_id,
        totalAttempts: r.total,
        passCount: r.correct,
        failCount: r.fails,
        lastFailedAt: r.last_fail,
      };
    }
    return stats;
  } catch (err) {
    console.warn('[ORRALI SQLite] getItemAttemptStatsFromDb error:', err);
    return {};
  }
}

export async function recordLearningEventToDb(event: LearningEvent): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;
    await db.runAsync(
      `INSERT OR REPLACE INTO learning_events (
        id, language_id, activity_id, objective_ids, result, score, difficulty,
        duration_ms, hints_used, attempts_count, confidence, error_category, payload, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      event.id,
      event.languageId,
      event.activityId,
      JSON.stringify(event.objectiveIds),
      event.result,
      event.score ?? null,
      event.difficulty,
      event.durationMs,
      event.hintsUsed,
      event.attemptsCount,
      event.confidence,
      event.errorCategory ?? null,
      event.payload ? JSON.stringify(event.payload) : null,
      event.createdAt
    );
    return true;
  } catch (err) {
    console.warn('[ORRALI SQLite] recordLearningEventToDb error:', err);
    return false;
  }
}

export async function recordLearningEventsBatchToDb(events: LearningEvent[]): Promise<boolean> {
  if (events.length === 0) return true;
  try {
    const db = await getDb();
    if (!db) return false;
    await db.withTransactionAsync(async () => {
      for (const event of events) {
        await db.runAsync(
          `INSERT OR REPLACE INTO learning_events (
            id, language_id, activity_id, objective_ids, result, score, difficulty,
            duration_ms, hints_used, attempts_count, confidence, error_category, payload, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          event.id,
          event.languageId,
          event.activityId,
          JSON.stringify(event.objectiveIds),
          event.result,
          event.score ?? null,
          event.difficulty,
          event.durationMs,
          event.hintsUsed,
          event.attemptsCount,
          event.confidence,
          event.errorCategory ?? null,
          event.payload ? JSON.stringify(event.payload) : null,
          event.createdAt
        );
      }
    });
    return true;
  } catch (err) {
    console.warn('[ORRALI SQLite] recordLearningEventsBatchToDb error:', err);
    return false;
  }
}

export async function queryLearningEventsFromDb(filter: LearningEventFilter = {}): Promise<LearningEvent[]> {
  try {
    const db = await getDb();
    if (!db) return [];

    const conditions: string[] = [];
    const params: any[] = [];

    if (filter.languageId) {
      conditions.push('language_id = ?');
      params.push(filter.languageId);
    }
    if (filter.activityId) {
      conditions.push('activity_id = ?');
      params.push(filter.activityId);
    }
    if (filter.result) {
      conditions.push('result = ?');
      params.push(filter.result);
    }
    if (filter.errorCategory) {
      conditions.push('error_category = ?');
      params.push(filter.errorCategory);
    }
    if (filter.sinceTimestamp) {
      conditions.push('created_at >= ?');
      params.push(filter.sinceTimestamp);
    }
    if (filter.untilTimestamp) {
      conditions.push('created_at <= ?');
      params.push(filter.untilTimestamp);
    }

    let query = 'SELECT * FROM learning_events';
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY created_at DESC';
    if (filter.limit && filter.limit > 0) {
      query += ` LIMIT ${Math.floor(filter.limit)}`;
    }

    const rows = await db.getAllAsync<any>(query, params);
    const events: LearningEvent[] = [];

    for (const r of rows) {
      let objectiveIds: string[] = [];
      try {
        objectiveIds = JSON.parse(r.objective_ids);
      } catch {}

      if (filter.objectiveId && !objectiveIds.includes(filter.objectiveId)) {
        continue;
      }

      let payload: Record<string, any> | undefined;
      if (r.payload) {
        try {
          payload = JSON.parse(r.payload);
        } catch {}
      }

      events.push({
        id: r.id,
        languageId: r.language_id,
        activityId: r.activity_id,
        objectiveIds,
        result: r.result,
        score: r.score ?? undefined,
        difficulty: r.difficulty,
        durationMs: r.duration_ms,
        hintsUsed: r.hints_used,
        attemptsCount: r.attempts_count,
        confidence: r.confidence,
        errorCategory: r.error_category ?? undefined,
        payload,
        createdAt: r.created_at,
      });
    }

    return events;
  } catch (err) {
    console.warn('[ORRALI SQLite] queryLearningEventsFromDb error:', err);
    return [];
  }
}

export async function getLearningEventsCountFromDb(
  languageId?: LangCode
): Promise<{ total: number; correct: number; errors: number }> {
  try {
    const db = await getDb();
    if (!db) return { total: 0, correct: 0, errors: 0 };

    let query = `SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN result = 'correct' THEN 1 ELSE 0 END) as correct,
      SUM(CASE WHEN result IN ('incorrect', 'partially_correct') THEN 1 ELSE 0 END) as errors
      FROM learning_events`;
    const params: any[] = [];
    if (languageId) {
      query += ' WHERE language_id = ?';
      params.push(languageId);
    }

    const row = await db.getFirstAsync<{ total: number; correct: number; errors: number }>(query, params);
    return {
      total: row?.total ?? 0,
      correct: row?.correct ?? 0,
      errors: row?.errors ?? 0,
    };
  } catch (err) {
    console.warn('[ORRALI SQLite] getLearningEventsCountFromDb error:', err);
    return { total: 0, correct: 0, errors: 0 };
  }
}

export async function getRecentStumblesFromDb(
  languageId: LangCode,
  limit: number = 10
): Promise<Array<{ objectiveId: string; errorCategory: string; count: number }>> {
  try {
    const db = await getDb();
    if (!db) return [];

    const rows = await db.getAllAsync<{
      objective_ids: string;
      error_category: string;
    }>(
      `SELECT objective_ids, error_category FROM learning_events
       WHERE language_id = ? AND result IN ('incorrect', 'partially_correct')
       ORDER BY created_at DESC LIMIT 100;`,
      languageId
    );

    const counts: Record<string, { objectiveId: string; errorCategory: string; count: number }> = {};
    for (const r of rows) {
      let objs: string[] = [];
      try {
        objs = JSON.parse(r.objective_ids);
      } catch {}
      const primaryObj = objs[0] ?? 'general';
      const key = `${primaryObj}::${r.error_category || 'general'}`;
      if (!counts[key]) {
        counts[key] = {
          objectiveId: primaryObj,
          errorCategory: r.error_category || 'general',
          count: 0,
        };
      }
      counts[key].count += 1;
    }

    return Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  } catch (err) {
    console.warn('[ORRALI SQLite] getRecentStumblesFromDb error:', err);
    return [];
  }
}

