import crypto from "node:crypto";
import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { setGlobalOptions } from "firebase-functions";
import { onRequest } from "firebase-functions/https";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";

setGlobalOptions({ maxInstances: 10 });

const nonceSecret =
  process.env.SIWE_NONCE_SECRET ||
  process.env.RECAPTCHA_SITE_KEY ||
  process.env.FIREBASE_PROJECT_ID ||
  "utg-base-auth";

const appDomain = process.env.APP_DOMAIN || "";

const baseClient = createPublicClient({
  chain: base,
  transport: http(base.rpcUrls.default.http[0]),
});

const ensureAdmin = () => {
  if (!getApps().length) {
    initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT_ID,
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
  }

  return {
    auth: getAuth(),
    firestore: getFirestore(),
  };
};

const applyCors = (response: { set: (header: string, value: string) => void }) => {
  response.set("Access-Control-Allow-Origin", "*");
  response.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
};

const buildNonceSignature = (rawNonce: string, expiresAt: number) =>
  crypto
    .createHmac("sha256", nonceSecret)
    .update(`${rawNonce}:${expiresAt}`)
    .digest("hex");

const createNoncePayload = () => {
  const rawNonce = crypto.randomBytes(16).toString("hex");
  const expiresAt = Date.now() + 5 * 60 * 1000;
  const signature = buildNonceSignature(rawNonce, expiresAt);
  return {
    nonce: `${rawNonce}_${expiresAt}_${signature}`,
    expiresAt,
  };
};

const extractNonceFromMessage = (message: string) =>
  message.match(/Nonce:\s+([A-Za-z0-9_]+)/)?.[1] || null;

const validateNonce = (nonce: string) => {
  const match = nonce.match(/^([a-f0-9]+)_([0-9]+)_([a-f0-9]+)$/i);

  if (!match) {
    return false;
  }

  const [, rawNonce, expiresAtRaw, signature] = match;
  const expiresAt = Number(expiresAtRaw);

  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) {
    return false;
  }

  const expected = buildNonceSignature(rawNonce, expiresAt);
  if (expected.length !== signature.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
};

const buildWalletUid = (address: string) =>
  `base_${address.toLowerCase().replace(/^0x/, "")}`;

export const authNonce = onRequest((request, response) => {
  applyCors(response);

  if (request.method === "OPTIONS") {
    response.status(204).send("");
    return;
  }

  if (request.method !== "GET") {
    response.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  response.status(200).json(createNoncePayload());
});

export const authVerify = onRequest(async (request, response) => {
  applyCors(response);

  if (request.method === "OPTIONS") {
    response.status(204).send("");
    return;
  }

  if (request.method !== "POST") {
    response.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  const { address, message, signature } = request.body || {};

  if (!address || !message || !signature) {
    response.status(400).json({ error: "Missing address, message, or signature." });
    return;
  }

  const nonce = extractNonceFromMessage(String(message));
  if (!nonce || !validateNonce(nonce)) {
    response.status(400).json({ error: "Invalid or expired SIWE nonce." });
    return;
  }

  const expectedHost = appDomain || request.headers.host || "";
  if (expectedHost && !String(message).includes(String(expectedHost))) {
    response.status(400).json({ error: "SIWE domain mismatch." });
    return;
  }

  const valid = await baseClient.verifyMessage({
    address,
    message,
    signature,
  });

  if (!valid) {
    response.status(401).json({ error: "Signature verification failed." });
    return;
  }

  const admin = ensureAdmin();
  const uid = buildWalletUid(address);
  const baseAppInstalledAt = new Date().toISOString();
  const customToken = await admin.auth.createCustomToken(uid, {
    authMode: "base",
    primaryWallet: address,
    network: "base",
  });

  await admin.firestore.collection("users").doc(uid).set(
    {
      authMode: "base",
      authProvider: "base",
      primaryWallet: address,
      walletAddress: address,
      evmAddresses: [address],
      baseAppInstalledAt,
      lastLoginAt: baseAppInstalledAt,
    },
    { merge: true },
  );

  response.status(200).json({
    address,
    chainId: "0x2105",
    customToken,
    authMode: "base",
    baseAppInstalledAt,
  });
});

export const paymentsReconcile = onRequest(async (request, response) => {
  applyCors(response);

  if (request.method === "OPTIONS") {
    response.status(204).send("");
    return;
  }

  if (request.method !== "POST") {
    response.status(405).json({ error: "Method Not Allowed" });
    return;
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
  } = request.body || {};

  if (!paymentId || !status) {
    response.status(400).json({ error: "Missing paymentId or status." });
    return;
  }

  const updatedAt = new Date().toISOString();
  const record = {
    paymentId,
    status,
    amount: amount || null,
    asset: asset || "USDC",
    network: network || "base",
    txHash: txHash || null,
    walletAddress: walletAddress || null,
    metadata: metadata || {},
    updatedAt,
  };

  const admin = ensureAdmin();
  await admin.firestore.collection("payment_reconciliation").doc(String(paymentId)).set(record, {
    merge: true,
  });

  if (userId) {
    await admin.firestore.collection("users").doc(String(userId)).set(
      {
        lastPaymentReference: {
          paymentId,
          status,
          amount: amount || null,
          network: network || "base",
          txHash: txHash || null,
          updatedAt,
        },
      },
      { merge: true },
    );
  }

  response.status(200).json({
    success: true,
    record,
    persisted: true,
  });
});
