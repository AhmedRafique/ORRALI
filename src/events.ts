import {
  LangCode,
  LearningActivityKind,
  LearningEventResult,
  LearningErrorCategory,
  LearningEvent,
  LearningEventFilter,
  LearningEventsSummary,
  ExerciseKind,
} from './types';

export interface EventPersistenceHandler {
  recordEvent: (event: LearningEvent) => Promise<boolean>;
  recordBatch: (events: LearningEvent[]) => Promise<boolean>;
  queryEvents: (filter: LearningEventFilter) => Promise<LearningEvent[]>;
}

let persistenceHandler: EventPersistenceHandler | null = null;
let inMemoryEvents: LearningEvent[] = [];
const MAX_IN_MEMORY_EVENTS = 500;

export function setEventPersistenceHandler(handler: EventPersistenceHandler | null): void {
  persistenceHandler = handler;
}

export function getEventPersistenceHandler(): EventPersistenceHandler | null {
  return persistenceHandler;
}

export interface CreateLearningEventParams {
  id?: string;
  languageId: LangCode;
  activityId: LearningActivityKind;
  objectiveIds?: string[];
  result: LearningEventResult;
  score?: number;
  difficulty?: 'A1' | 'A2' | 'B1' | 'B2' | string;
  durationMs?: number;
  hintsUsed?: number;
  attemptsCount?: number;
  confidence?: number;
  errorCategory?: LearningErrorCategory;
  payload?: Record<string, any>;
  createdAt?: number;
}

/**
 * Derives objective tags for fine-grained learner model tracking.
 */
export function deriveObjectiveIds(params: {
  itemId?: string;
  level?: string;
  activityId: LearningActivityKind;
  exerciseKind?: ExerciseKind;
  grammarTag?: string;
  errorCategory?: LearningErrorCategory;
}): string[] {
  const set = new Set<string>();

  if (params.itemId) {
    set.add(`item:${params.itemId}`);
  }
  if (params.level) {
    set.add(`level:${params.level}`);
  }
  if (params.activityId) {
    set.add(`activity:${params.activityId}`);
  }
  if (params.exerciseKind) {
    switch (params.exerciseKind) {
      case 'speak':
        set.add('skill:speaking');
        break;
      case 'listen':
        set.add('skill:listening');
        break;
      case 'type':
        set.add('skill:writing');
        break;
      case 'choice':
        set.add('skill:reading');
        break;
      case 'scramble':
        set.add('skill:syntax');
        break;
      case 'intro':
        set.add('skill:scaffolding');
        break;
    }
  }
  if (params.grammarTag) {
    set.add(`grammar:${params.grammarTag.toLowerCase().trim()}`);
  }
  if (params.errorCategory) {
    set.add(`error:${params.errorCategory}`);
  }

  return Array.from(set).sort();
}

/**
 * Calculates simple Levenshtein distance between two strings for typo/spelling classification.
 */
export function levenshteinDistance(a: string, b: string): number {
  const s1 = a.toLowerCase().trim();
  const s2 = b.toLowerCase().trim();
  const dp: number[][] = [];

  for (let i = 0; i <= s1.length; i++) {
    dp[i] = [i];
  }
  for (let j = 0; j <= s2.length; j++) {
    dp[0][j] = j;
  }

  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }

  return dp[s1.length][s2.length];
}

/**
 * Infers standardized error category when learner submits an imperfect response.
 */
export function inferErrorCategory(params: {
  activityId: LearningActivityKind;
  exerciseKind?: ExerciseKind;
  target?: string;
  userResponse?: string;
  isGender?: boolean;
  isVerb?: boolean;
  isWordOrder?: boolean;
  intentMet?: boolean;
}): LearningErrorCategory {
  if (params.activityId === 'verb_gym' || params.isVerb) {
    return 'conjugation';
  }
  if (params.isGender) {
    return 'gender';
  }
  if (params.isWordOrder || params.exerciseKind === 'scramble') {
    return 'word_order';
  }
  if (params.activityId === 'radio_lab' || params.exerciseKind === 'listen') {
    return 'listening';
  }
  if (params.activityId === 'shadowing' || params.exerciseKind === 'speak') {
    return 'pronunciation';
  }
  if (params.activityId === 'roleplay' && params.intentMet === false) {
    return 'communication_intent';
  }

  if (params.target && params.userResponse) {
    const dist = levenshteinDistance(params.target, params.userResponse);
    if (dist > 0 && dist <= 2) {
      return 'spelling';
    }
  }

  if (params.exerciseKind === 'choice') {
    return 'vocabulary';
  }

  return 'grammar';
}

/**
 * Standardized factory for LearningEvent records.
 */
export function createLearningEvent(params: CreateLearningEventParams): LearningEvent {
  const now = params.createdAt ?? Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  const id = params.id ?? `evt_${now}_${rand}`;

  // Clamp confidence between 0.0 and 1.0
  let confidence = params.confidence ?? 1.0;
  if (params.activityId === 'shadowing' || params.activityId === 'roleplay') {
    confidence = params.confidence ?? 0.85;
  }
  confidence = Math.max(0, Math.min(1, confidence));

  // Clamp score if provided
  const score = params.score !== undefined ? Math.max(0, Math.min(1, params.score)) : undefined;

  // Infer error category if failed and not explicitly supplied
  let errorCategory = params.errorCategory;
  if (!errorCategory && (params.result === 'incorrect' || params.result === 'partially_correct')) {
    errorCategory = inferErrorCategory({
      activityId: params.activityId,
      target: params.payload?.target,
      userResponse: params.payload?.userResponse,
      intentMet: params.payload?.intentMet,
    });
  }

  return {
    id,
    languageId: params.languageId,
    activityId: params.activityId,
    objectiveIds: params.objectiveIds ?? [],
    result: params.result,
    score,
    difficulty: params.difficulty ?? 'A1',
    durationMs: Math.max(0, Math.round(params.durationMs ?? 0)),
    hintsUsed: Math.max(0, Math.round(params.hintsUsed ?? 0)),
    attemptsCount: Math.max(1, Math.round(params.attemptsCount ?? 1)),
    confidence,
    errorCategory,
    payload: params.payload,
    createdAt: now,
  };
}

/**
 * Records a learning event into in-memory ring buffer and persistent store.
 */
export async function recordLearningEvent(event: LearningEvent): Promise<void> {
  inMemoryEvents.unshift(event);
  if (inMemoryEvents.length > MAX_IN_MEMORY_EVENTS) {
    inMemoryEvents.length = MAX_IN_MEMORY_EVENTS;
  }
  if (persistenceHandler) {
    try {
      await persistenceHandler.recordEvent(event);
    } catch (err) {
      console.warn('[ORRALI Events] persistenceHandler.recordEvent error:', err);
    }
  }
}

/**
 * Records a batch of learning events atomically.
 */
export async function recordLearningEventsBatch(events: LearningEvent[]): Promise<void> {
  if (events.length === 0) return;
  for (let i = events.length - 1; i >= 0; i--) {
    inMemoryEvents.unshift(events[i]);
  }
  if (inMemoryEvents.length > MAX_IN_MEMORY_EVENTS) {
    inMemoryEvents.length = MAX_IN_MEMORY_EVENTS;
  }
  if (persistenceHandler) {
    try {
      await persistenceHandler.recordBatch(events);
    } catch (err) {
      console.warn('[ORRALI Events] persistenceHandler.recordBatch error:', err);
    }
  }
}

/**
 * Queries learning events from persistent store, with in-memory fallback.
 */
export async function queryLearningEvents(filter: LearningEventFilter = {}): Promise<LearningEvent[]> {
  if (persistenceHandler) {
    try {
      const dbEvents = await persistenceHandler.queryEvents(filter);
      if (dbEvents && dbEvents.length > 0) {
        return dbEvents;
      }
    } catch (err) {
      console.warn('[ORRALI Events] persistenceHandler.queryEvents error:', err);
    }
  }

  // Fallback to in-memory events if persistent store is uninitialized or empty
  let results = [...inMemoryEvents];

  if (filter.languageId) {
    results = results.filter((e) => e.languageId === filter.languageId);
  }
  if (filter.activityId) {
    results = results.filter((e) => e.activityId === filter.activityId);
  }
  if (filter.objectiveId) {
    results = results.filter((e) => e.objectiveIds.includes(filter.objectiveId!));
  }
  if (filter.result) {
    results = results.filter((e) => e.result === filter.result);
  }
  if (filter.errorCategory) {
    results = results.filter((e) => e.errorCategory === filter.errorCategory);
  }
  if (filter.sinceTimestamp) {
    results = results.filter((e) => e.createdAt >= filter.sinceTimestamp!);
  }
  if (filter.untilTimestamp) {
    results = results.filter((e) => e.createdAt <= filter.untilTimestamp!);
  }

  results.sort((a, b) => b.createdAt - a.createdAt);

  if (filter.limit && filter.limit > 0) {
    results = results.slice(0, Math.floor(filter.limit));
  }

  return results;
}

/**
 * Summarizes an array of LearningEvents into actionable mastery metrics and error distributions.
 */
export function summarizeLearningEvents(events: LearningEvent[]): LearningEventsSummary {
  const allCategories: LearningErrorCategory[] = [
    'vocabulary',
    'grammar',
    'conjugation',
    'gender',
    'word_order',
    'listening',
    'pronunciation',
    'spelling',
    'naturalness',
    'communication_intent',
  ];

  const errorDistribution: Record<LearningErrorCategory, number> = {
    vocabulary: 0,
    grammar: 0,
    conjugation: 0,
    gender: 0,
    word_order: 0,
    listening: 0,
    pronunciation: 0,
    spelling: 0,
    naturalness: 0,
    communication_intent: 0,
  };

  const activityDistribution: Record<LearningActivityKind, number> = {
    lesson: 0,
    speed_recall: 0,
    mistake_clinic: 0,
    verb_gym: 0,
    radio_lab: 0,
    roleplay: 0,
    cafe_library: 0,
    placement: 0,
    express_review: 0,
    shadowing: 0,
    commuter: 0,
    milestone_exam: 0,
    mission: 0,
    writing_lab: 0,
  };

  let correctCount = 0;
  let incorrectCount = 0;
  let partiallyCorrectCount = 0;
  let totalDurationMs = 0;
  let confidenceSum = 0;

  const objectiveStats: Record<string, { failureCount: number; totalAttempts: number }> = {};

  for (const e of events) {
    if (e.result === 'correct') {
      correctCount++;
    } else if (e.result === 'incorrect') {
      incorrectCount++;
    } else if (e.result === 'partially_correct') {
      partiallyCorrectCount++;
    }

    totalDurationMs += e.durationMs;
    confidenceSum += e.confidence;

    if (activityDistribution[e.activityId] !== undefined) {
      activityDistribution[e.activityId]++;
    }

    if (e.errorCategory && errorDistribution[e.errorCategory] !== undefined) {
      errorDistribution[e.errorCategory]++;
    }

    for (const objId of e.objectiveIds) {
      if (!objectiveStats[objId]) {
        objectiveStats[objId] = { failureCount: 0, totalAttempts: 0 };
      }
      objectiveStats[objId].totalAttempts++;
      if (e.result === 'incorrect' || e.result === 'partially_correct') {
        objectiveStats[objId].failureCount++;
      }
    }
  }

  const totalEvents = events.length;
  const overallAccuracyPercent =
    totalEvents > 0 ? Math.round((correctCount / totalEvents) * 1000) / 10 : 0;
  const averageConfidence =
    totalEvents > 0 ? Math.round((confidenceSum / totalEvents) * 100) / 100 : 1.0;

  const topStumbleObjectives = Object.entries(objectiveStats)
    .filter(([_, stats]) => stats.failureCount > 0)
    .map(([objectiveId, stats]) => ({
      objectiveId,
      failureCount: stats.failureCount,
      totalAttempts: stats.totalAttempts,
      failureRatePercent:
        stats.totalAttempts > 0
          ? Math.round((stats.failureCount / stats.totalAttempts) * 1000) / 10
          : 0,
    }))
    .sort((a, b) => b.failureCount - a.failureCount);

  return {
    totalEvents,
    correctCount,
    incorrectCount,
    partiallyCorrectCount,
    overallAccuracyPercent,
    averageConfidence,
    totalDurationMs,
    errorDistribution,
    activityDistribution,
    topStumbleObjectives,
  };
}

/**
 * Clears in-memory buffer (primarily used in testing environments).
 */
export function clearInMemoryEvents(): void {
  inMemoryEvents = [];
}

/**
 * Returns a shallow copy of in-memory events buffer.
 */
export function getInMemoryEvents(): LearningEvent[] {
  return [...inMemoryEvents];
}
