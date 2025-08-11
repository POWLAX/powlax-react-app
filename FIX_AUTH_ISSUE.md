# 🚨 FIX FOR AUTHENTICATION ISSUES IN PRACTICE PLANNER

## Problem
You're logged in (showing patrick@powlax.com) but features fail with:
- "Failed to create custom drill: null value in column 'user_id'"
- "Please sign in to save favorites"
- "You must be logged in" errors

## Root Cause
The authentication is using localStorage but the user object doesn't have a proper ID. The app shows you as logged in but `user.id` is null internally.

## Quick Fix (Run in Browser Console)

Open browser console (F12) and paste this:

```javascript
localStorage.setItem('supabase_auth_user', JSON.stringify({
  id: '523f2768-6404-439c-a429-f9eb6736aa17',
  email: 'patrick@powlax.com',
  display_name: 'Patrick Chapla',
  roles: ['administrator', 'parent', 'club_director', 'team_coach', 'player'],
  role: 'administrator',
  full_name: 'Patrick Chapla',
  avatar_url: null,
  wordpress_id: null
}));
location.reload();
```

For chaplalalacrosse22@gmail.com, you'll need to:
1. First find the user ID in the database
2. Use that ID in the localStorage object

## Why This Happens
1. The app uses a custom authentication system (not Supabase Auth)
2. Authentication stores user data in localStorage
3. The stored user object is missing the `id` field
4. Components get `user.id = null` even though you're "logged in"

## Permanent Fix Needed
The authentication system needs to:
1. Properly set user.id when logging in
2. Use public.users table IDs consistently
3. Ensure localStorage always has complete user data

## Testing After Fix
1. Run the console command above
2. Refresh the page
3. Try creating a custom drill - should work
4. Try saving favorites - should work
5. Try saving a practice plan - should work

## For Other Users
To fix for chaplalalacrosse22@gmail.com:
1. Find their user ID in the public.users table
2. Use that ID in the localStorage object
3. Or implement proper login flow that sets correct user data