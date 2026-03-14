// src/screens/ProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert, TextInput, ActivityIndicator } from 'react-native';
import { subscribeToProfile, updateProfile } from '../services/firestore';
import { useAuth } from '../hooks/useAuth';
import { BADGES } from '../constants/badges';
import { useAppTheme } from '../context/ThemeContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import * as ImagePicker from 'expo-image-picker';
import storage from '@react-native-firebase/storage';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { colors, isDark } = useAppTheme();
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [newPseudo, setNewPseudo] = useState('');
  const [loadingImage, setLoadingImage] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    return subscribeToProfile(user.uid, setProfile);
  }, [user?.uid]);

  const handleSignOut = () =>
    Alert.alert('Se déconnecter ?', '', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnecter', style: 'destructive', onPress: signOut },
    ]);

  const handleUpdatePseudo = async () => {
    if (!user?.uid || !newPseudo.trim()) return;
    try {
      await updateProfile(user.uid, { displayName: newPseudo.trim() });
      setEditing(false);
    } catch (e: any) { Alert.alert('Erreur', e.message); }
  };

  const handlePickImage = async () => {
    if (!user?.uid) return;
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled && result.assets[0].uri) {
      setLoadingImage(true);
      try {
        const uri = result.assets[0].uri;
        const response = await fetch(uri);
        const blob = await response.blob();
        const ref = storage().ref(`avatars/${user.uid}.jpg`);
        await ref.put(blob);
        const url = await ref.getDownloadURL();
        await updateProfile(user.uid, { photoURL: url });
      } catch (e: any) {
        Alert.alert('Erreur', e.message);
      } finally {
        setLoadingImage(false);
      }
    }
  };

  const unlockedBadges = BADGES.filter(b => (profile?.badges ?? []).includes(b.id));
  const memberSince    = profile?.createdAt?.toDate
    ? format(profile.createdAt.toDate(), 'MMMM yyyy', { locale: fr }) : '—';

  return (
    <ScrollView style={[s.container, { backgroundColor: colors.bg }]} showsVerticalScrollIndicator={false}>
      {/* Avatar */}
      <View style={[s.header, { borderBottomColor: colors.bgCardBorder }]}>
        <TouchableOpacity onPress={handlePickImage} disabled={loadingImage} style={s.avatarContainer}>
          {profile?.photoURL
            ? <Image source={{ uri: profile.photoURL }} style={[s.avatar, { borderColor: colors.navBorder }]} />
            : <View style={[s.avatar, s.avatarFallback, { backgroundColor: isDark ? 'rgba(0,195,255,0.15)' : 'rgba(0,195,255,0.08)', borderColor: colors.accent }]}><Text style={{ fontSize: 40 }}>😎</Text></View>
          }
          {loadingImage && <View style={s.loadingOverlay}><ActivityIndicator color="#fff" /></View>}
          <View style={[s.editBadge, { backgroundColor: colors.bgCard, borderColor: colors.accent }]}><Text style={{ fontSize: 12 }}>✏️</Text></View>
        </TouchableOpacity>

        {editing ? (
          <View style={s.editRow}>
            <TextInput
              style={[s.input, { backgroundColor: colors.bgCard, color: colors.text, borderColor: colors.accent }]}
              value={newPseudo}
              onChangeText={setNewPseudo}
              placeholder="Nouveau pseudo"
              placeholderTextColor={colors.textMuted}
              autoFocus
            />
            <TouchableOpacity style={[s.saveBtn, { backgroundColor: colors.accent }]} onPress={handleUpdatePseudo}><Text style={s.saveText}>OK</Text></TouchableOpacity>
            <TouchableOpacity style={s.cancelBtn} onPress={() => setEditing(false)}><Text style={[s.cancelText, { color: colors.text }]}>X</Text></TouchableOpacity>
          </View>
        ) : (
          <View style={s.nameRow}>
            <Text style={[s.name, { color: colors.text }]}>{profile?.displayName ?? 'Anonyme'}</Text>
            <TouchableOpacity onPress={() => { setNewPseudo(profile?.displayName ?? ''); setEditing(true); }} style={{ marginLeft: 8 }}>
              <Text style={{ fontSize: 16 }}>✏️</Text>
            </TouchableOpacity>
          </View>
        )}
        
        <Text style={[s.email, { color: colors.textMuted }]}>{user?.email}</Text>
        
        <View style={[s.streakPill, { backgroundColor: colors.orangeDim, borderColor: colors.orangeBorder }]}>
          <Text style={{ fontSize: 18 }}>🔥</Text>
          <Text style={[s.streakNum, { color: colors.orange }]}>{profile?.streak ?? 0}</Text>
          <Text style={[s.streakLabel, { color: colors.orange }]}>jours de série</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={s.section}>
        <Text style={[s.sectionTitle, { color: colors.textMuted }]}>MES STATISTIQUES</Text>
        <View style={s.grid}>
          {[
            { icon: '🔥', label: 'Série actuelle',  value: `${profile?.streak ?? 0} jours` },
            { icon: '⚡', label: 'Vitesse max',      value: `${profile?.maxSpeed ?? 0} km/h` },
            { icon: '📊', label: 'Total mesures',    value: profile?.totalMeasures ?? 0 },
            { icon: '🏅', label: 'Badges',           value: `${unlockedBadges.length}/${BADGES.length}` },
            { icon: '👥', label: 'Amis',             value: (profile?.friends ?? []).length },
            { icon: '📅', label: 'Membre depuis',    value: memberSince },
          ].map((st, i) => (
            <View key={i} style={[s.statCard, { backgroundColor: colors.bgCard, borderColor: colors.bgCardBorder }]}>
              <Text style={{ fontSize: 24, marginBottom: 8 }}>{st.icon}</Text>
              <Text style={[s.statValue, { color: colors.text }]}>{st.value}</Text>
              <Text style={[s.statLabel, { color: colors.textMuted }]}>{st.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Badges récents */}
      {unlockedBadges.length > 0 && (
        <View style={s.section}>
          <Text style={[s.sectionTitle, { color: colors.textMuted }]}>BADGES RÉCENTS</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 4 }}>
            {unlockedBadges.slice(-6).reverse().map(b => (
              <View key={b.id} style={[s.badgePill, { backgroundColor: colors.goldDim, borderColor: colors.goldBorder }]}>
                <Text style={{ fontSize: 32 }}>{b.icon}</Text>
                <Text style={[s.badgeName, { color: colors.gold }]}>{b.name}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Déconnexion */}
      <View style={[s.section, { paddingBottom: 40 }]}>
        <TouchableOpacity style={[s.signOutBtn, { backgroundColor: isDark ? 'rgba(255,68,68,0.1)' : 'rgba(255,68,68,0.05)', borderColor: isDark ? 'rgba(255,68,68,0.2)' : 'rgba(255,68,68,0.15)' }]} onPress={handleSignOut}>
          <Text style={[s.signOutText, { color: colors.red }]}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1 },
  header:       { alignItems: 'center', paddingVertical: 36, paddingHorizontal: 20, borderBottomWidth: 1 },
  avatarContainer:{ position: 'relative', marginBottom: 16, elevation: 5, shadowColor: '#00c3ff', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.2, shadowRadius: 8 },
  avatar:       { width: 100, height: 100, borderRadius: 50, borderWidth: 1 },
  avatarFallback: { alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 50, justifyContent: 'center', alignItems: 'center' },
  editBadge:    { position: 'absolute', bottom: 0, right: 0, borderRadius: 14, width: 28, height: 28, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  nameRow:      { flexDirection: 'row', alignItems: 'center' },
  name:         { fontSize: 26, fontWeight: '900', letterSpacing: 0.5 },
  editRow:      { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  input:        { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, fontSize: 16, minWidth: 180, borderWidth: 1, fontWeight: '600' },
  saveBtn:      { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12 },
  saveText:     { color: '#fff', fontWeight: '800' },
  cancelBtn:    { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: 'transparent' },
  cancelText:   { fontWeight: 'bold' },
  email:        { fontSize: 13, marginTop: 4, marginBottom: 16, opacity: 0.6, fontWeight: '500' },
  streakPill:   { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 24, paddingVertical: 8, paddingHorizontal: 20, borderWidth: 1 },
  streakNum:    { fontSize: 20, fontWeight: '900' },
  streakLabel:  { fontSize: 13, fontWeight: '700', opacity: 0.9 },
  section:      { padding: 18, paddingTop: 24 },
  sectionTitle: { fontSize: 12, fontWeight: '800', letterSpacing: 1.5, marginBottom: 16 },
  grid:         { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard:     { width: '48%', borderRadius: 16, padding: 16, borderWidth: 1, elevation: 2, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 4 },
  statValue:    { fontSize: 18, fontWeight: '900' },
  statLabel:    { fontSize: 11, marginTop: 4, fontWeight: '600' },
  badgePill:    { borderRadius: 16, padding: 16, alignItems: 'center', marginRight: 12, borderWidth: 1, minWidth: 90, elevation: 3, shadowColor: '#ffc700', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.15, shadowRadius: 6 },
  badgeName:    { fontSize: 11, marginTop: 6, fontWeight: '800', textAlign: 'center' },
  signOutBtn:   { borderRadius: 16, paddingVertical: 16, alignItems: 'center', borderWidth: 1 },
  signOutText:  { fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
});
