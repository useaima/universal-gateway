import { AlertTriangle, ArrowRightLeft, ShieldAlert, X } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';

interface ApprovalTransaction {
  id: string;
  agent: string;
  network: string;
  amount: number;
  status: 'Completed' | 'Pending Review' | 'Blocked';
  reasoning: string;
  policyReason: string;
  requestedAction: string;
  policyRule: string;
  gas: string;
}

interface ApprovalModalProps {
  transaction: ApprovalTransaction | null;
  onClose: () => void;
}

export default function ApprovalModal({ transaction, onClose }: ApprovalModalProps) {
  if (!transaction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-md">
      <div className="section-panel relative w-full max-w-4xl p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full border border-defi-border bg-white/5 p-2 text-defi-muted transition hover:border-defi-borderStrong hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="eyebrow mb-4">
              <ShieldAlert className="h-4 w-4 text-defi-amber" />
              Human-in-the-Loop Interruption
            </div>
            <h2 className="text-3xl font-semibold text-white">Signature Required</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-defi-muted">
              The Safety Sandwich halted this transaction before settlement. Review the request and
              policy breakdown below.
            </p>
          </div>
          <StatusBadge status={transaction.status} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-defi-border bg-black/20 p-5">
              <p className="text-xs font-mono uppercase tracking-[0.22em] text-defi-beige">Flag reason</p>
              <div className="mt-3 flex items-start gap-3">
                <AlertTriangle className="mt-1 h-5 w-5 text-defi-amber" />
                <p className="text-sm leading-6 text-defi-cream">{transaction.policyReason}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-defi-border bg-black/20 p-5">
                <p className="text-xs font-mono uppercase tracking-[0.22em] text-defi-muted">Agent request</p>
                <div className="mt-4 space-y-3 text-sm text-defi-cream">
                  <div>
                    <p className="text-defi-muted">Agent</p>
                    <p className="font-medium text-white">{transaction.agent}</p>
                  </div>
                  <div>
                    <p className="text-defi-muted">Action</p>
                    <p className="font-medium text-white">{transaction.requestedAction}</p>
                  </div>
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="text-defi-muted">Network</p>
                      <p className="font-medium text-white">{transaction.network}</p>
                    </div>
                    <div>
                      <p className="text-defi-muted">Estimated Gas</p>
                      <p className="font-mono text-defi-goldBright">{transaction.gas}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-defi-border bg-black/20 p-5">
                <p className="text-xs font-mono uppercase tracking-[0.22em] text-defi-muted">Protocol policy</p>
                <div className="mt-4 space-y-3 text-sm text-defi-cream">
                  <div>
                    <p className="text-defi-muted">Rule triggered</p>
                    <p className="font-medium text-white">{transaction.policyRule}</p>
                  </div>
                  <div>
                    <p className="text-defi-muted">Review path</p>
                    <p className="font-medium text-white">Manual signature + on-chain approval</p>
                  </div>
                  <div>
                    <p className="text-defi-muted">Transaction ID</p>
                    <p className="font-mono text-xs text-defi-beige">{transaction.id}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-defi-border bg-[linear-gradient(180deg,rgba(207,169,93,0.09),rgba(207,169,93,0.02))] p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-defi-gold/30 bg-defi-gold/10 p-3 text-defi-goldBright">
                <ArrowRightLeft className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-mono uppercase tracking-[0.22em] text-defi-muted">Requested notional</p>
                <p className="text-3xl font-semibold text-white">${transaction.amount.toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-defi-border bg-black/20 p-4">
              <p className="text-xs font-mono uppercase tracking-[0.22em] text-defi-muted">Agent reasoning</p>
              <p className="mt-3 text-sm leading-6 text-defi-cream">{transaction.reasoning}</p>
            </div>

            <div className="mt-8 grid gap-3">
              <button type="button" className="button-primary w-full">
                Approve & Sign
              </button>
              <button
                type="button"
                className="inline-flex w-full items-center justify-center rounded-xl border border-defi-crimson/35 bg-defi-crimson/10 px-5 py-3 font-medium text-defi-crimson transition hover:-translate-y-0.5 hover:bg-defi-crimson/15"
              >
                Reject & Halt
              </button>
              <p className="text-center text-xs font-mono text-defi-muted">
                Demo UI only. No wallet or backend action is triggered here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
