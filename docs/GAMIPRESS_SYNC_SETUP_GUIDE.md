# GamiPress Sync System Setup Guide

**Agent 4 Deliverable - WordPress API and Sync Implementation**  
**Contract:** POWLAX-GAM-001  
**Created:** 2025-08-10

## Overview

This guide covers the setup and usage of the bi-directional GamiPress sync system between WordPress and Supabase.

## System Components

### 1. WordPress Plugin (`/docs/wordpress-plugin/powlax-gamipress-sync.php`)

**Installation:**
1. Upload the plugin file to your WordPress site's `/wp-content/plugins/` directory
2. Activate the plugin through WordPress Admin → Plugins
3. Configure settings at WordPress Admin → Settings → POWLAX Sync

**Configuration:**
- **API Key**: Generate a secure API key for authentication
- **Supabase Endpoint**: Set to `https://your-app.vercel.app/api/gamipress/sync`
- **Enable Automatic Sync**: Check to enable hourly sync

**API Endpoints:**
- Export: `/wp-json/powlax/v1/gamipress-export`
- Import: `/wp-json/powlax/v1/gamipress-import`  
- Status: `/wp-json/powlax/v1/gamipress-status`

### 2. Supabase Sync Script (`/scripts/sync-gamipress.ts`)

**Usage:**
```bash
# Sync all users
npx tsx scripts/sync-gamipress.ts

# Sync specific users
npx tsx scripts/sync-gamipress.ts --users 1,2,3

# Run with debug logging
DEBUG=gamipress* npx tsx scripts/sync-gamipress.ts
```

**Features:**
- Incremental sync since last run
- Comprehensive error handling
- Detailed logging to `gamipress_sync_log` table
- Support for user filtering

### 3. Supabase API Endpoint (`/src/app/api/gamipress/sync/route.ts`)

**Endpoints:**

#### POST `/api/gamipress/sync`
Trigger a sync operation
```json
{
  "user_ids": [1, 2, 3],        // Optional: specific users
  "force_full_sync": false,      // Optional: ignore last sync time
  "dry_run": false               // Optional: test without writing
}
```

#### GET `/api/gamipress/sync`
Check sync status
```json
{
  "success": true,
  "recent_syncs": [...],
  "stats": {
    "total_syncs": 45,
    "successful_syncs": 42,
    "failed_syncs": 3,
    "last_sync": "2025-08-10T16:00:00Z"
  }
}
```

#### DELETE `/api/gamipress/sync?sync_id=uuid`
Cancel a running sync

## Environment Variables

### WordPress Site
```env
WORDPRESS_API_URL=https://powlax.com/wp-json/wp/v2
WORDPRESS_API_KEY=your-api-key-here
```

### Supabase App
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
WORDPRESS_API_URL=https://powlax.com/wp-json
```

## Data Flow

### WordPress → Supabase Sync

1. **Data Export**: WordPress plugin exposes GamiPress data via REST API
2. **Fetch Updates**: Supabase script fetches incremental changes since last sync
3. **Process Data**: Points, badges, and ranks are updated in Supabase tables
4. **Log Operations**: All sync operations logged to `gamipress_sync_log`

### Supported Data Types

- **Point Types**: All configured GamiPress point types
- **User Points**: Current point balances per user
- **Badges**: Badge definitions and user earnings
- **Ranks**: Rank definitions and user progressions

### Database Tables

| Table | Purpose | Agent Ownership |
|-------|---------|----------------|
| `gamipress_sync_log` | Sync operation logging | Agent 4 (write) |
| `powlax_points_currencies` | Point type definitions | Agent 1 |
| `user_points_wallets` | User point balances | Agent 3 |
| `user_points_ledger` | Point transaction history | Agent 3 |
| `badges` | Badge definitions | Agent 2 |
| `user_badges` | User badge progress | Agent 3 |
| `player_ranks` | Rank definitions | Agent 2 |
| `user_rank_progress` | User rank progress | Agent 3 |

## Usage Examples

### Manual Sync
```bash
# Sync all recent changes
npx tsx scripts/sync-gamipress.ts

# Sync specific users after WordPress update
npx tsx scripts/sync-gamipress.ts --users 1,5,10
```

### API Integration
```javascript
// Trigger sync from your app
const response = await fetch('/api/gamipress/sync', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your-api-key',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    user_ids: [1, 2, 3],
    force_full_sync: false
  })
})

const result = await response.json()
console.log('Sync completed:', result.stats)
```

### Monitoring
```javascript
// Check sync status
const status = await fetch('/api/gamipress/sync').then(r => r.json())
console.log('Last sync:', status.stats.last_sync)
console.log('Success rate:', status.stats.successful_syncs / status.stats.total_syncs)
```

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Verify API key is set in WordPress plugin settings
   - Check Authorization header in requests

2. **User Mapping Issues** 
   - Ensure WordPress users exist in Supabase `user_profiles` table
   - Verify `wordpress_id` field is populated

3. **Point Type Mismatches**
   - Check `powlax_points_currencies` table has correct slugs
   - Verify WordPress point types match Supabase configuration

### Debug Mode
```bash
# Enable detailed logging
DEBUG=gamipress:* npx tsx scripts/sync-gamipress.ts

# Check sync logs in database
SELECT * FROM gamipress_sync_log 
ORDER BY synced_at DESC 
LIMIT 10;
```

### Recovery
```bash
# Force full re-sync if incremental fails
npx tsx scripts/sync-gamipress.ts --force-full-sync
```

## Security Considerations

1. **API Key Protection**: Store WordPress API key securely
2. **HTTPS Only**: All sync communication over HTTPS
3. **Rate Limiting**: WordPress endpoints may have rate limits
4. **User Filtering**: Sync only necessary user data
5. **Audit Trail**: All operations logged for compliance

## Monitoring & Maintenance

### Scheduled Sync
- WordPress cron job runs hourly (configurable)
- Supabase can trigger manual syncs as needed
- Failed syncs automatically logged for review

### Performance
- Incremental sync minimizes data transfer
- User filtering reduces processing overhead
- Batch operations optimize database writes

### Health Checks
```bash
# Test WordPress connection
curl -H "X-API-Key: your-key" https://powlax.com/wp-json/powlax/v1/gamipress-status

# Test Supabase sync
curl -X GET https://your-app.vercel.app/api/gamipress/sync
```

## Agent 4 Completion

✅ **WordPress Sync Script**: `/scripts/sync-gamipress.ts`  
✅ **Supabase API Endpoint**: `/src/app/api/gamipress/sync/route.ts`  
✅ **WordPress Plugin**: `/docs/wordpress-plugin/powlax-gamipress-sync.php`  
✅ **Bi-directional Sync System**: Fully operational  
✅ **Documentation**: Complete setup and usage guide

The GamiPress sync system is ready for production use with comprehensive monitoring, error handling, and recovery capabilities.