import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://gwsidpydnncyhkvdgtln.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3c2lkcHlkbm5jeWhrdmRndGxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNTIwNjgsImV4cCI6MjA2NzgyODA2OH0.0V_wmXyMUIrNT-zJBGGeXnECK1PNPbFzUu53sxYV8Jo";
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3c2lkcHlkbm5jeWhrdmRndGxuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjI1MjA2OCwiZXhwIjoyMDY3ODI4MDY4fQ.K972cg_GOZ_FIS55vF2KrLX9D6OhvDdFC_-vw8Lj9cU";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-only admin client
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
