# 📝 CLAUDE.MD AUTHENTICATION UPDATE GUIDE

## 🎯 **MANDATORY CLAUDE.MD UPDATES**

Every `claude.md` file in the project **MUST** include the authentication mandate to prevent future WordPress auth integration attempts.

## 📋 **REQUIRED SECTION FOR ALL CLAUDE.MD FILES**

Add this section to **EVERY** `claude.md` file in the project:

```markdown
## 🚨 AUTHENTICATION MANDATE - READ FIRST

**CRITICAL**: This project uses **SUPABASE AUTHENTICATION ONLY**

### ✅ APPROVED AUTH PATTERNS
- Supabase `auth.users` table
- Magic links via SendGrid  
- `public.users` linked to `auth.users` via `auth_user_id`
- Supabase sessions and RLS policies
- `useSupabaseAuth()` hook for authentication state

### ❌ FORBIDDEN AUTH PATTERNS - NEVER USE
- WordPress authentication (ANY FORM)
- MemberPress auth integration
- WordPress user sync for auth
- Hybrid auth systems (WordPress + Supabase)
- WordPress session management
- `useWordPressAuth()` or similar hooks
- `/api/auth/proxy` endpoints
- `wordpress_id` for authentication purposes

### 🔧 CORRECT AUTH IMPLEMENTATION
```typescript
// ✅ CORRECT
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext'
const { user, isLoading } = useSupabaseAuth()
const isAdmin = user?.role === 'admin'

// ❌ WRONG - NEVER USE
import { useWordPressAuth } from '@/lib/wordpress-auth'
const { wpUser } = useWordPressAuth()
```

**If you encounter ANY WordPress auth references, REMOVE them immediately and use Supabase patterns instead.**
```

## 📁 **FILES REQUIRING CLAUDE.MD UPDATES**

### **Component Claude.md Files**
```
src/components/claude.md ⭐ MAIN FILE
src/components/admin/claude.md
src/components/auth/claude.md  
src/components/dashboards/claude.md
src/components/practice-planner/claude.md
src/components/skills-academy/claude.md
src/components/teams/claude.md
src/components/ui/claude.md
```

### **App-Level Claude.md Files**
```
src/claude.md ⭐ MAIN FILE
src/app/claude.md
docs/features/claude.md
```

### **Root Project Files**
```
CLAUDE.md ⭐ MAIN PROJECT FILE
AI_FRAMEWORK_ERROR_PREVENTION.md (update auth section)
```

## 🔧 **IMPLEMENTATION SCRIPT**

```bash
# Update all claude.md files with auth mandate
find . -name "claude.md" -exec echo "Updating: {}" \;

# Add the auth mandate section to each file
# (Manual process - review each file individually)
```

## 📋 **VERIFICATION CHECKLIST**

After updating all Claude.md files:
- [ ] Every `claude.md` has the authentication mandate section
- [ ] All WordPress auth patterns are documented as forbidden
- [ ] Supabase patterns are clearly marked as approved
- [ ] Code examples show correct vs incorrect patterns
- [ ] Emergency removal protocol is documented

## 🎯 **COMPONENT CATALOG PRESERVATION**

### **Component Catalog Location**
- **Backup**: `component-catalog_backup_20250813_2359/`
- **URL**: `http://localhost:3001/component-catalog`
- **Files**:
  - `src/app/component-catalog/page.tsx`
  - `src/app/component-catalog/layout.tsx`

### **Restoration Commands**
```bash
# Restore component catalog after reset
cp -r component-catalog_backup_20250813_2359/* src/app/component-catalog/

# Verify it works
npm run dev
# Visit: http://localhost:3001/component-catalog
```

## 🚨 **EMERGENCY REFERENCE**

If you ever see these patterns, **STOP IMMEDIATELY**:
- `import { wordpressAuth }`
- `useWordPressAuth()`
- `/api/auth/proxy`
- `wordpress_id` in auth context
- `wp_users` table for authentication
- Hybrid auth switching logic

**Replace with Supabase patterns immediately.**

---

## 🎯 **IMPLEMENTATION PRIORITY**

1. **Reset to working state** (`dd7c5b4`)
2. **Update all Claude.md files** with auth mandate
3. **Restore contracts and components** selectively
4. **Verify component catalog** works
5. **Test authentication** thoroughly

**This guide ensures WordPress auth NEVER breaks the system again.**

