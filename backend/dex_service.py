"""DexScreener + Jupiter liquidity signals for SPL tokens."""
import httpx
from typing import Optional

DEXSCREENER_URL = "https://api.dexscreener.com/latest/dex/tokens/{mint}"
TIMEOUT = 6.0


async def get_token_liquidity(mint: str) -> Optional[dict]:
    """
    Returns:
      {
        totalLiquidityUsd: float,
        totalVolume24hUsd: float,
        priceUsd: float | None,
        pairs: [{dex, pair, liquidityUsd, volume24hUsd, priceUsd, url}],
        pairCount: int
      }
    or None if API/network failure.
    """
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            resp = await client.get(DEXSCREENER_URL.format(mint=mint))
            if resp.status_code != 200:
                return None
            data = resp.json()
    except Exception:
        return None

    pairs = data.get("pairs") or []
    if not pairs:
        return {
            "totalLiquidityUsd": 0.0,
            "totalVolume24hUsd": 0.0,
            "priceUsd": None,
            "pairs": [],
            "pairCount": 0,
        }

    # Filter to solana chain (DexScreener returns cross-chain sometimes)
    solana_pairs = [p for p in pairs if (p.get("chainId") or "").lower() == "solana"]
    if not solana_pairs:
        solana_pairs = pairs

    total_liq = 0.0
    total_vol = 0.0
    price = None
    parsed = []
    for p in solana_pairs[:20]:
        liq = float((p.get("liquidity") or {}).get("usd") or 0)
        vol = float((p.get("volume") or {}).get("h24") or 0)
        total_liq += liq
        total_vol += vol
        if price is None and p.get("priceUsd"):
            try:
                price = float(p["priceUsd"])
            except Exception:
                pass
        parsed.append({
            "dex": p.get("dexId"),
            "pair": f"{((p.get('baseToken') or {}).get('symbol') or '?')}/{((p.get('quoteToken') or {}).get('symbol') or '?')}",
            "liquidityUsd": round(liq, 2),
            "volume24hUsd": round(vol, 2),
            "priceUsd": float(p["priceUsd"]) if p.get("priceUsd") else None,
            "url": p.get("url"),
        })

    # Sort by liquidity desc
    parsed.sort(key=lambda x: x["liquidityUsd"], reverse=True)

    return {
        "totalLiquidityUsd": round(total_liq, 2),
        "totalVolume24hUsd": round(total_vol, 2),
        "priceUsd": price,
        "pairs": parsed[:10],
        "pairCount": len(solana_pairs),
    }
