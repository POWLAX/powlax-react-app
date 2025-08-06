# 🟣 **MemberPress Integration Agent - Deployment Instructions**

## 🎯 **Agent Mission Statement**
Build comprehensive WordPress MemberPress integration that automatically creates teams/organizations from membership purchases and maintains real-time subscription monitoring with 30-day guarantee tracking.

---

## 🚀 **Phase 1: Webhook Infrastructure (Week 1)**

### **Core Webhook Endpoint**
**File:** `src/app/api/webhooks/memberpress/route.ts`

```typescript
export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const signature = request.headers.get('x-memberpress-signature')
    
    // Verify webhook signature
    if (!verifyWebhookSignature(payload, signature)) {
      return new Response('Unauthorized', { status: 401 })
    }
    
    switch (payload.event) {
      case 'member-signup-completed':
        await handleMembershipCreated(payload.data)
        break
      case 'subscription-stopped':
        await handleMembershipCancelled(payload.data)
        break
      case 'subscription-expired':
        await handleMembershipExpired(payload.data)
        break
    }
    
    return new Response('OK', { status: 200 })
  } catch (error) {
    console.error('MemberPress webhook error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
```

### **Product Mapping Configuration**
**File:** `src/lib/memberpress-products.ts`

```typescript
export const MEMBERPRESS_PRODUCTS = {
  // Team HQ Products - Single team creation
  TEAM_HQ_STRUCTURE: { 
    id: 'TBD', // You'll provide actual MemberPress product IDs
    name: 'Team HQ Structure', 
    teams: 1,
    type: 'team_hq'
  },
  TEAM_HQ_LEADERSHIP: { 
    id: 'TBD', 
    name: 'Team HQ Leadership', 
    teams: 1,
    type: 'team_hq'
  },
  TEAM_HQ_ACTIVATED: { 
    id: 'TBD', 
    name: 'Team HQ Activated', 
    teams: 1,
    type: 'team_hq'
  },
  
  // Club OS Products - Organization + 3 teams minimum
  CLUB_OS_FOUNDATION: { 
    id: 'TBD', 
    name: 'Club OS Foundation', 
    teams: 3,
    type: 'club_os'
  },
  CLUB_OS_GROWTH: { 
    id: 'TBD', 
    name: 'Club OS Growth', 
    teams: 3,
    type: 'club_os'
  },
  CLUB_OS_COMMAND: { 
    id: 'TBD', 
    name: 'Club OS Command', 
    teams: 3,
    type: 'club_os'
  },
  
  // Individual Products - No team creation
  CONFIDENCE_COACHING_KIT: { 
    id: 'TBD', 
    name: 'Confidence Coaching Kit', 
    teams: 0,
    type: 'individual'
  }
} as const
```

---

## 🏗️ **Phase 2: Auto Team/Organization Creation (Week 1-2)**

### **Team Creation Service**
**File:** `src/lib/services/team-creation-service.ts`

#### **Club OS Organization Creation**
```typescript
async function createClubOSOrganization(membershipData: WebhookData, product: ProductConfig) {
  // 1. Create organization
  const org = await supabase.from('organizations').insert({
    name: `${membershipData.member.first_name}'s Club`, // User can customize later
    type: 'club_os',
    director_email: membershipData.member.email,
    subscription_id: membershipData.subscription.id,
    max_teams: product.teams,
    status: 'pending_setup'
  }).select().single()

  // 2. Create 3 placeholder teams
  const teams = await Promise.all(
    Array.from({ length: 3 }, (_, i) => 
      supabase.from('teams').insert({
        organization_id: org.data.id,
        name: `Team ${i + 1}`, // User can customize later
        status: 'placeholder',
        max_players: 25,
        max_coaches: 3
      }).select().single()
    )
  )

  // 3. Sync WordPress user to Supabase and assign director role
  const user = await syncWordPressUserToSupabase(membershipData.member)
  await supabase.from('user_organization_roles').insert({
    user_id: user.id,
    organization_id: org.data.id,
    role: 'director'
  })

  // 4. Generate registration assets for each team
  await generateRegistrationAssets(org.data, teams.map(t => t.data))

  return { organization: org.data, teams: teams.map(t => t.data) }
}
```

#### **Team HQ Creation**
```typescript
async function createTeamHQ(membershipData: WebhookData, product: ProductConfig) {
  // 1. Create single team
  const team = await supabase.from('teams').insert({
    name: `${membershipData.member.first_name}'s Team`, // User can customize later
    type: 'team_hq',
    coach_email: membershipData.member.email,
    subscription_id: membershipData.subscription.id,
    status: 'pending_setup',
    max_players: 25,
    max_coaches: 3
  }).select().single()

  // 2. Sync WordPress user to Supabase and assign coach role
  const user = await syncWordPressUserToSupabase(membershipData.member)
  await supabase.from('user_team_roles').insert({
    user_id: user.id,
    team_id: team.data.id,
    role: 'coach'
  })

  // 3. Generate registration assets
  await generateRegistrationAssets(null, [team.data])

  return { team: team.data }
}
```

---

## 🎫 **Phase 3: Registration Assets Generation (Week 2)**

### **Registration Asset Generator**
**File:** `src/lib/services/registration-asset-generator.ts`

```typescript
export class RegistrationAssetGenerator {
  async generateRegistrationAssets(org: Organization | null, teams: Team[]) {
    for (const team of teams) {
      // Generate unique registration code
      const registrationCode = `${team.type}-${team.id}-${Date.now()}`
      
      // Create registration URL
      const registrationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/register?code=${registrationCode}&team=${team.id}`
      
      // Generate QR code data URL
      const qrCodeData = await this.generateQRCode(registrationUrl)
      
      // Store registration assets
      await supabase.from('team_registration_assets').insert({
        team_id: team.id,
        registration_code: registrationCode,
        registration_url: registrationUrl,
        qr_code_data: qrCodeData,
        created_at: new Date().toISOString()
      })
    }
  }

  async generateQRCode(url: string): Promise<string> {
    const QRCode = require('qrcode')
    return await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
  }
}
```

---

## ⏱️ **Phase 4: 30-Day Guarantee Tracking (Week 2-3)**

### **Guarantee Tracking Service**
**File:** `src/lib/services/guarantee-tracker.ts`

```typescript
export class GuaranteeTracker {
  async onFirstMemberRegistration(teamId: number, organizationId?: number) {
    // Check if guarantee period already started
    const existing = await supabase
      .from('guarantee_periods')
      .select()
      .eq('team_id', teamId)
      .maybeSingle()

    if (!existing.data) {
      const guaranteeStart = new Date()
      const guaranteeEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

      await supabase.from('guarantee_periods').insert({
        team_id: teamId,
        organization_id: organizationId,
        started_at: guaranteeStart,
        expires_at: guaranteeEnd,
        triggered_by: 'first_member_registration',
        status: 'active'
      })

      // Send notification to team owner about guarantee start
      await this.sendGuaranteeStartNotification(teamId, guaranteeEnd)
    }
  }

  async sendGuaranteeStartNotification(teamId: number, expiresAt: Date) {
    // Email notification to team owner
    // Implementation depends on your email service
  }
}
```

---

## 🗃️ **Database Schema Requirements**

### **Required New Tables**
```sql
-- MemberPress subscription tracking
CREATE TABLE memberpress_subscriptions (
  id SERIAL PRIMARY KEY,
  mp_subscription_id INTEGER NOT NULL UNIQUE,
  mp_member_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  product_name VARCHAR(255),
  status VARCHAR(50) NOT NULL,
  expires_at TIMESTAMP,
  user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Team registration assets
CREATE TABLE team_registration_assets (
  id SERIAL PRIMARY KEY,
  team_id INTEGER REFERENCES teams(id) NOT NULL,
  registration_code VARCHAR(255) UNIQUE NOT NULL,
  registration_url TEXT NOT NULL,
  qr_code_data TEXT, -- Base64 data URL
  flyer_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 30-day guarantee tracking  
CREATE TABLE guarantee_periods (
  id SERIAL PRIMARY KEY,
  team_id INTEGER REFERENCES teams(id),
  organization_id INTEGER REFERENCES organizations(id),
  started_at TIMESTAMP NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  triggered_by VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_memberpress_subscriptions_mp_id ON memberpress_subscriptions(mp_subscription_id);
CREATE INDEX idx_team_registration_code ON team_registration_assets(registration_code);
CREATE INDEX idx_guarantee_periods_team ON guarantee_periods(team_id);
```

---

## ⚙️ **Environment Configuration**

### **Required Environment Variables**
```bash
# Add to .env.local
MEMBERPRESS_WEBHOOK_SECRET=your_webhook_secret_key_from_memberpress
NEXT_PUBLIC_BASE_URL=http://localhost:3000  # Update for production
MEMBERPRESS_API_KEY=your_memberpress_api_key  # For future API calls
```

### **WordPress MemberPress Setup**
1. **Configure Webhook URL:** `https://yourdomain.com/api/webhooks/memberpress`
2. **Enable Events:** 
   - `member-signup-completed`
   - `subscription-stopped` 
   - `subscription-expired`
3. **Set Secret Key:** Use strong random key for webhook verification
4. **Get Product IDs:** Update `MEMBERPRESS_PRODUCTS` with actual product IDs

---

## 🎯 **Success Criteria Checklist**

### **Week 1 Targets:**
- [ ] Webhook endpoint receives MemberPress events successfully
- [ ] Product mapping correctly identifies Team HQ vs Club OS
- [ ] Team/organization creation works in Supabase
- [ ] User roles assigned properly

### **Week 2 Targets:**
- [ ] Registration codes and QR codes generated automatically
- [ ] Registration URLs work and connect to team signup
- [ ] 30-day guarantee tracking starts on first member registration
- [ ] WordPress user sync to Supabase working

### **Week 3 Targets:**
- [ ] Subscription status monitoring active
- [ ] Access revocation on cancellation/expiration
- [ ] Email notifications sent for key events
- [ ] Complete purchase → team creation → registration flow working

---

## 🔗 **Integration Points**

### **Connects To:**
- **Team Management Agent:** Created teams/orgs are managed through dashboards
- **Registration System:** Generated registration codes used in signup flow
- **User Authentication:** WordPress users synced to Supabase for React app access
- **Skills Academy:** Team membership enables gamification and progress tracking

### **API Endpoints Created:**
- `POST /api/webhooks/memberpress` - Webhook handler
- `GET /api/teams/[teamId]/registration-assets` - QR codes and flyers
- `POST /api/guarantee/start` - Manual guarantee period start (if needed)

---

## 🟣 **Agent Color Theme**
Use Purple (#A855F7) for all MemberPress integration UI elements, loading states, and success messages.