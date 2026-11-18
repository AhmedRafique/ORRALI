import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  generateDailyBriefing,
  getFalseFriendsForLanguage,
  manageOfflinePack
} from '../ecosystem';
import { Progress, FalseFriendItem, OfflinePackState } from '../types';

describe('6.9.0 - Supporting Ecosystem & Offline Packs', () => {
  describe('Daily Briefing', () => {
    it('generates a daily briefing based on current progress', () => {
      const mockProgress: Progress = {
        xp: 100,
        streak: 5,
        lastDay: '2026-11-18',
        dailyGoal: 50,
        dailyXp: 0,
        dailyXpDay: '2026-11-18',
        completed: {},
        cards: {}
      };

      const briefing = generateDailyBriefing(mockProgress);
      assert.ok(briefing.date);
      assert.ok(briefing.tasks.length > 0);
      assert.ok(briefing.recommendedFocus);
    });
  });

  describe('False Friends Trainer', () => {
    it('returns false friends for a specific language', () => {
      const frFriends = getFalseFriendsForLanguage('fr');
      assert.ok(frFriends.length > 0);
      assert.equal(frFriends[0].targetLanguage, 'fr');
      assert.ok(frFriends[0].falseEnglishCognate);
    });
  });

  describe('Offline Packs Management', () => {
    it('transitions offline pack state from available to installed', () => {
      const initialState: OfflinePackState = {
        packId: 'fr-audio-pack',
        languageId: 'fr',
        downloadedAt: null,
        sizeBytes: 1024 * 1024 * 50, // 50MB
        status: 'available'
      };

      const downloadingState = manageOfflinePack(initialState, 'start_download');
      assert.equal(downloadingState.status, 'downloading');

      const installedState = manageOfflinePack(downloadingState, 'finish_download');
      assert.equal(installedState.status, 'installed');
      assert.ok(installedState.downloadedAt! > 0);
    });
  });
});
