import crypto from 'crypto';

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

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const rawNonce = crypto.randomBytes(16).toString('hex');
  const expiresAt = Date.now() + 5 * 60 * 1000;
  const signature = buildSignature(rawNonce, expiresAt);
  const nonce = `${rawNonce}_${expiresAt}_${signature}`;

  return res.status(200).json({ nonce, expiresAt });
}
