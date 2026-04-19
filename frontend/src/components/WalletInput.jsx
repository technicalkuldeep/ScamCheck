import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MagnifyingGlass, ArrowRight, Warning } from "@phosphor-icons/react";

const BASE58_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export const WalletInput = ({ size = "lg", initialValue = "" }) => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = (e) => {
    e?.preventDefault?.();
    const v = value.trim();
    if (!v) {
      setError("Enter a Solana wallet or token address");
      return;
    }
    if (!BASE58_RE.test(v)) {
      setError("Invalid Solana address format");
      return;
    }
    setError("");
    setLoading(true);
    navigate(`/scan/${encodeURIComponent(v)}`);
  };

  const big = size === "lg";

  return (
    <form
      onSubmit={submit}
      className="w-full"
      data-testid="wallet-input-form"
    >
      <div
        className={`flex flex-col gap-0 border border-white/20 bg-[#121216] transition-colors focus-within:border-white sm:flex-row ${
          error ? "border-[#FF3333]/70" : ""
        }`}
      >
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4 sm:border-b-0 sm:border-r sm:px-6">
          <MagnifyingGlass size={20} weight="bold" className="text-white/50" />
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
            Solana Address
          </span>
        </div>

        <input
          data-testid="wallet-input-field"
          type="text"
          autoFocus={big}
          spellCheck={false}
          autoComplete="off"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError("");
          }}
          placeholder="Paste wallet or token mint address…"
          className={`flex-1 bg-transparent px-5 py-4 text-white placeholder-white/30 outline-none font-mono ${
            big ? "text-base sm:text-lg lg:text-xl" : "text-sm sm:text-base"
          }`}
        />

        <button
          type="submit"
          data-testid="wallet-input-submit"
          disabled={loading}
          className={`group flex items-center justify-center gap-2 bg-white px-8 py-4 font-mono text-xs uppercase tracking-[0.2em] text-[#0A0A0C] hover:bg-white/90 disabled:opacity-50 transition-colors ${
            big ? "sm:py-5" : ""
          }`}
        >
          {loading ? "Scanning…" : "Scan Now"}
          <ArrowRight
            size={16}
            weight="bold"
            className="transition-transform group-hover:translate-x-1"
          />
        </button>
      </div>
      {error && (
        <div
          data-testid="wallet-input-error"
          className="mt-3 flex items-center gap-2 text-[#FF3333] font-mono text-xs uppercase tracking-wider"
        >
          <Warning size={14} weight="fill" />
          {error}
        </div>
      )}
    </form>
  );
};

export default WalletInput;
