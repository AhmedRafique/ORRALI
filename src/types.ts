export type LangCode = 'fr' | 'de';

export interface Item {
  id: string;
  target: string;
  en: string;
  phonetic?: string;
  notes?: string;
  alternatives?: string[];
  audio?: any;
  audioUrl?: string;
}

export interface Lesson {
  id: string;
  title: string;
  items: Item[];
  subtitle?: string;
  level?: string;
}

export interface Course {
  code: LangCode;
  name: string;
  flag: string;
  speechLang: string;
  lessons: Lesson[];
}

export type ExerciseKind = 'intro' | 'choice' | 'listen' | 'type';

export interface Exercise {
  kind: ExerciseKind;
  item: Item;
  options?: string[];
}

export interface AnswerEvaluation {
  ok: boolean;
  isClose?: boolean;
  expected: string;
  matchedVariant?: string;
  hint?: string;
}

export interface Card {
  due: number;
  interval: number;
  ease: number;
  reps: number;
  lapses?: number;
  lastReviewed?: number;
}

export interface LessonCheckpoint {
  lessonId: string;
  exerciseIndex: number;
  totalExercises: number;
  correctIds: string[];
  wrongIds: string[];
  updatedAt: number;
}

export interface Progress {
  xp: number;
  courseXp?: Record<string, number>;
  streak: number;
  lastDay: string;
  dailyGoal: number;
  dailyXp: number;
  dailyXpDay: string;
  completed: Record<string, true>;
  cards: Record<string, Card>;
  checkpoints?: Record<string, LessonCheckpoint>;
}
