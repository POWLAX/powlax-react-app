#!/usr/bin/env npx tsx

/**
 * Fresh Session Initializer for Claude Code
 * 
 * This script provides Claude with essential project context
 * at the start of a new session, using the PROJECT_INDEX.json
 * for efficient context loading.
 * 
 * Usage: npm run fresh
 */

import fs from 'fs/promises'
import path from 'path'

async function freshSession() {
  const projectRoot = process.cwd()
  const indexPath = path.join(projectRoot, 'PROJECT_INDEX.json')
  
  console.log('🚀 POWLAX Fresh Session Initialization')
  console.log('=====================================')
  
  try {
    // Check if index exists
    const indexExists = await fs.access(indexPath).then(() => true).catch(() => false)
    
    if (!indexExists) {
      console.log('⚠️  PROJECT_INDEX.json not found. Generating...')
      const { execSync } = require('child_process')
      execSync('npm run index:generate', { stdio: 'inherit' })
    }
    
    // Load and display key information
    const indexContent = await fs.readFile(indexPath, 'utf-8')
    const index = JSON.parse(indexContent)
    
    console.log('\n📊 PROJECT OVERVIEW')
    console.log('-------------------')
    console.log(`🏗️  Framework: ${index.architecture.framework}`)
    console.log(`🗄️  Database: ${index.architecture.database}`)
    console.log(`🔐 Authentication: ${index.architecture.authentication}`)
    console.log(`📁 Total Files Indexed: ${index.metadata.total_files}`)
    console.log(`🕐 Last Updated: ${new Date(index.metadata.generated_at).toLocaleString()}`)
    
    console.log('\n🚨 CRITICAL RULES')
    console.log('-----------------')
    console.log(`📋 No Mock Data Policy: ${index.critical_rules.no_mock_data_policy}`)
    console.log(`🖥️  Server Requirements: ${index.critical_rules.server_requirements}`)
    console.log(`🤖 AI Safety: ${index.critical_rules.ai_safety}`)
    
    console.log('\n🗄️  DATABASE ESSENTIALS')
    console.log('-----------------------')
    console.log(`📊 Total Tables: ${index.database.total_tables}`)
    console.log('✅ Use These Tables:')
    Object.entries(index.database.key_tables).slice(0, 5).forEach(([table, info]: [string, any]) => {
      console.log(`   • ${table} (${info.records} records) - ${info.purpose}`)
    })
    console.log('❌ Never Use:', index.critical_rules.database_tables.never_use.join(', '))
    
    console.log('\n🧩 COMPONENT OVERVIEW')
    console.log('---------------------')
    const componentCount = Object.keys(index.components).length
    const apiCount = Object.keys(index.api_routes).length  
    const hookCount = Object.keys(index.hooks).length
    
    console.log(`📦 Components: ${componentCount}`)
    console.log(`🌐 API Routes: ${apiCount}`)
    console.log(`🪝 Custom Hooks: ${hookCount}`)
    
    console.log('\n📚 KEY DOCUMENTATION')
    console.log('--------------------')
    Object.entries(index.documentation.critical_reads).forEach(([file, purpose]) => {
      console.log(`📄 ${file} - ${purpose}`)
    })
    
    console.log('\n📋 ACTIVE CONTRACTS')
    console.log('-------------------')
    Object.entries(index.contracts.active_contracts).slice(0, 3).forEach(([file, purpose]) => {
      console.log(`📄 ${file} - ${purpose}`)
    })
    
    console.log('\n🎯 READY FOR DEVELOPMENT!')
    console.log('=========================')
    console.log('✅ Project index loaded')
    console.log('✅ Critical rules understood')
    console.log('✅ Database structure mapped')
    console.log('✅ Component relationships known')
    
    console.log('\n📝 NEXT STEPS:')
    console.log('1. Read specific contract for your task')
    console.log('2. Check if components/hooks already exist')
    console.log('3. Start dev server: npm run dev -- -p 3002')
    console.log('4. Make focused, contract-driven changes')
    
    console.log('\n💡 TIPS:')
    console.log('• Use PROJECT_INDEX.json to understand existing code')
    console.log('• Check database.key_tables for correct table names')
    console.log('• Look at components section before creating new ones')
    console.log('• Follow critical_rules to avoid common mistakes')
    
  } catch (error) {
    console.error('❌ Error initializing fresh session:', error)
    console.log('\n🔧 RECOVERY STEPS:')
    console.log('1. npm run index:generate')
    console.log('2. npm run fresh')
  }
}

// Run if called directly
if (require.main === module) {
  freshSession()
}

export { freshSession }
