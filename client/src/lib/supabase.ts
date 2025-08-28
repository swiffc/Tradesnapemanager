import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://uolvqeedmcesysqtsimc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvbHZxZWVkbWNlc3lzcXRzaW1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxMzgzOTksImV4cCI6MjA2ODcxNDM5OX0.uGapRAmG0VjSmKzqF-JIJ2VYwLtWlLI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);