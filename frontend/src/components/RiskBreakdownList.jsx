import { ArrowDown, ArrowUp, Minus } from "@phosphor-icons/react";
import { motion } from "framer-motion";

export const RiskBreakdownList = ({ reasons = [] }) => {
  if (!reasons.length) {
    return (
      <div
        className="border border-white/10 bg-[#121216] p-6 text-center font-mono text-xs uppercase tracking-wider text-white/40"
        data-testid="risk-breakdown-empty"
      >
        No risk factors detected
      </div>
    );
  }
  return (
    <div data-testid="risk-breakdown-list" className="divide-y divide-white/10 border border-white/10">
      {reasons.map((r, i) => {
        const isDeduct = r.type === "deduction" && r.points !== 0;
        const isAdd = r.type === "addition" && r.points > 0;
        const color = isDeduct ? "#FF3333" : isAdd ? "#00FF66" : "#A1A1AA";
        const Icon = isDeduct ? ArrowDown : isAdd ? ArrowUp : Minus;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-start gap-4 bg-[#121216] p-5"
            data-testid={`risk-reason-${i}`}
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center border"
              style={{ borderColor: color + "66", color }}
            >
              <Icon size={18} weight="bold" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-3">
                <div className="font-display text-base font-bold">
                  {r.label}
                </div>
                {r.points !== 0 && (
                  <div
                    className="font-mono text-xs uppercase tracking-wider"
                    style={{ color }}
                  >
                    {r.points > 0 ? "+" : ""}
                    {r.points} pts
                  </div>
                )}
              </div>
              <p className="mt-1 text-sm text-white/60">{r.detail}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default RiskBreakdownList;
