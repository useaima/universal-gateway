import crypto from 'crypto';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import { getFirebaseAdmin } from './_firebaseAdmin.js';

const client = createPublicClient({
  chain: base,
  transport: http(base.rpcUrls.default.http[0]),
});

const secret =
  process.env.SIWE_NONCE_SECRET ||
  process.env.RECAPTCHA_SITE_KEY ||
  process.env.VITE_FIREBASE_APP_ID ||
  'utg-base-auth';

const buildSignature = (rawNonce, expiresAt) =>
  crypto
    .createHmac('sha256', secret)
    .update(`${rawNonce}:${expiresAt}`)
    .digest('hex');

const extractNonce = (message) => message.match(/Nonce:\s+([A-Za-z0-9_]+)/)?.[1] || null;

const validateNonce = (nonce) => {
  const match = nonce.match(/^([a-f0-9]+)_([0-9]+)_([a-f0-9]+)$/i);
  if (!match) {
    return false;
  }

  const [, rawNonce, expiresAtRaw, signature] = match;
  const expiresAt = Number(expiresAtRaw);

  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) {
    return false;
  }

  const expected = buildSignature(rawNonce, expiresAt);
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
};

const buildUid = (address) => `base_${address.toLowerCase().replace(/^0x/, '')}`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { address, message, signature } = req.body || {};

  if (!address || !message || !signature) {
    return res.status(400).json({ error: 'Missing address, message, or signature.' });
  }

  const nonce = extractNonce(message);
  if (!nonce || !validateNonce(nonce)) {
    return res.status(400).json({ error: 'Invalid or expired SIWE nonce.' });
  }

  const expectedHost = process.env.APP_DOMAIN || req.headers.host || '';
  if (expectedHost && !message.includes(expectedHost)) {
    return res.status(400).json({ error: 'SIWE domain mismatch.' });
  }

  const valid = await client.verifyMessage({
    address,
    message,
    signature,
  });

  if (!valid) {
    return res.status(401).json({ error: 'Signature verification failed.' });
  }

  const admin = getFirebaseAdmin();
  const uid = buildUid(address);
  let customToken = null;

  if (admin) {
    customToken = await admin.auth.createCustomToken(uid, {
      authMode: 'base',
      primaryWallet: address,
      network: 'base',
    });

    await admin.firestore.collection('users').doc(uid).set(
      {
        authMode: 'base',
        authProvider: 'base',
        primaryWallet: address,
        walletAddress: address,
        evmAddresses: [address],
        baseAppInstalledAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      },
      { merge: true },
    );
  }

  return res.status(200).json({
    address,
    chainId: '0x2105',
    customToken,
    authMode: 'base',
    baseAppInstalledAt: new Date().toISOString(),
  });
}
