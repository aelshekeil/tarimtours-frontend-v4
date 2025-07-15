import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vrvrhzseqnjpriqesgoj.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZydnJoenNlcW5qcHJpcWVzZ29qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxNjA4OTAsImV4cCI6MjA2NzczNjg5MH0.1D9ES2hGCgC8726b9HNiPNoQF1SYxHYjTezUGshMFNM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;

