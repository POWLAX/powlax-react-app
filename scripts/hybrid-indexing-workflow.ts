#!/usr/bin/env npx tsx

/**
 * Hybrid Indexing Workflow
 * 
 * Combines automated PROJECT_INDEX.json with contract-driven manual indexing
 * for comprehensive codebase documentation that includes both technical 
 * structure and business context.
 */

import fs from 'fs/promises'
import path from 'path'
import { execSync } from 'child_process'

interface HybridIndexConfig {
  automated: {
    enabled: boolean
    watchMode: boolean
    updateFrequency: 'continuous' | 'hourly' | 'daily'
  }
  manual: {
    enabled: boolean
    contracts: string[]
    frequency: 'weekly' | 'monthly' | 'quarterly'
  }
  integration: {
    crossValidation: boolean
    consolidation: boolean
    outputLocation: string
  }
}

class HybridIndexingWorkflow {
  private config: HybridIndexConfig
  private projectRoot: string

  constructor(config?: Partial<HybridIndexConfig>) {
    this.projectRoot = process.cwd()
    this.config = {
      automated: {
        enabled: true,
        watchMode: true,
        updateFrequency: 'continuous'
      },
      manual: {
        enabled: true,
        contracts: [
          'enhanced-codebase-indexing-contract.yaml'
        ],
        frequency: 'monthly'
      },
      integration: {
        crossValidation: true,
        consolidation: true,
        outputLocation: 'docs/codebase-index'
      },
      ...config
    }
  }

  async runHybridIndexing(): Promise<void> {
    console.log('🔄 Starting Hybrid Indexing Workflow')
    console.log('====================================')

    try {
      // Phase 1: Automated Technical Indexing
      if (this.config.automated.enabled) {
        await this.runAutomatedIndexing()
      }

      // Phase 2: Manual Business Context Indexing
      if (this.config.manual.enabled) {
        await this.prepareManualIndexing()
      }

      // Phase 3: Integration and Cross-Validation
      if (this.config.integration.crossValidation) {
        await this.validateIndexConsistency()
      }

      console.log('✅ Hybrid indexing workflow complete!')
      
    } catch (error) {
      console.error('❌ Hybrid indexing failed:', error)
      throw error
    }
  }

  private async runAutomatedIndexing(): Promise<void> {
    console.log('\n📊 Phase 1: Automated Technical Indexing')
    console.log('----------------------------------------')

    // Generate PROJECT_INDEX.json
    console.log('🔄 Generating PROJECT_INDEX.json...')
    execSync('npm run index:generate', { stdio: 'inherit' })

    // Start file watcher if requested
    if (this.config.automated.watchMode) {
      console.log('👀 Starting file watcher for continuous updates...')
      console.log('💡 File watcher will run in background')
      console.log('   Use Ctrl+C to stop when manual indexing is complete')
      
      // Note: In production, you'd spawn this as a background process
      // For this example, we'll just show the command
      console.log('   Command: npm run index:watch')
    }

    console.log('✅ Automated indexing complete')
  }

  private async prepareManualIndexing(): Promise<void> {
    console.log('\n📝 Phase 2: Manual Business Context Indexing')
    console.log('--------------------------------------------')

    // Ensure output directory exists
    const outputDir = path.join(this.projectRoot, this.config.integration.outputLocation)
    await fs.mkdir(outputDir, { recursive: true })

    // Check if PROJECT_INDEX.json exists
    const indexPath = path.join(this.projectRoot, 'PROJECT_INDEX.json')
    const indexExists = await fs.access(indexPath).then(() => true).catch(() => false)

    if (!indexExists) {
      console.log('⚠️  PROJECT_INDEX.json not found. Manual indexing contracts need this foundation.')
      console.log('   Run: npm run index:generate')
      return
    }

    // Load PROJECT_INDEX.json for analysis
    const indexContent = await fs.readFile(indexPath, 'utf-8')
    const index = JSON.parse(indexContent)

    console.log('📊 Technical Foundation Available:')
    console.log(`   📦 Components: ${Object.keys(index.components).length}`)
    console.log(`   🌐 API Routes: ${Object.keys(index.api_routes).length}`)
    console.log(`   🪝 Hooks: ${Object.keys(index.hooks).length}`)
    console.log(`   📄 Pages: ${Object.keys(index.pages).length}`)

    // Generate manual indexing instructions
    await this.generateManualIndexingInstructions(index)

    console.log('✅ Manual indexing preparation complete')
    console.log('💡 Ready for contract-driven sub-agent execution')
  }

  private async generateManualIndexingInstructions(index: any): Promise<void> {
    const instructionsPath = path.join(
      this.projectRoot, 
      this.config.integration.outputLocation,
      'MANUAL_INDEXING_INSTRUCTIONS.md'
    )

    const instructions = `# Manual Indexing Instructions

**Generated:** ${new Date().toISOString()}  
**Contract:** enhanced-codebase-indexing-contract.yaml  
**Technical Foundation:** PROJECT_INDEX.json

## Overview

The automated PROJECT_INDEX.json provides technical structure for ${Object.keys(index.components).length} components, ${Object.keys(index.api_routes).length} API routes, ${Object.keys(index.hooks).length} hooks, and ${Object.keys(index.pages).length} pages.

Your manual indexing contracts should enhance this technical data with business context, quality assessment, and strategic guidance.

## Sub-Agent Task Distribution

### Task 1: Pages Business Context
- **Input:** PROJECT_INDEX.json pages section (${Object.keys(index.pages).length} pages)
- **Focus:** Add business purpose, user workflows, quality assessment
- **Output:** PAGES_BUSINESS_INDEX.md

### Task 2: Components Architecture Analysis  
- **Input:** PROJECT_INDEX.json components section (${Object.keys(index.components).length} components)
- **Focus:** Architecture patterns, reusability, performance analysis
- **Output:** COMPONENTS_ARCHITECTURE_INDEX.md

### Task 3: Database Business Mapping
- **Input:** PROJECT_INDEX.json database section (${index.database.total_tables} tables)
- **Focus:** Business purpose, data flows, optimization opportunities
- **Output:** DATABASE_BUSINESS_MAP.md

### Task 4: API Integration Analysis
- **Input:** PROJECT_INDEX.json api_routes section (${Object.keys(index.api_routes).length} routes)
- **Focus:** External dependencies, security, business workflows
- **Output:** API_INTEGRATION_INDEX.md

### Task 5: Hooks Patterns Analysis
- **Input:** PROJECT_INDEX.json hooks section (${Object.keys(index.hooks).length} hooks)
- **Focus:** State management patterns, performance, reusability
- **Output:** HOOKS_PATTERNS_INDEX.md

## Key Database Tables (Technical Foundation)

${Object.entries(index.database.key_tables)
  .map(([table, info]: [string, any]) => `- **${table}** (${info.records} records) - ${info.purpose}`)
  .join('\n')}

## Critical Rules (From Technical Index)

- **No Mock Data:** ${index.critical_rules.no_mock_data_policy}
- **Database Tables:** Use ${index.critical_rules.database_tables.use_powlax_prefix}
- **Never Use:** ${index.critical_rules.database_tables.never_use.join(', ')}

## Deployment Commands

\`\`\`bash
# Ensure technical foundation is current
npm run index:generate

# Start file watcher for continuous updates
npm run index:watch &

# Deploy manual indexing contracts (parallel execution)
# Use your preferred sub-agent deployment method with enhanced-codebase-indexing-contract.yaml
\`\`\`

## Success Criteria

- [ ] All ${Object.keys(index.components).length} components have business context
- [ ] All ${Object.keys(index.pages).length} pages have quality assessments  
- [ ] All ${index.database.total_tables} database tables have business purpose documented
- [ ] Cross-references between technical and business indexes are accurate
- [ ] Unified master index provides executive summary

---

**Next Step:** Execute enhanced-codebase-indexing-contract.yaml with sub-agents`

    await fs.writeFile(instructionsPath, instructions, 'utf-8')
    console.log(`📋 Manual indexing instructions created: ${instructionsPath}`)
  }

  private async validateIndexConsistency(): Promise<void> {
    console.log('\n🔍 Phase 3: Cross-Validation')
    console.log('----------------------------')

    const outputDir = path.join(this.projectRoot, this.config.integration.outputLocation)
    const indexPath = path.join(this.projectRoot, 'PROJECT_INDEX.json')

    try {
      // Check if both automated and manual indexes exist
      const automatedExists = await fs.access(indexPath).then(() => true).catch(() => false)
      const manualFiles = [
        'PAGES_BUSINESS_INDEX.md',
        'COMPONENTS_ARCHITECTURE_INDEX.md',
        'DATABASE_BUSINESS_MAP.md',
        'API_INTEGRATION_INDEX.md',
        'HOOKS_PATTERNS_INDEX.md'
      ]

      console.log('📊 Validation Results:')
      console.log(`   🤖 Automated Index: ${automatedExists ? '✅' : '❌'} PROJECT_INDEX.json`)

      for (const file of manualFiles) {
        const filePath = path.join(outputDir, file)
        const exists = await fs.access(filePath).then(() => true).catch(() => false)
        console.log(`   📝 Manual Index: ${exists ? '✅' : '❌'} ${file}`)
      }

      if (automatedExists) {
        const index = JSON.parse(await fs.readFile(indexPath, 'utf-8'))
        console.log(`   📈 Coverage: ${Object.keys(index.components).length} components, ${Object.keys(index.pages).length} pages, ${Object.keys(index.api_routes).length} API routes`)
      }

      console.log('✅ Cross-validation complete')

    } catch (error) {
      console.warn('⚠️  Cross-validation encountered issues:', error)
    }
  }

  async startWatchMode(): Promise<void> {
    console.log('👀 Starting Hybrid Indexing Watch Mode')
    console.log('=====================================')
    
    console.log('🤖 Automated indexing: Continuous file watching')
    console.log('📝 Manual indexing: Triggered on major changes')
    console.log('🔍 Cross-validation: After each manual update')
    
    // Start automated indexing in watch mode
    execSync('npm run index:watch &', { stdio: 'inherit' })
    
    console.log('✅ Watch mode active')
    console.log('💡 Use npm run hybrid:manual when manual indexing is needed')
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2)
  const workflow = new HybridIndexingWorkflow()

  try {
    if (args.includes('--watch')) {
      await workflow.startWatchMode()
    } else if (args.includes('--manual-only')) {
      const config = { automated: { enabled: false, watchMode: false, updateFrequency: 'continuous' as const } }
      const manualWorkflow = new HybridIndexingWorkflow(config)
      await manualWorkflow.runHybridIndexing()
    } else if (args.includes('--automated-only')) {
      const config = { manual: { enabled: false, contracts: [], frequency: 'monthly' as const } }
      const automatedWorkflow = new HybridIndexingWorkflow(config)
      await automatedWorkflow.runHybridIndexing()
    } else {
      await workflow.runHybridIndexing()
    }
  } catch (error) {
    console.error('❌ Hybrid indexing workflow failed:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

export { HybridIndexingWorkflow }
