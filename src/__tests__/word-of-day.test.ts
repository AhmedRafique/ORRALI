import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getWordOfTheDay, isDailySparkClaimed } from '../wordOfDay';
import { emptyProgress } from '../streak';

describe('Daily Word of the Day Micro-Spark Engine (TDD)', () => {
  it('returns a deterministic cultural idiom or phrase for each language based on date', () => {
    const testDate = new Date('2026-11-17T12:00:00Z');

    const frWord = getWordOfTheDay('fr', testDate);
    assert.equal(frWord.courseCode, 'fr');
    assert.ok(frWord.phrase.length > 0);
    assert.ok(frWord.meaningEn.length > 0);
    assert.ok(frWord.phonetic.length > 0);
    assert.ok(frWord.culturalInsight.length > 0);
    assert.equal(frWord.bonusXp, 5);

    const deWord = getWordOfTheDay('de', testDate);
    assert.equal(deWord.courseCode, 'de');
    assert.ok(deWord.phrase.length > 0);

    const esWord = getWordOfTheDay('es', testDate);
    assert.equal(esWord.courseCode, 'es');
    assert.ok(esWord.phrase.length > 0);
  });

  it('generates consistent words for the same day and rotates on next day', () => {
    const day1 = new Date('2026-11-17T10:00:00Z');
    const sameDay = new Date('2026-11-17T22:00:00Z');
    const day2 = new Date('2026-11-18T10:00:00Z');

    const w1 = getWordOfTheDay('fr', day1);
    const wSame = getWordOfTheDay('fr', sameDay);
    const w2 = getWordOfTheDay('fr', day2);

    assert.equal(w1.phrase, wSame.phrase);
    assert.notEqual(w1.phrase, w2.phrase);
  });

  it('correctly tracks whether learner has claimed today spark bonus', () => {
    const p = emptyProgress();
    assert.equal(isDailySparkClaimed(p, '2026-11-17'), false);

    const claimedP = {
      ...p,
      dailySparkClaimedDay: '2026-11-17',
    };
    assert.equal(isDailySparkClaimed(claimedP, '2026-11-17'), true);
    assert.equal(isDailySparkClaimed(claimedP, '2026-11-18'), false);
  });
});
