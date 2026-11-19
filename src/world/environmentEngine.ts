import {
  InteractiveMapBuilding,
  WorldEnvironmentTheme,
  WorldTimeOfDay,
} from './types';

/**
 * Resolves the 4-phase day/night cycle based on current local clock hour.
 */
export function resolveWorldTimeOfDay(hour?: number): WorldTimeOfDay {
  const h = hour !== undefined ? hour : new Date().getHours();

  if (h >= 5 && h < 9) {
    return 'dawn';
  }
  if (h >= 9 && h < 18) {
    return 'day';
  }
  if (h >= 18 && h < 22) {
    return 'twilight';
  }
  return 'midnight';
}

/**
 * Resolves chromatic ambient environment styling for the 2D world map.
 */
export function getWorldEnvironmentTheme(
  timeOfDay: WorldTimeOfDay
): WorldEnvironmentTheme {
  switch (timeOfDay) {
    case 'dawn':
      return {
        timeOfDay: 'dawn',
        skyColor: '#2D234A',
        groundColor: '#1D1733',
        roadColor: '#3A2E5B',
        ambientTextColor: '#E8CFB8',
        glowColor: '#F0A882',
        streetLampActive: false,
        greeting: 'Early Morning in the Capital',
      };
    case 'day':
      return {
        timeOfDay: 'day',
        skyColor: '#211A40',
        groundColor: '#1B1536',
        roadColor: '#352957',
        ambientTextColor: '#F8F6F1',
        glowColor: '#D4AF7C',
        streetLampActive: false,
        greeting: 'Midday City Energy',
      };
    case 'twilight':
      return {
        timeOfDay: 'twilight',
        skyColor: '#2C1838',
        groundColor: '#180F24',
        roadColor: '#381F47',
        ambientTextColor: '#F5D6B8',
        glowColor: '#E5A548',
        streetLampActive: true,
        greeting: 'Evening Lamps & Bistros',
      };
    case 'midnight':
    default:
      return {
        timeOfDay: 'midnight',
        skyColor: '#0F0B1E',
        groundColor: '#080612',
        roadColor: '#1E1538',
        ambientTextColor: '#E2DEEC',
        glowColor: '#D4AF7C',
        streetLampActive: true,
        greeting: 'Velvet Midnight Stroll',
      };
  }
}

/**
 * Determines whether a city building is unlocked based on completed curriculum units.
 */
export function isBuildingUnlocked(
  building: InteractiveMapBuilding,
  completedUnitsCount: number
): boolean {
  return completedUnitsCount >= building.prerequisiteUnits;
}

/**
 * Calculates overall city discovery and exploration percentage.
 */
export function calculateCityExplorationProgress(
  buildings: InteractiveMapBuilding[],
  completedUnitsCount: number
): { unlockedCount: number; totalCount: number; percent: number } {
  const totalCount = buildings.length;
  if (totalCount === 0) {
    return { unlockedCount: 0, totalCount: 0, percent: 0 };
  }

  const unlockedCount = buildings.filter((b) =>
    isBuildingUnlocked(b, completedUnitsCount)
  ).length;

  const percent = Math.round((unlockedCount / totalCount) * 100);

  return {
    unlockedCount,
    totalCount,
    percent,
  };
}
