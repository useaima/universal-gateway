import type { User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface UserProgress {
  authProvider?: string;
  email?: string;
  emailVerifiedAt?: string;
  phoneNumber?: string;
  phoneVerifiedAt?: string;
  onboardingCompletedAt?: string;
  lastLoginAt?: string;
  walletAddress?: string;
  agentFramework?: string;
  dailySafetyLimit?: number;
  authorizedNetworks?: string[];
  onboardedAt?: string;
  billingModel?: string;
}

const getPrimaryProvider = (user: User) => {
  const providerId = user.providerData[0]?.providerId || user.providerId;

  if (providerId === 'google.com') {
    return 'google';
  }

  if (providerId === 'phone') {
    return 'phone';
  }

  return 'password';
};

export const getUserProgress = async (uid: string): Promise<UserProgress | null> => {
  const snapshot = await getDoc(doc(db, 'users', uid));
  return snapshot.exists() ? (snapshot.data() as UserProgress) : null;
};

export const mergeUserProgress = async (uid: string, payload: Partial<UserProgress>) => {
  await setDoc(doc(db, 'users', uid), payload, { merge: true });
};

export const syncUserProgress = async (user: User): Promise<UserProgress> => {
  const existing = (await getUserProgress(user.uid)) || {};
  const patch: Partial<UserProgress> = {
    authProvider: existing.authProvider || getPrimaryProvider(user),
    email: user.email || existing.email || '',
    lastLoginAt: new Date().toISOString(),
  };

  if (user.emailVerified && !existing.emailVerifiedAt) {
    patch.emailVerifiedAt = new Date().toISOString();
  }

  if (user.phoneNumber && !existing.phoneVerifiedAt) {
    patch.phoneNumber = user.phoneNumber;
    patch.phoneVerifiedAt = new Date().toISOString();
  } else if (user.phoneNumber && !existing.phoneNumber) {
    patch.phoneNumber = user.phoneNumber;
  }

  await mergeUserProgress(user.uid, patch);
  return { ...existing, ...patch };
};
