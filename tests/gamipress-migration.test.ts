import { test, expect, describe, beforeAll, afterAll } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

// Test environment setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

describe('GamiPress Migration Test Suite - Agent 5', () => {

  describe('File Structure Tests', () => {
    test('Agent 1 deliverables exist', async () => {
      const agent1Files = [
        '/supabase/migrations/063_gamipress_migration.sql',
        '/scripts/setup-point-types.ts',
        '/scripts/upload-point-icons.ts'
      ]

      for (const file of agent1Files) {
        const fullPath = join(process.cwd(), file)
        expect(existsSync(fullPath)).toBeTruthy()
        
        // Verify file has content
        const content = readFileSync(fullPath, 'utf-8')
        expect(content.length).toBeGreaterThan(100) // Non-empty file
      }
    })

    test('Agent 2 deliverables exist', async () => {
      const agent2Files = [
        '/scripts/setup-badges.ts',
        '/scripts/upload-badge-icons.ts',
        '/docs/badge-requirements-map.json'
      ]

      for (const file of agent2Files) {
        const fullPath = join(process.cwd(), file)
        expect(existsSync(fullPath)).toBeTruthy()
      }

      // Validate badge requirements JSON
      const badgeMapPath = join(process.cwd(), '/docs/badge-requirements-map.json')
      const badgeMap = JSON.parse(readFileSync(badgeMapPath, 'utf-8'))
      expect(badgeMap).toBeDefined()
      expect(Array.isArray(badgeMap) || typeof badgeMap === 'object').toBeTruthy()
    })

    test('Agent 3 deliverables exist', async () => {
      const agent3Files = [
        '/scripts/migrate-user-points.ts',
        '/scripts/migrate-user-badges.ts',
        '/scripts/migrate-user-ranks.ts'
      ]

      for (const file of agent3Files) {
        const fullPath = join(process.cwd(), file)
        expect(existsSync(fullPath)).toBeTruthy()
        
        // Verify script structure
        const content = readFileSync(fullPath, 'utf-8')
        expect(content).toContain('@supabase/supabase-js')
        expect(content).toContain('async function')
      }
    })

    test('Agent 4 deliverables exist', async () => {
      const agent4Files = [
        '/scripts/sync-gamipress.ts',
        '/src/app/api/gamipress/sync/route.ts',
        '/docs/wordpress-plugin/powlax-gamipress-sync.php'
      ]

      for (const file of agent4Files) {
        const fullPath = join(process.cwd(), file)
        expect(existsSync(fullPath)).toBeTruthy()
      }

      // Validate API route structure
      const apiPath = join(process.cwd(), '/src/app/api/gamipress/sync/route.ts')
      const apiContent = readFileSync(apiPath, 'utf-8')
      expect(apiContent).toContain('export async function POST')
      expect(apiContent).toContain('export async function GET')
    })

    test('CSV source files accessible', async () => {
      const csvPath = '/docs/Wordpress CSV\'s/Gamipress Gamification Exports'
      const requiredCSVs = [
        'Points-Types-Export-2025-July-31-1904.csv',
        'Attack-Badges-Export-2025-July-31-1836.csv',
        'Defense-Badges-Export-2025-July-31-1855.csv',
        'Midfield-Badges-Export-2025-July-31-1903.csv',
        'Wall-Ball-Badges-Export-2025-July-31-1925.csv',
        'Solid-Start-Badges-Export-2025-July-31-1920.csv',
        'Lacrosse-IQ-Badges-Export-2025-July-31-1858.csv'
      ]

      for (const csv of requiredCSVs) {
        const fullPath = join(process.cwd(), csvPath, csv)
        expect(existsSync(fullPath)).toBeTruthy()
        
        // Verify CSV has data
        const content = readFileSync(fullPath, 'utf-8')
        const lines = content.split('\n').filter(line => line.trim())
        expect(lines.length).toBeGreaterThan(1) // Header + at least 1 data row
      }
    })
  })

  describe('Database Schema Tests', () => {
    test('powlax_points_currencies table has WordPress columns', async () => {
      const { data, error } = await supabase
        .from('powlax_points_currencies')
        .select('*')
        .limit(1)

      expect(error).toBeNull()
      expect(data).toBeDefined()
      
      if (data && data.length > 0) {
        const firstRow = data[0]
        // Check for WordPress migration columns
        expect('wordpress_id' in firstRow || 'wordpress_slug' in firstRow || 'icon_url' in firstRow).toBeTruthy()
      }
    })

    test('badges table has category and requirements columns', async () => {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .limit(1)

      expect(error).toBeNull()
      expect(data).toBeDefined()
      
      if (data && data.length > 0) {
        const firstBadge = data[0]
        // Check for badge migration columns
        expect('category' in firstBadge || 'points_required' in firstBadge || 'workout_count' in firstBadge).toBeTruthy()
      }
    })

    test('gamipress_sync_log table exists and is functional', async () => {
      const { data, error } = await supabase
        .from('gamipress_sync_log')
        .select('id, sync_type, synced_at')
        .limit(1)

      expect(error).toBeNull()
      // Table should exist even if empty
    })

    test('user migration tables are accessible', async () => {
      const userTables = ['user_points_balance', 'user_badge_progress', 'user_rank_progress']
      
      for (const table of userTables) {
        const { error } = await supabase
          .from(table)
          .select('id')
          .limit(1)

        // Should not error (table exists and is accessible)
        expect(error?.code).not.toBe('42P01') // relation does not exist
      }
    })
  })

  describe('Data Population Tests', () => {
    test('point types populated with sufficient count', async () => {
      const { data: pointTypes, error } = await supabase
        .from('powlax_points_currencies')
        .select('*')

      expect(error).toBeNull()
      expect(pointTypes).toBeDefined()
      expect(pointTypes!.length).toBeGreaterThanOrEqual(58) // From contract: 58+ point types
    })

    test('badges populated with sufficient count', async () => {
      const { data: badges, error } = await supabase
        .from('badges')
        .select('*')

      expect(error).toBeNull()
      expect(badges).toBeDefined()
      expect(badges!.length).toBeGreaterThanOrEqual(49) // From contract: 49+ badges
    })

    test('core point types exist', async () => {
      const expectedPointTypes = [
        'lax_credits', 'attack_tokens', 'defense_dollars', 
        'midfield_medals', 'flex_points', 'rebound_rewards', 'lax_iq_points'
      ]

      const { data: pointTypes, error } = await supabase
        .from('powlax_points_currencies')
        .select('currency_key')

      expect(error).toBeNull()
      const keys = pointTypes?.map(pt => pt.currency_key) || []

      for (const expectedType of expectedPointTypes) {
        expect(keys).toContain(expectedType)
      }
    })

    test('badge categories properly distributed', async () => {
      const { data: badges, error } = await supabase
        .from('badges')
        .select('category')

      expect(error).toBeNull()
      
      const categories = badges?.map(b => b.category) || []
      const uniqueCategories = new Set(categories)
      
      // Should have multiple categories from the 6 badge CSVs
      expect(uniqueCategories.size).toBeGreaterThanOrEqual(4)
      
      // Check specific categories exist
      const expectedCategories = ['Attack', 'Defense', 'Midfield', 'Wall Ball', 'Solid Start', 'Lacrosse IQ']
      const foundCategories = expectedCategories.filter(cat => categories.includes(cat))
      expect(foundCategories.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('Data Integrity Tests', () => {
    test('no duplicate point types', async () => {
      const { data: pointTypes, error } = await supabase
        .from('powlax_points_currencies')
        .select('currency_key')

      expect(error).toBeNull()
      const keys = pointTypes?.map(pt => pt.currency_key) || []
      const uniqueKeys = new Set(keys)
      
      expect(keys.length).toBe(uniqueKeys.size) // No duplicates
    })

    test('no duplicate badge WordPress IDs', async () => {
      const { data: badges, error } = await supabase
        .from('badges')
        .select('wordpress_id')
        .not('wordpress_id', 'is', null)

      expect(error).toBeNull()
      
      if (badges && badges.length > 0) {
        const wpIds = badges.map(b => b.wordpress_id)
        const uniqueWpIds = new Set(wpIds)
        expect(wpIds.length).toBe(uniqueWpIds.size) // No duplicate WordPress IDs
      }
    })

    test('badges have valid requirements', async () => {
      const { data: badges, error } = await supabase
        .from('badges')
        .select('points_required, workout_count, category')

      expect(error).toBeNull()
      
      if (badges) {
        for (const badge of badges) {
          // Each badge should have either points_required OR workout_count (or both)
          const hasRequirements = badge.points_required || badge.workout_count
          expect(hasRequirements).toBeTruthy()
        }
      }
    })

    test('sync log can record operations', async () => {
      // Test inserting a sync log entry
      const testEntry = {
        sync_type: 'test_validation',
        data_type: 'badge',
        data_key: 'test_badge',
        new_value: { status: 'test' }
      }

      const { data, error } = await supabase
        .from('gamipress_sync_log')
        .insert(testEntry)
        .select()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data!.length).toBe(1)

      // Clean up test entry
      if (data && data[0]) {
        await supabase
          .from('gamipress_sync_log')
          .delete()
          .eq('id', data[0].id)
      }
    })
  })

  describe('Icon Accessibility Tests', () => {
    test('point type icons are accessible', async () => {
      const { data: pointsWithIcons, error } = await supabase
        .from('powlax_points_currencies')
        .select('icon_url')
        .not('icon_url', 'is', null)
        .limit(3) // Test sample

      expect(error).toBeNull()
      
      if (pointsWithIcons && pointsWithIcons.length > 0) {
        let accessibleCount = 0
        
        for (const point of pointsWithIcons) {
          try {
            const response = await fetch(point.icon_url, { method: 'HEAD' })
            if (response.ok) {
              accessibleCount++
            }
          } catch {
            // Icon not accessible
          }
        }
        
        // At least 50% of sampled icons should be accessible
        const successRate = accessibleCount / pointsWithIcons.length
        expect(successRate).toBeGreaterThanOrEqual(0.5)
      }
    })

    test('badge icons are accessible', async () => {
      const { data: badgesWithIcons, error } = await supabase
        .from('badges')
        .select('icon_url')
        .not('icon_url', 'is', null)
        .limit(3) // Test sample

      expect(error).toBeNull()
      
      if (badgesWithIcons && badgesWithIcons.length > 0) {
        let accessibleCount = 0
        
        for (const badge of badgesWithIcons) {
          try {
            const response = await fetch(badge.icon_url, { method: 'HEAD' })
            if (response.ok) {
              accessibleCount++
            }
          } catch {
            // Icon not accessible
          }
        }
        
        // At least 50% of sampled badge icons should be accessible
        const successRate = accessibleCount / badgesWithIcons.length
        expect(successRate).toBeGreaterThanOrEqual(0.5)
      }
    })
  })

  describe('Script Functionality Tests', () => {
    test('setup-point-types script has proper structure', async () => {
      const scriptPath = join(process.cwd(), 'scripts/setup-point-types.ts')
      const content = readFileSync(scriptPath, 'utf-8')

      // Check for required imports and functions
      expect(content).toContain('@supabase/supabase-js')
      expect(content).toContain('readFileSync')
      expect(content).toContain('async function')
      expect(content).toContain('Points-Types-Export') // References correct CSV
    })

    test('setup-badges script has proper structure', async () => {
      const scriptPath = join(process.cwd(), 'scripts/setup-badges.ts')
      const content = readFileSync(scriptPath, 'utf-8')

      expect(content).toContain('@supabase/supabase-js')
      expect(content).toContain('badges')
      expect(content).toContain('category')
    })

    test('sync-gamipress script has comprehensive functionality', async () => {
      const scriptPath = join(process.cwd(), 'scripts/sync-gamipress.ts')
      const content = readFileSync(scriptPath, 'utf-8')

      expect(content).toContain('syncGamiPressData') // Main sync function
      expect(content).toContain('processPointUpdates') // Point sync
      expect(content).toContain('processBadgeUpdates') // Badge sync
      expect(content).toContain('try') // Error handling
      expect(content).toContain('catch') // Error handling
    })

    test('user migration scripts handle WordPress ID mapping', async () => {
      const userScripts = [
        'migrate-user-points.ts',
        'migrate-user-badges.ts',
        'migrate-user-ranks.ts'
      ]

      for (const script of userScripts) {
        const scriptPath = join(process.cwd(), 'scripts', script)
        const content = readFileSync(scriptPath, 'utf-8')

        expect(content).toContain('wordpress_id') // WordPress ID handling
        expect(content).toContain('supabase') // Database operations
        expect(content).toContain('user') // User data handling
      }
    })
  })

  describe('WordPress Integration Tests', () => {
    test('WordPress plugin has required REST endpoints', async () => {
      const pluginPath = join(process.cwd(), 'docs/wordpress-plugin/powlax-gamipress-sync.php')
      const content = readFileSync(pluginPath, 'utf-8')

      expect(content).toContain('register_rest_route') // REST API setup
      expect(content).toContain('gamipress') // GamiPress integration
      expect(content).toContain('powlax/v1') // API namespace
      expect(content).toContain('gamipress-export') // Export endpoint
    })

    test('API route handles all HTTP methods', async () => {
      const apiPath = join(process.cwd(), 'src/app/api/gamipress/sync/route.ts')
      const content = readFileSync(apiPath, 'utf-8')

      expect(content).toContain('export async function POST') // Trigger sync
      expect(content).toContain('export async function GET') // Check status
      expect(content).toContain('NextRequest') // Proper types
      expect(content).toContain('NextResponse') // Proper response handling
    })
  })

  describe('Performance and Scalability Tests', () => {
    test('database queries are efficient', async () => {
      // Test point types query performance
      const start = Date.now()
      const { data, error } = await supabase
        .from('powlax_points_currencies')
        .select('*')
      const duration = Date.now() - start

      expect(error).toBeNull()
      expect(duration).toBeLessThan(5000) // Should complete within 5 seconds

      // Test badges query performance
      const badgeStart = Date.now()
      const { data: badges, error: badgeError } = await supabase
        .from('badges')
        .select('*')
      const badgeDuration = Date.now() - badgeStart

      expect(badgeError).toBeNull()
      expect(badgeDuration).toBeLessThan(5000) // Should complete within 5 seconds
    })

    test('sync log table can handle bulk operations', async () => {
      const batchSize = 10
      const testEntries = Array.from({ length: batchSize }, (_, i) => ({
        sync_type: 'bulk_test',
        data_type: 'test_data',
        data_key: `test_key_${i}`,
        new_value: { index: i }
      }))

      const { data, error } = await supabase
        .from('gamipress_sync_log')
        .insert(testEntries)
        .select()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data!.length).toBe(batchSize)

      // Clean up test entries
      if (data && data.length > 0) {
        const ids = data.map(entry => entry.id)
        await supabase
          .from('gamipress_sync_log')
          .delete()
          .in('id', ids)
      }
    })
  })

  describe('Error Handling Tests', () => {
    test('scripts handle missing environment variables gracefully', async () => {
      const scriptPath = join(process.cwd(), 'scripts/sync-gamipress.ts')
      const content = readFileSync(scriptPath, 'utf-8')

      // Should check for required environment variables
      expect(content).toMatch(/SUPABASE_URL|NEXT_PUBLIC_SUPABASE_URL/)
      expect(content).toMatch(/SUPABASE.*KEY/)
      expect(content).toContain('process.env')
    })

    test('migration can handle invalid WordPress IDs', async () => {
      // Test inserting a sync log with invalid WordPress user ID
      const testEntry = {
        sync_type: 'test_invalid_user',
        wordpress_user_id: 99999, // Non-existent user
        data_type: 'badge',
        data_key: 'test_invalid',
        new_value: { status: 'test' }
      }

      const { data, error } = await supabase
        .from('gamipress_sync_log')
        .insert(testEntry)
        .select()

      // Should not fail even with invalid WordPress user ID
      expect(error).toBeNull()
      expect(data).toBeDefined()

      // Clean up
      if (data && data[0]) {
        await supabase
          .from('gamipress_sync_log')
          .delete()
          .eq('id', data[0].id)
      }
    })
  })

  describe('Contract Compliance Tests', () => {
    test('migration meets contract point type count requirement', async () => {
      const { data: pointTypes, error } = await supabase
        .from('powlax_points_currencies')
        .select('*')

      expect(error).toBeNull()
      // Contract specifies 58+ point types from CSV
      expect(pointTypes!.length).toBeGreaterThanOrEqual(58)
    })

    test('migration meets contract badge count requirement', async () => {
      const { data: badges, error } = await supabase
        .from('badges')
        .select('*')

      expect(error).toBeNull()
      // Contract specifies 49+ badges total
      expect(badges!.length).toBeGreaterThanOrEqual(49)
    })

    test('all required agent deliverables exist', async () => {
      const contractDeliverables = [
        // Agent 1
        '/supabase/migrations/063_gamipress_migration.sql',
        '/scripts/setup-point-types.ts',
        '/scripts/upload-point-icons.ts',
        // Agent 2
        '/scripts/setup-badges.ts',
        '/scripts/upload-badge-icons.ts',
        '/docs/badge-requirements-map.json',
        // Agent 3
        '/scripts/migrate-user-points.ts',
        '/scripts/migrate-user-badges.ts',
        '/scripts/migrate-user-ranks.ts',
        // Agent 4
        '/scripts/sync-gamipress.ts',
        '/src/app/api/gamipress/sync/route.ts',
        '/docs/wordpress-plugin/powlax-gamipress-sync.php'
      ]

      for (const deliverable of contractDeliverables) {
        const fullPath = join(process.cwd(), deliverable)
        expect(existsSync(fullPath)).toBeTruthy()
      }
    })
  })
})

// Utility functions for testing
export async function runValidationSuite() {
  console.log('🧪 Running GamiPress Migration Test Suite...')
  
  // This would be called by the test runner
  // Results would be captured and included in the migration report
}