"""
Backend API tests for Web3 Scam Detector - New Features (Iteration 2)
Tests: DEX liquidity integration, txTimeline for wallets, extension zip download
"""
import pytest
import requests
import os

# Use the public URL from environment
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
if not BASE_URL:
    BASE_URL = "https://scam-check-j8fe.vercel.app/"

# Test addresses
USDC_TOKEN = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"  # USDC - has high liquidity
JUPITER_WALLET = "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4"  # Jupiter program


class TestTokenLiquidityIntegration:
    """Tests for DEX liquidity integration via DexScreener API"""
    
    def test_usdc_token_has_liquidity_object(self):
        """POST /api/analyze-token for USDC returns insights.liquidity object"""
        response = requests.post(
            f"{BASE_URL}/api/analyze-token",
            json={"address": USDC_TOKEN}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify liquidity object exists
        assert "insights" in data
        insights = data["insights"]
        assert "liquidity" in insights
        
        liquidity = insights["liquidity"]
        assert "totalLiquidityUsd" in liquidity
        assert "priceUsd" in liquidity
        assert "pairs" in liquidity
        assert "pairCount" in liquidity
        
        print(f"USDC liquidity: ${liquidity['totalLiquidityUsd']:,.2f}")
    
    def test_usdc_has_positive_liquidity(self):
        """USDC should have totalLiquidityUsd > 0"""
        response = requests.post(
            f"{BASE_URL}/api/analyze-token",
            json={"address": USDC_TOKEN}
        )
        assert response.status_code == 200
        data = response.json()
        
        liquidity = data["insights"]["liquidity"]
        assert liquidity["totalLiquidityUsd"] > 0, "USDC should have positive liquidity"
        assert liquidity["pairCount"] > 0, "USDC should have DEX pairs"
        
        print(f"USDC has {liquidity['pairCount']} pairs with ${liquidity['totalLiquidityUsd']:,.2f} liquidity")
    
    def test_usdc_has_pairs_array(self):
        """USDC liquidity should have pairs array with expected structure"""
        response = requests.post(
            f"{BASE_URL}/api/analyze-token",
            json={"address": USDC_TOKEN}
        )
        assert response.status_code == 200
        data = response.json()
        
        pairs = data["insights"]["liquidity"]["pairs"]
        assert isinstance(pairs, list)
        assert len(pairs) > 0, "USDC should have at least one pair"
        
        # Validate pair structure
        pair = pairs[0]
        assert "dex" in pair
        assert "pair" in pair
        assert "liquidityUsd" in pair
        assert "volume24hUsd" in pair
        
        print(f"First pair: {pair['dex']} - {pair['pair']} - ${pair['liquidityUsd']:,.2f}")
    
    def test_usdc_has_price(self):
        """USDC should have priceUsd close to $1"""
        response = requests.post(
            f"{BASE_URL}/api/analyze-token",
            json={"address": USDC_TOKEN}
        )
        assert response.status_code == 200
        data = response.json()
        
        price = data["insights"]["liquidity"]["priceUsd"]
        assert price is not None, "USDC should have a price"
        assert 0.95 <= price <= 1.05, f"USDC price should be ~$1, got ${price}"
        
        print(f"USDC price: ${price}")


class TestTokenLiquidityScoring:
    """Tests for liquidity-based scoring reasons"""
    
    def test_usdc_has_healthy_liquidity_reason(self):
        """USDC with high liquidity should have 'Healthy liquidity' reason"""
        response = requests.post(
            f"{BASE_URL}/api/analyze-token",
            json={"address": USDC_TOKEN}
        )
        assert response.status_code == 200
        data = response.json()
        
        reasons = data["reasons"]
        reason_labels = [r["label"] for r in reasons]
        
        # USDC has >$100k liquidity, should show "Healthy liquidity"
        assert "Healthy liquidity" in reason_labels, f"Expected 'Healthy liquidity' in reasons: {reason_labels}"
        
        print(f"USDC reasons: {reason_labels}")
    
    def test_usdc_score_around_55(self):
        """USDC should score around 55 (Suspicious) due to mint/freeze authority"""
        response = requests.post(
            f"{BASE_URL}/api/analyze-token",
            json={"address": USDC_TOKEN}
        )
        assert response.status_code == 200
        data = response.json()
        
        # USDC has mint authority (-30) and freeze authority (-15) = 55
        assert 45 <= data["score"] <= 65, f"USDC score should be ~55, got {data['score']}"
        assert data["riskLevel"] == "Suspicious"
        
        print(f"USDC score: {data['score']} ({data['riskLevel']})")
    
    def test_token_reasons_include_authority_checks(self):
        """Token reasons should include mint/freeze authority checks"""
        response = requests.post(
            f"{BASE_URL}/api/analyze-token",
            json={"address": USDC_TOKEN}
        )
        assert response.status_code == 200
        data = response.json()
        
        reason_labels = [r["label"] for r in data["reasons"]]
        
        # USDC has both authorities active
        assert "Mint authority active" in reason_labels
        assert "Freeze authority active" in reason_labels
        
        print(f"Authority reasons verified: {reason_labels}")


class TestWalletTxTimeline:
    """Tests for wallet transaction timeline (30-day buckets)"""
    
    def test_wallet_has_tx_timeline(self):
        """POST /api/analyze-wallet returns insights.txTimeline array"""
        response = requests.post(
            f"{BASE_URL}/api/analyze-wallet",
            json={"address": JUPITER_WALLET}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "insights" in data
        insights = data["insights"]
        assert "txTimeline" in insights
        
        timeline = insights["txTimeline"]
        assert isinstance(timeline, list)
        
        print(f"txTimeline has {len(timeline)} buckets")
    
    def test_wallet_tx_timeline_has_30_buckets(self):
        """txTimeline should have exactly 30 daily buckets"""
        response = requests.post(
            f"{BASE_URL}/api/analyze-wallet",
            json={"address": JUPITER_WALLET}
        )
        assert response.status_code == 200
        data = response.json()
        
        timeline = data["insights"]["txTimeline"]
        assert len(timeline) == 30, f"Expected 30 buckets, got {len(timeline)}"
        
        print(f"Timeline has exactly 30 buckets")
    
    def test_wallet_tx_timeline_bucket_structure(self):
        """Each bucket should have date, count, failed fields"""
        response = requests.post(
            f"{BASE_URL}/api/analyze-wallet",
            json={"address": JUPITER_WALLET}
        )
        assert response.status_code == 200
        data = response.json()
        
        timeline = data["insights"]["txTimeline"]
        
        for bucket in timeline:
            assert "date" in bucket, "Bucket should have 'date'"
            assert "count" in bucket, "Bucket should have 'count'"
            assert "failed" in bucket, "Bucket should have 'failed'"
            assert isinstance(bucket["count"], int)
            assert isinstance(bucket["failed"], int)
        
        print(f"All 30 buckets have correct structure")
    
    def test_wallet_tx_timeline_dates_are_valid(self):
        """Timeline dates should be in YYYY-MM-DD format"""
        response = requests.post(
            f"{BASE_URL}/api/analyze-wallet",
            json={"address": JUPITER_WALLET}
        )
        assert response.status_code == 200
        data = response.json()
        
        timeline = data["insights"]["txTimeline"]
        
        import re
        date_pattern = re.compile(r'^\d{4}-\d{2}-\d{2}$')
        
        for bucket in timeline:
            assert date_pattern.match(bucket["date"]), f"Invalid date format: {bucket['date']}"
        
        print(f"All dates are valid YYYY-MM-DD format")


class TestExtensionZipDownload:
    """Tests for Chrome extension zip download"""
    
    def test_extension_zip_returns_200(self):
        """GET /extension/scamcheck-extension.zip returns HTTP 200"""
        response = requests.get(
            f"{BASE_URL}/extension/scamcheck-extension.zip",
            stream=True
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        print(f"Extension zip returns 200")
    
    def test_extension_zip_has_content(self):
        """Extension zip should be at least several KB"""
        response = requests.get(
            f"{BASE_URL}/extension/scamcheck-extension.zip",
            stream=True
        )
        assert response.status_code == 200
        
        content_length = len(response.content)
        assert content_length > 5000, f"Zip should be >5KB, got {content_length} bytes"
        
        print(f"Extension zip size: {content_length} bytes")
    
    def test_extension_zip_is_valid_zip(self):
        """Extension download should be a valid zip file"""
        import zipfile
        import io
        
        response = requests.get(
            f"{BASE_URL}/extension/scamcheck-extension.zip"
        )
        assert response.status_code == 200
        
        # Try to open as zip
        try:
            with zipfile.ZipFile(io.BytesIO(response.content)) as zf:
                file_list = zf.namelist()
                assert len(file_list) > 0, "Zip should contain files"
                print(f"Zip contains {len(file_list)} files: {file_list[:5]}...")
        except zipfile.BadZipFile:
            pytest.fail("Downloaded file is not a valid zip")
    
    def test_extension_zip_contains_manifest(self):
        """Extension zip should contain manifest.json"""
        import zipfile
        import io
        
        response = requests.get(
            f"{BASE_URL}/extension/scamcheck-extension.zip"
        )
        assert response.status_code == 200
        
        with zipfile.ZipFile(io.BytesIO(response.content)) as zf:
            file_list = zf.namelist()
            assert "manifest.json" in file_list, f"manifest.json not found in zip: {file_list}"
        
        print("manifest.json found in extension zip")
    
    def test_extension_zip_contains_required_files(self):
        """Extension zip should contain all required Chrome extension files"""
        import zipfile
        import io
        
        response = requests.get(
            f"{BASE_URL}/extension/scamcheck-extension.zip"
        )
        assert response.status_code == 200
        
        required_files = ["manifest.json", "content.js", "background.js", "popup.html"]
        
        with zipfile.ZipFile(io.BytesIO(response.content)) as zf:
            file_list = zf.namelist()
            for req_file in required_files:
                assert req_file in file_list, f"{req_file} not found in zip"
        
        print(f"All required files found: {required_files}")


class TestExistingFeaturesStillWork:
    """Regression tests for previously-working features"""
    
    def test_health_endpoint(self):
        """GET /api/health still works"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["rpcConfigured"] == True
    
    def test_analyze_auto_detection(self):
        """POST /api/analyze still auto-detects wallet vs token"""
        # Test wallet
        response = requests.post(
            f"{BASE_URL}/api/analyze",
            json={"address": JUPITER_WALLET}
        )
        assert response.status_code == 200
        assert response.json()["type"] == "wallet"
        
        # Test token
        response = requests.post(
            f"{BASE_URL}/api/analyze",
            json={"address": USDC_TOKEN}
        )
        assert response.status_code == 200
        assert response.json()["type"] == "token"
    
    def test_recent_scans_endpoint(self):
        """GET /api/recent-scans still works"""
        response = requests.get(f"{BASE_URL}/api/recent-scans")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
