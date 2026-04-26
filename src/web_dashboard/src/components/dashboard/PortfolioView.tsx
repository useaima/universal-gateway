import { useMemo, useState } from 'react';
import { ArrowDownUp, Coins, TrendingDown, TrendingUp, Wallet } from 'lucide-react';

type AssetRow = {
  asset: string;
  ticker: string;
  network: string;
  balance: string;
  usdValue: number;
  change24h: number;
  color: string;
  sparkline: number[];
};

type SortKey = 'asset' | 'network' | 'balance' | 'usdValue' | 'change24h';

const assets: AssetRow[] = [
  { asset: 'USD Coin', ticker: 'USDC', network: 'Base', balance: '42,500.32', usdValue: 42500.32, change24h: 0.02, color: '#f1cc7a', sparkline: [8, 9, 8, 8, 9, 8, 8] },
  { asset: 'Ether', ticker: 'ETH', network: 'Ethereum', balance: '12.84', usdValue: 38520.16, change24h: 2.8, color: '#10b981', sparkline: [4, 5, 5, 6, 6, 7, 8] },
  { asset: 'Arbitrum', ticker: 'ARB', network: 'Arbitrum', balance: '18,220.00', usdValue: 14576, change24h: -1.4, color: '#f59e0b', sparkline: [9, 8, 7, 7, 6, 6, 5] },
  { asset: 'Wrapped Bitcoin', ticker: 'WBTC', network: 'Ethereum', balance: '0.74', usdValue: 49820, change24h: 1.1, color: '#ef4444', sparkline: [6, 6, 7, 7, 8, 7, 8] },
];

function Sparkline({ points, stroke }: { points: number[]; stroke: string }) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const path = points
    .map((point, index) => {
      const x = (index / (points.length - 1)) * 100;
      const normalized = max === min ? 0.5 : (point - min) / (max - min);
      const y = 100 - normalized * 100;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  return (
    <svg viewBox="0 0 100 100" className="h-10 w-24 overflow-visible">
      <path d={path} fill="none" stroke={stroke} strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

export default function PortfolioView() {
  const [currency, setCurrency] = useState<'USD' | 'ETH'>('USD');
  const [sortKey, setSortKey] = useState<SortKey>('usdValue');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const totalUsd = assets.reduce((sum, item) => sum + item.usdValue, 0);
  const totalEth = totalUsd / 3010;

  const allocation = useMemo(
    () =>
      assets.map((asset) => ({
        ...asset,
        percent: (asset.usdValue / totalUsd) * 100,
      })),
    [totalUsd],
  );

  const gradient = `conic-gradient(${allocation
    .map((item, index) => {
      const previous = allocation.slice(0, index).reduce((sum, a) => sum + a.percent, 0);
      const end = previous + item.percent;
      return `${item.color} ${previous}% ${end}%`;
    })
    .join(', ')})`;

  const sorted = useMemo(() => {
    const data = [...assets];
    data.sort((a, b) => {
      const direction = sortDir === 'asc' ? 1 : -1;
      if (sortKey === 'asset') return a.ticker.localeCompare(b.ticker) * direction;
      if (sortKey === 'network') return a.network.localeCompare(b.network) * direction;
      if (sortKey === 'balance') return a.balance.localeCompare(b.balance, undefined, { numeric: true }) * direction;
      return ((a[sortKey] as number) - (b[sortKey] as number)) * direction;
    });
    return data;
  }, [sortDir, sortKey]);

  const setSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortKey(key);
    setSortDir(key === 'asset' || key === 'network' ? 'asc' : 'desc');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="section-panel p-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <div className="eyebrow mb-4">
                <Wallet className="h-4 w-4 text-defi-goldBright" />
                Cross-network balance view
              </div>
              <h2 className="text-3xl font-semibold text-white">Total Value Locked</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-defi-muted">
                Unified portfolio visibility across your authorized execution networks. Display-only and client-side.
              </p>
            </div>
            <div className="inline-flex rounded-xl border border-defi-border bg-black/20 p-1">
              {(['USD', 'ETH'] as const).map((value) => (
                <button
                  key={value}
                  onClick={() => setCurrency(value)}
                  className={`min-w-20 rounded-lg px-4 py-2 text-sm font-mono transition ${
                    currency === value ? 'bg-defi-gold text-defi-ink' : 'text-defi-muted hover:text-white'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-end gap-4">
            <div>
              <p className="text-xs font-mono uppercase tracking-[0.22em] text-defi-muted">Current total</p>
              <p className="mt-2 text-5xl font-semibold text-white">
                {currency === 'USD' ? `$${totalUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : `${totalEth.toFixed(2)} ETH`}
              </p>
            </div>
            <div className="rounded-2xl border border-defi-emerald/20 bg-defi-emerald/10 px-4 py-3 text-sm text-defi-emerald">
              <div className="flex items-center gap-2 font-medium">
                <TrendingUp className="h-4 w-4" />
                +4.8% 7D
              </div>
              <p className="mt-1 text-xs font-mono text-defi-muted">Live pricing UI is mocked locally.</p>
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
              <h3 className="text-xl font-semibold text-white">Asset mix</h3>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center gap-6 lg:flex-row">
            <div
              className="grid h-52 w-52 place-items-center rounded-full border border-defi-border"
              style={{ background: gradient }}
            >
              <div className="grid h-32 w-32 place-items-center rounded-full border border-defi-border bg-defi-darkSoft text-center">
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-defi-muted">TVL</span>
                <span className="text-xl font-semibold text-white">${(totalUsd / 1000).toFixed(1)}k</span>
              </div>
            </div>

            <div className="w-full space-y-3">
              {allocation.map((item) => (
                <div key={item.ticker} className="flex items-center justify-between rounded-2xl border border-defi-border bg-black/20 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <div>
                      <p className="font-medium text-white">{item.ticker}</p>
                      <p className="text-xs font-mono text-defi-muted">{item.network}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm text-white">{item.percent.toFixed(1)}%</p>
                    <p className="text-xs text-defi-muted">${item.usdValue.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <section className="table-shell">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-defi-border px-8 py-6">
          <div>
            <h3 className="text-2xl font-semibold text-white">Asset sorting table</h3>
            <p className="mt-1 text-sm text-defi-muted">Client-side portfolio inspection across networks and token balances.</p>
          </div>
          <div className="button-secondary px-4 py-2 text-sm font-mono">
            <ArrowDownUp className="h-4 w-4" />
            Sort locally
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
                  ['change24h', '24h Change'],
                ].map(([key, label]) => (
                  <th key={key} className="px-8 py-4">
                    <button onClick={() => setSort(key as SortKey)} className="inline-flex items-center gap-2 transition hover:text-white">
                      {label}
                      <ArrowDownUp className="h-3.5 w-3.5" />
                    </button>
                  </th>
                ))}
                <th className="px-8 py-4">7D</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((asset) => (
                <tr key={`${asset.ticker}-${asset.network}`} className="table-row-hover border-t border-defi-border text-sm">
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
                  <td className="px-8 py-5 font-mono text-white">{asset.balance}</td>
                  <td className="px-8 py-5 font-mono text-white">${asset.usdValue.toLocaleString()}</td>
                  <td className="px-8 py-5">
                    <div className={`inline-flex items-center gap-1 font-mono ${asset.change24h >= 0 ? 'text-defi-emerald' : 'text-defi-crimson'}`}>
                      {asset.change24h >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      {asset.change24h > 0 ? '+' : ''}
                      {asset.change24h.toFixed(2)}%
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <Sparkline points={asset.sparkline} stroke={asset.color} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-defi-border px-8 py-4 text-xs font-mono text-defi-muted">
          Display-only mock allocation view. No backend calls, writes, or transaction logic are changed.
        </div>
      </section>
    </div>
  );
}
