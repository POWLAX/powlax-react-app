# 🎮 GamiPress to Supabase Migration & Sync Plan

**Date**: January 10, 2025  
**Status**: READY FOR IMPLEMENTATION  
**Priority**: HIGH - User engagement and retention depend on preserving gamification progress

---

## 📊 Executive Summary

This plan outlines the complete migration and ongoing synchronization of GamiPress gamification data from WordPress to Supabase. The WordPress system contains **59 point types**, **52 badges across 5 categories**, and **2 rank types** with associated user progress that must be preserved and synced.

---

## 🗂️ Current WordPress GamiPress Structure

### Point Types (59 Total)
Based on `Points-Types-Export-2025-July-31-1904.csv`:

#### **Core Currency Points (5)**
1. **Academy Points** (`lax-credit`) - Primary Skills Academy currency
   - Icon: `Lax-Credits.png` / `Lax-Credit.png`
2. **Attack Tokens** (`attack-token`) - Attack position rewards
   - Icon: `Attack-Tokens-1.png`
3. **Defense Dollars** (`defense-dollar`) - Defense position rewards
   - Icon: `Defense-Dollars-1.png`
4. **Midfield Medals** (`midfield-metal`) - Midfield position rewards
   - Icon: `Midfield-Medals-1.png`
5. **Rebound Rewards** (`rebound-rewards`) - Wall ball achievements
   - Icon: `Rebound-Rewards-1.png` / `Rebound-Rewards.png`

#### **Workout Completion Points (36)**
Each workout type awards 100 points upon completion:
- Crease Crawler Workout
- Ankle Breaker Workout
- Fast Break Finisher Workout
- Rough Rider Workout
- Time and Room Terror Workout
- On the Run Rocketeer Workout
- Island Isolator Workout
- Goalies Nightmare Workout
- Foundation Ace Workout
- Dominant Dodger Workout
- Hip Hitter Workout
- Footwork Fortress Workout
- Slide Master Workout
- Close Quarters Crusher Workout
- Silky Smooth Workout
- Consistent Clear Workout
- Turnover Titan Workout
- The Great Wall Workout
- Determined DMid Workout
- Two-Way Tornado Workout
- Wing Warrior Workout
- Dodging Dynamo Workout
- Inside Man Workout
- Long Range Sharp Shooter Workout
- Modest Midfielder Workout
- Middie Machine Workout
- Stamina Star Workout
- Finishing Phenom Workout
- Long Pole Lizard Workout
- Bullet Snatcher Workout
- Wall Ball Hawk Workout
- The Wall Wizard Workout
- Ball Mover Workout (Solid Start)
- Dual Threat Workout (Solid Start)
- Sure Hands Workout (Solid Start)
- Great Deceiver Workout (Solid Start)
- Both Workout (Solid Start)

#### **Quiz Points (10)**
Each quiz awards 100 points for knowledge mastery:
- Settled Offense Quiz
- Settled Defense Quiz
- Transition Offense Quiz
- Transition Defense Quiz
- Man Up Quiz
- Man Down Quiz
- Ride Quiz
- Face Off Quiz
- Clear Quiz
- Fence Saver Workout (Special)

#### **Special Points (3)**
- **Lax IQ Points** (`lax-iq-point`) - Knowledge/quiz performance
  - Icon: `Lax-IQ-Points.png`
- **Flex Points** (`flex-point`) - Multi-purpose rewards
  - Icon: `SS-Flex-Points-1.png`
- **Time Validation Points** (`time-validation`) - Workout timing verification
  - Icon: `Time-Validation-Point-Kevin-HArt.png`

### Badge Categories (52 Total)
Based on badge export CSVs:

#### **Attack Badges** (8)
- Crease Crawler Badge
- Fast Break Finisher Badge
- Ankle Breaker Badge
- Rough Rider Badge
- Time and Room Terror Badge
- On the Run Rocketeer Badge
- Island Isolator Badge
- Goalies Nightmare Badge

#### **Defense Badges** (8)
- Hip Hitter Badge
- Footwork Fortress Badge
- Slide Master Badge
- Close Quarters Crusher Badge
- Silky Smooth Badge
- Consistent Clear Badge
- Turnover Titan Badge
- The Great Wall Badge

#### **Midfield Badges** (8)
- Determined DMid Badge
- Two-Way Tornado Badge
- Wing Warrior Badge
- Dodging Dynamo Badge
- Inside Man Badge
- Long Range Sharp Shooter Badge
- Modest Midfielder Badge
- Middie Machine Badge

#### **Wall Ball Badges** (12)
- Foundation Ace Badge
- Dominant Dodger Badge
- Stamina Star Badge
- Finishing Phenom Badge
- Long Pole Lizard Badge
- Bullet Snatcher Badge
- Wall Ball Hawk Badge
- The Wall Wizard Badge
- Fence Saver Badge
- Plus specialized wall ball achievements

#### **Solid Start Badges** (5)
- Ball Mover Badge
- Dual Threat Badge
- Sure Hands Badge
- Great Deceiver Badge
- Both Badge

#### **Lacrosse IQ Badges** (11)
Knowledge-based achievements for quiz performance and strategic understanding

### Rank Types (2)
Based on `Rank-Types-Export-2025-July-31-1918.csv`:
1. **Lacrosse Player Rank** (`lacrosse-player-type`)
2. **Lax IQ Points Rank** (`lax-iq-ranking`)

---

## 🗄️ Supabase Table Structure

### Existing Tables (Ready for Data)
```sql
-- Point System
user_points_wallets (user_id, currency, balance)
user_points_ledger (user_id, currency, amount, description, transaction_type)
powlax_points_currencies (currency, display_name, symbol, icon_url, color)
points_ledger (legacy compatibility)

-- Badge System
user_badges (user_id, badge_key, badge_name, earned_at, source)
badges (badge_key, name, description, category, icon_url, requirements)

-- Rank System  
user_ranks (user_id, rank_key, rank_name, achieved_at, source)
ranks (rank_key, name, description, icon_url, requirements)
```

### Required Schema Enhancements
```sql
-- Add icon URLs to point currencies
ALTER TABLE powlax_points_currencies 
ADD COLUMN IF NOT EXISTS symbol VARCHAR(10),
ADD COLUMN IF NOT EXISTS type VARCHAR(50),
ADD COLUMN IF NOT EXISTS color VARCHAR(7),
ADD COLUMN IF NOT EXISTS wordpress_slug VARCHAR(100),
ADD COLUMN IF NOT EXISTS max_per_period INTEGER,
ADD COLUMN IF NOT EXISTS period_type VARCHAR(20);

-- Add metadata to badges
ALTER TABLE badges
ADD COLUMN IF NOT EXISTS wordpress_id INTEGER,
ADD COLUMN IF NOT EXISTS category VARCHAR(50),
ADD COLUMN IF NOT EXISTS points_required INTEGER,
ADD COLUMN IF NOT EXISTS point_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS workout_count INTEGER,
ADD COLUMN IF NOT EXISTS order_index INTEGER;

-- Add WordPress sync tracking
CREATE TABLE IF NOT EXISTS gamipress_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type VARCHAR(50) NOT NULL,
  wordpress_user_id INTEGER,
  supabase_user_id UUID,
  data_type VARCHAR(50),
  data_key VARCHAR(100),
  old_value JSONB,
  new_value JSONB,
  synced_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔄 Migration Strategy

### Phase 1: Point Type Setup (Day 1)
1. **Update `powlax_points_currencies` table** with all 59 point types
2. **Map WordPress slugs** to Supabase currency keys
3. **Upload icon URLs** to Supabase Storage
4. **Configure point limits** (monthly/lifetime)

### Phase 2: Badge Definitions (Day 1-2)
1. **Insert badge definitions** into `badges` table
2. **Categorize badges** (Attack, Defense, Midfield, Wall Ball, etc.)
3. **Set requirements** (points needed, workout counts)
4. **Upload badge icons** to Supabase Storage

### Phase 3: User Data Migration (Day 2-3)
1. **Extract current point balances** from WordPress
2. **Map WordPress user IDs** to Supabase user IDs
3. **Import point wallets** with current balances
4. **Import earned badges** with timestamps
5. **Import rank achievements**

### Phase 4: Sync System Setup (Day 3-4)
1. **Create WordPress REST API endpoints** for data export
2. **Build Supabase import functions**
3. **Set up hourly cron job** for incremental sync
4. **Implement conflict resolution** (WordPress as source of truth)

---

## 📝 Data Mapping

### Point Type Mapping
```javascript
const pointTypeMap = {
  // Core Currencies
  'lax-credit': 'academy_points',
  'attack-token': 'attack_tokens',
  'defense-dollar': 'defense_dollars',
  'midfield-metal': 'midfield_medals',
  'rebound-rewards': 'rebound_rewards',
  
  // Workout Points (maintain original slugs)
  'crease-crawler-coin': 'crease_crawler_workout',
  'fast-break-finisher': 'fast_break_finisher_workout',
  'ankle-breaker-coin': 'ankle_breaker_workout',
  // ... (all 36 workout types)
  
  // Quiz Points
  'settled-offense': 'settled_offense_quiz',
  'settled-defense': 'settled_defense_quiz',
  // ... (all 10 quiz types)
  
  // Special Points
  'lax-iq-point': 'lax_iq_points',
  'flex-point': 'flex_points',
  'time-validation': 'time_validation_points'
}
```

### Badge Requirement Mapping
```javascript
const badgeRequirements = {
  'crease-crawler': {
    points_required: 5,
    point_type: 'crease_crawler_workout',
    category: 'attack',
    description: 'Complete 5 Crease Crawler Workouts'
  },
  'fast-break-finisher': {
    points_required: 5,
    point_type: 'fast_break_finisher_workout',
    category: 'attack',
    description: 'Complete 5 Fast Break Finisher Workouts'
  }
  // ... (all 52 badges)
}
```

---

## 🔌 Sync Implementation

### WordPress Export Endpoint
```php
// wp-content/plugins/powlax-gamipress-sync/export.php
add_action('rest_api_init', function() {
  register_rest_route('powlax/v1', '/gamipress-export', [
    'methods' => 'GET',
    'callback' => 'export_gamipress_data',
    'permission_callback' => 'verify_api_key'
  ]);
});

function export_gamipress_data() {
  return [
    'points' => get_user_points_all(),
    'badges' => get_user_badges_all(),
    'ranks' => get_user_ranks_all(),
    'last_updated' => current_time('mysql')
  ];
}
```

### Supabase Import Function
```typescript
// scripts/sync-gamipress.ts
async function syncGamiPressData() {
  // 1. Fetch from WordPress
  const wpData = await fetch('https://powlax.com/wp-json/powlax/v1/gamipress-export')
  
  // 2. Process each user's data
  for (const userData of wpData.points) {
    const supabaseUserId = await mapWordPressToSupabase(userData.wp_user_id)
    
    // 3. Update point wallets
    for (const [pointType, balance] of Object.entries(userData.balances)) {
      await upsertPointWallet(supabaseUserId, pointType, balance)
    }
    
    // 4. Log sync
    await logSync('points', userData.wp_user_id, supabaseUserId)
  }
  
  // Similar for badges and ranks...
}
```

### Conflict Resolution Rules
1. **Points**: Always use WordPress total as source of truth
2. **Badges**: Union of both systems (never remove)
3. **Ranks**: Highest achieved rank wins
4. **New Awards**: Can originate from either system

---

## 🎯 Image Asset Migration

### Icon URLs from CSVs
All point type and badge icons need to be:
1. Downloaded from WordPress: `https://powlax.com/wp-content/uploads/2024/10/[filename]`
2. Uploaded to Supabase Storage: `storage/badges/` and `storage/points/`
3. URLs updated in database tables

### Icon Inventory
```javascript
const iconMapping = {
  // Point Type Icons
  'academy_points': ['Lax-Credits.png', 'Lax-Credit.png'],
  'attack_tokens': ['Attack-Tokens-1.png'],
  'defense_dollars': ['Defense-Dollars-1.png'],
  'midfield_medals': ['Midfield-Medals-1.png'],
  'rebound_rewards': ['Rebound-Rewards-1.png'],
  
  // Badge Icons (A = Attack, D = Defense, M = Midfield)
  'crease-crawler-badge': 'A1-Crease-Crawler.png',
  'hip-hitter-badge': 'D1-Hip-Hitter.png',
  'ground-ball-guru-badge': 'Mid1-Ground-Ball-Guru.png',
  // ... (all badge icons)
}
```

---

## 📈 User Point Balance Tracking

### Current WordPress Users to Migrate
Priority users from BuddyBoss groups:
1. **Your Club OS** members (12 users)
2. **Your Varsity Team HQ** members (6 users)

For each user, we need to:
1. Query their GamiPress point balances
2. Query their earned badges
3. Query their achieved ranks
4. Map to Supabase user ID via `wordpress_id`
5. Insert/update gamification data

---

## 🚀 Implementation Timeline

### Day 1: Infrastructure
- [ ] Update Supabase schema with required columns
- [ ] Upload all icon assets to Supabase Storage
- [ ] Populate `powlax_points_currencies` table
- [ ] Create badge definitions in `badges` table

### Day 2: Migration Scripts
- [ ] Write point balance extraction script
- [ ] Write badge/rank extraction script
- [ ] Test with single user migration
- [ ] Run full migration for 18 demo users

### Day 3: Sync System
- [ ] Create WordPress REST API plugin
- [ ] Build Supabase sync functions
- [ ] Test bi-directional sync
- [ ] Set up monitoring/logging

### Day 4: Testing & Validation
- [ ] Verify all point balances match
- [ ] Confirm badge awards transferred
- [ ] Test new point awards flow
- [ ] Document any discrepancies

---

## ⚠️ Critical Considerations

### Data Integrity
- **Never delete** existing gamification data
- **Always log** sync operations for audit trail
- **Validate** WordPress IDs before migration
- **Backup** before running migrations

### Performance
- Sync in batches of 100 users
- Use database transactions for consistency
- Index foreign keys for faster lookups
- Cache frequently accessed data

### User Experience
- Display sync status in admin panel
- Show last sync timestamp to users
- Handle offline/sync delays gracefully
- Preserve all historical achievements

---

## 📋 Validation Checklist

### Pre-Migration
- [ ] All 59 point types defined in Supabase
- [ ] All 52 badges configured with requirements
- [ ] Icon assets uploaded and accessible
- [ ] User ID mapping verified

### Post-Migration  
- [ ] Point balances match WordPress
- [ ] Badge counts are accurate
- [ ] Rank achievements preserved
- [ ] Sync log shows successful operations

### Ongoing Sync
- [ ] Hourly sync runs without errors
- [ ] New points reflected within 1 hour
- [ ] Badge awards sync properly
- [ ] No duplicate transactions

---

## 🔗 Related Documentation

- `/docs/GAMIFICATION_IMPLEMENTATION_OVERVIEW.md` - New system overview
- `/docs/GAMIFICATION_EXPLAINER.md` - User-facing documentation
- `/scripts/imports/gamipress-import.ts` - Existing import script
- WordPress CSVs in `/docs/Wordpress CSV's/Gamipress Gamification Exports/`

---

## 📞 Next Steps

1. **Review this plan** with stakeholders
2. **Approve schema changes** for production
3. **Schedule migration window** (low-traffic period)
4. **Execute Phase 1** infrastructure setup
5. **Begin incremental user migration**

---

**Status**: READY FOR IMPLEMENTATION  
**Estimated Time**: 4 days  
**Risk Level**: LOW (data is additive, not destructive)  
**Rollback Plan**: Keep WordPress as source of truth until fully validated