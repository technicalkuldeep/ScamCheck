import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Lightning,
  Database,
  Cube,
  MagnifyingGlass,
  Crosshair,
  PuzzlePiece,
  Shield,
  DownloadSimple,
  Browsers,
} from "@phosphor-icons/react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WalletInput from "@/components/WalletInput";
import RecentScans from "@/components/RecentScans";

const HERO_IMG =
  "https://static.prod-images.emergentagent.com/jobs/db902ef7-9157-45cb-a7ca-8d5baca83642/images/3142bb278a5813bb347e29ffca9835f255d21785845c4f78f7180925456997c8.png";

const DEMO_ADDRESSES = [
  { label: "USDC (Token)", addr: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" },
  { label: "Jupiter Aggregator", addr: "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4" },
  { label: "BONK (Token)", addr: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263" },
  { label: "Marinade mSOL", addr: "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So" },
];

const FEATURES = [
  {
    icon: Crosshair,
    title: "Wallet Risk Analyzer",
    body: "Every Solana wallet scored 0–100. Deterministic checks: wallet age, tx frequency, failed-tx ratio, known-scam interactions.",
  },
  {
    icon: Cube,
    title: "Token Scanner",
    body: "Mint authority, freeze authority, holder concentration, supply analysis. Detect rug-pulls before they happen.",
  },
  {
    icon: Lightning,
    title: "Sub-5s Analysis",
    body: "Alchemy-powered Solana RPC + parallel fetch. Most scans complete in under 3 seconds.",
  },
  {
    icon: Database,
    title: "Cached & Explainable",
    body: "Every score comes with human-readable reasons. Results cached for 5 minutes — share & compare freely.",
  },
];

const STEPS = [
  { n: "01", title: "Paste", body: "Drop any Solana wallet or token mint address." },
  { n: "02", title: "Scan", body: "We query Solana mainnet and run 20+ deterministic heuristics." },
  { n: "03", title: "Verdict", body: "Get a color-coded risk score with every reason exposed." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white" data-testid="landing-page">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/10" data-testid="hero-section">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `url(${HERO_IMG})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-[#0A0A0C]/80" />
        <div className="grid-bg absolute inset-0 opacity-30" />
        <div className="noise absolute inset-0" />

        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-12 lg:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 border border-white/20 px-3 py-1.5">
              <span className="h-1.5 w-1.5 bg-[#00FF66] animate-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/70">
                Live · Solana Mainnet
              </span>
            </div>

            <h1 className="mt-6 font-display text-4xl font-black leading-none tracking-tighter sm:text-5xl lg:text-7xl">
              Don't trust.
              <br />
              <span className="text-white/40">Verify.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-base text-white/70 leading-relaxed lg:text-lg">
              Paste any <span className="font-mono text-white">Solana wallet</span> or{" "}
              <span className="font-mono text-white">token mint</span> and get an instant,
              explainable risk score. Truecaller — for Web3.
            </p>

            <div className="mt-10">
              <WalletInput size="lg" />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
                Try:
              </span>
              {DEMO_ADDRESSES.map((d) => (
                <Link
                  key={d.addr}
                  to={`/scan/${encodeURIComponent(d.addr)}`}
                  data-testid={`demo-address-${d.label.replace(/\s+/g, "-").toLowerCase()}`}
                  className="font-mono text-xs text-white/50 hover:text-white underline decoration-dotted underline-offset-4 transition-colors"
                >
                  {d.label}
                </Link>
              ))}
            </div>
          </motion.div>

          {/* stats bar */}
          <div className="mt-20 grid grid-cols-2 gap-0 border border-white/10 sm:grid-cols-4">
            {[
              ["0-100", "Risk Score"],
              ["<3s", "Avg Scan Time"],
              ["20+", "Heuristics"],
              ["100%", "On-chain Data"],
            ].map(([v, l], i) => (
              <div
                key={i}
                className="border-b border-r border-white/10 p-5 last:border-r-0 sm:border-b-0"
                data-testid={`hero-stat-${i}`}
              >
                <div className="font-display text-2xl font-black lg:text-3xl">{v}</div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
                  {l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="mx-auto max-w-7xl px-6 py-20 lg:px-12 lg:py-28"
        data-testid="how-it-works-section"
      >
        <div className="mb-12 max-w-2xl">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
            Workflow
          </div>
          <h2 className="mt-2 font-display text-3xl font-black tracking-tight lg:text-5xl">
            Three steps. Zero mysticism.
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-0 border border-white/10 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div
              key={i}
              className="border-b border-r border-white/10 p-8 last:border-r-0 md:border-b-0"
              data-testid={`step-${i}`}
            >
              <div className="font-mono text-5xl font-bold text-white/15">{s.n}</div>
              <h3 className="mt-6 font-display text-xl font-black">{s.title}</h3>
              <p className="mt-3 text-sm text-white/60 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section
        id="features"
        className="border-t border-white/10 bg-[#121216]"
        data-testid="features-section"
      >
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-12 lg:py-28">
          <div className="mb-12 grid items-end gap-8 md:grid-cols-2">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
                Capabilities
              </div>
              <h2 className="mt-2 font-display text-3xl font-black tracking-tight lg:text-5xl">
                Deterministic.
                <br />
                Explainable.
                <br />
                <span className="text-white/40">No black-box ML.</span>
              </h2>
            </div>
            <p className="text-white/60 leading-relaxed md:text-lg">
              Every deduction and addition is accounted for. You see exactly why a wallet
              scored 42 — not just that it did.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-0 border border-white/10 md:grid-cols-2">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="group border-b border-r border-white/10 p-8 last:border-r-0 md:[&:nth-child(even)]:border-r-0 md:[&:nth-last-child(-n+2)]:border-b-0"
                  data-testid={`feature-${i}`}
                >
                  <div className="flex h-12 w-12 items-center justify-center border border-white/20 group-hover:border-white transition-colors">
                    <Icon size={22} weight="duotone" />
                  </div>
                  <h3 className="mt-6 font-display text-xl font-black">{f.title}</h3>
                  <p className="mt-3 text-sm text-white/60 leading-relaxed">{f.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="border-t border-white/10" data-testid="cta-section">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
          <div className="border border-white/10 bg-[#121216] p-8 lg:p-12">
            <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
              <div>
                <h3 className="font-display text-2xl font-black tracking-tight lg:text-4xl">
                  Scan before you sign.
                </h3>
                <p className="mt-3 max-w-xl text-white/60">
                  Every approval on Solana is permanent. One wrong signature drains a
                  wallet. SCAMCHECK takes 3 seconds — your assets are worth it.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  to="/"
                  data-testid="cta-scan-link"
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="inline-flex items-center gap-3 bg-white px-6 py-4 font-mono text-xs uppercase tracking-[0.2em] text-[#0A0A0C] hover:bg-white/90 transition-colors"
                >
                  <MagnifyingGlass size={16} weight="bold" /> Run a scan
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EXTENSION */}
      <section
        id="extension"
        className="border-t border-white/10"
        data-testid="extension-section"
      >
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-12 lg:py-28">
          <div className="grid grid-cols-1 gap-0 border border-white/10 lg:grid-cols-2">
            <div className="border-b border-white/10 p-8 lg:border-b-0 lg:border-r lg:p-12">
              <div className="inline-flex items-center gap-2 border border-white/20 px-3 py-1.5">
                <Browsers size={12} weight="bold" />
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/70">
                  Chrome Extension · v1.0
                </span>
              </div>
              <h2 className="mt-6 font-display text-3xl font-black tracking-tight lg:text-5xl">
                Scan without
                <br />
                <span className="text-white/40">lifting a finger.</span>
              </h2>
              <p className="mt-5 max-w-md text-white/60 leading-relaxed">
                Install the SCAMCHECK browser extension and see instant risk badges
                next to every Solana address on any webpage — Twitter, Discord,
                Solscan, Jupiter, you name it.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="/extension/scamcheck-extension.zip"
                  download
                  data-testid="extension-download-button"
                  className="inline-flex items-center gap-3 bg-white px-6 py-4 font-mono text-xs uppercase tracking-[0.2em] text-[#0A0A0C] hover:bg-white/90 transition-colors"
                >
                  <DownloadSimple size={16} weight="bold" />
                  Download (.zip)
                </a>
                <a
                  href="/extension/scamcheck-extension.zip"
                  download
                  data-testid="extension-install-guide"
                  className="inline-flex items-center gap-2 border border-white/20 bg-transparent px-5 py-4 font-mono text-xs uppercase tracking-[0.2em] text-white/80 hover:border-white transition-colors"
                >
                  Install guide →
                </a>
              </div>
            </div>
            <div className="bg-[#121216] p-8 lg:p-12">
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
                What you get
              </div>
              <ul className="mt-6 space-y-4">
                {[
                  ["Auto-detect", "Scans every page for 32-44 char base58 addresses."],
                  ["Inline badges", "Color-coded score injected next to each address."],
                  ["One-click deep dive", "Click a badge to open the full scan report."],
                  ["Zero telemetry", "Only the address is sent. Nothing else is logged."],
                ].map(([k, v], i) => (
                  <li key={i} className="flex gap-4 border-l-2 border-white/10 pl-4">
                    <div className="flex-1">
                      <div className="font-display text-sm font-bold">{k}</div>
                      <div className="mt-1 text-sm text-white/60">{v}</div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-8 border border-white/10 bg-[#0A0A0C] p-4 font-mono text-xs text-white/60">
                <div className="text-white/40">$ chrome://extensions</div>
                <div className="mt-1">→ Enable Developer mode</div>
                <div>→ Load unpacked → select unzipped folder</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <RecentScans />

      <Footer />
    </div>
  );
}
