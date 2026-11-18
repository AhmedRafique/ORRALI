import {
  Course,
  LearnerLanguageProfile,
  LearningRecommendation,
  PersonalizedSession,
  Progress,
  SessionWorkoutType,
} from './types';
import { identifyStumbleObjectives } from './learnerModel';

/**
 * Generates transparent, explainable recommendations derived from the learner's knowledge profile.
 */
export function generateLearningRecommendations(params: {
  profile: LearnerLanguageProfile;
  progress?: Progress;
  course?: Course;
  limit?: number;
  now?: number;
}): LearningRecommendation[] {
  const { profile, limit = 5, now = Date.now() } = params;
  const recommendations: LearningRecommendation[] = [];

  const stumbles = identifyStumbleObjectives(profile, 5);

  // 1. Urgent Stumbles: Items where learner has repeatedly failed or recent mistakes occurred
  if (stumbles.length > 0) {
    const topStumble = stumbles[0];
    const topFailCount = topStumble.failCount;
    recommendations.push({
      id: `rec_stumble_${topStumble.objectiveId}`,
      actionType: 'review_stumbles',
      title: 'Review Recent Stumble Items',
      reason: `You encountered ${topFailCount} ${
        topFailCount === 1 ? 'mistake' : 'mistakes'
      } with ${topStumble.objectiveId.replace('item:', 'item ')}. Targeted repetition will rebuild confidence.`,
      priority: 'urgent',
      targetDomain: topStumble.domain,
      estimatedDurationMinutes: 3,
      targetObjectiveIds: stumbles.map((s) => s.objectiveId),
      suggestedActivity: 'mistake_clinic',
      metadata: { stumbleCount: stumbles.length },
    });
  }

  // 2. Grammar Remediation: Past or Compound Tenses
  if (profile.domains.grammar_past.needsPractice) {
    recommendations.push({
      id: 'rec_grammar_past',
      actionType: 'practice_grammar',
      title: 'Strengthen Past Tense Conjugation',
      reason:
        'Your past tense mastery (Passé Composé / Perfekt / Pretérito) indicates hesitation. Quick conjugation reps will solidify auxiliary and participle rules.',
      priority: 'high',
      targetDomain: 'grammar_past',
      estimatedDurationMinutes: 4,
      targetObjectiveIds: ['grammar:passé_composé', 'grammar:perfekt', 'grammar:pretérito'],
      suggestedActivity: 'verb_gym',
    });
  }

  // 3. Skill Asymmetry: Reading significantly stronger than Listening
  const readingMastery = profile.domains.reading.mastery;
  const listeningMastery = profile.domains.listening.mastery;
  if (
    profile.domains.reading.totalAttempts >= 3 &&
    readingMastery - listeningMastery >= 0.25
  ) {
    recommendations.push({
      id: 'rec_asymmetry_listening',
      actionType: 'train_listening',
      title: 'Tune Ear to Connected Speech',
      reason: `Your reading comprehension (${Math.round(
        readingMastery * 100
      )}%) is considerably ahead of your listening (${Math.round(
        listeningMastery * 100
      )}%). Training with audio dictation bridges this gap.`,
      priority: 'recommended',
      targetDomain: 'listening',
      estimatedDurationMinutes: 5,
      targetObjectiveIds: ['skill:listening', 'activity:radio_lab'],
      suggestedActivity: 'radio_lab',
    });
  }

  // 4. Speaking & Pronunciation Practice
  if (
    profile.domains.speaking.needsPractice ||
    (profile.domains.speaking.totalAttempts > 0 && profile.domains.speaking.mastery < 0.6)
  ) {
    recommendations.push({
      id: 'rec_speech_shadowing',
      actionType: 'practice_grammar',
      title: 'Acoustic Cadence & Accent Shadowing',
      reason:
        'Practice native acoustic mimicry to polish liaison smoothness, accent cadence, and intonation curve.',
      priority: 'recommended',
      targetDomain: 'speaking',
      estimatedDurationMinutes: 4,
      targetObjectiveIds: ['skill:speaking', 'activity:shadowing'],
      suggestedActivity: 'shadowing',
    });
  }

  // 5. Conversational Readiness
  if (profile.overallMastery >= 0.65 && profile.domains.communication.totalAttempts < 3) {
    recommendations.push({
      id: 'rec_roleplay_ready',
      actionType: 'roleplay_simulation',
      title: 'Real-World Dialogue Simulation',
      reason:
        'You have established solid foundational vocabulary. Put your conversational intent to the test in simulated café and travel roleplays.',
      priority: 'recommended',
      targetDomain: 'communication',
      estimatedDurationMinutes: 5,
      targetObjectiveIds: ['activity:roleplay', 'skill:communication'],
      suggestedActivity: 'roleplay',
    });
  }

  // 6. Curriculum Progression
  recommendations.push({
    id: 'rec_curriculum_advance',
    actionType: 'advance_curriculum',
    title: 'Unlock Next Core Unit',
    reason:
      'Continue structured progression along the CEFR curriculum path to unlock new vocabulary and grammar capsules.',
    priority: stumbles.length === 0 ? 'high' : 'recommended',
    targetDomain: 'vocabulary',
    estimatedDurationMinutes: 6,
    targetObjectiveIds: ['activity:lesson'],
    suggestedActivity: 'lesson',
  });

  // 7. Rapid Reflex & Speed Challenge
  if (profile.overallMastery >= 0.5) {
    recommendations.push({
      id: 'rec_speed_recall',
      actionType: 'speed_challenge',
      title: '60-Second Speed Arcade Sprint',
      reason:
        'Sharpen neural retrieval speed and instinctual word recognition without translation hesitation.',
      priority: 'maintenance',
      targetDomain: 'vocabulary',
      estimatedDurationMinutes: 2,
      targetObjectiveIds: ['activity:speed_recall'],
      suggestedActivity: 'speed_recall',
    });
  }

  // Priority sorting: urgent (4) > high (3) > recommended (2) > maintenance (1)
  const priorityWeights: Record<string, number> = {
    urgent: 4,
    high: 3,
    recommended: 2,
    maintenance: 1,
  };

  recommendations.sort(
    (a, b) => priorityWeights[b.priority] - priorityWeights[a.priority]
  );

  return recommendations.slice(0, limit);
}

/**
 * Dynamically assembles a tailored session for Quick (3-5m), Balanced (10-15m), or Deep (20-30m) workouts.
 */
export function generatePersonalizedSession(params: {
  profile: LearnerLanguageProfile;
  workoutType: SessionWorkoutType;
  progress?: Progress;
  course?: Course;
  now?: number;
}): PersonalizedSession {
  const { profile, workoutType } = params;
  const recommendations = generateLearningRecommendations({
    profile,
    progress: params.progress,
    course: params.course,
    limit: 10,
    now: params.now,
  });

  const stumbles = identifyStumbleObjectives(profile, 5);

  if (workoutType === 'quick') {
    // 3–5 min: High-velocity targeted remediation or express flashcard sprint
    const activities = [
      {
        activityId: (stumbles.length > 0
          ? 'mistake_clinic'
          : 'express_review') as any,
        title: stumbles.length > 0 ? 'Mistake Clinic' : '3-Minute Express Review',
        durationMinutes: 4,
        objectiveIds: stumbles.map((s) => s.objectiveId),
        rationale:
          stumbles.length > 0
            ? 'Clear high-frequency stumbling items before new concepts'
            : 'Rapid spaced repetition review of due vocabulary',
      },
    ];

    return {
      workoutType: 'quick',
      targetDurationMinutes: 4,
      title: 'Quick Remedial Sprint (3–5 min)',
      focusExplanation:
        'Focused micro-session addressing immediate weaknesses and maintaining learning streak with zero fluff.',
      activities,
    };
  }

  if (workoutType === 'balanced') {
    // 10–15 min: Warm-up review + Core learning + Active drill
    const activities = [
      {
        activityId: 'express_review' as const,
        title: 'Spaced Repetition Warm-Up',
        durationMinutes: 3,
        objectiveIds: stumbles.slice(0, 3).map((s) => s.objectiveId),
        rationale: 'Re-activate memory pathways and prime vocabulary retention.',
      },
      {
        activityId: 'lesson' as const,
        title: 'Curriculum Lesson & Grammar Capsule',
        durationMinutes: 6,
        objectiveIds: ['activity:lesson'],
        rationale: 'Advance along the CEFR learning path with structured scaffolding.',
      },
      {
        activityId: (profile.domains.grammar_past.needsPractice
          ? 'verb_gym'
          : 'radio_lab') as any,
        title: profile.domains.grammar_past.needsPractice
          ? 'Verb Gym Conjugation Drill'
          : 'Radio Lab Audio Dictation',
        durationMinutes: 3,
        objectiveIds: profile.domains.grammar_past.needsPractice
          ? ['grammar:passé_composé']
          : ['skill:listening'],
        rationale: profile.domains.grammar_past.needsPractice
          ? 'Target verb auxiliary and participle agreements.'
          : 'Exercise auditory decoding and connected speech understanding.',
      },
    ];

    return {
      workoutType: 'balanced',
      targetDurationMinutes: 12,
      title: 'Balanced Learning Session (10–15 min)',
      focusExplanation:
        'Tri-partite workout combining active memory review, new lesson progression, and focused skill reinforcement.',
      activities,
    };
  }

  // workoutType === 'deep' (20–30 min): Full immersion across 4 skill dimensions
  const activities = [
    {
      activityId: 'mistake_clinic' as const,
      title: 'Mistake Clinic & SRS Clearance',
      durationMinutes: 5,
      objectiveIds: stumbles.map((s) => s.objectiveId),
      rationale: 'Systematically eradicate stumbling items and overdue cards.',
    },
    {
      activityId: 'lesson' as const,
      title: 'Comprehensive Curriculum Unit',
      durationMinutes: 10,
      objectiveIds: ['activity:lesson'],
      rationale: 'Acquire new vocabulary, sentence structures, and grammar rules.',
    },
    {
      activityId: 'radio_lab' as const,
      title: 'Acoustic Dictation & Connected Speech',
      durationMinutes: 5,
      objectiveIds: ['skill:listening'],
      rationale: 'Train real-world listening comprehension and phonetic parsing.',
    },
    {
      activityId: 'roleplay' as const,
      title: 'Interactive Conversational Simulation',
      durationMinutes: 5,
      objectiveIds: ['skill:communication'],
      rationale: 'Apply active language in a simulated real-world communication scenario.',
    },
  ];

  return {
    workoutType: 'deep',
    targetDurationMinutes: 25,
    title: 'Deep Immersion & Fluency Session (20–30 min)',
    focusExplanation:
      'Exhaustive 4-stage immersion covering remedial mastery, structured acquisition, auditory decoding, and spontaneous conversational production.',
    activities,
  };
}
