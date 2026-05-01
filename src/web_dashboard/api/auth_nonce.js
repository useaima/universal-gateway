import { issueStoredNonce } from './_siwe.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const payload = await issueStoredNonce(req);
    return res.status(200).json(payload);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to issue a SIWE nonce.';
    const status = message.includes('required') ? 503 : 500;
    return res.status(status).json({ error: message });
  }
}
