# 🚀 How to Use the New Practice Planner Features

## Overview
The Practice Planner has received several powerful new features including an Admin Editing System and Team Playbook functionality. Here's how to access and use them.

---

## 🔐 Authentication Requirements

### Current Status
The app uses JWT authentication with WordPress integration, but for local development, you have **two options**:

### Option 1: Mock Admin User (Easiest for Testing)
To quickly test admin features without setting up full authentication:

1. **Temporarily modify the auth context** in your Practice Planner page:
```typescript
// In src/app/(authenticated)/teams/[teamId]/practice-plans/page.tsx
// Replace line 31:
const { user } = useAuth()

// With a mock admin user:
const user = {
  id: 'mock-admin',
  email: 'admin@powlax.com',  // This email has admin permissions
  name: 'Admin User',
  roles: ['administrator']
}
```

2. **Now you'll see all admin features!**

### Option 2: Real Authentication (Production-like)
If you want to test with real authentication:
1. You need a WordPress backend with JWT authentication plugin
2. Login credentials with one of these admin emails:
   - `admin@powlax.com`
   - `patrick@powlax.com`
   - `support@powlax.com`

---

## 🛠️ Admin Editing System

### What It Does
Allows admins to edit drill and strategy content directly in the Practice Planner, updating the production database immediately.

### How to Access
1. **Be logged in as admin** (see Authentication above)
2. **Navigate to Practice Planner**: http://localhost:3000/teams/test-team/practice-plans
3. **Hover over any drill or strategy card**
4. **Look for the orange edit icon** (appears only for admins)

### What You Can Edit
- **Drills**: 
  - Video URLs
  - Categories
  - Age ranges
  - Duration
  - Coaching instructions
  - Complexity ratings
  
- **Strategies**:
  - Descriptions
  - Game phases
  - Complexity levels
  - Video links
  - Coaching notes

### Visual Guide
```
When hovering over a drill card as admin:
┌─────────────────────────────┐
│ Drill Name          [🟠 ✏️] │  <- Orange edit icon appears
│ Duration: 10 min            │
│ Category: Passing           │
└─────────────────────────────┘
```

### Important Notes
- Only POWLAX-sourced content is editable
- User-created custom drills cannot be edited via admin interface
- Changes save directly to production database

---

## 📚 Team Playbook System

### What It Does
Allows coaches to save strategies to a team-specific playbook that players can access and study.

### How to Use

#### For Coaches (Saving Strategies):
1. **Navigate to Practice Planner**
2. **Click the Strategies tab** in the right sidebar
3. **Find a strategy you like**
4. **Click "Save to Playbook" button** on the strategy card
5. **In the modal that opens**:
   - Select your team
   - Add custom team-specific name (optional)
   - Add team notes (optional)
   - Click Save

#### For Players (Viewing Playbook):
1. **Navigate to your team page**: `/teams/[teamId]/playbook`
2. **View all saved strategies** in card format
3. **Click any strategy card** to open the Study modal
4. **Study the strategy** with Overview, Diagram, and Video tabs

### Visual Flow
```
Practice Planner → Strategy Card → "Save to Playbook" → Modal → Team Playbook
                                                          ↓
Player View ← Team Dashboard ← Team Playbook Page ← Strategy Saved
```

---

## 🎯 Custom Drill Creation

### How to Create Custom Drills
1. **In Practice Planner**, look for **"+ Add Custom Drill"** button
2. **Fill in the form**:
   - Drill name (required)
   - Duration in minutes
   - Coaching notes
3. **Click "Create"**
4. **Drill appears immediately** in your practice plan

### Where Custom Drills Are Stored
- Saved to `user_drills` table in Supabase
- Associated with your user account
- Appear in the "Custom Drills" accordion in the drill library

---

## 🔍 How to Verify Features Are Working

### Quick Test Checklist

#### 1. Test Admin Features
```javascript
// Temporarily add this to see admin features
const user = { email: 'admin@powlax.com', roles: ['administrator'] }
```
- [ ] Orange edit icons appear on hover
- [ ] Edit modal opens when clicked
- [ ] Changes can be saved

#### 2. Test Team Playbook
- [ ] "Save to Playbook" button visible on strategy cards
- [ ] Modal opens with team selection
- [ ] Strategy saves successfully
- [ ] Playbook page shows saved strategies

#### 3. Test Custom Drills
- [ ] "+ Add Custom Drill" button visible
- [ ] Modal opens and accepts input
- [ ] Custom drill appears in practice
- [ ] Drill shows in "Custom Drills" accordion

---

## 🐛 Troubleshooting

### Admin Features Not Showing?
1. **Check your user object** - Must have admin email or role
2. **Check browser console** for errors
3. **Verify you're hovering** over POWLAX drills (not custom ones)

### Team Playbook Not Working?
1. **Ensure you have a team selected** in the URL
2. **Check Supabase connection** is active
3. **Verify `team_playbooks` table exists** in database

### Custom Drills Not Appearing?
1. **Check `user_drills` table** in Supabase
2. **Ensure you're logged in** (drills are user-specific)
3. **Refresh the drill library** with the refresh button

---

## 📊 Database Tables Used

### For Admin System
- `drills_powlax` - Main drill content
- `strategies_powlax` - Strategy content

### For Team Playbook
- `team_playbooks` - Saved team strategies
- `teams` - Team information
- `user_profiles` - User who saved strategy

### For Custom Drills
- `user_drills` - User-created drills

---

## 🎨 Visual Indicators

### Admin User Indicators
- **Orange edit icons** on hover (admin only)
- **"Admin" badge** in user menu (if implemented)

### Custom Content Indicators
- **Green "Custom" badge** on user-created drills
- **User icon** next to custom drill names

### Team Playbook Indicators
- **"Save to Playbook" button** on strategy cards
- **Team name** displayed in playbook view

---

## 💡 Pro Tips

1. **For Quick Testing**: Use the mock admin user approach
2. **For Production**: Set up proper WordPress JWT auth
3. **Mobile Testing**: Features work on mobile too!
4. **Auto-Save**: Practice plans auto-save every 3 seconds
5. **Print View**: Admin edits and playbook items appear in print

---

## 🚀 Next Steps

1. **Try the mock admin user** to see all features
2. **Create a custom drill** to test that flow
3. **Save a strategy to playbook** (if teams are set up)
4. **Edit a drill as admin** to test the admin system

---

## 📝 Summary

The new features are powerful but require authentication to fully access:
- **Admin features**: Need admin email/role
- **Team playbook**: Works for all authenticated users
- **Custom drills**: Works for all users (even without full auth)

For local testing, using a mock admin user is the fastest way to see everything in action!