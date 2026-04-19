import { Coin, Lock, LockOpen, Users, ChartPie, SealCheck } from "@phosphor-icons/react";
import { fmtNumber } from "@/lib/format";
import { shortAddr } from "@/lib/format";

const Row = ({ label, value, tone = "default", testId }) => {
  const color =
    tone === "danger"
      ? "text-[#FF3333]"
      : tone === "safe"
      ? "text-[#00FF66]"
      : tone === "warn"
      ? "text-[#FFD600]"
      : "text-white";
  return (
    <div
      data-testid={testId}
      className="flex items-center justify-between gap-4 border-b border-white/10 py-3 last:border-0"
    >
      <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
        {label}
      </div>
      <div className={`font-display text-sm font-bold ${color}`}>{value}</div>
    </div>
  );
};

export const TokenInfo = ({ insights = {} }) => {
  const {
    decimals,
    uiSupply,
    mintAuthorityActive,
    freezeAuthorityActive,
    mintAuthority,
    freezeAuthority,
    holderSampleCount,
    topHolderPercent,
    top10HolderPercent,
    topHolders = [],
    verified,
    verifiedIssuer,
    verifiedSymbol,
    verifiedName,
  } = insights;

  return (
    <div data-testid="token-info" className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="border border-white/10 bg-[#121216] p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center border border-white/20">
              <Coin size={18} weight="duotone" />
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
                Token Details
              </div>
              <div className="font-display text-lg font-black">
                {verified && verifiedSymbol ? verifiedName : "SPL Token"}
              </div>
            </div>
          </div>
          {verified && (
            <div
              data-testid="verified-issuer-badge"
              className="inline-flex items-center gap-2 border border-[#00FF66]/40 bg-[#00FF66]/10 px-3 py-1.5"
            >
              <SealCheck size={14} weight="fill" className="text-[#00FF66]" />
              <div className="flex flex-col leading-tight">
                <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#00FF66]">
                  Verified issuer
                </span>
                <span className="font-mono text-[10px] text-white/70">
                  {verifiedIssuer}
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="mt-5">
          <Row
            testId="token-supply-row"
            label="Supply"
            value={fmtNumber(uiSupply ?? 0)}
          />
          <Row
            testId="token-decimals-row"
            label="Decimals"
            value={decimals ?? 0}
          />
          <Row
            testId="token-mint-auth-row"
            label="Mint authority"
            value={
              mintAuthorityActive ? (
                <span className="inline-flex items-center gap-2">
                  <LockOpen size={14} weight="bold" /> {verified ? "Active (verified)" : "Active"}
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <Lock size={14} weight="bold" /> Revoked
                </span>
              )
            }
            tone={mintAuthorityActive ? (verified ? "safe" : "danger") : "safe"}
          />
          <Row
            testId="token-freeze-auth-row"
            label="Freeze authority"
            value={
              freezeAuthorityActive ? (
                <span className="inline-flex items-center gap-2">
                  <LockOpen size={14} weight="bold" /> {verified ? "Active (verified)" : "Active"}
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <Lock size={14} weight="bold" /> Revoked
                </span>
              )
            }
            tone={freezeAuthorityActive ? (verified ? "safe" : "warn") : "safe"}
          />
          {mintAuthority && (
            <Row
              testId="token-mint-auth-addr"
              label="Mint auth addr"
              value={<span className="font-mono text-xs">{shortAddr(mintAuthority, 6, 6)}</span>}
            />
          )}
          {freezeAuthority && (
            <Row
              testId="token-freeze-auth-addr"
              label="Freeze auth addr"
              value={<span className="font-mono text-xs">{shortAddr(freezeAuthority, 6, 6)}</span>}
            />
          )}
        </div>
      </div>

      <div className="border border-white/10 bg-[#121216] p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center border border-white/20">
            <ChartPie size={18} weight="duotone" />
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
              Holder Distribution
            </div>
            <div className="font-display text-lg font-black">
              Concentration
            </div>
          </div>
        </div>
        <div className="mt-5">
          <Row
            testId="holder-top-row"
            label="Top holder"
            value={`${topHolderPercent ?? 0}%`}
            tone={topHolderPercent > 50 ? "danger" : topHolderPercent > 25 ? "warn" : "safe"}
          />
          <Row
            testId="holder-top10-row"
            label="Top 10 holders"
            value={`${top10HolderPercent ?? 0}%`}
            tone={top10HolderPercent > 80 ? "danger" : top10HolderPercent > 60 ? "warn" : "safe"}
          />
          <Row
            testId="holder-sample-row"
            label="Holder sample"
            value={holderSampleCount ?? 0}
          />
        </div>

        {topHolders.length > 0 && (
          <div className="mt-6">
            <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
              <Users size={12} weight="bold" /> Top Holders
            </div>
            <div
              data-testid="top-holders-list"
              className="border border-white/10"
            >
              {topHolders.map((h, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b border-white/10 px-3 py-2 last:border-0"
                >
                  <span className="font-mono text-xs text-white/60">
                    #{i + 1} {shortAddr(h.address, 4, 4)}
                  </span>
                  <span className="font-display text-xs font-bold">
                    {fmtNumber(Number(h.uiAmount || 0))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenInfo;
