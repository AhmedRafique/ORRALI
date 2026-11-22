import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

describe('Android Packaging, Release Assets & CI Pipeline Verification (TDD)', () => {
  const appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const easJson = JSON.parse(fs.readFileSync('eas.json', 'utf8'));

  describe('1. Version Synchronization & Manifest Consistency', () => {
    it('synchronizes app.json version with package.json', () => {
      assert.equal(appJson.expo.version, packageJson.version);
    });

    it('enforces valid Android package name com.orrali.app and incremented versionCode', () => {
      assert.equal(appJson.expo.android.package, 'com.orrali.app');
      assert.ok(appJson.expo.android.versionCode >= 18);
    });

    it('declares all required microphone and audio background permissions', () => {
      const perms = appJson.expo.android.permissions;
      assert.ok(perms.includes('RECORD_AUDIO'));
      assert.ok(perms.includes('android.permission.RECORD_AUDIO'));
      assert.ok(perms.includes('android.permission.MODIFY_AUDIO_SETTINGS'));
      assert.ok(perms.includes('android.permission.FOREGROUND_SERVICE'));
    });
  });

  describe('2. Physical App Icon & Asset Integrity', () => {
    it('verifies all adaptive icon layers and splash assets physically exist on disk', () => {
      assert.ok(fs.existsSync('assets/icon.png'), 'Missing assets/icon.png');
      assert.ok(fs.existsSync('assets/android-icon-foreground.png'), 'Missing android-icon-foreground');
      assert.ok(fs.existsSync('assets/android-icon-background.png'), 'Missing android-icon-background');
      assert.ok(fs.existsSync('assets/android-icon-monochrome.png'), 'Missing android-icon-monochrome');
      assert.ok(fs.existsSync('assets/splash-icon.png'), 'Missing assets/splash-icon.png');
    });
  });

  describe('3. Build Profiles & CI/CD Pipeline Deliverables', () => {
    it('defines both standalone APK preview and Google Play AAB production profiles in eas.json', () => {
      assert.equal(easJson.build.preview.android.buildType, 'apk');
      assert.equal(easJson.build.production.android.buildType, 'app-bundle');
    });

    it('verifies GitHub Actions workflow contains automated release step on git tags', () => {
      const workflow = fs.readFileSync('.github/workflows/build-android.yml', 'utf8');
      assert.ok(workflow.includes('Build Android Release APK & Google Play AAB Bundle'));
      assert.ok(workflow.includes('softprops/action-gh-release@v2'));
      assert.ok(workflow.includes('dist-apk/ORRALI-${{ steps.version.outputs.version }}.apk'));
    });
  });
});
