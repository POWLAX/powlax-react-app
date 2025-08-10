# GamiPress to Supabase Migration Contract

**Contract ID**: POWLAX-GAM-001  
**Date**: January 10, 2025  
**Scope**: Complete migration of WordPress GamiPress gamification data to Supabase  
**Execution Strategy**: PARALLEL with Ultra Think
**Status**: READY FOR EXECUTION

---

## 🧠 MANDATORY ULTRA THINK PHASE (MINIMUM 5 MINUTES)

**CRITICAL: Before ANY implementation, conduct deep analysis of:**

1. **File Collision Risks**
   - Multiple agents editing migration files
   - Database schema conflicts
   - CSV file access patterns
   - Icon upload conflicts

2. **Data Dependencies**
   - Point types must exist before badges
   - Users must exist before point wallets
   - Badge definitions before user badges
   - Rank types before user ranks

3. **Common Migration Errors**
   - Duplicate key violations
   - Missing WordPress user mappings
   - Icon URL 404 errors
   - CSV parsing failures
   - Transaction rollback scenarios

4. **System State Verification**
   - Current Supabase table contents
   - WordPress user migration status
   - Existing gamification setup
   - File system permissions

5. **Agent Boundary Definition**
   - No overlapping file edits
   - Clear database table ownership
   - Separate icon upload directories
   - Independent error logging

---

## 📋 Executive Summary

Migrate 59 point types, 52 badges, 2 rank types, and all associated user progress from WordPress GamiPress to Supabase. The system must preserve all user achievements, establish bi-directional sync, and maintain icon assets.

---

## 🎯 Success Criteria

### Must Complete
- [ ] All 59 point types with icons in `powlax_points_currencies`
- [ ] All 52 badge definitions in `badges` table
- [ ] Icon assets uploaded to Supabase Storage
- [ ] User point balances migrated for demo users
- [ ] User badges migrated with timestamps
- [ ] Sync system operational
- [ ] Zero data loss from WordPress

### Quality Gates
- [ ] All icons accessible (no 404s)
- [ ] Point mappings verified
- [ ] Badge requirements accurate
- [ ] User IDs correctly mapped
- [ ] Sync logs show success

---

## 👥 Parallel Agent Distribution

### Agent 1: Infrastructure & Schema
**Type**: general-purpose  
**Scope**: Database schema updates and point type setup  
**Files**:
```
- /supabase/migrations/063_gamipress_migration.sql (CREATE)
- /scripts/setup-point-types.ts (CREATE)
- /scripts/upload-point-icons.ts (CREATE)
```
**Tables**: `powlax_points_currencies`, `gamipress_sync_log`  
**No Touch**: User tables, badge tables

### Agent 2: Badge System
**Type**: general-purpose  
**Scope**: Badge definitions and requirements  
**Files**:
```
- /scripts/setup-badges.ts (CREATE)
- /scripts/upload-badge-icons.ts (CREATE)
- /docs/badge-requirements-map.json (CREATE)
```
**Tables**: `badges` only  
**No Touch**: Point tables, user tables

### Agent 3: User Data Migration
**Type**: general-purpose  
**Scope**: Migrate user points, badges, and ranks  
**Files**:
```
- /scripts/migrate-user-points.ts (CREATE)
- /scripts/migrate-user-badges.ts (CREATE)
- /scripts/migrate-user-ranks.ts (CREATE)
```
**Tables**: `user_points_wallets`, `user_points_ledger`, `user_badges`, `user_ranks`  
**No Touch**: Definition tables, schema

### Agent 4: Sync System
**Type**: general-purpose  
**Scope**: WordPress API and sync implementation  
**Files**:
```
- /scripts/sync-gamipress.ts (CREATE)
- /src/app/api/gamipress/sync/route.ts (CREATE)
- /docs/wordpress-plugin/powlax-gamipress-sync.php (CREATE)
```
**Tables**: `gamipress_sync_log` (write only)  
**No Touch**: Migration scripts, existing data

### Agent 5: Testing & Validation
**Type**: general-purpose  
**Scope**: Verify migration and create reports  
**Files**:
```
- /scripts/validate-migration.ts (CREATE)
- /tests/gamipress-migration.test.ts (CREATE)
- /docs/MIGRATION_REPORT.md (CREATE)
```
**Tables**: Read-only access to all  
**No Touch**: Any data modifications

---

## 📊 Data Sources

### CSV Files Location
```
/docs/Wordpress CSV's/Gamipress Gamification Exports/
├── Points-Types-Export-2025-July-31-1904.csv (59 point types)
├── Attack-Badges-Export-2025-July-31-1836.csv
├── Defense-Badges-Export-2025-July-31-1855.csv
├── Midfield-Badges-Export-2025-July-31-1903.csv
├── Wall-Ball-Badges-Export-2025-July-31-1925.csv
├── Solid-Start-Badges-Export-2025-July-31-1920.csv
├── Lacrosse-IQ-Badges-Export-2025-July-31-1858.csv
├── Lacrosse-Player-Ranks-Export-2025-July-31-1859.csv
├── Rank-Types-Export-2025-July-31-1918.csv
├── Rank-Requirements-Export-2025-July-31-1917.csv
├── Lax-IQ-Points-Export-2025-July-31-1900.csv
└── Completed-Workouts-Export-2025-July-31-1849.csv
```

### Icon URLs Pattern
```
https://powlax.com/wp-content/uploads/2024/10/[filename]
https://powlax.com/wp-content/uploads/2025/01/[filename]
https://powlax.com/wp-content/uploads/2025/02/[filename]
https://powlax.com/wp-content/uploads/2025/03/[filename]
```

---

## 🗂️ Implementation Details

### Phase 1: Infrastructure (Agent 1)

#### Schema Updates
```sql
-- /supabase/migrations/063_gamipress_migration.sql
ALTER TABLE powlax_points_currencies 
ADD COLUMN IF NOT EXISTS symbol VARCHAR(10),
ADD COLUMN IF NOT EXISTS type VARCHAR(50),
ADD COLUMN IF NOT EXISTS color VARCHAR(7),
ADD COLUMN IF NOT EXISTS wordpress_slug VARCHAR(100),
ADD COLUMN IF NOT EXISTS icon_url TEXT,
ADD COLUMN IF NOT EXISTS max_per_period INTEGER,
ADD COLUMN IF NOT EXISTS period_type VARCHAR(20);

ALTER TABLE badges
ADD COLUMN IF NOT EXISTS wordpress_id INTEGER,
ADD COLUMN IF NOT EXISTS category VARCHAR(50),
ADD COLUMN IF NOT EXISTS points_required INTEGER,
ADD COLUMN IF NOT EXISTS point_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS workout_count INTEGER,
ADD COLUMN IF NOT EXISTS icon_url TEXT,
ADD COLUMN IF NOT EXISTS order_index INTEGER;

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

#### Point Type Mapping
All 59 point types from CSV with:
- WordPress slug → Supabase key mapping
- Icon URL extraction and upload
- Display names and symbols
- Period limits (month/lifetime)

### Phase 2: Badge System (Agent 2)

#### Badge Categories
- **Attack** (8 badges) - Offensive skills
- **Defense** (8 badges) - Defensive prowess
- **Midfield** (8 badges) - Two-way play
- **Wall Ball** (12 badges) - Wall ball mastery
- **Solid Start** (5 badges) - Foundation skills
- **Lacrosse IQ** (11 badges) - Knowledge/strategy

#### Requirements Mapping
Each badge requires:
- 5 completed workouts of specific type
- OR 250+ points in category
- OR quiz completion thresholds

### Phase 3: User Migration (Agent 3)

#### Priority Users
WordPress users from migrated groups:
- Your Club OS (12 members)
- Your Varsity Team HQ (6 members)

#### Data to Migrate
For each user with `wordpress_id`:
1. Point balances across all 59 types
2. Earned badges with timestamps
3. Achieved ranks
4. Completion history

### Phase 4: Sync System (Agent 4)

#### WordPress Endpoint
```php
// /docs/wordpress-plugin/powlax-gamipress-sync.php
register_rest_route('powlax/v1', '/gamipress-export', [
  'methods' => 'GET',
  'callback' => 'export_gamipress_data',
  'args' => [
    'since' => ['type' => 'string'],
    'user_ids' => ['type' => 'array']
  ]
]);
```

#### Supabase Import
```typescript
// /scripts/sync-gamipress.ts
async function syncGamiPressData() {
  const lastSync = await getLastSyncTime()
  const wpData = await fetchWordPressData(lastSync)
  await processPointUpdates(wpData.points)
  await processBadgeUpdates(wpData.badges)
  await processRankUpdates(wpData.ranks)
  await logSyncCompletion()
}
```

### Phase 5: Validation (Agent 5)

#### Test Coverage
- Point type count = 59
- Badge count = 52
- All icons return 200 status
- User mappings verified
- Sample transactions validated

---

## ⚠️ Critical Dependencies

### Pre-Migration Requirements
- [ ] WordPress users already migrated (10 users minimum)
- [ ] Supabase service role key available
- [ ] CSV files accessible in project
- [ ] Icon download permissions

### Inter-Agent Dependencies
- Agent 1 MUST complete schema before others start
- Agent 2 can run parallel with Agent 1
- Agent 3 needs Agent 1 complete
- Agent 4 can start anytime
- Agent 5 runs after all others

---

## 📈 Progress Tracking

### Hour 1
- [ ] Ultra Think completed
- [ ] Agent 1: Schema migration applied
- [ ] Agent 2: Badge definitions started
- [ ] Agent 4: Sync scaffold created

### Hour 2
- [ ] Agent 1: Point types populated
- [ ] Agent 2: All badges defined
- [ ] Agent 3: User data extraction started
- [ ] Icons uploading

### Hour 3
- [ ] Agent 3: User migrations complete
- [ ] Agent 4: Sync system tested
- [ ] Agent 5: Validation started

### Hour 4
- [ ] All agents complete
- [ ] Validation passed
- [ ] Documentation updated
- [ ] Ready for production

---

## 🚨 Error Handling

### Rollback Procedures
```sql
-- Emergency rollback
DELETE FROM user_points_wallets WHERE source = 'gamipress_migration';
DELETE FROM user_badges WHERE source = 'gamipress_migration';
DELETE FROM gamipress_sync_log WHERE sync_type = 'initial_migration';
```

### Known Issues
- CSV encoding: UTF-8 BOM may need stripping
- Icon URLs: Some use different date paths
- User mapping: Some WordPress IDs may not exist
- Point types: Slugs have inconsistent naming

---

## ✅ Completion Checklist

### Agent 1 Deliverables
- [ ] Schema migration file created and applied
- [ ] 59 point types in database
- [ ] Point icons uploaded
- [ ] Sync log table ready

### Agent 2 Deliverables
- [ ] 52 badges defined
- [ ] Badge icons uploaded
- [ ] Requirements mapped
- [ ] Categories assigned

### Agent 3 Deliverables
- [ ] User points migrated
- [ ] User badges migrated
- [ ] User ranks migrated
- [ ] Transaction logs created

### Agent 4 Deliverables
- [ ] WordPress plugin created
- [ ] Sync endpoint working
- [ ] Cron job configured
- [ ] Monitoring in place

### Agent 5 Deliverables
- [ ] All validations pass
- [ ] Migration report complete
- [ ] Test suite passes
- [ ] Documentation updated

---

## 📝 Final Notes

### Communication Protocol
- Each agent creates a STATUS.md in their working directory
- Log all errors to `/logs/gamipress-migration-[agent-number].log`
- Update contract with completion timestamps

### Quality Standards
- No console.log in production code
- All async operations properly awaited
- Database transactions for data integrity
- Comprehensive error messages

### Post-Migration
- Monitor sync logs for 24 hours
- Verify user engagement metrics
- Document any manual fixes needed
- Plan Phase 2 enhancements

---

## 🎯 Contract Acceptance

**By executing this contract, you acknowledge:**
1. Ultra Think phase is mandatory (5+ minutes)
2. Agent boundaries must be respected
3. No file conflicts permitted
4. WordPress data is source of truth
5. Zero data loss is acceptable

**Execution Command:**
```
Execute GamiPress Migration Contract POWLAX-GAM-001 with parallel agents
```

---

**Contract Status**: READY FOR EXECUTION  
**Estimated Time**: 4 hours with parallel execution  
**Risk Level**: LOW (additive only, no deletions)  
**Rollback Available**: YES

---

END OF CONTRACT