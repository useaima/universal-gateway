import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  RecaptchaVerifier,
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
    utgPhoneRecaptcha?: RecaptchaVerifier;
  }
}

const defaultDatabaseUrl = 'https://universal-transaction-gateway-default-rtdb.europe-west1.firebasedatabase.app';
const defaultRecaptchaSiteKey = '6LeDEsgsAAAAAHglydox2_TQEPUDR0k6ZFm8ILUy';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || defaultDatabaseUrl,
};

export const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || defaultRecaptchaSiteKey;

export const app: FirebaseApp = initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const rtdb: Database = getDatabase(app);
export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({ prompt: 'select_account' });

export const getEmailActionSettings = (): ActionCodeSettings => ({
  url: `${window.location.origin}/welcome`,
  handleCodeInApp: true,
});

export const executeEnterpriseRecaptcha = async (action: string): Promise<string | null> =>
  new Promise((resolve) => {
    if (!recaptchaSiteKey) {
      resolve(null);
      return;
    }

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

export const setupRecaptcha = (containerId: string) => {
  if (window.utgPhoneRecaptcha) {
    window.utgPhoneRecaptcha.clear();
    window.utgPhoneRecaptcha = undefined;
  }

  const verifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
  });

  window.utgPhoneRecaptcha = verifier;
  return verifier;
};
