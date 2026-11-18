import { LearningEvent } from '../types';
import { createLearningEvent } from '../events';
import {
  Mission,
  MissionDialogueTurn,
  MissionScoreBreakdown,
} from './types';

/**
 * Normalizes text for forgiving intent and keyword evaluation.
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’]/g, ' ')
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"¡!¿]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Evaluates a single interactive turn in a real-life mission.
 */
export function evaluateMissionTurn(
  turn: MissionDialogueTurn,
  userResponse: string
): {
  isCommunicative: boolean;
  relevanceScore: number;
  grammarScore: number;
  feedback: string;
  matchedKeywords: string[];
  branchTaken?: string;
} {
  const norm = normalizeText(userResponse);

  if (!norm || norm.length < 2) {
    return {
      isCommunicative: false,
      relevanceScore: 0.0,
      grammarScore: 0.0,
      feedback: 'No response provided. State your intention to advance.',
      matchedKeywords: [],
    };
  }

  // Check anti-gibberish heuristic (consecutive non-vowel length)
  const isGibberish =
    norm.length >= 8 &&
    !/[aeiouy]/.test(norm);
  if (isGibberish) {
    return {
      isCommunicative: false,
      relevanceScore: 0.1,
      grammarScore: 0.1,
      feedback: 'The response could not be understood. Please use relevant expressions.',
      matchedKeywords: [],
    };
  }

  // Match communicative keywords
  const matchedKeywords = turn.communicativeKeywords.filter((kw) => {
    const normKw = normalizeText(kw);
    return norm.includes(normKw);
  });

  // Check valid full-sentence alternatives
  const matchesAlternative = (turn.validAlternatives ?? []).some((alt) => {
    const normAlt = normalizeText(alt);
    return norm.includes(normAlt) || normAlt.includes(norm);
  });

  const isCommunicative = matchedKeywords.length > 0 || matchesAlternative;

  // Relevance score: on-topic adherence
  const relevanceScore = isCommunicative
    ? Math.min(1.0, 0.6 + matchedKeywords.length * 0.2)
    : 0.2;

  // Grammar score: minor spelling issues tolerated if intent is clear
  let grammarScore = 0.5;
  if (matchesAlternative) {
    grammarScore = 1.0;
  } else if (matchedKeywords.length >= 2) {
    grammarScore = 0.85;
  } else if (isCommunicative) {
    grammarScore = 0.75;
  }

  // Check branching options
  let branchTaken: string | undefined;
  if (turn.branchingReply) {
    const branchMatched = turn.branchingReply.conditionKeywords.some((cond) =>
      norm.includes(normalizeText(cond))
    );
    if (branchMatched) {
      branchTaken = turn.branchingReply.replyText;
    }
  }

  const feedback = isCommunicative
    ? 'Intent communicated successfully.'
    : `Communication goal not achieved. Try asking or answering using: ${turn.hints.slice(0, 2).join(' or ')}.`;

  return {
    isCommunicative,
    relevanceScore: Math.round(relevanceScore * 100) / 100,
    grammarScore: Math.round(grammarScore * 100) / 100,
    feedback,
    matchedKeywords,
    branchTaken,
  };
}

/**
 * Evaluates the unexpected curveball event (e.g. dish unavailable, schedule delay).
 */
export function evaluateUnexpectedEvent(
  event: Mission['unexpectedEvent'],
  userResponse: string
): {
  isResolved: boolean;
  relevanceScore: number;
  feedback: string;
} {
  const norm = normalizeText(userResponse);

  const matched = event.requiredIntentKeywords.filter((kw) =>
    norm.includes(normalizeText(kw))
  );

  const matchedAlt = event.acceptableAlternatives.some((alt) =>
    norm.includes(normalizeText(alt))
  );

  const isResolved = matched.length > 0 || matchedAlt;
  const relevanceScore = isResolved ? 1.0 : 0.25;

  const feedback = isResolved
    ? 'Unexpected situation handled effectively.'
    : `Please address the curveball: ${event.learnerObjective}`;

  return {
    isResolved,
    relevanceScore,
    feedback,
  };
}

/**
 * Evaluates the final mission payoff challenge.
 */
export function evaluateFinalChallenge(
  challenge: Mission['finalChallenge'],
  userResponse: string
): {
  isPassed: boolean;
  feedback: string;
} {
  const norm = normalizeText(userResponse);

  const matched = challenge.solutionKeywords.filter((kw) =>
    norm.includes(normalizeText(kw))
  );

  const isPassed = matched.length > 0;
  const feedback = isPassed
    ? 'Final mission challenge completed.'
    : `Final challenge requires: ${challenge.objective}`;

  return {
    isPassed,
    feedback,
  };
}

/**
 * Aggregates all mission stages into multi-dimensional scores.
 */
export function calculateMissionScore(params: {
  mission: Mission;
  prepCorrectCount: number;
  prepTotal: number;
  listeningPassed: boolean;
  dialogueResults: Array<{
    isCommunicative: boolean;
    relevanceScore: number;
    grammarScore: number;
  }>;
  unexpectedResolved: boolean;
  finalChallengePassed: boolean;
}): MissionScoreBreakdown {
  const {
    mission,
    prepCorrectCount,
    prepTotal,
    listeningPassed,
    dialogueResults,
    unexpectedResolved,
    finalChallengePassed,
  } = params;

  // 1. Comprehension: Prep quiz (50%) + Listening challenge (50%)
  const prepRatio = prepTotal > 0 ? prepCorrectCount / prepTotal : 1.0;
  const comprehension =
    Math.round((0.5 * prepRatio + 0.5 * (listeningPassed ? 1.0 : 0.0)) * 100) / 100;

  // 2. Communication Success: Average of dialogue turns, unexpected event, and final challenge
  const totalCommunicativeUnits =
    dialogueResults.length + 1 /* unexpected */ + 1 /* final */;
  const communicativeSuccesses =
    dialogueResults.filter((d) => d.isCommunicative).length +
    (unexpectedResolved ? 1 : 0) +
    (finalChallengePassed ? 1 : 0);

  const communicationSuccess =
    Math.round((communicativeSuccesses / Math.max(1, totalCommunicativeUnits)) * 100) / 100;

  // 3. Response Relevance: Average relevance across turns
  const avgRelevance =
    dialogueResults.length > 0
      ? dialogueResults.reduce((sum, d) => sum + d.relevanceScore, 0) /
        dialogueResults.length
      : 1.0;
  const responseRelevance = Math.round(avgRelevance * 100) / 100;

  // 4. Grammar Score: Average grammar across turns
  const avgGrammar =
    dialogueResults.length > 0
      ? dialogueResults.reduce((sum, d) => sum + d.grammarScore, 0) /
        dialogueResults.length
      : 1.0;
  const grammarScore = Math.round(avgGrammar * 100) / 100;

  // 5. Vocabulary Accuracy: Weighted blend of prep score and keyword matches
  const vocabularyAccuracy =
    Math.round((0.4 * prepRatio + 0.6 * responseRelevance) * 100) / 100;

  // Weighted overall score:
  // 40% Communication + 20% Comprehension + 15% Vocabulary + 15% Relevance + 10% Grammar
  const rawOverall =
    0.4 * communicationSuccess +
    0.2 * comprehension +
    0.15 * vocabularyAccuracy +
    0.15 * responseRelevance +
    0.1 * grammarScore;

  const overallScore = Math.round(Math.max(0, Math.min(1, rawOverall)) * 100) / 100;

  // Pass threshold: overall >= 70% and communication >= 65%
  const passed = overallScore >= 0.7 && communicationSuccess >= 0.65;
  const earnedXp = passed ? Math.round(30 + overallScore * 15) : 10;

  // Phrasebook suggestions drawn from useful expressions
  const suggestedPhrasebookAdds = mission.usefulExpressions.map((e) => e.phrase);

  // Remedial recommendations
  const remedialRecommendations: string[] = [];
  if (comprehension < 0.7) {
    remedialRecommendations.push('Review mission listening prompt in Radio Lab');
  }
  if (grammarScore < 0.7) {
    remedialRecommendations.push('Practice formal requests in Verb Gym');
  }
  if (!unexpectedResolved) {
    remedialRecommendations.push('Replay unexpected scenario to practice rapid problem resolution');
  }

  const feedback = passed
    ? `Mission Completed! You successfully navigated ${mission.title} with a communication rating of ${Math.round(
        communicationSuccess * 100
      )}%.`
    : `Mission Unresolved. Clearer communicative phrasing is required to achieve the objective.`;

  return {
    communicationSuccess,
    comprehension,
    vocabularyAccuracy,
    grammarScore,
    responseRelevance,
    overallScore,
    earnedXp,
    passed,
    feedback,
    suggestedPhrasebookAdds,
    remedialRecommendations,
  };
}

/**
 * Creates standardized LearningEvents from completed mission stages.
 */
export function createMissionCompletionEvents(
  mission: Mission,
  score: MissionScoreBreakdown
): LearningEvent[] {
  const now = Date.now();

  return [
    createLearningEvent({
      languageId: mission.languageId,
      activityId: 'mission',
      objectiveIds: [
        `mission:${mission.id}`,
        'skill:communication',
        `level:${mission.cefrLevel}`,
      ],
      result: score.passed ? 'correct' : 'incorrect',
      score: score.communicationSuccess,
      difficulty: mission.cefrLevel,
      confidence: 0.9,
      createdAt: now,
      payload: {
        missionTitle: mission.title,
        communicationSuccess: score.communicationSuccess,
        overallScore: score.overallScore,
      },
    }),
    createLearningEvent({
      languageId: mission.languageId,
      activityId: 'mission',
      objectiveIds: [
        `mission:${mission.id}`,
        'skill:listening',
        `level:${mission.cefrLevel}`,
      ],
      result: score.comprehension >= 0.7 ? 'correct' : 'partially_correct',
      score: score.comprehension,
      difficulty: mission.cefrLevel,
      confidence: 1.0,
      createdAt: now,
      payload: {
        comprehensionScore: score.comprehension,
      },
    }),
  ];
}
