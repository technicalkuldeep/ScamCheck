import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Copy,
  CheckCircle,
  ArrowsClockwise,
  Link as LinkIcon,
  Warning,
} from "@phosphor-icons/react";
import { toast } from "sonner";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WalletInput from "@/components/WalletInput";
import RiskScoreMeter from "@/components/RiskScoreMeter";
import RiskBreakdownList from "@/components/RiskBreakdownList";
import TransactionInsights from "@/components/TransactionInsights";
import TokenInfo from "@/components/TokenInfo";
import WarningBanner from "@/components/WarningBanner";
import TransactionVolumeChart from "@/components/TransactionVolumeChart";
import LiquidityPanel from "@/components/LiquidityPanel";

import { analyzeAddress } from "@/lib/api";
import { fmtTime, shortAddr } from "@/lib/format";

export default function Results() {
  const { address } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await analyzeAddress(address);
      setResult(data);
    } catch (e) {
      const msg = e?.response?.data?.detail || e?.message || "Analysis failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [address]);

  const copy = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    toast.success("Address copied");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white" data-testid="results-page">
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-12 lg:py-14">
        <button
          onClick={() => navigate("/")}
          data-testid="back-button"
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} weight="bold" /> Back
        </button>

        {/* Address header */}
        <div className="mt-6 flex flex-col items-start justify-between gap-4 border border-white/10 bg-[#121216] p-6 lg:flex-row lg:items-center">
          <div className="min-w-0">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
              {result?.type === "token" ? "SPL Token Mint" : "Wallet Address"}
            </div>
            <div
              className="mt-2 break-all font-mono text-sm text-white/90 sm:text-base"
              data-testid="result-address"
            >
              {address}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={copy}
              data-testid="copy-address-button"
              className="inline-flex items-center gap-2 border border-white/20 bg-transparent px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-white/80 hover:border-white transition-colors"
            >
              {copied ? (
                <>
                  <CheckCircle size={14} weight="fill" /> Copied
                </>
              ) : (
                <>
                  <Copy size={14} weight="bold" /> Copy
                </>
              )}
            </button>
            <a
              href={`https://solscan.io/account/${address}`}
              target="_blank"
              rel="noreferrer"
              data-testid="solscan-link"
              className="inline-flex items-center gap-2 border border-white/20 bg-transparent px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-white/80 hover:border-white transition-colors"
            >
              <LinkIcon size={14} weight="bold" /> Solscan
            </a>
            <button
              onClick={load}
              disabled={loading}
              data-testid="refresh-button"
              className="inline-flex items-center gap-2 border border-white/20 bg-white px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-[#0A0A0C] hover:bg-white/90 disabled:opacity-50 transition-colors"
            >
              <ArrowsClockwise size={14} weight="bold" />
              {loading ? "Analyzing…" : "Re-scan"}
            </button>
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div
            className="mt-8 flex min-h-[420px] flex-col items-center justify-center border border-white/10 bg-[#121216]"
            data-testid="results-loading"
          >
            <div className="h-12 w-12 animate-spin border-2 border-white/30 border-t-white" />
            <div className="mt-6 font-mono text-xs uppercase tracking-[0.3em] text-white/60">
              Querying Solana mainnet…
            </div>
            <div className="mt-2 font-mono text-xs text-white/30">
              {shortAddr(address, 8, 8)}
            </div>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div
            data-testid="results-error"
            className="mt-8 border-l-4 border-[#FF3333] bg-[#FF3333]/10 p-6"
          >
            <div className="flex items-center gap-3 font-mono text-sm text-[#FF3333]">
              <Warning size={20} weight="fill" /> {error}
            </div>
            <button
              onClick={load}
              className="mt-4 border border-[#FF3333]/50 bg-transparent px-4 py-2 font-mono text-xs uppercase tracking-wider text-[#FF3333] hover:bg-[#FF3333]/10 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* RESULT */}
        {!loading && !error && result && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-8 space-y-8"
          >
            {/* Top overview */}
            <div className="grid grid-cols-1 gap-0 border border-white/10 lg:grid-cols-[auto_1fr]">
              <div className="flex items-center justify-center border-b border-white/10 bg-[#121216] p-8 lg:border-b-0 lg:border-r">
                <RiskScoreMeter
                  score={result.score}
                  riskLevel={result.riskLevel}
                  riskColor={result.riskColor}
                  size={280}
                />
              </div>
              <div className="flex flex-col justify-between bg-[#121216] p-8 lg:p-10">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
                    Verdict
                  </div>
                  <h1 className="mt-2 font-display text-4xl font-black tracking-tighter lg:text-6xl">
                    {result.riskLevel}
                  </h1>
                  <p className="mt-4 max-w-xl text-white/60 leading-relaxed">
                    {result.type === "token"
                      ? "Token contract analyzed via on-chain mint metadata and holder distribution."
                      : "Wallet behavior analyzed via recent signatures, account ownership, and known-entity checks."}
                  </p>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <MetaStat label="Type" value={result.type.toUpperCase()} />
                  <MetaStat label="Analyzed" value={fmtTime(result.analyzedAt)} />
                  <MetaStat label="Signals" value={result.reasons?.length ?? 0} />
                  <MetaStat label="Cache" value={result.cached ? "Hit" : "Fresh"} />
                </div>
              </div>
            </div>

            {/* Warning banner */}
            <WarningBanner
              riskColor={result.riskColor}
              riskLevel={result.riskLevel}
              score={result.score}
            />

            {/* Breakdown */}
            <section data-testid="breakdown-section">
              <SectionHeader
                eyebrow="Why this score"
                title="Risk breakdown"
                sub="Every deduction and addition is accounted for."
              />
              <RiskBreakdownList reasons={result.reasons} />
            </section>

            {/* Insights (wallet) or Token info */}
            {result.type === "wallet" ? (
              <section data-testid="insights-section">
                <SectionHeader
                  eyebrow="On-chain activity"
                  title="Transaction insights"
                  sub="Derived from the last 100 signatures."
                />
                <TransactionInsights insights={result.insights} />
                <div className="mt-6">
                  <TransactionVolumeChart timeline={result.insights?.txTimeline || []} />
                </div>
              </section>
            ) : (
              <section data-testid="token-section" className="space-y-6">
                <SectionHeader
                  eyebrow="Contract"
                  title="Token profile"
                  sub="Authorities, supply and holder concentration."
                />
                <TokenInfo insights={result.insights} />
                <LiquidityPanel liquidity={result.insights?.liquidity} />
              </section>
            )}

            {/* New scan */}
            <section className="border border-white/10 bg-[#121216] p-6 lg:p-8" data-testid="new-scan-section">
              <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
                Scan another
              </div>
              <WalletInput size="sm" />
            </section>
          </motion.div>
        )}

        <div className="mt-12 text-center">
          <Link
            to="/"
            data-testid="home-link-bottom"
            className="font-mono text-xs uppercase tracking-[0.25em] text-white/40 hover:text-white transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}

const MetaStat = ({ label, value }) => (
  <div className="border border-white/10 p-3">
    <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/40">
      {label}
    </div>
    <div className="mt-1 font-display text-sm font-bold truncate">{value}</div>
  </div>
);

const SectionHeader = ({ eyebrow, title, sub }) => (
  <div className="mb-5 flex items-end justify-between gap-4">
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
        {eyebrow}
      </div>
      <h2 className="mt-1 font-display text-2xl font-black tracking-tight lg:text-3xl">
        {title}
      </h2>
    </div>
    {sub && (
      <p className="hidden max-w-md text-right text-sm text-white/40 sm:block">
        {sub}
      </p>
    )}
  </div>
);
