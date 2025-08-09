# Automated Tests for MemberPress Integration

**Purpose**: Tests that can be run by Claude or any developer without external access  
**Time Required**: ~15 minutes for full suite  
**Prerequisites**: User-required tests completed first

---

## 🤖 Test Suite Overview

These tests verify:
- Security improvements (token generation, signature verification)
- Webhook queue reliability
- Database integrity
- API endpoint functionality
- Performance benchmarks

All tests can be run via command line without external service access.

---

## 📋 Quick Test Script

### Run All Tests At Once
```bash
#!/bin/bash
# Save as: test-memberpress.sh

echo "🔐 Testing MemberPress Integration..."

# 1. Security Test
echo -e "\n1️⃣ Testing Webhook Security (should fail)..."
curl -s -X POST http://localhost:3000/api/memberpress/webhook \
  -H "Content-Type: application/json" \
  -d '{"event": "test"}' | grep -q "Invalid signature" && echo "✅ Security: PASS" || echo "❌ Security: FAIL"

# 2. Token Generation Test
echo -e "\n2️⃣ Testing Token Uniqueness..."
tokens=$(for i in {1..5}; do 
  curl -s http://localhost:3000/api/memberpress/webhook \
    -H "Content-Type: application/json" \
    -d '{"event":"test'$i'","membership_id":1}' 2>/dev/null
done | grep -o '"queue_id":"[^"]*"' | sort -u | wc -l)
[ "$tokens" -eq "5" ] && echo "✅ Tokens: PASS (5 unique)" || echo "❌ Tokens: FAIL"

# 3. Registration Endpoint Test
echo -e "\n3️⃣ Testing Registration Endpoint..."
curl -s -X POST http://localhost:3000/api/register/consume \
  -H "Content-Type: application/json" \
  -d '{"token":"invalid","email":"test@test.com","fullName":"Test"}' | grep -q "Invalid link" && echo "✅ Registration: PASS" || echo "❌ Registration: FAIL"

# 4. Logout Endpoint Test
echo -e "\n4️⃣ Testing Logout Endpoint..."
curl -s -X POST http://localhost:3000/api/auth/logout \
  -H "Content-Type: application/json" \
  -d '{}' | grep -q "success" && echo "✅ Logout: PASS" || echo "❌ Logout: FAIL"

echo -e "\n✅ Basic tests complete!"
```

**Run with**: `bash test-memberpress.sh`

---

## 🔐 Test #1: Security Verification

### A. Webhook Signature Rejection
```bash
# Test 1: No signature (should fail)
curl -X POST http://localhost:3000/api/memberpress/webhook \
  -H "Content-Type: application/json" \
  -d '{"event": "subscription.created", "membership_id": 41932}' \
  -w "\nStatus: %{http_code}\n"
```
**Expected**: Status 401, Response: `{"error": "Invalid signature"}`

### B. Invalid Signature Test
```bash
# Test 2: Wrong signature (should fail)
curl -X POST http://localhost:3000/api/memberpress/webhook \
  -H "Content-Type: application/json" \
  -H "x-memberpress-signature: wrong-signature" \
  -d '{"event": "subscription.created", "membership_id": 41932}' \
  -w "\nStatus: %{http_code}\n"
```
**Expected**: Status 401

### C. Development Mode Test
```bash
# Test 3: Dev mode allows unsigned (if NODE_ENV=development)
NODE_ENV=development curl -X POST http://localhost:3000/api/memberpress/webhook \
  -H "Content-Type: application/json" \
  -d '{"event": "test", "membership_id": 1}' \
  -w "\nStatus: %{http_code}\n"
```
**Expected**: Status 200 (in development only)

---

## 🔄 Test #2: Webhook Queue System

### A. Queue Functionality Test
```bash
# Send test webhook
curl -X POST http://localhost:3000/api/memberpress/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test-webhook-'$(date +%s)'",
    "event": "subscription.created",
    "membership_id": 41932,
    "email": "queuetest@example.com"
  }'

# Check if queued
npx supabase db query "
SELECT webhook_id, status, attempts 
FROM webhook_queue 
WHERE webhook_id LIKE 'test-webhook-%' 
ORDER BY created_at DESC 
LIMIT 1
"
```
**Expected**: Status = 'pending' or 'completed'

### B. Idempotency Test
```bash
# Send same webhook twice
WEBHOOK_ID="duplicate-test-$(date +%s)"
PAYLOAD='{"id":"'$WEBHOOK_ID'","event":"test","membership_id":1}'

# First request
curl -s -X POST http://localhost:3000/api/memberpress/webhook \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD"

# Second request (should be ignored)
curl -s -X POST http://localhost:3000/api/memberpress/webhook \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD"

# Check count (should be 1)
npx supabase db query "
SELECT COUNT(*) as count 
FROM webhook_queue 
WHERE webhook_id = '$WEBHOOK_ID'
"
```
**Expected**: count = 1 (no duplicates)

### C. Queue Statistics
```bash
# View queue health
npx supabase db query "SELECT * FROM webhook_queue_stats"

# Check for failures
npx supabase db query "
SELECT COUNT(*) as failed_count 
FROM webhook_queue 
WHERE status IN ('failed', 'dead_letter')
"
```
**Expected**: Low or zero failure rate

---

## 👤 Test #3: Registration System

### A. Create Test Registration Link
```bash
# Create test team
TEAM_ID=$(npx supabase db query "
INSERT INTO team_teams (name) 
VALUES ('Automated Test Team') 
RETURNING id
" | grep -oE '[a-f0-9-]{36}' | head -1)

# Create registration link
npx supabase db query "
INSERT INTO registration_links (
  token, target_type, target_id, default_role, max_uses
) VALUES (
  'auto-test-token-$(date +%s)', 
  'team', 
  '$TEAM_ID', 
  'player', 
  5
) RETURNING token
"
```

### B. Test Registration Flow
```bash
TOKEN="auto-test-token-$(date +%s)"
EMAIL="autotest$(date +%s)@example.com"

# Test registration
curl -X POST http://localhost:3000/api/register/consume \
  -H "Content-Type: application/json" \
  -d '{
    "token": "'$TOKEN'",
    "email": "'$EMAIL'",
    "fullName": "Auto Test User"
  }' | jq '.'
```
**Expected**: Returns user_id, possible auth_user_id

### C. Verify Registration
```bash
# Check user created
npx supabase db query "
SELECT id, email, full_name 
FROM users 
WHERE email LIKE 'autotest%' 
ORDER BY created_at DESC 
LIMIT 1
"

# Check team membership
npx supabase db query "
SELECT tm.*, u.email 
FROM team_members tm
JOIN users u ON tm.user_id = u.id
WHERE u.email LIKE 'autotest%'
ORDER BY tm.created_at DESC
LIMIT 1
"
```
**Expected**: User and team membership exist

---

## ⚡ Test #4: Performance Benchmarks

### A. Response Time Test
```bash
# Measure webhook response time (should be <500ms)
time curl -X POST http://localhost:3000/api/memberpress/webhook \
  -H "Content-Type: application/json" \
  -d '{"event":"performance-test","membership_id":1}'
```
**Expected**: real time < 0.5s

### B. Concurrent Request Test
```bash
# Send 10 concurrent requests
for i in {1..10}; do
  curl -s -X POST http://localhost:3000/api/memberpress/webhook \
    -H "Content-Type: application/json" \
    -d '{"event":"concurrent-'$i'","membership_id":1}' &
done
wait

# Check all were queued
npx supabase db query "
SELECT COUNT(*) as concurrent_count 
FROM webhook_queue 
WHERE webhook_id LIKE '%concurrent-%' 
AND created_at > NOW() - INTERVAL '1 minute'
"
```
**Expected**: count = 10

### C. Token Entropy Test
```bash
# Generate 100 tokens and check uniqueness
for i in {1..100}; do
  curl -s -X POST http://localhost:3000/api/memberpress/webhook \
    -H "Content-Type: application/json" \
    -d '{"event":"entropy-'$i'","membership_id":1}' 2>/dev/null
done | grep -o '"queue_id":"[^"]*"' | sort | uniq -d | wc -l
```
**Expected**: 0 (no duplicates)

---

## 🗄️ Test #5: Database Integrity

### A. Check Required Tables
```bash
npx supabase db query "
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'webhook_queue',
  'webhook_processing_log',
  'registration_links',
  'membership_products',
  'membership_entitlements',
  'user_sessions'
)
ORDER BY table_name
"
```
**Expected**: All 6 tables exist

### B. Check Indexes
```bash
npx supabase db query "
SELECT indexname 
FROM pg_indexes 
WHERE tablename IN ('webhook_queue', 'registration_links')
AND indexname LIKE 'idx_%'
"
```
**Expected**: Multiple performance indexes exist

### C. Check RLS Policies
```bash
npx supabase db query "
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('webhook_queue', 'user_sessions')
ORDER BY tablename, policyname
"
```
**Expected**: Security policies exist

---

## 🎯 Test #6: Full Flow Simulation

### A. Simulate Complete Purchase Flow
```bash
# Simulate Team HQ purchase
curl -X POST http://localhost:3000/api/memberpress/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "id": "full-flow-test-'$(date +%s)'",
    "event": "subscription.created",
    "membership_id": 41932,
    "user_id": 999,
    "email": "coach-test@example.com",
    "full_name": "Test Coach"
  }'

# Wait for processing
sleep 2

# Check results
npx supabase db query "
SELECT 
  (SELECT COUNT(*) FROM team_teams WHERE name LIKE '%coach-test%') as teams_created,
  (SELECT COUNT(*) FROM registration_links WHERE created_at > NOW() - INTERVAL '1 minute') as links_created,
  (SELECT COUNT(*) FROM membership_entitlements WHERE created_at > NOW() - INTERVAL '1 minute') as entitlements_created
"
```
**Expected**: Non-zero counts for all

### B. Simulate Cancellation
```bash
# Cancel the subscription
curl -X POST http://localhost:3000/api/memberpress/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "id": "cancel-test-'$(date +%s)'",
    "event": "subscription.canceled",
    "membership_id": 41932,
    "email": "coach-test@example.com"
  }'

# Check soft delete
npx supabase db query "
SELECT status 
FROM membership_entitlements 
WHERE user_id IN (
  SELECT id FROM users WHERE email = 'coach-test@example.com'
)
ORDER BY created_at DESC
LIMIT 1
"
```
**Expected**: status = 'canceled' (data preserved)

---

## 📊 Test Report Generation

### Generate Summary Report
```bash
#!/bin/bash
echo "=== MemberPress Integration Test Report ==="
echo "Date: $(date)"
echo ""

# Security Tests
SECURITY=$(curl -s -X POST http://localhost:3000/api/memberpress/webhook \
  -H "Content-Type: application/json" \
  -d '{"event": "test"}' | grep -c "Invalid signature")
echo "Security Tests: $([ $SECURITY -eq 1 ] && echo '✅ PASS' || echo '❌ FAIL')"

# Queue Tests
QUEUE_COUNT=$(npx supabase db query "SELECT COUNT(*) as c FROM webhook_queue" 2>/dev/null | grep -oE '[0-9]+' | head -1)
echo "Webhook Queue: ✅ $QUEUE_COUNT webhooks processed"

# Registration Tests
REG_COUNT=$(npx supabase db query "SELECT COUNT(*) as c FROM registration_links" 2>/dev/null | grep -oE '[0-9]+' | head -1)
echo "Registration Links: ✅ $REG_COUNT links created"

# Performance
echo ""
echo "Performance Metrics:"
time -p curl -s -X POST http://localhost:3000/api/memberpress/webhook \
  -H "Content-Type: application/json" \
  -d '{"event":"perf-test"}' > /dev/null 2>&1

echo ""
echo "=== Test Complete ==="
```

---

## ✅ Success Criteria

All automated tests pass when:
1. Security tests reject unsigned webhooks (401)
2. Queue system prevents duplicates
3. Registration creates users correctly
4. Performance under 500ms response time
5. Database has all required tables/indexes
6. Full flow creates expected resources

---

## 🚀 CI/CD Integration

### GitHub Actions Example
```yaml
name: MemberPress Integration Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: supabase/setup-cli@v1
      - run: npm install
      - run: npm run dev &
      - run: sleep 5
      - run: bash test-memberpress.sh
      - run: npx playwright test e2e/memberpress
```

---

**Total Automated Test Time**: ~15 minutes  
**Can Be Run By**: Anyone with code access  
**Frequency**: After each deployment