# POWLAX Database Table Naming Convention

## Standard Format: `powlax_[entity]`

All tables in the POWLAX database should follow the naming convention of:
- **Format**: `powlax_[entity_name]`
- **Pattern**: `powlax_` prefix followed by lowercase entity name

### Examples:
- ✅ `powlax_strategies` - Strategies and concepts
- ✅ `powlax_drills` - Drill library
- ✅ `skills_academy_drills` - Skills academy content
- ✅ `wall_ball_powlax` - Wall ball exercises (legacy naming)
- ✅ `lessons_powlax` - Video lessons (legacy naming)
- ✅ `user_drills` - User-created drills
- ✅ `user_strategies` - User-created strategies
- ✅ `practice_plans` - Practice plans

### Why This Convention?
1. **Namespace Isolation**: Prevents conflicts with other applications sharing the database
2. **Easy Identification**: All POWLAX tables are immediately recognizable
3. **Migration Safety**: Clear ownership when moving between environments
4. **Query Organization**: Easier to filter and manage POWLAX-specific tables

### Migration Mapping:
When importing from WordPress or other sources:
- `wp_strategies` → `powlax_strategies`
- `wp_drills` → `powlax_drills`
- `staging_wp_*` → `staging_[entity]_powlax` (staging tables keep legacy naming)

### Related Tables:
Junction tables should follow the pattern:
- `[entity1]_[entity2]_map_powlax`
- Example: `drill_strategy_map_powlax`

### Indexes:
- Format: `idx_[table_name]_[column(s)]`
- Example: `idx_powlax_strategies_vimeo_id`