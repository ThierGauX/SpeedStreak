// src/screens/BadgesScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { BADGES, Badge } from '../constants/badges';
import { subscribeToProfile } from '../services/firestore';
import { useAuth } from '../hooks/useAuth';
import { useAppTheme } from '../context/ThemeContext';

export default function BadgesScreen() {
  const { user }   = useAuth();
  const { colors, isDark } = useAppTheme();
  const [profile, setProfile]               = useState<any>(null);
  const [selected, setSelected]             = useState<Badge | null>(null);

  useEffect(() => {
    if (!user?.uid) return;
    return subscribeToProfile(user.uid, setProfile);
  }, [user?.uid]);

  const unlockedIds: string[] = profile?.badges ?? [];
  const sorted = [...BADGES].sort((a, b) => {
    const au = unlockedIds.includes(a.id), bu = unlockedIds.includes(b.id);
    return au === bu ? 0 : au ? -1 : 1;
  });

  return (
    <View style={[s.container, { backgroundColor: colors.bg }]}>
      {/* Barre de progression */}
      <View style={s.prog}>
        <Text style={[s.progText, { color: colors.textMuted }]}>{unlockedIds.length}/{BADGES.length} badges débloqués</Text>
        <View style={[s.progBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]}>
          <View style={[s.progFill, { backgroundColor: colors.gold, width: `${(unlockedIds.length / BADGES.length) * 100}%` as any }]} />
        </View>
      </View>

      <FlatList
        data={sorted}
        keyExtractor={b => b.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 14 }}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const ok = unlockedIds.includes(item.id);
          return (
            <TouchableOpacity
              style={[
                s.card, 
                { backgroundColor: colors.bgCard, borderColor: colors.bgCardBorder },
                ok && [s.cardOn, { backgroundColor: colors.goldDim, borderColor: colors.goldBorder }]
              ]}
              onPress={() => setSelected(item)}
              activeOpacity={0.8}
            >
              <Text style={[s.icon, !ok && { opacity: 0.3 }]}>{item.icon}</Text>
              <Text style={[s.name, { color: ok ? colors.gold : colors.textMuted }]}>{item.name}</Text>
              <Text style={[s.desc, { color: colors.textDim }]} numberOfLines={2}>{item.description}</Text>
              {ok && <Text style={[s.check, { color: colors.gold }]}>✓ DÉBLOQUÉ</Text>}
            </TouchableOpacity>
          );
        }}
      />

      <Modal visible={!!selected} transparent animationType="fade">
        <TouchableOpacity style={[s.modalBg, { backgroundColor: colors.modalOverlay }]} onPress={() => setSelected(null)} activeOpacity={1}>
          {selected && (
            <View style={[s.modalCard, { backgroundColor: colors.modalBg, borderColor: colors.goldBorder }]}>
              <Text style={s.modalIcon}>{selected.icon}</Text>
              <Text style={[s.modalName, { color: colors.text }]}>{selected.name}</Text>
              <Text style={[s.modalDesc, { color: colors.textMuted }]}>{selected.description}</Text>
              {unlockedIds.includes(selected.id)
                ? <View style={[s.tagOn, { backgroundColor: colors.goldDim, borderColor: colors.goldBorder }]}><Text style={{ color: colors.gold, fontWeight: '800' }}>✓ Badge débloqué !</Text></View>
                : <View style={[s.tagOff, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}><Text style={{ color: colors.textMuted, fontWeight: '600' }}>🔒 À débloquer</Text></View>
              }
            </View>
          )}
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  prog:      { padding: 20, paddingBottom: 12 },
  progText:  { fontSize: 13, marginBottom: 8, fontWeight: '700' },
  progBar:   { height: 8, borderRadius: 4, overflow: 'hidden' },
  progFill:  { height: '100%', borderRadius: 4 },
  list:      { padding: 16, paddingTop: 4 },
  card:      { flex: 1, borderWidth: 1, borderRadius: 20, padding: 18, alignItems: 'center', marginBottom: 14, opacity: 0.55, elevation: 2, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 4 },
  cardOn:    { opacity: 1, elevation: 4, shadowColor: '#ffc700', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.2, shadowRadius: 8 },
  icon:      { fontSize: 48, marginBottom: 10 },
  name:      { fontSize: 14, fontWeight: '800', textAlign: 'center', marginBottom: 6 },
  desc:      { fontSize: 11, textAlign: 'center', fontWeight: '500' },
  check:     { fontSize: 11, marginTop: 10, fontWeight: '800' },
  modalBg:   { flex: 1, alignItems: 'center', justifyContent: 'center' },
  modalCard: { borderRadius: 28, padding: 36, alignItems: 'center', width: '85%', borderWidth: 1, elevation: 15, shadowColor: '#000', shadowOffset: {width: 0, height: 10}, shadowOpacity: 0.3, shadowRadius: 20 },
  modalIcon: { fontSize: 80, marginBottom: 16 },
  modalName: { fontSize: 24, fontWeight: '900', marginBottom: 10, textAlign: 'center' },
  modalDesc: { fontSize: 15, textAlign: 'center', marginBottom: 24, fontWeight: '500' },
  tagOn:     { borderRadius: 24, paddingVertical: 10, paddingHorizontal: 24, borderWidth: 1 },
  tagOff:    { borderRadius: 24, paddingVertical: 10, paddingHorizontal: 24 },
});
