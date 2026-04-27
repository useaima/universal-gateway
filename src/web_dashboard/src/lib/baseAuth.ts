import {
  signInAnonymously,
  signInWithCustomToken,
  type User,
} from 'firebase/auth';
import { auth } from './firebase';
import { mergeUserProgress } from './userProgress';

export interface VerifiedBaseSession {
  address: string;
  chainId: string;
  customToken: string | null;
  authMode: 'base';
  baseAppInstalledAt?: string;
}

export const isLikelyBaseApp = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  const params = new URLSearchParams(window.location.search);
  if (params.get('base-app') === '1' || params.get('base') === '1') {
    return true;
  }

  return /base/i.test(window.navigator.userAgent);
};

export const truncateAddress = (value?: string | null) => {
  if (!value) {
    return 'Wallet not linked';
  }

  if (value.length <= 10) {
    return value;
  }

  return `${value.slice(0, 6)}...${value.slice(-4)}`;
};

export const requestBaseNonce = async () => {
  const response = await fetch('/api/auth_nonce');
  const data = await response.json();

  if (!response.ok || !data?.nonce) {
    throw new Error(data?.error || 'Failed to create a Base sign-in challenge.');
  }

  return data.nonce as string;
};

export const verifyBaseSignature = async (payload: {
  address: string;
  message: string;
  signature: string;
}) => {
  const response = await fetch('/api/auth_verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || 'Base signature verification failed.');
  }

  return data as VerifiedBaseSession;
};

export const ensureBaseFirebaseSession = async (session: VerifiedBaseSession): Promise<User> => {
  let user = auth.currentUser;

  if (session.customToken) {
    user = (await signInWithCustomToken(auth, session.customToken)).user;
  } else if (!user) {
    user = (await signInAnonymously(auth)).user;
  }

  if (!user) {
    throw new Error('Unable to establish a Firebase session for this Base account.');
  }

  await mergeUserProgress(user.uid, {
    authMode: 'base',
    authProvider: 'base',
    email: user.email || '',
    primaryWallet: session.address,
    walletAddress: session.address,
    evmAddresses: [session.address],
    baseAppInstalledAt: session.baseAppInstalledAt || new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  });

  return user;
};
