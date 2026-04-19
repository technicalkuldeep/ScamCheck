import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { riskHex } from "@/lib/format";

/**
 * Animated SVG risk meter.
 * - 0..100 score
 * - Stroke color based on riskColor
 * - Animates stroke-dashoffset + number count-up
 */
export const RiskScoreMeter = ({ score = 0, riskLevel = "", riskColor = "red", size = 260 }) => {
  const [display, setDisplay] = useState(0);
  const stroke = riskHex(riskColor);
  const radius = (size - 24) / 2;
  const circumference = 2 * Math.PI * radius;
  // progress (270deg arc)
  const arcLength = circumference * 0.75;
  const progress = Math.max(0, Math.min(100, score)) / 100;
  const offset = arcLength * (1 - progress);

  useEffect(() => {
    let raf;
    const start = performance.now();
    const duration = 1500;
    const animate = (t) => {
      const p = Math.min(1, (t - start) / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(score * eased));
      if (p < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  const glowClass =
    riskColor === "green"
      ? "meter-glow-green"
      : riskColor === "yellow"
      ? "meter-glow-yellow"
      : "meter-glow-red";

  return (
    <div
      data-testid="risk-score-meter"
      className="relative flex flex-col items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={glowClass}
        style={{ transform: "rotate(135deg)" }}
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#27272A"
          strokeWidth="8"
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="butt"
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth="8"
          strokeDasharray={`${arcLength} ${circumference}`}
          initial={{ strokeDashoffset: arcLength }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          strokeLinecap="butt"
        />
        {/* Tick marks */}
        {[...Array(11)].map((_, i) => {
          const angle = (i / 10) * 270;
          const rad = (angle * Math.PI) / 180;
          const x1 = size / 2 + (radius - 16) * Math.cos(rad);
          const y1 = size / 2 + (radius - 16) * Math.sin(rad);
          const x2 = size / 2 + (radius - 8) * Math.cos(rad);
          const y2 = size / 2 + (radius - 8) * Math.sin(rad);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#3f3f46"
              strokeWidth="1"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div
          className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40"
          data-testid="risk-score-label"
        >
          Risk Score
        </div>
        <div
          data-testid="risk-score-value"
          className="font-display font-black leading-none tabular-nums"
          style={{ color: stroke, fontSize: size * 0.3 }}
        >
          {display}
        </div>
        <div
          data-testid="risk-level-label"
          className="mt-1 font-mono text-xs uppercase tracking-[0.25em]"
          style={{ color: stroke }}
        >
          {riskLevel}
        </div>
      </div>
    </div>
  );
};

export default RiskScoreMeter;
