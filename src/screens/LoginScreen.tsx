// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../hooks/useAuth';
import { useAppTheme } from '../context/ThemeContext';

export default function LoginScreen() {
  const { signInWithGoogle } = useAuth();
  const { colors, isDark } = useAppTheme();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (e: any) {
      Alert.alert('Erreur de connexion', e.message || 'Réessaie plus tard.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient 
      colors={isDark ? ['#0a0a0f', '#0d1117', '#0a0e1a'] : ['#ebf4f9', '#ffffff', '#e0eff7']} 
      style={s.container}
    >
      <View style={[s.circle1, { backgroundColor: isDark ? 'rgba(0,195,255,0.04)' : 'rgba(0,195,255,0.08)' }]} />
      <View style={[s.circle2, { backgroundColor: isDark ? 'rgba(0,87,255,0.04)' : 'rgba(0,87,255,0.08)' }]} />
      <View style={s.content}>

        {/* Logo */}
        <View style={s.logoWrap}>
          <View style={[s.logoRing, { backgroundColor: isDark ? 'rgba(0,195,255,0.08)' : 'rgba(0,195,255,0.15)', borderColor: isDark ? 'rgba(0,195,255,0.15)' : 'rgba(0,195,255,0.3)' }]} />
          <LinearGradient colors={['#00c3ff', '#0057ff']} style={s.logoInner}>
            <Text style={{ fontSize: 38 }}>⚡</Text>
          </LinearGradient>
        </View>

        <Text style={[s.title, { color: colors.text }]}>SPEEDSTREAK</Text>
        <Text style={[s.tagline, { color: isDark ? '#4a7fa5' : '#1e3a8a' }]}>MESURE • PROGRESSE • DOMINE</Text>

        {/* Features */}
        <View style={[s.features, { backgroundColor: colors.bgCard, borderColor: colors.bgCardBorder }]}>
          {[
            { icon: '⚡', text: 'Mesure ta vitesse GPS en 30 secondes' },
            { icon: '🔥', text: 'Série quotidienne style Duolingo' },
            { icon: '🏆', text: 'Classement global & entre amis' },
            { icon: '🏅', text: '14 badges à débloquer' },
          ].map((f, i) => (
            <View key={i} style={s.featureRow}>
              <Text style={s.featureIcon}>{f.icon}</Text>
              <Text style={[s.featureText, { color: colors.textMuted }]}>{f.text}</Text>
            </View>
          ))}
        </View>

        {/* Bouton Google */}
        <TouchableOpacity style={[s.googleBtn, { backgroundColor: isDark ? '#fff' : '#0f172a' }]} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
          {loading
            ? <ActivityIndicator color={isDark ? "#1a1a2e" : "#fff"} />
            : <>
                <Text style={s.googleG}>G</Text>
                <Text style={[s.googleText, { color: isDark ? '#1a1a2e' : '#fff' }]}>Continuer avec Google</Text>
              </>
          }
        </TouchableOpacity>

        <Text style={[s.legal, { color: colors.textDim }]}>En continuant, tu acceptes nos CGU</Text>
      </View>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  container:   { flex: 1, alignItems: 'center', justifyContent: 'center' },
  circle1:     { position: 'absolute', top: -100,  right: -100, width: 300, height: 300, borderRadius: 150 },
  circle2:     { position: 'absolute', bottom: -150, left: -100, width: 400, height: 400, borderRadius: 200 },
  content:     { alignItems: 'center', paddingHorizontal: 32, width: '100%' },
  logoWrap:    { alignItems: 'center', justifyContent: 'center', marginBottom: 24, width: 90, height: 90 },
  logoRing:    { position: 'absolute', width: 110, height: 110, borderRadius: 55, borderWidth: 1 },
  logoInner:   { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', elevation: 12, shadowColor: '#0057ff', shadowOffset: {width: 0, height: 6}, shadowOpacity: 0.3, shadowRadius: 10 },
  title:       { fontSize: 44, letterSpacing: 3, fontWeight: '900', marginBottom: 6, textAlign: 'center' },
  tagline:     { fontSize: 11, letterSpacing: 2, marginBottom: 40, fontWeight: '700' },
  features:    { width: '100%', marginBottom: 36, borderRadius: 20, padding: 18, borderWidth: 1, elevation: 4, shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.05, shadowRadius: 8 },
  featureRow:  { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  featureIcon: { fontSize: 20, marginRight: 14, width: 26, textAlign: 'center' },
  featureText: { fontSize: 14, fontWeight: '600' },
  googleBtn:   { flexDirection: 'row', alignItems: 'center', borderRadius: 16, paddingVertical: 16, paddingHorizontal: 28, gap: 12, width: '100%', justifyContent: 'center', elevation: 8, shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.2, shadowRadius: 8 },
  googleG:     { fontSize: 20, fontWeight: '900', color: '#4285F4' },
  googleText:  { fontSize: 16, fontWeight: '700' },
  legal:       { fontSize: 11, textAlign: 'center', marginTop: 24, fontWeight: '600' },
});
