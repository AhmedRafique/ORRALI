import {
  LangCode,
  LearningEvent,
  ObjectiveMastery,
  SkillDomain,
  DomainSummary,
  LearnerLanguageProfile,
  LearningErrorCategory,
} from './types';

export const ALL_SKILL_DOMAINS: SkillDomain[] = [
  'vocabulary',
  'grammar_present',
  'grammar_past',
  'grammar_future',
  'listening',
  'speaking',
  'writing',
  'reading',
  'syntax',
  'communication',
];

const ONE_DAY_MS = 86_400_000;
const EMA_ALPHA = 0.35;
const CONFIDENCE_K = 5.0; // 5 attempts needed for ~63% confidence, 10 for ~86%

/**
 * Resolves an objective tag to its primary SkillDomain.
 */
export function resolveSkillDomain(
  objectiveId: string,
  errorCategory?: LearningErrorCategory
): SkillDomain {
  const lower = objectiveId.toLowerCase();

  if (lower.startsWith('skill:speaking') || errorCategory === 'pronunciation') {
    return 'speaking';
  }
  if (lower.startsWith('skill:listening') || errorCategory === 'listening') {
    return 'listening';
  }
  if (lower.startsWith('skill:writing') || errorCategory === 'spelling') {
    return 'writing';
  }
  if (lower.startsWith('skill:reading')) {
    return 'reading';
  }
  if (lower.startsWith('skill:syntax') || errorCategory === 'word_order') {
    return 'syntax';
  }
  if (lower.includes('roleplay') || errorCategory === 'communication_intent') {
    return 'communication';
  }

  // Grammar tense classification
  if (
    lower.includes('passé_composé') ||
    lower.includes('perfekt') ||
    lower.includes('pretérito') ||
    lower.includes('imparfait') ||
    lower.includes('past')
  ) {
    return 'grammar_past';
  }

  if (
    lower.includes('futur') ||
    lower.includes('futuro') ||
    lower.includes('zukunft') ||
    lower.includes('future')
  ) {
    return 'grammar_future';
  }

  if (lower.startsWith('grammar:') || errorCategory === 'conjugation' || errorCategory === 'gender' || errorCategory === 'grammar') {
    return 'grammar_present';
  }

  return 'vocabulary';
}

/**
 * Creates a clean default profile for a language.
 */
export function createEmptyLanguageProfile(languageId: LangCode): LearnerLanguageProfile {
  const domains: Record<SkillDomain, DomainSummary> = {} as any;

  for (const domain of ALL_SKILL_DOMAINS) {
    domains[domain] = {
      domain,
      mastery: 0,
      confidence: 0,
      totalAttempts: 0,
      needsPractice: false,
    };
  }

  return {
    languageId,
    updatedAt: Date.now(),
    overallMastery: 0,
    overallConfidence: 0,
    domains,
    objectives: {},
    activeStumbles: [],
  };
}

/**
 * Converts a LearningEvent result into a normalized evidence score [0.0, 1.0].
 */
export function computeEvidenceScore(event: LearningEvent): number {
  if (event.score !== undefined && typeof event.score === 'number') {
    return Math.max(0, Math.min(1, event.score));
  }

  switch (event.result) {
    case 'correct':
      return event.hintsUsed > 0 ? 0.75 : 1.0;
    case 'partially_correct':
      return 0.5;
    case 'hint_used':
      return 0.4;
    case 'incorrect':
      return event.attemptsCount > 1 ? 0.2 : 0.0;
    case 'abandoned':
      return 0.0;
    default:
      return 0.0;
  }
}

/**
 * Computes assessment confidence from cumulative sample evidence.
 * Decouples sample volume from accuracy: 1 single attempt cannot produce 100% confidence.
 */
export function computeConfidence(effectiveSampleSize: number, k: number = CONFIDENCE_K): number {
  if (effectiveSampleSize <= 0) return 0;
  const raw = 1 - Math.exp(-effectiveSampleSize / k);
  return Math.round(Math.max(0, Math.min(1, raw)) * 100) / 100;
}

/**
 * Calculates next review interval in days based on mastery and confidence.
 */
export function computeNextReviewIntervalDays(
  mastery: number,
  confidence: number,
  streak: number
): number {
  if (mastery < 0.4) {
    return 1;
  }
  if (mastery < 0.7) {
    return 3;
  }
  if (mastery < 0.85) {
    return 7;
  }
  // High mastery with high confidence can be spaced out
  if (confidence >= 0.6) {
    return Math.min(28, 14 + streak * 2);
  }
  return 7;
}

/**
 * Updates a language profile with a single LearningEvent.
 */
export function applyLearningEventToProfile(
  profile: LearnerLanguageProfile,
  event: LearningEvent
): LearnerLanguageProfile {
  const objectives = { ...profile.objectives };
  const targetObjectiveIds =
    event.objectiveIds.length > 0 ? event.objectiveIds : [`activity:${event.activityId}`];

  const evidenceScore = computeEvidenceScore(event);
  const isPass = event.result === 'correct';

  for (const objId of targetObjectiveIds) {
    const existing = objectives[objId];
    const domain = resolveSkillDomain(objId, event.errorCategory);
    const level = (event.difficulty as 'A1' | 'A2' | 'B1' | 'B2') || 'A1';

    if (!existing) {
      // First observation of this objective
      const confidence = computeConfidence(event.confidence);
      const mastery = Math.round(evidenceScore * 0.7 * 100) / 100; // conservative initial mastery
      const streak = isPass ? 1 : 0;
      const intervalDays = computeNextReviewIntervalDays(mastery, confidence, streak);

      const errorDist: Partial<Record<LearningErrorCategory, number>> = {};
      if (event.errorCategory) {
        errorDist[event.errorCategory] = 1;
      }

      objectives[objId] = {
        objectiveId: objId,
        domain,
        level,
        mastery,
        confidence,
        totalAttempts: 1,
        correctAttempts: isPass ? 1 : 0,
        failCount: isPass ? 0 : 1,
        streak,
        recentAccuracy: evidenceScore,
        lastPracticedAt: event.createdAt,
        nextReviewAt: event.createdAt + intervalDays * ONE_DAY_MS,
        errorDistribution: errorDist,
      };
    } else {
      // Incremental Bayesian/EMA update
      const totalAttempts = existing.totalAttempts + 1;
      const correctAttempts = existing.correctAttempts + (isPass ? 1 : 0);
      const failCount = existing.failCount + (isPass ? 0 : 1);
      const streak = isPass ? existing.streak + 1 : 0;

      // Update exponential moving average of accuracy
      const recentAccuracy =
        Math.round(
          ((1 - EMA_ALPHA) * existing.recentAccuracy + EMA_ALPHA * evidenceScore) * 1000
        ) / 1000;

      // Calculate confidence based on total weighted attempts
      const confidence = computeConfidence(totalAttempts * event.confidence);

      // Blend recent accuracy (65%) with historical ratio (35%), plus small streak incentive
      const historicalRatio = correctAttempts / totalAttempts;
      const streakBonus = Math.min(streak * 0.02, 0.1);
      let rawMastery = 0.65 * recentAccuracy + 0.35 * historicalRatio + streakBonus;

      // Severe penalty if consecutive failures
      if (!isPass && existing.failCount >= 2) {
        rawMastery *= 0.85;
      }

      const mastery = Math.round(Math.max(0, Math.min(1, rawMastery)) * 100) / 100;
      const intervalDays = computeNextReviewIntervalDays(mastery, confidence, streak);

      const errorDist = { ...existing.errorDistribution };
      if (event.errorCategory) {
        errorDist[event.errorCategory] = (errorDist[event.errorCategory] ?? 0) + 1;
      }

      objectives[objId] = {
        ...existing,
        mastery,
        confidence,
        totalAttempts,
        correctAttempts,
        failCount,
        streak,
        recentAccuracy,
        lastPracticedAt: event.createdAt,
        nextReviewAt: event.createdAt + intervalDays * ONE_DAY_MS,
        errorDistribution: errorDist,
      };
    }
  }

  // Re-aggregate domain summaries
  const domains = recomputeDomainSummaries(objectives);

  // Overall metrics across all objectives
  const allObj = Object.values(objectives);
  const overallMastery =
    allObj.length > 0
      ? Math.round(
          (allObj.reduce((sum, o) => sum + o.mastery, 0) / allObj.length) * 100
        ) / 100
      : 0;
  const overallConfidence =
    allObj.length > 0
      ? Math.round(
          (allObj.reduce((sum, o) => sum + o.confidence, 0) / allObj.length) * 100
        ) / 100
      : 0;

  // Identify active stumbles (high failure count, low mastery, or recent failure)
  const activeStumbles = allObj
    .filter((o) => o.failCount >= 2 && o.mastery < 0.65)
    .sort((a, b) => b.failCount - a.failCount)
    .slice(0, 10)
    .map((o) => o.objectiveId);

  return {
    languageId: profile.languageId,
    updatedAt: event.createdAt,
    overallMastery,
    overallConfidence,
    domains,
    objectives,
    activeStumbles,
  };
}

/**
 * Recomputes domain metrics from the objectives map.
 */
function recomputeDomainSummaries(
  objectives: Record<string, ObjectiveMastery>
): Record<SkillDomain, DomainSummary> {
  const domainBuckets: Record<SkillDomain, ObjectiveMastery[]> = {} as any;
  for (const d of ALL_SKILL_DOMAINS) {
    domainBuckets[d] = [];
  }

  for (const obj of Object.values(objectives)) {
    if (domainBuckets[obj.domain]) {
      domainBuckets[obj.domain].push(obj);
    }
  }

  const summaries: Record<SkillDomain, DomainSummary> = {} as any;

  for (const d of ALL_SKILL_DOMAINS) {
    const list = domainBuckets[d];
    if (list.length === 0) {
      summaries[d] = {
        domain: d,
        mastery: 0,
        confidence: 0,
        totalAttempts: 0,
        needsPractice: false,
      };
    } else {
      const totalAttempts = list.reduce((sum, o) => sum + o.totalAttempts, 0);
      const avgMastery = list.reduce((sum, o) => sum + o.mastery, 0) / list.length;
      const avgConfidence = list.reduce((sum, o) => sum + o.confidence, 0) / list.length;
      const hasStumbles = list.some((o) => o.mastery < 0.5 && o.failCount > 0);

      summaries[d] = {
        domain: d,
        mastery: Math.round(avgMastery * 100) / 100,
        confidence: Math.round(avgConfidence * 100) / 100,
        totalAttempts,
        needsPractice: hasStumbles || avgMastery < 0.6,
      };
    }
  }

  return summaries;
}

/**
 * Applies a batch of events sequentially.
 */
export function applyEventsBatchToProfile(
  profile: LearnerLanguageProfile,
  events: LearningEvent[]
): LearnerLanguageProfile {
  let current = profile;
  for (const event of events) {
    current = applyLearningEventToProfile(current, event);
  }
  return current;
}

/**
 * Applies forgetting curve decay to knowledge based on elapsed days since last practice.
 */
export function applyTimeDecayToProfile(
  profile: LearnerLanguageProfile,
  asOfTimestamp: number = Date.now()
): LearnerLanguageProfile {
  const objectives = { ...profile.objectives };
  let modified = false;

  for (const [id, obj] of Object.entries(objectives)) {
    const daysPassed = Math.max(0, (asOfTimestamp - obj.lastPracticedAt) / ONE_DAY_MS);
    if (daysPassed >= 1.0) {
      modified = true;
      // Decay mastery at 1.5% per unpracticed day
      const decayFactor = Math.pow(0.985, daysPassed);
      const decayedMastery = Math.round(obj.mastery * decayFactor * 100) / 100;
      // Decays confidence slightly (1% per day) to reflect staleness
      const decayedConfidence =
        Math.round(Math.max(0.1, obj.confidence * Math.pow(0.99, daysPassed)) * 100) / 100;

      objectives[id] = {
        ...obj,
        mastery: decayedMastery,
        confidence: decayedConfidence,
      };
    }
  }

  if (!modified) {
    return profile;
  }

  const domains = recomputeDomainSummaries(objectives);
  const allObj = Object.values(objectives);
  const overallMastery =
    allObj.length > 0
      ? Math.round(
          (allObj.reduce((sum, o) => sum + o.mastery, 0) / allObj.length) * 100
        ) / 100
      : 0;
  const overallConfidence =
    allObj.length > 0
      ? Math.round(
          (allObj.reduce((sum, o) => sum + o.confidence, 0) / allObj.length) * 100
        ) / 100
      : 0;

  return {
    ...profile,
    updatedAt: asOfTimestamp,
    overallMastery,
    overallConfidence,
    domains,
    objectives,
  };
}

/**
 * Identifies the top stumble objectives requiring remedial attention.
 */
export function identifyStumbleObjectives(
  profile: LearnerLanguageProfile,
  maxCount: number = 5
): ObjectiveMastery[] {
  return Object.values(profile.objectives)
    .filter((o) => o.failCount > 0 || o.mastery < 0.6)
    .sort((a, b) => {
      // Prioritize: lowest mastery, highest fail count
      if (a.mastery !== b.mastery) {
        return a.mastery - b.mastery;
      }
      return b.failCount - a.failCount;
    })
    .slice(0, maxCount);
}
