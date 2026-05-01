import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const normalizePrivateKey = (value) => value?.replace(/\\n/g, '\n');

const getProjectId = () =>
  process.env.FIREBASE_PROJECT_ID ||
  process.env.GOOGLE_CLOUD_PROJECT_ID;

export const getFirebaseAdmin = () => {
  const projectId = getProjectId();

  if (!projectId) {
    return null;
  }

  if (!getApps().length) {
    const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = normalizePrivateKey(
      process.env.FIREBASE_PRIVATE_KEY || process.env.GOOGLE_PRIVATE_KEY,
    );

    if (credentialsJson) {
      const parsed = JSON.parse(credentialsJson);
      initializeApp({
        credential: cert(parsed),
        projectId,
      });
    } else if (clientEmail && privateKey) {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        projectId,
      });
    } else {
      try {
        initializeApp({ projectId });
      } catch (error) {
        console.warn('UTG: Firebase Admin initialization skipped.', error);
        return null;
      }
    }
  }

  return {
    auth: getAuth(),
    firestore: getFirestore(),
    projectId,
  };
};
