import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabasePublicConfig, supabaseSetupMessage } from './config';

export async function createClient() {
  const config = getSupabasePublicConfig();
  if (config.status !== 'ready' || !config.url || !config.key) throw new Error(supabaseSetupMessage(config.status));
  const cookieStore = await cookies();
  return createServerClient(config.url, config.key, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookiesToSet) {
        try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); }
        catch { /* Server Components cannot mutate cookies; middleware refreshes sessions. */ }
      },
    },
  });
}
