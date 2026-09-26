import { createBrowserClient } from '@supabase/ssr';
import { getSupabasePublicConfig, supabaseSetupMessage } from './config';

export function isSupabaseConfigured() {
  return getSupabasePublicConfig().status === 'ready';
}

export function createClient() {
  const config = getSupabasePublicConfig();
  if (config.status !== 'ready' || !config.url || !config.key) throw new Error(supabaseSetupMessage(config.status));
  return createBrowserClient(config.url, config.key);
}
