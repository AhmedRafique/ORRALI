import { LangCode, Progress, DailyBriefing, FalseFriendItem, OfflinePackState } from './types';

export function generateDailyBriefing(progress: Progress): DailyBriefing {
  const tasks = [];
  
  if (progress.dailyXp < progress.dailyGoal) {
    tasks.push(`Earn ${progress.dailyGoal - progress.dailyXp} XP to hit your daily goal.`);
  } else {
    tasks.push('Daily goal reached! Great job.');
  }

  // Count due cards
  const now = Date.now();
  const dueCount = Object.values(progress.cards).filter(c => c.due <= now).length;
  
  if (dueCount > 0) {
    tasks.push(`Review ${dueCount} due flashcards in the Smart Review Queue.`);
    return {
      date: new Date().toISOString().split('T')[0],
      recommendedFocus: 'Review Stumbles',
      tasks
    };
  }

  tasks.push('Explore a new story in the Café Library.');

  return {
    date: new Date().toISOString().split('T')[0],
    recommendedFocus: 'New Lesson',
    tasks
  };
}

const MOCK_FALSE_FRIENDS: FalseFriendItem[] = [
  {
    id: 'fr-ff-1',
    targetLanguage: 'fr',
    targetWord: 'actuellement',
    falseEnglishCognate: 'actually',
    actualEnglishMeaning: 'currently / right now',
    exampleSentence: 'Actuellement, je travaille à Paris.'
  },
  {
    id: 'es-ff-1',
    targetLanguage: 'es',
    targetWord: 'embarazada',
    falseEnglishCognate: 'embarrassed',
    actualEnglishMeaning: 'pregnant',
    exampleSentence: 'Ella está embarazada de seis meses.'
  },
  {
    id: 'de-ff-1',
    targetLanguage: 'de',
    targetWord: 'bekommen',
    falseEnglishCognate: 'become',
    actualEnglishMeaning: 'to get / receive',
    exampleSentence: 'Ich habe ein Geschenk bekommen.'
  }
];

export function getFalseFriendsForLanguage(languageId: LangCode): FalseFriendItem[] {
  return MOCK_FALSE_FRIENDS.filter(ff => ff.targetLanguage === languageId);
}

export function manageOfflinePack(
  currentState: OfflinePackState,
  action: 'start_download' | 'finish_download' | 'error'
): OfflinePackState {
  const nextState = { ...currentState };

  switch (action) {
    case 'start_download':
      nextState.status = 'downloading';
      break;
    case 'finish_download':
      nextState.status = 'installed';
      nextState.downloadedAt = Date.now();
      break;
    case 'error':
      nextState.status = 'error';
      break;
  }

  return nextState;
}
