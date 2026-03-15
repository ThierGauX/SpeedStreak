// src/screens/HomeScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSpeed } from '../hooks/useSpeed';
import { useAuth } from '../hooks/useAuth';
import { saveMeasure, subscribeToProfile } from '../services/database';
import { scheduleDailyReminder, sendBadgeNotification } from '../services/notifications';
import { Badge } from '../constants/badges';
import { useAppTheme } from '../context/ThemeContext';
import { format, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';

const { width } = Dimensions.get('window');
const BTN = width * 0.58;

export default function HomeScreen() {
  const { user } = useAuth();
  const { phase, currentSpeed, averageSpeed, timeLeft, error, startMeasure, reset } = useSpeed();
  const { colors, isDark } = useAppTheme();
  const [profile, setProfile]         = useState<any>(null);
  const [saving, setSaving]           = useState(false);
  const [newBadges, setNewBadges]     = useState<Badge[]>([]);
  const [showBadge, setShowBadge]     = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    return subscribeToProfile(user.uid, setProfile);
  }, [user?.uid]);

  useEffect(() => {
    if (phase === 'done' && averageSpeed !== null && !saving) handleSave(averageSpeed);
  }, [phase, averageSpeed]);

  const handleSave = async (speed: number) => {
    if (!user?.uid) return;
    setSaving(true);
    try {
      const { newBadges: unlocked, newStats } = await saveMeasure(user.uid, speed);
      await scheduleDailyReminder(newStats.streak);
      if (unlocked.length > 0) {
        setNewBadges(unlocked);
        setShowBadge(true);
        for (const b of unlocked) await sendBadgeNotification(b.name, b.icon);
      }
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    } finally {
      setSaving(false);
    }
  };

  const todayDone = profile?.lastMeasureDate === format(new Date(), 'yyyy-MM-dd');
  const streak    = profile?.streak    ?? 0;
  const maxSpeed  = profile?.maxSpeed  ?? 0;

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000);
    return { label: format(d, 'EEEEE', { locale: fr }).toUpperCase(), daysAgo: 6 - i, isToday: isToday(d) };
  });

  return (
    <View style={[s.container, { backgroundColor: colors.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Stats */}
        <View style={s.statsRow}>
          {[
            { icon: '🔥', value: `${streak}j`,          color: colors.orange, label: 'SÉRIE'    },
            { icon: '⚡', value: `${maxSpeed} km/h`,     color: colors.accent, label: 'RECORD'   },
            { icon: '📊', value: `${profile?.totalMeasures ?? 0}`, color: colors.text, label: 'MESURES' },
          ].map((st, i) => (
            <View key={i} style={[s.statCard, { backgroundColor: colors.bgCard, borderColor: colors.bgCardBorder }]}>
              <Text style={{ fontSize: 18, marginBottom: 4 }}>{st.icon}</Text>
              <Text style={[s.statVal, { color: st.color }]}>{st.value}</Text>
              <Text style={[s.statLabel, { color: colors.textMuted }]}>{st.label}</Text>
            </View>
          ))}
        </View>

        {/* Calendrier série */}
        <View style={[s.streakCard, { backgroundColor: colors.orangeDim, borderColor: colors.orangeBorder }]}>
          <Text style={[s.streakTitle, { color: colors.orange }]}>🔥 SÉRIE EN COURS — {streak} JOURS</Text>
          <View style={s.weekRow}>
            {weekDays.map((d, i) => {
              const done = d.daysAgo < streak;
              return (
                <View key={i} style={s.dayCol}>
                  <Text style={[s.dayLabel, { color: colors.textMuted }]}>{d.label}</Text>
                  <View style={[
                    s.dayDot, 
                    { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' },
                    done && [s.dayDotDone, { backgroundColor: isDark ? 'rgba(255,100,0,0.2)' : 'rgba(255,100,0,0.1)', borderColor: colors.orangeBorder }],
                    d.isToday && !done && [s.dayDotToday, { borderColor: colors.accent }]
                  ]}>
                    {done && <Text style={{ fontSize: 12 }}>🔥</Text>}
                    {d.isToday && !done && <View style={[s.todayDot, { backgroundColor: colors.accent }]} />}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Bouton principal */}
        <View style={s.btnSection}>
          {todayDone && phase === 'idle' && (
            <Text style={[s.doneText, { color: colors.accent }]}>✅ Déjà mesuré aujourd'hui ! Reviens demain.</Text>
          )}
          {error && <Text style={[s.errorText, { color: colors.red }]}>{error}</Text>}

          <TouchableOpacity
            onPress={phase === 'done' ? reset : startMeasure}
            disabled={(todayDone && phase === 'idle') || saving}
            style={{ opacity: todayDone && phase === 'idle' ? 0.6 : 1, marginVertical: 20 }}
            activeOpacity={0.85}
          >
            <View style={s.btnOuter}>
              {phase === 'measuring' && (
                <View style={[s.progressRing, { borderColor: colors.accent }]} />
              )}
              <LinearGradient
                colors={
                  phase === 'done' 
                    ? (isDark ? ['#003a1a','#002a12'] : ['#c2f0d5','#a0dfc0'])
                    : phase === 'measuring' 
                      ? (isDark ? ['#001a2e','#002a4a'] : ['#cce5ff','#aaccff']) 
                      : (isDark ? ['#001830','#00294a'] : ['#e6f2ff','#cce5ff'])
                }
                style={[s.btn, { borderColor: isDark ? 'rgba(0,195,255,0.25)' : 'rgba(0,195,255,0.4)' }]}
              >
                {phase === 'idle' && !todayDone && (
                  <>
                    <Text style={{ fontSize: 48, marginBottom: 8 }}>⚡</Text>
                    <Text style={[s.btnMain, { color: isDark ? '#fff' : '#0f172a' }]}>MESURER</Text>
                    <Text style={[s.btnSub, { color: colors.textMuted }]}>30 secondes</Text>
                  </>
                )}
                {phase === 'measuring' && (
                  <>
                    <Text style={[s.btnSpeed, { color: colors.accent }]}>{Math.round(currentSpeed)}</Text>
                    <Text style={[s.btnUnit, { color: colors.textMuted }]}>KM/H</Text>
                    <Text style={[s.btnSub, { color: colors.textMuted }]}>{(timeLeft / 1000).toFixed(1)}s</Text>
                  </>
                )}
                {phase === 'done' && (
                  <>
                    <Text style={[s.btnSpeed, { color: colors.green }]}>{averageSpeed}</Text>
                    <Text style={[s.btnUnit, { color: isDark ? '#2a8a5a' : '#1b633f' }]}>KM/H MOY.</Text>
                    <Text style={[s.btnSub, { marginTop: 6, color: colors.textMuted }]}>Appuie pour rejouer</Text>
                  </>
                )}
                {todayDone && phase === 'idle' && (
                  <>
                    <Text style={{ fontSize: 48, marginBottom: 8 }}>✅</Text>
                    <Text style={[s.btnMain, { color: isDark ? '#fff' : '#0f172a' }]}>FAIT !</Text>
                    <Text style={[s.btnSub, { color: colors.textMuted }]}>{maxSpeed} km/h</Text>
                  </>
                )}
              </LinearGradient>
            </View>
          </TouchableOpacity>

          {phase === 'done' && averageSpeed !== null && (
            <View style={[s.resultCard, { backgroundColor: colors.accentDim, borderColor: colors.accentBorder }]}>
              <Text style={{ color: averageSpeed > maxSpeed ? colors.gold : colors.accent, fontSize: 14, fontWeight: '700' }}>
                {averageSpeed > maxSpeed ? '🏆 Nouveau record personnel !' : `Ton record : ${maxSpeed} km/h`}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal badge */}
      <Modal visible={showBadge} transparent animationType="fade">
        <TouchableOpacity style={[s.modalBg, { backgroundColor: colors.modalOverlay }]} onPress={() => { setShowBadge(false); setNewBadges([]); }} activeOpacity={1}>
          <View style={[s.modalCard, { backgroundColor: colors.modalBg, borderColor: colors.goldBorder }]}>
            {newBadges.map((b, i) => (
              <View key={i} style={{ alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontSize: 72, marginBottom: 12 }}>{b.icon}</Text>
                <Text style={{ color: colors.gold, fontSize: 22, fontWeight: '900', letterSpacing: 2, marginBottom: 6 }}>BADGE DÉBLOQUÉ !</Text>
                <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800' }}>{b.name}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 6, textAlign: 'center' }}>{b.description}</Text>
              </View>
            ))}
            <Text style={{ color: colors.textDim, fontSize: 12, marginTop: 16, fontWeight: '700' }}>Appuie pour continuer</Text>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container:   { flex: 1 },
  statsRow:    { flexDirection: 'row', gap: 10, padding: 16, paddingTop: 8 },
  statCard:    { flex: 1, borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 1, elevation: 2, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 4 },
  statVal:     { fontSize: 16, fontWeight: '800' },
  statLabel:   { fontSize: 10, marginTop: 4, letterSpacing: 0.5, fontWeight: '700' },
  streakCard:  { margin: 16, marginTop: 0, borderWidth: 1, borderRadius: 20, padding: 18, elevation: 2, shadowColor: '#ff6400', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.1, shadowRadius: 8 },
  streakTitle: { fontSize: 12, fontWeight: '800', letterSpacing: 1, marginBottom: 12 },
  weekRow:     { flexDirection: 'row', gap: 8 },
  dayCol:      { flex: 1, alignItems: 'center' },
  dayLabel:    { fontSize: 10, marginBottom: 6, fontWeight: '700' },
  dayDot:      { height: 38, width: '100%', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  dayDotDone:  { borderWidth: 1 },
  dayDotToday: { borderWidth: 2 },
  todayDot:    { width: 8, height: 8, borderRadius: 4 },
  btnSection:  { alignItems: 'center', paddingVertical: 20 },
  doneText:    { fontSize: 14, fontWeight: '800', marginBottom: 16 },
  errorText:   { fontSize: 13, marginBottom: 12, textAlign: 'center', paddingHorizontal: 20, fontWeight: '600' },
  btnOuter:    { width: BTN + 30, height: BTN + 30, alignItems: 'center', justifyContent: 'center' },
  progressRing:{ position: 'absolute', width: BTN + 30, height: BTN + 30, borderRadius: (BTN + 30) / 2, borderWidth: 6 },
  btn:         { width: BTN, height: BTN, borderRadius: BTN / 2, alignItems: 'center', justifyContent: 'center', borderWidth: 3, elevation: 20, shadowColor: '#00c3ff', shadowOffset: {width: 0, height: 8}, shadowOpacity: 0.25, shadowRadius: 16 },
  btnMain:     { fontSize: 22, fontWeight: '900', letterSpacing: 1.5 },
  btnSub:      { fontSize: 13, marginTop: 4, fontWeight: '700' },
  btnSpeed:    { fontSize: 64, fontWeight: '900', lineHeight: 68 },
  btnUnit:     { fontSize: 14, letterSpacing: 2, fontWeight: '800' },
  resultCard:  { marginTop: 24, borderRadius: 16, paddingVertical: 12, paddingHorizontal: 24, borderWidth: 1 },
  modalBg:     { flex: 1, alignItems: 'center', justifyContent: 'center' },
  modalCard:   { borderRadius: 28, padding: 32, alignItems: 'center', width: '85%', borderWidth: 1, elevation: 10, shadowColor: '#000', shadowOffset: {width: 0, height: 10}, shadowOpacity: 0.3, shadowRadius: 20 },
});
