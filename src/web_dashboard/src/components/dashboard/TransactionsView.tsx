import { Fragment, useMemo, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, ChevronDown, ChevronUp, Search, SlidersHorizontal } from 'lucide-react';
import ApprovalModal from './ApprovalModal';
import StatusBadge from '../ui/StatusBadge';

type TransactionStatus = 'Completed' | 'Pending Review' | 'Blocked';

type Transaction = {
  id: string;
  agent: string;
  network: string;
  amount: number;
  status: TransactionStatus;
  time: string;
  type: 'out' | 'in';
  reasoning: string;
  fullReasoning: string;
  gas: string;
  policyReason: string;
  requestedAction: string;
  policyRule: string;
  contract: string;
  payload: string;
  timeline: string[];
};

const mockTransactions: Transaction[] = [
  {
    id: 'tx-8891',
    agent: 'Arbitrage Bot v2',
    network: 'Arbitrum',
    amount: 450.0,
    status: 'Completed',
    time: '10 mins ago',
    type: 'out',
    reasoning: 'Identified 2.1% spread across DEXs',
    fullReasoning: 'Agent detected a stable cross-DEX spread, simulated slippage under policy max, and submitted a capped notional rebalance.',
    gas: '0.0001 ETH',
    policyReason: 'Within approved notional and route constraints.',
    requestedAction: 'Swap USDC -> ETH via approved DEX route',
    policyRule: 'Daily limit and domain whitelist passed.',
    contract: '0x7fA4...b1c9',
    payload: '{ "route": "arb-v2", "slippage_bps": 18, "amount_usd": 450 }',
    timeline: ['Intent proposed', 'Route simulated', 'Guardrails passed', 'Transaction settled'],
  },
  {
    id: 'tx-8892',
    agent: 'Yield Farmer',
    network: 'Base',
    amount: 1200.5,
    status: 'Pending Review',
    time: '1 hour ago',
    type: 'out',
    reasoning: 'Rebalancing portfolio to optimize APY',
    fullReasoning: 'Agent compared current LP positions against target yield policy and recommended a rebalance into a higher APY pool with acceptable impermanent-loss exposure.',
    gas: '0.0005 ETH',
    policyReason: 'Requested rebalance exceeds autonomous allowance threshold.',
    requestedAction: 'Move USDC from reserve wallet into yield position',
    policyRule: 'Manual signature required above configured daily automated volume.',
    contract: '0x4eA2...af02',
    payload: '{ "vault": "yield-farm-2", "rebalance_to": "usdc-pool", "amount_usd": 1200.5 }',
    timeline: ['Intent proposed', 'Policy threshold hit', 'Awaiting human signature'],
  },
  {
    id: 'tx-8893',
    agent: 'Treasury Manager',
    network: 'Ethereum',
    amount: 8000.0,
    status: 'Blocked',
    time: '3 hours ago',
    type: 'out',
    reasoning: 'Amount exceeds daily transaction limit',
    fullReasoning: 'Agent attempted to initiate a large treasury transfer outside the configured automated envelope and the gateway halted execution before signature orchestration.',
    gas: '0.002 ETH',
    policyReason: 'Transaction exceeds daily limit of $5,000.',
    requestedAction: 'Transfer treasury reserves to settlement address',
    policyRule: 'Hard stop above policy ceiling.',
    contract: '0x91d4...de54',
    payload: '{ "destination": "settlement-vault", "amount_usd": 8000, "justification": "treasury movement" }',
    timeline: ['Intent proposed', 'Ceiling breached', 'Execution halted', 'Review required'],
  },
  {
    id: 'tx-8894',
    agent: 'Flash Loan Exec',
    network: 'Polygon',
    amount: 15.0,
    status: 'Completed',
    time: '5 hours ago',
    type: 'in',
    reasoning: 'Liquidated undercollateralized position',
    fullReasoning: 'Agent detected a liquidation window inside policy, executed a low-notional recovery step, and returned proceeds to the designated wallet.',
    gas: '0.05 MATIC',
    policyReason: 'Allowed by policy.',
    requestedAction: 'Liquidation event settlement',
    policyRule: 'Under threshold and approved contract domain.',
    contract: '0x3dc0...8fe1',
    payload: '{ "liquidation": true, "profit_usd": 15, "network": "polygon" }',
    timeline: ['Intent proposed', 'Policy passed', 'Transaction settled'],
  },
];

export default function TransactionsView() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | TransactionStatus>('All');
  const [expanded, setExpanded] = useState<string | null>('tx-8892');
  const [selected, setSelected] = useState<Transaction | null>(null);

  const filtered = useMemo(() => {
    return mockTransactions.filter((tx) => {
      const matchesSearch =
        tx.id.toLowerCase().includes(search.toLowerCase()) ||
        tx.agent.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All' || tx.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  return (
    <>
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="table-shell">
          <div className="border-b border-defi-border px-8 py-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-white tracking-tight">On-Chain Activity</h2>
                <p className="mt-2 text-sm text-defi-muted">Searchable audit visibility with expandable reasoning, payloads, and review context.</p>
              </div>

              <div className="flex flex-col gap-3 md:flex-row">
                <label className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-defi-muted" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search TX hash or agent"
                    className="input-chrome w-full min-w-[260px] pl-11 font-mono text-sm"
                  />
                </label>

                <label className="flex items-center gap-3 rounded-xl border border-defi-border bg-[#0f1319] px-4 py-3">
                  <SlidersHorizontal className="h-4 w-4 text-defi-muted" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as 'All' | TransactionStatus)}
                    className="bg-transparent font-mono text-sm text-white"
                  >
                    <option>All</option>
                    <option>Completed</option>
                    <option>Pending Review</option>
                    <option>Blocked</option>
                  </select>
                </label>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-black/20">
                <tr className="text-left text-xs font-mono uppercase tracking-[0.22em] text-defi-muted">
                  <th className="px-8 py-4">Transaction ID</th>
                  <th className="px-8 py-4">Agent / Network</th>
                  <th className="px-8 py-4">Amount (USD)</th>
                  <th className="px-8 py-4">Agent Reasoning & Gas</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4">Time</th>
                  <th className="px-8 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tx) => {
                  const isExpanded = expanded === tx.id;
                  return (
                    <Fragment key={tx.id}>
                      <tr className="table-row-hover border-t border-defi-border">
                        <td className="whitespace-nowrap px-8 py-5 text-sm font-mono text-defi-beige">{tx.id}</td>
                        <td className="whitespace-nowrap px-8 py-5">
                          <div className="text-sm font-semibold text-gray-100">{tx.agent}</div>
                          <div className="text-xs font-mono text-defi-muted">{tx.network}</div>
                        </td>
                        <td className="whitespace-nowrap px-8 py-5">
                          <div className={`flex items-center text-sm font-mono ${tx.type === 'in' ? 'text-defi-emerald' : 'text-gray-300'}`}>
                            {tx.type === 'in' ? <ArrowDownRight className="mr-1 h-4 w-4 text-defi-emerald" /> : <ArrowUpRight className="mr-1 h-4 w-4 text-defi-goldBright" />}
                            ${tx.amount.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="max-w-xs text-sm text-gray-200" title={tx.fullReasoning}>{tx.reasoning}</div>
                          <div className="mt-1 text-xs font-mono text-defi-amber/90">Gas Used: {tx.gas}</div>
                        </td>
                        <td className="whitespace-nowrap px-8 py-5">
                          <StatusBadge status={tx.status} />
                        </td>
                        <td className="whitespace-nowrap px-8 py-5 text-sm font-mono text-defi-muted">{tx.time}</td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex items-center justify-end gap-3">
                            {(tx.status === 'Pending Review' || tx.status === 'Blocked') && (
                              <button onClick={() => setSelected(tx)} className="button-secondary px-3 py-2 text-xs font-mono">
                                Review
                              </button>
                            )}
                            <button
                              onClick={() => setExpanded(isExpanded ? null : tx.id)}
                              className="rounded-full border border-defi-border bg-white/5 p-2 text-defi-muted transition hover:border-defi-borderStrong hover:text-white"
                            >
                              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="border-t border-defi-border bg-black/20">
                          <td colSpan={7} className="px-8 py-6">
                            <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                              <div className="rounded-2xl border border-defi-border bg-black/20 p-5">
                                <p className="text-xs font-mono uppercase tracking-[0.22em] text-defi-muted">Decision timeline</p>
                                <ol className="mt-4 space-y-3">
                                  {tx.timeline.map((step) => (
                                    <li key={step} className="flex items-start gap-3 text-sm text-defi-cream">
                                      <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-defi-goldBright" />
                                      {step}
                                    </li>
                                  ))}
                                </ol>
                              </div>

                              <div className="grid gap-6">
                                <div className="rounded-2xl border border-defi-border bg-black/20 p-5">
                                  <p className="text-xs font-mono uppercase tracking-[0.22em] text-defi-muted">Smart contract</p>
                                  <p className="mt-3 font-mono text-sm text-white">{tx.contract}</p>
                                </div>
                                <div className="rounded-2xl border border-defi-border bg-[#0d1116] p-5">
                                  <p className="text-xs font-mono uppercase tracking-[0.22em] text-defi-muted">JSON payload</p>
                                  <pre className="mt-3 overflow-x-auto text-xs font-mono leading-6 text-defi-beige">
                                    <code>{tx.payload}</code>
                                  </pre>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-defi-border bg-black/20 px-8 py-4">
            <span className="text-sm font-mono text-defi-muted">Showing {filtered.length} of {mockTransactions.length} transactions</span>
            <div className="text-xs font-mono text-defi-muted">Expandable payloads and modal review are UI-only.</div>
          </div>
        </div>
      </div>

      <ApprovalModal transaction={selected} onClose={() => setSelected(null)} />
    </>
  );
}
