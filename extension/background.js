// SCAMCHECK background service worker
const API_BASE = "https://scamcheck-6.onrender.com/api";
const WEB_APP = "https://scam-check-j8fe.vercel.app/";
const CACHE = new Map(); // in-memory; cleared per service worker lifecycle
const CACHE_TTL_MS = 5 * 60 * 1000;

async function analyze(address) {
  const cached = CACHE.get(address);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) return cached.data;
  try {
    const resp = await fetch(`${API_BASE}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address }),
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    CACHE.set(address, { ts: Date.now(), data });
    return data;
  } catch {
    return null;
  }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type === "ANALYZE" && msg.address) {
    analyze(msg.address).then((data) => sendResponse(data));
    return true; // async
  }
  if (msg?.type === "OPEN_POPUP" && msg.address) {
    chrome.tabs.create({ url: `${WEB_APP}/scan/${encodeURIComponent(msg.address)}` });
    sendResponse(true);
    return true;
  }
});
