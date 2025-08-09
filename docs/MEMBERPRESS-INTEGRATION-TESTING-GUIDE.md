# MemberPress Integration Testing Guide

**Last Updated**: January 9, 2025  
**Purpose**: Step-by-step testing of all MemberPress integration security fixes and features

---

## 🚀 Pre-Testing Setup

### 1. Verify Environment Variables
Check that `.env.local` has all required values:
```bash
# Check if all variables are set
cat .env.local | grep -E "(MEMBERPRESS|SENDGRID|WEBHOOK)"
```

Expected variables:
- ✅ `MEMBERPRESS_WEBHOOK_SECRET=OhcMrZXxU0`
- ✅ `SENDGRID_API_KEY=SG.gTiqG6TtRN6i5o7lXYjZtA...`
- ✅ `SENDGRID_FROM_EMAIL=team@powlax.com`
- ✅ `WEBHOOK_QUEUE_ENABLED=true`

### 2. Apply Database Migrations
```bash
# Push all new migrations to Supabase
npx supabase db push

# Verify tables were created
npx supabase db diff
```

Expected new tables:
- `webhook_queue`
- `webhook_processing_log`
- `user_sessions`
- `registration_links`
- `membership_products`
- `membership_entitlements`

### 3. Verify Server is Running
```bash
# Check if server is on port 3000
lsof -ti:3000

# If not running, start it
npm run dev
```

---

## 🧪 Test 1: Webhook Security

### A. Test Signature Verification (Should FAIL)
```bash
# Send webhook WITHOUT signature - should be rejected
curl -X POST http://localhost:3000/api/memberpress/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "subscription.created",
    "membership_id": 41932,
    "email": "test@example.com",
    "full_name": "Test User"
  }' \
  -v
```

**Expected Result**: 
- Status: `401 Unauthorized`
- Response: `{"error": "Invalid signature"}`
- ✅ This proves signature verification is working

### B. Test with Valid Signature (Should SUCCEED)
```bash
# Generate valid signature using your secret
PAYLOAD='{"event":"subscription.created","membership_id":41932,"email":"test@example.com"}'
SECRET="OhcMrZXxU0"
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" -binary | xxd -p)

# Send with signature
curl -X POST http://localhost:3000/api/memberpress/webhook \
  -H "Content-Type: application/json" \
  -H "x-memberpress-signature: $SIGNATURE" \
  -d "$PAYLOAD" \
  -v
```

**Expected Result**:
- Status: `200 OK`
- Response: `{"ok": true, "queued": true, "queue_id": "..."}`

### C. Check Webhook Was Logged
```bash
# Check webhook_events table in Supabase
npx supabase db query "SELECT id, source, payload->>'_meta' as meta FROM webhook_events ORDER BY received_at DESC LIMIT 5"
```

**Expected**: See your webhook with signature validation status

---

## 🧪 Test 2: Email Service (SendGrid)

### A. Test Magic Link Email
```bash
# Request a magic link for your email
curl -X POST http://localhost:3000/api/auth/magic-link \
  -H "Content-Type: application/json" \
  -d '{"email": "your-real-email@example.com"}' \
  -v
```

**Expected Result**:
- Status: `200 OK`
- Response: `{"success": true, "message": "Magic link sent to your email"}`
- 📧 **Check your email** for a branded POWLAX login link

**Email Should Have**:
- POWLAX logo in dark blue (#0A2240)
- Blue login button (#2E69B7)
- Gold warning box about expiration (#D7B349)
- Mobile-responsive design

### B. Test Email Template Colors
Open the email and verify:
- [ ] Primary button is blue (#2E69B7)
- [ ] Hover color changes to dark blue (#0A2240)
- [ ] Warning box has gold border (#D7B349)
- [ ] POWLAX branding is consistent

---

## 🧪 Test 3: Registration Flow

### A. Create a Test Registration Link
```bash
# First, create a test team in database
npx supabase db query "
INSERT INTO team_teams (id, name, created_at) 
VALUES (gen_random_uuid(), 'Test Team', NOW())
RETURNING id
"
# Note the team ID returned

# Create a registration link
TEAM_ID="[team-id-from-above]"
npx supabase db query "
INSERT INTO registration_links (
  token, 
  target_type, 
  target_id, 
  default_role, 
  max_uses
) VALUES (
  'test-token-123', 
  'team', 
  '$TEAM_ID', 
  'player', 
  10
)
"
```

### B. Test Registration Consumer
```bash
# Test registration with the link
curl -X POST http://localhost:3000/api/register/consume \
  -H "Content-Type: application/json" \
  -d '{
    "token": "test-token-123",
    "email": "newplayer@example.com",
    "fullName": "New Player"
  }' \
  -v
```

**Expected Result**:
- Status: `200 OK`
- Response includes: `user_id`, possibly `auth_user_id` and `login_url`
- User created in `users` table
- Team member added to `team_members` table

### C. Verify Registration
```bash
# Check if user was created
npx supabase db query "SELECT * FROM users WHERE email = 'newplayer@example.com'"

# Check team membership
npx supabase db query "SELECT * FROM team_members WHERE user_id IN (SELECT id FROM users WHERE email = 'newplayer@example.com')"

# Check link usage was incremented
npx supabase db query "SELECT token, used_count FROM registration_links WHERE token = 'test-token-123'"
```

---

## 🧪 Test 4: Webhook Queue System

### A. Check Queue Processing
```bash
# View queued webhooks
npx supabase db query "SELECT * FROM webhook_queue ORDER BY created_at DESC LIMIT 5"

# Check queue statistics
npx supabase db query "SELECT * FROM webhook_queue_stats"
```

**Expected**: 
- Webhooks in 'pending' or 'completed' status
- No 'failed' webhooks (unless intentional)

### B. Test Idempotency
```bash
# Send the same webhook twice with same webhook_id
PAYLOAD='{"id":"webhook-123","event":"subscription.created","membership_id":41932}'

# First request
curl -X POST http://localhost:3000/api/memberpress/webhook \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD"

# Second request (should be ignored)
curl -X POST http://localhost:3000/api/memberpress/webhook \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD"
```

**Expected**: Second request returns immediately without creating duplicate

### C. Check Processing Log
```bash
# View processing history
npx supabase db query "
SELECT 
  wq.webhook_id,
  wq.status,
  wq.attempts,
  wpl.error_message
FROM webhook_queue wq
LEFT JOIN webhook_processing_log wpl ON wq.id = wpl.queue_id
ORDER BY wq.created_at DESC
LIMIT 10
"
```

---

## 🧪 Test 5: Full MemberPress Purchase Flow

### A. Simulate Team HQ Purchase
```bash
# Simulate MemberPress webhook for Team HQ purchase
PAYLOAD='{
  "event": "subscription.created",
  "membership_id": 41932,
  "user_id": 123,
  "email": "coach@example.com",
  "full_name": "Coach Smith",
  "subscription_id": "sub_123"
}'

curl -X POST http://localhost:3000/api/memberpress/webhook \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" \
  -v
```

### B. Verify Resources Created
```bash
# Check if team was created
npx supabase db query "
SELECT * FROM team_teams 
WHERE name LIKE '%team_hq_structure%' 
ORDER BY created_at DESC 
LIMIT 1
"

# Check registration links were created
npx supabase db query "
SELECT 
  target_type,
  default_role,
  max_uses,
  token
FROM registration_links 
WHERE created_at > NOW() - INTERVAL '5 minutes'
ORDER BY created_at DESC
"
```

**Expected**:
- New team created with name containing email
- 2 registration links created (player & parent)

### C. Test Cancellation
```bash
# Simulate subscription cancellation
PAYLOAD='{
  "event": "subscription.canceled",
  "membership_id": 41932,
  "user_id": 123,
  "email": "coach@example.com"
}'

curl -X POST http://localhost:3000/api/memberpress/webhook \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" \
  -v
```

**Verify Soft Delete**:
```bash
# Check entitlement status
npx supabase db query "
SELECT status FROM membership_entitlements 
WHERE user_id IN (SELECT id FROM users WHERE email = 'coach@example.com')
"

# Check team member status
npx supabase db query "
SELECT status FROM team_members 
WHERE user_id IN (SELECT id FROM users WHERE email = 'coach@example.com')
"
```

**Expected**: Status changed to 'canceled' or 'inactive', data preserved

---

## 🧪 Test 6: Authentication Flow

### A. Test Logout
```bash
# Test logout endpoint
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Content-Type: application/json" \
  -d '{}' \
  -v
```

**Expected**: 
- Status: `200 OK`
- Response: `{"success": true, "message": "Logged out successfully"}`

### B. Test Session Management
```bash
# Check active sessions
npx supabase db query "
SELECT 
  u.email,
  us.created_at,
  us.expires_at
FROM user_sessions us
JOIN users u ON us.user_id = u.id
WHERE us.expires_at > NOW()
"
```

---

## 📊 Performance & Security Checks

### A. Token Security Test
```bash
# Generate 10 tokens and check uniqueness
for i in {1..10}; do
  curl -s -X POST http://localhost:3000/api/memberpress/webhook \
    -H "Content-Type: application/json" \
    -d '{"event":"test","membership_id":1}' | jq -r '.queue_id'
done | sort | uniq -c
```

**Expected**: All tokens should be unique (count = 1 for each)

### B. Response Time Test
```bash
# Test webhook processing time
time curl -X POST http://localhost:3000/api/memberpress/webhook \
  -H "Content-Type: application/json" \
  -d '{"event":"test","membership_id":1}'
```

**Expected**: Response time < 500ms (webhook queued, not processed synchronously)

---

## ✅ Testing Checklist

### Security Tests
- [ ] Webhook without signature is rejected (401)
- [ ] Webhook with valid signature is accepted (200)
- [ ] Tokens are cryptographically random
- [ ] No duplicate webhook processing (idempotency)

### Email Tests
- [ ] Magic link email sends successfully
- [ ] Email has correct POWLAX branding
- [ ] Colors match brand palette (#2E69B7, #0A2240, #D7B349)
- [ ] Email is mobile responsive

### Registration Tests
- [ ] Registration creates user
- [ ] Team membership is assigned
- [ ] Link usage is tracked
- [ ] Auth user is created (if RPC exists)

### Webhook Queue Tests
- [ ] Webhooks are queued, not processed synchronously
- [ ] Failed webhooks can retry
- [ ] Queue statistics are accurate
- [ ] Processing log tracks attempts

### Full Flow Tests
- [ ] MemberPress purchase creates team/club
- [ ] Registration links are generated
- [ ] Cancellation soft-deletes (preserves data)
- [ ] User progress is retained after cancellation

---

## 🚨 Troubleshooting

### Issue: "Invalid signature" on all webhooks
**Solution**: 
- Verify `MEMBERPRESS_WEBHOOK_SECRET` in `.env.local`
- Check if MemberPress is sending `x-memberpress-signature` header
- In development, signature verification allows bypass

### Issue: Emails not sending
**Solution**:
- Verify `SENDGRID_API_KEY` is correct
- Check SendGrid dashboard for blocked emails
- Look for error in console: `SendGrid error:`

### Issue: Database tables not found
**Solution**:
```bash
# Apply migrations manually
npx supabase migration up 060_webhook_queue_system.sql
npx supabase migration up 061_supabase_auth_bridge.sql
```

### Issue: Registration fails
**Solution**:
- Check if registration link exists and isn't expired
- Verify `max_uses` hasn't been exceeded
- Check user doesn't already exist with that email

---

## 📈 Monitoring Production

Once deployed, monitor these metrics:

### Database Queries
```sql
-- Daily webhook success rate
SELECT 
  DATE(created_at) as date,
  COUNT(*) FILTER (WHERE status = 'completed') as successful,
  COUNT(*) FILTER (WHERE status = 'failed') as failed,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'completed') / COUNT(*), 2) as success_rate
FROM webhook_queue
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Registration conversion
SELECT 
  COUNT(*) FILTER (WHERE used_count > 0) as used_links,
  COUNT(*) as total_links,
  ROUND(100.0 * COUNT(*) FILTER (WHERE used_count > 0) / COUNT(*), 2) as conversion_rate
FROM registration_links
WHERE created_at > NOW() - INTERVAL '30 days';

-- Active teams
SELECT 
  COUNT(DISTINCT team_id) as active_teams,
  COUNT(*) as total_members
FROM team_members
WHERE status = 'active';
```

---

## 🎉 Success Criteria

Your MemberPress integration is working correctly when:

1. ✅ Webhooks are verified and queued reliably
2. ✅ Emails send with proper branding
3. ✅ Registration flow creates users and team members
4. ✅ Cancellations preserve user data
5. ✅ No security vulnerabilities (tokens, signatures)
6. ✅ Response times are under 500ms
7. ✅ Error rate is under 1%

---

**Need Help?** Check the implementation summary at `/docs/MEMBERPRESS-INTEGRATION-IMPLEMENTATION-SUMMARY.md`