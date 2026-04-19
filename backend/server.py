from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import asyncio
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
import uuid
from datetime import datetime, timezone, timedelta

from solana_service import (
    is_valid_solana_address,
    get_signatures_for_address,
    get_account_info,
    get_balance,
    get_token_supply,
    get_token_largest_accounts,
)
from dex_service import get_token_liquidity
from scoring import score_wallet, score_token, TRUSTED_PROGRAMS

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI(title="Web3 Scam Detector API")
api_router = APIRouter(prefix="/api")

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

CACHE_TTL_SECONDS = 300  # 5 minutes


# ---------- Models ----------
class AnalyzeRequest(BaseModel):
    address: str


class AnalyzeResponse(BaseModel):
    id: str
    type: Literal["wallet", "token"]
    address: str
    score: int
    riskLevel: str
    riskColor: str
    reasons: list
    insights: dict
    cached: bool = False
    analyzedAt: str


# ---------- Helpers ----------
async def _cache_get(address: str) -> Optional[dict]:
    cutoff = (datetime.now(timezone.utc) - timedelta(seconds=CACHE_TTL_SECONDS)).isoformat()
    doc = await db.analyses.find_one(
        {"address": address, "analyzedAt": {"$gte": cutoff}},
        {"_id": 0},
        sort=[("analyzedAt", -1)],
    )
    return doc


async def _cache_set(result: dict) -> None:
    doc = dict(result)
    await db.analyses.insert_one(doc)
    # keep only last 200 entries for recent-scans feed
    count = await db.analyses.count_documents({})
    if count > 500:
        # trim oldest beyond 500
        oldest = await db.analyses.find({}, {"_id": 1}).sort("analyzedAt", 1).limit(count - 500).to_list(1000)
        ids = [d["_id"] for d in oldest]
        if ids:
            await db.analyses.delete_many({"_id": {"$in": ids}})


def _is_token_mint(account_info: Optional[dict]) -> bool:
    if not account_info or not isinstance(account_info, dict):
        return False
    owner = account_info.get("owner")
    if owner not in {
        "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",  # SPL Token
        "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",   # Token-2022
    }:
        return False
    data = account_info.get("data") or {}
    if isinstance(data, dict):
        parsed = (data.get("parsed") or {})
        return parsed.get("type") == "mint"
    return False


async def _analyze_wallet_flow(address: str) -> dict:
    signatures, account_info, balance = await asyncio.gather(
        get_signatures_for_address(address, limit=100),
        get_account_info(address),
        get_balance(address),
        return_exceptions=True,
    )
    if isinstance(signatures, Exception):
        logger.warning(f"signatures error: {signatures}")
        signatures = []
    if isinstance(account_info, Exception):
        logger.warning(f"account_info error: {account_info}")
        account_info = None
    if isinstance(balance, Exception):
        logger.warning(f"balance error: {balance}")
        balance = 0
    return score_wallet(address, signatures, account_info, balance)


async def _analyze_token_flow(mint: str, account_info: Optional[dict]) -> dict:
    supply_info, largest, liquidity = await asyncio.gather(
        get_token_supply(mint),
        get_token_largest_accounts(mint),
        get_token_liquidity(mint),
        return_exceptions=True,
    )
    if isinstance(supply_info, Exception):
        supply_info = None
    if isinstance(largest, Exception):
        largest = []
    if isinstance(liquidity, Exception):
        liquidity = None
    return score_token(mint, account_info, largest or [], supply_info, liquidity)


async def _build_response(result: dict, cached: bool) -> AnalyzeResponse:
    return AnalyzeResponse(
        id=result.get("id") or str(uuid.uuid4()),
        type=result["type"],
        address=result["address"],
        score=result["score"],
        riskLevel=result["riskLevel"],
        riskColor=result["riskColor"],
        reasons=result["reasons"],
        insights=result["insights"],
        cached=cached,
        analyzedAt=result.get("analyzedAt") or datetime.now(timezone.utc).isoformat(),
    )


# ---------- Routes ----------
@api_router.get("/")
async def root():
    return {"service": "Web3 Scam Detector", "status": "ok"}


@api_router.get("/health")
async def health():
    rpc_ok = bool(os.environ.get("SOLANA_RPC_URL"))
    return {"status": "ok", "rpcConfigured": rpc_ok}


@api_router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(req: AnalyzeRequest):
    """Auto-detect whether input is a token mint or wallet, then score."""
    address = (req.address or "").strip()
    if not is_valid_solana_address(address):
        raise HTTPException(status_code=400, detail="Invalid Solana address")

    # cache hit?
    cached = await _cache_get(address)
    if cached:
        return await _build_response(cached, cached=True)

    try:
        acc = await get_account_info(address)
    except Exception as e:
        logger.error(f"account info failed: {e}")
        raise HTTPException(status_code=502, detail="Solana RPC unavailable")

    if _is_token_mint(acc):
        result = await _analyze_token_flow(address, acc)
    else:
        result = await _analyze_wallet_flow(address)

    result["id"] = str(uuid.uuid4())
    result["analyzedAt"] = datetime.now(timezone.utc).isoformat()
    await _cache_set(result)
    return await _build_response(result, cached=False)


@api_router.post("/analyze-wallet", response_model=AnalyzeResponse)
async def analyze_wallet(req: AnalyzeRequest):
    address = (req.address or "").strip()
    if not is_valid_solana_address(address):
        raise HTTPException(status_code=400, detail="Invalid Solana address")
    cached = await _cache_get(address)
    if cached and cached.get("type") == "wallet":
        return await _build_response(cached, cached=True)
    result = await _analyze_wallet_flow(address)
    result["id"] = str(uuid.uuid4())
    result["analyzedAt"] = datetime.now(timezone.utc).isoformat()
    await _cache_set(result)
    return await _build_response(result, cached=False)


@api_router.post("/analyze-token", response_model=AnalyzeResponse)
async def analyze_token(req: AnalyzeRequest):
    mint = (req.address or "").strip()
    if not is_valid_solana_address(mint):
        raise HTTPException(status_code=400, detail="Invalid Solana address")
    cached = await _cache_get(mint)
    if cached and cached.get("type") == "token":
        return await _build_response(cached, cached=True)
    try:
        acc = await get_account_info(mint)
    except Exception as e:
        logger.error(f"account info failed: {e}")
        raise HTTPException(status_code=502, detail="Solana RPC unavailable")
    if not _is_token_mint(acc):
        raise HTTPException(status_code=400, detail="Address is not a valid SPL token mint")
    result = await _analyze_token_flow(mint, acc)
    result["id"] = str(uuid.uuid4())
    result["analyzedAt"] = datetime.now(timezone.utc).isoformat()
    await _cache_set(result)
    return await _build_response(result, cached=False)


@api_router.get("/recent-scans")
async def recent_scans(limit: int = 10):
    limit = max(1, min(50, limit))
    docs = await db.analyses.find({}, {"_id": 0}).sort("analyzedAt", -1).limit(limit).to_list(limit)
    return [
        {
            "address": d["address"],
            "type": d["type"],
            "score": d["score"],
            "riskLevel": d["riskLevel"],
            "riskColor": d["riskColor"],
            "analyzedAt": d["analyzedAt"],
        }
        for d in docs
    ]


@api_router.get("/trusted-programs")
async def trusted_programs():
    return [{"programId": pid, "name": name} for pid, name in TRUSTED_PROGRAMS.items()]


# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
