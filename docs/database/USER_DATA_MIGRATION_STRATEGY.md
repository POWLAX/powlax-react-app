# POWLAX User Data Migration Strategy
*Created: January 16, 2025*  
*Purpose: Complete strategy for migrating from WordPress to Supabase-only authentication*

## 🎯 **Current State Assessment**

### **✅ What Already Exists:**
- **`users` table with complete profile columns:**
  - `first_name`, `last_name`, `full_name` ✅
  - `email`, `username`, `avatar_url` ✅ 
  - `wordpress_id`, `auth_user_id` ✅
  - `roles[]`, `is_active`, `subscription_status` ✅
- **Parent-child relationship system:** `parent_child_relationships` table ✅
- **WordPress sync system:** `wordpress-auth.ts` with `syncUserToSupabase()` ✅
- **12 existing users** ready for migration ✅

### **❌ What Needs Migration:**
1. **Populate `auth_user_id`** for all 12 existing users
2. **Create Supabase Auth accounts** for each user
3. **Establish parent-child relationships** 
4. **Migrate subscription entitlements**
5. **Set up magic link authentication**

---

## 🚀 **Migration Strategy**

### **Phase 1: User Profile Enhancement**
```sql
-- Add missing profile columns if needed
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS emergency_contact JSONB;
ALTER TABLE users ADD COLUMN IF NOT EXISTS player_position TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS graduation_year INTEGER;
```

### **Phase 2: Supabase Auth Account Creation**
For each of your 12 existing users:
1. **Create Supabase Auth account** with email
2. **Link to existing user record** via `auth_user_id`
3. **Generate magic link** for first login
4. **Preserve WordPress integration** for subscription sync

### **Phase 3: Parent-Child Account Setup**
Enhanced parent-child system with:
- **Joint account access** (parent can view/manage child data)
- **Age-based permissions** (automatic role assignment)
- **Family billing** (link subscriptions to parent accounts)
- **Multi-child support** (one parent, multiple children)

---

## 👨‍👩‍👧‍👦 **Parent-Child Account System Design**

### **Account Types:**
1. **Parent Account** - Primary billing and management
2. **Child Account** - Player profile with restricted permissions
3. **Joint Account** - Shared access for family management

### **Enhanced `parent_child_relationships` Table:**
```sql
CREATE TABLE IF NOT EXISTS parent_child_relationships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID NOT NULL REFERENCES users(id),
  child_id UUID NOT NULL REFERENCES users(id),
  relationship_type TEXT DEFAULT 'parent' CHECK (relationship_type IN ('parent', 'guardian', 'coach_guardian')),
  permissions JSONB DEFAULT '{"view_progress": true, "manage_schedule": true, "billing": true}',
  is_primary_guardian BOOLEAN DEFAULT false,
  emergency_contact BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(parent_id, child_id)
);
```

### **Family Account Features:**
- **👤 Single Login** - Parent logs in, can switch between child profiles
- **📊 Combined Dashboard** - View all children's progress
- **💳 Unified Billing** - All subscriptions under parent account
- **🔐 Age-Appropriate Access** - Auto-restrict based on child age
- **📱 Mobile-Friendly** - Easy profile switching on phones

---

## 📋 **Step-by-Step Migration Process**

### **Step 1: Prepare User Data**
```typescript
// Extract current user data for migration
const currentUsers = await supabase
  .from('users')
  .select(`
    id, wordpress_id, email, username, 
    first_name, last_name, full_name,
    roles, subscription_status
  `)
```

### **Step 2: Create Supabase Auth Accounts**
```typescript
// For each user, create Supabase Auth account
for (const user of currentUsers) {
  const { data: authUser } = await supabase.auth.admin.createUser({
    email: user.email,
    email_confirm: true,
    user_metadata: {
      first_name: user.first_name,
      last_name: user.last_name,
      full_name: user.full_name,
      wordpress_id: user.wordpress_id,
      roles: user.roles
    }
  })
  
  // Link to existing user record
  await supabase
    .from('users')
    .update({ auth_user_id: authUser.user.id })
    .eq('id', user.id)
}
```

### **Step 3: Set Up Parent-Child Relationships**
Based on your team roster data:
```typescript
// Identify parent-child pairs from team_members with role 'parent'
const parentChildPairs = await identifyFamilyRelationships()

// Create relationships
for (const pair of parentChildPairs) {
  await supabase
    .from('parent_child_relationships')
    .insert({
      parent_id: pair.parent_id,
      child_id: pair.child_id,
      relationship_type: 'parent',
      is_primary_guardian: true,
      permissions: {
        view_progress: true,
        manage_schedule: true,
        billing: true,
        emergency_contact: true
      }
    })
}
```

### **Step 4: Generate Magic Links**
```typescript
// Send magic links to all users for first Supabase login
for (const user of currentUsers) {
  const { data } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: user.email,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
    }
  })
  
  // Send email with magic link
  await sendWelcomeEmail(user.email, data.properties.action_link)
}
```

---

## 🔧 **Implementation Files Needed**

### **1. Migration Script:** `084_enhance_user_profiles.sql`
- Add missing profile columns
- Enhance parent-child relationships
- Create family account indexes

### **2. Data Migration Script:** `migrate-wordpress-to-supabase-auth.ts`
- Extract all WordPress user data
- Create Supabase Auth accounts
- Link existing user records
- Set up parent-child relationships

### **3. Family Account API:** `/api/auth/family/`
- Switch between parent/child profiles
- Manage family permissions
- Handle joint billing

### **4. Enhanced Registration:** Update registration flow
- Detect if registering as parent or child
- Auto-create relationships during registration
- Handle family invitation links

---

## 🎮 **Parent-Child Use Cases**

### **Registration Scenarios:**
1. **Parent registers first** → Creates child accounts → Links relationships
2. **Child registers via team invitation** → Parent claims account later
3. **Coach invites family** → Both parent and child get linked invitations

### **Daily Usage:**
1. **Parent logs in** → Sees dashboard with all children
2. **Clicks child profile** → Switches to child's view
3. **Reviews progress** → Sees practice attendance, skill development
4. **Manages schedule** → Accepts/declines practice invitations
5. **Handles billing** → Manages all family subscriptions

### **Permission Examples:**
- **Parent can:** View child progress, manage subscriptions, contact coaches
- **Child can:** Complete workouts, view team content, earn badges
- **Both can:** Access Skills Academy content (with age-appropriate filtering)

---

## 🚨 **Critical Migration Considerations**

### **Data Preservation:**
- ✅ **Keep all existing user data**
- ✅ **Maintain WordPress integration** for subscription sync
- ✅ **Preserve team memberships and roles**

### **Authentication Transition:**
- ✅ **Dual authentication support** (WordPress + Supabase)
- ✅ **Gradual migration** (users can use either system)
- ✅ **Magic link onboarding** for Supabase Auth

### **Family Account Security:**
- ✅ **Parent verification** before linking children
- ✅ **Age-appropriate content filtering**
- ✅ **Emergency contact information**

---

## 📧 **User Communication Plan**

### **Email Sequence:**
1. **Welcome to New POWLAX** - Explain the upgrade
2. **Your Magic Link** - Easy login instructions  
3. **Family Account Setup** - Link your children
4. **New Features Tour** - Highlight improvements

### **In-App Guidance:**
1. **Onboarding flow** for new authentication
2. **Family setup wizard** for parent-child linking
3. **Feature discovery** for enhanced capabilities

---

## ✅ **Success Metrics**

- **100% user data preserved** from WordPress
- **All 12 users have Supabase Auth accounts**
- **Parent-child relationships established**
- **Magic link authentication working**
- **Family dashboards functional**
- **Subscription sync maintained**

**Ready to implement this migration strategy!** 🚀
