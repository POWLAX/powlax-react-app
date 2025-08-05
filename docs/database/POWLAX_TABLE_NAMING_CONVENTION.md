# POWLAX Database Table Naming Convention

## Standard Format: `[entity]_powlax`

All tables in the POWLAX database should follow the naming convention of:
- **Format**: `[entity_name]_powlax`
- **Pattern**: Lowercase entity name followed by `_powlax` suffix

### Examples:
- ✅ `strategies_powlax` - Strategies and concepts
- ✅ `drills_powlax` - Drill library
- ✅ `skills_academy_powlax` - Skills academy content
- ✅ `wall_ball_powlax` - Wall ball exercises
- ✅ `lessons_powlax` - Video lessons
- ✅ `users_powlax` - User accounts
- ✅ `teams_powlax` - Team data
- ✅ `practice_plans_powlax` - Practice plans

### Why This Convention?
1. **Namespace Isolation**: Prevents conflicts with other applications sharing the database
2. **Easy Identification**: All POWLAX tables are immediately recognizable
3. **Migration Safety**: Clear ownership when moving between environments
4. **Query Organization**: Easier to filter and manage POWLAX-specific tables

### Migration Mapping:
When importing from WordPress or other sources:
- `wp_strategies` → `strategies_powlax`
- `wp_drills` → `drills_powlax`
- `staging_wp_*` → `staging_[entity]_powlax`

### Related Tables:
Junction tables should follow the pattern:
- `[entity1]_[entity2]_map_powlax`
- Example: `drill_strategy_map_powlax`

### Indexes:
- Format: `idx_[table_name]_[column(s)]`
- Example: `idx_strategies_powlax_vimeo_id`