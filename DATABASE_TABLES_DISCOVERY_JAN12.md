# 🔍 DATABASE TABLES DISCOVERY - JANUARY 12, 2025

## CRITICAL FINDINGS: Actual Table Structures

After extensive testing, here's what the tables ACTUALLY have:

### 📊 **user_drills Table**
**Actual Columns:**
- `user_id` (text/UUID) - User's ID from public.users
- `title` (text) - Drill name/title
- **That's it!** No other columns exist

**Missing Columns that Modal expects:**
- ❌ content
- ❌ duration_minutes  
- ❌ category
- ❌ video_url
- ❌ drill_lab_url_1-5
- ❌ equipment
- ❌ tags
- ❌ game_states
- ❌ is_public
- ❌ team_share
- ❌ club_share

### 📊 **user_strategies Table**
**Actual Columns:**
- `user_id` (text/UUID) - User's ID from public.users
- `strategy_name` (text) - Strategy name
- **That's it!** No other columns exist

**Missing Columns that Modal expects:**
- ❌ content
- ❌ description
- ❌ lesson_category
- ❌ video_url
- ❌ lacrosse_lab_urls
- ❌ target_audience
- ❌ age fields
- ❌ is_public
- ❌ team_share
- ❌ club_share

### 📊 **user_favorites Table**
**Actual Columns:**
- `user_id` (text/UUID)
- `drill_id` (UUID) - **REQUIRED, NOT NULL**
- Other unknown columns

**Problems:**
- Only supports drill_id (UUID), not flexible favorites
- Can't store strategy favorites
- drill_id is NOT NULL, so can't be optional
- Doesn't match our item_id/item_type pattern

## 🔧 SOLUTIONS NEEDED

### Option 1: Add Missing Columns (RECOMMENDED)
Create migrations to add all the missing columns to match what the UI expects:

**user_drills additions needed:**
```sql
ALTER TABLE user_drills ADD COLUMN content TEXT;
ALTER TABLE user_drills ADD COLUMN duration_minutes INTEGER;
ALTER TABLE user_drills ADD COLUMN category TEXT;
ALTER TABLE user_drills ADD COLUMN video_url TEXT;
ALTER TABLE user_drills ADD COLUMN drill_lab_url_1 TEXT;
-- etc...
```

### Option 2: Redesign Tables Completely
Create new tables with proper structure:

**New user_favorites structure needed:**
```sql
CREATE TABLE user_favorites_new (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT REFERENCES public.users(id),
  item_id TEXT NOT NULL,
  item_type TEXT CHECK (item_type IN ('drill', 'strategy')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, item_id, item_type)
);
```

## 🚨 CURRENT WORKAROUNDS APPLIED

To make things "work" temporarily:
1. **user_drills** - Only saving `title` field, losing all other data
2. **user_strategies** - Only saving `strategy_name`, losing all details
3. **user_favorites** - Disabled database, using localStorage only

## 📋 NEXT STEPS

1. **Decide on approach**: Add columns vs redesign tables
2. **Create proper migrations**: Based on decision above
3. **Update hooks**: To use correct column names
4. **Test thoroughly**: Ensure all features work

## ⚠️ IMPORTANT NOTES

- The modals collect MUCH more data than the tables can store
- Current "fixes" are just workarounds that lose data
- Need proper database schema to match UI expectations
- RLS policies also need updating after schema changes