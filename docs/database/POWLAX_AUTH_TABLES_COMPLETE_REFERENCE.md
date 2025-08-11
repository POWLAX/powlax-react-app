# POWLAX Authentication Tables - Complete Reference
*Created: January 16, 2025*  
*Purpose: Comprehensive documentation of all authentication and MemberPress integration tables*  
*Status: ✅ All tables exist and are ready for integration*

## 🎯 **Overview**

The POWLAX database contains **12 core authentication tables** that handle the complete MemberPress/WordPress integration, user management, and session tracking. All tables are properly structured with Row Level Security (RLS) enabled.

---

## 🔐 **Core Authentication Tables** (4 tables)

### 1. `users` - Main User Records
**Purpose:** Central user registry linking WordPress and Supabase Auth users  
**Records:** 12 users  
**Key Columns:**
- `id` (UUID) - Primary key
- `wordpress_id` (INTEGER) - Links to WordPress user ID
- `auth_user_id` (UUID) - Links to Supabase Auth user
- `email` (TEXT) - User email address
- `username` (TEXT) - WordPress username
- `first_name`, `last_name`, `full_name` - User profile data
- `roles` (TEXT[]) - WordPress roles array
- `subscription_status` - Current subscription state
- `is_active` (BOOLEAN) - Account status

**Integration Points:**
- Links WordPress users to Supabase Auth
- Referenced by all other user-related tables
- Supports both WordPress and native Supabase users

### 2. `user_sessions` - Active Session Tracking
**Purpose:** Track active user sessions with tokens, expiry, and security data  
**Records:** 0 (empty - ready for session data)  
**Key Columns:**
- `id` (UUID) - Primary key
- `user_id` (UUID) - References users table
- `token_hash` (TEXT) - Hashed session token
- `expires_at` (TIMESTAMPTZ) - Session expiration
- `ip_address` (INET) - User IP for security
- `user_agent` (TEXT) - Browser/device info

**Integration Points:**
- Magic link authentication
- Session persistence across app usage
- Security monitoring and IP tracking

### 3. `user_subscriptions` - MemberPress Subscription Sync
**Purpose:** Real-time sync of MemberPress subscription data  
**Records:** 0 (empty - ready for subscription data)  
**Key Columns:**
- `id` (UUID) - Primary key
- `wordpress_user_id` (INTEGER) - Links to WordPress user
- `membership_id` (INTEGER) - MemberPress membership ID
- `membership_name` (TEXT) - Product name
- `status` (TEXT) - active, pending, expired, cancelled
- `started_at`, `expires_at` - Subscription timeline

**Integration Points:**
- Webhook updates from MemberPress
- Access control for premium features
- Billing and subscription management

### 4. `user_activity_log` - Complete Audit Trail
**Purpose:** Track all user actions for analytics and security  
**Records:** 0 (empty - ready for activity tracking)  
**Key Columns:**
- `id` (UUID) - Primary key
- `user_id` (UUID) - References users table
- `action` (TEXT) - Action performed
- `details` (JSONB) - Action metadata
- `created_at` (TIMESTAMPTZ) - When action occurred

**Integration Points:**
- User behavior analytics
- Security audit trails
- Feature usage tracking

---

## 🎫 **Registration & Onboarding Tables** (3 tables)

### 5. `registration_links` - Secure Registration Tokens
**Purpose:** Generate secure registration links for team/club invitations  
**Records:** 10 registration links  
**Key Columns:**
- `id` (UUID) - Primary key
- `token` (TEXT) - Unique registration token
- `target_type` (TEXT) - 'team' or 'club'
- `target_id` (UUID) - Team or club ID
- `default_role` (TEXT) - Role to assign upon registration
- `expires_at` (TIMESTAMPTZ) - Link expiration
- `max_uses`, `used_count` - Usage limits

**Integration Points:**
- Team invitation system
- Club recruitment
- Secure onboarding flow

### 6. `registration_sessions` - Registration Progress Tracking
**Purpose:** Track registration progress from start to completion  
**Key Columns:**
- `id` (UUID) - Primary key
- `token` (TEXT) - Registration session token
- `email` (TEXT) - User email being registered
- `session_status` (TEXT) - started, email_verified, completed, expired
- `user_id` (UUID) - Created user ID
- `verification_code` (TEXT) - Email verification code
- `expires_at` (TIMESTAMPTZ) - Session expiration

**Integration Points:**
- Multi-step registration process
- Email verification flow
- Registration abandonment tracking

### 7. `user_onboarding` - Step-by-Step Onboarding
**Purpose:** Track user progress through onboarding steps  
**Key Columns:**
- `id` (UUID) - Primary key
- `user_id` (UUID) - References users table
- `onboarding_step` (TEXT) - Current step name
- `step_order` (INTEGER) - Step sequence
- `step_status` (TEXT) - pending, in_progress, completed, skipped
- `completed_at` (TIMESTAMPTZ) - When step was completed
- `step_data` (JSONB) - Step-specific data

**Onboarding Steps:**
1. welcome
2. profile_setup
3. team_selection
4. role_confirmation
5. first_login_complete
6. dashboard_tour
7. practice_planner_intro
8. skills_academy_intro
9. gamification_intro
10. mobile_app_download
11. onboarding_complete

**Integration Points:**
- Progressive onboarding experience
- Feature introduction flow
- User engagement tracking

---

## 🏢 **Membership & Access Control Tables** (3 tables)

### 8. `membership_products` - MemberPress Product Catalog
**Purpose:** Map MemberPress products to app entitlements and behaviors  
**Records:** 12 membership products  
**Key Columns:**
- `wp_membership_id` (INTEGER) - Primary key from MemberPress
- `product_slug` (TEXT) - Product identifier
- `entitlement_key` (TEXT) - What access this grants
- `scope` (TEXT) - user, team, or club level
- `create_behavior` (TEXT) - none, create_team, create_club
- `default_role` (TEXT) - Role assigned upon purchase

**Product Types:**
- **Skills Academy:** Basic, Monthly, Annual access
- **Coach Kits:** Essentials, Confidence kits
- **Team HQ:** Structure, Leadership, Activated levels
- **Club OS:** Foundation, Growth, Command levels

**Integration Points:**
- Automatic team/club creation on purchase
- Role assignment based on product
- Access control throughout app

### 9. `membership_entitlements` - Active User Access Grants
**Purpose:** Track what access each user currently has  
**Records:** 7 active entitlements  
**Key Columns:**
- `id` (UUID) - Primary key
- `user_id` (UUID) - References users table
- `club_id`, `team_id` (UUID) - Scope of entitlement
- `entitlement_key` (TEXT) - What access is granted
- `status` (TEXT) - active, expired, canceled
- `starts_at`, `expires_at` - Entitlement timeline
- `source` (TEXT) - memberpress, manual, etc.

**Integration Points:**
- Feature access control
- Team/club permissions
- Subscription lifecycle management

### 10. `team_members` - Team Membership with Status
**Purpose:** Track team membership with soft-delete capabilities  
**Records:** 10 team members  
**Key Columns:**
- `id` (UUID) - Primary key
- `team_id` (UUID) - References team_teams table
- `user_id` (UUID) - References users table
- `role` (TEXT) - Team role (player, coach, head_coach)
- `status` (TEXT) - active, inactive (for soft-delete)
- `joined_at` (TIMESTAMPTZ) - When user joined team
- `invited_by` (UUID) - Who invited this user

**Integration Points:**
- Team roster management
- Role-based permissions
- Soft-delete on subscription cancellation

---

## 🔄 **Webhook & Event Processing Tables** (2 tables)

### 11. `webhook_events` - MemberPress Event Audit Trail
**Purpose:** Complete audit trail of all MemberPress webhook events  
**Key Columns:**
- `id` (UUID) - Primary key
- `event_type` (TEXT) - Type of MemberPress event
- `source` (TEXT) - memberpress, stripe, etc.
- `wordpress_user_id` (INTEGER) - WordPress user affected
- `membership_id`, `subscription_id` - MemberPress IDs
- `raw_payload` (JSONB) - Complete webhook data
- `processing_status` (TEXT) - pending, processing, completed, failed
- `received_at` (TIMESTAMPTZ) - When webhook was received

**Integration Points:**
- MemberPress webhook processing
- Event replay and debugging
- Subscription change tracking

### 12. `webhook_queue` - Reliable Webhook Processing
**Purpose:** Queue system for reliable webhook processing with retry logic  
**Key Columns:**
- `id` (UUID) - Primary key
- `webhook_url` (TEXT) - Target webhook URL
- `payload` (JSONB) - Webhook payload
- `headers` (JSONB) - HTTP headers
- `queue_status` (TEXT) - pending, processing, completed, failed, retry
- `retry_count` (INTEGER) - Number of retry attempts
- `max_retries` (INTEGER) - Maximum retry limit
- `scheduled_for` (TIMESTAMPTZ) - When to process

**Integration Points:**
- Reliable webhook delivery
- Failed webhook retry logic
- Webhook processing monitoring

---

## 🔗 **Table Relationships & Data Flow**

### **Primary Data Flow:**
```
MemberPress Webhook → webhook_events → webhook_queue → user_subscriptions → membership_entitlements → users
```

### **Registration Flow:**
```
registration_links → registration_sessions → users → user_onboarding → team_members
```

### **Session Management:**
```
users → user_sessions → user_activity_log
```

### **Access Control:**
```
users → membership_entitlements → membership_products → feature access
```

---

## 🛡️ **Security & Performance Features**

### **Row Level Security (RLS)**
- ✅ **All tables have RLS enabled**
- ✅ **Users can only access their own data**
- ✅ **Admin roles have elevated permissions**
- ✅ **Webhook tables are admin-only**

### **Performance Indexes**
- ✅ **All foreign keys are indexed**
- ✅ **Status columns are indexed** for fast filtering
- ✅ **Timestamp columns are indexed** for date queries
- ✅ **Email and token columns are indexed** for lookups

### **Data Integrity**
- ✅ **CHECK constraints** on status fields
- ✅ **UNIQUE constraints** on tokens and emails
- ✅ **Foreign key relationships** maintain referential integrity
- ✅ **Updated_at triggers** for automatic timestamp updates

---

## 🎮 **Integration with POWLAX Features**

### **Practice Planner Integration**
- Uses `users`, `team_members`, `user_activity_log`
- Tracks practice plan creation and usage
- Role-based access control

### **Skills Academy Integration**
- Uses `users`, `membership_entitlements`, `user_subscriptions`
- Controls access to premium content
- Tracks workout completions

### **Gamification System**
- Uses `user_activity_log`, `membership_entitlements`
- Points and badge calculations
- Progress tracking

### **Team Management**
- Uses `team_members`, `registration_links`, `users`
- Team roster management
- Invitation and onboarding flow

---

## 📋 **Current Status Summary**

| Component | Status | Records | Ready for Integration |
|-----------|--------|---------|----------------------|
| **Core Auth** | ✅ Complete | 12 users | ✅ Yes |
| **Subscriptions** | ✅ Complete | 0 (ready) | ✅ Yes |
| **Registration** | ✅ Complete | 10 links | ✅ Yes |
| **Memberships** | ✅ Complete | 12 products, 7 entitlements | ✅ Yes |
| **Teams** | ✅ Complete | 10 members | ✅ Yes |
| **Webhooks** | ✅ Complete | 0 (ready) | ✅ Yes |

## 🚀 **Next Steps**

1. **Authentication Migration** - Ready to implement Supabase Auth + Magic Links
2. **MemberPress Webhooks** - Ready to process subscription changes
3. **Claude.md Updates** - Update all documentation with correct table references
4. **API Endpoint Updates** - Update endpoints to use correct table structures

**Database is 100% ready for the authentication system migration!** 🎉

