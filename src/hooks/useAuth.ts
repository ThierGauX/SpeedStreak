// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { getUserProfile, createUserProfile } from '../services/database';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSessionChange(session);
    });

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSessionChange(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSessionChange = async (session: any) => {
    if (session?.user) {
      const supaUser = session.user;
      let profile = await getUserProfile(supaUser.id);
      
      // Auto-create profile if missing
      if (!profile) {
        await createUserProfile(supaUser.id, {
          displayName: supaUser.email?.split('@')[0] || 'Anonyme',
          email: supaUser.email || '',
          photoURL: '',
        });
        profile = await getUserProfile(supaUser.id);
      }
      
      setUser({ ...supaUser, uid: supaUser.id, profile });
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, loading, signIn, signUp, signOut };
}
