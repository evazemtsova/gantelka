import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache } from 'firebase/firestore';

const isMock = import.meta.env.VITE_DEV_AUTH === 'mock';

if (!isMock && !import.meta.env.VITE_FIREBASE_API_KEY) {
  throw new Error(
    'Missing Firebase config. Set VITE_FIREBASE_* in frontend/.env.local or use VITE_DEV_AUTH=mock for local dev.',
  );
}

const app = initializeApp({
  apiKey:     import.meta.env.VITE_FIREBASE_API_KEY     ?? 'mock',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? 'mock.firebaseapp.com',
  projectId:  import.meta.env.VITE_FIREBASE_PROJECT_ID  ?? 'mock',
  appId:      import.meta.env.VITE_FIREBASE_APP_ID      ?? 'mock',
});

export const auth = getAuth(app);
export const db   = initializeFirestore(app, {
  localCache: persistentLocalCache(),
});
