export type LiveTransactionStatus = 'Completed' | 'Pending Review' | 'Blocked';

export interface LiveSummary {
  thirtyDayVolumeUsd: number;
  activeAgents: number;
  pendingSignatures: number;
  settledCount: number;
  blockedCount: number;
  lastSyncedAt?: string;
}

export interface ThroughputPoint {
  date: string;
  volume: number;
  count: number;
}

export interface LiveTransactionRecord {
  id: string;
  agent: string;
  userId: string;
  network: string;
  target: string;
  itemDetails: string;
  amount: number;
  statusRaw: string;
  statusUi: LiveTransactionStatus;
  reasoning: string;
  gas: string;
  contract: string;
  payload: string;
  timeline: string[];
  createdAt?: string;
  updatedAt?: string;
  policyReason: string;
  requestedAction: string;
  policyRule: string;
}

export const emptySummary: LiveSummary = {
  thirtyDayVolumeUsd: 0,
  activeAgents: 0,
  pendingSignatures: 0,
  settledCount: 0,
  blockedCount: 0,
};

export const deriveStatusUi = (rawStatus: string): LiveTransactionStatus => {
  const normalized = rawStatus.toUpperCase();

  if (
    normalized.includes('REJECT') ||
    normalized.includes('FAILED') ||
    normalized.includes('HALT') ||
    normalized.includes('BLOCK')
  ) {
    return 'Blocked';
  }

  if (
    normalized.includes('SETTLED') ||
    normalized.includes('VERIFY') ||
    normalized.includes('SUCCESS') ||
    normalized.includes('FULLY_SIGNED') ||
    normalized.includes('APPROVED')
  ) {
    return 'Completed';
  }

  return 'Pending Review';
};

export const formatRelativeTime = (value?: string) => {
  if (!value) {
    return 'Awaiting sync';
  }

  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) {
    return 'Awaiting sync';
  }

  const diffMs = Date.now() - timestamp;
  const diffMinutes = Math.max(1, Math.round(diffMs / 60000));

  if (diffMinutes < 60) {
    return `${diffMinutes} mins ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hours ago`;
  }

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} days ago`;
};

const normalizeTimeline = (timeline: unknown) => {
  if (!Array.isArray(timeline)) {
    return [];
  }

  return timeline
    .filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
    .slice(0, 8);
};

const normalizeString = (value: unknown, fallback = '') =>
  typeof value === 'string' && value.trim().length > 0 ? value : fallback;

const normalizeNumber = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : 0);

export const mapTransactionsRecord = (record: Record<string, unknown> | null | undefined): LiveTransactionRecord[] => {
  if (!record) {
    return [];
  }

  return Object.entries(record)
    .map(([id, value]) => {
      const entry = (value || {}) as Record<string, unknown>;
      const statusRaw = normalizeString(entry.statusRaw, normalizeString(entry.status, 'PENDING'));
      const statusUi = deriveStatusUi(normalizeString(entry.statusUi, statusRaw));
      const itemDetails = normalizeString(entry.itemDetails, normalizeString(entry.requestedAction, 'Pending gateway action'));
      const reasoning = normalizeString(
        entry.reasoning,
        statusUi === 'Blocked'
          ? 'This transaction was halted before settlement.'
          : statusUi === 'Completed'
            ? 'Gateway lifecycle completed and synced from Firebase.'
            : 'Awaiting signature or additional policy review.',
      );

      return {
        id,
        agent: normalizeString(entry.agent, 'Gateway Runtime'),
        userId: normalizeString(entry.userId, 'system'),
        network: normalizeString(entry.network, 'Unassigned'),
        target: normalizeString(entry.target, 'Policy-controlled route'),
        itemDetails,
        amount: normalizeNumber(entry.amount),
        statusRaw,
        statusUi,
        reasoning,
        gas: normalizeString(entry.gas, 'Policy-controlled'),
        contract: normalizeString(entry.contract, 'Not provided'),
        payload: normalizeString(entry.payload, '{}'),
        timeline: normalizeTimeline(entry.timeline),
        createdAt: normalizeString(entry.createdAt) || undefined,
        updatedAt: normalizeString(entry.updatedAt) || undefined,
        policyReason: normalizeString(entry.policyReason, reasoning),
        requestedAction: normalizeString(entry.requestedAction, itemDetails),
        policyRule: normalizeString(
          entry.policyRule,
          statusUi === 'Pending Review'
            ? 'Transaction is waiting for required review or signature.'
            : 'Lifecycle record derived from the gateway audit trail.',
        ),
      };
    })
    .sort((a, b) => {
      const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return bTime - aTime;
    });
};

export const mapSummaryRecord = (record: Record<string, unknown> | null | undefined): LiveSummary => ({
  thirtyDayVolumeUsd: normalizeNumber(record?.thirtyDayVolumeUsd),
  activeAgents: normalizeNumber(record?.activeAgents),
  pendingSignatures: normalizeNumber(record?.pendingSignatures),
  settledCount: normalizeNumber(record?.settledCount),
  blockedCount: normalizeNumber(record?.blockedCount),
  lastSyncedAt: normalizeString(record?.lastSyncedAt) || undefined,
});

export const mapThroughputRecord = (record: Record<string, unknown> | null | undefined): ThroughputPoint[] => {
  if (!record) {
    return [];
  }

  return Object.entries(record)
    .map(([date, value]) => {
      const entry = (value || {}) as Record<string, unknown>;
      return {
        date,
        volume: normalizeNumber(entry.volumeUsd),
        count: normalizeNumber(entry.count),
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((entry) => ({
      ...entry,
      date: new Date(`${entry.date}T00:00:00Z`).toLocaleDateString(undefined, {
        month: 'short',
        day: '2-digit',
      }),
    }));
};
