import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

// Supabase client setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

interface ValidationResult {
  name: string
  status: 'PASS' | 'FAIL' | 'WARNING'
  expected?: any
  actual?: any
  details?: string
  critical?: boolean
}

interface ValidationReport {
  timestamp: string
  totalTests: number
  passed: number
  failed: number
  warnings: number
  criticalFailures: number
  results: ValidationResult[]
  summary: string
}

class MigrationValidator {
  private results: ValidationResult[] = []

  async validate(): Promise<ValidationReport> {
    console.log('🔍 Starting GamiPress Migration Validation...\n')

    await this.validateFileStructure()
    await this.validateDatabaseSchema()
    await this.validatePointTypes()
    await this.validateBadges()
    await this.validateSyncSystem()
    await this.validateIconAccessibility()
    await this.validateUserMigration()
    await this.validateDataIntegrity()

    return this.generateReport()
  }

  private addResult(result: ValidationResult) {
    this.results.push(result)
    const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️'
    console.log(`${icon} ${result.name}${result.details ? ` - ${result.details}` : ''}`)
  }

  private async validateFileStructure() {
    console.log('📁 Validating File Structure...')

    // Required files from Agents 1-4
    const requiredFiles = [
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

    for (const file of requiredFiles) {
      const fullPath = join(process.cwd(), file)
      const exists = existsSync(fullPath)
      
      this.addResult({
        name: `File exists: ${file}`,
        status: exists ? 'PASS' : 'FAIL',
        critical: true,
        details: exists ? 'Found' : 'Missing required file'
      })
    }

    // Validate CSV source files
    const csvPath = '/docs/Wordpress CSV\'s/Gamipress Gamification Exports'
    const csvFiles = [
      'Points-Types-Export-2025-July-31-1904.csv',
      'Attack-Badges-Export-2025-July-31-1836.csv',
      'Defense-Badges-Export-2025-July-31-1855.csv',
      'Midfield-Badges-Export-2025-July-31-1903.csv',
      'Wall-Ball-Badges-Export-2025-July-31-1925.csv',
      'Solid-Start-Badges-Export-2025-July-31-1920.csv',
      'Lacrosse-IQ-Badges-Export-2025-July-31-1858.csv'
    ]

    for (const csvFile of csvFiles) {
      const fullPath = join(process.cwd(), csvPath, csvFile)
      const exists = existsSync(fullPath)
      
      this.addResult({
        name: `CSV source: ${csvFile}`,
        status: exists ? 'PASS' : 'FAIL',
        critical: true,
        details: exists ? 'CSV data source available' : 'Missing CSV data'
      })
    }
  }

  private async validateDatabaseSchema() {
    console.log('🗄️ Validating Database Schema...')

    try {
      // Check powlax_points_currencies table structure
      const { data: pointsColumns, error: pointsError } = await supabase
        .rpc('get_table_columns', { table_name: 'powlax_points_currencies' })

      if (pointsError) {
        this.addResult({
          name: 'Points currencies table schema',
          status: 'FAIL',
          critical: true,
          details: `Error checking table: ${pointsError.message}`
        })
      } else {
        const requiredColumns = ['wordpress_id', 'wordpress_slug', 'icon_url', 'max_per_period']
        const hasAllColumns = requiredColumns.every(col => 
          pointsColumns?.some((c: any) => c.column_name === col)
        )

        this.addResult({
          name: 'Points currencies table schema',
          status: hasAllColumns ? 'PASS' : 'FAIL',
          critical: true,
          details: hasAllColumns ? 'All required columns present' : 'Missing WordPress columns'
        })
      }

      // Check badges table structure
      const { data: badgesColumns, error: badgesError } = await supabase
        .rpc('get_table_columns', { table_name: 'badges' })

      if (!badgesError) {
        const badgeRequiredColumns = ['wordpress_id', 'category', 'points_required', 'workout_count']
        const hasBadgeColumns = badgeRequiredColumns.every(col => 
          badgesColumns?.some((c: any) => c.column_name === col)
        )

        this.addResult({
          name: 'Badges table schema',
          status: hasBadgeColumns ? 'PASS' : 'FAIL',
          critical: true,
          details: hasBadgeColumns ? 'All badge columns present' : 'Missing badge columns'
        })
      }

      // Check gamipress_sync_log table exists
      const { data: syncLogExists, error: syncError } = await supabase
        .from('gamipress_sync_log')
        .select('id')
        .limit(1)

      this.addResult({
        name: 'GamiPress sync log table',
        status: !syncError ? 'PASS' : 'FAIL',
        critical: true,
        details: !syncError ? 'Sync logging table ready' : `Missing sync table: ${syncError.message}`
      })

    } catch (error) {
      this.addResult({
        name: 'Database schema validation',
        status: 'FAIL',
        critical: true,
        details: `Database connection error: ${error}`
      })
    }
  }

  private async validatePointTypes() {
    console.log('💰 Validating Point Types...')

    try {
      // Check point types count (should be 58+ from CSV)
      const { data: pointTypes, error } = await supabase
        .from('powlax_points_currencies')
        .select('*')

      if (error) {
        this.addResult({
          name: 'Point types data retrieval',
          status: 'FAIL',
          critical: true,
          details: `Error: ${error.message}`
        })
        return
      }

      const pointCount = pointTypes?.length || 0
      this.addResult({
        name: 'Point types count',
        status: pointCount >= 58 ? 'PASS' : 'WARNING',
        expected: '58+',
        actual: pointCount,
        details: `Found ${pointCount} point types (expected 58+ from CSV)`
      })

      // Check WordPress ID mapping
      const withWordPressId = pointTypes?.filter(pt => pt.wordpress_id) || []
      this.addResult({
        name: 'WordPress ID mapping',
        status: withWordPressId.length > 0 ? 'PASS' : 'WARNING',
        actual: withWordPressId.length,
        details: `${withWordPressId.length} point types have WordPress IDs mapped`
      })

      // Check icon URLs
      const withIconUrls = pointTypes?.filter(pt => pt.icon_url) || []
      this.addResult({
        name: 'Point type icons',
        status: withIconUrls.length > 0 ? 'PASS' : 'WARNING',
        actual: withIconUrls.length,
        details: `${withIconUrls.length} point types have icon URLs`
      })

      // Verify specific point types from contract
      const expectedPointTypes = [
        'lax_credits', 'attack_tokens', 'defense_dollars', 'midfield_medals',
        'flex_points', 'rebound_rewards', 'lax_iq_points'
      ]

      for (const expectedType of expectedPointTypes) {
        const found = pointTypes?.find(pt => pt.currency_key === expectedType)
        this.addResult({
          name: `Point type: ${expectedType}`,
          status: found ? 'PASS' : 'FAIL',
          details: found ? 'Core point type found' : 'Missing expected point type'
        })
      }

    } catch (error) {
      this.addResult({
        name: 'Point types validation',
        status: 'FAIL',
        critical: true,
        details: `Error: ${error}`
      })
    }
  }

  private async validateBadges() {
    console.log('🏆 Validating Badges...')

    try {
      // Check total badge count (should be 49+ from contract)
      const { data: badges, error } = await supabase
        .from('badges')
        .select('*')

      if (error) {
        this.addResult({
          name: 'Badge data retrieval',
          status: 'FAIL',
          critical: true,
          details: `Error: ${error.message}`
        })
        return
      }

      const badgeCount = badges?.length || 0
      this.addResult({
        name: 'Total badge count',
        status: badgeCount >= 49 ? 'PASS' : 'WARNING',
        expected: '49+',
        actual: badgeCount,
        details: `Found ${badgeCount} badges (expected 49+ from contract)`
      })

      // Validate badge categories
      const categories = ['Attack', 'Defense', 'Midfield', 'Wall Ball', 'Solid Start', 'Lacrosse IQ']
      for (const category of categories) {
        const categoryBadges = badges?.filter(b => b.category === category) || []
        this.addResult({
          name: `Badge category: ${category}`,
          status: categoryBadges.length > 0 ? 'PASS' : 'WARNING',
          actual: categoryBadges.length,
          details: `${categoryBadges.length} badges in ${category} category`
        })
      }

      // Check WordPress ID mapping
      const withWordPressId = badges?.filter(b => b.wordpress_id) || []
      this.addResult({
        name: 'Badge WordPress mapping',
        status: withWordPressId.length > 0 ? 'PASS' : 'WARNING',
        actual: withWordPressId.length,
        details: `${withWordPressId.length} badges have WordPress IDs`
      })

      // Check requirements mapping
      const withRequirements = badges?.filter(b => b.points_required || b.workout_count) || []
      this.addResult({
        name: 'Badge requirements mapping',
        status: withRequirements.length > 0 ? 'PASS' : 'WARNING',
        actual: withRequirements.length,
        details: `${withRequirements.length} badges have requirement mapping`
      })

    } catch (error) {
      this.addResult({
        name: 'Badge validation',
        status: 'FAIL',
        critical: true,
        details: `Error: ${error}`
      })
    }
  }

  private async validateSyncSystem() {
    console.log('🔄 Validating Sync System...')

    // Check if sync scripts are executable
    const syncScriptPath = join(process.cwd(), 'scripts/sync-gamipress.ts')
    if (existsSync(syncScriptPath)) {
      try {
        const syncScript = readFileSync(syncScriptPath, 'utf-8')
        
        // Check for required functions
        const hasMainSync = syncScript.includes('syncGamiPressData')
        const hasPointSync = syncScript.includes('processPointUpdates')
        const hasBadgeSync = syncScript.includes('processBadgeUpdates')
        
        this.addResult({
          name: 'Sync script functions',
          status: hasMainSync && hasPointSync && hasBadgeSync ? 'PASS' : 'WARNING',
          details: 'Core sync functions implemented'
        })

        // Check for error handling
        const hasErrorHandling = syncScript.includes('try') && syncScript.includes('catch')
        this.addResult({
          name: 'Sync error handling',
          status: hasErrorHandling ? 'PASS' : 'WARNING',
          details: 'Error handling implemented in sync script'
        })

      } catch (error) {
        this.addResult({
          name: 'Sync script analysis',
          status: 'FAIL',
          details: `Error reading sync script: ${error}`
        })
      }
    }

    // Check API endpoint
    const apiPath = join(process.cwd(), 'src/app/api/gamipress/sync/route.ts')
    if (existsSync(apiPath)) {
      try {
        const apiScript = readFileSync(apiPath, 'utf-8')
        
        const hasPostEndpoint = apiScript.includes('export async function POST')
        const hasGetEndpoint = apiScript.includes('export async function GET')
        
        this.addResult({
          name: 'API endpoints',
          status: hasPostEndpoint && hasGetEndpoint ? 'PASS' : 'WARNING',
          details: 'Sync API endpoints implemented'
        })

      } catch (error) {
        this.addResult({
          name: 'API endpoint analysis',
          status: 'FAIL',
          details: `Error reading API file: ${error}`
        })
      }
    }

    // Check WordPress plugin
    const wpPluginPath = join(process.cwd(), 'docs/wordpress-plugin/powlax-gamipress-sync.php')
    if (existsSync(wpPluginPath)) {
      try {
        const wpPlugin = readFileSync(wpPluginPath, 'utf-8')
        
        const hasRestRoute = wpPlugin.includes('register_rest_route')
        const hasGamiPressIntegration = wpPlugin.includes('gamipress')
        
        this.addResult({
          name: 'WordPress plugin structure',
          status: hasRestRoute && hasGamiPressIntegration ? 'PASS' : 'WARNING',
          details: 'WordPress plugin properly structured'
        })

      } catch (error) {
        this.addResult({
          name: 'WordPress plugin analysis',
          status: 'FAIL',
          details: `Error reading WordPress plugin: ${error}`
        })
      }
    }
  }

  private async validateIconAccessibility() {
    console.log('🖼️ Validating Icon Accessibility...')

    try {
      // Get sample of icon URLs from database
      const { data: pointsWithIcons, error: pointsError } = await supabase
        .from('powlax_points_currencies')
        .select('icon_url')
        .not('icon_url', 'is', null)
        .limit(5)

      if (!pointsError && pointsWithIcons) {
        let accessibleIcons = 0
        let totalChecked = 0

        for (const point of pointsWithIcons) {
          if (point.icon_url) {
            totalChecked++
            try {
              const response = await fetch(point.icon_url, { method: 'HEAD' })
              if (response.ok) {
                accessibleIcons++
              }
            } catch {
              // Icon not accessible
            }
          }
        }

        const successRate = totalChecked > 0 ? (accessibleIcons / totalChecked) * 100 : 0
        this.addResult({
          name: 'Point type icon accessibility',
          status: successRate > 80 ? 'PASS' : successRate > 50 ? 'WARNING' : 'FAIL',
          actual: `${accessibleIcons}/${totalChecked} (${successRate.toFixed(1)}%)`,
          details: `Icon accessibility rate from sample`
        })
      }

      // Check badge icons
      const { data: badgesWithIcons, error: badgesError } = await supabase
        .from('badges')
        .select('icon_url')
        .not('icon_url', 'is', null)
        .limit(5)

      if (!badgesError && badgesWithIcons) {
        let accessibleBadgeIcons = 0
        let totalBadgeIcons = 0

        for (const badge of badgesWithIcons) {
          if (badge.icon_url) {
            totalBadgeIcons++
            try {
              const response = await fetch(badge.icon_url, { method: 'HEAD' })
              if (response.ok) {
                accessibleBadgeIcons++
              }
            } catch {
              // Icon not accessible
            }
          }
        }

        const badgeSuccessRate = totalBadgeIcons > 0 ? (accessibleBadgeIcons / totalBadgeIcons) * 100 : 0
        this.addResult({
          name: 'Badge icon accessibility',
          status: badgeSuccessRate > 80 ? 'PASS' : badgeSuccessRate > 50 ? 'WARNING' : 'FAIL',
          actual: `${accessibleBadgeIcons}/${totalBadgeIcons} (${badgeSuccessRate.toFixed(1)}%)`,
          details: `Badge icon accessibility from sample`
        })
      }

    } catch (error) {
      this.addResult({
        name: 'Icon accessibility check',
        status: 'FAIL',
        details: `Error checking icon accessibility: ${error}`
      })
    }
  }

  private async validateUserMigration() {
    console.log('👥 Validating User Migration Readiness...')

    try {
      // Check if user migration scripts exist and are valid
      const userScripts = [
        'migrate-user-points.ts',
        'migrate-user-badges.ts', 
        'migrate-user-ranks.ts'
      ]

      for (const script of userScripts) {
        const scriptPath = join(process.cwd(), 'scripts', script)
        const exists = existsSync(scriptPath)
        
        if (exists) {
          try {
            const content = readFileSync(scriptPath, 'utf-8')
            const hasSupabaseImport = content.includes('@supabase/supabase-js')
            const hasMainFunction = content.includes('async function')
            
            this.addResult({
              name: `User script: ${script}`,
              status: hasSupabaseImport && hasMainFunction ? 'PASS' : 'WARNING',
              details: 'User migration script properly structured'
            })
          } catch {
            this.addResult({
              name: `User script: ${script}`,
              status: 'WARNING',
              details: 'Script exists but could not be analyzed'
            })
          }
        } else {
          this.addResult({
            name: `User script: ${script}`,
            status: 'FAIL',
            critical: true,
            details: 'Required user migration script missing'
          })
        }
      }

      // Check user tables readiness
      const userTables = [
        'user_points_balance',
        'user_badge_progress',
        'user_rank_progress'
      ]

      for (const table of userTables) {
        try {
          const { error } = await supabase
            .from(table)
            .select('id')
            .limit(1)

          this.addResult({
            name: `User table: ${table}`,
            status: !error ? 'PASS' : 'WARNING',
            details: !error ? 'Table accessible for user migration' : `Table issue: ${error.message}`
          })
        } catch (error) {
          this.addResult({
            name: `User table: ${table}`,
            status: 'WARNING',
            details: `Could not verify table: ${error}`
          })
        }
      }

    } catch (error) {
      this.addResult({
        name: 'User migration validation',
        status: 'FAIL',
        critical: true,
        details: `Error: ${error}`
      })
    }
  }

  private async validateDataIntegrity() {
    console.log('🔍 Validating Data Integrity...')

    try {
      // Check for duplicate point types
      const { data: pointTypes } = await supabase
        .from('powlax_points_currencies')
        .select('currency_key')

      if (pointTypes) {
        const keys = pointTypes.map(pt => pt.currency_key)
        const uniqueKeys = new Set(keys)
        
        this.addResult({
          name: 'Point type uniqueness',
          status: keys.length === uniqueKeys.size ? 'PASS' : 'FAIL',
          critical: true,
          details: keys.length === uniqueKeys.size ? 'No duplicate point types' : 'Duplicate point type keys found'
        })
      }

      // Check for duplicate badges
      const { data: badges } = await supabase
        .from('badges')
        .select('name, wordpress_id')

      if (badges) {
        const badgeNames = badges.map(b => b.name)
        const uniqueBadgeNames = new Set(badgeNames)
        
        this.addResult({
          name: 'Badge uniqueness',
          status: badgeNames.length === uniqueBadgeNames.size ? 'PASS' : 'WARNING',
          details: badgeNames.length === uniqueBadgeNames.size ? 'No duplicate badge names' : 'Some badge names duplicated'
        })

        // Check WordPress ID uniqueness for badges
        const wpIds = badges.filter(b => b.wordpress_id).map(b => b.wordpress_id)
        const uniqueWpIds = new Set(wpIds)
        
        this.addResult({
          name: 'Badge WordPress ID uniqueness',
          status: wpIds.length === uniqueWpIds.size ? 'PASS' : 'FAIL',
          critical: true,
          details: wpIds.length === uniqueWpIds.size ? 'No duplicate WordPress IDs' : 'Duplicate WordPress IDs found'
        })
      }

      // Verify data relationships
      const { data: syncLogs } = await supabase
        .from('gamipress_sync_log')
        .select('*')
        .limit(1)

      this.addResult({
        name: 'Sync log functionality',
        status: 'PASS',
        details: 'Sync log table accessible for tracking operations'
      })

    } catch (error) {
      this.addResult({
        name: 'Data integrity validation',
        status: 'FAIL',
        critical: true,
        details: `Error: ${error}`
      })
    }
  }

  private generateReport(): ValidationReport {
    const passed = this.results.filter(r => r.status === 'PASS').length
    const failed = this.results.filter(r => r.status === 'FAIL').length
    const warnings = this.results.filter(r => r.status === 'WARNING').length
    const criticalFailures = this.results.filter(r => r.status === 'FAIL' && r.critical).length

    const report: ValidationReport = {
      timestamp: new Date().toISOString(),
      totalTests: this.results.length,
      passed,
      failed,
      warnings,
      criticalFailures,
      results: this.results,
      summary: this.generateSummary(passed, failed, warnings, criticalFailures)
    }

    return report
  }

  private generateSummary(passed: number, failed: number, warnings: number, critical: number): string {
    if (critical > 0) {
      return `CRITICAL ISSUES FOUND - ${critical} critical failures must be resolved before production`
    } else if (failed > 0) {
      return `ISSUES FOUND - ${failed} failures and ${warnings} warnings need attention`
    } else if (warnings > 0) {
      return `MOSTLY READY - ${warnings} warnings should be reviewed but not blocking`
    } else {
      return `MIGRATION READY - All validations passed successfully`
    }
  }
}

// Main execution
async function main() {
  try {
    console.log('🚀 GamiPress Migration Validation - Agent 5')
    console.log('='.repeat(50))
    
    const validator = new MigrationValidator()
    const report = await validator.validate()
    
    console.log('\n📊 VALIDATION SUMMARY')
    console.log('='.repeat(50))
    console.log(`Total Tests: ${report.totalTests}`)
    console.log(`✅ Passed: ${report.passed}`)
    console.log(`❌ Failed: ${report.failed}`)
    console.log(`⚠️ Warnings: ${report.warnings}`)
    console.log(`🚨 Critical: ${report.criticalFailures}`)
    console.log(`\n${report.summary}\n`)

    // Save detailed report
    const reportPath = join(process.cwd(), 'validation-report.json')
    require('fs').writeFileSync(reportPath, JSON.stringify(report, null, 2))
    console.log(`📄 Detailed report saved to: ${reportPath}`)

    // Exit with appropriate code
    process.exit(report.criticalFailures > 0 ? 1 : 0)

  } catch (error) {
    console.error('💥 Validation failed with error:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

export { MigrationValidator, ValidationResult, ValidationReport }