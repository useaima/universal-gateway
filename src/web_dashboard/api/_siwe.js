import crypto from 'crypto';
import { getFirebaseAdmin } from './_firebaseAdmin.js';

const DEFAULT_ALLOWED_CHAIN_IDS = ['8453', '84532'];

const normalizeHost = (value) => {
  if (!value) return '';
  const raw = String(value).trim();
  if (!raw) return '';

  try {
    return new URL(raw.includes('://') ? raw : `https://${raw}`).host.toLowerCase();
  } catch {
    return raw.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').toLowerCase();
  }
};

const requiredSecret = () => {
  const secret = process.env.SIWE_NONCE_SECRET?.trim();
  if (!secret) {
    throw new Error('SIWE_NONCE_SECRET is required.');
  }
  return secret;
};

const buildNonceSignature = (nonceId, expiresAt) =>
  crypto.createHmac('sha256', requiredSecret()).update(`${nonceId}:${expiresAt}`).digest('hex');

const allowedChainIds = () => {
  const configured = process.env.ALLOWED_SIWE_CHAIN_IDS
    ?.split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  return configured?.length ? configured : DEFAULT_ALLOWED_CHAIN_IDS;
};

const extractLine = (message, label) =>
  message.match(new RegExp(`^${label}:\\s*(.+)$`, 'im'))?.[1]?.trim() || '';

export const extractNonceFromMessage = (message) => extractLine(String(message || ''), 'Nonce');

export const extractChainIdFromMessage = (message) => extractLine(String(message || ''), 'Chain ID');

export const extractHostFromMessage = (message) => {
  const directDomain = normalizeHost(extractLine(String(message || ''), 'Domain'));
  if (directDomain) {
    return directDomain;
  }

  const uri = extractLine(String(message || ''), 'URI');
  return normalizeHost(uri);
};

export const resolveExpectedHost = (req) =>
  normalizeHost(
    process.env.APP_DOMAIN ||
      process.env.SIWE_ALLOWED_DOMAIN ||
      req?.headers?.host ||
      '',
  );

export const issueStoredNonce = async (req) => {
  const admin = getFirebaseAdmin();
  if (!admin) {
    throw new Error('Firebase Admin is required for nonce issuance.');
  }

  const nonceId = crypto.randomBytes(16).toString('hex');
  const expiresAt = Date.now() + 5 * 60 * 1000;
  const host = resolveExpectedHost(req);
  const nonce = `${nonceId}_${expiresAt}_${buildNonceSignature(nonceId, expiresAt)}`;

  await admin.firestore.collection('siwe_nonces').doc(nonceId).set({
    host,
    expiresAt,
    issuedAt: new Date().toISOString(),
    usedAt: null,
  });

  return { nonce, expiresAt };
};

export const consumeStoredNonce = async (req, message) => {
  const admin = getFirebaseAdmin();
  if (!admin) {
    return { ok: false, status: 503, error: 'Firebase Admin is required for SIWE verification.' };
  }

  const nonce = extractNonceFromMessage(message);
  const match = nonce.match(/^([a-f0-9]+)_([0-9]+)_([a-f0-9]+)$/i);
  if (!match) {
    return { ok: false, status: 400, error: 'Invalid SIWE nonce format.' };
  }

  const [, nonceId, expiresAtRaw, signature] = match;
  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) {
    return { ok: false, status: 400, error: 'Invalid or expired SIWE nonce.' };
  }

  const expectedSignature = buildNonceSignature(nonceId, expiresAt);
  if (expectedSignature.length !== signature.length) {
    return { ok: false, status: 400, error: 'Invalid SIWE nonce signature.' };
  }
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return { ok: false, status: 400, error: 'Invalid SIWE nonce signature.' };
  }

  const messageHost = extractHostFromMessage(message);
  const expectedHost = resolveExpectedHost(req);
  const chainId = extractChainIdFromMessage(message);
  if (!chainId || !allowedChainIds().includes(String(chainId))) {
    return { ok: false, status: 400, error: 'Unsupported SIWE chain.' };
  }
  if (!messageHost || !expectedHost || messageHost !== expectedHost) {
    return { ok: false, status: 400, error: 'SIWE domain mismatch.' };
  }

  const docRef = admin.firestore.collection('siwe_nonces').doc(nonceId);
  try {
    await admin.firestore.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(docRef);
      if (!snapshot.exists) {
        throw new Error('nonce_not_found');
      }

      const data = snapshot.data() || {};
      if (data.usedAt) {
        throw new Error('nonce_already_used');
      }
      if (Number(data.expiresAt || 0) < Date.now()) {
        throw new Error('nonce_expired');
      }
      if (normalizeHost(data.host) !== expectedHost) {
        throw new Error('nonce_host_mismatch');
      }

      transaction.update(docRef, {
        usedAt: new Date().toISOString(),
        usedByHost: expectedHost,
      });
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : 'nonce_invalid';
    const messages = {
      nonce_not_found: 'Unknown SIWE nonce.',
      nonce_already_used: 'SIWE nonce replay detected.',
      nonce_expired: 'SIWE nonce expired before verification.',
      nonce_host_mismatch: 'SIWE nonce host mismatch.',
      nonce_invalid: 'Unable to validate SIWE nonce.',
    };

    return {
      ok: false,
      status: 400,
      error: messages[code] || messages.nonce_invalid,
    };
  }

  return { ok: true, chainId, expectedHost };
};
