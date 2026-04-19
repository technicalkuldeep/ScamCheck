# PRD — Web3 Scam Detector (SCAMCHECK)

## Problem Statement
Full-stack "Truecaller for Web3" on Solana. User pastes a wallet or token mint address and
receives a 0–100 risk score with human-readable reasons and on-chain insights.

## Tech Stack (v1)
- Frontend: React 19, React Router, TailwindCSS, Framer Motion, Phosphor Icons, Sonner
- Backend: FastAPI + Motor + httpx, deterministic scoring engine (no ML)
- DB: MongoDB (`analyses` collection, 5-min TTL cache, capped at 500 rows)
- Solana RPC: Alchemy mainnet (`SOLANA_RPC_URL` in backend/.env)

## User Choices (captured)
1. Stack: React + FastAPI + MongoDB
2. RPC: Alchemy Solana mainnet URL provided
3. Scoring: Real on-chain heuristics + small curated scam list
4. Chrome extension: deferred to v2
5. Design: delegated to design_agent (brutalist/terminal dark theme, Azeret Mono + IBM Plex Sans)

## Core Requirements
- Auto-detect wallet vs SPL token mint
- Deterministic scoring per spec (wallet age, tx freq, scam interactions, mint/freeze authority, holder concentration)
- Animated circular risk meter (SVG + stroke-dashoffset)
- Risk breakdown list with every deduction/addition
- Transaction insights (wallet) / Token info + holders (token)
- Color-coded warning banner (green/yellow/red)
- Recent scans live feed
- 5-min result cache
- All API routes prefixed `/api`

## Implemented (2026-02)
- Backend endpoints: `/api/health`, `/api/analyze`, `/api/analyze-wallet`, `/api/analyze-token`, `/api/recent-scans`, `/api/trusted-programs`
- `solana_service.py`: getSignaturesForAddress, getAccountInfo, getBalance, getTokenSupply, getTokenLargestAccounts, base58 validation
- `scoring.py`: Deterministic wallet + token scoring, curated scam wallets list, trusted programs map
- Frontend pages: Landing, Results
- Components: Navbar, Footer, WalletInput, RiskScoreMeter, RiskBreakdownList, TransactionInsights, TokenInfo, WarningBanner, RecentScans
- Brutalist dark UI with 1px sharp borders, Azeret Mono display font, terminal vibe
- 13/13 backend tests + full frontend e2e passed (iteration_1)

## Iteration 2 (2026-02) — Enhanced
- **Transaction Volume Chart** (Recharts BarChart) — 30-day daily activity for wallets; red bars when failure ratio > 30%.
- **DEX Liquidity Panel** for tokens via DexScreener API — totals, 24h volume, price, top pairs with link-outs. Integrated into token scoring: no-pair (-15), critically low (-20), low (-10), healthy (+0 addition), dead volume (-10).
- **Wallet timeline** in `insights.txTimeline` (30 daily buckets with count + failed).
- **Chrome Extension v1.0 (Manifest v3)** at `/app/extension/`:
  - Auto-detects Solana base58 addresses on any page and injects color-coded badges.
  - Click badge → opens full SCAMCHECK report in new tab.
  - Popup UI for manual scan, pre-fills from clipboard.
  - Downloadable ZIP on landing page at `/extension/scamcheck-extension.zip`.
- New components: `TransactionVolumeChart.jsx`, `LiquidityPanel.jsx`.
- Landing: new `#extension` section with download CTA, install guide, 4-feature bullet list.
- Nav: added Extension link.
- 32/32 backend tests + frontend e2e passed (iteration_2).

## Iteration 3 (2026-02) — Verified Issuers
- **VERIFIED_TOKENS whitelist** in `scoring.py`: USDC, USDT, PYUSD, EURC, WSOL, mSOL, bSOL, stSOL, JitoSOL, JUP.
- Token scoring now **skips mint/freeze authority deductions** for verified issuers and instead adds an explainable "Verified issuer · SYMBOL" reason.
- `insights.verified / verifiedIssuer / verifiedSymbol / verifiedName` exposed in API.
- `TokenInfo.jsx`: adds a green **SealCheck "VERIFIED ISSUER · {Issuer}"** badge + re-tones authority rows to safe when verified.
- USDC now scores **100 / Safe** (was 55 Suspicious), mSOL/JitoSOL/etc. all Safe as expected.

## Backlog / Next Items
- P1: Chrome extension MVP (deferred) — detect wallet addresses on page & popup warning
- P1: Expand curated scam wallet DB + admin route to submit flags
- P2: Transaction graph (Recharts) showing tx volume over time
- P2: Telegram/Discord bot that scans addresses
- P2: "Share scan" URL preview cards with OG image
- P2: Liquidity check via Raydium/Jupiter pool API for tokens
- P3: WebSocket live-update on recent scans feed
- P3: User accounts + saved watchlists

## Personas
- **Retail crypto user** – wants a gut-check before signing
- **Trader / degen** – scanning new tokens for rug signs
- **Security researcher** – triaging addresses in bulk

## Known Limitations
- USDC-like legit tokens with active mint authority flag as "High Risk" (expected; Circle is a known exception but not whitelisted yet)
- Holder concentration derived from largest-20 accounts only (Solana RPC limitation)
- Program-interaction detection for wallets is lightweight (signature-level only; deeper parsing would need `getTransaction` per-tx)
