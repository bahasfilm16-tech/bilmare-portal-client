import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qffhnxefowkkklcydpzr.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmZmhueGVmb3dra2tsY3lkcHpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxOTI0ODksImV4cCI6MjA5MDc2ODQ4OX0.Fo3QrN0TRhP_mFiHoe21OP9v4W14JmSu6qKwd8fp4CY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
