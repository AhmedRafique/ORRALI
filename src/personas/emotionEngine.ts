import {
  CharacterPersona,
  LearningErrorCategory,
  PersonaEmotion,
} from '../types';
import { DEFAULT_MOOD_COLORS } from './roster';

export interface PersonaReaction {
  emotion: PersonaEmotion;
  reactionHeadline: string;
  expressionBadge: string;
  moodColor: string;
  bubbleBorderColor: string;
}

export interface RelationshipTier {
  tier: number;
  title: string;
  perk: string;
  badge: string;
}

/**
 * Calculates relationship progress and unlocks conversational depth.
 */
export function getRelationshipTier(level: number): RelationshipTier {
  if (level >= 51) {
    return {
      tier: 4,
      title: 'Lifelong Partner',
      perk: 'Deep cultural immersion, nuanced idioms, and shared secrets',
      badge: '💎',
    };
  }
  if (level >= 26) {
    return {
      tier: 3,
      title: 'Trusted Confidant',
      perk: 'Unlocks personal anecdotes and natural colloquial phrasing',
      badge: '🌟',
    };
  }
  if (level >= 11) {
    return {
      tier: 2,
      title: 'Friendly Regular',
      perk: 'Warm greetings and candid advice',
      badge: '🤝',
    };
  }
  return {
    tier: 1,
    title: 'Acquaintance',
    perk: 'Polite introductory interactions',
    badge: '👋',
  };
}

/**
 * Dynamically computes a character's emotional reaction and visual portrait state
 * based on learner performance, intent clarity, and accuracy.
 */
export function derivePersonaReaction(params: {
  persona: CharacterPersona;
  isCorrect?: boolean;
  isCommunicative?: boolean;
  score?: number;
  errorCategory?: LearningErrorCategory;
  consecutiveStreak?: number;
  isEvaluating?: boolean;
}): PersonaReaction {
  const {
    persona,
    isCorrect,
    isCommunicative,
    score = 0,
    consecutiveStreak = 0,
    isEvaluating = false,
  } = params;

  let emotion: PersonaEmotion = 'neutral';
  let reactionHeadline = `${persona.name} is ready for your response.`;

  if (isEvaluating) {
    emotion = 'thinking';
    reactionHeadline = `${persona.name} is pondering your answer...`;
  } else if (score >= 0.92 || consecutiveStreak >= 3) {
    emotion = 'impressed';
    reactionHeadline = `${persona.name} is impressed by your natural fluency!`;
  } else if (isCorrect && isCommunicative) {
    emotion = 'happy';
    reactionHeadline = `${persona.name} smiles warmly at your clear response.`;
  } else if (isCommunicative && !isCorrect) {
    emotion = 'encouraging';
    reactionHeadline = `${persona.name} understood your intent despite a minor slip.`;
  } else if (isCommunicative === false) {
    emotion = 'confused';
    reactionHeadline = `${persona.name} tilts their head, waiting for clarification.`;
  }

  const moodColors = persona.avatarConfig?.moodColor ?? DEFAULT_MOOD_COLORS;
  const moodColor = moodColors[emotion];
  const expressionBadge =
    persona.avatarConfig?.expressions[emotion] ?? persona.avatar;

  return {
    emotion,
    reactionHeadline,
    expressionBadge,
    moodColor,
    bubbleBorderColor: moodColor,
  };
}
