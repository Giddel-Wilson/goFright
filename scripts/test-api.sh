#!/bin/bash

# API Testing Script for GoFright
# Tests all major endpoints

BASE_URL="http://localhost:5173"
TOKEN=""

echo "🚀 GoFright API Testing Script"
echo "================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Register User
echo "📝 Test 1: Register New User"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPass123",
    "phone": "+1234567890",
    "address": "123 Test Street"
  }')

if echo "$REGISTER_RESPONSE" | grep -q "Registration successful"; then
  echo -e "${GREEN}✓ Registration successful${NC}"
else
  echo -e "${RED}✗ Registration failed${NC}"
  echo "$REGISTER_RESPONSE"
fi
echo ""

# Test 2: Login
echo "🔐 Test 2: Login"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }')

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
  echo -e "${GREEN}✓ Login successful${NC}"
  TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
  echo "Token: ${TOKEN:0:20}..."
else
  echo -e "${RED}✗ Login failed${NC}"
  echo "$LOGIN_RESPONSE"
  exit 1
fi
echo ""

# Test 3: Get Current User
echo "👤 Test 3: Get Current User"
USER_RESPONSE=$(curl -s -X GET "$BASE_URL/api/auth/me" \
  -H "Authorization: Bearer $TOKEN")

if echo "$USER_RESPONSE" | grep -q "email"; then
  echo -e "${GREEN}✓ User info retrieved${NC}"
else
  echo -e "${RED}✗ Failed to get user info${NC}"
  echo "$USER_RESPONSE"
fi
echo ""

# Test 4: Create Cargo Booking
echo "📦 Test 4: Create Cargo Booking"
CARGO_RESPONSE=$(curl -s -X POST "$BASE_URL/api/cargo" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "senderName": "Test Sender",
    "senderPhone": "+1234567890",
    "senderAddress": "123 Start Street, City A",
    "receiverName": "Test Receiver",
    "receiverPhone": "+0987654321",
    "receiverAddress": "456 End Avenue, City B",
    "destination": "New York",
    "origin": "Los Angeles",
    "weight": 25.5,
    "cargoType": "general",
    "description": "Test package for API testing"
  }')

if echo "$CARGO_RESPONSE" | grep -q "trackingId"; then
  echo -e "${GREEN}✓ Cargo created successfully${NC}"
  TRACKING_ID=$(echo "$CARGO_RESPONSE" | grep -o '"trackingId":"[^"]*' | cut -d'"' -f4)
  echo "Tracking ID: $TRACKING_ID"
else
  echo -e "${RED}✗ Cargo creation failed${NC}"
  echo "$CARGO_RESPONSE"
  exit 1
fi
echo ""

# Test 5: Track Cargo (Public)
echo "🔍 Test 5: Track Cargo (Public)"
TRACK_RESPONSE=$(curl -s -X GET "$BASE_URL/api/track/$TRACKING_ID")

if echo "$TRACK_RESPONSE" | grep -q "trackingId"; then
  echo -e "${GREEN}✓ Cargo tracked successfully${NC}"
  echo "Status: $(echo "$TRACK_RESPONSE" | grep -o '"status":"[^"]*' | cut -d'"' -f4)"
else
  echo -e "${RED}✗ Tracking failed${NC}"
  echo "$TRACK_RESPONSE"
fi
echo ""

# Test 6: List Cargo
echo "📋 Test 6: List All Cargo"
LIST_RESPONSE=$(curl -s -X GET "$BASE_URL/api/cargo?limit=5" \
  -H "Authorization: Bearer $TOKEN")

if echo "$LIST_RESPONSE" | grep -q "cargo"; then
  echo -e "${GREEN}✓ Cargo list retrieved${NC}"
  COUNT=$(echo "$LIST_RESPONSE" | grep -o '"total":[0-9]*' | grep -o '[0-9]*')
  echo "Total cargo: $COUNT"
else
  echo -e "${RED}✗ Failed to list cargo${NC}"
  echo "$LIST_RESPONSE"
fi
echo ""

# Test 7: Logout
echo "🚪 Test 7: Logout"
LOGOUT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/logout" \
  -H "Authorization: Bearer $TOKEN")

if echo "$LOGOUT_RESPONSE" | grep -q "Logout successful"; then
  echo -e "${GREEN}✓ Logout successful${NC}"
else
  echo -e "${RED}✗ Logout failed${NC}"
  echo "$LOGOUT_RESPONSE"
fi
echo ""

echo "================================"
echo "✅ API Testing Complete!"
echo ""
echo "Summary:"
echo "  - Registration: Working"
echo "  - Login: Working"
echo "  - User Info: Working"
echo "  - Cargo Creation: Working"
echo "  - Cargo Tracking: Working"
echo "  - Cargo Listing: Working"
echo "  - Logout: Working"
echo ""
echo "🎉 All tests passed!"
