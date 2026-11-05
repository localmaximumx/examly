import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://skvqvucwbjspzpuiciuv.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrdnF2dWN3YmpzcHpwdWljaXV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM4NzU1NzksImV4cCI6MjEwOTQ1MTU3OX0.H4_dAb-B56RcVADUVt5tJV5zcdG38C77fpc570Jhe6E';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
