export type LangCode = 'fr' | 'de';

export interface Item {
  id: string;
  target: string;
  en: string;
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

export type ExerciseKind = 'choice' | 'type' | 'listen';

export interface Exercise {
  kind: ExerciseKind;
  item: Item;
  options?: string[];
}

export interface Card {
  due: number;
  interval: number;
  ease: number;
  reps: number;
}

export interface Progress {
  xp: number;
  streak: number;
  lastDay: string;
  dailyGoal: number;
  dailyXp: number;
  dailyXpDay: string;
  completed: Record<string, true>;
  cards: Record<string, Card>;
}
