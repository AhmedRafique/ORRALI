import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { courses, stories } from '../content';
import {
  buildExercises,
  evaluateAnswer,
  evaluateScramble,
  tokenizePhrase,
  norm,
  stripAccents,
  levenshteinDistance,
} from '../exercises';
import { evaluatePronunciation } from '../scoring';
import { emptyProgress, touchStreak, getEffectiveStreak, dayKey } from '../streak';
import {
  createCloudBackupSnapshot,
  verifyCloudBackupSnapshot,
  mergeCloudProgress,
} from '../cloudSync';
import { getLexiconEntries, filterLexicon } from '../lexicon';
import { generateSpeedDeck, calculateSpeedScore } from '../speedRecall';
import { Progress } from '../types';

describe('Adversarial Quality & Bug-Hunter Stress Test Suite (TDD)', () => {
  describe('1. Curriculum & Content Integrity Stress Test', () => {
    it('verifies all 360 items have unique IDs, non-empty fields, valid alternatives, and physical MP3 audio', () => {
      const allIds = new Set<string>();
      let itemCount = 0;
      const audioMapContent = fs.readFileSync('src/audioMap.ts', 'utf8');

      for (const course of courses) {
        assert.ok(['fr', 'de', 'es'].includes(course.code));
        assert.ok(course.lessons.length >= 20);

        for (const lesson of course.lessons) {
          assert.equal(lesson.items.length, 6);
          assert.ok(lesson.grammarCapsule, `Lesson ${lesson.id} missing grammar capsule`);
          assert.ok(lesson.grammarCapsule.examples.length >= 2);

          for (const item of lesson.items) {
            itemCount++;
            assert.ok(!allIds.has(item.id), `Duplicate ID detected: ${item.id}`);
            allIds.add(item.id);

            assert.ok(item.target.trim().length > 0, `Empty target in ${item.id}`);
            assert.ok(item.en.trim().length > 0, `Empty English in ${item.id}`);
            assert.ok((item.phonetic ?? '').trim().length > 0, `Empty phonetic in ${item.id}`);
            assert.ok((item.notes ?? '').trim().length > 0, `Empty notes in ${item.id}`);
            assert.ok(Array.isArray(item.alternatives), `Invalid alternatives in ${item.id}`);

            // Verify mapping exists in audioMap.ts
            assert.ok(
              audioMapContent.includes(`'${item.id}':`),
              `Missing audio asset mapping for ${item.id} in src/audioMap.ts`
            );

            // Verify physical MP3 file exists on disk and is non-empty
            const lang = item.id.slice(0, 2);
            const physicalPath = `assets/audio/${lang}/${item.id}.mp3`;
            assert.ok(
              fs.existsSync(physicalPath),
              `Physical audio file missing on disk: ${physicalPath}`
            );
            assert.ok(
              fs.statSync(physicalPath).size > 500,
              `Audio file is corrupted or empty: ${physicalPath}`
            );
          }
        }
      }

      assert.ok(itemCount >= 360);
      assert.equal(allIds.size, itemCount);
    });

    it('verifies all earcon audio files physically exist on disk', () => {
      assert.ok(fs.existsSync('assets/audio/earcons/chime_success.wav'));
      assert.ok(fs.existsSync('assets/audio/earcons/chime_error.wav'));
      assert.ok(fs.existsSync('assets/audio/earcons/chime_fanfare.wav'));
      assert.ok(fs.statSync('assets/audio/earcons/chime_success.wav').size > 1000);
      assert.ok(fs.statSync('assets/audio/earcons/chime_error.wav').size > 1000);
      assert.ok(fs.statSync('assets/audio/earcons/chime_fanfare.wav').size > 1000);
    });

    it('verifies all dialog stories have valid structure and questions', () => {
      assert.ok(stories.length >= 5);
      for (const story of stories) {
        assert.ok(story.title.length > 0);
        assert.ok(story.dialog.length >= 4);
        assert.ok(story.question.prompt.length > 0);
        assert.equal(story.question.options.length, 3);
        assert.ok(story.question.correctIndex >= 0 && story.question.correctIndex < 3);
        assert.ok(story.question.explanation.length > 0);
      }
    });
  });

  describe('2. Exercises & Multiple-Choice Distractor Stress Test', () => {
    it('ensures choice options always contain the target, exactly 4 unique options, and no duplicates', () => {
      for (const course of courses) {
        for (const lesson of course.lessons) {
          const exercises = buildExercises(course, lesson.items);
          const choiceExercises = exercises.filter((e) => e.kind === 'choice');

          for (const ex of choiceExercises) {
            assert.ok(ex.options, `Missing options in ${ex.item.id}`);
            assert.equal(ex.options.length, 4, `Expected 4 options in ${ex.item.id}`);
            assert.ok(
              ex.options.includes(ex.item.target),
              `Options must include target in ${ex.item.id}`
            );

            // Assert no duplicate options
            const uniqueOptions = new Set(ex.options);
            assert.equal(
              uniqueOptions.size,
              4,
              `Found duplicate options in ${ex.item.id}: ${JSON.stringify(ex.options)}`
            );
          }
        }
      }
    });

    it('ensures scramble word tiles can be reconstructed and validated without crashing', () => {
      for (const course of courses) {
        for (const lesson of course.lessons) {
          for (const item of lesson.items) {
            const tokens = tokenizePhrase(item.target);
            assert.ok(tokens.length >= 1);

            // Correct order must pass
            const ok = evaluateScramble(tokens, item);
            assert.equal(ok, true, `Scramble should validate for ${item.id}`);

            // If multi-token, reversed order must fail unless it happens to match a valid accepted alternative (e.g. German V2 inversion "Das nehme ich")
            const isReversalInAlternatives = item.alternatives?.some(
              (a) => norm(a) === norm([...tokens].reverse().join(' '))
            );
            if (tokens.length >= 3 && !isReversalInAlternatives) {
              const reversed = [...tokens].reverse();
              const revOk = evaluateScramble(reversed, item);
              assert.equal(revOk, false, `Reversed tokens must fail for ${item.id}`);
            }
          }
        }
      }
    });
  });

  describe('3. Answer Evaluation Edge Cases & Normalization', () => {
    const dummyItem = {
      id: 'fr-test',
      target: 'Bonjour, comment allez-vous ?',
      en: 'Hello, how are you?',
      alternatives: ['Bonjour comment allez vous'],
    };

    it('handles extreme whitespace and casing variations', () => {
      assert.equal(evaluateAnswer('   Bonjour, comment allez-vous ?   ', dummyItem).ok, true);
      assert.equal(evaluateAnswer('bonjour, comment allez-vous ?', dummyItem).ok, true);
      assert.equal(evaluateAnswer('BONJOUR, COMMENT ALLEZ-VOUS ?', dummyItem).ok, true);
      assert.equal(evaluateAnswer('Bonjour    comment    allez    vous', dummyItem).ok, true);
    });

    it('handles inverted Spanish punctuation', () => {
      const esItem = {
        id: 'es-test',
        target: '¡Hola! ¿Cómo estás?',
        en: 'Hello! How are you?',
        alternatives: ['Hola como estas'],
      };
      assert.equal(evaluateAnswer('Hola como estas', esItem).ok, true);
      assert.equal(evaluateAnswer('¡Hola! ¿Cómo estás?', esItem).ok, true);
      assert.equal(evaluateAnswer('hola como estas', esItem).ok, true);
    });

    it('rejects empty or nonsense answers strictly', () => {
      assert.equal(evaluateAnswer('', dummyItem).ok, false);
      assert.equal(evaluateAnswer('   ', dummyItem).ok, false);
      assert.equal(evaluateAnswer('gibberish waka waka', dummyItem).ok, false);
      assert.equal(evaluateAnswer('123456789', dummyItem).ok, false);
    });
  });

  describe('4. Pronunciation Scoring Anti-Crash & Leniency Stress Test', () => {
    it('handles empty, whitespace-only, and punctuation-only transcripts without throwing', () => {
      const res1 = evaluatePronunciation('Bonjour', 1200, '');
      assert.equal(res1.passed, false);
      assert.ok(res1.overallScore <= 35);

      const res2 = evaluatePronunciation('Bonjour', 1200, '     ');
      assert.equal(res2.passed, false);
      assert.ok(res2.overallScore <= 35);

      const res3 = evaluatePronunciation('Bonjour', 1200, '?!:;');
      assert.equal(res3.passed, false);
      assert.ok(res3.overallScore <= 35);
    });

    it('handles zero or negative duration gracefully', () => {
      const res = evaluatePronunciation('Guten Tag', 0, 'Guten Tag');
      assert.equal(res.passed, false); // < 400ms is rejected as accidental tap
      assert.equal(res.overallScore, 30);
    });

    it('handles extremely long duration (> 10000ms) gracefully', () => {
      const res = evaluatePronunciation('Guten Tag', 15000, 'Guten Tag');
      assert.equal(res.passed, false); // dragged out
      assert.equal(res.overallScore, 50);
    });

    it('correctly accepts words with contractions and split tokens', () => {
      const res = evaluatePronunciation("C'est magnifique", 1400, 'c est magnifique');
      assert.equal(res.passed, true);
      assert.ok(res.overallScore >= 75);
    });
  });

  describe('5. Streak, Shield Protection & Gamification Stress Test', () => {
    it('handles missing fields in Progress without throwing', () => {
      const partial = { xp: 10 } as Progress;
      assert.doesNotThrow(() => touchStreak(partial));
      assert.doesNotThrow(() => getEffectiveStreak(partial));
    });

    it('preserves streak across day boundaries with Streak Freeze Shields', () => {
      const day1 = '2026-11-10';
      const day2 = '2026-11-11';
      const day3 = '2026-11-12';
      const day4 = '2026-11-14'; // Missed Nov 13 (1 day gap)

      let p: Progress = {
        ...emptyProgress(),
        streak: 1,
        lastDay: day1,
        streakShields: 1,
      };

      // Consecutive day
      p = touchStreak(p, new Date(`${day2}T10:00:00Z`));
      assert.equal(p.streak, 2);

      p = touchStreak(p, new Date(`${day3}T10:00:00Z`));
      assert.equal(p.streak, 3);
      // Shield recharges on streak 3!
      assert.ok((p.streakShields ?? 0) >= 1);

      // Missed 1 day with shield active -> streak preserved, shield consumed
      p = touchStreak(p, new Date(`${day4}T10:00:00Z`));
      assert.equal(p.streak, 4); // Streak preserved!
    });
  });

  describe('6. Cloud Sync Conflict Resolution Stress Test', () => {
    it('handles empty or sparse local/remote objects gracefully', () => {
      const local = emptyProgress();
      const remote = emptyProgress();

      const merged = mergeCloudProgress(local, remote);
      assert.equal(merged.xp, 0);
      assert.equal(merged.streak, 0);
    });

    it('verifies snapshot tamper resistance against checksum forgery', () => {
      const p = { ...emptyProgress(), xp: 500 };
      const snapshot = createCloudBackupSnapshot(p);

      assert.equal(verifyCloudBackupSnapshot(snapshot), true);

      // Mutate snapshot progress
      const forged = { ...snapshot, progress: { ...p, xp: 9999 } };
      assert.equal(verifyCloudBackupSnapshot(forged), false);
    });
  });

  describe('7. Speed Recall Arcade & Lexicon Stress Test', () => {
    it('generates speed deck without exceeding course item bounds', () => {
      for (const course of courses) {
        const deck = generateSpeedDeck(course, 100); // Request more than available
        assert.ok(deck.length > 0);
        assert.ok(deck.length <= course.lessons.flatMap((l) => l.items).length);
        for (const q of deck) {
          assert.equal(q.options.length, 4);
          assert.ok(q.options.includes(q.correctTarget));
        }
      }
    });

    it('filters lexicon safely with special characters and empty results', () => {
      const course = courses[0];
      const p = emptyProgress();
      const entries = getLexiconEntries(course, p);

      const rEmpty = filterLexicon(entries, '___nonexistent_query___');
      assert.equal(rEmpty.length, 0);

      const rAll = filterLexicon(entries, '');
      assert.equal(rAll.length, entries.length);
    });
  });
});
