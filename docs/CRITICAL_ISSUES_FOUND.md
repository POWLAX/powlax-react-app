# 🚨 CRITICAL ISSUES FOUND - POWLAX Authentication & Features

## Executive Summary
Multiple critical issues are preventing admin features, practice planning, and authentication from working properly:

1. **Missing Supabase Tables** - Core tables don't exist
2. **No User Sync** - WordPress users not in Supabase
3. **Auth Redirect Issues** - Authentication not persisting across pages
4. **Admin Features Hidden** - No admin users in database

---

## 🔴 CRITICAL ISSUE #1: Missing Database Tables

### Tables That DON'T EXIST in Supabase:
- ❌ `drills_powlax` - **This is why you can't see or edit drills**
- ❌ `strategies_powlax` - **This is why strategies don't work**
- ❌ `team_playbooks` - **This is why team playbook doesn't work**

### Empty Tables (exist but no data):
- ⚠️ `user_profiles` - **No users, including no admin users**
- ⚠️ `teams` - **No teams defined**
- ⚠️ `practice_plans` - **Can't save/load plans**

### Result:
- **No drills to display** in Practice Planner
- **No strategies to select**
- **Can't save practice plans** (no team to save to)
- **Admin features don't show** (no admin users in database)

---

## 🔴 CRITICAL ISSUE #2: No User Synchronization

### The Problem:
Your WordPress login works, BUT:
- WordPress user data is **NOT synced to Supabase**
- patrick@powlax.com **doesn't exist** in `user_profiles` table
- Admin permissions **can't be verified** without user record

### Why This Matters:
```javascript
// The code checks for admin like this:
canEditDrillsAndStrategies(user) {
  // Checks user.email against admin list
  // BUT user data comes from Supabase user_profiles
  // If you're not in that table, you're not admin!
}
```

---

## 🔴 CRITICAL ISSUE #3: Authentication Redirect Loop

### Current Flow (BROKEN):
1. Login at `/auth/login` → Sets WordPress token
2. Navigate to `/skills-academy/workouts` → Redirected back to login
3. Auth context checks Supabase for user → Finds nothing
4. Assumes not logged in → Redirects to login

### The Skills Academy Issue:
The page doesn't use WordPress auth, it only checks localStorage for a token that doesn't persist properly.

---

## 🚀 IMMEDIATE FIXES NEEDED

### Fix #1: Create Missing Tables
```sql
-- Run these in Supabase SQL editor

-- Create drills table
CREATE TABLE IF NOT EXISTS drills_powlax (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  drill_duration TEXT,
  drill_category TEXT,
  drill_types TEXT,
  age_group TEXT,
  complexity_rating TEXT,
  video_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create strategies table  
CREATE TABLE IF NOT EXISTS strategies_powlax (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  strategy_name TEXT NOT NULL,
  strategy_categories TEXT,
  description TEXT,
  complexity TEXT,
  age_group TEXT,
  vimeo_link TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create team playbooks table
CREATE TABLE IF NOT EXISTS team_playbooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id),
  strategy_id UUID REFERENCES strategies_powlax(id),
  custom_name TEXT,
  team_notes TEXT,
  added_by UUID,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Fix #2: Sync WordPress User to Supabase
```sql
-- Add yourself as admin user
INSERT INTO user_profiles (id, email, full_name, roles)
VALUES (
  gen_random_uuid(),
  'patrick@powlax.com',
  'Patrick',
  ARRAY['administrator']
)
ON CONFLICT (email) 
DO UPDATE SET roles = ARRAY['administrator'];
```

### Fix #3: Fix Authentication Persistence

Create this file: `src/app/(authenticated)/skills-academy/layout.tsx`
```typescript
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/JWTAuthContext'

export default function SkillsAcademyLayout({
  children
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Don't redirect if still loading or if token exists
    const token = localStorage.getItem('wp_jwt_token')
    if (!loading && !user && !token) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return <>{children}</>
}
```

---

## 🔧 QUICK WORKAROUND (For Testing)

While we fix the database issues, you can temporarily bypass auth to see features:

### In `/src/app/(authenticated)/teams/[teamId]/practice-plans/page.tsx`:
```typescript
// Line 31 - Replace:
const { user } = useAuth()

// With mock admin user:
const user = {
  id: 'test-admin',
  email: 'patrick@powlax.com',
  name: 'Patrick',
  roles: ['administrator']
}
```

### In `/src/hooks/useDrills.ts`:
```typescript
// Add mock drills if database is empty
const mockDrills = [
  {
    id: 'drill-1',
    name: 'Ground Ball Technique',
    duration: 10,
    category: 'Ground Balls',
    source: 'powlax'
  },
  // Add more mock drills
]

// Return mock data if no database drills
return drills.length > 0 ? drills : mockDrills
```

---

## 📋 COMPLETE FIX CHECKLIST

### Database Setup:
- [ ] Create `drills_powlax` table
- [ ] Create `strategies_powlax` table  
- [ ] Create `team_playbooks` table
- [ ] Import drill data
- [ ] Import strategy data
- [ ] Add admin users to `user_profiles`
- [ ] Create at least one team

### Authentication Fix:
- [ ] Fix Skills Academy layout auth check
- [ ] Ensure token persists in localStorage
- [ ] Sync WordPress users to Supabase on login
- [ ] Add user creation on first login

### Feature Verification:
- [ ] Admin edit buttons appear
- [ ] Can create custom drills
- [ ] Can save practice plans
- [ ] Can load saved plans
- [ ] Team playbook saves work
- [ ] Strategies display correctly

---

## 💡 ROOT CAUSE

The app was built expecting:
1. **Supabase to have all the data tables**
2. **WordPress users to be synced to Supabase**
3. **Both auth systems to work together**

But currently:
1. **Critical tables are missing**
2. **No user synchronization exists**
3. **Auth systems are disconnected**

This is why nothing works even though you're "logged in" - the app can't find the data or verify your permissions!

---

## 🚨 PRIORITY ACTIONS

1. **IMMEDIATE**: Run the SQL to create missing tables
2. **URGENT**: Add yourself to user_profiles as admin
3. **IMPORTANT**: Import drill and strategy data
4. **NEXT**: Fix auth persistence across pages

Without these fixes, the Practice Planner will remain non-functional!