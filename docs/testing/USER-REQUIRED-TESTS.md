# User-Required Tests for MemberPress Integration

**Purpose**: Tests that ONLY you can perform (require access to external services or real email)  
**Time Required**: ~10 minutes total  
**Priority**: CRITICAL - System won't work without these

---

## 🚨 Test #1: Apply Database Migrations (CRITICAL)

### Why Only You Can Do This:
I don't have access to your Supabase project to push migrations.

### Steps:
```bash
# 1. Apply all new migrations
npx supabase db push

# 2. Verify migrations applied (optional)
npx supabase db diff
```

### Expected Result:
```
Applying migration 060_webhook_queue_system.sql...
Applying migration 061_supabase_auth_bridge.sql...
Finished supabase db push.
```

### If It Fails:
- Check Supabase connection in `.env.local`
- Try applying individually:
  ```bash
  npx supabase migration up 060_webhook_queue_system.sql
  npx supabase migration up 061_supabase_auth_bridge.sql
  ```

**Time**: 2 minutes

---

## 📧 Test #2: Verify SendGrid Email Delivery

### Why Only You Can Do This:
Only you can access your email inbox and SendGrid dashboard.

### Steps:

#### A. Send Test Email
```bash
# Replace with YOUR actual email address
curl -X POST http://localhost:3000/api/auth/magic-link \
  -H "Content-Type: application/json" \
  -d '{"email": "patrick@powlax.com"}'
```

#### B. Check Your Inbox
Look for email from `team@powlax.com` with subject "Your POWLAX Login Link"

#### C. Verify Email Quality
- [ ] Email arrived within 30 seconds
- [ ] Not in spam folder
- [ ] POWLAX logo visible
- [ ] Blue login button (#2E69B7)
- [ ] Gold warning box about expiration (#D7B349)
- [ ] Mobile responsive (check on phone)
- [ ] Magic link is clickable

#### D. Test Magic Link
- [ ] Click the login button in email
- [ ] Should redirect to `/auth/magic-link?token=...`
- [ ] Note any errors for troubleshooting

### If Email Doesn't Arrive:
1. Check SendGrid Dashboard → Activity → Search by email
2. Check console for errors: `SendGrid error:`
3. Verify API key in `.env.local`
4. Check spam/promotions folder

**Time**: 3 minutes

---

## 🔗 Test #3: MemberPress Webhook Configuration

### Why Only You Can Do This:
Only you have access to your WordPress/MemberPress admin.

### Steps:

#### A. Configure MemberPress Webhook
1. Log into WordPress Admin
2. Navigate to: **MemberPress → Settings → Webhooks**
3. Add New Webhook:
   - **URL**: `https://[your-ngrok-url].ngrok.io/api/memberpress/webhook` (for testing)
   - **Secret**: `OhcMrZXxU0`
   - **Events**: Select all subscription events:
     - ✅ Subscription Created
     - ✅ Subscription Activated  
     - ✅ Subscription Expired
     - ✅ Subscription Canceled
     - ✅ Transaction Completed
4. Save Settings

#### B. Send Test Webhook
1. In MemberPress webhook settings
2. Click "Send Test" button
3. Check response status

#### C. Verify in Database
```bash
# Check if webhook was logged
npx supabase db query "SELECT * FROM webhook_events ORDER BY received_at DESC LIMIT 1"
```

### Expected Result:
- Test webhook returns 200 OK
- Webhook appears in `webhook_events` table
- Signature validation status shown

**Time**: 3 minutes

---

## 🌐 Test #4: SendGrid Domain Verification

### Why Only You Can Do This:
Only you have access to SendGrid dashboard and DNS settings.

### Steps:

#### A. Check SendGrid Domain Authentication
1. Log into [SendGrid Dashboard](https://app.sendgrid.com)
2. Go to: **Settings → Sender Authentication**
3. Check your domain status:
   - [ ] ✅ All green checkmarks
   - [ ] SPF record verified
   - [ ] DKIM records verified
   - [ ] Custom return path (optional)

#### B. Check Email Activity
1. Go to: **Activity Feed**
2. Search for test emails sent
3. Check for:
   - [ ] Delivered status
   - [ ] No bounces
   - [ ] No spam reports

### If Not Verified:
- Click "Verify" to re-check DNS
- Wait 30 more minutes for propagation
- Check DNS records with: `dig TXT powlax.com`

**Time**: 2 minutes

---

## 🏁 Test #5: Production Webhook Test (Optional)

### Why Only You Can Do This:
Only you can make real MemberPress purchases or access production data.

### When to Do This:
After basic tests pass, before going live with real users.

### Steps:

#### A. Create Test Membership
1. Create a test product in MemberPress ($0.01 or free trial)
2. Purchase it with a test account
3. Watch for webhook in logs

#### B. Monitor Real-Time
```bash
# Watch webhook events as they come in
npx supabase db query "SELECT * FROM webhook_queue WHERE created_at > NOW() - INTERVAL '5 minutes' ORDER BY created_at DESC"
```

#### C. Verify Full Flow
- [ ] Team/Club created
- [ ] Registration links generated
- [ ] Entitlement recorded
- [ ] Email sent (if configured)

**Time**: 5 minutes (optional)

---

## ✅ Quick Checklist

Must complete before system works:
- [ ] Database migrations applied
- [ ] At least one email successfully received
- [ ] MemberPress webhook configured
- [ ] SendGrid domain verified (or emails delivering)

Nice to have:
- [ ] Production webhook tested
- [ ] Multiple email types tested
- [ ] Team registration flow tested

---

## 🆘 Troubleshooting Contacts

### SendGrid Issues
- Check: [SendGrid Status](https://status.sendgrid.com/)
- Support: SendGrid dashboard → Support

### Supabase Issues  
- Check: [Supabase Status](https://status.supabase.com/)
- Logs: Supabase dashboard → Logs → API

### MemberPress Issues
- Check: WordPress → MemberPress → Help
- Logs: WordPress → Tools → Site Health

---

## 🎯 Success Criteria

You know everything is working when:
1. ✅ Migrations applied without errors
2. ✅ You receive a branded email within 30 seconds
3. ✅ MemberPress test webhook returns 200 OK
4. ✅ SendGrid shows all green checkmarks

**Total Time: ~10 minutes**

---

**Next Step**: Once these pass, proceed to `AUTOMATED-TESTS.md` for tests that can run without you.