// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../hooks/useAuth';
import { useAppTheme } from '../context/ThemeContext';

export default function LoginScreen() {
  const { signIn, signUp } = useAuth();
  const { colors, isDark } = useAppTheme();
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }
    setLoading(true);
    try {
      if (isRegistering) {
        await signUp(email, password);
        // Supabase might require email confirmation, handle or notify if needed.
        Alert.alert('Succès', 'Inscription réussie !');
      } else {
        await signIn(email, password);
      }
    } catch (e: any) {
      Alert.alert('Erreur', e.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
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

          {/* Form */}
          <View style={[s.formCard, { backgroundColor: colors.bgCard, borderColor: colors.bgCardBorder }]}>
            <TextInput
              style={[s.input, { color: colors.text, borderColor: isDark ? '#333' : '#ddd', backgroundColor: isDark ? '#1a1a24' : '#f9f9f9' }]}
              placeholder="Email"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={[s.input, { color: colors.text, borderColor: isDark ? '#333' : '#ddd', backgroundColor: isDark ? '#1a1a24' : '#f9f9f9' }]}
              placeholder="Mot de passe"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity style={[s.authBtn, { backgroundColor: '#0057ff' }]} onPress={handleAuth} disabled={loading} activeOpacity={0.85}>
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={s.authText}>{isRegistering ? "S'inscrire" : "Se connecter"}</Text>
              }
            </TouchableOpacity>

            <TouchableOpacity style={s.toggleBtn} onPress={() => setIsRegistering(!isRegistering)}>
              <Text style={[s.toggleText, { color: colors.textDim }]}>
                {isRegistering ? "Déjà un compte ? Se connecter" : "Pas de compte ? S'inscrire"}
              </Text>
            </TouchableOpacity>
          </View>

        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
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
  formCard:    { width: '100%', marginBottom: 36, borderRadius: 20, padding: 18, borderWidth: 1, elevation: 4, shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.05, shadowRadius: 8 },
  input:       { borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 16, fontSize: 16 },
  authBtn:     { borderRadius: 16, paddingVertical: 16, alignItems: 'center', elevation: 2 },
  authText:    { color: '#fff', fontSize: 16, fontWeight: '700' },
  toggleBtn:   { marginTop: 16, alignItems: 'center' },
  toggleText:  { fontSize: 14, fontWeight: '600' },
});
