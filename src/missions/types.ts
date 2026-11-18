import { LangCode } from '../types';

export type MissionCategory = 'travel' | 'everyday' | 'professional';

export type MissionStageKind =
  | 'intro'
  | 'prep'
  | 'listening'
  | 'dialogue'
  | 'unexpected_event'
  | 'final_challenge'
  | 'evaluation';

export interface MissionDialogueTurn {
  id: string;
  speaker: string;
  speakerRole: 'npc' | 'learner';
  promptText: string;
  promptTranslation: string;
  expectedIntent: string;
  communicativeKeywords: string[];
  validAlternatives?: string[];
  hints: string[];
  branchingReply?: {
    conditionKeywords: string[];
    replyText: string;
    replyEn: string;
  };
}

export interface MissionScoreBreakdown {
  communicationSuccess: number; // 0.0 to 1.0 (intent conveyed)
  comprehension: number; // 0.0 to 1.0 (prep & listening challenges)
  vocabularyAccuracy: number; // 0.0 to 1.0 (domain terminology)
  grammarScore: number; // 0.0 to 1.0 (syntax & agreement)
  responseRelevance: number; // 0.0 to 1.0 (contextual topic adherence)
  overallScore: number; // 0.0 to 1.0
  earnedXp: number;
  passed: boolean;
  feedback: string;
  suggestedPhrasebookAdds: string[];
  remedialRecommendations: string[];
}

export interface Mission {
  id: string;
  category: MissionCategory;
  number: number;
  title: string;
  subtitle: string;
  context: string;
  cefrLevel: 'A1' | 'A2' | 'B1' | 'B2';
  languageId: LangCode;
  requiredVocabulary: Array<{ term: string; translation: string; phonetic?: string }>;
  usefulExpressions: Array<{ phrase: string; translation: string; formality?: string }>;
  prepExercises: Array<{
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }>;
  listeningChallenge: {
    audioPrompt: string;
    audioTranslation: string;
    question: string;
    options: string[];
    correctIndex: number;
  };
  dialogueTurns: MissionDialogueTurn[];
  unexpectedEvent: {
    title: string;
    situation: string;
    npcStatement: string;
    npcStatementEn: string;
    learnerObjective: string;
    requiredIntentKeywords: string[];
    acceptableAlternatives: string[];
  };
  finalChallenge: {
    objective: string;
    prompt: string;
    promptEn: string;
    solutionKeywords: string[];
  };
}
