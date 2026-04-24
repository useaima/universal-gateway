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
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200"><CheckCircle2 className="w-3 h-3 mr-1" /> Completed</span>;
    case 'Pending Review':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200"><Clock className="w-3 h-3 mr-1" /> Human Review</span>;
    case 'Blocked':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200"><AlertCircle className="w-3 h-3 mr-1" /> Blocked</span>;
    default:
      return <span>{status}</span>;
  }
};

export default function TransactionsView() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-brand-dark">Agent Transactions</h2>
            <p className="text-sm text-brand-muted font-medium mt-1">Monitor all programmatic transfers and executions.</p>
          </div>
          <div className="flex space-x-3">
            <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
              Filter
            </button>
            <button className="px-4 py-2 bg-brand-dark text-white rounded-lg text-sm font-bold hover:bg-black transition-colors">
              Export CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Transaction ID</th>
                <th scope="col" className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Agent / Network</th>
                <th scope="col" className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Amount (USD)</th>
                <th scope="col" className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {mockTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-5 whitespace-nowrap text-sm font-mono text-gray-600">
                    {tx.id}
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="text-sm font-bold text-brand-dark">{tx.agent}</div>
                    <div className="text-xs text-gray-500 font-medium">{tx.network}</div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className={`flex items-center text-sm font-bold ${tx.type === 'in' ? 'text-green-600' : 'text-gray-900'}`}>
                      {tx.type === 'in' ? <ArrowDownRight className="w-4 h-4 mr-1" /> : <ArrowUpRight className="w-4 h-4 mr-1 text-gray-400" />}
                      ${tx.amount.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <StatusBadge status={tx.status} />
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-500 font-medium">
                    {tx.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination (Mock) */}
        <div className="px-8 py-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-500 font-medium">Showing 1 to 5 of 42 transactions</span>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border border-gray-200 rounded text-sm text-gray-400 cursor-not-allowed">Previous</button>
            <button className="px-3 py-1 border border-gray-200 rounded text-sm font-bold text-brand-dark hover:bg-gray-50">Next</button>
          </div>
        </div>

      </div>
    </div>
  );
}
