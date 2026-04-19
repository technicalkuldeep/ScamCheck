const API_BASE = "https://token-safety-1.preview.emergentagent.com/api";
const WEB_APP = "https://token-safety-1.preview.emergentagent.com";

const $addr = document.getElementById("addr");
const $btn = document.getElementById("scan");
const $result = document.getElementById("result");
const $error = document.getElementById("error");
const $open = document.getElementById("openapp");

function colorFor(color) {
  if (color === "green") return "#00FF66";
  if (color === "yellow") return "#FFD600";
  return "#FF3333";
}

function render(data) {
  $error.classList.add("hidden");
  const c = colorFor(data.riskColor);
  const reasonsHtml = (data.reasons || [])
    .slice(0, 5)
    .map((r) => {
      const pts = r.points ? `${r.points > 0 ? "+" : ""}${r.points}` : "±0";
      const color = r.type === "deduction" && r.points !== 0 ? "#FF3333" : r.type === "addition" && r.points > 0 ? "#00FF66" : "rgba(255,255,255,0.5)";
      return `<div class="reason"><span class="pts" style="color:${color}">${pts}</span><span>${r.label}</span></div>`;
    })
    .join("");
  $result.innerHTML = `
    <div class="score-row">
      <div class="score" style="color:${c}">${data.score}</div>
      <div class="level" style="color:${c}">${data.riskLevel}</div>
    </div>
    <div style="font-family:'IBM Plex Mono',monospace;font-size:10px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:0.15em">
      ${data.type} · ${(data.reasons || []).length} signals
    </div>
    <div class="reasons">${reasonsHtml || '<div class="reason" style="color:rgba(255,255,255,0.4)">No flagged signals</div>'}</div>
  `;
  $result.classList.remove("hidden");
  $open.href = `${WEB_APP}/scan/${encodeURIComponent(data.address)}`;
  $open.style.display = "block";
}

function showError(msg) {
  $error.textContent = msg;
  $error.classList.remove("hidden");
  $result.classList.add("hidden");
  $open.style.display = "none";
}

async function scan() {
  const v = ($addr.value || "").trim();
  if (!v) return showError("Enter a Solana address");
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(v)) return showError("Invalid Solana address format");
  $btn.disabled = true;
  $btn.textContent = "SCANNING…";
  $error.classList.add("hidden");
  try {
    const resp = await fetch(`${API_BASE}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: v }),
    });
    if (!resp.ok) {
      const e = await resp.json().catch(() => ({}));
      throw new Error(e.detail || `Error ${resp.status}`);
    }
    const data = await resp.json();
    render(data);
  } catch (e) {
    showError(e.message || "Scan failed");
  } finally {
    $btn.disabled = false;
    $btn.textContent = "SCAN NOW →";
  }
}

$btn.addEventListener("click", scan);
$addr.addEventListener("keydown", (e) => {
  if (e.key === "Enter") scan();
});

// Pre-fill from clipboard on open if it looks like a Solana address
(async () => {
  try {
    const text = await navigator.clipboard.readText();
    if (text && /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(text.trim())) {
      $addr.value = text.trim();
    }
  } catch {}
  $addr.focus();
})();

$open.style.display = "none";
