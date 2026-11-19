import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveWorldTimeOfDay,
  getWorldEnvironmentTheme,
  isBuildingUnlocked,
  calculateCityExplorationProgress,
} from '../world/environmentEngine';
import {
  CITY_MAP_BUILDINGS,
  getCityBuildingsByLanguage,
  getBuildingById,
  getBuildingsByDistrict,
} from '../world/cityCatalog';

describe('Interactive 2D World Map & Day/Night Environment Engine (TDD)', () => {
  describe('1. 4-Phase Day/Night Cycle Resolution', () => {
    it('resolves dawn between 05:00 and 08:59 with soft morning glow', () => {
      assert.equal(resolveWorldTimeOfDay(5), 'dawn');
      assert.equal(resolveWorldTimeOfDay(7), 'dawn');
      assert.equal(resolveWorldTimeOfDay(8), 'dawn');

      const theme = getWorldEnvironmentTheme('dawn');
      assert.equal(theme.timeOfDay, 'dawn');
      assert.equal(theme.streetLampActive, false);
      assert.ok(theme.greeting.includes('Morning'));
    });

    it('resolves day between 09:00 and 17:59 with midday energy', () => {
      assert.equal(resolveWorldTimeOfDay(9), 'day');
      assert.equal(resolveWorldTimeOfDay(12), 'day');
      assert.equal(resolveWorldTimeOfDay(17), 'day');

      const theme = getWorldEnvironmentTheme('day');
      assert.equal(theme.timeOfDay, 'day');
      assert.equal(theme.streetLampActive, false);
      assert.ok(theme.greeting.includes('Midday'));
    });

    it('resolves twilight between 18:00 and 21:59 with active street lamps', () => {
      assert.equal(resolveWorldTimeOfDay(18), 'twilight');
      assert.equal(resolveWorldTimeOfDay(20), 'twilight');
      assert.equal(resolveWorldTimeOfDay(21), 'twilight');

      const theme = getWorldEnvironmentTheme('twilight');
      assert.equal(theme.timeOfDay, 'twilight');
      assert.equal(theme.streetLampActive, true);
      assert.ok(theme.greeting.includes('Evening'));
    });

    it('resolves velvet midnight between 22:00 and 04:59 with OLED dark sky', () => {
      assert.equal(resolveWorldTimeOfDay(22), 'midnight');
      assert.equal(resolveWorldTimeOfDay(2), 'midnight');
      assert.equal(resolveWorldTimeOfDay(4), 'midnight');

      const theme = getWorldEnvironmentTheme('midnight');
      assert.equal(theme.timeOfDay, 'midnight');
      assert.equal(theme.streetLampActive, true);
      assert.ok(theme.greeting.includes('Midnight'));
    });
  });

  describe('2. European Triad City Catalog & Spatial Layout', () => {
    it('provides 6 distinct city buildings for French, German, and Spanish covering all 6 districts', () => {
      const frBuildings = getCityBuildingsByLanguage('fr');
      const deBuildings = getCityBuildingsByLanguage('de');
      const esBuildings = getCityBuildingsByLanguage('es');

      assert.equal(frBuildings.length, 6);
      assert.equal(deBuildings.length, 6);
      assert.equal(esBuildings.length, 6);

      for (const b of CITY_MAP_BUILDINGS) {
        assert.ok(b.id.length > 0);
        assert.ok(b.title.length > 0);
        assert.ok(b.subtitle.length > 0);
        assert.ok(b.icon.length > 0);
        assert.ok(b.accentColor.startsWith('#'));
        // Verify normalized map coordinates
        assert.ok(b.coordinates.x >= 0 && b.coordinates.x <= 100);
        assert.ok(b.coordinates.y >= 0 && b.coordinates.y <= 100);
      }
    });

    it('retrieves specific buildings by ID and by district', () => {
      const bistro = getBuildingById('fr_hub_cafe');
      assert.ok(bistro);
      assert.equal(bistro.title, 'Le Bistro Parisien');
      assert.ok(bistro.charactersPresent.includes('pierre'));

      const travelHubs = getBuildingsByDistrict('de', 'travel_hub');
      assert.equal(travelHubs.length, 1);
      assert.equal(travelHubs[0].id, 'de_hub_station');
    });
  });

  describe('3. Building Unlocking & Exploration Progress', () => {
    const frBuildings = getCityBuildingsByLanguage('fr');

    it('unlocks foundational buildings (Café & Square) at 0 completed units', () => {
      const cafe = getBuildingById('fr_hub_cafe')!;
      const square = getBuildingById('fr_hub_square')!;

      assert.equal(isBuildingUnlocked(cafe, 0), true);
      assert.equal(isBuildingUnlocked(square, 0), true);
    });

    it('locks advanced buildings until required curriculum units are completed', () => {
      const university = getBuildingById('fr_hub_university')!; // requires 12 units
      const business = getBuildingById('fr_hub_business')!; // requires 18 units

      assert.equal(isBuildingUnlocked(university, 5), false);
      assert.equal(isBuildingUnlocked(university, 12), true);

      assert.equal(isBuildingUnlocked(business, 15), false);
      assert.equal(isBuildingUnlocked(business, 18), true);
    });

    it('calculates accurate exploration progress ratios across learning milestones', () => {
      // 0 units completed: Café (0) + Square (0) = 2/6 = 33%
      const p0 = calculateCityExplorationProgress(frBuildings, 0);
      assert.equal(p0.unlockedCount, 2);
      assert.equal(p0.totalCount, 6);
      assert.equal(p0.percent, 33);

      // 6 units completed: Café (0) + Square (0) + Station (2) + Museum (6) = 4/6 = 67%
      const p6 = calculateCityExplorationProgress(frBuildings, 6);
      assert.equal(p6.unlockedCount, 4);
      assert.equal(p6.percent, 67);

      // 18 units completed: all 6 buildings unlocked = 100%
      const p18 = calculateCityExplorationProgress(frBuildings, 18);
      assert.equal(p18.unlockedCount, 6);
      assert.equal(p18.percent, 100);
    });
  });
});
