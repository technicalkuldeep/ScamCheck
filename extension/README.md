# SCAMCHECK Chrome Extension

Detects Solana wallet & token addresses on any webpage and injects instant risk-score badges. Click a badge to open the full scan in the SCAMCHECK web app, or click the toolbar icon to manually scan any address.

## Install (unpacked)

1. Download the extension ZIP from the SCAMCHECK website and unzip it.
2. Open `chrome://extensions` in Chrome / Edge / Brave.
3. Enable **Developer mode** (top-right).
4. Click **Load unpacked** and select this folder.
5. Pin the SCAMCHECK icon to your toolbar.

## What it does

- Scans every webpage you visit for base58 addresses (32–44 chars).
- Calls the SCAMCHECK API for each one (cached for 5 min).
- Injects a compact color-coded badge next to detected addresses:
  - `GREEN` Safe (80–100)
  - `YELLOW` Suspicious (50–79)
  - `RED` High Risk (0–49)
- Click a badge → full analysis opens in a new tab.
- Toolbar popup → manually paste any address.

## Privacy

Addresses are sent to the SCAMCHECK API for scoring. No other page content is transmitted. Results are cached locally in the extension service worker for 5 minutes.
