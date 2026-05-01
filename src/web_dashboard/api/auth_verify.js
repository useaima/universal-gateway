import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import { getFirebaseAdmin } from './_firebaseAdmin.js';
import { consumeStoredNonce } from './_siwe.js';

const client = createPublicClient({
  chain: base,
  transport: http(base.rpcUrls.default.http[0]),
});

const buildUid = (address) => `base_${address.toLowerCase().replace(/^0x/, '')}`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { address, message, signature } = req.body || {};
  if (!address || !message || !signature) {
    return res.status(400).json({ error: 'Missing address, message, or signature.' });
  }

  const nonceResult = await consumeStoredNonce(req, String(message));
  if (!nonceResult.ok) {
    return res.status(nonceResult.status).json({ error: nonceResult.error });
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
  if (!admin) {
    return res.status(503).json({ error: 'Firebase Admin is required for Base auth token minting.' });
  }

  const uid = buildUid(address);
  const baseAppInstalledAt = new Date().toISOString();
  const customToken = await admin.auth.createCustomToken(uid, {
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
      baseAppInstalledAt,
      lastLoginAt: baseAppInstalledAt,
      authorizedNetworks: ['base', 'ethereum'],
    },
    { merge: true },
  );

  return res.status(200).json({
    address,
    chainId: `0x${Number(nonceResult.chainId).toString(16)}`,
    customToken,
    authMode: 'base',
    baseAppInstalledAt,
  });
}
