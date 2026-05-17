import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
const isMock = import.meta.env.VITE_DEV_AUTH === 'mock';

if (!isMock && (!url || !key)) {
  throw new Error(
    'Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Set them in frontend/.env.local or use VITE_DEV_AUTH=mock for local dev.',
  );
}

/**
 * Клиент Supabase. В mock-режиме создаётся со stub-значениями — реальные
 * вызовы не делаются, так как auth.ts перехватывает их выше.
 */
export const supabase = createClient(
  url ?? 'https://mock.supabase.co',
  key ?? 'mock-anon-key',
);
