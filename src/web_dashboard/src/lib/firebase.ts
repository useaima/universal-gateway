import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
  type ActionCodeSettings,
  type Auth,
} from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getDatabase, type Database } from 'firebase/database';

type EnterpriseGrecaptcha = {
  enterprise?: {
    ready: (callback: () => void) => void;
    execute: (siteKey: string, options: { action: string }) => Promise<string>;
  };
};

declare global {
  interface Window {
    grecaptcha?: EnterpriseGrecaptcha;
  }
}

let enterpriseRecaptchaLoader: Promise<void> | null = null;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
};

export const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';

export const app: FirebaseApp = initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const rtdb: Database = getDatabase(app);
export const googleProvider = new GoogleAuthProvider();

void setPersistence(auth, browserLocalPersistence);

googleProvider.setCustomParameters({ prompt: 'select_account' });

export const getEmailActionSettings = (): ActionCodeSettings => ({
  url: `${window.location.origin}/welcome`,
  handleCodeInApp: true,
});

const ensureEnterpriseRecaptchaLoaded = async (): Promise<void> => {
  if (!recaptchaSiteKey || window.grecaptcha?.enterprise) {
    return;
  }

  if (!enterpriseRecaptchaLoader) {
    enterpriseRecaptchaLoader = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/enterprise.js?render=${encodeURIComponent(recaptchaSiteKey)}`;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load reCAPTCHA Enterprise script.'));
      document.head.appendChild(script);
    });
  }

  await enterpriseRecaptchaLoader;
};

export const executeEnterpriseRecaptcha = async (action: string): Promise<string | null> =>
  new Promise((resolve) => {
    if (!recaptchaSiteKey) {
      resolve(null);
      return;
    }

    ensureEnterpriseRecaptchaLoaded()
      .then(() => {
        const grecaptcha = window.grecaptcha;
        if (!grecaptcha?.enterprise) {
          resolve(null);
          return;
        }

        grecaptcha.enterprise.ready(async () => {
          try {
            const token = await grecaptcha.enterprise?.execute(recaptchaSiteKey, { action });
            resolve(token ?? null);
          } catch (error) {
            console.error('UTG: Enterprise reCAPTCHA execution failed.', error);
            resolve(null);
          }
        });
      })
      .catch((error) => {
        console.error('UTG: Unable to load enterprise reCAPTCHA.', error);
        resolve(null);
      });
  });

export const verifyEnterpriseRecaptcha = async (action: string) => {
  const token = await executeEnterpriseRecaptcha(action);
  if (!token) {
    return;
  }

  const response = await fetch('/api/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, action }),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'reCAPTCHA verification failed.');
  }
};
