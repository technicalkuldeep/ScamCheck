// SCAMCHECK content script
// Scans the current page for Solana base58 addresses (32–44 chars),
// queries backend, and injects compact risk badges next to each match.

const BASE58_RE = /\b[1-9A-HJ-NP-Za-km-z]{32,44}\b/g;
const API_BASE = "https://scamcheck-6.onrender.com/api";
const SCANNED = new Set();
const BADGE_CLASS = "scamcheck-badge";

function riskColor(color) {
  if (color === "green") return "#00FF66";
  if (color === "yellow") return "#FFD600";
  return "#FF3333";
}

function buildBadge(data, address) {
  const span = document.createElement("span");
  span.className = BADGE_CLASS;
  span.dataset.address = address;
  const c = riskColor(data.riskColor);
  span.style.setProperty("--scamcheck-color", c);
  span.innerHTML = `
    <span class="scamcheck-dot"></span>
    <span class="scamcheck-score">${data.score}</span>
    <span class="scamcheck-label">${data.riskLevel}</span>
  `;
  span.title = `SCAMCHECK: ${data.riskLevel} · ${data.score}/100`;
  span.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    chrome.runtime.sendMessage({ type: "OPEN_POPUP", address });
  });
  return span;
}

async function fetchRisk(address) {
  try {
    // ask background to use caching + avoid CORS
    return await new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: "ANALYZE", address }, (resp) => resolve(resp));
    });
  } catch {
    return null;
  }
}

function isEligible(node) {
  if (!node || !node.nodeValue) return false;
  if (node.nodeValue.length < 32) return false;
  const p = node.parentElement;
  if (!p) return false;
  const tag = p.tagName;
  if (!tag || ["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "TEXTAREA", "INPUT"].includes(tag)) return false;
  if (p.closest(`.${BADGE_CLASS}`)) return false;
  if (p.classList?.contains("scamcheck-processed")) return false;
  return true;
}

async function processAddress(address, textNode) {
  if (SCANNED.has(address)) return SCANNED.get?.(address);
  SCANNED.add(address);
  const data = await fetchRisk(address);
  if (!data || typeof data.score !== "number") return;
  const badge = buildBadge(data, address);
  const parent = textNode.parentNode;
  if (!parent) return;
  // Insert badge right after the text node
  parent.insertBefore(badge, textNode.nextSibling);
  parent.classList?.add("scamcheck-processed");
}

function scanRoot(root = document.body) {
  if (!root) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (isEligible(n) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
  });
  const matches = [];
  let node;
  while ((node = walker.nextNode())) {
    const text = node.nodeValue;
    const found = text.match(BASE58_RE);
    if (!found) continue;
    for (const m of found) {
      matches.push({ address: m, node });
    }
  }
  // Dedupe addresses per page
  const seen = new Set();
  for (const { address, node } of matches) {
    if (seen.has(address)) continue;
    seen.add(address);
    processAddress(address, node);
  }
}

// Initial scan
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => scanRoot());
} else {
  scanRoot();
}

// Re-scan on DOM mutations (throttled)
let pending = false;
const observer = new MutationObserver(() => {
  if (pending) return;
  pending = true;
  setTimeout(() => {
    pending = false;
    scanRoot();
  }, 1200);
});
observer.observe(document.body, { childList: true, subtree: true });
