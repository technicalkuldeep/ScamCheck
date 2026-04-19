import { Drop, ChartLineUp, CurrencyCircleDollar, ArrowSquareOut } from "@phosphor-icons/react";
import { fmtNumber } from "@/lib/format";

const formatUsd = (n) => {
  if (n === null || n === undefined) return "—";
  const num = Number(n);
  if (Number.isNaN(num)) return "—";
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(2)}K`;
  if (num >= 1) return `$${num.toFixed(2)}`;
  if (num > 0) return `$${num.toFixed(6)}`;
  return "$0";
};

export const LiquidityPanel = ({ liquidity }) => {
  const lq = liquidity || {
    totalLiquidityUsd: 0,
    totalVolume24hUsd: 0,
    priceUsd: null,
    pairs: [],
    pairCount: 0,
  };
  const liquidityTone =
    lq.totalLiquidityUsd >= 100_000
      ? "#00FF66"
      : lq.totalLiquidityUsd >= 10_000
      ? "#FFD600"
      : "#FF3333";

  return (
    <div data-testid="liquidity-panel" className="border border-white/10 bg-[#121216] p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center border border-white/20">
          <Drop size={18} weight="duotone" />
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
            DEX Liquidity · via DexScreener
          </div>
          <div className="font-display text-lg font-black">Market depth</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="border border-white/10 p-4" data-testid="liq-total">
          <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/40">
            Total Liquidity
          </div>
          <div
            className="mt-2 font-display text-2xl font-black tabular-nums"
            style={{ color: liquidityTone }}
          >
            {formatUsd(lq.totalLiquidityUsd)}
          </div>
        </div>
        <div className="border border-white/10 p-4" data-testid="liq-volume">
          <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/40">
            24h Volume
          </div>
          <div className="mt-2 font-display text-2xl font-black tabular-nums">
            {formatUsd(lq.totalVolume24hUsd)}
          </div>
        </div>
        <div className="border border-white/10 p-4 col-span-2 sm:col-span-1" data-testid="liq-price">
          <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/40">
            Price
          </div>
          <div className="mt-2 font-display text-2xl font-black tabular-nums">
            {lq.priceUsd != null ? formatUsd(lq.priceUsd) : "—"}
          </div>
        </div>
      </div>

      {lq.pairs && lq.pairs.length > 0 ? (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
            <span>
              <ChartLineUp size={12} weight="bold" className="inline mr-1.5 mb-0.5" />
              {lq.pairCount} pair{lq.pairCount === 1 ? "" : "s"}
            </span>
            <span>Liquidity · 24h Vol</span>
          </div>
          <div className="border border-white/10" data-testid="liq-pairs-list">
            {lq.pairs.map((p, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3 last:border-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="inline-block border border-white/20 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-white/60">
                    {p.dex || "dex"}
                  </span>
                  <span className="font-display text-sm font-bold truncate">
                    {p.pair}
                  </span>
                </div>
                <div className="flex items-center gap-5 font-mono text-xs">
                  <span className="text-white" title="Liquidity">
                    {formatUsd(p.liquidityUsd)}
                  </span>
                  <span className="text-white/50 hidden sm:inline" title="24h Volume">
                    {formatUsd(p.volume24hUsd)}
                  </span>
                  {p.url && (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-white/40 hover:text-white transition-colors"
                      aria-label="Open on DexScreener"
                    >
                      <ArrowSquareOut size={14} weight="bold" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div
          className="mt-6 border border-dashed border-white/10 p-4 font-mono text-xs text-white/40"
          data-testid="liq-empty"
        >
          No DEX pairs found for this token. It may be unlisted, newly-deployed, or delisted.
        </div>
      )}
    </div>
  );
};

export default LiquidityPanel;
