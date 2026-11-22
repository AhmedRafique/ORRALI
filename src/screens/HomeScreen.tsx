import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { playPhraseAudio, stopAllAudio } from '../audio';
import { playEarcon } from '../earcons';
import { triggerHaptic } from '../sensory';
import { getWordOfTheDay, isDailySparkClaimed, DailySparkWord } from '../wordOfDay';
import { ROLEPLAY_SCENARIOS } from '../companion/roleplay';
import { stories } from '../content/index';
import { isDue } from '../srs';
import { dayKey, getEffectiveStreak } from '../store';
import { Course, Exercise, GrammarCapsule, LangCode, Progress, RoleplayScenario, StoryScenario } from '../types';
import MistakeClinicModal from './MistakeClinicModal';
import RoleplayModal from './RoleplayModal';
import TutorModal from './TutorModal';
import LexiconModal from './LexiconModal';
import SpeedRecallModal from './SpeedRecallModal';
import MilestoneExamModal from './MilestoneExamModal';
import CommuterAudioModal from './CommuterAudioModal';
import RadioLabModal from './RadioLabModal';
import ExpressReviewModal from './ExpressReviewModal';
import VerbGymModal from './VerbGymModal';
import ShadowStudioModal from './ShadowStudioModal';
import CafeLibraryModal from './CafeLibraryModal';
import PlacementTestModal from './PlacementTestModal';
import MissionModal from './MissionModal';
import WritingLabModal from './WritingLabModal';
import VideoLoungeModal from './VideoLoungeModal';
import MatrixDrillModal from './MatrixDrillModal';
import CharacterLoungeModal from './CharacterLoungeModal';
import EarTrainerModal from './EarTrainerModal';
import PhonemeClinicModal from './PhonemeClinicModal';
import SyntaxRadarModal from './SyntaxRadarModal';
import RapidRetortModal from './RapidRetortModal';
import WorldMapView from '../world/WorldMapView';
import { InteractiveMapBuilding } from '../world/types';
import { createMissionCompletionEvents } from '../missions/engine';
import { recordLearningEventsBatch } from '../events';
import { getMissionById } from '../missions/catalog';
import { MissionScoreBreakdown } from '../missions/types';
import { WritingCorrectionResult } from '../writing/types';
import { CEFRLevel } from '../milestones';

const C = {
  midnight: '#1B1536',
  purple: '#30234D',
  gold: '#D4AF7C',
  ivory: '#F8F6F1',
  sage: '#A7C4B0',
  ink: '#211B32',
  muted: '#827B8D',
  line: '#EAE5EE',
  white: '#FFFFFF',
  lilac: '#EEE9F6',
  green: '#638B70',
  red: '#B75D61',
};

interface Props {
  courses: Course[];
  course: Course;
  progress: Progress;
  onPickCourse: (code: LangCode) => void;
  onStartLesson: (id: string) => void;
  onStartReview: () => void;
  onSetDailyGoal: (goal: number) => void;
  onCompleteStory?: (storyId: string, earnedXp: number) => void;
  onStartRemedialWorkout?: (exercises: Exercise[]) => void;
  onCompleteRoleplay?: (earnedXp: number) => void;
  onCompleteSpeedRecall?: (earnedXp: number) => void;
  onPassMilestoneExam?: (earnedXp: number, diplomaKey: string) => void;
  onClaimDailySpark?: (sparkWord: DailySparkWord) => void;
  onCompleteCommuterSession?: (earnedXp: number) => void;
  onCompleteRadioLab?: (earnedXp: number) => void;
  onCompleteExpressReview?: (result: { correctIds: string[]; wrongIds: string[]; earnedXp: number }) => void;
  onCompleteVerbGym?: (earnedXp: number) => void;
  onCompleteShadowStudio?: (earnedXp: number) => void;
  onCompleteCafeLibrary?: (earnedXp: number) => void;
  onApplyPlacement?: (updatedProgress: Progress) => void;
  onCompleteMission?: (result: { missionId: string; score: MissionScoreBreakdown }) => void;
  onCompleteWritingLab?: (result: { challengeId: string; correction: WritingCorrectionResult }) => void;
  onCompleteVideoLounge?: (earnedXp: number) => void;
  onCompleteMatrixDrill?: (earnedXp: number) => void;
  onCompleteEarTraining?: (earnedXp: number) => void;
  onCompletePhonemeClinic?: (earnedXp: number) => void;
  onCompleteSyntaxRadar?: (earnedXp: number) => void;
  onCompleteRapidRetort?: (earnedXp: number) => void;
}

export default function HomeScreen({
  courses,
  course,
  progress,
  onPickCourse,
  onStartLesson,
  onStartReview,
  onSetDailyGoal,
  onCompleteStory,
  onStartRemedialWorkout,
  onCompleteRoleplay,
  onCompleteSpeedRecall,
  onPassMilestoneExam,
  onClaimDailySpark,
  onCompleteCommuterSession,
  onCompleteRadioLab,
  onCompleteExpressReview,
  onCompleteVerbGym,
  onCompleteShadowStudio,
  onCompleteCafeLibrary,
  onApplyPlacement,
  onCompleteMission,
  onCompleteWritingLab,
  onCompleteVideoLounge,
  onCompleteMatrixDrill,
  onCompleteEarTraining,
  onCompletePhonemeClinic,
  onCompleteSyntaxRadar,
  onCompleteRapidRetort,
}: Props) {
  const [activeCapsule, setActiveCapsule] = useState<GrammarCapsule | null>(null);
  const [activeStory, setActiveStory] = useState<StoryScenario | null>(null);
  const [isTutorOpen, setIsTutorOpen] = useState(false);
  const [isClinicOpen, setIsClinicOpen] = useState(false);
  const [isLexiconOpen, setIsLexiconOpen] = useState(false);
  const [isSpeedRecallOpen, setIsSpeedRecallOpen] = useState(false);
  const [activeExamLevel, setActiveExamLevel] = useState<CEFRLevel | null>(null);
  const [activeRoleplay, setActiveRoleplay] = useState<RoleplayScenario | null>(null);
  const [isCommuterOpen, setIsCommuterOpen] = useState(false);
  const [isRadioLabOpen, setIsRadioLabOpen] = useState(false);
  const [isExpressReviewOpen, setIsExpressReviewOpen] = useState(false);
  const [isVerbGymOpen, setIsVerbGymOpen] = useState(false);
  const [isShadowStudioOpen, setIsShadowStudioOpen] = useState(false);
  const [isCafeLibraryOpen, setIsCafeLibraryOpen] = useState(false);
  const [isPlacementOpen, setIsPlacementOpen] = useState(false);
  const [isMissionsOpen, setIsMissionsOpen] = useState(false);
  const [isWritingLabOpen, setIsWritingLabOpen] = useState(false);
  const [isVideoLoungeOpen, setIsVideoLoungeOpen] = useState(false);
  const [isMatrixDrillOpen, setIsMatrixDrillOpen] = useState(false);
  const [isCharacterLoungeOpen, setIsCharacterLoungeOpen] = useState(false);
  const [isEarTrainerOpen, setIsEarTrainerOpen] = useState(false);
  const [isPhonemeClinicOpen, setIsPhonemeClinicOpen] = useState(false);
  const [isSyntaxRadarOpen, setIsSyntaxRadarOpen] = useState(false);
  const [isRapidRetortOpen, setIsRapidRetortOpen] = useState(false);
  const [activeBuildingMissionId, setActiveBuildingMissionId] = useState<string | undefined>();
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [roleplayIdx, setRoleplayIdx] = useState(0);
  const [isSparkFlipped, setIsSparkFlipped] = useState(false);
  const [storyAnswer, setStoryAnswer] = useState<number | null>(null);
  const [storyCompleted, setStoryCompleted] = useState(false);

  const today = dayKey(new Date());
  const sparkWord = useMemo(() => getWordOfTheDay(course.code), [course.code]);
  const sparkClaimed = isDailySparkClaimed(progress, today);

  const goal = progress.dailyGoal;
  const todayXp = progress.dailyXpDay === dayKey(new Date()) ? progress.dailyXp : 0;
  const goalProgress = Math.min(1, todayXp / Math.max(1, goal));
  const completedCount = course.lessons.filter((l) => !!progress.completed[l.id]).length;
  const allItems = course.lessons.flatMap((l) => l.items);
  const dueCount = allItems.filter((i) => isDue(progress.cards[i.id])).length;
  const shields = progress.streakShields ?? 1;

  // Filter conversational stories for current language
  const courseStories = stories.filter((s) => s.courseCode === course.code);

  const playStoryTurnAudio = (target: string) => {
    void playPhraseAudio({ id: 'turn', target, en: '' }, course.code);
  };

  const handleFinishStory = () => {
    if (!activeStory) return;
    void stopAllAudio();
    if (onCompleteStory) {
      onCompleteStory(activeStory.id, 15);
    }
    setActiveStory(null);
    setStoryAnswer(null);
    setStoryCompleted(false);
  };

  function handleSelectBuilding(building: InteractiveMapBuilding) {
    if (building.primaryActivity === 'mission') {
      setActiveBuildingMissionId(building.activeMissionId);
      setIsMissionsOpen(true);
    } else if (building.primaryActivity === 'roleplay') {
      const courseScenarios = ROLEPLAY_SCENARIOS.filter((s) => s.courseCode === course.code);
      const sc =
        courseScenarios[roleplayIdx % Math.max(1, courseScenarios.length)] ??
        ROLEPLAY_SCENARIOS[0];
      setActiveRoleplay(sc);
    } else if (building.primaryActivity === 'writing_lab') {
      setIsWritingLabOpen(true);
    } else if (building.primaryActivity === 'cafe_library') {
      setIsCafeLibraryOpen(true);
    } else if (building.primaryActivity === 'milestone_exam') {
      setActiveExamLevel('A1');
    } else {
      const firstIncomplete = course.lessons.find((l) => !progress.completed[l.id]);
      if (firstIncomplete) {
        onStartLesson(firstIncomplete.id);
      }
    }
  }

  if (viewMode === 'map') {
    return (
      <View style={{ flex: 1 }}>
        <WorldMapView
          course={course}
          progress={progress}
          onSelectBuilding={handleSelectBuilding}
          onToggleViewMode={() => setViewMode('list')}
        />
        {/* Real-Life Missions Modal */}
        <MissionModal
          visible={isMissionsOpen}
          course={course}
          initialMissionId={activeBuildingMissionId}
          onFinish={(result) => {
            setIsMissionsOpen(false);
            setActiveBuildingMissionId(undefined);
            onCompleteMission?.(result);
          }}
          onClose={() => {
            setIsMissionsOpen(false);
            setActiveBuildingMissionId(undefined);
          }}
        />
        {/* Writing Lab Modal */}
        <WritingLabModal
          visible={isWritingLabOpen}
          course={course}
          onFinish={(result) => {
            setIsWritingLabOpen(false);
            onCompleteWritingLab?.(result);
          }}
          onClose={() => setIsWritingLabOpen(false)}
        />
        {/* Video Immersion Lounge Modal */}
        <VideoLoungeModal
          visible={isVideoLoungeOpen}
          course={course}
          onFinishComprehension={(earnedXp) => {
            setIsVideoLoungeOpen(false);
            onCompleteVideoLounge?.(earnedXp);
          }}
          onClose={() => setIsVideoLoungeOpen(false)}
        />
        {/* Sentence Forge Matrix Drill Modal */}
        <MatrixDrillModal
          visible={isMatrixDrillOpen}
          course={course}
          onFinishDrill={(earnedXp) => {
            setIsMatrixDrillOpen(false);
            onCompleteMatrixDrill?.(earnedXp);
          }}
          onClose={() => setIsMatrixDrillOpen(false)}
        />
        {/* Character Friendship Lounge Modal */}
        <CharacterLoungeModal
          visible={isCharacterLoungeOpen}
          currentLang={course.code}
          progress={progress}
          onClose={() => setIsCharacterLoungeOpen(false)}
        />
        {/* Fast Native Ear Trainer Modal */}
        <EarTrainerModal
          visible={isEarTrainerOpen}
          course={course}
          onFinish={(earnedXp) => {
            setIsEarTrainerOpen(false);
            onCompleteEarTraining?.(earnedXp);
          }}
          onClose={() => setIsEarTrainerOpen(false)}
        />
        {/* Phoneme Diagnostic Clinic Modal */}
        <PhonemeClinicModal
          visible={isPhonemeClinicOpen}
          course={course}
          onFinish={(earnedXp) => {
            setIsPhonemeClinicOpen(false);
            onCompletePhonemeClinic?.(earnedXp);
          }}
          onClose={() => setIsPhonemeClinicOpen(false)}
        />
        {/* Visual Grammar Dependency Tree & Syntax Radar Modal */}
        <SyntaxRadarModal
          visible={isSyntaxRadarOpen}
          course={course}
          onFinish={(earnedXp) => {
            setIsSyntaxRadarOpen(false);
            onCompleteSyntaxRadar?.(earnedXp);
          }}
          onClose={() => setIsSyntaxRadarOpen(false)}
        />
        {/* Rapid Retort Conversational Duel Modal */}
        <RapidRetortModal
          visible={isRapidRetortOpen}
          course={course}
          onFinish={(earnedXp) => {
            setIsRapidRetortOpen(false);
            onCompleteRapidRetort?.(earnedXp);
          }}
          onClose={() => setIsRapidRetortOpen(false)}
        />
        {activeRoleplay && (
          <RoleplayModal
            visible={!!activeRoleplay}
            scenario={activeRoleplay}
            onFinishRoleplay={(xp) => {
              setActiveRoleplay(null);
              onCompleteRoleplay?.(xp);
            }}
            onClose={() => setActiveRoleplay(null)}
          />
        )}
      </View>
    );
  }

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <View style={s.header}>
        <View>
          <Text style={s.eyebrow}>YOUR PERSONAL LEARNING SPACE</Text>
          <Text style={s.brand}>
            ORRALI<Text style={s.brandDot}>.</Text>
          </Text>
          <Text style={s.tagline}>Beyond the familiar.</Text>
        </View>
        <View style={s.avatar}>
          <Text style={s.avatarText}>✦</Text>
        </View>
      </View>

      <View style={s.welcomeRow}>
        <View style={{ flex: 1 }}>
          <Text style={s.welcome}>Hello, Explorer!</Text>
          <Text style={s.subWelcome}>A little progress opens a new world.</Text>
        </View>
        <View style={s.streakPill}>
          <Text style={s.streakIcon}>✦</Text>
          <Text style={s.streakText}>
            {getEffectiveStreak(progress)} day streak {shields > 0 ? `· 🛡️ ${shields}` : ''}
          </Text>
        </View>
      </View>

      {/* 2D Spatial City Map Switcher Banner */}
      <Pressable
        style={s.mapModeBanner}
        onPress={() => {
          void triggerHaptic('selection');
          setViewMode('map');
        }}
      >
        <View style={s.mapBannerLeft}>
          <Text style={s.mapBannerIcon}>🗺️</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.mapBannerTitle}>Explore 2D Spatial City Map</Text>
            <Text style={s.mapBannerSub}>Interactive city districts with day & night ambient lighting</Text>
          </View>
        </View>
        <Text style={s.mapBannerArrow}>›</Text>
      </Pressable>

      {/* 3-Minute Express Review Fast-Track Widget */}
      {dueCount > 0 && (
        <Pressable
          style={s.expressWidget}
          onPress={() => {
            void triggerHaptic('selection');
            setIsExpressReviewOpen(true);
          }}
        >
          <View style={s.expressLeft}>
            <Text style={s.expressIcon}>⚡</Text>
            <View>
              <Text style={s.expressTitle}>3-Minute Express Review</Text>
              <Text style={s.expressSub}>Clear {Math.min(5, dueCount)} due cards in 90 seconds!</Text>
            </View>
          </View>
          <Text style={s.expressArrow}>›</Text>
        </Pressable>
      )}

      {/* Daily Word of the Day Micro-Spark Card */}
      <View style={s.sparkCard}>
        <View style={s.sparkTop}>
          <View style={s.sparkBadge}>
            <Text style={s.sparkBadgeText}>✦ WORD OF THE DAY · {sparkWord.category.toUpperCase()}</Text>
          </View>
          {sparkClaimed ? (
            <View style={s.sparkClaimedPill}>
              <Text style={s.sparkClaimedText}>✓ +5 XP CLAIMED</Text>
            </View>
          ) : (
            <Pressable
              style={s.claimSparkBtn}
              onPress={() => {
                void triggerHaptic('success');
                void playEarcon('success');
                onClaimDailySpark?.(sparkWord);
              }}
            >
              <Text style={s.claimSparkText}>Claim +5 XP Spark</Text>
            </Pressable>
          )}
        </View>

        <Pressable
          style={s.sparkBody}
          onPress={() => {
            void triggerHaptic('selection');
            setIsSparkFlipped(!isSparkFlipped);
          }}
        >
          {!isSparkFlipped ? (
            <View>
              <Text style={s.sparkPhrase}>{sparkWord.phrase}</Text>
              <Text style={s.sparkPhonetic}>/{sparkWord.phonetic}/</Text>
              <Text style={s.sparkMeaning}>"{sparkWord.meaningEn}"</Text>
              <Text style={s.sparkFlipHint}>Tap card for cultural insight ↻</Text>
            </View>
          ) : (
            <View>
              <Text style={s.sparkInsightTitle}>Cultural Context & Wisdom</Text>
              <Text style={s.sparkInsightText}>{sparkWord.culturalInsight}</Text>
              <Text style={s.sparkFlipHint}>Tap card to flip back ↻</Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Goal & Daily Spark Card */}
      <View style={s.goalCard}>
        <View style={s.goalTop}>
          <View>
            <Text style={s.cardKicker}>YOUR DAILY JOURNEY</Text>
            <Text style={s.goalTitle}>Keep your spark alive</Text>
          </View>
          <View style={s.goalBadge}>
            <Text style={s.goalBadgeText}>
              ✧ {todayXp}/{goal} XP
            </Text>
          </View>
        </View>
        <View style={s.track}>
          <View style={[s.trackFill, { width: `${goalProgress * 100}%` }]} />
        </View>
        <View style={s.goalBottom}>
          <Text style={s.goalHint}>
            {goalProgress >= 1
              ? 'Daily goal complete. Beautiful work!'
              : `${Math.max(0, goal - todayXp)} XP left to reach your goal`}
          </Text>
          <View style={s.goalControls}>
            {[10, 20, 30].map((v) => (
              <Pressable
                key={v}
                onPress={() => onSetDailyGoal(v)}
                style={[s.goalChoice, goal === v && s.goalChoiceActive]}
              >
                <Text style={[s.goalChoiceText, goal === v && s.goalChoiceTextActive]}>{v}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      {/* AI Learning Companion Hub */}
      <View style={s.sectionHeader}>
        <View>
          <Text style={s.sectionTitle}>AI Learning Companion</Text>
          <Text style={s.sectionSub}>Personalized coaching, roleplay & grammar</Text>
        </View>
      </View>
      <View style={s.companionRow}>
        <Pressable style={s.companionBtn} onPress={() => setIsTutorOpen(true)}>
          <Text style={s.companionIcon}>🤖</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.companionTitle}>Ask ORRALI · AI Tutor</Text>
            <Text style={s.companionSub}>Explain any rule like I am a child</Text>
          </View>
          <Text style={s.companionArrow}>›</Text>
        </Pressable>

        <Pressable style={s.companionBtn} onPress={() => setIsClinicOpen(true)}>
          <Text style={s.companionIcon}>🏥</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.companionTitle}>Smart Mistake Clinic</Text>
            <Text style={s.companionSub}>Targeted review of recent error patterns</Text>
          </View>
          <Text style={s.companionArrow}>›</Text>
        </Pressable>

        <Pressable
          style={s.companionBtn}
          onPress={() => {
            void triggerHaptic('selection');
            setIsVerbGymOpen(true);
          }}
        >
          <Text style={s.companionIcon}>🏋️‍♂️</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.companionTitle}>The Verb Gym</Text>
            <Text style={s.companionSub}>Conjugation slot-machine mastery</Text>
          </View>
          <Text style={s.companionArrow}>›</Text>
        </Pressable>

        <Pressable
          style={s.companionBtn}
          onPress={() => {
            void triggerHaptic('selection');
            setIsMatrixDrillOpen(true);
          }}
        >
          <Text style={s.companionIcon}>⚡</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.companionTitle}>Sentence Forge · Matrix Drill</Text>
            <Text style={s.companionSub}>Combinatorial slot substitution & zero-gap morphology</Text>
          </View>
          <Text style={s.companionArrow}>›</Text>
        </Pressable>

        <Pressable
          style={s.companionBtn}
          onPress={() => {
            void triggerHaptic('selection');
            setIsCharacterLoungeOpen(true);
          }}
        >
          <Text style={s.companionIcon}>👥</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.companionTitle}>Character Friendship Lounge</Text>
            <Text style={s.companionSub}>European Triad backstories, secrets & voice greetings</Text>
          </View>
          <Text style={s.companionArrow}>›</Text>
        </Pressable>

        <Pressable
          style={s.companionBtn}
          onPress={() => {
            void triggerHaptic('selection');
            setIsEarTrainerOpen(true);
          }}
        >
          <Text style={s.companionIcon}>🎧</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.companionTitle}>Fast Native Ear Trainer</Text>
            <Text style={s.companionSub}>1.25x/1.5x street speed & background city noise</Text>
          </View>
          <Text style={s.companionArrow}>›</Text>
        </Pressable>

        <Pressable
          style={s.companionBtn}
          onPress={() => {
            void triggerHaptic('selection');
            setIsPhonemeClinicOpen(true);
          }}
        >
          <Text style={s.companionIcon}>👄</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.companionTitle}>Phoneme Diagnostic Clinic</Text>
            <Text style={s.companionSub}>Minimal pairs, nasal vowels & mouth mechanics</Text>
          </View>
          <Text style={s.companionArrow}>›</Text>
        </Pressable>

        <Pressable
          style={s.companionBtn}
          onPress={() => {
            void triggerHaptic('selection');
            setIsSyntaxRadarOpen(true);
          }}
        >
          <Text style={s.companionIcon}>🌳</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.companionTitle}>Syntax Radar & Dependency Tree</Text>
            <Text style={s.companionSub}>Cognitive sentence parsing, case governance & COD</Text>
          </View>
          <Text style={s.companionArrow}>›</Text>
        </Pressable>

        <Pressable
          style={s.companionBtn}
          onPress={() => {
            void triggerHaptic('selection');
            setIsRapidRetortOpen(true);
          }}
        >
          <Text style={s.companionIcon}>⚡</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.companionTitle}>Rapid Retort Conversational Duel</Text>
            <Text style={s.companionSub}>10-second countdown, banter comeback & discourse fillers</Text>
          </View>
          <Text style={s.companionArrow}>›</Text>
        </Pressable>

        <Pressable
          style={s.companionBtn}
          onPress={() => {
            void triggerHaptic('selection');
            setIsShadowStudioOpen(true);
          }}
        >
          <Text style={s.companionIcon}>🎙️</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.companionTitle}>Shadowing Studio</Text>
            <Text style={s.companionSub}>Listen, mimic, and compare accents</Text>
          </View>
          <Text style={s.companionArrow}>›</Text>
        </Pressable>

        <Pressable
          style={s.companionBtn}
          onPress={() => {
            void triggerHaptic('selection');
            setIsCafeLibraryOpen(true);
          }}
        >
          <Text style={s.companionIcon}>📚</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.companionTitle}>Café Library · Reading Lounge</Text>
            <Text style={s.companionSub}>Tap-to-read stories & cultural audiobooks</Text>
          </View>
          <Text style={s.companionArrow}>›</Text>
        </Pressable>

        <Pressable
          style={s.companionBtn}
          onPress={() => {
            void triggerHaptic('selection');
            setIsVideoLoungeOpen(true);
          }}
        >
          <Text style={s.companionIcon}>🎬</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.companionTitle}>Video Immersion Lounge</Text>
            <Text style={s.companionSub}>Native clips, tap-to-translate subtitles & community goals</Text>
          </View>
          <Text style={s.companionArrow}>›</Text>
        </Pressable>

        <Pressable
          style={s.companionBtn}
          onPress={() => {
            void triggerHaptic('selection');
            setIsPlacementOpen(true);
          }}
        >
          <Text style={s.companionIcon}>🧭</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.companionTitle}>CEFR Placement Test</Text>
            <Text style={s.companionSub}>Test out of basics & fast-track to A2/B1/B2</Text>
          </View>
          <Text style={s.companionArrow}>›</Text>
        </Pressable>

        <Pressable
          style={[s.companionBtn, { borderColor: C.gold, borderWidth: 1 }]}
          onPress={() => {
            void triggerHaptic('selection');
            setIsMissionsOpen(true);
          }}
        >
          <Text style={s.companionIcon}>🎯</Text>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[s.companionTitle, { color: C.gold }]}>Real-Life Missions</Text>
              <View style={s.signatureBadge}>
                <Text style={s.signatureBadgeText}>SIGNATURE</Text>
              </View>
            </View>
            <Text style={s.companionSub}>Branching real-world missions with unexpected curveballs</Text>
          </View>
          <Text style={s.companionArrow}>›</Text>
        </Pressable>

        <Pressable
          style={s.companionBtn}
          onPress={() => {
            void triggerHaptic('selection');
            setIsWritingLabOpen(true);
          }}
        >
          <Text style={s.companionIcon}>✍️</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.companionTitle}>Writing Lab</Text>
            <Text style={s.companionSub}>Interactive sentence correction & 8-point feedback</Text>
          </View>
          <Text style={s.companionArrow}>›</Text>
        </Pressable>

        <Pressable
          style={s.companionBtn}
          onPress={() => {
            const courseScenarios = ROLEPLAY_SCENARIOS.filter((s) => s.courseCode === course.code);
            const sc =
              courseScenarios[roleplayIdx % Math.max(1, courseScenarios.length)] ??
              ROLEPLAY_SCENARIOS[0];
            setRoleplayIdx((i) => i + 1);
            setActiveRoleplay(sc);
          }}
        >
          <Text style={s.companionIcon}>🎭</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.companionTitle}>Conversational AI Roleplay</Text>
            <Text style={s.companionSub}>Live bistros & train station simulations</Text>
          </View>
          <Text style={s.companionArrow}>›</Text>
        </Pressable>

        <Pressable style={s.companionBtn} onPress={() => setIsLexiconOpen(true)}>
          <Text style={s.companionIcon}>📖</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.companionTitle}>Smart Lexicon & Flashcards</Text>
            <Text style={s.companionSub}>Search vocabulary & flip drill cards</Text>
          </View>
          <Text style={s.companionArrow}>›</Text>
        </Pressable>

        <Pressable style={s.companionBtn} onPress={() => setIsSpeedRecallOpen(true)}>
          <Text style={s.companionIcon}>⚡</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.companionTitle}>Speed Recall Arcade</Text>
            <Text style={s.companionSub}>60s rapid-fire matching challenge</Text>
          </View>
          <Text style={s.companionArrow}>›</Text>
        </Pressable>

        <Pressable
          style={s.companionBtn}
          onPress={() => {
            void triggerHaptic('selection');
            setIsCommuterOpen(true);
          }}
        >
          <Text style={s.companionIcon}>🎧</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.companionTitle}>Commuter & Walking Mode</Text>
            <Text style={s.companionSub}>Hands-free Pimsleur-style audio loop</Text>
          </View>
          <Text style={s.companionArrow}>›</Text>
        </Pressable>

        <Pressable
          style={s.companionBtn}
          onPress={() => {
            void triggerHaptic('selection');
            setIsRadioLabOpen(true);
          }}
        >
          <Text style={s.companionIcon}>📻</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.companionTitle}>Radio Lab · Dictation</Text>
            <Text style={s.companionSub}>Liaisons & connected speech tuning</Text>
          </View>
          <Text style={s.companionArrow}>›</Text>
        </Pressable>

        <Pressable style={s.companionBtn} onPress={() => setActiveExamLevel('A1')}>
          <Text style={s.companionIcon}>🏅</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.companionTitle}>CEFR Milestone Exams</Text>
            <Text style={s.companionSub}>Synthesis exams & Official Gold Diplomas</Text>
          </View>
          <Text style={s.companionArrow}>›</Text>
        </Pressable>
      </View>

      {/* Choose Your World */}
      <View style={s.sectionHeader}>
        <View>
          <Text style={s.sectionTitle}>Choose your world</Text>
          <Text style={s.sectionSub}>Two languages. Endless possibilities.</Text>
        </View>
      </View>
      <View style={s.courseRow}>
        {courses.map((c) => {
          const active = c.code === course.code;
          return (
            <Pressable
              key={c.code}
              onPress={() => onPickCourse(c.code)}
              style={[s.courseCard, active && s.courseCardActive]}
            >
              <Text style={s.flag}>{c.flag}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[s.courseName, active && s.courseNameActive]}>{c.name}</Text>
                <Text style={[s.courseMeta, active && s.courseMetaActive]}>
                  {c.lessons.length} learning chapters · A1
                </Text>
              </View>
              <Text style={[s.courseArrow, active && s.courseNameActive]}>›</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Real-Life Conversational Stories */}
      {courseStories.length > 0 && (
        <>
          <View style={s.sectionHeader}>
            <View>
              <Text style={s.sectionTitle}>Real-life conversations</Text>
              <Text style={s.sectionSub}>Follow authentic dialogues and test your ear</Text>
            </View>
          </View>
          <View style={s.storiesList}>
            {courseStories.map((story) => {
              const isDone = !!progress.completedStories?.[story.id];
              return (
                <Pressable
                  key={story.id}
                  style={[s.storyCard, isDone && s.storyCardDone]}
                  onPress={() => {
                    setActiveStory(story);
                    setStoryAnswer(null);
                    setStoryCompleted(false);
                  }}
                >
                  <View style={s.storyIconCircle}>
                    <Text style={s.storyIcon}>{story.dialog[0]?.avatar ?? '📖'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.storyTitle}>{story.title}</Text>
                    <Text style={s.storySubtitle}>{story.subtitle}</Text>
                  </View>
                  <Text style={[s.storyAction, isDone && s.storyActionDone]}>
                    {isDone ? '✓ DONE' : 'LISTEN ›'}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </>
      )}

      {/* Learning Path */}
      <View style={s.sectionHeader}>
        <View>
          <Text style={s.sectionTitle}>Your learning path</Text>
          <Text style={s.sectionSub}>
            {completedCount} of {course.lessons.length} chapters completed
          </Text>
        </View>
        <Text style={s.pathPercent}>
          {Math.round((completedCount / Math.max(1, course.lessons.length)) * 100)}%
        </Text>
      </View>
      <View style={s.pathTrack}>
        <View style={[s.pathFill, { width: `${(completedCount / Math.max(1, course.lessons.length)) * 100}%` }]} />
      </View>

      {course.lessons.map((lesson, i) => {
        const done = !!progress.completed[lesson.id];
        const unlocked = i === 0 || !!progress.completed[course.lessons[i - 1].id];
        return (
          <View key={lesson.id} style={s.chapterWrapper}>
            <Pressable
              disabled={!unlocked}
              onPress={() => onStartLesson(lesson.id)}
              style={[s.lessonCard, !unlocked && s.lessonLocked]}
            >
              <View style={[s.lessonNumber, done && s.lessonNumberDone, !unlocked && s.lessonNumberLocked]}>
                <Text style={[s.lessonNumberText, done && s.lessonNumberTextDone]}>
                  {done ? '✓' : String(i + 1).padStart(2, '0')}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.lessonTitle}>{lesson.title}</Text>
                <Text style={s.lessonMeta}>
                  {lesson.items.length} phrases · {lesson.subtitle ?? lesson.level}
                </Text>
              </View>
              <Text style={s.lessonAction}>{done ? 'REPLAY' : unlocked ? 'START  ›' : 'LOCKED'}</Text>
            </Pressable>

            {lesson.grammarCapsule && unlocked && (
              <Pressable
                style={s.capsulePill}
                onPress={() => setActiveCapsule(lesson.grammarCapsule!)}
              >
                <Text style={s.capsuleSpark}>✦</Text>
                <Text style={s.capsuleTag}>{lesson.grammarCapsule.tag}:</Text>
                <Text style={s.capsuleTitle} numberOfLines={1}>
                  {lesson.grammarCapsule.title}
                </Text>
                <Text style={s.capsuleArrow}>›</Text>
              </Pressable>
            )}
          </View>
        );
      })}

      {/* Review Card */}
      <Pressable
        disabled={dueCount === 0}
        onPress={onStartReview}
        style={[s.reviewCard, dueCount === 0 && s.reviewDisabled]}
      >
        <View style={s.reviewIcon}>
          <Text style={{ fontSize: 22 }}>✧</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.reviewTitle}>A moment to remember</Text>
          <Text style={s.reviewSub}>
            {dueCount ? `${dueCount} phrases are ready for a quick review` : 'Your review cards will appear here'}
          </Text>
        </View>
        <Text style={s.reviewArrow}>›</Text>
      </Pressable>
      <Text style={s.footer}>MADE FOR CURIOUS MINDS  ·  ORRALI</Text>

      {/* Grammar Capsule Viewer Modal */}
      {activeCapsule && (
        <Modal
          transparent
          animationType="fade"
          visible={!!activeCapsule}
          onRequestClose={() => setActiveCapsule(null)}
        >
          <View style={s.modalOverlay}>
            <View style={s.capsuleCard}>
              <View style={s.capsuleHeader}>
                <View style={s.capsuleModalBadge}>
                  <Text style={s.capsuleModalBadgeText}>✦ {activeCapsule.tag}</Text>
                </View>
                <Pressable onPress={() => setActiveCapsule(null)} style={s.capsuleClose}>
                  <Text style={s.capsuleCloseText}>×</Text>
                </Pressable>
              </View>

              <Text style={s.capsuleModalTitle}>{activeCapsule.title}</Text>
              <View style={s.capsuleSummaryBox}>
                <Text style={s.capsuleSummaryText}>{activeCapsule.summary}</Text>
              </View>

              <Text style={s.capsuleExplanation}>{activeCapsule.explanation}</Text>

              <Text style={s.examplesHeader}>KEY EXAMPLES</Text>
              <ScrollView style={s.examplesScroll} showsVerticalScrollIndicator={false}>
                {activeCapsule.examples.map((ex, idx) => (
                  <View key={idx} style={s.exampleRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.exampleTarget}>{ex.target}</Text>
                      <Text style={s.exampleEn}>{ex.en}</Text>
                      {ex.note && <Text style={s.exampleNote}>{ex.note}</Text>}
                    </View>
                  </View>
                ))}
              </ScrollView>

              <Pressable style={s.capsuleDoneBtn} onPress={() => setActiveCapsule(null)}>
                <Text style={s.capsuleDoneText}>I Understand</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}

      {/* Story Scenario Player Modal */}
      {activeStory && (
        <Modal
          transparent
          animationType="fade"
          visible={!!activeStory}
          onRequestClose={() => setActiveStory(null)}
        >
          <View style={s.modalOverlay}>
            <View style={s.storyModalCard}>
              <View style={s.capsuleHeader}>
                <View style={s.capsuleModalBadge}>
                  <Text style={s.capsuleModalBadgeText}>📖 {activeStory.level}</Text>
                </View>
                <Pressable onPress={() => setActiveStory(null)} style={s.capsuleClose}>
                  <Text style={s.capsuleCloseText}>×</Text>
                </Pressable>
              </View>

              <Text style={s.storyModalTitle}>{activeStory.title}</Text>
              <Text style={s.storyModalSub}>{activeStory.subtitle}</Text>

              <ScrollView style={s.dialogScroll} showsVerticalScrollIndicator={false}>
                {activeStory.dialog.map((turn, idx) => (
                  <View key={idx} style={s.turnRow}>
                    <Text style={s.turnAvatar}>{turn.avatar}</Text>
                    <View style={s.turnBubble}>
                      <View style={s.turnHeader}>
                        <Text style={s.turnSpeaker}>{turn.speaker}</Text>
                        <Pressable onPress={() => playStoryTurnAudio(turn.target)}>
                          <Text style={s.turnAudioIcon}>🔊</Text>
                        </Pressable>
                      </View>
                      <Text style={s.turnTarget}>{turn.target}</Text>
                      <Text style={s.turnEn}>{turn.en}</Text>
                    </View>
                  </View>
                ))}

                {/* Comprehension Question at bottom */}
                <View style={s.storyQuestionBox}>
                  <Text style={s.questionBadge}>COMPREHENSION CHECK</Text>
                  <Text style={s.questionPrompt}>{activeStory.question.prompt}</Text>
                  <View style={{ gap: 8, marginTop: 10 }}>
                    {activeStory.question.options.map((opt, optIdx) => {
                      const isPicked = storyAnswer === optIdx;
                      const isCorrect = optIdx === activeStory.question.correctIndex;
                      return (
                        <Pressable
                          key={optIdx}
                          disabled={storyCompleted}
                          onPress={() => {
                            setStoryAnswer(optIdx);
                            if (isCorrect) setStoryCompleted(true);
                          }}
                          style={[
                            s.storyOption,
                            isPicked && (isCorrect ? s.storyOptionCorrect : s.storyOptionWrong),
                          ]}
                        >
                          <Text
                            style={[
                              s.storyOptionText,
                              isPicked && (isCorrect ? s.storyOptionTextCorrect : s.storyOptionTextWrong),
                            ]}
                          >
                            {opt}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  {storyAnswer !== null && (
                    <Text
                      style={[
                        s.storyQuestionFeedback,
                        { color: storyAnswer === activeStory.question.correctIndex ? C.green : C.red },
                      ]}
                    >
                      {storyAnswer === activeStory.question.correctIndex
                        ? `Spot on! +15 XP · ${activeStory.question.explanation}`
                        : 'Not quite. Listen to the conversation and try again!'}
                    </Text>
                  )}
                </View>
              </ScrollView>

              <Pressable
                disabled={!storyCompleted}
                style={[s.storyDoneBtn, !storyCompleted && s.storyDoneBtnDisabled]}
                onPress={handleFinishStory}
              >
                <Text style={s.storyDoneText}>
                  {storyCompleted ? 'Complete Story (+15 XP)' : 'Answer check above to continue'}
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}

      {/* Tutor Modal */}
      <TutorModal
        visible={isTutorOpen}
        courseCode={course.code}
        onClose={() => setIsTutorOpen(false)}
      />

      {/* Mistake Clinic Modal */}
      <MistakeClinicModal
        visible={isClinicOpen}
        course={course}
        progress={progress}
        onStartRemedialWorkout={(exs) => {
          setIsClinicOpen(false);
          onStartRemedialWorkout?.(exs);
        }}
        onClose={() => setIsClinicOpen(false)}
      />

      {/* Roleplay Simulation Modal */}
      {activeRoleplay && (
        <RoleplayModal
          visible={!!activeRoleplay}
          scenario={activeRoleplay}
          onFinishRoleplay={(earnedXp) => {
            setActiveRoleplay(null);
            onCompleteRoleplay?.(earnedXp);
          }}
          onClose={() => setActiveRoleplay(null)}
        />
      )}

      {/* Lexicon Modal */}
      <LexiconModal
        visible={isLexiconOpen}
        course={course}
        progress={progress}
        onClose={() => setIsLexiconOpen(false)}
      />

      {/* Speed Recall Arcade Modal */}
      <SpeedRecallModal
        visible={isSpeedRecallOpen}
        course={course}
        onFinish={(earnedXp) => {
          setIsSpeedRecallOpen(false);
          onCompleteSpeedRecall?.(earnedXp);
        }}
        onClose={() => setIsSpeedRecallOpen(false)}
      />

      {/* CEFR Milestone Exam Modal */}
      {activeExamLevel && (
        <MilestoneExamModal
          visible={!!activeExamLevel}
          course={course}
          level={activeExamLevel}
          onPass={(earnedXp, diplomaKey) => {
            setActiveExamLevel(null);
            onPassMilestoneExam?.(earnedXp, diplomaKey);
          }}
          onClose={() => setActiveExamLevel(null)}
        />
      )}

      {/* Hands-Free Commuter Audio Modal */}
      <CommuterAudioModal
        visible={isCommuterOpen}
        course={course}
        items={allItems}
        onFinish={(earnedXp) => {
          setIsCommuterOpen(false);
          onCompleteCommuterSession?.(earnedXp);
        }}
        onClose={() => setIsCommuterOpen(false)}
      />

      {/* Radio Lab Audio Dictation Modal */}
      <RadioLabModal
        visible={isRadioLabOpen}
        course={course}
        onFinish={(earnedXp) => {
          setIsRadioLabOpen(false);
          onCompleteRadioLab?.(earnedXp);
        }}
        onClose={() => setIsRadioLabOpen(false)}
      />

      {/* 3-Minute Express Review Fast-Track Modal */}
      <ExpressReviewModal
        visible={isExpressReviewOpen}
        course={course}
        progress={progress}
        onFinish={(result) => {
          setIsExpressReviewOpen(false);
          onCompleteExpressReview?.(result);
        }}
        onClose={() => setIsExpressReviewOpen(false)}
      />

      {/* The Verb Gym Modal */}
      <VerbGymModal
        visible={isVerbGymOpen}
        course={course}
        onFinish={(earnedXp) => {
          setIsVerbGymOpen(false);
          onCompleteVerbGym?.(earnedXp);
        }}
        onClose={() => setIsVerbGymOpen(false)}
      />

      {/* Shadowing Studio Modal */}
      <ShadowStudioModal
        visible={isShadowStudioOpen}
        course={course}
        onFinish={(earnedXp) => {
          setIsShadowStudioOpen(false);
          onCompleteShadowStudio?.(earnedXp);
        }}
        onClose={() => setIsShadowStudioOpen(false)}
      />

      {/* Café Library Reading Lounge Modal */}
      <CafeLibraryModal
        visible={isCafeLibraryOpen}
        course={course}
        onFinish={(earnedXp) => {
          setIsCafeLibraryOpen(false);
          onCompleteCafeLibrary?.(earnedXp);
        }}
        onClose={() => setIsCafeLibraryOpen(false)}
      />

      {/* Adaptive CEFR Placement Test Modal */}
      <PlacementTestModal
        visible={isPlacementOpen}
        course={course}
        progress={progress}
        onApply={(updatedProgress) => {
          setIsPlacementOpen(false);
          onApplyPlacement?.(updatedProgress);
        }}
        onClose={() => setIsPlacementOpen(false)}
      />

      {/* Real-Life Missions Modal */}
      <MissionModal
        visible={isMissionsOpen}
        course={course}
        onFinish={(result) => {
          setIsMissionsOpen(false);
          onCompleteMission?.(result);
        }}
        onClose={() => setIsMissionsOpen(false)}
      />

      {/* Writing Lab Modal */}
      <WritingLabModal
        visible={isWritingLabOpen}
        course={course}
        onFinish={(result) => {
          setIsWritingLabOpen(false);
          onCompleteWritingLab?.(result);
        }}
        onClose={() => setIsWritingLabOpen(false)}
      />

      {/* Video Immersion Lounge Modal */}
      <VideoLoungeModal
        visible={isVideoLoungeOpen}
        course={course}
        onFinishComprehension={(earnedXp) => {
          setIsVideoLoungeOpen(false);
          onCompleteVideoLounge?.(earnedXp);
        }}
        onClose={() => setIsVideoLoungeOpen(false)}
      />

      {/* Sentence Forge Matrix Drill Modal */}
      <MatrixDrillModal
        visible={isMatrixDrillOpen}
        course={course}
        onFinishDrill={(earnedXp) => {
          setIsMatrixDrillOpen(false);
          onCompleteMatrixDrill?.(earnedXp);
        }}
        onClose={() => setIsMatrixDrillOpen(false)}
      />

      {/* Character Friendship Lounge Modal */}
      <CharacterLoungeModal
        visible={isCharacterLoungeOpen}
        currentLang={course.code}
        progress={progress}
        onClose={() => setIsCharacterLoungeOpen(false)}
      />

      {/* Fast Native Ear Trainer Modal */}
      <EarTrainerModal
        visible={isEarTrainerOpen}
        course={course}
        onFinish={(earnedXp) => {
          setIsEarTrainerOpen(false);
          onCompleteEarTraining?.(earnedXp);
        }}
        onClose={() => setIsEarTrainerOpen(false)}
      />

      {/* Phoneme Diagnostic Clinic Modal */}
      <PhonemeClinicModal
        visible={isPhonemeClinicOpen}
        course={course}
        onFinish={(earnedXp) => {
          setIsPhonemeClinicOpen(false);
          onCompletePhonemeClinic?.(earnedXp);
        }}
        onClose={() => setIsPhonemeClinicOpen(false)}
      />

      {/* Visual Grammar Dependency Tree & Syntax Radar Modal */}
      <SyntaxRadarModal
        visible={isSyntaxRadarOpen}
        course={course}
        onFinish={(earnedXp) => {
          setIsSyntaxRadarOpen(false);
          onCompleteSyntaxRadar?.(earnedXp);
        }}
        onClose={() => setIsSyntaxRadarOpen(false)}
      />

      {/* Rapid Retort Conversational Duel Modal */}
      <RapidRetortModal
        visible={isRapidRetortOpen}
        course={course}
        onFinish={(earnedXp) => {
          setIsRapidRetortOpen(false);
          onCompleteRapidRetort?.(earnedXp);
        }}
        onClose={() => setIsRapidRetortOpen(false)}
      />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.ivory },
  content: { padding: 22, paddingTop: 26, paddingBottom: 42 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  eyebrow: { color: C.muted, fontSize: 9, letterSpacing: 2, fontWeight: '800' },
  brand: { color: C.midnight, fontSize: 27, letterSpacing: 6, fontWeight: '500', marginTop: 5 },
  brandDot: { color: C.gold },
  tagline: { color: C.muted, fontSize: 11, letterSpacing: 1.2, marginTop: 2 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.lilac,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DED5EA',
  },
  avatarText: { color: C.midnight, fontSize: 17, fontWeight: '700' },
  welcomeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  welcome: { color: C.ink, fontSize: 22, fontWeight: '800' },
  subWelcome: { color: C.muted, fontSize: 12, marginTop: 4 },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1E7D8',
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 8,
    gap: 5,
  },
  streakIcon: { color: '#A8793F', fontSize: 13 },
  streakText: { color: '#77562E', fontSize: 10, fontWeight: '800' },
  sparkCard: {
    backgroundColor: '#FCFAF5',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#E6D7BD',
    padding: 18,
    marginBottom: 16,
    shadowColor: C.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  sparkTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sparkBadge: { backgroundColor: '#F1E5CF', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8 },
  sparkBadgeText: { color: '#82591F', fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  sparkClaimedPill: { backgroundColor: '#E4F2E8', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  sparkClaimedText: { color: '#3A704B', fontSize: 9, fontWeight: '900' },
  claimSparkBtn: { backgroundColor: C.midnight, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  claimSparkText: { color: C.gold, fontSize: 9, fontWeight: '800' },
  sparkBody: { paddingVertical: 4 },
  sparkPhrase: { color: C.midnight, fontSize: 21, fontWeight: '800' },
  sparkPhonetic: { color: C.gold, fontSize: 13, fontWeight: '700', marginTop: 3 },
  sparkMeaning: { color: C.ink, fontSize: 14, fontWeight: '600', marginTop: 4 },
  sparkFlipHint: { color: C.muted, fontSize: 9, fontWeight: '700', marginTop: 10 },
  sparkInsightTitle: { color: '#82591F', fontSize: 12, fontWeight: '800', marginBottom: 4 },
  sparkInsightText: { color: C.ink, fontSize: 12, lineHeight: 18, fontWeight: '600' },
  goalCard: { backgroundColor: C.midnight, borderRadius: 22, padding: 19, marginBottom: 28 },
  goalTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardKicker: { color: '#C8B7D9', fontSize: 9, letterSpacing: 1.6, fontWeight: '800' },
  goalTitle: { color: C.white, fontSize: 18, fontWeight: '800', marginTop: 7 },
  goalBadge: { backgroundColor: '#382B50', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 14 },
  goalBadgeText: { color: '#F0D6AE', fontSize: 10, fontWeight: '800' },
  track: { height: 8, borderRadius: 8, backgroundColor: '#403653', overflow: 'hidden', marginTop: 20 },
  trackFill: { height: 8, borderRadius: 8, backgroundColor: C.gold },
  goalBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 13 },
  goalHint: { color: '#D3C9DE', fontSize: 10, flex: 1 },
  goalControls: { flexDirection: 'row', gap: 5 },
  goalChoice: { borderWidth: 1, borderColor: '#645775', borderRadius: 9, paddingHorizontal: 8, paddingVertical: 5 },
  goalChoiceActive: { backgroundColor: C.gold, borderColor: C.gold },
  goalChoiceText: { color: '#E8DFF0', fontSize: 9, fontWeight: '800' },
  goalChoiceTextActive: { color: C.midnight },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 13,
    marginTop: 2,
  },
  sectionTitle: { color: C.ink, fontSize: 18, fontWeight: '800' },
  sectionSub: { color: C.muted, fontSize: 11, marginTop: 4 },
  mapModeBanner: {
    backgroundColor: '#2A1F45',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: C.gold,
  },
  mapBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  mapBannerIcon: {
    fontSize: 24,
  },
  mapBannerTitle: {
    color: '#F8F6F1',
    fontSize: 14,
    fontWeight: '800',
  },
  mapBannerSub: {
    color: '#D4AF7C',
    fontSize: 11,
    marginTop: 2,
  },
  mapBannerArrow: {
    color: C.gold,
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 8,
  },
  companionRow: { gap: 9, marginBottom: 24 },
  companionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 16,
    padding: 13,
    gap: 12,
  },
  companionIcon: { fontSize: 24 },
  companionTitle: { color: C.midnight, fontSize: 13, fontWeight: '800' },
  companionSub: { color: C.muted, fontSize: 10, marginTop: 2 },
  companionArrow: { color: C.gold, fontSize: 20, fontWeight: '700' },
  courseRow: { gap: 10, marginBottom: 22 },
  courseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 17,
    padding: 13,
    gap: 12,
  },
  courseCardActive: { backgroundColor: '#F0EBF7', borderColor: '#CFC0E0' },
  flag: { fontSize: 27 },
  courseName: { color: C.ink, fontSize: 14, fontWeight: '800' },
  courseNameActive: { color: C.midnight },
  courseMeta: { color: C.muted, fontSize: 10, marginTop: 3 },
  courseMetaActive: { color: '#6F6381' },
  courseArrow: { color: C.muted, fontSize: 25, paddingHorizontal: 5 },
  storiesList: { gap: 10, marginBottom: 24 },
  storyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: C.line,
    gap: 12,
  },
  storyCardDone: { backgroundColor: '#FAF8F4', borderColor: C.gold },
  storyIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: C.lilac,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyIcon: { fontSize: 22 },
  storyTitle: { color: C.midnight, fontSize: 13, fontWeight: '800' },
  storySubtitle: { color: C.muted, fontSize: 10, marginTop: 3 },
  storyAction: { color: '#8A6D34', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  storyActionDone: { color: C.green },
  pathPercent: { color: '#8A719F', fontSize: 12, fontWeight: '800' },
  pathTrack: {
    height: 5,
    backgroundColor: '#E9E2ED',
    borderRadius: 5,
    overflow: 'hidden',
    marginTop: -5,
    marginBottom: 15,
  },
  pathFill: { height: 5, backgroundColor: C.gold, borderRadius: 5 },
  chapterWrapper: { marginBottom: 12 },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: 17,
    padding: 13,
    borderWidth: 1,
    borderColor: C.line,
    gap: 12,
  },
  lessonLocked: { opacity: 0.48 },
  lessonNumber: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: C.lilac,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonNumberDone: { backgroundColor: '#E1EEE5' },
  lessonNumberLocked: { backgroundColor: '#EEECEF' },
  lessonNumberText: { color: C.purple, fontSize: 12, fontWeight: '900' },
  lessonNumberTextDone: { color: '#547A61' },
  lessonTitle: { color: C.ink, fontSize: 13, fontWeight: '800' },
  lessonMeta: { color: C.muted, fontSize: 10, marginTop: 4 },
  lessonAction: { color: '#8C759E', fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  capsulePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F4EC',
    borderWidth: 1,
    borderColor: '#E8DEC8',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginTop: 6,
    marginLeft: 16,
    gap: 6,
  },
  capsuleSpark: { color: '#A07C41', fontSize: 11 },
  capsuleTag: { color: '#86642A', fontSize: 9, fontWeight: '900', letterSpacing: 0.8 },
  capsuleTitle: { color: C.ink, fontSize: 11, fontWeight: '700', flex: 1 },
  capsuleArrow: { color: '#A07C41', fontSize: 15, fontWeight: '700' },
  reviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1E9DD',
    borderRadius: 18,
    padding: 14,
    marginTop: 15,
    gap: 12,
  },
  reviewDisabled: { opacity: 0.65 },
  reviewIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#E5D3B7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewTitle: { color: C.ink, fontSize: 12, fontWeight: '800' },
  reviewSub: { color: '#807365', fontSize: 10, marginTop: 4 },
  reviewArrow: { color: '#9B7449', fontSize: 24 },
  footer: { color: '#A59DAA', textAlign: 'center', fontSize: 8, letterSpacing: 1.5, marginTop: 30 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(27, 21, 54, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 22,
  },
  capsuleCard: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: C.white,
    borderRadius: 24,
    padding: 22,
    shadowColor: C.midnight,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  capsuleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  capsuleModalBadge: {
    backgroundColor: '#F7F2E7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  signatureBadge: {
    backgroundColor: C.gold,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  signatureBadgeText: {
    color: C.midnight,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  capsuleModalBadgeText: {
    color: '#8A692E',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  capsuleClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0EBF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  capsuleCloseText: { color: C.midnight, fontSize: 22, lineHeight: 25 },
  capsuleModalTitle: {
    color: C.midnight,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 10,
  },
  capsuleSummaryBox: {
    backgroundColor: '#FAF7F1',
    borderLeftWidth: 3,
    borderLeftColor: C.gold,
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
  },
  capsuleSummaryText: { color: C.ink, fontSize: 12, lineHeight: 18, fontWeight: '600' },
  capsuleExplanation: { color: C.muted, fontSize: 12, lineHeight: 18, marginBottom: 14 },
  examplesHeader: { color: '#9B8CA9', fontSize: 9, fontWeight: '900', letterSpacing: 1.2, marginBottom: 8 },
  examplesScroll: { maxHeight: 180, marginBottom: 16 },
  exampleRow: {
    backgroundColor: '#F9F8FB',
    borderRadius: 12,
    padding: 11,
    marginBottom: 7,
    borderWidth: 1,
    borderColor: '#ECE6F2',
  },
  exampleTarget: { color: C.midnight, fontSize: 14, fontWeight: '800' },
  exampleEn: { color: C.ink, fontSize: 12, marginTop: 2 },
  exampleNote: { color: C.muted, fontSize: 10, fontStyle: 'italic', marginTop: 3 },
  capsuleDoneBtn: {
    backgroundColor: C.midnight,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  capsuleDoneText: { color: C.white, fontWeight: '800', fontSize: 13 },

  // Story Modal Styles
  storyModalCard: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: C.white,
    borderRadius: 24,
    padding: 22,
    shadowColor: C.midnight,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  storyModalTitle: { color: C.midnight, fontSize: 20, fontWeight: '800', marginBottom: 4 },
  storyModalSub: { color: C.muted, fontSize: 11, marginBottom: 16 },
  dialogScroll: { maxHeight: 320, marginBottom: 14 },
  turnRow: { flexDirection: 'row', gap: 10, marginBottom: 12, alignItems: 'flex-start' },
  turnAvatar: { fontSize: 24, marginTop: 4 },
  turnBubble: {
    flex: 1,
    backgroundColor: '#F8F6FA',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ECE6F2',
  },
  turnHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  turnSpeaker: { color: '#8A6D34', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  turnAudioIcon: { fontSize: 13, padding: 2 },
  turnTarget: { color: C.midnight, fontSize: 14, fontWeight: '800', marginBottom: 2 },
  turnEn: { color: C.muted, fontSize: 11 },
  storyQuestionBox: {
    backgroundColor: '#FAF8F4',
    borderWidth: 1.5,
    borderColor: C.gold,
    borderRadius: 16,
    padding: 14,
    marginTop: 8,
    marginBottom: 10,
  },
  questionBadge: { color: '#8A692E', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  questionPrompt: { color: C.midnight, fontSize: 13, fontWeight: '800', marginTop: 6 },
  storyOption: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 12,
    padding: 11,
  },
  storyOptionCorrect: { backgroundColor: '#EAF2EC', borderColor: C.green },
  storyOptionWrong: { backgroundColor: '#FDF1F2', borderColor: C.red },
  storyOptionText: { color: C.ink, fontSize: 12, fontWeight: '600' },
  storyOptionTextCorrect: { color: '#2B5738', fontWeight: '800' },
  storyOptionTextWrong: { color: '#822D31', fontWeight: '800' },
  storyQuestionFeedback: { fontSize: 11, fontWeight: '700', marginTop: 10 },
  storyDoneBtn: {
    backgroundColor: C.midnight,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  storyDoneBtnDisabled: { backgroundColor: '#D4CFDC' },
  storyDoneText: { color: C.white, fontWeight: '800', fontSize: 13 },
  expressWidget: {
    backgroundColor: '#FAF9FC',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#ECE6F2',
  },
  expressLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  expressIcon: { fontSize: 24 },
  expressTitle: { color: C.midnight, fontSize: 15, fontWeight: '900' },
  expressSub: { color: C.muted, fontSize: 11, fontWeight: '600', marginTop: 2 },
  expressArrow: { color: '#CFC7D8', fontSize: 24, fontWeight: '600' },
});
