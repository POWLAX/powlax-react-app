#!/usr/bin/env npx tsx

/**
 * POWLAX Project Indexer
 * 
 * This script creates and maintains a high-level PROJECT_INDEX.json file
 * that provides Claude Code with an abstracted overview of the entire codebase
 * without consuming the limited context window.
 * 
 * Usage:
 *   npx tsx scripts/project-indexer.ts              # Generate full index
 *   npx tsx scripts/project-indexer.ts --watch      # Watch mode (auto-update)
 *   npx tsx scripts/project-indexer.ts --file path  # Update specific file
 */

import fs from 'fs/promises'
import path from 'path'
import { watch } from 'chokidar'

interface ProjectIndex {
  metadata: {
    generated_at: string
    version: string
    total_files: number
    project_name: string
    framework: string
    database: string
    last_updated_by: string
  }
  architecture: {
    framework: string
    ui_library: string
    database: string
    authentication: string
    state_management: string
    testing: string
    deployment: string
  }
  critical_rules: {
    database_tables: {
      use_powlax_prefix: string
      actual_table_names: string[]
      never_use: string[]
    }
    no_mock_data_policy: string
    server_requirements: string
    ai_safety: string
  }
  database: {
    total_tables: number
    key_tables: Record<string, { records: number; purpose: string }>
    relationships: Record<string, string>
  }
  file_structure: Record<string, any>
  components: Record<string, ComponentInfo>
  api_routes: Record<string, ApiRouteInfo>
  hooks: Record<string, HookInfo>
  types: Record<string, TypeInfo>
  pages: Record<string, PageInfo>
  contracts: {
    active_contracts: Record<string, string>
    master_contracts: Record<string, string>
  }
  documentation: {
    critical_reads: Record<string, string>
    component_docs: Record<string, string>
  }
}

interface ComponentInfo {
  path: string
  type: 'client' | 'server' | 'mixed'
  exports: string[]
  imports: string[]
  dependencies: string[]
  purpose: string
  props?: string[]
  hooks_used?: string[]
  database_tables?: string[]
}

interface ApiRouteInfo {
  path: string
  methods: string[]
  purpose: string
  auth_required: boolean
  database_tables: string[]
  return_type: string
}

interface HookInfo {
  path: string
  purpose: string
  returns: string[]
  dependencies: string[]
  database_tables: string[]
  query_keys?: string[]
}

interface TypeInfo {
  path: string
  exports: string[]
  purpose: string
}

interface PageInfo {
  path: string
  route: string
  type: 'client' | 'server' | 'mixed'
  auth_required: boolean
  components_used: string[]
  hooks_used: string[]
  purpose: string
}

class ProjectIndexer {
  private projectRoot: string
  private indexPath: string
  private index: ProjectIndex

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot
    this.indexPath = path.join(projectRoot, 'PROJECT_INDEX.json')
    
    // Initialize with base structure
    this.index = {
      metadata: {
        generated_at: new Date().toISOString(),
        version: '1.0.0',
        total_files: 0,
        project_name: 'POWLAX React App',
        framework: 'Next.js 14.2.5',
        database: 'Supabase PostgreSQL',
        last_updated_by: 'project-indexer-hook'
      },
      architecture: {
        framework: 'Next.js 14 App Router',
        ui_library: 'Tailwind CSS + Shadcn/UI',
        database: 'Supabase PostgreSQL (62 tables)',
        authentication: 'Supabase Auth (Magic Links)',
        state_management: 'TanStack React Query',
        testing: 'Playwright E2E',
        deployment: 'Vercel'
      },
      critical_rules: {
        database_tables: {
          use_powlax_prefix: 'powlax_drills, powlax_strategies (NOT drills, strategies)',
          actual_table_names: ['users', 'practices', 'clubs', 'teams', 'team_members'],
          never_use: ['user_profiles', 'practice_plans', 'organizations', 'drills', 'strategies']
        },
        no_mock_data_policy: 'ABSOLUTELY NO hardcoded mock data - use real data or (MOCK) labeled test data',
        server_requirements: 'MUST run dev server on port 3002',
        ai_safety: 'Read AI_FRAMEWORK_ERROR_PREVENTION.md before any changes'
      },
      database: {
        total_tables: 62,
        key_tables: {
          'skills_academy_series': { records: 49, purpose: 'Workout series definitions' },
          'skills_academy_workouts': { records: 166, purpose: 'Workout definitions with drill_ids column' },
          'skills_academy_drills': { records: 167, purpose: 'PRIMARY drill library' },
          'powlax_drills': { records: 135, purpose: 'Main POWLAX drill library' },
          'powlax_strategies': { records: 220, purpose: 'Strategy library' },
          'practices': { records: 34, purpose: 'THE REAL practice plans table' },
          'users': { records: 14, purpose: 'Main user table (NOT user_profiles)' },
          'teams': { records: 14, purpose: 'Team entities' },
          'clubs': { records: 3, purpose: 'Organization level (NOT organizations)' }
        },
        relationships: {
          'workouts_to_drills': 'Use drill_ids column, NOT junction tables',
          'users_to_teams': 'team_members table',
          'teams_to_clubs': 'club_id foreign key'
        }
      },
      file_structure: {},
      components: {},
      api_routes: {},
      hooks: {},
      types: {},
      pages: {},
      contracts: {
        active_contracts: {},
        master_contracts: {}
      },
      documentation: {
        critical_reads: {},
        component_docs: {}
      }
    }
  }

  async generateIndex(): Promise<void> {
    console.log('🔄 Generating PROJECT_INDEX.json...')
    
    try {
      await this.scanFileStructure()
      await this.analyzeComponents()
      await this.analyzeApiRoutes()
      await this.analyzeHooks()
      await this.analyzeTypes()
      await this.analyzePages()
      await this.analyzeContracts()
      await this.analyzeDocumentation()
      
      this.index.metadata.generated_at = new Date().toISOString()
      
      await this.saveIndex()
      console.log('✅ PROJECT_INDEX.json generated successfully!')
      console.log(`📊 Indexed ${this.index.metadata.total_files} files`)
    } catch (error) {
      console.error('❌ Error generating index:', error)
      throw error
    }
  }

  private async scanFileStructure(): Promise<void> {
    const srcPath = path.join(this.projectRoot, 'src')
    
    this.index.file_structure = {
      'src/app': {
        type: 'directory',
        purpose: 'Next.js App Router pages',
        key_routes: {
          '(authenticated)': 'Protected routes with auth layout',
          'api': 'Server-side API endpoints',
          'page.tsx': 'Public landing page'
        }
      },
      'src/components': {
        type: 'directory', 
        purpose: 'React components organized by domain',
        subdirectories: {
          'ui': '17 Shadcn/UI base components',
          'practice-planner': 'Practice planning system components',
          'skills-academy': 'Skills training components', 
          'dashboards': 'Role-specific dashboard components',
          'teams': 'Team management components',
          'navigation': 'Mobile/desktop navigation components'
        }
      },
      'src/hooks': {
        type: 'directory',
        purpose: 'Custom React hooks with TanStack Query',
        key_hooks: {
          'useDrills': 'Fetches from powlax_drills + user_drills',
          'useStrategies': 'Fetches from powlax_strategies + user_strategies', 
          'usePointsCalculation': 'Skills Academy points system',
          'useProgressTracking': 'Workout progress tracking'
        }
      },
      'src/lib': {
        type: 'directory',
        purpose: 'Utility libraries and configurations',
        key_files: {
          'supabase.ts': 'Client-side Supabase client',
          'supabase-server.ts': 'Server-side Supabase client',
          'utils.ts': 'General utility functions'
        }
      }
    }
  }

  private async analyzeComponents(): Promise<void> {
    const componentsPath = path.join(this.projectRoot, 'src/components')
    await this.analyzeDirectory(componentsPath, 'components')
  }

  private async analyzeApiRoutes(): Promise<void> {
    const apiPath = path.join(this.projectRoot, 'src/app/api')
    await this.analyzeDirectory(apiPath, 'api')
  }

  private async analyzeHooks(): Promise<void> {
    const hooksPath = path.join(this.projectRoot, 'src/hooks')
    await this.analyzeDirectory(hooksPath, 'hooks')
  }

  private async analyzeTypes(): Promise<void> {
    const typesPath = path.join(this.projectRoot, 'src/types')
    await this.analyzeDirectory(typesPath, 'types')
  }

  private async analyzePages(): Promise<void> {
    const pagesPath = path.join(this.projectRoot, 'src/app')
    await this.analyzeDirectory(pagesPath, 'pages')
  }

  private async analyzeContracts(): Promise<void> {
    const contractsPath = path.join(this.projectRoot, 'contracts')
    
    try {
      const activeContractsPath = path.join(contractsPath, 'active')
      const activeFiles = await fs.readdir(activeContractsPath)
      
      for (const file of activeFiles) {
        if (file.endsWith('.yaml') || file.endsWith('.md')) {
          const purpose = await this.extractFilePurpose(path.join(activeContractsPath, file))
          this.index.contracts.active_contracts[file] = purpose
        }
      }

      // Look for MASTER_CONTRACT files
      const componentsPath = path.join(this.projectRoot, 'src/components')
      const componentDirs = await fs.readdir(componentsPath, { withFileTypes: true })
      
      for (const dir of componentDirs) {
        if (dir.isDirectory()) {
          const masterContractPath = path.join(componentsPath, dir.name, 'MASTER_CONTRACT.md')
          try {
            await fs.access(masterContractPath)
            const purpose = await this.extractFilePurpose(masterContractPath)
            this.index.contracts.master_contracts[dir.name] = purpose
          } catch {
            // File doesn't exist, skip
          }
        }
      }
    } catch (error) {
      console.warn('⚠️  Could not analyze contracts directory:', error)
    }
  }

  private async analyzeDocumentation(): Promise<void> {
    // Critical documentation files
    const criticalFiles = [
      'AI_FRAMEWORK_ERROR_PREVENTION.md',
      'CLAUDE.md', 
      'README.md'
    ]

    for (const file of criticalFiles) {
      const filePath = path.join(this.projectRoot, file)
      try {
        const purpose = await this.extractFilePurpose(filePath)
        this.index.documentation.critical_reads[file] = purpose
      } catch {
        // File doesn't exist, skip
      }
    }

    // Component documentation
    const componentsPath = path.join(this.projectRoot, 'src/components')
    try {
      const componentDirs = await fs.readdir(componentsPath, { withFileTypes: true })
      
      for (const dir of componentDirs) {
        if (dir.isDirectory()) {
          const readmePath = path.join(componentsPath, dir.name, 'README.md')
          const claudePath = path.join(componentsPath, dir.name, 'claude.md')
          
          try {
            await fs.access(readmePath)
            const purpose = await this.extractFilePurpose(readmePath)
            this.index.documentation.component_docs[`${dir.name}/README.md`] = purpose
          } catch {
            // File doesn't exist, skip
          }

          try {
            await fs.access(claudePath)
            const purpose = await this.extractFilePurpose(claudePath)
            this.index.documentation.component_docs[`${dir.name}/claude.md`] = purpose
          } catch {
            // File doesn't exist, skip
          }
        }
      }
    } catch (error) {
      console.warn('⚠️  Could not analyze component documentation:', error)
    }
  }

  private async analyzeDirectory(dirPath: string, category: string): Promise<void> {
    try {
      const files = await this.getAllFiles(dirPath, ['.tsx', '.ts', '.js', '.jsx'])
      
      for (const filePath of files) {
        const relativePath = path.relative(this.projectRoot, filePath)
        const content = await fs.readFile(filePath, 'utf-8')
        
        const analysis = await this.analyzeFile(content, filePath, category)
        
        switch (category) {
          case 'components':
            this.index.components[relativePath] = analysis as ComponentInfo
            break
          case 'api':
            this.index.api_routes[relativePath] = analysis as ApiRouteInfo
            break
          case 'hooks':
            this.index.hooks[relativePath] = analysis as HookInfo
            break
          case 'types':
            this.index.types[relativePath] = analysis as TypeInfo
            break
          case 'pages':
            this.index.pages[relativePath] = analysis as PageInfo
            break
        }
        
        this.index.metadata.total_files++
      }
    } catch (error) {
      console.warn(`⚠️  Could not analyze ${category} directory:`, error)
    }
  }

  private async analyzeFile(content: string, filePath: string, category: string): Promise<any> {
    const relativePath = path.relative(this.projectRoot, filePath)
    const fileName = path.basename(filePath)
    
    // Extract imports
    const imports = this.extractImports(content)
    
    // Extract exports
    const exports = this.extractExports(content)
    
    // Extract database table references
    const databaseTables = this.extractDatabaseTables(content)
    
    // Extract purpose from comments or file name
    const purpose = this.extractPurpose(content, fileName)

    const baseInfo = {
      path: relativePath,
      purpose,
      imports,
      exports,
      database_tables: databaseTables
    }

    switch (category) {
      case 'components':
        return {
          ...baseInfo,
          type: this.detectComponentType(content),
          props: this.extractProps(content),
          hooks_used: this.extractHooksUsed(content)
        } as ComponentInfo

      case 'api':
        return {
          ...baseInfo,
          methods: this.extractHttpMethods(content),
          auth_required: this.detectAuthRequired(content),
          return_type: this.extractReturnType(content)
        } as ApiRouteInfo

      case 'hooks':
        return {
          ...baseInfo,
          returns: this.extractHookReturns(content),
          dependencies: this.extractDependencies(content),
          query_keys: this.extractQueryKeys(content)
        } as HookInfo

      case 'types':
        return baseInfo as TypeInfo

      case 'pages':
        return {
          ...baseInfo,
          route: this.extractRoute(filePath),
          type: this.detectComponentType(content),
          auth_required: this.detectAuthRequired(content),
          components_used: this.extractComponentsUsed(content),
          hooks_used: this.extractHooksUsed(content)
        } as PageInfo

      default:
        return baseInfo
    }
  }

  // Analysis helper methods
  private extractImports(content: string): string[] {
    const importRegex = /import\s+(?:{[^}]*}|[^{][^'"`]*)\s+from\s+['"`]([^'"`]+)['"`]/g
    const imports: string[] = []
    let match

    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1])
    }

    return imports
  }

  private extractExports(content: string): string[] {
    const exportRegex = /export\s+(?:default\s+)?(?:function|const|class|interface|type)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g
    const exports: string[] = []
    let match

    while ((match = exportRegex.exec(content)) !== null) {
      exports.push(match[1])
    }

    return exports
  }

  private extractDatabaseTables(content: string): string[] {
    const tableRegex = /\.from\(['"`]([^'"`]+)['"`]\)/g
    const tables: Set<string> = new Set()
    let match

    while ((match = tableRegex.exec(content)) !== null) {
      tables.add(match[1])
    }

    return Array.from(tables)
  }

  private extractPurpose(content: string, fileName: string): string {
    // Look for JSDoc comments or first comment
    const purposeComment = content.match(/\/\*\*?\s*\n?\s*\*?\s*(.+?)(?:\n|\*\/)/)?.[1]
    if (purposeComment) {
      return purposeComment.trim()
    }

    // Infer from filename
    if (fileName.includes('Modal')) return 'Modal component'
    if (fileName.includes('Card')) return 'Card component'
    if (fileName.includes('Button')) return 'Button component'
    if (fileName.includes('use')) return 'Custom React hook'
    if (fileName.includes('route.ts')) return 'API route handler'
    
    return 'Component or utility'
  }

  private detectComponentType(content: string): 'client' | 'server' | 'mixed' {
    if (content.includes("'use client'")) return 'client'
    if (content.includes("'use server'")) return 'server'
    if (content.includes('async function') && !content.includes("'use client'")) return 'server'
    return 'mixed'
  }

  private extractProps(content: string): string[] {
    const propsRegex = /interface\s+\w*Props\s*{([^}]+)}/g
    const props: string[] = []
    let match

    while ((match = propsRegex.exec(content)) !== null) {
      const propsContent = match[1]
      const propMatches = propsContent.match(/(\w+)(?:\?)?:/g)
      if (propMatches) {
        props.push(...propMatches.map(p => p.replace(/[?:]/g, '')))
      }
    }

    return props
  }

  private extractHooksUsed(content: string): string[] {
    const hookRegex = /use[A-Z][a-zA-Z0-9]*(?=\()/g
    const hooks = content.match(hookRegex) || []
    return [...new Set(hooks)]
  }

  private extractHttpMethods(content: string): string[] {
    const methods: string[] = []
    if (content.includes('export async function GET')) methods.push('GET')
    if (content.includes('export async function POST')) methods.push('POST')
    if (content.includes('export async function PUT')) methods.push('PUT')
    if (content.includes('export async function DELETE')) methods.push('DELETE')
    if (content.includes('export async function PATCH')) methods.push('PATCH')
    return methods
  }

  private detectAuthRequired(content: string): boolean {
    return content.includes('getAuthUser') || 
           content.includes('useRequireAuth') ||
           content.includes('authenticated')
  }

  private extractReturnType(content: string): string {
    if (content.includes('NextResponse.json')) return 'JSON'
    if (content.includes('Response')) return 'Response'
    return 'unknown'
  }

  private extractHookReturns(content: string): string[] {
    const returnRegex = /return\s+{([^}]+)}/g
    const returns: string[] = []
    let match

    while ((match = returnRegex.exec(content)) !== null) {
      const returnContent = match[1]
      const returnKeys = returnContent.match(/(\w+)(?:\s*[:,])/g)
      if (returnKeys) {
        returns.push(...returnKeys.map(k => k.replace(/[,:]/g, '').trim()))
      }
    }

    return [...new Set(returns)]
  }

  private extractDependencies(content: string): string[] {
    return this.extractImports(content).filter(imp => 
      !imp.startsWith('.') && !imp.startsWith('@/')
    )
  }

  private extractQueryKeys(content: string): string[] {
    const queryKeyRegex = /queryKey:\s*\[([^\]]+)\]/g
    const queryKeys: string[] = []
    let match

    while ((match = queryKeyRegex.exec(content)) !== null) {
      const keyContent = match[1]
      const keys = keyContent.match(/['"`]([^'"`]+)['"`]/g)
      if (keys) {
        queryKeys.push(...keys.map(k => k.replace(/['"`]/g, '')))
      }
    }

    return queryKeys
  }

  private extractRoute(filePath: string): string {
    const appIndex = filePath.indexOf('/app/')
    if (appIndex === -1) return ''
    
    const routePath = filePath.substring(appIndex + 5)
    return '/' + routePath
      .replace(/\/page\.(tsx?|jsx?)$/, '')
      .replace(/\/route\.(tsx?|jsx?)$/, '')
      .replace(/\[([^\]]+)\]/g, ':$1')
      .replace(/\/+/g, '/')
  }

  private extractComponentsUsed(content: string): string[] {
    const componentRegex = /<([A-Z][a-zA-Z0-9]*)/g
    const components: Set<string> = new Set()
    let match

    while ((match = componentRegex.exec(content)) !== null) {
      components.add(match[1])
    }

    return Array.from(components)
  }

  private async extractFilePurpose(filePath: string): Promise<string> {
    try {
      const content = await fs.readFile(filePath, 'utf-8')
      const firstLine = content.split('\n')[0]
      
      // Look for title in markdown
      if (firstLine.startsWith('#')) {
        return firstLine.replace(/^#+\s*/, '')
      }
      
      // Look for JSDoc comment
      const purposeMatch = content.match(/\/\*\*?\s*\n?\s*\*?\s*(.+?)(?:\n|\*\/)/)?.[1]
      if (purposeMatch) {
        return purposeMatch.trim()
      }
      
      return 'Documentation file'
    } catch {
      return 'File not accessible'
    }
  }

  private async getAllFiles(dirPath: string, extensions: string[]): Promise<string[]> {
    const files: string[] = []
    
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true })
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name)
        
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          files.push(...await this.getAllFiles(fullPath, extensions))
        } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
          files.push(fullPath)
        }
      }
    } catch (error) {
      // Directory doesn't exist or is not accessible
    }
    
    return files
  }

  private async saveIndex(): Promise<void> {
    const indexJson = JSON.stringify(this.index, null, 2)
    await fs.writeFile(this.indexPath, indexJson, 'utf-8')
  }

  async updateFile(filePath: string): Promise<void> {
    console.log(`🔄 Updating index for: ${filePath}`)
    
    try {
      // Load existing index
      const existingIndex = await fs.readFile(this.indexPath, 'utf-8')
      this.index = JSON.parse(existingIndex)
    } catch {
      // Index doesn't exist, will be created
    }

    const relativePath = path.relative(this.projectRoot, filePath)
    const content = await fs.readFile(filePath, 'utf-8')
    
    // Determine category
    let category = 'unknown'
    if (filePath.includes('/components/')) category = 'components'
    else if (filePath.includes('/api/')) category = 'api'
    else if (filePath.includes('/hooks/')) category = 'hooks'
    else if (filePath.includes('/types/')) category = 'types'
    else if (filePath.includes('/app/')) category = 'pages'

    if (category !== 'unknown') {
      const analysis = await this.analyzeFile(content, filePath, category)
      
      switch (category) {
        case 'components':
          this.index.components[relativePath] = analysis as ComponentInfo
          break
        case 'api':
          this.index.api_routes[relativePath] = analysis as ApiRouteInfo
          break
        case 'hooks':
          this.index.hooks[relativePath] = analysis as HookInfo
          break
        case 'types':
          this.index.types[relativePath] = analysis as TypeInfo
          break
        case 'pages':
          this.index.pages[relativePath] = analysis as PageInfo
          break
      }

      this.index.metadata.generated_at = new Date().toISOString()
      await this.saveIndex()
      console.log('✅ Index updated successfully!')
    }
  }

  async watchMode(): Promise<void> {
    console.log('👀 Starting watch mode...')
    console.log('📁 Watching for changes in src/, contracts/, docs/, and root files')
    
    // Generate initial index
    await this.generateIndex()
    
    const watcher = watch([
      'src/**/*.{ts,tsx,js,jsx}',
      'contracts/**/*.{yaml,md}',
      'docs/**/*.md',
      '*.md'
    ], {
      ignored: ['node_modules', '.git', '.next', 'dist'],
      ignoreInitial: true
    })

    watcher.on('change', async (filePath) => {
      try {
        await this.updateFile(filePath)
      } catch (error) {
        console.error(`❌ Error updating index for ${filePath}:`, error)
      }
    })

    watcher.on('add', async (filePath) => {
      try {
        await this.updateFile(filePath)
      } catch (error) {
        console.error(`❌ Error adding file to index ${filePath}:`, error)
      }
    })

    watcher.on('unlink', async (filePath) => {
      try {
        // Load existing index
        const existingIndex = await fs.readFile(this.indexPath, 'utf-8')
        this.index = JSON.parse(existingIndex)
        
        const relativePath = path.relative(this.projectRoot, filePath)
        
        // Remove from all categories
        delete this.index.components[relativePath]
        delete this.index.api_routes[relativePath]
        delete this.index.hooks[relativePath]
        delete this.index.types[relativePath]
        delete this.index.pages[relativePath]
        
        this.index.metadata.generated_at = new Date().toISOString()
        await this.saveIndex()
        console.log(`🗑️  Removed ${filePath} from index`)
      } catch (error) {
        console.error(`❌ Error removing file from index ${filePath}:`, error)
      }
    })

    console.log('✅ Watch mode active. Press Ctrl+C to stop.')
    
    // Keep process alive
    process.on('SIGINT', () => {
      console.log('\n👋 Stopping watch mode...')
      watcher.close()
      process.exit(0)
    })
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2)
  const indexer = new ProjectIndexer()

  try {
    if (args.includes('--watch')) {
      await indexer.watchMode()
    } else if (args.includes('--file')) {
      const fileIndex = args.indexOf('--file')
      const filePath = args[fileIndex + 1]
      if (!filePath) {
        console.error('❌ --file requires a file path')
        process.exit(1)
      }
      await indexer.updateFile(path.resolve(filePath))
    } else {
      await indexer.generateIndex()
    }
  } catch (error) {
    console.error('❌ Indexer failed:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

export { ProjectIndexer }
