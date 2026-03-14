// src/navigation/AppNavigator.tsx
import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import HomeScreen        from '../screens/HomeScreen';
import BadgesScreen      from '../screens/BadgesScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import ProfileScreen     from '../screens/ProfileScreen';
import LoginScreen       from '../screens/LoginScreen';
import { useAuth }       from '../hooks/useAuth';
import { useAppTheme }   from '../context/ThemeContext';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function Tabs() {
  const { colors } = useAppTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle:       { backgroundColor: colors.bg },
        headerTitleStyle:  { color: colors.text, fontWeight: '800', letterSpacing: 1, fontSize: 16 },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: colors.navBg,
          borderTopColor:  colors.navBorder,
          borderTopWidth:  1,
          height: 72, paddingBottom: 12,
        },
        tabBarActiveTintColor:   colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle:        { fontSize: 10, fontWeight: '600' },
      }}
    >
      <Tab.Screen name="Accueil"    component={HomeScreen}
        options={{ title: 'SPEEDSTREAK', tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>⚡</Text>, tabBarLabel: 'Accueil' }} />
      <Tab.Screen name="Badges"     component={BadgesScreen}
        options={{ title: 'MES BADGES',  tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🏅</Text> }} />
      <Tab.Screen name="Classement" component={LeaderboardScreen}
        options={{ title: 'CLASSEMENT',  tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🏆</Text> }} />
      <Tab.Screen name="Profil"     component={ProfileScreen}
        options={{ title: 'MON PROFIL',  tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>👤</Text> }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();
  const { isDark, colors } = useAppTheme();

  if (loading) {
    return (
      <View style={[s.splash, { backgroundColor: colors.bg }]}>
        <Text style={{ fontSize: 52 }}>⚡</Text>
        <ActivityIndicator color={colors.accent} style={{ marginTop: 20 }} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style={isDark ? "light" : "dark"} backgroundColor={colors.bg} />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user
            ? <Stack.Screen name="Main"  component={Tabs}        />
            : <Stack.Screen name="Login" component={LoginScreen} />
          }
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}

const s = StyleSheet.create({
  splash: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
