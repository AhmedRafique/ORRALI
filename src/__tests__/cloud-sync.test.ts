import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { emptyProgress } from '../streak';
import {
  createCloudBackupSnapshot,
  verifyCloudBackupSnapshot,
  mergeCloudProgress,
} from '../cloudSync';
import { Progress } from '../types';

describe('Google Play Cloud Sync & Backup Engine (TDD)', () => {
  it('creates a validated cloud backup snapshot with checksum and timestamp', () => {
    const p: Progress = {
      ...emptyProgress(),
      xp: 150,
      streak: 7,
      completed: { 'fr-1': true, 'fr-2': true },
      badges: { first_words: 1000 },
    };

    const snapshot = createCloudBackupSnapshot(p);
    assert.equal(snapshot.schemaVersion, 1);
    assert.ok(snapshot.timestamp > 0);
    assert.equal(snapshot.progress.xp, 150);
    assert.ok(snapshot.checksum.length > 0);

    const isValid = verifyCloudBackupSnapshot(snapshot);
    assert.equal(isValid, true);
  });

  it('detects corrupted or tampered cloud snapshots', () => {
    const p = emptyProgress();
    const snapshot = createCloudBackupSnapshot(p);

    // Tamper with data
    const tampered = {
      ...snapshot,
      progress: { ...snapshot.progress, xp: 999999 },
    };

    assert.equal(verifyCloudBackupSnapshot(tampered), false);
  });

  it('detects tampering or interval change on cards even when card count is identical', () => {
    const p: Progress = {
      ...emptyProgress(),
      cards: {
        'fr-1-1': { due: 1000, interval: 1, ease: 2.5, reps: 1, lapses: 0 },
      },
    };
    const snapshot = createCloudBackupSnapshot(p);

    // Tamper with card interval without changing card count
    const tampered = {
      ...snapshot,
      progress: {
        ...p,
        cards: {
          'fr-1-1': { due: 1000, interval: 21, ease: 2.5, reps: 5, lapses: 0 },
        },
      },
    };

    assert.equal(verifyCloudBackupSnapshot(tampered), false);
  });

  it('merges local and remote cloud progress with conflict resolution', () => {
    const local: Progress = {
      ...emptyProgress(),
      xp: 200,
      streak: 5,
      lastDay: '2026-11-16',
      streakShields: 1,
      completed: { 'fr-1': true, 'fr-2': true },
      courseXp: { fr: 150, de: 50, es: 0 },
      badges: { first_words: 1000 },
      cards: {
        'fr-1-1': { due: 2000, interval: 10, ease: 2.5, reps: 3, lapses: 0 },
      },
    };

    const remote: Progress = {
      ...emptyProgress(),
      xp: 280,
      streak: 4,
      lastDay: '2026-11-15',
      streakShields: 2,
      completed: { 'fr-1': true, 'de-1': true },
      courseXp: { fr: 100, de: 120, es: 60 },
      badges: { xp_centurion: 2000 },
      cards: {
        'fr-1-1': { due: 3000, interval: 21, ease: 2.6, reps: 5, lapses: 0 }, // Higher interval
        'de-1-1': { due: 1500, interval: 4, ease: 2.5, reps: 2, lapses: 0 },
      },
    };

    const merged = mergeCloudProgress(local, remote);

    // 1. Highest XP wins
    assert.equal(merged.xp, 280);

    // 2. Most recent active streak preserved
    assert.equal(merged.streak, 5);
    assert.equal(merged.lastDay, '2026-11-16');

    // 3. Highest streak shields preserved (never lose shields)
    assert.equal(merged.streakShields, 2);

    // 4. Completed chapters unioned
    assert.equal(merged.completed['fr-1'], true);
    assert.equal(merged.completed['fr-2'], true);
    assert.equal(merged.completed['de-1'], true);

    // 5. Course XP maximized per language
    assert.equal(merged.courseXp!.fr, 150);
    assert.equal(merged.courseXp!.de, 120);
    assert.equal(merged.courseXp!.es, 60);

    // 6. Badges unioned
    assert.equal(merged.badges!.first_words, 1000);
    assert.equal(merged.badges!.xp_centurion, 2000);

    // 7. Cards take higher interval
    assert.equal(merged.cards['fr-1-1']?.interval, 21);
    assert.equal(merged.cards['de-1-1']?.interval, 4);
  });
});
