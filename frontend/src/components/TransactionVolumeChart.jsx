import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { ChartBar } from "@phosphor-icons/react";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="border border-white/20 bg-[#0A0A0C] p-3 font-mono text-xs">
      <div className="text-white/50 uppercase tracking-wider text-[10px]">{label}</div>
      <div className="mt-1 text-white">
        <span className="text-white/60">Txs: </span>
        <span className="font-bold">{d.count}</span>
      </div>
      {d.failed > 0 && (
        <div className="text-[#FF3333]">
          <span className="text-white/60">Failed: </span>
          <span className="font-bold">{d.failed}</span>
        </div>
      )}
    </div>
  );
};

export const TransactionVolumeChart = ({ timeline = [] }) => {
  const hasData = timeline.some((t) => t.count > 0);
  const maxCount = timeline.reduce((m, t) => Math.max(m, t.count), 0);

  // Format label to short (MM-DD)
  const data = timeline.map((t) => ({
    ...t,
    label: t.date.slice(5),
  }));

  return (
    <div
      data-testid="tx-volume-chart"
      className="border border-white/10 bg-[#121216] p-6"
    >
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center border border-white/20">
            <ChartBar size={18} weight="duotone" />
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
              30-Day Activity
            </div>
            <div className="font-display text-lg font-black">
              Transaction volume
            </div>
          </div>
        </div>
        <div className="font-mono text-xs text-white/40">
          Peak: <span className="text-white">{maxCount}</span>/day
        </div>
      </div>

      {hasData ? (
        <div style={{ width: "100%", height: 220 }}>
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="label"
                tick={{ fill: "#71717A", fontSize: 10, fontFamily: "IBM Plex Mono" }}
                stroke="#27272A"
                interval={Math.floor(data.length / 6)}
              />
              <YAxis
                tick={{ fill: "#71717A", fontSize: 10, fontFamily: "IBM Plex Mono" }}
                stroke="#27272A"
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
                content={<CustomTooltip />}
              />
              <Bar dataKey="count" radius={0}>
                {data.map((d, i) => (
                  <Cell
                    key={i}
                    fill={d.failed > d.count * 0.3 && d.count >= 3 ? "#FF3333" : "#FFFFFF"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-[220px] items-center justify-center border border-dashed border-white/10 font-mono text-xs uppercase tracking-wider text-white/30">
          No activity in the last 30 days
        </div>
      )}
    </div>
  );
};

export default TransactionVolumeChart;
