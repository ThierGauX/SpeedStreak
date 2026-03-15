import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://krxqczzpttyzzwiyjbkr.supabase.co';
// TODO: Replace with your actual Supabase Anon Key
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtyeHFjenpwdHR5enp3aXlqYmtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MDU3MzcsImV4cCI6MjA4OTA4MTczN30.iX-iYHsYy59R8arFCgx4KW8bRUKLQ1IF8rKLdwYXAgw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
