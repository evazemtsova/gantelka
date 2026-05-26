import { useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithRedirect,
  getRedirectResult,
  signInAnonymously as firebaseSignInAnonymously,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  type User,
} from 'firebase/auth';
import { auth } from './firebase';

const IS_MOCK = import.meta.env.VITE_DEV_AUTH === 'mock';

export interface AppUser {
  id: string;
  isAnonymous: boolean;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export interface AppSession {
  user: AppUser;
}

function toAppUser(user: User): AppUser {
  return {
    id: user.uid,
    isAnonymous: user.isAnonymous,
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
  };
}

const MOCK_SESSION: AppSession = {
  user: { id: 'mock-user', isAnonymous: false, displayName: 'Test User', email: null, photoURL: null },
};

interface SessionState {
  session: AppSession | null;
  loading: boolean;
}

export function useSession(): SessionState {
  const [state, setState] = useState<SessionState>(() => ({
    session: IS_MOCK ? MOCK_SESSION : null,
    loading: !IS_MOCK,
  }));

  useEffect(() => {
    if (IS_MOCK) return;

    // Обрабатываем результат редиректа после Google OAuth (вызывается при каждой загрузке страницы)
    getRedirectResult(auth).catch((err: unknown) => {
      const code = (err as { code?: string })?.code;
      if (code !== 'auth/redirect-cancelled-by-user' && code !== 'auth/no-auth-event') {
        console.error('Redirect sign-in failed', err);
        alert('Не удалось войти через Google. Попробуй ещё раз.');
      }
    });

    return onAuthStateChanged(auth, (user) => {
      setState({ session: user ? { user: toAppUser(user) } : null, loading: false });
    });
  }, []);

  return state;
}

export async function signInWithGoogle(): Promise<void> {
  if (IS_MOCK) return;
  await signInWithRedirect(auth, new GoogleAuthProvider());
}

export async function signInAnonymously(): Promise<void> {
  if (IS_MOCK) return;
  try {
    await firebaseSignInAnonymously(auth);
  } catch (err) {
    console.error('Anonymous sign-in failed', err);
    alert('Не удалось войти как гость. Попробуй ещё раз.');
  }
}

export async function signOut(): Promise<void> {
  if (IS_MOCK) {
    alert('В mock-режиме выход недоступен. Запусти без VITE_DEV_AUTH=mock.');
    return;
  }
  await firebaseSignOut(auth);
}
