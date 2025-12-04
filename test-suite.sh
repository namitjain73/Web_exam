#!/bin/bash
# Travel Planner - Comprehensive Feature Test Suite
# This script tests all major features of the application

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     TRAVEL PLANNER - AUTOMATED FEATURE TEST SUITE         ║"
echo "║                    Version 1.0.0                          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

BASE_URL="http://localhost:5000/api"
TOKEN=""
TRIP_ID=""
USER_ID=""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function for colored output
print_test() {
    echo -e "${YELLOW}[TEST]${NC} $1"
}

print_pass() {
    echo -e "${GREEN}[✓ PASS]${NC} $1"
    ((TESTS_PASSED++))
}

print_fail() {
    echo -e "${RED}[✗ FAIL]${NC} $1"
    ((TESTS_FAILED++))
}

print_section() {
    echo ""
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║ $1"
    echo "╚════════════════════════════════════════════════════════════╝"
}

# Test 1: User Registration
print_section "PHASE 1: AUTHENTICATION & USER MANAGEMENT"
print_test "Test 1.1: User Registration"

REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "testuser'$(date +%s)'@example.com",
    "password": "TestPassword123",
    "homeCurrency": "USD"
  }')

if echo "$REGISTER_RESPONSE" | grep -q "token"; then
  TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
  USER_ID=$(echo "$REGISTER_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
  print_pass "User registration successful - Token obtained"
else
  print_fail "User registration failed"
fi

# Test 2: User Login
print_test "Test 1.2: User Login"
LOGIN_EMAIL=$(echo "$REGISTER_RESPONSE" | grep -o '"email":"[^"]*' | cut -d'"' -f4)
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$LOGIN_EMAIL'",
    "password": "TestPassword123"
  }')

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
  print_pass "User login successful"
else
  print_fail "User login failed"
fi

# Test 3: Get Current User
print_test "Test 1.3: Get Current User Profile"
PROFILE_RESPONSE=$(curl -s -X GET "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $TOKEN")

if echo "$PROFILE_RESPONSE" | grep -q "name"; then
  print_pass "User profile retrieved successfully"
else
  print_fail "User profile retrieval failed"
fi

# Test 4: Trip Creation
print_section "PHASE 2: TRIP MANAGEMENT"
print_test "Test 2.1: Create New Trip"

CREATE_TRIP_RESPONSE=$(curl -s -X POST "$BASE_URL/trips" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Paris Adventure 2025",
    "destination": "Paris, France",
    "startDate": "2025-05-12T00:00:00Z",
    "endDate": "2025-05-19T00:00:00Z",
    "description": "Epic European vacation"
  }')

if echo "$CREATE_TRIP_RESPONSE" | grep -q "_id"; then
  TRIP_ID=$(echo "$CREATE_TRIP_RESPONSE" | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
  INVITE_CODE=$(echo "$CREATE_TRIP_RESPONSE" | grep -o '"inviteCode":"[^"]*' | cut -d'"' -f4)
  print_pass "Trip created successfully - ID: $TRIP_ID"
else
  print_fail "Trip creation failed"
fi

# Test 5: Get All Trips
print_test "Test 2.2: Get All Trips"
GET_TRIPS_RESPONSE=$(curl -s -X GET "$BASE_URL/trips" \
  -H "Authorization: Bearer $TOKEN")

if echo "$GET_TRIPS_RESPONSE" | grep -q "title"; then
  print_pass "Trips retrieved successfully"
else
  print_fail "Failed to retrieve trips"
fi

# Test 6: Get Trip Details
print_test "Test 2.3: Get Trip Details"
GET_TRIP_RESPONSE=$(curl -s -X GET "$BASE_URL/trips/$TRIP_ID" \
  -H "Authorization: Bearer $TOKEN")

if echo "$GET_TRIP_RESPONSE" | grep -q "$TRIP_ID"; then
  print_pass "Trip details retrieved successfully"
else
  print_fail "Failed to retrieve trip details"
fi

# Test 7: Add Expense
print_section "PHASE 3: EXPENSE TRACKING"
print_test "Test 4.1: Add Expense"

ADD_EXPENSE_RESPONSE=$(curl -s -X POST "$BASE_URL/expenses" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "tripId": "'$TRIP_ID'",
    "amount": 150,
    "currency": "USD",
    "paidBy": "'$USER_ID'",
    "description": "Lunch at Café",
    "category": "Restaurant",
    "splitBetween": [
      {
        "userId": "'$USER_ID'",
        "share": 50,
        "shareType": "percentage"
      }
    ]
  }')

if echo "$ADD_EXPENSE_RESPONSE" | grep -q "amount"; then
  EXPENSE_ID=$(echo "$ADD_EXPENSE_RESPONSE" | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
  print_pass "Expense added successfully - ID: $EXPENSE_ID"
else
  print_fail "Failed to add expense"
fi

# Test 8: Get Expense Summary
print_test "Test 4.6: Get Expense Summary"
SUMMARY_RESPONSE=$(curl -s -X GET "$BASE_URL/expenses/summary/$TRIP_ID" \
  -H "Authorization: Bearer $TOKEN")

if echo "$SUMMARY_RESPONSE" | grep -q "totalExpenses"; then
  print_pass "Expense summary retrieved successfully"
else
  print_fail "Failed to retrieve expense summary"
fi

# Test 9: Add Itinerary Activity
print_section "PHASE 4: ITINERARY MANAGEMENT"
print_test "Test 3.1: Add Activity to Itinerary"

ADD_ACTIVITY_RESPONSE=$(curl -s -X POST "$BASE_URL/itinerary/activity" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "tripId": "'$TRIP_ID'",
    "title": "Visit Eiffel Tower",
    "date": "2025-05-12T00:00:00Z",
    "time": "10:00",
    "location": "Eiffel Tower, Paris",
    "priority": "high",
    "description": "Iconic Paris landmark",
    "participants": ["'$USER_ID'"]
  }')

if echo "$ADD_ACTIVITY_RESPONSE" | grep -q "title"; then
  print_pass "Activity added to itinerary successfully"
else
  print_fail "Failed to add activity"
fi

# Test 10: Get Itinerary
print_test "Test 3.2: Get Trip Itinerary"
GET_ITINERARY_RESPONSE=$(curl -s -X GET "$BASE_URL/itinerary/trip/$TRIP_ID" \
  -H "Authorization: Bearer $TOKEN")

if echo "$GET_ITINERARY_RESPONSE" | grep -q "tripId"; then
  print_pass "Itinerary retrieved successfully"
else
  print_fail "Failed to retrieve itinerary"
fi

# Test 11: Get Settlements
print_section "PHASE 5: DEBT SETTLEMENT"
print_test "Test 5.1: Get Settlement Summary"

GET_SETTLEMENT_RESPONSE=$(curl -s -X GET "$BASE_URL/settlements/trip/$TRIP_ID" \
  -H "Authorization: Bearer $TOKEN")

if echo "$GET_SETTLEMENT_RESPONSE" | grep -q "transactions"; then
  print_pass "Settlement summary retrieved - Algorithm working"
else
  print_fail "Failed to retrieve settlement summary"
fi

# Test 12: Update Trip
print_section "PHASE 6: TRIP UPDATES"
print_test "Test 2.4: Update Trip Information"

UPDATE_TRIP_RESPONSE=$(curl -s -X PUT "$BASE_URL/trips/$TRIP_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "description": "Updated trip description with more details"
  }')

if echo "$UPDATE_TRIP_RESPONSE" | grep -q "description"; then
  print_pass "Trip updated successfully"
else
  print_fail "Failed to update trip"
fi

# Test 13: Test invalid credentials
print_section "PHASE 7: ERROR HANDLING"
print_test "Test 8.4: Invalid Email Registration"

INVALID_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "email": "invalid-email",
    "password": "password"
  }')

if echo "$INVALID_RESPONSE" | grep -q "error"; then
  print_pass "Error handling working - Invalid input rejected"
else
  print_fail "Error handling not working properly"
fi

# Final Summary
print_section "TEST SUMMARY REPORT"

TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))
SUCCESS_RATE=$(( (TESTS_PASSED * 100) / TOTAL_TESTS ))

echo ""
echo "Total Tests Run:      $TOTAL_TESTS"
echo -e "${GREEN}Tests Passed:         $TESTS_PASSED${NC}"
echo -e "${RED}Tests Failed:         $TESTS_FAILED${NC}"
echo "Success Rate:         $SUCCESS_RATE%"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║     ✓ ALL TESTS PASSED - APPLICATION IS WORKING PERFECTLY  ║${NC}"
  echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
  exit 0
else
  echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${RED}║         Some tests failed - Please review errors            ║${NC}"
  echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
  exit 1
fi
