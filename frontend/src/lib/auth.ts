import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

const IS_MOCK = import.meta.env.VITE_DEV_AUTH === 'mock';

/** Фейковая сессия для локальной разработки без Supabase. */
const MOCK_SESSION = {
  user: { id: 'mock-user', is_anonymous: false },
} as unknown as Session;

interface SessionState {
  session: Session | null;
  loading: boolean;
}

/**
 * Хук подписки на текущую сессию.
 * В mock-режиме возвращает фейковую сессию сразу (loading=false).
 */
export function useSession(): SessionState {
  const [state, setState] = useState<SessionState>(() => ({
    session: IS_MOCK ? MOCK_SESSION : null,
    loading: !IS_MOCK,
  }));

  useEffect(() => {
    if (IS_MOCK) return;

    supabase.auth.getSession().then(({ data }) => {
      setState({ session: data.session, loading: false });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ session, loading: false });
    });

    return () => subscription.unsubscribe();
  }, []);

  return state;
}

export async function signInWithGoogle(): Promise<void> {
  if (IS_MOCK) return;
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });
  if (error) {
    console.error('Google sign-in failed', error);
    alert('Не удалось войти через Google. Попробуй ещё раз.');
  }
}

export async function signInAnonymously(): Promise<void> {
  if (IS_MOCK) return;
  const { error } = await supabase.auth.signInAnonymously();
  if (error) {
    console.error('Anonymous sign-in failed', error);
    alert('Не удалось войти как гость. Попробуй ещё раз.');
  }
}

export async function signOut(): Promise<void> {
  if (IS_MOCK) {
    alert('В mock-режиме выход недоступен. Запусти без VITE_DEV_AUTH=mock.');
    return;
  }
  await supabase.auth.signOut();
}
