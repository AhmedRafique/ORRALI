import {
  CommunityMission,
  InteractiveSubtitle,
  SubtitleWord,
  VideoImmersionClip,
} from './types';

/**
 * Retrieves the active interactive subtitle synchronized to playback timestamp.
 */
export function getActiveSubtitleAtTime(
  clip: VideoImmersionClip,
  currentMs: number
): InteractiveSubtitle | undefined {
  return clip.subtitles.find(
    (sub) => currentMs >= sub.startMs && currentMs <= sub.endMs
  );
}

/**
 * Evaluates the post-video comprehension check and awards XP.
 */
export function evaluateVideoComprehension(
  clip: VideoImmersionClip,
  selectedOption: number
): { isCorrect: boolean; earnedXp: number; feedback: string } {
  const isCorrect = selectedOption === clip.comprehensionCheck.correctIndex;
  const earnedXp = isCorrect ? 25 : 5;
  const feedback = isCorrect
    ? `Correct! ${clip.comprehensionCheck.explanation}`
    : `Not quite. ${clip.comprehensionCheck.explanation}`;

  return { isCorrect, earnedXp, feedback };
}

/**
 * Contributes learner actions to a cooperative global community goal.
 */
export function contributeToCommunityMission(
  mission: CommunityMission,
  amount: number = 1
): { updatedMission: CommunityMission; justCompleted: boolean } {
  const nextCount = Math.min(
    mission.targetCount,
    mission.currentCount + Math.max(0, amount)
  );
  const wasCompleted = mission.isCompleted;
  const isNowCompleted = nextCount >= mission.targetCount;
  const justCompleted = !wasCompleted && isNowCompleted;

  const updatedMission: CommunityMission = {
    ...mission,
    currentCount: nextCount,
    isCompleted: isNowCompleted,
  };

  return { updatedMission, justCompleted };
}

/**
 * Prepares and adds an interactive subtitle word to the learner's phrasebook.
 */
export function saveSubtitleWordToPhrasebook(
  word: SubtitleWord
): { phraseAdded: string; success: boolean } {
  const cleanWord = word.word.trim();
  if (!cleanWord) {
    return { phraseAdded: '', success: false };
  }

  return {
    phraseAdded: `${cleanWord} (${word.translation})`,
    success: true,
  };
}
