export type SupabaseConfigStatus = 'ready' | 'missing-url' | 'missing-key' | 'invalid-url' | 'invalid-key' | 'service-role-key';

export type SupabasePublicConfig = {
  url: string | null;
  key: string | null;
  status: SupabaseConfigStatus;
};

/** Reads only browser-safe project URL/publishable (or legacy anon) settings. */
export function getSupabasePublicConfig(): SupabasePublicConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || null;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() || null;

  if (!url) return { url, key, status: 'missing-url' };
  if (!key) return { url, key, status: 'missing-key' };

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { url: null, key: null, status: 'invalid-url' };
  }
  const localHost = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
  const validScheme = parsed.protocol === 'https:' || (localHost && parsed.protocol === 'http:');
  const supabaseHost = parsed.hostname === 'supabase.co' || parsed.hostname.endsWith('.supabase.co') || parsed.hostname.includes('.supabase.');
  if (!validScheme || (!localHost && !supabaseHost) || parsed.username || parsed.password) {
    return { url: null, key: null, status: 'invalid-url' };
  }

  if (key.startsWith('sb_secret_')) return { url: null, key: null, status: 'service-role-key' };
  if (!key.startsWith('sb_publishable_') && !isLegacyAnonJwt(key)) {
    return { url: null, key: null, status: 'invalid-key' };
  }
  return { url: parsed.origin, key, status: 'ready' };
}

function isLegacyAnonJwt(value: string): boolean {
  const parts = value.split('.');
  if (parts.length !== 3) return false;
  try {
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload.role === 'anon';
  } catch {
    return false;
  }
}

export function supabaseSetupMessage(status: SupabaseConfigStatus): string {
  switch (status) {
    case 'missing-url': return 'Supabase URL is missing. Add NEXT_PUBLIC_SUPABASE_URL to .env.local, then restart the app.';
    case 'missing-key': return 'Supabase publishable key is missing. Add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env.local, then restart the app.';
    case 'invalid-url': return 'Supabase URL is invalid. Copy the HTTPS Project URL from your Supabase project settings.';
    case 'invalid-key': return 'Supabase key is invalid. Use the project publishable key (or legacy anon key), not a secret key.';
    case 'service-role-key': return 'A Supabase secret key cannot be used by the browser. Replace it with the project publishable key.';
    default: return '';
  }
}
