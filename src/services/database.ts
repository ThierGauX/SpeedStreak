// src/services/database.ts
import { supabase } from '../config/supabase';
import { format } from 'date-fns';
import { getNewlyUnlockedBadges, Badge, UserStats } from '../constants/badges';

export async function getUserProfile(uid: string) {
  const { data, error } = await supabase.from('users').select('*').eq('id', uid).maybeSingle();
  if (error) throw error;
  return data;
}

export async function createUserProfile(uid: string, data: {
  displayName: string; email: string; photoURL: string;
}) {
  const insertUser = {
    id: uid,
    displayName: data.displayName,
    email: data.email,
    photoURL: data.photoURL,
    streak: 0,
    lastMeasureDate: null,
    totalMeasures: 0,
    maxSpeed: 0,
    badges: [],
    friends: [],
    createdAt: new Date().toISOString(),
  };
  const { error: err1 } = await supabase.from('users').insert(insertUser);
  if (err1) throw err1;

  const insertLeaderboard = {
    id: uid,
    displayName: data.displayName,
    photoURL: data.photoURL,
    maxSpeed: 0,
    streak: 0,
    updatedAt: new Date().toISOString(),
  };
  const { error: err2 } = await supabase.from('leaderboard').insert(insertLeaderboard);
  if (err2) throw err2;
}

export async function updateProfile(uid: string, data: { displayName?: string; photoURL?: string }) {
  if (Object.keys(data).length > 0) {
    const { error: err1 } = await supabase.from('users').update(data).eq('id', uid);
    if (err1) throw err1;

    // Leaderboard might need updating too (displayName, photoURL)
    const { error: err2 } = await supabase.from('leaderboard').update({
      ...data,
      updatedAt: new Date().toISOString()
    }).eq('id', uid);
    if (err2) throw err2;
  }
}

export async function saveMeasure(uid: string, speed: number): Promise<{ newBadges: Badge[]; newStats: UserStats }> {
  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');

  // get current user
  const { data: user, error: userErr } = await supabase.from('users').select('*').eq('id', uid).single();
  if (userErr) throw userErr;

  if (user.lastMeasureDate === today) throw new Error('Déjà mesuré aujourd\'hui !');

  const newStreak = user.lastMeasureDate === yesterday ? user.streak + 1 : 1;
  const newMaxSpeed = Math.max(user.maxSpeed || 0, speed);
  const newTotalMeasures = (user.totalMeasures || 0) + 1;

  const oldStats: UserStats = { streak: user.streak || 0, maxSpeed: user.maxSpeed || 0, totalMeasures: user.totalMeasures || 0, rank: 9999, badges: user.badges || [] };
  const newStats: UserStats = { streak: newStreak, maxSpeed: newMaxSpeed, totalMeasures: newTotalMeasures, rank: 9999, badges: user.badges || [] };

  const newBadges = getNewlyUnlockedBadges(oldStats, newStats);
  const allBadges = [...(user.badges || []), ...newBadges.map((b: Badge) => b.id)];

  // Update users table
  await supabase.from('users').update({
    streak: newStreak,
    lastMeasureDate: today,
    totalMeasures: newTotalMeasures,
    maxSpeed: newMaxSpeed,
    badges: allBadges
  }).eq('id', uid);

  // Insert measure
  await supabase.from('measures').insert({
    userId: uid,
    speed,
    date: today,
    timestamp: new Date().toISOString(),
  });

  // Update leaderboard
  await supabase.from('leaderboard').update({
    maxSpeed: newMaxSpeed,
    streak: newStreak,
    updatedAt: new Date().toISOString()
  }).eq('id', uid);

  return { newBadges, newStats: { ...newStats, badges: allBadges } };
}

export function subscribeToGlobalLeaderboard(cb: (data: any[]) => void) {
  // initial fetch
  supabase.from('leaderboard').select('*').order('maxSpeed', { ascending: false }).limit(50).then(({ data }) => {
    if (data) cb(data.map((d: any, i: number) => ({ uid: d.id, rank: i + 1, ...d })));
  });

  // subscription
  const sub = supabase.channel('global-leaderboard')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'leaderboard' }, payload => {
      supabase.from('leaderboard').select('*').order('maxSpeed', { ascending: false }).limit(50).then(({ data }) => {
        if (data) cb(data.map((d: any, i: number) => ({ uid: d.id, rank: i + 1, ...d })));
      });
    }).subscribe();

  return () => { supabase.removeChannel(sub); };
}

export function subscribeToFriendsLeaderboard(uid: string, friendUids: string[], cb: (data: any[]) => void) {
  const allUids = [uid, ...(friendUids || [])];
  
  const fetchFriends = async () => {
    const { data } = await supabase.from('leaderboard').select('*').in('id', allUids);
    if (data) {
      const sorted = data.sort((a, b) => (b.maxSpeed || 0) - (a.maxSpeed || 0)).map((u, i) => ({ uid: u.id, rank: i + 1, ...u }));
      cb(sorted);
    }
  };

  fetchFriends();

  const sub = supabase.channel('friends-leaderboard')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'leaderboard', filter: `id=in.(${allUids.join(',')})` }, payload => {
      fetchFriends();
    }).subscribe();

  return () => { supabase.removeChannel(sub); };
}

export async function addFriendByEmail(uid: string, email: string) {
  const { data: friends, error } = await supabase.from('users').select('id, email').eq('email', email).limit(1);
  if (error || !friends || friends.length === 0) throw new Error('Utilisateur introuvable');
  
  const friendUid = friends[0].id;
  if (friendUid === uid) throw new Error('Tu ne peux pas t\'ajouter toi-même');

  // get current friends
  const { data: me } = await supabase.from('users').select('friends').eq('id', uid).single();
  const currentFriends = me?.friends || [];
  
  if (!currentFriends.includes(friendUid)) {
    await supabase.from('users').update({
      friends: [...currentFriends, friendUid]
    }).eq('id', uid);
  }
  
  return { friendUid, ...friends[0] };
}

export function subscribeToProfile(uid: string, cb: (data: any) => void) {
  supabase.from('users').select('*').eq('id', uid).single().then(({ data }) => {
    if (data) {
      // transform simple dates to objects if needed, but we keep it json compatible
      cb({ uid, ...data });
    }
  });

  const sub = supabase.channel(`profile-${uid}`)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'users', filter: `id=eq.${uid}` }, payload => {
      cb({ uid, ...payload.new });
    }).subscribe();

  return () => { supabase.removeChannel(sub); };
}
