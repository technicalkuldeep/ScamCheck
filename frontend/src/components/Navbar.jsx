import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck } from "@phosphor-icons/react";

export const Navbar = () => {
  const navigate = useNavigate();
  return (
    <header
      data-testid="app-navbar"
      className="sticky top-0 z-40 border-b border-white/10 bg-[#0A0A0C]/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-12">
        <Link
          to="/"
          data-testid="nav-home-link"
          className="flex items-center gap-3 group"
        >
          <div className="flex h-9 w-9 items-center justify-center border border-white/20 group-hover:border-white transition-colors">
            <ShieldCheck size={20} weight="duotone" className="text-white" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-sm font-black tracking-tight">
              SCAMCHECK
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
              solana · v1.0
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <a
            href="#how-it-works"
            className="font-mono text-xs uppercase tracking-wider text-white/60 hover:text-white transition-colors"
            data-testid="nav-how-link"
          >
            How it works
          </a>
          <a
            href="#features"
            className="font-mono text-xs uppercase tracking-wider text-white/60 hover:text-white transition-colors"
            data-testid="nav-features-link"
          >
            Features
          </a>
          <a
            href="#extension"
            className="font-mono text-xs uppercase tracking-wider text-white/60 hover:text-white transition-colors"
            data-testid="nav-extension-link"
          >
            Extension
          </a>
          <a
            href="#recent"
            className="font-mono text-xs uppercase tracking-wider text-white/60 hover:text-white transition-colors"
            data-testid="nav-recent-link"
          >
            Recent
          </a>
        </nav>

        <button
          data-testid="nav-scan-button"
          onClick={() => navigate("/")}
          className="border border-white/20 bg-white px-5 py-2.5 font-mono text-xs uppercase tracking-wider text-[#0A0A0C] hover:bg-white/90 transition-colors"
        >
          New Scan →
        </button>
      </div>
    </header>
  );
};

export default Navbar;
