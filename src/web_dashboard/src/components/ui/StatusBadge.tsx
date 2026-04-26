import { AlertCircle, CheckCircle2, Clock3 } from 'lucide-react';

interface StatusBadgeProps {
  status: 'Completed' | 'Pending Review' | 'Blocked';
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  if (status === 'Completed') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-defi-emerald/30 bg-defi-emerald/15 px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider text-defi-emerald">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Settled
      </span>
    );
  }

  if (status === 'Pending Review') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-defi-amber/30 bg-defi-amber/15 px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider text-defi-amber">
        <Clock3 className="h-3.5 w-3.5" />
        Awaiting Sig
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-defi-crimson/30 bg-defi-crimson/15 px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider text-defi-crimson">
      <AlertCircle className="h-3.5 w-3.5" />
      Halted
    </span>
  );
}
