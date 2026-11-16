if (typeof (globalThis as any).__DEV__ === 'undefined') {
  (globalThis as any).__DEV__ = false;
}

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getThemeColors, toggleTheme } from '../theme';
import { triggerHaptic } from '../sensory';

describe('Sensory Polish & Theme Engine (TDD)', () => {
  it('resolves distinct palettes for Light and Midnight Dark modes', () => {
    const light = getThemeColors('light');
    const dark = getThemeColors('dark');

    assert.equal(light.isDark, false);
    assert.equal(dark.isDark, true);

    // Dark mode has darker background and inverted ink
    assert.notEqual(light.ivory, dark.ivory);
    assert.notEqual(light.ink, dark.ink);
    assert.ok(dark.card.length > 0);
  });

  it('correctly toggles between light and dark modes', () => {
    assert.equal(toggleTheme('light'), 'dark');
    assert.equal(toggleTheme('dark'), 'light');
  });

  it('safely triggers haptic feedback types without throwing errors', async () => {
    // In node/test environment, native haptics gracefully no-op
    await assert.doesNotReject(async () => {
      await triggerHaptic('success');
      await triggerHaptic('error');
      await triggerHaptic('light');
      await triggerHaptic('selection');
    });
  });
});
