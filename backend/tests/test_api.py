"""
Backend API tests for Web3 Scam Detector
Tests: /api/health, /api/analyze, /api/analyze-wallet, /api/analyze-token, /api/recent-scans
"""
import pytest
import requests
import os
import time

# Use the public URL from environment
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
if not BASE_URL:
    BASE_URL = "https://token-safety-1.preview.emergentagent.com"

# Test addresses from agent context
WALLET_ADDRESS = "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4"  # Jupiter program
TOKEN_ADDRESS = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"  # USDC
RANDOM_WALLET = "4Nd1mYbCzQ7u6k2sZcsd4Q8xYdJnGgB3uVQh4y1Cm9Tn"  # Random valid base58
INVALID_ADDRESS = "notavalidaddress"


class TestHealthEndpoint:
    """Health check endpoint tests"""
    
    def test_health_returns_ok(self):
        """GET /api/health returns status ok and rpcConfigured=true"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["rpcConfigured"] == True


class TestAnalyzeEndpoint:
    """POST /api/analyze endpoint tests"""
    
    def test_analyze_wallet_address(self):
        """Analyze a wallet address (Jupiter program) - should return type=wallet"""
        response = requests.post(
            f"{BASE_URL}/api/analyze",
            json={"address": WALLET_ADDRESS}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Validate response structure
        assert "id" in data
        assert data["type"] == "wallet"
        assert data["address"] == WALLET_ADDRESS
        assert 0 <= data["score"] <= 100
        assert data["riskLevel"] in ["Safe", "Suspicious", "High Risk"]
        assert data["riskColor"] in ["green", "yellow", "red"]
        assert isinstance(data["reasons"], list)
        assert isinstance(data["insights"], dict)
        assert "analyzedAt" in data
        
        # Validate wallet insights
        insights = data["insights"]
        assert "transactionCount" in insights
        assert "walletAgeDays" in insights
        print(f"Wallet {WALLET_ADDRESS[:8]}... score: {data['score']} ({data['riskLevel']})")
    
    def test_analyze_token_address(self):
        """Analyze a token mint (USDC) - should return type=token with token insights"""
        response = requests.post(
            f"{BASE_URL}/api/analyze",
            json={"address": TOKEN_ADDRESS}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Validate response structure
        assert data["type"] == "token"
        assert data["address"] == TOKEN_ADDRESS
        assert 0 <= data["score"] <= 100
        assert data["riskLevel"] in ["Safe", "Suspicious", "High Risk"]
        assert isinstance(data["reasons"], list)
        assert isinstance(data["insights"], dict)
        
        # Validate token insights
        insights = data["insights"]
        assert "mintAuthorityActive" in insights
        assert "freezeAuthorityActive" in insights
        assert "topHolderPercent" in insights
        assert "decimals" in insights
        print(f"Token {TOKEN_ADDRESS[:8]}... score: {data['score']} ({data['riskLevel']})")
    
    def test_analyze_invalid_address_returns_400(self):
        """Invalid address should return 400 error"""
        response = requests.post(
            f"{BASE_URL}/api/analyze",
            json={"address": INVALID_ADDRESS}
        )
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        assert "Invalid" in data["detail"]
    
    def test_analyze_empty_address_returns_400(self):
        """Empty address should return 400 error"""
        response = requests.post(
            f"{BASE_URL}/api/analyze",
            json={"address": ""}
        )
        assert response.status_code == 400


class TestAnalyzeWalletEndpoint:
    """POST /api/analyze-wallet dedicated endpoint tests"""
    
    def test_analyze_wallet_dedicated_route(self):
        """Dedicated wallet analysis route"""
        response = requests.post(
            f"{BASE_URL}/api/analyze-wallet",
            json={"address": WALLET_ADDRESS}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["type"] == "wallet"
        assert data["address"] == WALLET_ADDRESS
        assert 0 <= data["score"] <= 100
    
    def test_analyze_wallet_invalid_returns_400(self):
        """Invalid address on wallet route returns 400"""
        response = requests.post(
            f"{BASE_URL}/api/analyze-wallet",
            json={"address": INVALID_ADDRESS}
        )
        assert response.status_code == 400


class TestAnalyzeTokenEndpoint:
    """POST /api/analyze-token dedicated endpoint tests"""
    
    def test_analyze_token_dedicated_route(self):
        """Dedicated token analysis route"""
        response = requests.post(
            f"{BASE_URL}/api/analyze-token",
            json={"address": TOKEN_ADDRESS}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["type"] == "token"
        assert data["address"] == TOKEN_ADDRESS
        assert 0 <= data["score"] <= 100
        
        # Token-specific insights
        insights = data["insights"]
        assert "mintAuthorityActive" in insights
        assert "freezeAuthorityActive" in insights
    
    def test_analyze_token_invalid_returns_400(self):
        """Invalid address on token route returns 400"""
        response = requests.post(
            f"{BASE_URL}/api/analyze-token",
            json={"address": INVALID_ADDRESS}
        )
        assert response.status_code == 400


class TestRecentScansEndpoint:
    """GET /api/recent-scans endpoint tests"""
    
    def test_recent_scans_returns_array(self):
        """Recent scans should return an array"""
        response = requests.get(f"{BASE_URL}/api/recent-scans")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        # If there are scans, validate structure
        if len(data) > 0:
            scan = data[0]
            assert "address" in scan
            assert "type" in scan
            assert "score" in scan
            assert "riskLevel" in scan
            assert "riskColor" in scan
            assert "analyzedAt" in scan
            print(f"Found {len(data)} recent scans")
    
    def test_recent_scans_with_limit(self):
        """Recent scans respects limit parameter"""
        response = requests.get(f"{BASE_URL}/api/recent-scans?limit=5")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) <= 5


class TestCaching:
    """Cache functionality tests"""
    
    def test_cache_hit_on_second_request(self):
        """Same address requested twice within 5 min should return cached=true"""
        # First request
        response1 = requests.post(
            f"{BASE_URL}/api/analyze",
            json={"address": WALLET_ADDRESS}
        )
        assert response1.status_code == 200
        data1 = response1.json()
        
        # Small delay
        time.sleep(1)
        
        # Second request - should be cached
        response2 = requests.post(
            f"{BASE_URL}/api/analyze",
            json={"address": WALLET_ADDRESS}
        )
        assert response2.status_code == 200
        data2 = response2.json()
        
        # Second request should be cached
        assert data2["cached"] == True
        print(f"Cache test: First request cached={data1.get('cached', False)}, Second request cached={data2['cached']}")


class TestTrustedProgramsEndpoint:
    """GET /api/trusted-programs endpoint tests"""
    
    def test_trusted_programs_returns_list(self):
        """Trusted programs endpoint returns list of known programs"""
        response = requests.get(f"{BASE_URL}/api/trusted-programs")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        if len(data) > 0:
            program = data[0]
            assert "programId" in program
            assert "name" in program
            print(f"Found {len(data)} trusted programs")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
