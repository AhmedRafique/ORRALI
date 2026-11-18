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
  cadenceWpm?: number;
  intonationVariance?: number;
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
  completedMissions?: Record<string, number>;
}

export type LearningActivityKind =
  | 'lesson'
  | 'speed_recall'
  | 'mistake_clinic'
  | 'verb_gym'
  | 'radio_lab'
  | 'roleplay'
  | 'cafe_library'
  | 'placement'
  | 'express_review'
  | 'shadowing'
  | 'commuter'
  | 'milestone_exam'
  | 'mission'
  | 'writing_lab';

export type LearningEventResult =
  | 'correct'
  | 'incorrect'
  | 'partially_correct'
  | 'abandoned'
  | 'hint_used';

export type LearningErrorCategory =
  | 'vocabulary'
  | 'grammar'
  | 'conjugation'
  | 'gender'
  | 'word_order'
  | 'listening'
  | 'pronunciation'
  | 'spelling'
  | 'naturalness'
  | 'communication_intent';

export interface LearningEvent {
  id: string;
  languageId: LangCode;
  activityId: LearningActivityKind;
  objectiveIds: string[];
  result: LearningEventResult;
  score?: number;
  difficulty: 'A1' | 'A2' | 'B1' | 'B2' | string;
  durationMs: number;
  hintsUsed: number;
  attemptsCount: number;
  confidence: number;
  errorCategory?: LearningErrorCategory;
  payload?: Record<string, any>;
  createdAt: number;
}

export interface LearningEventFilter {
  languageId?: LangCode;
  activityId?: LearningActivityKind;
  objectiveId?: string;
  result?: LearningEventResult;
  errorCategory?: LearningErrorCategory;
  sinceTimestamp?: number;
  untilTimestamp?: number;
  limit?: number;
}

export interface LearningEventsSummary {
  totalEvents: number;
  correctCount: number;
  incorrectCount: number;
  partiallyCorrectCount: number;
  overallAccuracyPercent: number;
  averageConfidence: number;
  totalDurationMs: number;
  errorDistribution: Record<LearningErrorCategory, number>;
  activityDistribution: Record<LearningActivityKind, number>;
  topStumbleObjectives: Array<{
    objectiveId: string;
    failureCount: number;
    totalAttempts: number;
    failureRatePercent: number;
  }>;
}

export type SkillDomain =
  | 'vocabulary'
  | 'grammar_present'
  | 'grammar_past'
  | 'grammar_future'
  | 'listening'
  | 'speaking'
  | 'writing'
  | 'reading'
  | 'syntax'
  | 'communication';

export interface ObjectiveMastery {
  objectiveId: string;
  domain: SkillDomain;
  level: 'A1' | 'A2' | 'B1' | 'B2';
  mastery: number;
  confidence: number;
  totalAttempts: number;
  correctAttempts: number;
  failCount: number;
  streak: number;
  recentAccuracy: number;
  lastPracticedAt: number;
  nextReviewAt: number;
  errorDistribution: Partial<Record<LearningErrorCategory, number>>;
}

export interface DomainSummary {
  domain: SkillDomain;
  mastery: number;
  confidence: number;
  totalAttempts: number;
  needsPractice: boolean;
}

export interface LearnerLanguageProfile {
  languageId: LangCode;
  updatedAt: number;
  overallMastery: number;
  overallConfidence: number;
  domains: Record<SkillDomain, DomainSummary>;
  objectives: Record<string, ObjectiveMastery>;
  activeStumbles: string[];
}

export type RecommendationActionType =
  | 'review_stumbles'
  | 'practice_grammar'
  | 'train_listening'
  | 'advance_curriculum'
  | 'roleplay_simulation'
  | 'conjugation_gym'
  | 'speed_challenge'
  | 'maintain_streak';

export interface LearningRecommendation {
  id: string;
  actionType: RecommendationActionType;
  title: string;
  reason: string;
  priority: 'urgent' | 'high' | 'recommended' | 'maintenance';
  targetDomain: SkillDomain;
  estimatedDurationMinutes: number;
  targetObjectiveIds: string[];
  suggestedActivity: LearningActivityKind;
  metadata?: Record<string, any>;
}

export type SessionWorkoutType = 'quick' | 'balanced' | 'deep';

export interface PersonalizedSession {
  workoutType: SessionWorkoutType;
  targetDurationMinutes: number;
  title: string;
  focusExplanation: string;
  activities: Array<{
    activityId: LearningActivityKind;
    title: string;
    durationMinutes: number;
    objectiveIds: string[];
    rationale: string;
  }>;
}




export interface PronunciationMap {
  languageId: LangCode;
  wordScores: Record<string, { occurrences: number; averageScore: number; lastScore: number }>;
  averageCadenceWpm: number;
  cadenceHealth: 'too_slow' | 'good' | 'too_fast';
}

export interface ProgressiveAudioItem {
  id: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | string;
  target: string;
  en: string;
  audioUrl?: string;
  durationMs: number;
  focus: 'vocabulary' | 'grammar' | 'cadence' | 'intonation';
}


export interface SavedPhrase {
  id: string;
  target: string;
  en: string;
  languageId: LangCode;
  savedAt: number;
  sourceActivity: LearningActivityKind;
  tags: string[];
}

export interface ConversationMemoryContext {
  topic: string;
  userPreferences: Record<string, string>;
  knownMistakes: string[];
  lastInteractionAt: number;
}

export interface GrammarRadarData {
  radarId: string;
  targetLanguage: LangCode;
  detectedPatterns: string[];
  suggestedFocus: string[];
}

