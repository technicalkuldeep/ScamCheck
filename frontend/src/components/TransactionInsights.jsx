import { Clock, ChartLineUp, Pulse, Wallet, XCircle, CurrencyCircleDollar } from "@phosphor-icons/react";
import { fmtNumber, fmtTime } from "@/lib/format";

const Stat = ({ icon: Icon, label, value, sub, testId }) => (
  <div
    data-testid={testId}
    className="border border-white/10 bg-[#121216] p-5"
  >
    <div className="flex items-center justify-between">
      <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
        {label}
      </div>
      <Icon size={16} weight="duotone" className="text-white/50" />
    </div>
    <div className="mt-3 font-display text-2xl font-black tabular-nums">
      {value}
    </div>
    {sub && (
      <div className="mt-1 font-mono text-xs text-white/40">{sub}</div>
    )}
  </div>
);

export const TransactionInsights = ({ insights = {} }) => {
  return (
    <div
      data-testid="transaction-insights"
      className="grid grid-cols-2 gap-4 lg:grid-cols-3"
    >
      <Stat
        testId="insight-tx-count"
        icon={ChartLineUp}
        label="Transactions (recent)"
        value={fmtNumber(insights.transactionCount ?? 0)}
        sub="Last 100 signatures"
      />
      <Stat
        testId="insight-wallet-age"
        icon={Clock}
        label="Wallet age"
        value={
          insights.walletAgeDays != null
            ? `${insights.walletAgeDays}d`
            : "—"
        }
        sub={insights.firstTxTimestamp ? `First: ${fmtTime(insights.firstTxTimestamp)}` : "No activity"}
      />
      <Stat
        testId="insight-tx-freq"
        icon={Pulse}
        label="Frequency"
        value={`${insights.transactionsPerDay ?? 0}/d`}
        sub="avg tx per day"
      />
      <Stat
        testId="insight-balance"
        icon={CurrencyCircleDollar}
        label="Balance"
        value={`${insights.solBalance ?? 0} SOL`}
      />
      <Stat
        testId="insight-failed"
        icon={XCircle}
        label="Failed Tx"
        value={fmtNumber(insights.failedTransactions ?? 0)}
        sub={`${Math.round((insights.failedRatio || 0) * 100)}% failure rate`}
      />
      <Stat
        testId="insight-scams"
        icon={Wallet}
        label="Scam Interactions"
        value={fmtNumber(insights.scamInteractions ?? 0)}
        sub={`${insights.trustedInteractions ?? 0} trusted interactions`}
      />
    </div>
  );
};

export default TransactionInsights;
