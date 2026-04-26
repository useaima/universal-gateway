import { Fragment, useEffect, useMemo, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, ChevronDown, ChevronUp, Search, SlidersHorizontal } from 'lucide-react';
import { onValue, ref } from 'firebase/database';
import ApprovalModal from './ApprovalModal';
import StatusBadge from '../ui/StatusBadge';
import { rtdb } from '../../lib/firebase';
import { formatRelativeTime, mapTransactionsRecord, type LiveTransactionRecord, type LiveTransactionStatus } from '../../lib/liveDashboard';

export default function TransactionsView() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | LiveTransactionStatus>('All');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [selected, setSelected] = useState<LiveTransactionRecord | null>(null);
  const [transactions, setTransactions] = useState<LiveTransactionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const transactionsRef = ref(rtdb, 'dashboard_live/transactions');
    const stop = onValue(transactionsRef, (snapshot) => {
      const next = mapTransactionsRecord(snapshot.val());
      setTransactions(next);
      setExpanded((current) => current || next.find((entry) => entry.statusUi === 'Pending Review')?.id || next[0]?.id || null);
      setIsLoading(false);
    });

    return () => stop();
  }, []);

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      const haystack = `${tx.id} ${tx.agent} ${tx.network} ${tx.target}`.toLowerCase();
      const matchesSearch = haystack.includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All' || tx.statusUi === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter, transactions]);

  return (
    <>
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="table-shell">
          <div className="border-b border-defi-border px-8 py-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-white">On-Chain Activity</h2>
                <p className="mt-2 text-sm text-defi-muted">
                  Searchable audit visibility with expandable reasoning, payloads, and review context from Firebase Realtime Database.
                </p>
              </div>

              <div className="flex flex-col gap-3 md:flex-row">
                <label className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-defi-muted" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search TX, agent, network, or target"
                    className="input-chrome w-full min-w-[260px] pl-11 font-mono text-sm"
                  />
                </label>

                <label className="flex items-center gap-3 rounded-xl border border-defi-border bg-[#0f1319] px-4 py-3">
                  <SlidersHorizontal className="h-4 w-4 text-defi-muted" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as 'All' | LiveTransactionStatus)}
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
                  <th className="px-8 py-4" />
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <tr key={`skeleton-${index}`} className="border-t border-defi-border">
                      <td colSpan={7} className="px-8 py-6">
                        <div className="skeleton-bar h-12 w-full" />
                      </td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr className="border-t border-defi-border">
                    <td colSpan={7} className="px-8 py-10 text-center text-sm text-defi-muted">
                      No live transactions matched the current filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((tx) => {
                    const isExpanded = expanded === tx.id;
                    return (
                      <Fragment key={tx.id}>
                        <tr className="table-row-hover border-t border-defi-border">
                          <td className="whitespace-nowrap px-8 py-5 text-sm font-mono text-defi-beige">{tx.id}</td>
                          <td className="px-8 py-5">
                            <div className="text-sm font-semibold text-gray-100">{tx.agent}</div>
                            <div className="text-xs font-mono text-defi-muted">{tx.network}</div>
                          </td>
                          <td className="whitespace-nowrap px-8 py-5">
                            <div className={`flex items-center text-sm font-mono ${tx.statusUi === 'Completed' ? 'text-defi-emerald' : 'text-gray-300'}`}>
                              {tx.statusUi === 'Completed' ? <ArrowDownRight className="mr-1 h-4 w-4 text-defi-emerald" /> : <ArrowUpRight className="mr-1 h-4 w-4 text-defi-goldBright" />}
                              ${tx.amount.toFixed(2)}
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="max-w-xs text-sm text-gray-200" title={tx.reasoning}>{tx.reasoning}</div>
                            <div className="mt-1 text-xs font-mono text-defi-amber/90">Gas Used: {tx.gas}</div>
                          </td>
                          <td className="whitespace-nowrap px-8 py-5">
                            <StatusBadge status={tx.statusUi} />
                          </td>
                          <td className="whitespace-nowrap px-8 py-5 text-sm font-mono text-defi-muted">
                            {formatRelativeTime(tx.updatedAt || tx.createdAt)}
                          </td>
                          <td className="px-8 py-5 text-right">
                            <div className="flex items-center justify-end gap-3">
                              {(tx.statusUi === 'Pending Review' || tx.statusUi === 'Blocked') && (
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
                                    {(tx.timeline.length > 0 ? tx.timeline : ['Waiting for synced gateway milestones']).map((step) => (
                                      <li key={step} className="flex items-start gap-3 text-sm text-defi-cream">
                                        <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-defi-goldBright" />
                                        {step}
                                      </li>
                                    ))}
                                  </ol>
                                </div>

                                <div className="grid gap-6">
                                  <div className="rounded-2xl border border-defi-border bg-black/20 p-5">
                                    <p className="text-xs font-mono uppercase tracking-[0.22em] text-defi-muted">Target / contract</p>
                                    <p className="mt-3 font-mono text-sm text-white">{tx.contract !== 'Not provided' ? tx.contract : tx.target}</p>
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
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-defi-border bg-black/20 px-8 py-4">
            <span className="text-sm font-mono text-defi-muted">Showing {filtered.length} of {transactions.length} transactions</span>
            <div className="text-xs font-mono text-defi-muted">Live sync source: Firebase Realtime Database</div>
          </div>
        </div>
      </div>

      <ApprovalModal transaction={selected} onClose={() => setSelected(null)} />
    </>
  );
}
