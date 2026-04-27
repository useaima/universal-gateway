import { createPublicClient, formatUnits, http } from 'viem';
import { base, mainnet } from 'viem/chains';

export interface GasSnapshot {
  chain: 'base' | 'ethereum';
  gwei: number;
  updatedAt?: string;
  source: 'rtdb' | 'rpc';
}

const clients = {
  base: createPublicClient({
    chain: base,
    transport: http(base.rpcUrls.default.http[0]),
  }),
  ethereum: createPublicClient({
    chain: mainnet,
    transport: http(mainnet.rpcUrls.default.http[0]),
  }),
};

export const fetchRpcGasSnapshots = async (): Promise<GasSnapshot[]> => {
  const [baseGas, ethereumGas] = await Promise.all([
    clients.base.getGasPrice(),
    clients.ethereum.getGasPrice(),
  ]);

  const updatedAt = new Date().toISOString();

  return [
    {
      chain: 'base',
      gwei: Number(formatUnits(baseGas, 9)),
      updatedAt,
      source: 'rpc',
    },
    {
      chain: 'ethereum',
      gwei: Number(formatUnits(ethereumGas, 9)),
      updatedAt,
      source: 'rpc',
    },
  ];
};

export const averageGasGwei = (snapshots: GasSnapshot[]) => {
  if (snapshots.length === 0) {
    return null;
  }

  const total = snapshots.reduce((sum, snapshot) => sum + snapshot.gwei, 0);
  return total / snapshots.length;
};
