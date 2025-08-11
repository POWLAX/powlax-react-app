# 📊 TABLE MAPPING FIX PLAN - Critical Database Issues

## 🎯 Executive Summary

The POWLAX app is failing because it's querying **WRONG TABLE NAMES**. The database has 135 drills and 220 strategies, but the code can't find them because it's looking in the wrong places!

---

## ✅ ACTUAL vs ❌ WRONG Table Names

| What It's For | ❌ WRONG (Code Uses) | ✅ CORRECT (Actually Exists) | Status |
|---------------|---------------------|---------------------------|---------|
| Drills | `drills_powlax` | **`powlax_drills`** | 135 records exist! |
| Strategies | `strategies_powlax` | **`powlax_strategies`** | 220 records exist! |
| Users | `user_profiles` | **`users`** | 12 records (including patrick@powlax.com) |
| Teams | `teams` | **`team_teams`** | 10 teams exist! |
| Practice Plans | `practice_plans` | **`practices`** | 25 practices exist! |

---

## 🔍 Analysis Results

### ✅ GOOD NEWS - These Hooks Are CORRECT:
- `src/hooks/useDrills.ts` - ✅ Uses `powlax_drills`
- `src/hooks/useStrategies.ts` - ✅ Uses `powlax_strategies`
- `src/hooks/useAdminEdit.ts` - ✅ Uses `powlax_drills` and `powlax_strategies`
- `src/hooks/useTeamPlaybook.ts` - ✅ Uses `powlax_strategies`

### ❌ BAD NEWS - These Files Need Fixing:

#### 1. **Practice Plans Hook** (`src/hooks/usePracticePlans.ts`)
- **Lines**: 63, 105, 145, 177, 204
- **Wrong**: `practice_plans`
- **Should be**: `practices`
- **Impact**: Can't save or load practice plans

#### 2. **Teams Hook** (`src/hooks/useTeams.ts`)
- **Lines**: 41, 69, 99, 118, 217
- **Wrong**: `teams`
- **Should be**: `team_teams`
- **Impact**: Can't access teams

#### 3. **Admin Permissions** (`src/lib/adminPermissions.ts`)
- **Issue**: Checks `user.email` against admin list
- **Problem**: The `users` table structure is different from expected
- **Need**: Map WordPress user data correctly

#### 4. **Dashboard Queries** (`src/lib/dashboard-queries.ts`)
- **Line**: 221
- **Wrong**: `teams`
- **Should be**: `team_teams`

#### 5. **Organizations Hook** (`src/hooks/useOrganizations.ts`)
- **Line**: 231
- **Wrong**: `teams`
- **Should be**: `team_teams`

---

## 🚨 CRITICAL ISSUE: User Authentication Mismatch

### The Problem:
The code expects a `user_profiles` table with this structure:
```typescript
{
  id: string
  email: string
  full_name: string
  roles: string[]
}
```

But the actual `users` table has:
```typescript
{
  id: number
  email: string
  display_name: string
  // roles might be in a different field or table
}
```

### Why Admin Features Don't Work:
```typescript
// Code checks for admin like this:
const ADMIN_EMAILS = ['patrick@powlax.com', 'admin@powlax.com']

// But it's checking user.email from a user_profiles table that doesn't exist!
// The actual user is in the 'users' table with different field names
```

---

## 🛠️ COMPREHENSIVE FIX PLAN

### Phase 1: Quick Fixes (30 minutes)

#### Fix 1: Update Practice Plans Hook
```typescript
// In src/hooks/usePracticePlans.ts
// Replace ALL instances of:
.from('practice_plans')
// With:
.from('practices')
```

#### Fix 2: Update Teams References
```typescript
// In src/hooks/useTeams.ts, useOrganizations.ts, dashboard-queries.ts
// Replace ALL instances of:
.from('teams')
// With:
.from('team_teams')
```

#### Fix 3: Create User Mapping Function
```typescript
// Create src/lib/userMapping.ts
export function mapSupabaseUserToAppUser(supabaseUser: any) {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email,
    name: supabaseUser.display_name || supabaseUser.email,
    roles: supabaseUser.roles || [],
    // Check if email is in admin list
    isAdmin: ['patrick@powlax.com', 'admin@powlax.com'].includes(supabaseUser.email)
  }
}
```

### Phase 2: Authentication Fix (1 hour)

#### Fix WordPress-Supabase User Sync
The WordPress user (patrick@powlax.com) exists in the `users` table but the app can't recognize it as admin because:
1. It's looking for `user_profiles` table
2. Field names are different (`display_name` vs `full_name`)
3. Roles might not be stored in the user record

**Solution**: Update the auth context to query the correct table and map fields properly.

### Phase 3: Complete Table Migration (2 hours)

Create migration utilities to handle all table name differences:

```typescript
// src/lib/tableNames.ts
export const TABLES = {
  // Correct mappings
  DRILLS: 'powlax_drills',
  STRATEGIES: 'powlax_strategies',
  USERS: 'users',
  TEAMS: 'team_teams',
  TEAM_MEMBERS: 'team_members',
  PRACTICES: 'practices',
  CLUBS: 'club_organizations',
  
  // Old names (for reference)
  OLD_DRILLS: 'drills_powlax',
  OLD_STRATEGIES: 'strategies_powlax',
  OLD_USERS: 'user_profiles',
  OLD_TEAMS: 'teams',
  OLD_PRACTICES: 'practice_plans'
}
```

---

## 📋 Files That Need Updates

### Priority 1 (Breaking Everything):
1. `src/hooks/usePracticePlans.ts` - Change `practice_plans` → `practices`
2. `src/hooks/useTeams.ts` - Change `teams` → `team_teams`
3. `src/lib/adminPermissions.ts` - Update to check `users` table

### Priority 2 (Features Not Working):
1. `src/lib/dashboard-queries.ts`
2. `src/hooks/useOrganizations.ts`
3. `src/hooks/useDashboardData.ts`

### Priority 3 (Auth & Permissions):
1. `src/contexts/JWTAuthContext.tsx` - Update user mapping
2. `src/app/api/auth/proxy/route.ts` - Map user fields correctly
3. `src/middleware/roleValidation.ts` - Check correct user table

---

## 🎯 IMMEDIATE ACTIONS

### 1. Test Current State
```bash
# Run this to see the actual data:
npx tsx scripts/verify-correct-tables.ts
```

### 2. Quick Win - Fix Practice Plans
Just change 5 lines in `usePracticePlans.ts` from `practice_plans` to `practices`

### 3. Quick Win - Fix Teams
Change all `.from('teams')` to `.from('team_teams')`

### 4. Make Admin Work
Update admin check to look at `users` table with correct field names

---

## ✨ Once Fixed, You'll Have:
- ✅ 135 drills available in Practice Planner
- ✅ 220 strategies to choose from
- ✅ Admin features working (you're in the users table!)
- ✅ Can save/load practice plans
- ✅ Team features functional
- ✅ Full app functionality restored!

---

## 🚀 Next Steps

1. **IMMEDIATE**: Run find/replace for wrong table names
2. **URGENT**: Update user authentication to use `users` table
3. **IMPORTANT**: Test all features after fixes
4. **FUTURE**: Consider creating views with old names for backward compatibility

The good news: **ALL YOUR DATA EXISTS!** We just need to point the code to the right tables!