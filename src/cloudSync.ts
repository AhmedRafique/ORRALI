import { Card, Progress } from './types';

export interface CloudBackupSnapshot {
  schemaVersion: number;
  timestamp: number;
  progress: Progress;
  checksum: string;
}

/**
 * Generates a simple, deterministic checksum for progress verification.
 */
export function computeProgressChecksum(progress: Progress): string {
  const serialized = JSON.stringify({
    xp: progress.xp,
    streak: progress.streak,
    lastDay: progress.lastDay,
    shields: progress.streakShields,
    completedCount: Object.keys(progress.completed ?? {}).length,
    cardsCount: Object.keys(progress.cards ?? {}).length,
  });

  let hash = 0;
  for (let i = 0; i < serialized.length; i++) {
    hash = (hash << 5) - hash + serialized.charCodeAt(i);
    hash |= 0;
  }
  return `chk_${Math.abs(hash).toString(16)}`;
}

/**
 * Creates a validated cloud backup snapshot ready for Google Play Cloud Sync.
 */
export function createCloudBackupSnapshot(progress: Progress): CloudBackupSnapshot {
  return {
    schemaVersion: 1,
    timestamp: Date.now(),
    progress,
    checksum: computeProgressChecksum(progress),
  };
}

/**
 * Verifies whether a cloud snapshot has valid checksum integrity.
 */
export function verifyCloudBackupSnapshot(snapshot: CloudBackupSnapshot): boolean {
  if (!snapshot || snapshot.schemaVersion !== 1 || !snapshot.progress) {
    return false;
  }
  const expectedChecksum = computeProgressChecksum(snapshot.progress);
  return expectedChecksum === snapshot.checksum;
}

/**
 * Conflict resolution engine:
 * Intelligently merges local progress with remote cloud backup.
 * Ensures the learner never loses XP, streaks, cards, or trophies.
 */
export function mergeCloudProgress(local: Progress, remote: Progress): Progress {
  // 1. Maximized XP
  const xp = Math.max(local.xp ?? 0, remote.xp ?? 0);

  // 2. Streak resolution: prioritize most recent practice day
  let streak = local.streak ?? 0;
  let lastDay = local.lastDay ?? '';

  if ((remote.lastDay ?? '') > (local.lastDay ?? '')) {
    streak = remote.streak ?? 0;
    lastDay = remote.lastDay ?? '';
  } else if ((remote.lastDay ?? '') === (local.lastDay ?? '')) {
    streak = Math.max(local.streak ?? 0, remote.streak ?? 0);
  }

  // 3. Maximized streak shields
  const streakShields = Math.max(local.streakShields ?? 1, remote.streakShields ?? 1);

  // 4. Union of completed chapters
  const completed = {
    ...(local.completed ?? {}),
    ...(remote.completed ?? {}),
  };

  // 5. Course XP maximized per language
  const courseXp = {
    fr: Math.max(local.courseXp?.fr ?? 0, remote.courseXp?.fr ?? 0),
    de: Math.max(local.courseXp?.de ?? 0, remote.courseXp?.de ?? 0),
    es: Math.max(local.courseXp?.es ?? 0, remote.courseXp?.es ?? 0),
  };

  // 6. Union of unlocked badges (earliest unlock timestamp preserved)
  const badges: Record<string, number> = { ...(local.badges ?? {}) };
  for (const [badgeId, time] of Object.entries(remote.badges ?? {})) {
    if (!badges[badgeId] || time < badges[badgeId]) {
      badges[badgeId] = time;
    }
  }

  // 7. Spaced repetition cards: merge taking higher interval or higher reps
  const cards: Record<string, Card> = { ...(local.cards ?? {}) };
  for (const [cardId, rCard] of Object.entries(remote.cards ?? {})) {
    const lCard = cards[cardId];
    if (!lCard) {
      cards[cardId] = rCard;
    } else {
      if (rCard.interval > lCard.interval || rCard.reps > lCard.reps) {
        cards[cardId] = rCard;
      }
    }
  }

  return {
    ...local,
    xp,
    streak,
    lastDay,
    streakShields,
    completed,
    courseXp,
    badges,
    cards,
    dailyGoal: Math.max(local.dailyGoal ?? 20, remote.dailyGoal ?? 20),
  };
}
