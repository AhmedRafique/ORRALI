import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { isDue } from '../srs';
import { dayKey } from '../store';
import { Course, LangCode, Progress } from '../types';

const C = {
  midnight: '#1B1536', purple: '#30234D', gold: '#D4AF7C', ivory: '#F8F6F1', sage: '#A7C4B0',
  ink: '#211B32', muted: '#827B8D', line: '#EAE5EE', white: '#FFFFFF', lilac: '#EEE9F6',
};

interface Props {
  courses: Course[];
  course: Course;
  progress: Progress;
  onPickCourse: (c: LangCode) => void;
  onStartLesson: (lessonId: string) => void;
  onStartReview: () => void;
  onSetDailyGoal: (goal: number) => void;
}

export default function HomeScreen({ courses, course, progress, onPickCourse, onStartLesson, onStartReview, onSetDailyGoal }: Props) {
  const allItems = course.lessons.flatMap((l) => l.items);
  const dueCount = allItems.filter((i) => isDue(progress.cards[i.id])).length;
  const goal = Math.max(1, progress.dailyGoal || 20);
  const todayXp = progress.dailyXpDay === dayKey(new Date()) ? progress.dailyXp : 0;
  const goalProgress = Math.min(1, todayXp / goal);
  const completedCount = course.lessons.filter((l) => !!progress.completed[l.id]).length;

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <View style={s.header}>
        <View>
          <Text style={s.eyebrow}>YOUR PERSONAL LEARNING SPACE</Text>
          <Text style={s.brand}>ORRALI<Text style={s.brandDot}>.</Text></Text>
          <Text style={s.tagline}>Beyond the familiar.</Text>
        </View>
        <View style={s.avatar}><Text style={s.avatarText}>A</Text></View>
      </View>

      <View style={s.welcomeRow}>
        <View style={{ flex: 1 }}>
          <Text style={s.welcome}>Hello, Explorer!</Text>
          <Text style={s.subWelcome}>A little progress opens a new world.</Text>
        </View>
        <View style={s.streakPill}><Text style={s.streakIcon}>✦</Text><Text style={s.streakText}>{progress.streak} day streak</Text></View>
      </View>

      <View style={s.goalCard}>
        <View style={s.goalTop}>
          <View>
            <Text style={s.cardKicker}>YOUR DAILY JOURNEY</Text>
            <Text style={s.goalTitle}>Keep your spark alive</Text>
          </View>
          <View style={s.goalBadge}><Text style={s.goalBadgeText}>✧ {todayXp}/{goal} XP</Text></View>
        </View>
        <View style={s.track}><View style={[s.trackFill, { width: `${goalProgress * 100}%` }]} /></View>
        <View style={s.goalBottom}>
          <Text style={s.goalHint}>{goalProgress >= 1 ? 'Daily goal complete. Beautiful work!' : `${Math.max(0, goal - todayXp)} XP left to reach your goal`}</Text>
          <View style={s.goalControls}>
            {[10, 20, 30].map((v) => <Pressable key={v} onPress={() => onSetDailyGoal(v)} style={[s.goalChoice, goal === v && s.goalChoiceActive]}><Text style={[s.goalChoiceText, goal === v && s.goalChoiceTextActive]}>{v}</Text></Pressable>)}
          </View>
        </View>
      </View>

      <View style={s.sectionHeader}>
        <View><Text style={s.sectionTitle}>Choose your world</Text><Text style={s.sectionSub}>Two languages. Endless possibilities.</Text></View>
      </View>
      <View style={s.courseRow}>
        {courses.map((c) => {
          const active = c.code === course.code;
          return <Pressable key={c.code} onPress={() => onPickCourse(c.code)} style={[s.courseCard, active && s.courseCardActive]}>
            <Text style={s.flag}>{c.flag}</Text><View style={{ flex: 1 }}><Text style={[s.courseName, active && s.courseNameActive]}>{c.name}</Text><Text style={[s.courseMeta, active && s.courseMetaActive]}>{c.lessons.length} learning chapters</Text></View><Text style={[s.courseArrow, active && s.courseNameActive]}>›</Text>
          </Pressable>;
        })}
      </View>

      <View style={s.sectionHeader}>
        <View><Text style={s.sectionTitle}>Your learning path</Text><Text style={s.sectionSub}>{completedCount} of {course.lessons.length} chapters completed</Text></View>
        <Text style={s.pathPercent}>{Math.round((completedCount / Math.max(1, course.lessons.length)) * 100)}%</Text>
      </View>
      <View style={s.pathTrack}><View style={[s.pathFill, { width: `${(completedCount / Math.max(1, course.lessons.length)) * 100}%` }]} /></View>

      {course.lessons.map((lesson, i) => {
        const done = !!progress.completed[lesson.id];
        const unlocked = i === 0 || !!progress.completed[course.lessons[i - 1].id];
        return <Pressable key={lesson.id} disabled={!unlocked} onPress={() => onStartLesson(lesson.id)} style={[s.lessonCard, !unlocked && s.lessonLocked]}>
          <View style={[s.lessonNumber, done && s.lessonNumberDone, !unlocked && s.lessonNumberLocked]}><Text style={[s.lessonNumberText, done && s.lessonNumberTextDone]}>{done ? '✓' : String(i + 1).padStart(2, '0')}</Text></View>
          <View style={{ flex: 1 }}><Text style={s.lessonTitle}>{lesson.title}</Text><Text style={s.lessonMeta}>{lesson.items.length} phrases · {lesson.level ?? 'A1 beginner'}</Text></View>
          <Text style={s.lessonAction}>{done ? 'REPLAY' : unlocked ? 'START  ›' : 'LOCKED'}</Text>
        </Pressable>;
      })}

      <Pressable disabled={dueCount === 0} onPress={onStartReview} style={[s.reviewCard, dueCount === 0 && s.reviewDisabled]}>
        <View style={s.reviewIcon}><Text style={{ fontSize: 22 }}>✧</Text></View>
        <View style={{ flex: 1 }}><Text style={s.reviewTitle}>A moment to remember</Text><Text style={s.reviewSub}>{dueCount ? `${dueCount} phrases are ready for a quick review` : 'Your review cards will appear here'}</Text></View>
        <Text style={s.reviewArrow}>›</Text>
      </Pressable>
      <Text style={s.footer}>MADE FOR CURIOUS MINDS  ·  ORRALI</Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.ivory }, content: { padding: 22, paddingTop: 26, paddingBottom: 42 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  eyebrow: { color: C.muted, fontSize: 9, letterSpacing: 2, fontWeight: '800' }, brand: { color: C.midnight, fontSize: 27, letterSpacing: 6, fontWeight: '500', marginTop: 5 }, brandDot: { color: C.gold }, tagline: { color: C.muted, fontSize: 11, letterSpacing: 1.2, marginTop: 2 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.lilac, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#DED5EA' }, avatarText: { color: C.midnight, fontSize: 17, fontWeight: '700' },
  welcomeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 }, welcome: { color: C.ink, fontSize: 22, fontWeight: '800' }, subWelcome: { color: C.muted, fontSize: 12, marginTop: 4 }, streakPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1E7D8', borderRadius: 20, paddingHorizontal: 11, paddingVertical: 8, gap: 5 }, streakIcon: { color: '#A8793F', fontSize: 13 }, streakText: { color: '#77562E', fontSize: 10, fontWeight: '800' },
  goalCard: { backgroundColor: C.midnight, borderRadius: 22, padding: 19, marginBottom: 28 }, goalTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }, cardKicker: { color: '#C8B7D9', fontSize: 9, letterSpacing: 1.6, fontWeight: '800' }, goalTitle: { color: C.white, fontSize: 18, fontWeight: '800', marginTop: 7 }, goalBadge: { backgroundColor: '#382B50', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 14 }, goalBadgeText: { color: '#F0D6AE', fontSize: 10, fontWeight: '800' }, track: { height: 8, borderRadius: 8, backgroundColor: '#403653', overflow: 'hidden', marginTop: 20 }, trackFill: { height: 8, borderRadius: 8, backgroundColor: C.gold }, goalBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 13 }, goalHint: { color: '#D3C9DE', fontSize: 10, flex: 1 }, goalControls: { flexDirection: 'row', gap: 5 }, goalChoice: { borderWidth: 1, borderColor: '#645775', borderRadius: 9, paddingHorizontal: 8, paddingVertical: 5 }, goalChoiceActive: { backgroundColor: C.gold, borderColor: C.gold }, goalChoiceText: { color: '#E8DFF0', fontSize: 9, fontWeight: '800' }, goalChoiceTextActive: { color: C.midnight },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 13, marginTop: 2 }, sectionTitle: { color: C.ink, fontSize: 18, fontWeight: '800' }, sectionSub: { color: C.muted, fontSize: 11, marginTop: 4 }, courseRow: { gap: 10, marginBottom: 27 }, courseCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderWidth: 1, borderColor: C.line, borderRadius: 17, padding: 13, gap: 12 }, courseCardActive: { backgroundColor: '#F0EBF7', borderColor: '#CFC0E0' }, flag: { fontSize: 27 }, courseName: { color: C.ink, fontSize: 14, fontWeight: '800' }, courseNameActive: { color: C.midnight }, courseMeta: { color: C.muted, fontSize: 10, marginTop: 3 }, courseMetaActive: { color: '#6F6381' }, courseArrow: { color: C.muted, fontSize: 25, paddingHorizontal: 5 }, pathPercent: { color: '#8A719F', fontSize: 12, fontWeight: '800' }, pathTrack: { height: 5, backgroundColor: '#E9E2ED', borderRadius: 5, overflow: 'hidden', marginTop: -5, marginBottom: 15 }, pathFill: { height: 5, backgroundColor: C.gold, borderRadius: 5 },
  lessonCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderRadius: 17, padding: 13, marginBottom: 9, borderWidth: 1, borderColor: C.line, gap: 12 }, lessonLocked: { opacity: 0.48 }, lessonNumber: { width: 40, height: 40, borderRadius: 14, backgroundColor: C.lilac, alignItems: 'center', justifyContent: 'center' }, lessonNumberDone: { backgroundColor: '#E1EEE5' }, lessonNumberLocked: { backgroundColor: '#EEECEF' }, lessonNumberText: { color: C.purple, fontSize: 12, fontWeight: '900' }, lessonNumberTextDone: { color: '#547A61' }, lessonTitle: { color: C.ink, fontSize: 13, fontWeight: '800' }, lessonMeta: { color: C.muted, fontSize: 10, marginTop: 4 }, lessonAction: { color: '#8C759E', fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  reviewCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1E9DD', borderRadius: 18, padding: 14, marginTop: 15, gap: 12 }, reviewDisabled: { opacity: 0.65 }, reviewIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: '#E5D3B7', alignItems: 'center', justifyContent: 'center' }, reviewTitle: { color: C.ink, fontSize: 12, fontWeight: '800' }, reviewSub: { color: '#807365', fontSize: 10, marginTop: 4 }, reviewArrow: { color: '#9B7449', fontSize: 24 }, footer: { color: '#A59DAA', textAlign: 'center', fontSize: 8, letterSpacing: 1.5, marginTop: 30 },
});
