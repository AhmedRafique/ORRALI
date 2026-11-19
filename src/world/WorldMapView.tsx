import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { triggerHaptic } from '../sensory';
import { Course, Progress } from '../types';
import {
  InteractiveMapBuilding,
  WorldTimeOfDay,
} from './types';
import {
  calculateCityExplorationProgress,
  getWorldEnvironmentTheme,
  isBuildingUnlocked,
  resolveWorldTimeOfDay,
} from './environmentEngine';
import { getCityBuildingsByLanguage } from './cityCatalog';
import { getPersonaById } from '../personas/roster';

interface Props {
  course: Course;
  progress: Progress;
  onSelectBuilding: (building: InteractiveMapBuilding) => void;
  onToggleViewMode?: () => void;
}

export default function WorldMapView({
  course,
  progress,
  onSelectBuilding,
  onToggleViewMode,
}: Props) {
  const [selectedBuilding, setSelectedBuilding] =
    useState<InteractiveMapBuilding | null>(null);

  const timeOfDay: WorldTimeOfDay = useMemo(() => resolveWorldTimeOfDay(), []);
  const theme = useMemo(() => getWorldEnvironmentTheme(timeOfDay), [timeOfDay]);

  const buildings = useMemo(
    () => getCityBuildingsByLanguage(course.code),
    [course.code]
  );

  const completedUnitsCount = useMemo(
    () => course.lessons.filter((l) => !!progress.completed[l.id]).length,
    [course.lessons, progress.completed]
  );

  const exploration = useMemo(
    () => calculateCityExplorationProgress(buildings, completedUnitsCount),
    [buildings, completedUnitsCount]
  );

  function handleBuildingPress(building: InteractiveMapBuilding) {
    const unlocked = isBuildingUnlocked(building, completedUnitsCount);
    if (unlocked) {
      triggerHaptic('success');
      setSelectedBuilding(building);
    } else {
      triggerHaptic('error');
      setSelectedBuilding(building);
    }
  }

  function handleLaunchBuildingActivity(building: InteractiveMapBuilding) {
    triggerHaptic('selection');
    onSelectBuilding(building);
  }

  return (
    <View style={[s.root, { backgroundColor: theme.groundColor }]}>
      {/* Time of Day & Exploration Header */}
      <View style={[s.headerCard, { backgroundColor: theme.skyColor }]}>
        <View style={s.headerTopRow}>
          <View style={s.timeBadge}>
            <Text style={s.timeBadgeText}>
              {timeOfDay === 'midnight'
                ? '🌙 MIDNIGHT OLED'
                : timeOfDay === 'twilight'
                ? '🌆 TWILIGHT HOUR'
                : timeOfDay === 'dawn'
                ? '🌅 DAWN LIGHT'
                : '☀️ MIDDAY SUN'}
            </Text>
          </View>
          {onToggleViewMode && (
            <Pressable style={s.toggleViewBtn} onPress={onToggleViewMode}>
              <Text style={s.toggleViewText}>Switch to List View ☰</Text>
            </Pressable>
          )}
        </View>

        <Text style={[s.greetingText, { color: theme.ambientTextColor }]}>
          {theme.greeting}
        </Text>
        <Text style={s.cityTitle}>
          {course.code === 'fr'
            ? 'Paris Métropole'
            : course.code === 'de'
            ? 'München Residenz'
            : 'Madrid Imperial'}
        </Text>

        {/* Discovery Progress Meter */}
        <View style={s.progressRow}>
          <Text style={s.progressLabel}>
            Discovery: {exploration.unlockedCount} of {exploration.totalCount} Hubs
          </Text>
          <Text style={s.progressPercent}>{exploration.percent}% Discovered</Text>
        </View>
        <View style={s.progressTrack}>
          <View
            style={[
              s.progressFill,
              { width: `${exploration.percent}%`, backgroundColor: theme.glowColor },
            ]}
          />
        </View>
      </View>

      {/* Spatial 2D Map Grid View */}
      <ScrollView
        style={s.mapScroll}
        contentContainerStyle={s.mapContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.districtHeader}>INTERACTIVE SPATIAL DISTRICTS</Text>

        <View style={s.buildingGrid}>
          {buildings.map((b) => {
            const unlocked = isBuildingUnlocked(b, completedUnitsCount);
            const isSelected = selectedBuilding?.id === b.id;

            return (
              <Pressable
                key={b.id}
                style={[
                  s.buildingCard,
                  {
                    borderColor: isSelected
                      ? theme.glowColor
                      : unlocked
                      ? 'rgba(212, 175, 124, 0.4)'
                      : 'rgba(255, 255, 255, 0.08)',
                    backgroundColor: unlocked ? '#21183E' : '#140E26',
                    opacity: unlocked ? 1.0 : 0.65,
                  },
                ]}
                onPress={() => handleBuildingPress(b)}
              >
                <View style={s.cardTopRow}>
                  <View
                    style={[
                      s.iconCircle,
                      {
                        backgroundColor: unlocked ? b.accentColor : '#2A1F45',
                        borderColor: unlocked ? theme.glowColor : 'transparent',
                      },
                    ]}
                  >
                    <Text style={s.buildingIcon}>{unlocked ? b.icon : '🔒'}</Text>
                  </View>
                  <View style={s.levelPill}>
                    <Text style={s.levelPillText}>{b.requiredLevel}</Text>
                  </View>
                </View>

                <Text style={s.buildingTitle}>{b.title}</Text>
                <Text style={s.buildingSubtitle}>{b.subtitle}</Text>

                {/* Personas Present */}
                {b.charactersPresent.length > 0 && unlocked && (
                  <View style={s.personasRow}>
                    {b.charactersPresent.map((cId) => {
                      const persona = getPersonaById(cId);
                      if (!persona) return null;
                      return (
                        <View key={cId} style={s.personaChip}>
                          <Text style={s.personaEmoji}>{persona.avatar}</Text>
                          <Text style={s.personaChipName}>{persona.name}</Text>
                        </View>
                      );
                    })}
                  </View>
                )}

                {/* Unlock status notice */}
                {!unlocked && (
                  <View style={s.lockedNotice}>
                    <Text style={s.lockedText}>
                      Unlocks after {b.prerequisiteUnits} units (Currently {completedUnitsCount})
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Selected Building Detail Inspector Card */}
        {selectedBuilding && (
          <View style={s.inspectorCard}>
            <View style={s.inspectorHeader}>
              <Text style={s.inspectorIcon}>{selectedBuilding.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.inspectorTitle}>{selectedBuilding.title}</Text>
                <Text style={s.inspectorDomain}>
                  Domain: {selectedBuilding.vocabularyDomain}
                </Text>
              </View>
            </View>

            <Text style={s.inspectorSub}>{selectedBuilding.subtitle}</Text>

            {isBuildingUnlocked(selectedBuilding, completedUnitsCount) ? (
              <Pressable
                style={[s.launchBtn, { backgroundColor: theme.glowColor }]}
                onPress={() => handleLaunchBuildingActivity(selectedBuilding)}
              >
                <Text style={s.launchBtnText}>Enter Hub & Launch Activity →</Text>
              </Pressable>
            ) : (
              <View style={s.inspectorLockedBox}>
                <Text style={s.inspectorLockedText}>
                  Complete {selectedBuilding.prerequisiteUnits - completedUnitsCount} more unit(s) to access this district hub.
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
  },
  headerCard: {
    padding: 18,
    borderRadius: 16,
    margin: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 124, 0.25)',
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  timeBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  timeBadgeText: {
    color: '#D4AF7C',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  toggleViewBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  toggleViewText: {
    color: '#D4AF7C',
    fontSize: 12,
    fontWeight: '700',
  },
  greetingText: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  cityTitle: {
    color: '#F8F6F1',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 10,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    color: '#827B8D',
    fontSize: 11,
  },
  progressPercent: {
    color: '#D4AF7C',
    fontSize: 11,
    fontWeight: '700',
  },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  mapScroll: {
    flex: 1,
  },
  mapContainer: {
    padding: 16,
    paddingTop: 4,
    paddingBottom: 40,
  },
  districtHeader: {
    color: '#827B8D',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  buildingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  buildingCard: {
    width: '48%',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    marginBottom: 6,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buildingIcon: {
    fontSize: 18,
  },
  levelPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  levelPillText: {
    color: '#D4AF7C',
    fontSize: 10,
    fontWeight: '800',
  },
  buildingTitle: {
    color: '#F8F6F1',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 3,
  },
  buildingSubtitle: {
    color: '#827B8D',
    fontSize: 11,
    lineHeight: 15,
  },
  personasRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 8,
  },
  personaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#30234D',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  personaEmoji: {
    fontSize: 12,
  },
  personaChipName: {
    color: '#D4AF7C',
    fontSize: 10,
    fontWeight: '700',
  },
  lockedNotice: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: 6,
  },
  lockedText: {
    color: '#827B8D',
    fontSize: 10,
    fontStyle: 'italic',
  },
  inspectorCard: {
    backgroundColor: '#2A1F45',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#D4AF7C',
    marginTop: 16,
  },
  inspectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 6,
  },
  inspectorIcon: {
    fontSize: 28,
  },
  inspectorTitle: {
    color: '#F8F6F1',
    fontSize: 16,
    fontWeight: '800',
  },
  inspectorDomain: {
    color: '#D4AF7C',
    fontSize: 12,
    fontWeight: '600',
  },
  inspectorSub: {
    color: '#827B8D',
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 12,
  },
  launchBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  launchBtnText: {
    color: '#1B1536',
    fontSize: 14,
    fontWeight: '800',
  },
  inspectorLockedBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    padding: 10,
    borderRadius: 8,
  },
  inspectorLockedText: {
    color: '#827B8D',
    fontSize: 12,
    textAlign: 'center',
  },
});
