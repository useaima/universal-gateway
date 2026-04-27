import { onValue, ref, type DatabaseReference } from 'firebase/database';
import {
  type Address,
  createPublicClient,
  erc20Abi,
  formatEther,
  formatUnits,
  http,
} from 'viem';
import { base, mainnet } from 'viem/chains';
import { rtdb } from './firebase';

export interface PortfolioAsset {
  id: string;
  asset: string;
  ticker: string;
  network: 'Base' | 'Ethereum' | 'Bitcoin' | 'Solana';
  balance: number;
  balanceDisplay: string;
  usdValue: number | null;
  executable: boolean;
  source: 'evm-rpc' | 'observer';
  walletAddress?: string;
  valuationLabel?: string;
}

export interface PortfolioSummary {
  totalUsd: number;
  pricedAssetCount: number;
  partialPricing: boolean;
  updatedAt?: string;
}

interface ObserverAssetRecord {
  asset?: string;
  ticker?: string;
  network?: string;
  balance?: number;
  balanceDisplay?: string;
  usdValue?: number | null;
  executable?: boolean;
  walletAddress?: string;
}

const evmClients = {
  Base: createPublicClient({
    chain: base,
    transport: http(base.rpcUrls.default.http[0]),
  }),
  Ethereum: createPublicClient({
    chain: mainnet,
    transport: http(mainnet.rpcUrls.default.http[0]),
  }),
};

const trackedTokens = [
  {
    id: 'base-eth',
    asset: 'Ether',
    ticker: 'ETH',
    network: 'Base' as const,
    tokenAddress: null,
    decimals: 18,
    executable: true,
  },
  {
    id: 'base-usdc',
    asset: 'USD Coin',
    ticker: 'USDC',
    network: 'Base' as const,
    tokenAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as Address,
    decimals: 6,
    executable: true,
    usdPeg: true,
  },
  {
    id: 'ethereum-eth',
    asset: 'Ether',
    ticker: 'ETH',
    network: 'Ethereum' as const,
    tokenAddress: null,
    decimals: 18,
    executable: true,
  },
  {
    id: 'ethereum-usdc',
    asset: 'USD Coin',
    ticker: 'USDC',
    network: 'Ethereum' as const,
    tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as Address,
    decimals: 6,
    executable: true,
    usdPeg: true,
  },
];

const minimumBalance = 0.000001;

export const fetchEvmPortfolioAssets = async (walletAddress?: string | null): Promise<PortfolioAsset[]> => {
  if (!walletAddress) {
    return [];
  }

  const address = walletAddress as Address;

  const assets = await Promise.all(
    trackedTokens.map(async (token) => {
      const client = evmClients[token.network];
      const rawBalance = token.tokenAddress
        ? await client.readContract({
            address: token.tokenAddress,
            abi: erc20Abi,
            functionName: 'balanceOf',
            args: [address],
          })
        : await client.getBalance({ address });

      const balance = Number(
        token.tokenAddress
          ? formatUnits(rawBalance, token.decimals)
          : formatEther(rawBalance),
      );

      if (!Number.isFinite(balance) || balance < minimumBalance) {
        return null;
      }

      return {
        id: token.id,
        asset: token.asset,
        ticker: token.ticker,
        network: token.network,
        balance,
        balanceDisplay:
          token.ticker === 'USDC'
            ? balance.toLocaleString(undefined, { maximumFractionDigits: 2 })
            : balance.toLocaleString(undefined, { maximumFractionDigits: 6 }),
        usdValue: token.usdPeg ? balance : null,
        executable: token.executable,
        source: 'evm-rpc' as const,
        walletAddress,
        valuationLabel: token.usdPeg ? '1:1 Base-denominated stablecoin' : 'Unpriced in-app',
      };
    }),
  );

  return assets.filter((asset): asset is PortfolioAsset => asset !== null);
};

export const observePortfolioLive = (
  onUpdate: (summary: PortfolioSummary, assets: PortfolioAsset[]) => void,
) => {
  const summaryRef: DatabaseReference = ref(rtdb, 'portfolio_live/summary');
  const assetsRef: DatabaseReference = ref(rtdb, 'portfolio_live/assets');

  let currentSummary: PortfolioSummary = {
    totalUsd: 0,
    pricedAssetCount: 0,
    partialPricing: false,
  };

  let currentAssets: PortfolioAsset[] = [];

  const emit = () => onUpdate(currentSummary, currentAssets);

  const unsubscribeSummary = onValue(summaryRef, (snapshot) => {
    const value = (snapshot.val() || {}) as Record<string, unknown>;
    currentSummary = {
      totalUsd: typeof value.totalUsd === 'number' ? value.totalUsd : 0,
      pricedAssetCount: typeof value.pricedAssetCount === 'number' ? value.pricedAssetCount : 0,
      partialPricing: Boolean(value.partialPricing),
      updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : undefined,
    };
    emit();
  });

  const unsubscribeAssets = onValue(assetsRef, (snapshot) => {
    const value = (snapshot.val() || {}) as Record<string, ObserverAssetRecord>;
    currentAssets = Object.entries(value).map(([id, asset]) => ({
      id,
      asset: asset.asset || 'Observed Asset',
      ticker: asset.ticker || 'UNKNOWN',
      network:
        asset.network === 'Bitcoin' || asset.network === 'Solana'
          ? asset.network
          : 'Base',
      balance: typeof asset.balance === 'number' ? asset.balance : 0,
      balanceDisplay:
        asset.balanceDisplay ||
        (typeof asset.balance === 'number'
          ? asset.balance.toLocaleString(undefined, { maximumFractionDigits: 8 })
          : '0'),
      usdValue: typeof asset.usdValue === 'number' ? asset.usdValue : null,
      executable: Boolean(asset.executable),
      source: 'observer',
      walletAddress: asset.walletAddress,
      valuationLabel:
        typeof asset.usdValue === 'number' ? 'Observer-provided valuation' : 'Balance-only observer asset',
    }));
    emit();
  });

  return () => {
    unsubscribeSummary();
    unsubscribeAssets();
  };
};

export const buildPortfolioSummary = (assets: PortfolioAsset[], liveSummary?: PortfolioSummary): PortfolioSummary => {
  const pricedAssets = assets.filter((asset) => asset.usdValue !== null);
  const totalUsd = pricedAssets.reduce((sum, asset) => sum + (asset.usdValue || 0), 0);

  return {
    totalUsd: totalUsd > 0 ? totalUsd : liveSummary?.totalUsd || 0,
    pricedAssetCount: pricedAssets.length || liveSummary?.pricedAssetCount || 0,
    partialPricing: assets.length > pricedAssets.length || Boolean(liveSummary?.partialPricing),
    updatedAt: liveSummary?.updatedAt || new Date().toISOString(),
  };
};
