import { Item, LangCode } from './types';

export type CommuterStep =
  | 'prompt_en'
  | 'thinking_pause'
  | 'target_normal'
  | 'short_pause'
  | 'target_slow'
  | 'completed';

export interface CommuterState {
  itemIndex: number;
  step: CommuterStep;
  isPlaying: boolean;
  playSlowRepeat: boolean;
}

/**
 * Builds a bounded queue of items for the commuter audio session.
 */
export function buildCommuterQueue(items: Item[], maxCount = 10): Item[] {
  if (!items || items.length === 0) return [];
  return items.slice(0, maxCount);
}

/**
 * Advances to the next sequential step in the audio drill.
 * Automatically handles skipping slow repetition when disabled.
 */
export function resolveNextCommuterStep(
  current: CommuterStep,
  playSlowRepeat = true
): CommuterStep {
  switch (current) {
    case 'prompt_en':
      return 'thinking_pause';
    case 'thinking_pause':
      return 'target_normal';
    case 'target_normal':
      return playSlowRepeat ? 'short_pause' : 'completed';
    case 'short_pause':
      return 'target_slow';
    case 'target_slow':
      return 'completed';
    case 'completed':
    default:
      return 'completed';
  }
}

/**
 * Formats a clear, natural English prompt for the hands-free audio loop.
 */
export function getCommuterPromptText(lang: LangCode, englishText: string): string {
  const langName = lang === 'fr' ? 'French' : lang === 'es' ? 'Spanish' : 'German';
  return `How do you say in ${langName}: ${englishText}?`;
}

/**
 * Estimates total duration in seconds for a commuter session.
 */
export function estimateCommuterSessionDuration(
  items: Item[],
  playSlowRepeat = true
): number {
  const perItemSec = playSlowRepeat ? 14 : 9.5;
  return Math.round(items.length * perItemSec);
}
