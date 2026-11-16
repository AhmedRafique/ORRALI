export type HapticFeedbackType = 'success' | 'warning' | 'error' | 'light' | 'selection';

let hapticsModule: typeof import('expo-haptics') | null = null;

async function getHaptics() {
  if (!hapticsModule) {
    try {
      if (typeof (globalThis as any).__DEV__ === 'undefined') {
        (globalThis as any).__DEV__ = false;
      }
      hapticsModule = await import('expo-haptics');
    } catch {
      hapticsModule = null;
    }
  }
  return hapticsModule;
}

/**
 * Triggers safe tactile haptic feedback on supported physical devices.
 * Gracefully no-ops in web, simulators, or testing environments.
 */
export async function triggerHaptic(type: HapticFeedbackType): Promise<void> {
  try {
    const Haptics = await getHaptics();
    if (!Haptics) return;

    switch (type) {
      case 'success':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'error':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      case 'warning':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case 'light':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'selection':
        await Haptics.selectionAsync();
        break;
    }
  } catch {
    // Graceful no-op on platforms without haptic engine
  }
}
