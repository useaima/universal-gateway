import { getFirebaseAdmin } from './_firebaseAdmin.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const {
    paymentId,
    status,
    amount,
    asset,
    network,
    txHash,
    walletAddress,
    userId,
    metadata,
  } = req.body || {};

  if (!paymentId || !status) {
    return res.status(400).json({ error: 'Missing paymentId or status.' });
  }

  const record = {
    paymentId,
    status,
    amount: amount || null,
    asset: asset || 'USDC',
    network: network || 'base',
    txHash: txHash || null,
    walletAddress: walletAddress || null,
    metadata: metadata || {},
    updatedAt: new Date().toISOString(),
  };

  const admin = getFirebaseAdmin();

  if (admin) {
    await admin.firestore.collection('payment_reconciliation').doc(paymentId).set(record, { merge: true });

    if (userId) {
      await admin.firestore.collection('users').doc(userId).set(
        {
          lastPaymentReference: {
            paymentId,
            status,
            amount: amount || null,
            network: network || 'base',
            txHash: txHash || null,
            updatedAt: record.updatedAt,
          },
        },
        { merge: true },
      );
    }
  }

  return res.status(200).json({
    success: true,
    record,
    persisted: Boolean(admin),
  });
}
