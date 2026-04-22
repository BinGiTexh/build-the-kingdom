#!/bin/bash
# =============================================================================
# test-local.sh - Verify the docker-compose stack is working
# =============================================================================
# Usage: ./scripts/test-local.sh
# =============================================================================

set -e

echo "🚀 Job Platform Template - Local Test Suite"
echo "============================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Test function
test_endpoint() {
    local name=$1
    local url=$2
    local expected=$3
    
    echo -n "Testing $name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
    
    if [ "$response" == "$expected" ]; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP $response)"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC} (Expected $expected, got $response)"
        ((FAILED++))
    fi
}

# Test JSON response
test_json() {
    local name=$1
    local url=$2
    local key=$3
    
    echo -n "Testing $name... "
    
    response=$(curl -s "$url" 2>/dev/null)
    
    if echo "$response" | grep -q "$key"; then
        echo -e "${GREEN}✓ PASSED${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC} (Key '$key' not found)"
        ((FAILED++))
    fi
}

echo "📦 Checking services are running..."
echo ""

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 5

# 1. Database
echo ""
echo "🗄️  Database Tests"
echo "-------------------"
if docker exec jobplatform-db pg_isready -U postgres > /dev/null 2>&1; then
    echo -e "PostgreSQL connection: ${GREEN}✓ PASSED${NC}"
    ((PASSED++))
else
    echo -e "PostgreSQL connection: ${RED}✗ FAILED${NC}"
    ((FAILED++))
fi

# 2. API Endpoints
echo ""
echo "🔌 API Tests"
echo "-------------"
test_endpoint "Health check" "http://localhost:5000/api/health" "200"
test_json "Config endpoint" "http://localhost:5000/api/config" "siteName"
test_endpoint "Jobs endpoint" "http://localhost:5000/api/jobs" "200"

# 3. Frontend
echo ""
echo "🖥️  Frontend Tests"
echo "-------------------"
test_endpoint "Frontend home" "http://localhost:3000" "200"

# 4. Feature Tests
echo ""
echo "🧪 Feature Tests"
echo "-----------------"

# Test feed ingestion endpoint exists
test_endpoint "Feed routes" "http://localhost:5000/api/feeds/stats" "401"  # Should be 401 (auth required)

# Test redirect route exists
test_endpoint "Redirect route" "http://localhost:5000/go/apply/test" "404"  # Should be 404 (job not found)

# 5. Stripe (if enabled)
echo ""
echo "💳 Stripe Tests"
echo "----------------"
if [ "$STRIPE_ENABLED" == "true" ]; then
    test_endpoint "Payment routes" "http://localhost:5000/api/payments/config" "200"
else
    echo -e "Stripe disabled: ${YELLOW}SKIPPED${NC}"
fi

# Summary
echo ""
echo "============================================="
echo "📊 Test Summary"
echo "============================================="
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed! Stack is ready.${NC}"
    echo ""
    echo "Access points:"
    echo "  Frontend: http://localhost:3000"
    echo "  API:      http://localhost:5000"
    echo "  pgAdmin:  http://localhost:5050"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Check the logs:${NC}"
    echo "  docker-compose logs api"
    echo "  docker-compose logs frontend"
    exit 1
fi
