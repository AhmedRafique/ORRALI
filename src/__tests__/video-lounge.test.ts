import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getActiveSubtitleAtTime,
  evaluateVideoComprehension,
  contributeToCommunityMission,
  saveSubtitleWordToPhrasebook,
} from '../video/loungeEngine';
import {
  VIDEO_IMMERSION_CLIPS,
  getVideoClipsByLanguage,
  getVideoClipById,
  COMMUNITY_MISSIONS,
  getCommunityMissions,
} from '../video/catalog';

describe('Video Immersion Lounge & Cooperative Social Learning (TDD)', () => {
  const bakeryClip = getVideoClipById('fr_clip_01_boulangerie')!;

  describe('1. Interactive Subtitle Synchronization', () => {
    it('accurately resolves active subtitle within startMs and endMs range', () => {
      const sub1 = getActiveSubtitleAtTime(bakeryClip, 2500);
      assert.ok(sub1);
      assert.equal(sub1.id, 'fr_sub_1');
      assert.ok(sub1.targetSentence.includes('baguette tradition'));

      const sub2 = getActiveSubtitleAtTime(bakeryClip, 8000);
      assert.ok(sub2);
      assert.equal(sub2.id, 'fr_sub_2');
      assert.ok(sub2.targetSentence.includes('croissant au beurre'));
    });

    it('returns undefined when timestamp falls outside any subtitle window', () => {
      const none = getActiveSubtitleAtTime(bakeryClip, 15000);
      assert.equal(none, undefined);
    });
  });

  describe('2. Comprehension Question & Feedback Evaluation', () => {
    it('evaluates correct answer with 25 XP reward and native explanation', () => {
      const res = evaluateVideoComprehension(bakeryClip, 1);
      assert.equal(res.isCorrect, true);
      assert.equal(res.earnedXp, 25);
      assert.ok(res.feedback.includes('baguette tradition bien cuite'));
    });

    it('evaluates incorrect answer with constructive feedback', () => {
      const res = evaluateVideoComprehension(bakeryClip, 0);
      assert.equal(res.isCorrect, false);
      assert.equal(res.earnedXp, 5);
      assert.ok(res.feedback.includes('Not quite'));
    });
  });

  describe('3. Cooperative Community Goals & Milestones', () => {
    it('increments community counter and triggers completion when target is reached', () => {
      const mission = { ...COMMUNITY_MISSIONS[0], currentCount: 9998, targetCount: 10000, isCompleted: false };

      const { updatedMission, justCompleted } = contributeToCommunityMission(mission, 2);
      assert.equal(updatedMission.currentCount, 10000);
      assert.equal(updatedMission.isCompleted, true);
      assert.equal(justCompleted, true);
    });

    it('caps progress at target count without overflow', () => {
      const mission = { ...COMMUNITY_MISSIONS[0], currentCount: 9999, targetCount: 10000, isCompleted: false };
      const { updatedMission } = contributeToCommunityMission(mission, 10);

      assert.equal(updatedMission.currentCount, 10000);
      assert.equal(updatedMission.isCompleted, true);
    });
  });

  describe('4. Tap-to-Save Phrasebook Integration', () => {
    it('formats subtitle word and translation for instant phrasebook entry', () => {
      const word = bakeryClip.subtitles[0].words[1]; // 'baguette'
      const res = saveSubtitleWordToPhrasebook(word);

      assert.equal(res.success, true);
      assert.equal(res.phraseAdded, 'baguette (baguette)');
    });
  });

  describe('5. Catalog Scale & Multi-Language Immersion', () => {
    it('verifies catalog covers French, German, and Spanish clips with valid bilingual subtitles', () => {
      const frClips = getVideoClipsByLanguage('fr');
      const deClips = getVideoClipsByLanguage('de');
      const esClips = getVideoClipsByLanguage('es');

      assert.ok(frClips.length >= 2);
      assert.ok(deClips.length >= 1);
      assert.ok(esClips.length >= 1);

      for (const clip of VIDEO_IMMERSION_CLIPS) {
        assert.ok(clip.id.length > 0);
        assert.ok(clip.title.length > 0);
        assert.ok(clip.subtitles.length >= 2);
        assert.ok(clip.comprehensionCheck.question.length > 0);
        assert.equal(clip.comprehensionCheck.options.length, 4);
      }

      const allMissions = getCommunityMissions();
      assert.ok(allMissions.length >= 3);
    });
  });
});
