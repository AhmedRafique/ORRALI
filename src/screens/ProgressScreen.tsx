import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { getEffectiveStreak } from '../store';
import { Course, Progress } from '../types';

const C = { midnight: '#1B1536', gold: '#D4AF7C', ivory: '#F8F6F1', ink: '#211B32', muted: '#827B8D', white: '#FFFFFF', line: '#EAE5EE', sage: '#A7C4B0' };

export default function ProgressScreen({ courses, progress }: { courses: Course[]; progress: Progress }) {
  const totalLessons = courses.reduce((sum, c) => sum + c.lessons.length, 0);
  const completed = Object.keys(progress?.completed ?? {}).length;
  const learnedCards = Object.keys(progress?.cards ?? {}).length;
  const mastered = Object.values(progress?.cards ?? {}).filter((card) => (card?.interval ?? 0) >= 21).length;
  const percent = Math.min(100, Math.round((completed / Math.max(1, totalLessons)) * 100));

  return <ScrollView style={s.root} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
    <Text style={s.kicker}>YOUR PERSONAL JOURNEY</Text>
    <Text style={s.title}>Every step counts.</Text>
    <Text style={s.subtitle}>A little progress, repeated with care, becomes something remarkable.</Text>
    <View style={s.hero}>
      <Text style={s.heroLabel}>TOTAL EXPERIENCE</Text>
      <Text style={s.xp}>{progress.xp} <Text style={s.xpUnit}>XP</Text></Text>
      <View style={s.heroBottom}><Text style={s.heroMeta}>✦ {getEffectiveStreak(progress)} day streak</Text><Text style={s.heroMeta}>{completed}/{totalLessons} lessons</Text></View>
    </View>
    <View style={s.stats}>
      <View style={s.stat}><Text style={s.statValue}>{completed}</Text><Text style={s.statLabel}>Lessons done</Text></View>
      <View style={s.stat}><Text style={s.statValue}>{learnedCards}</Text><Text style={s.statLabel}>Cards practiced</Text></View>
      <View style={s.stat}><Text style={s.statValue}>{mastered}</Text><Text style={s.statLabel}>Long-term cards</Text></View>
    </View>
    <View style={s.section}>
      <Text style={s.sectionTitle}>Your worlds</Text>
      {courses.map((course) => {
        const done = course.lessons.filter((lesson) => !!progress?.completed?.[lesson.id]).length;
        const ratio = done / Math.max(1, course.lessons.length);
        const courseXp = progress.courseXp?.[course.code] ?? 0;
        return <View key={course.code} style={s.course}>
          <View style={s.courseTop}><Text style={s.flag}>{course.flag}</Text><View style={{ flex: 1 }}><Text style={s.courseName}>{course.name}</Text><Text style={s.courseMeta}>{done} of {course.lessons.length} chapters · {courseXp} XP</Text></View><Text style={s.percent}>{Math.round(ratio * 100)}%</Text></View>
          <View style={s.track}><View style={[s.fill, { width: `${ratio * 100}%` }]} /></View>
        </View>;
      })}
    </View>
    <View style={s.note}><Text style={s.noteTitle}>A note from ORRALI</Text><Text style={s.noteText}>Progress isn't about being perfect. It's about returning, discovering, and growing at your own pace.</Text></View>
  </ScrollView>;
}

const s = StyleSheet.create({ root: { flex: 1, backgroundColor: C.ivory }, content: { padding: 22, paddingTop: 28, paddingBottom: 36 }, kicker: { color: C.muted, fontSize: 9, letterSpacing: 2, fontWeight: '800' }, title: { color: C.midnight, fontSize: 28, fontWeight: '800', marginTop: 8 }, subtitle: { color: C.muted, fontSize: 12, lineHeight: 19, marginTop: 7, marginBottom: 22 }, hero: { backgroundColor: C.midnight, borderRadius: 23, padding: 21 }, heroLabel: { color: '#C8B7D9', fontSize: 9, letterSpacing: 1.6, fontWeight: '800' }, xp: { color: C.white, fontSize: 42, fontWeight: '800', marginTop: 8 }, xpUnit: { color: C.gold, fontSize: 17 }, heroBottom: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#403653' }, heroMeta: { color: '#E8DFF0', fontSize: 11, fontWeight: '700' }, stats: { flexDirection: 'row', gap: 9, marginTop: 13 }, stat: { flex: 1, backgroundColor: C.white, borderRadius: 16, padding: 13, borderWidth: 1, borderColor: C.line }, statValue: { color: C.midnight, fontSize: 22, fontWeight: '800' }, statLabel: { color: C.muted, fontSize: 9, marginTop: 5 }, section: { marginTop: 28 }, sectionTitle: { color: C.ink, fontSize: 18, fontWeight: '800', marginBottom: 13 }, course: { backgroundColor: C.white, borderRadius: 17, borderWidth: 1, borderColor: C.line, padding: 15, marginBottom: 10 }, courseTop: { flexDirection: 'row', alignItems: 'center', gap: 11 }, flag: { fontSize: 26 }, courseName: { color: C.ink, fontSize: 14, fontWeight: '800' }, courseMeta: { color: C.muted, fontSize: 10, marginTop: 3 }, percent: { color: '#8A719F', fontSize: 12, fontWeight: '800' }, track: { height: 6, borderRadius: 6, backgroundColor: '#ECE7EF', overflow: 'hidden', marginTop: 13 }, fill: { height: 6, borderRadius: 6, backgroundColor: C.gold }, note: { backgroundColor: '#E9EFEA', borderRadius: 17, padding: 16, marginTop: 15 }, noteTitle: { color: '#385A43', fontSize: 12, fontWeight: '800' }, noteText: { color: '#617668', fontSize: 11, lineHeight: 18, marginTop: 6 } });
