import { createClient } from '@supabase/supabase-js';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
};

let supabaseInstance: ReturnType<typeof createClient> | null = null;

export const supabaseBrowser = () => {
  if (supabaseInstance) {
    return supabaseInstance;
  }
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Supabase env not configured');
  }
  
  supabaseInstance = createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true },
    global: {
      fetch: (input: RequestInfo | URL, init?: RequestInit) =>
        fetch(input, { ...init, cache: 'no-store', next: { revalidate: 0 } as any })
    }
  });
  
  return supabaseInstance;
};


