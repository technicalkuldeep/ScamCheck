"""Solana RPC client using Alchemy endpoint."""
import os
import base58
import httpx
from dotenv import load_dotenv
from pathlib import Path
from typing import Any, Optional

load_dotenv(Path(__file__).parent / ".env")

RPC_TIMEOUT = 8.0


def _rpc_url() -> str:
    url = os.environ.get("SOLANA_RPC_URL")
    if not url:
        raise RuntimeError("SOLANA_RPC_URL is not configured")
    return url


def is_valid_solana_address(addr: str) -> bool:
    """Base58 validation; Solana addresses decode to 32 bytes."""
    if not isinstance(addr, str):
        return False
    addr = addr.strip()
    if len(addr) < 32 or len(addr) > 44:
        return False
    try:
        decoded = base58.b58decode(addr)
        return len(decoded) == 32
    except Exception:
        return False


async def _rpc_call(method: str, params: list) -> Any:
    payload = {"jsonrpc": "2.0", "id": 1, "method": method, "params": params}
    async with httpx.AsyncClient(timeout=RPC_TIMEOUT) as client:
        resp = await client.post(_rpc_url(), json=payload)
        resp.raise_for_status()
        data = resp.json()
        if "error" in data:
            raise RuntimeError(f"RPC error {method}: {data['error']}")
        return data.get("result")


async def get_signatures_for_address(address: str, limit: int = 100) -> list:
    return await _rpc_call("getSignaturesForAddress", [address, {"limit": limit}]) or []


async def get_account_info(address: str) -> Optional[dict]:
    res = await _rpc_call("getAccountInfo", [address, {"encoding": "jsonParsed"}])
    if not res:
        return None
    return res.get("value")


async def get_balance(address: str) -> int:
    res = await _rpc_call("getBalance", [address])
    return (res or {}).get("value", 0) if isinstance(res, dict) else 0


async def get_token_supply(mint: str) -> Optional[dict]:
    try:
        res = await _rpc_call("getTokenSupply", [mint])
        return (res or {}).get("value") if res else None
    except Exception:
        return None


async def get_token_largest_accounts(mint: str) -> list:
    try:
        res = await _rpc_call("getTokenLargestAccounts", [mint])
        return (res or {}).get("value", []) if res else []
    except Exception:
        return []


async def get_transaction(signature: str) -> Optional[dict]:
    try:
        return await _rpc_call(
            "getTransaction",
            [signature, {"encoding": "jsonParsed", "maxSupportedTransactionVersion": 0}],
        )
    except Exception:
        return None
