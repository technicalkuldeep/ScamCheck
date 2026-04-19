import { ShieldCheck } from "@phosphor-icons/react";

export const Footer = () => (
  <footer
    data-testid="app-footer"
    className="border-t border-white/10 mt-24"
  >
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-12">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center border border-white/20">
              <ShieldCheck size={18} weight="duotone" />
            </div>
            <span className="font-display text-sm font-black">SCAMCHECK</span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-white/50">
            Truecaller for Web3. Instant, deterministic risk analysis for any
            wallet or token on Solana.
          </p>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
            System
          </div>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            <li>Alchemy · Solana Mainnet</li>
            <li>Deterministic scoring engine</li>
            <li>5-minute result cache</li>
          </ul>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
            Disclaimer
          </div>
          <p className="mt-4 text-sm text-white/50">
            Risk scores are heuristic and informational. Always DYOR before
            signing any on-chain transaction.
          </p>
        </div>
      </div>
      <div className="mt-12 border-t border-white/10 pt-6 text-xs font-mono uppercase tracking-wider text-white/30">
        © {new Date().getFullYear()} SCAMCHECK · Built for the Solana ecosystem
      </div>
    </div>
  </footer>
);

export default Footer;
