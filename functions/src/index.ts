import crypto from "node:crypto";
import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { setGlobalOptions } from "firebase-functions";
import { onRequest } from "firebase-functions/https";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";

setGlobalOptions({ maxInstances: 10 });

const DEFAULT_ALLOWED_CHAIN_IDS = ["8453", "84532"];

const requireNonceSecret = () => {
  const secret = process.env.SIWE_NONCE_SECRET?.trim();
  if (!secret) {
    throw new Error("SIWE_NONCE_SECRET is required.");
  }
  return secret;
};

const normalizeHost = (value: string | undefined) => {
  if (!value) return "";
  const raw = value.trim();
  if (!raw) return "";

  try {
    return new URL(raw.includes("://") ? raw : `https://${raw}`).host.toLowerCase();
  } catch {
    return raw.replace(/^https?:\/\//i, "").replace(/\/.*$/, "").toLowerCase();
  }
};

const getExpectedHost = (requestHost?: string) =>
  normalizeHost(process.env.APP_DOMAIN || process.env.SIWE_ALLOWED_DOMAIN || requestHost || "");

const getAllowedChainIds = () => {
  const configured = process.env.ALLOWED_SIWE_CHAIN_IDS?.split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return configured?.length ? configured : DEFAULT_ALLOWED_CHAIN_IDS;
};

const extractLine = (message: string, label: string) =>
  message.match(new RegExp(`^${label}:\\s*(.+)$`, "im"))?.[1]?.trim() || "";

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

const applyCors = (
  request: { headers: { host?: string; origin?: string } },
  response: { set: (header: string, value: string) => void },
) => {
  const expectedHost = getExpectedHost(request.headers.host);
  const origin = request.headers.origin || "";
  const originHost = normalizeHost(origin);
  const allowedOrigin =
    expectedHost && originHost === expectedHost
      ? origin
      : expectedHost
        ? `https://${expectedHost}`
        : "*";

  response.set("Access-Control-Allow-Origin", allowedOrigin);
  response.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
};

const buildNonceSignature = (rawNonce: string, expiresAt: number) =>
  crypto
    .createHmac("sha256", requireNonceSecret())
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
  extractLine(message, "Nonce") || null;

const extractChainIdFromMessage = (message: string) => extractLine(message, "Chain ID");

const extractHostFromMessage = (message: string) => {
  const domain = normalizeHost(extractLine(message, "Domain"));
  if (domain) {
    return domain;
  }
  return normalizeHost(extractLine(message, "URI"));
};

const validateNonce = (nonce: string) => {
  const match = nonce.match(/^([a-f0-9]+)_([0-9]+)_([a-f0-9]+)$/i);

  if (!match) {
    return { ok: false, error: "Invalid SIWE nonce format." };
  }

  const [, rawNonce, expiresAtRaw, signature] = match;
  const expiresAt = Number(expiresAtRaw);

  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) {
    return { ok: false, error: "Invalid or expired SIWE nonce." };
  }

  const expected = buildNonceSignature(rawNonce, expiresAt);
  if (expected.length !== signature.length) {
    return { ok: false, error: "Invalid SIWE nonce signature." };
  }

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return { ok: false, error: "Invalid SIWE nonce signature." };
  }

  return { ok: true, nonceId: rawNonce, expiresAt };
};

const buildWalletUid = (address: string) =>
  `base_${address.toLowerCase().replace(/^0x/, "")}`;

export const authNonce = onRequest(async (request, response) => {
  applyCors(request, response);

  if (request.method === "OPTIONS") {
    response.status(204).send("");
    return;
  }

  if (request.method !== "GET") {
    response.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  try {
    const admin = ensureAdmin();
    const payload = createNoncePayload();
    const [nonceId] = payload.nonce.split("_");
    await admin.firestore.collection("siwe_nonces").doc(nonceId).set({
      host: getExpectedHost(request.headers.host),
      expiresAt: payload.expiresAt,
      issuedAt: new Date().toISOString(),
      usedAt: null,
    });
    response.status(200).json(payload);
  } catch (error) {
    response.status(503).json({ error: error instanceof Error ? error.message : "Unable to issue SIWE nonce." });
  }
});

export const authVerify = onRequest(async (request, response) => {
  applyCors(request, response);

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
  if (!nonce) {
    response.status(400).json({ error: "Invalid or expired SIWE nonce." });
    return;
  }

  const nonceValidation = validateNonce(nonce);
  if (!nonceValidation.ok) {
    response.status(400).json({ error: nonceValidation.error });
    return;
  }

  const messageHost = extractHostFromMessage(String(message));
  const expectedHost = getExpectedHost(request.headers.host);
  if (!messageHost || !expectedHost || messageHost !== expectedHost) {
    response.status(400).json({ error: "SIWE domain mismatch." });
    return;
  }

  const chainId = extractChainIdFromMessage(String(message));
  if (!chainId || !getAllowedChainIds().includes(String(chainId))) {
    response.status(400).json({ error: "Unsupported SIWE chain." });
    return;
  }

  let admin;
  try {
    admin = ensureAdmin();
  } catch (error) {
    response.status(503).json({ error: error instanceof Error ? error.message : "Firebase Admin is unavailable." });
    return;
  }

  const nonceRef = admin.firestore.collection("siwe_nonces").doc(nonceValidation.nonceId);
  try {
    await admin.firestore.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(nonceRef);
      if (!snapshot.exists) {
        throw new Error("Unknown SIWE nonce.");
      }

      const data = snapshot.data() || {};
      if (data.usedAt) {
        throw new Error("SIWE nonce replay detected.");
      }
      if (Number(data.expiresAt || 0) < Date.now()) {
        throw new Error("SIWE nonce expired before verification.");
      }
      if (normalizeHost(String(data.host || "")) !== expectedHost) {
        throw new Error("SIWE nonce host mismatch.");
      }

      transaction.update(nonceRef, {
        usedAt: new Date().toISOString(),
        usedByHost: expectedHost,
      });
    });
  } catch (error) {
    response.status(400).json({ error: error instanceof Error ? error.message : "Unable to validate SIWE nonce." });
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
    chainId: `0x${Number(chainId).toString(16)}`,
    customToken,
    authMode: "base",
    baseAppInstalledAt,
  });
});

export const paymentsReconcile = onRequest(async (request, response) => {
  applyCors(request, response);

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
