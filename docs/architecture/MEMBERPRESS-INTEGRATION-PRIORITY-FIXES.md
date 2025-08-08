# MemberPress Integration - Priority Implementation Fixes

## 🚨 Critical Security Fixes (Day 1)

### 1. Fix Token Generation
**File**: `/src/app/api/memberpress/webhook/route.ts`
```typescript
// REPLACE THIS:
function randomToken(): string {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
}

// WITH THIS:
import { randomBytes } from 'crypto'

function generateSecureToken(): string {
  return randomBytes(32).toString('base64url')
}
```

### 2. Add Webhook Signature Verification
**File**: `/src/app/api/memberpress/webhook/route.ts`
```typescript
import crypto from 'crypto'

const verifyWebhookSignature = (payload: string, signature: string): boolean => {
  const secret = process.env.MEMBERPRESS_WEBHOOK_SECRET!
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))
}

// In POST handler:
const signature = req.headers.get('x-memberpress-signature')
const body = await req.text()

if (!signature || !verifyWebhookSignature(body, signature)) {
  return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
}
```

## 🔐 Authentication System (Days 2-3)

### 1. Create Supabase Auth Migration
**File**: `/supabase/migrations/060_supabase_auth_bridge.sql`
```sql
-- Link users table to Supabase Auth
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id);

CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);

-- Function to create auth user on registration
CREATE OR REPLACE FUNCTION create_auth_user_on_registration()
RETURNS TRIGGER AS $$
BEGIN
  -- Create corresponding auth.users entry
  INSERT INTO auth.users (id, email, email_confirmed_at)
  VALUES (gen_random_uuid(), NEW.email, NOW())
  ON CONFLICT (email) DO UPDATE
  SET email_confirmed_at = COALESCE(auth.users.email_confirmed_at, NOW())
  RETURNING id INTO NEW.auth_user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER create_auth_user_trigger
  BEFORE INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_auth_user_on_registration();
```

### 2. Update Registration Consumer
**File**: `/src/app/api/register/consume/route.ts`
```typescript
// After creating/updating user, create Supabase Auth session
const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
  email,
  email_confirm: true,
  user_metadata: {
    full_name: fullName,
    wordpress_id: userId,
    role: link.default_role
  }
})

if (authError) {
  console.error('Auth user creation failed:', authError)
}

// Generate magic link for immediate login
const { data: magicLink } = await supabase.auth.admin.generateLink({
  type: 'magiclink',
  email,
  options: {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
  }
})
```

## 📊 Database Cleanup (Day 4)

### 1. Remove Redundant Tables
```sql
-- Drop compatibility views
DROP VIEW IF EXISTS organizations;
DROP VIEW IF EXISTS teams;

-- Rename prefixed tables to standard names
ALTER TABLE club_organizations RENAME TO organizations;
ALTER TABLE team_teams RENAME TO teams;

-- Update foreign key references
ALTER TABLE teams 
  RENAME COLUMN club_id TO organization_id;
```

### 2. Add Missing Indexes
```sql
CREATE INDEX IF NOT EXISTS idx_registration_links_expires_at 
  ON registration_links(expires_at) 
  WHERE expires_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_membership_entitlements_user_status 
  ON membership_entitlements(user_id, status);

CREATE INDEX IF NOT EXISTS idx_team_members_user_status 
  ON team_members(user_id, status);
```

## 🔄 Webhook Queue Implementation (Day 5)

### 1. Create Queue Tables
**File**: `/supabase/migrations/061_webhook_queue.sql`
```sql
CREATE TABLE IF NOT EXISTS webhook_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id TEXT UNIQUE NOT NULL,
  source TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed')),
  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 3,
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

CREATE INDEX idx_webhook_queue_status ON webhook_queue(status);
CREATE INDEX idx_webhook_queue_created ON webhook_queue(created_at);
```

### 2. Create Queue Processor
**File**: `/src/lib/webhook-processor.ts`
```typescript
export async function processWebhookQueue() {
  const supabase = getAdminClient()
  
  // Get pending webhooks
  const { data: pending } = await supabase
    .from('webhook_queue')
    .select('*')
    .eq('status', 'pending')
    .lt('attempts', 3)
    .order('created_at')
    .limit(10)
  
  for (const webhook of pending || []) {
    try {
      // Update status to processing
      await supabase
        .from('webhook_queue')
        .update({ status: 'processing', attempts: webhook.attempts + 1 })
        .eq('id', webhook.id)
      
      // Process webhook based on payload
      await processWebhookPayload(webhook.payload)
      
      // Mark as completed
      await supabase
        .from('webhook_queue')
        .update({ status: 'completed', processed_at: new Date().toISOString() })
        .eq('id', webhook.id)
        
    } catch (error) {
      // Mark as failed or retry
      await supabase
        .from('webhook_queue')
        .update({ 
          status: webhook.attempts >= 2 ? 'failed' : 'pending',
          last_error: error.message 
        })
        .eq('id', webhook.id)
    }
  }
}
```

## 🧪 Testing Checklist

### Security Tests
- [ ] Token generation uses crypto.randomBytes
- [ ] Webhook signatures are verified
- [ ] Registration endpoints are rate-limited
- [ ] SQL injection prevention in place

### Integration Tests
- [ ] MemberPress webhook creates correct resources
- [ ] Registration flow creates auth user
- [ ] Cancellation soft-deletes correctly
- [ ] User data persists after cancellation

### Performance Tests
- [ ] Webhook processing under 500ms
- [ ] Registration completion under 1s
- [ ] Database queries use indexes
- [ ] No N+1 query patterns

## 📋 Environment Variables to Add

```env
# MemberPress Integration
MEMBERPRESS_WEBHOOK_SECRET=your-webhook-secret-from-memberpress
MEMBERPRESS_API_KEY=your-memberpress-api-key
MEMBERPRESS_API_URL=https://your-site.com/wp-json/mp/v1

# Email Service (for magic links)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_FROM=noreply@powlax.com

# Queue Processing
ENABLE_WEBHOOK_QUEUE=true
WEBHOOK_RETRY_INTERVAL=60000
```

## 🚀 Deployment Steps

1. **Apply database migrations** in order
2. **Update environment variables** with production values
3. **Deploy webhook handler** with signature verification
4. **Configure MemberPress webhooks** with secret
5. **Test with sandbox subscription** before going live
6. **Monitor webhook events** table for issues
7. **Set up alerting** for failed webhooks

## 📈 Success Metrics

- **Security**: Zero unauthorized webhook processing
- **Reliability**: >99.9% webhook success rate
- **Performance**: <500ms webhook processing time
- **User Experience**: <5% registration abandonment rate
- **Data Integrity**: Zero data inconsistencies