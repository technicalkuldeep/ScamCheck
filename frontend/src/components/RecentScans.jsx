import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Clock, ArrowUpRight } from "@phosphor-icons/react";
import { getRecentScans } from "@/lib/api";
import { shortAddr, fmtTime } from "@/lib/format";

export const RecentScans = () => {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getRecentScans()
      .then((data) => mounted && setScans(data))
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section
      id="recent"
      className="mx-auto max-w-7xl px-6 py-16 lg:px-12"
      data-testid="recent-scans-section"
    >
      <div className="mb-8 flex items-end justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
            Live feed
          </div>
          <h2 className="mt-2 font-display text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
            Recent scans
          </h2>
        </div>
        <div className="hidden items-center gap-2 font-mono text-xs uppercase tracking-wider text-white/40 sm:flex">
          <Clock size={14} weight="bold" /> Auto-refreshed
        </div>
      </div>
      <div className="border border-white/10">
        {loading && (
          <div className="p-6 font-mono text-xs uppercase tracking-wider text-white/40">
            Loading…
          </div>
        )}
        {!loading && scans.length === 0 && (
          <div className="p-6 font-mono text-xs uppercase tracking-wider text-white/40" data-testid="recent-scans-empty">
            No scans yet. Be the first ↑
          </div>
        )}
        {scans.map((s, i) => {
          const color =
            s.riskColor === "green"
              ? "#00FF66"
              : s.riskColor === "yellow"
              ? "#FFD600"
              : "#FF3333";
          return (
            <Link
              to={`/scan/${encodeURIComponent(s.address)}`}
              key={i}
              data-testid={`recent-scan-${i}`}
              className="grid grid-cols-12 items-center gap-4 border-b border-white/10 bg-[#0A0A0C] px-5 py-4 transition-colors last:border-0 hover:bg-[#121216]"
            >
              <div className="col-span-5 flex items-center gap-3 sm:col-span-4">
                <span
                  className="h-2 w-2"
                  style={{ backgroundColor: color }}
                />
                <span className="font-mono text-sm text-white/80">
                  {shortAddr(s.address, 6, 6)}
                </span>
              </div>
              <div className="col-span-2 font-mono text-[10px] uppercase tracking-wider text-white/40">
                {s.type}
              </div>
              <div
                className="col-span-2 font-display text-base font-black tabular-nums"
                style={{ color }}
              >
                {s.score}
              </div>
              <div className="col-span-2 hidden font-mono text-xs uppercase tracking-wider sm:block" style={{ color }}>
                {s.riskLevel}
              </div>
              <div className="col-span-2 hidden text-right font-mono text-xs text-white/40 sm:block">
                {fmtTime(s.analyzedAt)}
              </div>
              <div className="col-span-1 flex justify-end text-white/40">
                <ArrowUpRight size={16} weight="bold" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default RecentScans;
