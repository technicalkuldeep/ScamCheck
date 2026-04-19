import { Warning, ShieldCheck, ShieldWarning } from "@phosphor-icons/react";

export const WarningBanner = ({ riskColor = "red", riskLevel = "High Risk", score = 0 }) => {
  const configs = {
    red: {
      bg: "bg-[#FF3333]/10",
      border: "border-[#FF3333]",
      text: "text-[#FF3333]",
      Icon: Warning,
      msg: "Multiple high-risk signals detected. Do NOT interact with this address without extreme caution.",
    },
    yellow: {
      bg: "bg-[#FFD600]/10",
      border: "border-[#FFD600]",
      text: "text-[#FFD600]",
      Icon: ShieldWarning,
      msg: "Some suspicious activity detected. Review the risk breakdown carefully before interacting.",
    },
    green: {
      bg: "bg-[#00FF66]/10",
      border: "border-[#00FF66]",
      text: "text-[#00FF66]",
      Icon: ShieldCheck,
      msg: "No significant red flags detected. Standard due diligence still recommended.",
    },
  };
  const c = configs[riskColor] || configs.red;
  const Icon = c.Icon;
  return (
    <div
      data-testid="warning-banner"
      className={`flex items-start gap-4 border-l-4 ${c.border} ${c.bg} p-5`}
    >
      <Icon size={28} weight="fill" className={c.text} />
      <div className="flex-1">
        <div className={`font-mono text-[10px] uppercase tracking-[0.25em] ${c.text}`}>
          Verdict · Score {score}/100
        </div>
        <div className={`mt-1 font-display text-xl font-black ${c.text}`}>
          {riskLevel.toUpperCase()}
        </div>
        <p className="mt-1 text-sm text-white/70">{c.msg}</p>
      </div>
    </div>
  );
};

export default WarningBanner;
