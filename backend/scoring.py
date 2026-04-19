"""Deterministic risk scoring for Solana wallets & tokens."""
from datetime import datetime, timezone
from typing import Optional

# Well-known scam/flagged wallets (demo curated list).
# Real-world systems would sync with feeds like Chainabuse/SolScan flags.
KNOWN_SCAM_WALLETS = {
    # Demo placeholders — known drainer/phishing wallets referenced in public reports
    "FuQmQGprUPJ5dLSZbMvhSV6gAoPPPJfPhiG4KoPoypeg",
    "4zdKsJgnWt3mhNPn5jHddCTmWkLjqX7xUjF3ZcKEyd7a",
    "8sMpBZKn1E7kXw8XkE1yVv2yxkYmG5X9fQmQhZKnEyd7",
    "ScamW4LLETxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
}

# Trusted / major protocols — interacting with these is a positive signal.
TRUSTED_PROGRAMS = {
    "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4": "Jupiter Aggregator v6",
    "JUP4Fb2cqiRUcaTHdrPC8h2gNsA2ETXiPDD33WcGuJB": "Jupiter Aggregator v3",
    "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8": "Raydium Liquidity Pool v4",
    "9W959DqEETiGZocYWCQPaJ6sBmUzgfxXfqGeTEdp3aQP": "Orca Whirlpools",
    "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc": "Orca Whirlpool",
    "srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX": "Serum DEX v3",
    "MarBmsSgKXdrN1egZf5sqe1TMThczhMLJhidtgXZLCDS": "Marinade Finance",
    "Stake11111111111111111111111111111111111111": "Stake Program",
    "11111111111111111111111111111111": "System Program",
    "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA": "Token Program",
    "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL": "Associated Token Program",
}


# Verified SPL token mints — these legitimately keep mint/freeze authority active.
# Mapping: mint_address -> {name, issuer, symbol}.
VERIFIED_TOKENS = {
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": {
        "symbol": "USDC", "name": "USD Coin", "issuer": "Circle",
    },
    "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB": {
        "symbol": "USDT", "name": "Tether USD", "issuer": "Tether",
    },
    "2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo": {
        "symbol": "PYUSD", "name": "PayPal USD", "issuer": "Paxos / PayPal",
    },
    "HzwqbKZw8HxMN6bF2yFZNrht3c2iXXzpKcFu7uBEDKtr": {
        "symbol": "EURC", "name": "Euro Coin", "issuer": "Circle",
    },
    # Wrapped SOL — authority kept by protocol, legit
    "So11111111111111111111111111111111111111112": {
        "symbol": "WSOL", "name": "Wrapped SOL", "issuer": "Solana Program",
    },
    # Liquid staking
    "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So": {
        "symbol": "mSOL", "name": "Marinade Staked SOL", "issuer": "Marinade Finance",
    },
    "bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1": {
        "symbol": "bSOL", "name": "BlazeStake Staked SOL", "issuer": "Solana Compass / Blaze",
    },
    "7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj": {
        "symbol": "stSOL", "name": "Lido Staked SOL", "issuer": "Lido",
    },
    "J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn": {
        "symbol": "JitoSOL", "name": "Jito Staked SOL", "issuer": "Jito",
    },
    # Jupiter
    "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN": {
        "symbol": "JUP", "name": "Jupiter", "issuer": "Jupiter Exchange",
    },
}


def _risk_level(score: int) -> str:
    if score >= 80:
        return "Safe"
    if score >= 50:
        return "Suspicious"
    return "High Risk"


def _risk_color(score: int) -> str:
    if score >= 80:
        return "green"
    if score >= 50:
        return "yellow"
    return "red"


def _build_tx_timeline(signatures: list, days: int = 30) -> list:
    """Bucket signatures into the last `days` daily buckets (oldest → newest)."""
    from datetime import datetime, timezone, timedelta
    now = datetime.now(timezone.utc)
    today = datetime(now.year, now.month, now.day, tzinfo=timezone.utc)
    buckets = []
    for i in range(days - 1, -1, -1):
        day = today - timedelta(days=i)
        buckets.append({
            "date": day.strftime("%Y-%m-%d"),
            "ts": int(day.timestamp()),
            "count": 0,
            "failed": 0,
        })
    idx = {b["ts"]: b for b in buckets}
    start = buckets[0]["ts"]
    for s in signatures:
        bt = s.get("blockTime")
        if not bt or bt < start:
            continue
        day_ts = int(datetime.fromtimestamp(bt, tz=timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0).timestamp())
        b = idx.get(day_ts)
        if b is None:
            continue
        b["count"] += 1
        if s.get("err") is not None:
            b["failed"] += 1
    return buckets


def score_wallet(
    address: str,
    signatures: list,
    account_info: Optional[dict],
    balance_lamports: int,
) -> dict:
    """
    Returns: {score, riskLevel, riskColor, reasons[], insights{}}
    """
    score = 100
    reasons = []
    scam_interactions = 0
    trusted_interactions = 0

    # ---------- INSIGHTS ----------
    tx_count = len(signatures)
    wallet_age_days = None
    first_tx_ts = None
    last_tx_ts = None
    if tx_count:
        # signatures are newest-first
        newest = signatures[0].get("blockTime")
        oldest = signatures[-1].get("blockTime")
        now = datetime.now(timezone.utc).timestamp()
        if oldest:
            wallet_age_days = max(0, int((now - oldest) / 86400))
            first_tx_ts = oldest
        if newest:
            last_tx_ts = newest

    # Frequency: txns per day across signature window
    tx_per_day = 0.0
    if wallet_age_days and wallet_age_days > 0:
        tx_per_day = round(tx_count / wallet_age_days, 2)
    elif tx_count:
        tx_per_day = float(tx_count)

    # Failed tx ratio
    failed = sum(1 for s in signatures if s.get("err") is not None)
    failed_ratio = (failed / tx_count) if tx_count else 0

    # Parse program interactions from signatures (memo field includes program IDs on some responses; more reliable to count unique programs via getTransaction, but we keep it light).
    # Heuristic: use confirmationStatus + err patterns only here.

    # ---------- SCORING ----------
    # Known scam interaction check (signature memos can include 'scam'; fallback on wallet id in list)
    if address in KNOWN_SCAM_WALLETS:
        score -= 40
        scam_interactions += 1
        reasons.append({
            "type": "deduction",
            "points": -40,
            "label": "Flagged wallet",
            "detail": "This address appears on a known scam/blacklist watchlist.",
        })

    # Wallet age < 7 days
    if wallet_age_days is not None and wallet_age_days < 7:
        score -= 20
        reasons.append({
            "type": "deduction",
            "points": -20,
            "label": "Very new wallet",
            "detail": f"Wallet is only {wallet_age_days} day(s) old — common trait of disposable scam wallets.",
        })

    # No tx history at all
    if tx_count == 0:
        score -= 10
        reasons.append({
            "type": "deduction",
            "points": -10,
            "label": "No transaction history",
            "detail": "No on-chain activity found for this address. May be unused or dormant.",
        })

    # High-frequency suspicious transfers
    if tx_per_day > 50:
        score -= 15
        reasons.append({
            "type": "deduction",
            "points": -15,
            "label": "High-frequency transfers",
            "detail": f"Approximately {tx_per_day} transactions/day — consistent with bot/drainer behavior.",
        })

    # High failure ratio suggests script kiddie / drainer attempts
    if failed_ratio > 0.3 and tx_count >= 10:
        score -= 10
        reasons.append({
            "type": "deduction",
            "points": -10,
            "label": "Abnormal failure rate",
            "detail": f"{int(failed_ratio * 100)}% of recent transactions failed — possible exploit probing.",
        })

    # Consistent history reward
    if tx_count >= 20 and (wallet_age_days or 0) >= 30 and failed_ratio < 0.1:
        score += 10
        reasons.append({
            "type": "addition",
            "points": 10,
            "label": "Consistent transaction history",
            "detail": f"{tx_count} transactions across {wallet_age_days} days with low failure rate.",
        })

    # Owner program (if available) — if it's a regular wallet, it's owned by System Program
    if account_info and isinstance(account_info, dict):
        owner = account_info.get("owner")
        if owner in TRUSTED_PROGRAMS:
            # System program ownership is neutral for normal wallets; skip unless it's a protocol account.
            if owner != "11111111111111111111111111111111":
                score += 10
                trusted_interactions += 1
                reasons.append({
                    "type": "addition",
                    "points": 10,
                    "label": "Trusted protocol account",
                    "detail": f"Account is owned by {TRUSTED_PROGRAMS[owner]}.",
                })

    # Clamp
    score = max(0, min(100, score))

    sol_balance = round(balance_lamports / 1_000_000_000, 4)

    return {
        "type": "wallet",
        "address": address,
        "score": score,
        "riskLevel": _risk_level(score),
        "riskColor": _risk_color(score),
        "reasons": reasons,
        "insights": {
            "transactionCount": tx_count,
            "walletAgeDays": wallet_age_days,
            "transactionsPerDay": tx_per_day,
            "failedTransactions": failed,
            "failedRatio": round(failed_ratio, 3),
            "solBalance": sol_balance,
            "firstTxTimestamp": first_tx_ts,
            "lastTxTimestamp": last_tx_ts,
            "scamInteractions": scam_interactions,
            "trustedInteractions": trusted_interactions,
            "txTimeline": _build_tx_timeline(signatures, days=30),
        },
    }


def score_token(
    mint: str,
    mint_account: Optional[dict],
    largest_accounts: list,
    supply_info: Optional[dict],
    liquidity: Optional[dict] = None,
) -> dict:
    score = 100
    reasons = []

    verified = VERIFIED_TOKENS.get(mint)
    if verified:
        reasons.append({
            "type": "addition",
            "points": 0,
            "label": f"Verified issuer · {verified['symbol']}",
            "detail": f"Issued by {verified['issuer']}. Authorities are legitimately retained for regulatory/operational reasons.",
        })

    parsed = None
    decimals = 0
    mint_authority = None
    freeze_authority = None
    supply = 0

    if mint_account and isinstance(mint_account, dict):
        data = mint_account.get("data") or {}
        if isinstance(data, dict):
            parsed = (data.get("parsed") or {}).get("info")
    if parsed:
        mint_authority = parsed.get("mintAuthority")
        freeze_authority = parsed.get("freezeAuthority")
        decimals = int(parsed.get("decimals", 0))
        try:
            supply = int(parsed.get("supply", "0"))
        except Exception:
            supply = 0
    elif supply_info:
        decimals = int(supply_info.get("decimals", 0))
        try:
            supply = int(supply_info.get("amount", "0"))
        except Exception:
            supply = 0

    # Mint authority still active
    if mint_authority:
        if verified:
            # Skip the deduction for whitelisted issuers; surface context.
            reasons.append({
                "type": "addition",
                "points": 0,
                "label": "Mint authority retained (expected)",
                "detail": f"{verified['name']} ({verified['symbol']}) retains mint authority by design.",
            })
        else:
            score -= 30
            reasons.append({
                "type": "deduction",
                "points": -30,
                "label": "Mint authority active",
                "detail": "The mint authority has not been revoked — creator can mint unlimited new tokens.",
            })
    else:
        reasons.append({
            "type": "addition",
            "points": 0,
            "label": "Mint authority revoked",
            "detail": "Minting is disabled. Total supply is fixed.",
        })

    # Freeze authority active
    if freeze_authority:
        if verified:
            reasons.append({
                "type": "addition",
                "points": 0,
                "label": "Freeze authority retained (expected)",
                "detail": f"{verified['name']} uses freeze authority for regulatory compliance.",
            })
        else:
            score -= 15
            reasons.append({
                "type": "deduction",
                "points": -15,
                "label": "Freeze authority active",
                "detail": "Creator can freeze any holder's tokens at will.",
            })

    # Holder concentration via largest accounts (API returns up to 20)
    holder_count = len(largest_accounts)
    top_holder_pct = 0.0
    top10_pct = 0.0
    if holder_count > 0 and supply > 0:
        amounts = []
        for acc in largest_accounts:
            try:
                amounts.append(int(acc.get("amount", "0")))
            except Exception:
                amounts.append(0)
        if amounts:
            top_holder_pct = round(amounts[0] / supply * 100, 2)
            top10 = sum(amounts[:10])
            top10_pct = round(top10 / supply * 100, 2)

    if holder_count > 0 and holder_count < 5:
        score -= 20
        reasons.append({
            "type": "deduction",
            "points": -20,
            "label": "Very low holder count",
            "detail": f"Only {holder_count} holder(s) detected. High centralization risk.",
        })

    if top_holder_pct > 50:
        score -= 25
        reasons.append({
            "type": "deduction",
            "points": -25,
            "label": "Single wallet controls majority",
            "detail": f"Top holder owns {top_holder_pct}% of supply — dump/rug risk.",
        })
    elif top10_pct > 80:
        score -= 15
        reasons.append({
            "type": "deduction",
            "points": -15,
            "label": "High holder concentration",
            "detail": f"Top 10 holders own {top10_pct}% of supply.",
        })

    # Real liquidity signals from DexScreener
    liq_summary = {
        "totalLiquidityUsd": 0.0,
        "totalVolume24hUsd": 0.0,
        "priceUsd": None,
        "pairs": [],
        "pairCount": 0,
    }
    if liquidity:
        liq_summary = liquidity
        total_liq = liquidity.get("totalLiquidityUsd", 0) or 0
        total_vol = liquidity.get("totalVolume24hUsd", 0) or 0
        pair_count = liquidity.get("pairCount", 0) or 0
        if pair_count == 0:
            score -= 15
            reasons.append({
                "type": "deduction",
                "points": -15,
                "label": "No DEX pair found",
                "detail": "Token is not traded on any known Solana DEX — likely illiquid or unlisted.",
            })
        elif total_liq < 1_000:
            score -= 20
            reasons.append({
                "type": "deduction",
                "points": -20,
                "label": "Critically low liquidity",
                "detail": f"Total liquidity across {pair_count} pair(s) is only ${total_liq:,.2f} — very high slippage risk.",
            })
        elif total_liq < 10_000:
            score -= 10
            reasons.append({
                "type": "deduction",
                "points": -10,
                "label": "Low liquidity",
                "detail": f"Total liquidity is ${total_liq:,.2f} across {pair_count} pair(s).",
            })
        elif total_liq >= 100_000:
            reasons.append({
                "type": "addition",
                "points": 0,
                "label": "Healthy liquidity",
                "detail": f"${total_liq:,.2f} liquidity across {pair_count} pair(s).",
            })
        if total_vol < 100 and pair_count > 0:
            score -= 10
            reasons.append({
                "type": "deduction",
                "points": -10,
                "label": "Dead volume",
                "detail": f"24h trading volume is only ${total_vol:,.2f} — token may be abandoned.",
            })
    elif holder_count == 0:
        score -= 10
        reasons.append({
            "type": "deduction",
            "points": -10,
            "label": "Low/no liquidity detected",
            "detail": "Could not resolve holder accounts — likely illiquid or newly-deployed token.",
        })

    score = max(0, min(100, score))

    ui_supply = supply / (10 ** decimals) if decimals else supply

    return {
        "type": "token",
        "address": mint,
        "score": score,
        "riskLevel": _risk_level(score),
        "riskColor": _risk_color(score),
        "reasons": reasons,
        "insights": {
            "decimals": decimals,
            "supply": str(supply),
            "uiSupply": ui_supply,
            "mintAuthority": mint_authority,
            "freezeAuthority": freeze_authority,
            "mintAuthorityActive": bool(mint_authority),
            "freezeAuthorityActive": bool(freeze_authority),
            "holderSampleCount": holder_count,
            "topHolderPercent": top_holder_pct,
            "top10HolderPercent": top10_pct,
            "topHolders": [
                {
                    "address": a.get("address"),
                    "amount": a.get("amount"),
                    "uiAmount": a.get("uiAmount"),
                }
                for a in largest_accounts[:10]
            ],
            "liquidity": liq_summary,
            "verified": bool(verified),
            "verifiedIssuer": verified["issuer"] if verified else None,
            "verifiedSymbol": verified["symbol"] if verified else None,
            "verifiedName": verified["name"] if verified else None,
        },
    }
