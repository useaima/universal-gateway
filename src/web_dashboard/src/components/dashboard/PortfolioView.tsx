import { useEffect, useMemo, useState } from 'react';
import { ArrowDownUp, Coins, Wallet, Link2 } from 'lucide-react';
import type { UserProgress } from '../../lib/userProgress';
import {
  buildPortfolioSummary,
  fetchEvmPortfolioAssets,
  observePortfolioLive,
  type PortfolioAsset,
  type PortfolioSummary,
} from '../../lib/portfolioLive';

interface PortfolioViewProps {
  walletAddress?: string;
  userProgress: UserProgress | null;
}

type SortKey = 'asset' | 'network' | 'balance' | 'usdValue' | 'source';

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-defi-border bg-black/10 px-5 py-8 text-center text-sm text-defi-muted">
      {message}
    </div>
  );
}

export default function PortfolioView({ walletAddress, userProgress }: PortfolioViewProps) {
  const [sortKey, setSortKey] = useState<SortKey>('usdValue');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [liveSummary, setLiveSummary] = useState<PortfolioSummary>({
    totalUsd: 0,
    pricedAssetCount: 0,
    partialPricing: false,
  });
  const [observerAssets, setObserverAssets] = useState<PortfolioAsset[]>([]);
  const [evmAssets, setEvmAssets] = useState<PortfolioAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const syncEvmAssets = async () => {
      try {
        const assets = await fetchEvmPortfolioAssets(walletAddress);
        if (!cancelled) {
          setEvmAssets(assets);
        }
      } catch (error) {
        console.warn('UTG: Failed to fetch EVM portfolio assets.', error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void syncEvmAssets();

    const stopObserver = observePortfolioLive((summary, assets) => {
      if (!cancelled) {
        setLiveSummary(summary);
        setObserverAssets(assets);
        setIsLoading(false);
      }
    });

    return () => {
      cancelled = true;
      stopObserver();
    };
  }, [walletAddress]);

  const assets = useMemo(() => {
    const byId = new Map<string, PortfolioAsset>();
    [...evmAssets, ...observerAssets].forEach((asset) => {
      byId.set(asset.id, asset);
    });
    return Array.from(byId.values());
  }, [evmAssets, observerAssets]);

  const summary = useMemo(() => buildPortfolioSummary(assets, liveSummary), [assets, liveSummary]);

  const allocation = useMemo(() => {
    const priced = assets.filter((asset) => asset.usdValue !== null && asset.usdValue > 0);
    const denominator = priced.reduce((sum, asset) => sum + (asset.usdValue || 0), 0);

    return priced.map((asset, index) => ({
      ...asset,
      color: ['#f1cc7a', '#10b981', '#3b82f6', '#f59e0b'][index % 4],
      percent: denominator > 0 ? ((asset.usdValue || 0) / denominator) * 100 : 0,
    }));
  }, [assets]);

  const gradient =
    allocation.length > 0
      ? `conic-gradient(${allocation
          .map((item, index) => {
            const previous = allocation.slice(0, index).reduce((sum, entry) => sum + entry.percent, 0);
            const end = previous + item.percent;
            return `${item.color} ${previous}% ${end}%`;
          })
          .join(', ')})`
      : 'conic-gradient(#2b3444 0% 100%)';

  const sorted = useMemo(() => {
    const data = [...assets];
    data.sort((a, b) => {
      const direction = sortDir === 'asc' ? 1 : -1;

      if (sortKey === 'asset') {
        return a.ticker.localeCompare(b.ticker) * direction;
      }

      if (sortKey === 'network') {
        return a.network.localeCompare(b.network) * direction;
      }

      if (sortKey === 'source') {
        return a.source.localeCompare(b.source) * direction;
      }

      const aValue = sortKey === 'usdValue' ? a.usdValue || 0 : a.balance;
      const bValue = sortKey === 'usdValue' ? b.usdValue || 0 : b.balance;
      return (aValue - bValue) * direction;
    });

    return data;
  }, [assets, sortDir, sortKey]);

  const setSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortKey(key);
    setSortDir(key === 'asset' || key === 'network' || key === 'source' ? 'asc' : 'desc');
  };

  const visibleNetworks = userProgress?.authorizedNetworks?.length
    ? userProgress.authorizedNetworks.join(', ')
    : 'Base, Ethereum';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="section-panel p-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <div className="eyebrow mb-4">
                <Wallet className="h-4 w-4 text-defi-goldBright" />
                Live cross-chain portfolio
              </div>
              <h2 className="text-3xl font-semibold text-white">Operator Asset Visibility</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-defi-muted">
                Base and Ethereum balances come from live EVM RPC reads. Bitcoin and Solana rows appear when the observer service publishes them into Firebase.
              </p>
            </div>
            <div className="rounded-2xl border border-defi-border bg-black/20 px-4 py-3 text-right">
              <p className="text-xs font-mono uppercase tracking-[0.22em] text-defi-muted">Enabled networks</p>
              <p className="mt-2 text-sm font-mono text-white">{visibleNetworks}</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-end gap-4">
            <div>
              <p className="text-xs font-mono uppercase tracking-[0.22em] text-defi-muted">Tracked priced notional</p>
              <p className="mt-2 text-5xl font-semibold text-white">
                ${summary.totalUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="rounded-2xl border border-defi-gold/20 bg-defi-gold/10 px-4 py-3 text-sm text-defi-goldBright">
              <div className="font-medium">{summary.pricedAssetCount} priced assets</div>
              <p className="mt-1 text-xs font-mono text-defi-muted">
                {summary.partialPricing
                  ? 'Partial TVL. Unpriced assets remain balance-only until a pricing source is configured.'
                  : 'All visible balances currently have in-app valuations.'}
              </p>
            </div>
          </div>
        </section>

        <section className="section-panel p-8">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-defi-border bg-white/5 p-3 text-defi-goldBright">
              <Coins className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-mono uppercase tracking-[0.22em] text-defi-muted">Allocation</p>
              <h3 className="text-xl font-semibold text-white">Priced asset mix</h3>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center gap-6 lg:flex-row">
            <div
              className="grid h-52 w-52 place-items-center rounded-full border border-defi-border"
              style={{ background: gradient }}
            >
              <div className="grid h-32 w-32 place-items-center rounded-full border border-defi-border bg-defi-darkSoft text-center">
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-defi-muted">TVL</span>
                <span className="text-xl font-semibold text-white">
                  ${summary.totalUsd >= 1000 ? `${(summary.totalUsd / 1000).toFixed(1)}k` : summary.totalUsd.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="w-full space-y-3">
              {allocation.length > 0 ? (
                allocation.map((asset) => (
                  <div key={asset.id} className="flex items-center justify-between rounded-2xl border border-defi-border bg-black/20 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: asset.color }} />
                      <div>
                        <p className="font-medium text-white">{asset.ticker}</p>
                        <p className="text-xs font-mono text-defi-muted">{asset.network}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm text-white">{asset.percent.toFixed(1)}%</p>
                      <p className="text-xs text-defi-muted">${(asset.usdValue || 0).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState message="No priced balances available yet. Base and Ethereum assets will appear here after wallet reads or observer sync." />
              )}
            </div>
          </div>
        </section>
      </div>

      <section className="table-shell">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-defi-border px-8 py-6">
          <div>
            <h3 className="text-2xl font-semibold text-white">Asset visibility table</h3>
            <p className="mt-1 text-sm text-defi-muted">Real balances only. Pricing remains explicit and partial when unsupported.</p>
          </div>
          <div className="button-secondary px-4 py-2 text-sm font-mono">
            <ArrowDownUp className="h-4 w-4" />
            Sort live data
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-black/20">
              <tr className="text-left text-xs font-mono uppercase tracking-[0.22em] text-defi-muted">
                {[
                  ['asset', 'Asset'],
                  ['network', 'Network'],
                  ['balance', 'Balance'],
                  ['usdValue', 'USD Value'],
                  ['source', 'Source'],
                ].map(([key, label]) => (
                  <th key={key} className="px-8 py-4">
                    <button onClick={() => setSort(key as SortKey)} className="inline-flex items-center gap-2 transition hover:text-white">
                      {label}
                      <ArrowDownUp className="h-3.5 w-3.5" />
                    </button>
                  </th>
                ))}
                <th className="px-8 py-4">Execution</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr className="border-t border-defi-border">
                  <td colSpan={6} className="px-8 py-8">
                    <div className="skeleton-bar h-12 w-full" />
                  </td>
                </tr>
              ) : sorted.length === 0 ? (
                <tr className="border-t border-defi-border">
                  <td colSpan={6} className="px-8 py-10">
                    <EmptyState message="No live balances are visible yet. Link an EVM wallet in onboarding and add Bitcoin or Solana observer addresses if you want read-only visibility there too." />
                  </td>
                </tr>
              ) : (
                sorted.map((asset) => (
                  <tr key={asset.id} className="table-row-hover border-t border-defi-border text-sm">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-full border border-defi-border bg-white/5 font-semibold text-white">
                          {asset.ticker.slice(0, 1)}
                        </div>
                        <div>
                          <p className="font-medium text-white">{asset.asset}</p>
                          <p className="text-xs font-mono text-defi-muted">{asset.ticker}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 font-mono text-defi-cream">{asset.network}</td>
                    <td className="px-8 py-5 font-mono text-white">{asset.balanceDisplay}</td>
                    <td className="px-8 py-5">
                      <div className="font-mono text-white">
                        {asset.usdValue !== null
                          ? `$${asset.usdValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                          : 'Unavailable'}
                      </div>
                      <div className="mt-1 text-xs text-defi-muted">{asset.valuationLabel}</div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="inline-flex items-center gap-2 rounded-full border border-defi-border bg-white/5 px-3 py-1 text-xs font-mono text-defi-muted">
                        <Link2 className="h-3.5 w-3.5" />
                        {asset.source === 'evm-rpc' ? 'RPC' : 'Observer'}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className={`inline-flex rounded-full px-3 py-1 text-xs font-mono ${
                        asset.executable
                          ? 'border border-defi-emerald/35 bg-defi-emerald/10 text-defi-emerald'
                          : 'border border-defi-amber/35 bg-defi-amber/10 text-defi-amber'
                      }`}>
                        {asset.executable ? 'Executable' : 'Read-only'}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-defi-border px-8 py-4 text-xs font-mono text-defi-muted">
          Base and Ethereum balances come from live RPC reads. Bitcoin and Solana depend on the Rust observer publishing into `portfolio_live/*`.
        </div>
      </section>
    </div>
  );
}
