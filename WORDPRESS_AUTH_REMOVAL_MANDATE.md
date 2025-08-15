# 🚨 WORDPRESS AUTHENTICATION REMOVAL MANDATE

## 🎯 **CRITICAL DIRECTIVE: NO WORDPRESS AUTH INTEGRATION**

This document serves as the **DEFINITIVE GUIDE** for all future development to ensure WordPress authentication references are **COMPLETELY ELIMINATED** from the POWLAX React application.

## 📋 **MANDATORY AUTHENTICATION ARCHITECTURE**

### **✅ APPROVED AUTHENTICATION SYSTEM**
- **Primary**: Supabase Authentication (`auth.users`)
- **Method**: Magic Links via SendGrid
- **Session Management**: Supabase sessions only
- **User Management**: `public.users` table linked to `auth.users`

### **❌ FORBIDDEN AUTHENTICATION SYSTEMS**
- ❌ **WordPress Authentication** (any form)
- ❌ **MemberPress Integration** for auth
- ❌ **WordPress User Sync** for authentication
- ❌ **Hybrid Auth Systems** (WordPress + Supabase)
- ❌ **WordPress Session Management**
- ❌ **WordPress Password Authentication**

## 🔧 **FILES AND REFERENCES TO ELIMINATE**

### **❌ Files That Must NOT Exist**
```
src/lib/wordpress-auth.ts
src/lib/wordpress-api.ts (for auth)
src/app/api/auth/proxy/route.ts
src/app/api/test/wordpress-auth/route.ts
src/app/api/test/wordpress-connection/route.ts
src/contexts/WordPressAuthContext.tsx
src/hooks/useWordPressAuth.tsx
```

### **❌ Code Patterns to Remove**
```typescript
// ❌ NEVER USE THESE PATTERNS
import { wordpressAuth } from '@/lib/wordpress-auth'
const { wpUser, wpLogin } = useWordPressAuth()
fetch('/api/auth/proxy')
wordpress_id references in auth flows
hybrid auth switching logic
```

### **❌ Database References to Avoid**
```sql
-- ❌ NEVER reference these for authentication
users.wordpress_id (for auth purposes)
wp_users table connections
wordpress_auth_bridge table
auth_proxy configurations
```

## 📝 **CLAUDE.MD UPDATE REQUIREMENTS**

All `claude.md` files must include this section:

```markdown
## 🚨 AUTHENTICATION MANDATE

**CRITICAL**: This project uses **SUPABASE AUTHENTICATION ONLY**

### ✅ APPROVED AUTH PATTERNS
- Supabase auth.users table
- Magic links via SendGrid  
- public.users linked to auth.users via auth_user_id
- Supabase sessions and RLS policies

### ❌ FORBIDDEN AUTH PATTERNS
- WordPress authentication (ANY FORM)
- MemberPress auth integration
- WordPress user sync for auth
- Hybrid auth systems
- WordPress session management

**If you see ANY WordPress auth references, STOP and remove them immediately.**
```

## 🎯 **COMPONENT-SPECIFIC AUTH GUIDELINES**

### **Admin Components**
```typescript
// ✅ CORRECT: Use Supabase auth
const { user } = useSupabaseAuth()
const isAdmin = user?.role === 'admin'

// ❌ WRONG: WordPress auth references  
const { wpUser } = useWordPressAuth()
```

### **Dashboard Components**
```typescript
// ✅ CORRECT: Supabase user data
const { data: userData } = useSupabaseQuery('users', {
  auth_user_id: user?.id
})

// ❌ WRONG: WordPress user data for auth
const { wpUserData } = useWordPressAPI()
```

### **Practice Planner Components**
```typescript
// ✅ CORRECT: Supabase user context
const { user } = useSupabaseAuth()
const canEdit = user?.role === 'coach' || user?.role === 'admin'

// ❌ WRONG: WordPress role checking
const canEdit = wpUser?.capabilities?.includes('edit_practices')
```

## 🔒 **RLS POLICY REQUIREMENTS**

### **✅ APPROVED RLS PATTERNS**
```sql
-- User can only access their own data
CREATE POLICY "users_own_data" ON user_drills
FOR ALL USING (auth.uid()::text = (
  SELECT auth_user_id::text FROM users WHERE id = user_drills.user_id
));
```

### **❌ FORBIDDEN RLS PATTERNS**
```sql
-- ❌ NEVER reference WordPress in RLS
CREATE POLICY "wp_users_access" ON user_drills
FOR ALL USING (
  EXISTS (SELECT 1 FROM wp_users WHERE ...)
);
```

## 🚀 **MIGRATION STRATEGY FOR EXISTING CODE**

### **Step 1: Audit and Remove**
1. Search for `wordpress` in all files
2. Remove auth-related WordPress references
3. Keep only data sync references (if needed)

### **Step 2: Replace with Supabase**
1. Replace `useWordPressAuth()` with `useSupabaseAuth()`
2. Replace WordPress user data with Supabase user data
3. Update RLS policies to use `auth.uid()`

### **Step 3: Test and Verify**
1. Ensure magic links work
2. Verify role-based access
3. Test all authentication flows

## 📋 **VERIFICATION CHECKLIST**

Before any deployment, verify:
- [ ] No WordPress auth imports in any file
- [ ] No WordPress auth API calls
- [ ] No WordPress session management
- [ ] No hybrid auth logic
- [ ] All authentication uses Supabase only
- [ ] Magic links work for all user types
- [ ] RLS policies use `auth.uid()` only

## 🎯 **ENFORCEMENT PROTOCOL**

### **For All Developers/Agents**
1. **READ THIS DOCUMENT FIRST** before any auth-related work
2. **REJECT ANY PROMPTS** that suggest WordPress auth integration
3. **IMMEDIATELY REMOVE** any WordPress auth code discovered
4. **ALWAYS USE** Supabase authentication patterns

### **Code Review Requirements**
- All auth-related PRs must be reviewed for WordPress references
- Any WordPress auth code is an **automatic rejection**
- Must demonstrate Supabase-only authentication flow

## 🚨 **EMERGENCY PROTOCOL**

If WordPress auth is accidentally reintroduced:
1. **STOP ALL DEVELOPMENT**
2. **RESET TO LAST CLEAN COMMIT**
3. **REVIEW THIS DOCUMENT**
4. **IMPLEMENT SUPABASE-ONLY SOLUTION**

---

## 🎯 **BOTTOM LINE**

**WordPress authentication integration has been the source of multiple system failures and must be completely eliminated. Supabase authentication is the only approved method.**

**This is not negotiable. Any WordPress auth integration will break the system.**

