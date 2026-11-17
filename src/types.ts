export type LangCode = 'fr' | 'de' | 'es';

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

export interface GrammarExample {
  target: string;
  en: string;
  note?: string;
}

export interface GrammarCapsule {
  id: string;
  title: string;
  tag: string;
  summary: string;
  explanation: string;
  examples: GrammarExample[];
}

export interface Lesson {
  id: string;
  title: string;
  items: Item[];
  subtitle?: string;
  level?: string;
  grammarCapsule?: GrammarCapsule;
}

export interface Course {
  code: LangCode;
  name: string;
  flag: string;
  speechLang: string;
  lessons: Lesson[];
}

export type ExerciseKind = 'intro' | 'choice' | 'scramble' | 'listen' | 'speak' | 'type';

export interface Exercise {
  kind: ExerciseKind;
  item: Item;
  options?: string[];
  tokens?: string[];
}

export interface WordScore {
  word: string;
  score: number;
  status: 'great' | 'good' | 'retry';
}

export interface PronunciationResult {
  overallScore: number;
  words: WordScore[];
  feedback: string;
  passed: boolean;
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

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'learning' | 'streak' | 'speaking' | 'mastery';
  unlockedAt?: number;
  current: number;
  target: number;
  unlocked: boolean;
}

export interface DialogTurn {
  speaker: string;
  avatar: string;
  target: string;
  en: string;
}

export interface StoryScenario {
  id: string;
  courseCode: LangCode;
  title: string;
  subtitle: string;
  level: string;
  dialog: DialogTurn[];
  question: {
    prompt: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export interface MistakeRecord {
  itemId: string;
  courseCode: LangCode;
  failCount: number;
  passCount: number;
  lastFailedAt: number;
}

export interface MistakeDiagnosis {
  item: Item;
  failCount: number;
  passCount: number;
  accuracyPercent: number;
  suggestedTip: string;
}

export interface RoleplayMessage {
  id: string;
  sender: 'ai' | 'user';
  speakerName: string;
  avatar: string;
  target: string;
  en?: string;
  feedback?: string;
  timestamp: number;
}

export interface RoleplayTurnResult {
  reply: RoleplayMessage;
  isCompleted: boolean;
  earnedXp?: number;
  suggestedNextReplies: string[];
  intentMet?: boolean;
}

export interface RoleplayScenario {
  id: string;
  courseCode: LangCode;
  title: string;
  role: string;
  personaName: string;
  avatar: string;
  contextObjective: string;
  initialGreeting: { target: string; en: string };
  suggestedReplies: string[];
}

export interface TutorExplanation {
  topic: string;
  childFriendlySummary: string;
  detailedExplanation: string;
  examples: { target: string; en: string }[];
  goldenRule: string;
}

export interface Progress {
  xp: number;
  courseXp?: Record<string, number>;
  streak: number;
  streakShields?: number;
  lastShieldUsed?: string;
  lastDay: string;
  dailyGoal: number;
  dailyXp: number;
  dailyXpDay: string;
  completed: Record<string, true>;
  completedStories?: Record<string, true>;
  cards: Record<string, Card>;
  checkpoints?: Record<string, LessonCheckpoint>;
  badges?: Record<string, number>;
  diplomas?: Record<string, number>;
  dailySparkClaimedDay?: string;
}
