import { ArrowUpRight, ArrowDownRight, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

const mockTransactions = [
  { id: 'tx-8891', agent: 'Arbitrage Bot v2', network: 'Arbitrum', amount: 450.00, status: 'Completed', time: '10 mins ago', type: 'out' },
  { id: 'tx-8892', agent: 'Yield Farmer', network: 'Base', amount: 1200.50, status: 'Pending Review', time: '1 hour ago', type: 'out' },
  { id: 'tx-8893', agent: 'Treasury Manager', network: 'Ethereum', amount: 8000.00, status: 'Blocked', time: '3 hours ago', type: 'out' },
  { id: 'tx-8894', agent: 'Flash Loan Exec', network: 'Polygon', amount: 15.00, status: 'Completed', time: '5 hours ago', type: 'in' },
  { id: 'tx-8895', agent: 'Arbitrage Bot v2', network: 'Arbitrum', amount: 200.00, status: 'Completed', time: '1 day ago', type: 'out' },
];

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'Completed':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono bg-defi-emerald/20 text-defi-emerald border border-defi-emerald/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]"><CheckCircle2 className="w-3 h-3 mr-1" /> SETTLED</span>;
    case 'Pending Review':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.2)]"><Clock className="w-3 h-3 mr-1" /> AWAITING_SIG</span>;
    case 'Blocked':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono bg-red-500/20 text-red-400 border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]"><AlertCircle className="w-3 h-3 mr-1" /> HALTED</span>;
    default:
      return <span>{status}</span>;
  }
};

export default function TransactionsView() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-defi-surface rounded-3xl border border-defi-border shadow-[0_0_30px_rgba(139,92,246,0.1)] overflow-hidden">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-defi-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-defi-surface/50">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">On-Chain Activity</h2>
            <p className="text-sm text-defi-muted font-mono mt-1">Monitor all programmatic transfers and smart contract executions.</p>
          </div>
          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-defi-dark border border-defi-border rounded-lg text-sm font-mono text-gray-300 hover:bg-defi-surfaceHover hover:text-white transition-colors">
              Filter
            </button>
            <button className="px-4 py-2 bg-defi-accent text-white rounded-lg text-sm font-bold hover:bg-violet-600 transition-colors shadow-[0_0_15px_rgba(139,92,246,0.3)]">
              Export CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-defi-border">
            <thead className="bg-defi-dark">
              <tr>
                <th scope="col" className="px-8 py-4 text-left text-xs font-mono text-defi-muted uppercase tracking-wider">Transaction ID</th>
                <th scope="col" className="px-8 py-4 text-left text-xs font-mono text-defi-muted uppercase tracking-wider">Agent / Network</th>
                <th scope="col" className="px-8 py-4 text-left text-xs font-mono text-defi-muted uppercase tracking-wider">Amount (USD)</th>
                <th scope="col" className="px-8 py-4 text-left text-xs font-mono text-defi-muted uppercase tracking-wider">Status</th>
                <th scope="col" className="px-8 py-4 text-left text-xs font-mono text-defi-muted uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody className="bg-defi-surface divide-y divide-defi-border">
              {mockTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-defi-surfaceHover transition-colors">
                  <td className="px-8 py-5 whitespace-nowrap text-sm font-mono text-gray-400">
                    {tx.id}
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-200">{tx.agent}</div>
                    <div className="text-xs text-defi-muted font-mono">{tx.network}</div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className={`flex items-center text-sm font-mono ${tx.type === 'in' ? 'text-defi-emerald' : 'text-gray-300'}`}>
                      {tx.type === 'in' ? <ArrowDownRight className="w-4 h-4 mr-1 text-defi-emerald" /> : <ArrowUpRight className="w-4 h-4 mr-1 text-gray-500" />}
                      ${tx.amount.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <StatusBadge status={tx.status} />
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-sm text-defi-muted font-mono">
                    {tx.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination (Mock) */}
        <div className="px-8 py-4 border-t border-defi-border flex items-center justify-between bg-defi-surface/50">
          <span className="text-sm text-defi-muted font-mono">Showing 1 to 5 of 42 transactions</span>
          <div className="flex space-x-2">
            <button className="px-3 py-1 bg-defi-dark border border-defi-border rounded text-sm font-mono text-gray-500 cursor-not-allowed">Previous</button>
            <button className="px-3 py-1 bg-defi-dark border border-defi-border rounded text-sm font-mono text-gray-300 hover:bg-defi-surfaceHover hover:text-white">Next</button>
          </div>
        </div>

      </div>
    </div>
  );
}
