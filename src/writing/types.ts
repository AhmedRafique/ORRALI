import { LangCode, LearningErrorCategory } from '../types';

export type WritingPromptFormat =
  | 'short_message'
  | 'email_reply'
  | 'sentence_correction'
  | 'meaning_translation'
  | 'paragraph_description'
  | 'complaint_letter'
  | 'opinion'
  | 'professional_summary';

export interface WritingMistakeSpan {
  id: string;
  startIndex: number;
  endIndex: number;
  originalSnippet: string;
  correctedSnippet: string;
  category: LearningErrorCategory;
  explanation: string;
}

export interface WritingCorrectionResult {
  originalText: string;
  correctedText: string;
  isAccurate: boolean;
  score: number; // 0.0 to 1.0
  wordCount: number;
  mistakes: WritingMistakeSpan[];
  naturalAlternative: string;
  grammarRule: string;
  vocabularyRecommendation: string;
  followUpExercise: {
    prompt: string;
    targetHint: string;
  };
  feedback: string;
  earnedXp: number;
  offlineEvaluated: boolean;
}

export interface WritingChallenge {
  id: string;
  languageId: LangCode;
  format: WritingPromptFormat;
  level: 'A1' | 'A2' | 'B1' | 'B2';
  title: string;
  subtitle: string;
  scenario: string;
  incomingMessage?: {
    sender: string;
    text: string;
    translation: string;
  };
  instructions: string[];
  minimumWords: number;
  requiredKeywords: string[];
  suggestedExpressions: Array<{ phrase: string; translation: string }>;
  idealReference: string;
  naturalAlternative: string;
  grammarRule: string;
  vocabularyRecommendation: string;
  followUpExercise: {
    prompt: string;
    targetHint: string;
  };
}
