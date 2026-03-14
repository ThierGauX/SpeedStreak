// src/hooks/useSpeed.ts
import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import * as Haptics  from 'expo-haptics';

const DURATION_MS = 30_000; // 30 secondes

export function useSpeed() {
  const [phase, setPhase]           = useState<'idle' | 'measuring' | 'done'>('idle');
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [averageSpeed, setAverageSpeed] = useState<number | null>(null);
  const [timeLeft, setTimeLeft]     = useState(DURATION_MS);
  const [error, setError]           = useState<string | null>(null);

  const speedsRef    = useRef<number[]>([]);
  const startTimeRef = useRef<number>(0);
  const locationSub  = useRef<Location.LocationSubscription | null>(null);
  const timerRef     = useRef<ReturnType<typeof setInterval> | null>(null);

  const startMeasure = async () => {
    setError(null);
    speedsRef.current = [];
    setAverageSpeed(null);
    setCurrentSpeed(0);
    setTimeLeft(DURATION_MS);

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setError('Permission GPS refusée. Active la localisation dans les paramètres.');
      return;
    }

    setPhase('measuring');
    startTimeRef.current = Date.now();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    locationSub.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 200, distanceInterval: 0 },
      location => {
        const kmh = (location.coords.speed ?? 0) * 3.6;
        if (kmh >= 0) {
          speedsRef.current.push(kmh);
          setCurrentSpeed(Math.round(kmh * 10) / 10);
        }
      }
    );

    timerRef.current = setInterval(() => {
      const remaining = DURATION_MS - (Date.now() - startTimeRef.current);
      setTimeLeft(Math.max(0, remaining));
      if (remaining <= 0) finish();
    }, 100);
  };

  const finish = () => {
    if (timerRef.current)  clearInterval(timerRef.current);
    if (locationSub.current) locationSub.current.remove();

    const speeds = speedsRef.current;
    if (speeds.length === 0) {
      setError('Aucune donnée GPS. Essaie en extérieur.');
      setPhase('idle');
      return;
    }
    const avg     = speeds.reduce((a, b) => a + b, 0) / speeds.length;
    const rounded = Math.round(avg * 10) / 10;
    setAverageSpeed(rounded);
    setPhase('done');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const reset = () => {
    setPhase('idle');
    setAverageSpeed(null);
    setCurrentSpeed(0);
    setTimeLeft(DURATION_MS);
    setError(null);
  };

  useEffect(() => () => {
    if (timerRef.current)    clearInterval(timerRef.current);
    if (locationSub.current) locationSub.current.remove();
  }, []);

  return {
    phase, currentSpeed, averageSpeed,
    timeLeft, progress: 1 - timeLeft / DURATION_MS,
    error, startMeasure, reset,
  };
}
