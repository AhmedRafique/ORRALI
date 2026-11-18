import { LearningEvent } from '../types';
import { createLearningEvent } from '../events';
import {
  WritingChallenge,
  WritingCorrectionResult,
  WritingMistakeSpan,
} from './types';

/**
 * Counts whitespace-delimited words.
 */
export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

/**
 * Normalizes text for intent and keyword checking.
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

interface KnownErrorPattern {
  regex: RegExp;
  category: WritingMistakeSpan['category'];
  correctedSnippet: string;
  explanation: string;
}

const COMMON_ERROR_PATTERNS: KnownErrorPattern[] = [
  // French auxiliary & idiom patterns
  {
    regex: /\b(ai|a|avons|avez|ont)\s+all[eé]/i,
    category: 'conjugation',
    correctedSnippet: 'suis/est/sommes/êtes/sont allé(e)(s)',
    explanation: 'Movement verbs like "aller" conjugate with "être" in compound past tenses, not "avoir".',
  },
  {
    regex: /\bje\s+suis\s+(faim|soif|chaud|froid)\b/i,
    category: 'grammar',
    correctedSnippet: "j'ai $1",
    explanation: 'Physical sensations take the auxiliary avoir in French (j’ai faim, not je suis faim).',
  },
  {
    regex: /\bbeaucoup\s+des\b/i,
    category: 'grammar',
    correctedSnippet: 'beaucoup de',
    explanation: 'Adverbs of quantity use "de" without the definite article ("beaucoup de").',
  },
  {
    regex: /\bune\s+probl[eè]me\b/i,
    category: 'gender',
    correctedSnippet: 'un problème',
    explanation: 'Nouns ending in "-ème" of Greek origin are typically masculine ("un problème").',
  },

  // German word order & case patterns
  {
    regex: /\bweil\s+ich\s+(bin|habe|kann|m[oö]chte|gehe)\b/i,
    category: 'word_order',
    correctedSnippet: 'weil ich ... [Verb am Ende]',
    explanation: 'Subordinate clauses introduced by "weil" send the finite verb to the very end of the clause.',
  },
  {
    regex: /\bf[uü]r\s+mein\s+(Vater|Bruder|Freund)\b/i,
    category: 'grammar',
    correctedSnippet: 'für meinen $1',
    explanation: 'The preposition "für" always takes the accusative case ("für meinen ...").',
  },

  // Spanish preposition & ser/estar patterns
  {
    regex: /\bgracias\s+para\b/i,
    category: 'grammar',
    correctedSnippet: 'gracias por',
    explanation: 'Expressing cause or gratitude in Spanish uses "por" ("gracias por..."), not "para".',
  },
  {
    regex: /\bestoy\s+de\s+(madrid|barcelona|mexico|colombia|francia|alemania)\b/i,
    category: 'grammar',
    correctedSnippet: 'soy de $1',
    explanation: 'Origin or nationality uses the permanent verb "ser" ("soy de..."), not "estar".',
  },
  {
    regex: /\bmuy\s+mucho\b/i,
    category: 'vocabulary',
    correctedSnippet: 'muchísimo / mucho',
    explanation: '"Mucho" cannot be modified by "muy". Use "mucho" or "muchísimo".',
  },
];

/**
 * Evaluates a learner's writing submission against challenge constraints and grammatical accuracy.
 */
export function evaluateWritingSubmission(
  challenge: WritingChallenge,
  submissionText: string
): WritingCorrectionResult {
  const wordCount = countWords(submissionText);
  const norm = normalizeText(submissionText);

  const mistakes: WritingMistakeSpan[] = [];
  let correctedText = submissionText;

  // 1. Scan for known grammatical and structural error patterns
  for (const pattern of COMMON_ERROR_PATTERNS) {
    const match = submissionText.match(pattern.regex);
    if (match && match.index !== undefined) {
      const originalSnippet = match[0];
      const start = match.index;
      const end = start + originalSnippet.length;

      mistakes.push({
        id: `err_${start}_${end}`,
        startIndex: start,
        endIndex: end,
        originalSnippet,
        correctedSnippet: pattern.correctedSnippet.replace('$1', match[1] ?? ''),
        category: pattern.category,
        explanation: pattern.explanation,
      });

      correctedText =
        correctedText.substring(0, start) +
        pattern.correctedSnippet.replace('$1', match[1] ?? '') +
        correctedText.substring(end);
    }
  }

  // 2. Keyword and constraint adherence
  const missingKeywords = challenge.requiredKeywords.filter(
    (kw) => !norm.includes(normalizeText(kw))
  );

  for (const missing of missingKeywords) {
    mistakes.push({
      id: `missing_${missing}`,
      startIndex: 0,
      endIndex: 0,
      originalSnippet: `[Missing: ${missing}]`,
      correctedSnippet: missing,
      category: 'communication_intent',
      explanation: `Challenge instruction required addressing or mentioning "${missing}".`,
    });
  }

  // 3. Word count evaluation
  const isWordCountSufficient = wordCount >= challenge.minimumWords;
  if (!isWordCountSufficient) {
    mistakes.push({
      id: 'word_count_deficit',
      startIndex: 0,
      endIndex: 0,
      originalSnippet: `[Word count: ${wordCount}]`,
      correctedSnippet: `Minimum: ${challenge.minimumWords} words`,
      category: 'naturalness',
      explanation: `Submission should be at least ${challenge.minimumWords} words for thorough expression (currently ${wordCount}).`,
    });
  }

  // 4. Calculate score
  let score = 1.0;
  if (!isWordCountSufficient) {
    const deficit = challenge.minimumWords - wordCount;
    score -= Math.min(0.35, deficit * 0.05);
  }
  score -= missingKeywords.length * 0.15;
  score -= mistakes.filter((m) => m.category !== 'communication_intent' && m.category !== 'naturalness').length * 0.12;

  score = Math.round(Math.max(0.1, Math.min(1.0, score)) * 100) / 100;
  const isAccurate = score >= 0.7 && missingKeywords.length === 0;
  const earnedXp = isAccurate ? Math.round(25 + score * 10) : 10;

  const feedback = isAccurate
    ? `Excellent work! Your writing satisfies the scenario constraints with an accuracy score of ${Math.round(
        score * 100
      )}%.`
    : `Submission needs revision. Address highlighted grammatical agreements and required instructions to pass.`;

  return {
    originalText: submissionText,
    correctedText: mistakes.length === 0 ? submissionText : correctedText,
    isAccurate,
    score,
    wordCount,
    mistakes,
    naturalAlternative: challenge.naturalAlternative,
    grammarRule: challenge.grammarRule,
    vocabularyRecommendation: challenge.vocabularyRecommendation,
    followUpExercise: challenge.followUpExercise,
    feedback,
    earnedXp,
    offlineEvaluated: true,
  };
}

/**
 * Creates standardized LearningEvents from writing lab evaluation.
 */
export function createWritingCompletionEvents(
  challenge: WritingChallenge,
  result: WritingCorrectionResult
): LearningEvent[] {
  const now = Date.now();
  const events: LearningEvent[] = [];

  // Primary writing skill event
  events.push(
    createLearningEvent({
      languageId: challenge.languageId,
      activityId: 'writing_lab',
      objectiveIds: [
        `writing:${challenge.id}`,
        'skill:writing',
        `level:${challenge.level}`,
        `format:${challenge.format}`,
      ],
      result: result.isAccurate ? 'correct' : 'incorrect',
      score: result.score,
      difficulty: challenge.level,
      confidence: 1.0,
      createdAt: now,
      payload: {
        format: challenge.format,
        wordCount: result.wordCount,
        mistakeCount: result.mistakes.length,
      },
    })
  );

  // If specific grammatical mistakes were encountered, emit specific error category event
  for (const m of result.mistakes) {
    if (m.category !== 'communication_intent' && m.category !== 'naturalness') {
      events.push(
        createLearningEvent({
          languageId: challenge.languageId,
          activityId: 'writing_lab',
          objectiveIds: [
            `grammar:${m.category}`,
            `error:${m.category}`,
            'skill:writing',
          ],
          result: 'incorrect',
          errorCategory: m.category,
          difficulty: challenge.level,
          confidence: 1.0,
          createdAt: now,
          payload: {
            snippet: m.originalSnippet,
            corrected: m.correctedSnippet,
            explanation: m.explanation,
          },
        })
      );
    }
  }

  return events;
}
