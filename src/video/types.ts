import { LangCode } from '../types';

export type VideoClipCategory =
  | 'street_interview'
  | 'cultural_snippet'
  | 'culinary_craft'
  | 'daily_dialogue'
  | 'workplace_spotlight';

export interface SubtitleWord {
  word: string;
  translation: string;
  phonetic?: string;
  isSaved?: boolean;
}

export interface InteractiveSubtitle {
  id: string;
  startMs: number;
  endMs: number;
  targetSentence: string;
  translation: string;
  words: SubtitleWord[];
}

export interface VideoImmersionClip {
  id: string;
  title: string;
  topic: string;
  languageId: LangCode;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  durationSeconds: number;
  thumbnailEmoji: string;
  category: VideoClipCategory;
  speakerName: string;
  subtitles: InteractiveSubtitle[];
  comprehensionCheck: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export interface CommunityMission {
  id: string;
  languageId: LangCode;
  title: string;
  description: string;
  targetCount: number;
  currentCount: number;
  unitName: string;
  rewardXp: number;
  isCompleted: boolean;
}
