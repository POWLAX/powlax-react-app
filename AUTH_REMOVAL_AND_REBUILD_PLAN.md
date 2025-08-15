# 🚨 POWLAX Authentication Removal & Rebuild Plan

**Date:** August 14, 2025  
**Purpose:** Complete removal of broken authentication system and systematic rebuild with Supabase magic links

---

## Phase 1: Complete Authentication Removal

### Step 1.1: Backup Current Implementation
- [x] Document current auth files
- [ ] Create git commit before changes

**Current Auth Files to Backup:**
```
src/contexts/SupabaseAuthContext.tsx
src/app/api/auth/magic-link/route.ts
src/app/api/auth/login/route.ts
src/app/api/auth/logout/route.ts
src/app/auth/login/page.tsx
src/app/direct-login/page.tsx
src/middleware.ts
```

### Step 1.2: Remove Middleware Authentication
**File:** `src/middleware.ts`
- [ ] Comment out all auth checks
- [ ] Allow all routes to be accessible
- [ ] Keep middleware file for future use

### Step 1.3: Disable Protected Routes
**Directory:** `src/app/(authenticated)/`
- [ ] Remove auth checks from layout.tsx
- [ ] Allow all pages to render without user

### Step 1.4: Create Dummy Auth Context
**File:** `src/contexts/SupabaseAuthContext.tsx`
```typescript
// Temporary no-auth context
const mockUser = {
  id: 'demo-user',
  email: 'demo@powlax.com',
  full_name: 'Demo User',
  role: 'administrator',
  roles: ['administrator'],
  display_name: 'Demo User'
}

// Always return logged in with demo user
```

### Step 1.5: Update Components
- [ ] Remove auth requirements from navigation
- [ ] Remove auth checks from dashboard
- [ ] Remove login/logout buttons temporarily

---

## Phase 2: Clean Slate Testing

### Verification Checklist:
- [ ] App loads without errors
- [ ] Dashboard accessible without login
- [ ] All pages render properly
- [ ] No authentication popups
- [ ] No redirect loops

---

## Phase 3: Magic Link Rebuild (Step-by-Step)

### Step 3.1: Database Setup
```sql
-- Create clean magic_links table
CREATE TABLE magic_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for token lookups
CREATE INDEX idx_magic_links_token ON magic_links(token);
CREATE INDEX idx_magic_links_email ON magic_links(email);

-- RLS Policies (Service Role Only)
ALTER TABLE magic_links ENABLE ROW LEVEL SECURITY;

-- No public access - only service role
CREATE POLICY "Service role only" ON magic_links
  FOR ALL USING (false);
```

### Step 3.2: Basic Magic Link API
**File:** `src/app/api/auth/send-magic-link/route.ts`
```typescript
// POST: Generate and send magic link
export async function POST(req: NextRequest) {
  const { email } = await req.json()
  
  // 1. Generate secure token
  const token = crypto.randomBytes(32).toString('base64url')
  
  // 2. Store in database
  await supabase.from('magic_links').insert({
    email,
    token,
    expires_at: // 1 hour from now
  })
  
  // 3. Send email (or log for testing)
  console.log(`Magic link: http://localhost:3000/api/auth/verify-magic-link?token=${token}`)
  
  return NextResponse.json({ success: true })
}
```

### Step 3.3: Magic Link Verification
**File:** `src/app/api/auth/verify-magic-link/route.ts`
```typescript
// GET: Verify token and create session
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  
  // 1. Verify token exists and not expired
  const { data: magicLink } = await supabase
    .from('magic_links')
    .select('*')
    .eq('token', token)
    .gt('expires_at', new Date().toISOString())
    .is('used_at', null)
    .single()
  
  if (!magicLink) {
    return NextResponse.redirect('/login?error=invalid_token')
  }
  
  // 2. Mark as used
  await supabase
    .from('magic_links')
    .update({ used_at: new Date().toISOString() })
    .eq('token', token)
  
  // 3. Create session (simple cookie for now)
  cookies().set('session', JSON.stringify({
    email: magicLink.email,
    authenticated: true
  }))
  
  // 4. Redirect to dashboard
  return NextResponse.redirect('/dashboard')
}
```

### Step 3.4: Simple Login Page
**File:** `src/app/login/page.tsx`
```typescript
export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  
  const sendMagicLink = async () => {
    await fetch('/api/auth/send-magic-link', {
      method: 'POST',
      body: JSON.stringify({ email })
    })
    setSent(true)
  }
  
  if (sent) {
    return <div>Check your email for the magic link!</div>
  }
  
  return (
    <form onSubmit={sendMagicLink}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
      />
      <button type="submit">Send Magic Link</button>
    </form>
  )
}
```

### Step 3.5: Test Flow
1. User enters email
2. System generates token and stores in DB
3. Email sent (or logged to console)
4. User clicks link
5. System verifies token
6. Session created
7. User redirected to dashboard

---

## Phase 4: Integration with Supabase Auth

### Step 4.1: Supabase User Creation
- Create auth.users entry when new email signs up
- Link magic_links to auth.users.id
- Use Supabase session management

### Step 4.2: Proper Session Management
- Use Supabase JWT tokens
- Implement refresh token logic
- Add session expiry handling

### Step 4.3: Email Service Integration
- Configure SendGrid/Resend
- Professional email templates
- Rate limiting

---

## Testing Checklist

### Basic Flow:
- [ ] Can send magic link
- [ ] Link arrives in email/console
- [ ] Clicking link authenticates user
- [ ] Session persists across page refreshes
- [ ] Logout clears session

### Error Cases:
- [ ] Expired token shows error
- [ ] Used token shows error
- [ ] Invalid token shows error
- [ ] Missing token shows error

### Security:
- [ ] Tokens are single-use
- [ ] Tokens expire after 1 hour
- [ ] Sessions expire appropriately
- [ ] No sensitive data in localStorage

---

## Current Issues to Avoid

1. **URL Mismatch:** Email was sending to `/auth/magic-link` instead of `/api/auth/magic-link`
2. **Token Not Marked Used:** `used_at` column wasn't being updated
3. **Complex Auth Flow:** Too many redirects and client-side processing
4. **WordPress Legacy:** Still had WordPress references in database
5. **RLS Issues:** Policies might be blocking operations

---

## Success Criteria

✅ User can login with just email (no password)  
✅ Magic link works on first click  
✅ Session persists properly  
✅ Clean, simple implementation  
✅ No WordPress dependencies  
✅ Proper error handling  
✅ Works in production  

---

## Commands for Testing

```bash
# Generate magic link
curl -X POST http://localhost:3000/api/auth/send-magic-link \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Check database
npx tsx scripts/check-magic-links.ts

# Test authentication
npx playwright test auth.spec.ts
```