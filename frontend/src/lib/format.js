export const shortAddr = (addr, front = 4, back = 4) => {
  if (!addr) return "";
  if (addr.length <= front + back + 3) return addr;
  return `${addr.slice(0, front)}…${addr.slice(-back)}`;
};

export const fmtNumber = (n) => {
  if (n === null || n === undefined) return "—";
  if (typeof n !== "number") n = Number(n);
  if (Number.isNaN(n)) return "—";
  if (Math.abs(n) >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + "B";
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(2) + "K";
  return n.toString();
};

export const fmtTime = (ts) => {
  if (!ts) return "—";
  const d = new Date(typeof ts === "number" ? ts * 1000 : ts);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const riskHex = (color) => {
  switch (color) {
    case "green":
      return "#00FF66";
    case "yellow":
      return "#FFD600";
    case "red":
    default:
      return "#FF3333";
  }
};
