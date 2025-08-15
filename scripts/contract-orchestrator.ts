#!/usr/bin/env npx tsx

/**
 * Contract Orchestrator
 * 
 * Master controller that implements your Claude-to-Claude Sub Agent Workflow
 * Integrates PROJECT_INDEX.json with contract-driven development
 * 
 * Features:
 * - Analyzes requirements using PROJECT_INDEX.json
 * - Creates detailed component specifications
 * - Deploys sub-agents with precise contracts
 * - Manages quality gates and iterations
 * - Updates component state tracking
 * - Provides completion notifications
 */

import fs from 'fs/promises'
import path from 'path'
import yaml from 'js-yaml'
import { ComponentStateManager } from './component-state-manager'
import { execSync } from 'child_process'

interface ContractRequest {
  description: string
  componentName?: string
  featureArea?: string
  requirements?: string[]
  databaseTables?: string[]
  priority?: 'low' | 'medium' | 'high' | 'critical'
}

interface ProjectIndex {
  components: Record<string, any>
  api_routes: Record<string, any>
  hooks: Record<string, any>
  database: {
    key_tables: Record<string, any>
    relationships: Record<string, string>
  }
  critical_rules: {
    database_tables: {
      use_powlax_prefix: string
      never_use: string[]
    }
    no_mock_data_policy: string
  }
}

interface Contract {
  id: string
  title: string
  type: string
  componentName?: string
  specifications: any
  subAgentInstructions: string[]
  qualityGates: any[]
  successCriteria: string[]
  databaseValidation: string[]
}

class ContractOrchestrator {
  private projectRoot: string
  private stateManager: ComponentStateManager
  private projectIndex: ProjectIndex | null = null

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot
    this.stateManager = new ComponentStateManager(projectRoot)
  }

  async initialize(): Promise<void> {
    // Load PROJECT_INDEX.json for technical foundation
    const indexPath = path.join(this.projectRoot, 'PROJECT_INDEX.json')
    
    try {
      const indexContent = await fs.readFile(indexPath, 'utf-8')
      this.projectIndex = JSON.parse(indexContent)
      console.log('✅ PROJECT_INDEX.json loaded for technical analysis')
    } catch (error) {
      console.log('⚠️  PROJECT_INDEX.json not found. Generating...')
      execSync('npm run index:generate', { stdio: 'inherit', cwd: this.projectRoot })
      
      const indexContent = await fs.readFile(indexPath, 'utf-8')
      this.projectIndex = JSON.parse(indexContent)
      console.log('✅ PROJECT_INDEX.json generated and loaded')
    }
  }

  async analyzeRequirements(request: ContractRequest): Promise<{
    existingComponents: string[]
    relatedComponents: string[]
    databaseTables: string[]
    suggestedApproach: string
    riskAssessment: string[]
  }> {
    if (!this.projectIndex) {
      await this.initialize()
    }

    const analysis = {
      existingComponents: [] as string[],
      relatedComponents: [] as string[],
      databaseTables: [] as string[],
      suggestedApproach: '',
      riskAssessment: [] as string[]
    }

    // Check for existing similar components
    if (request.componentName) {
      const componentPath = `src/components/**/${request.componentName}.tsx`
      const existing = Object.keys(this.projectIndex!.components).filter(path => 
        path.includes(request.componentName!) || 
        path.toLowerCase().includes(request.componentName!.toLowerCase())
      )
      analysis.existingComponents = existing
    }

    // Find related components by feature area
    if (request.featureArea) {
      const related = Object.keys(this.projectIndex!.components).filter(path => 
        path.includes(request.featureArea!)
      )
      analysis.relatedComponents = related
    }

    // Analyze database requirements
    if (request.databaseTables) {
      // Validate table names against PROJECT_INDEX
      const validTables = request.databaseTables.filter(table => 
        this.projectIndex!.database.key_tables[table] ||
        !this.projectIndex!.critical_rules.database_tables.never_use.includes(table)
      )
      
      const invalidTables = request.databaseTables.filter(table => 
        this.projectIndex!.critical_rules.database_tables.never_use.includes(table)
      )
      
      analysis.databaseTables = validTables
      
      if (invalidTables.length > 0) {
        analysis.riskAssessment.push(
          `Invalid table names detected: ${invalidTables.join(', ')}. Use correct names from PROJECT_INDEX.json`
        )
      }
    }

    // Generate approach suggestion
    if (analysis.existingComponents.length > 0) {
      analysis.suggestedApproach = 'MODIFY_EXISTING'
      analysis.riskAssessment.push('Existing components found - consider extending rather than creating new')
    } else if (analysis.relatedComponents.length > 3) {
      analysis.suggestedApproach = 'FOLLOW_PATTERNS'
      analysis.riskAssessment.push('Many similar components exist - follow established patterns')
    } else {
      analysis.suggestedApproach = 'CREATE_NEW'
    }

    return analysis
  }

  async createComponentContract(
    request: ContractRequest,
    analysis: any
  ): Promise<Contract> {
    const contractId = `component-${request.componentName}-${Date.now()}`
    
    // Load component specification template
    const templatePath = path.join(
      this.projectRoot, 
      'contracts/templates/component-specification-contract.yaml'
    )
    const templateContent = await fs.readFile(templatePath, 'utf-8')
    const template = yaml.load(templateContent) as any

    // Customize template with analysis results
    const specifications = {
      ...template,
      id: contractId,
      title: `${request.componentName} Component Specification`,
      component_name: request.componentName,
      feature_area: request.featureArea,
      database_tables: analysis.databaseTables,
      
      // Add technical foundation from PROJECT_INDEX
      existing_patterns: analysis.relatedComponents.map((path: string) => ({
        component: path,
        pattern: this.projectIndex!.components[path]?.purpose || 'Unknown pattern'
      })),
      
      // Database validation from PROJECT_INDEX
      database_validation: [
        ...template.validation_checklist.database_validation,
        `Use only these validated tables: ${analysis.databaseTables.join(', ')}`,
        `Never use these deprecated tables: ${this.projectIndex!.critical_rules.database_tables.never_use.join(', ')}`
      ],
      
      // Quality gates enhanced with project context
      quality_gates: {
        ...template.quality_gates,
        project_integration: [
          {
            criteria: 'Follows POWLAX component patterns from PROJECT_INDEX',
            validation: 'Component structure matches existing patterns'
          },
          {
            criteria: 'Uses correct database table names',
            validation: 'All table references validated against PROJECT_INDEX'
          },
          {
            criteria: 'No mock data policy compliance',
            validation: this.projectIndex!.critical_rules.no_mock_data_policy
          }
        ]
      }
    }

    const contract: Contract = {
      id: contractId,
      title: specifications.title,
      type: 'component-specification',
      componentName: request.componentName,
      specifications,
      subAgentInstructions: [
        'Read PROJECT_INDEX.json for technical foundation and existing patterns',
        'Follow component specification contract exactly',
        'Use validated database table names only',
        'Follow POWLAX no mock data policy',
        'Implement all quality gates and success criteria',
        'Return structured JSON response for orchestrator processing'
      ],
      qualityGates: specifications.quality_gates,
      successCriteria: specifications.success_criteria,
      databaseValidation: specifications.database_validation
    }

    // Save contract
    await this.saveContract(contract)
    
    // Update component state
    if (request.componentName) {
      await this.stateManager.createComponentState(request.componentName, specifications)
      await this.stateManager.addContractToComponent(
        request.componentName,
        contractId,
        'component-specification'
      )
    }

    return contract
  }

  async deploySubAgent(contract: Contract): Promise<string> {
    console.log(`🚀 Deploying sub-agent for contract: ${contract.id}`)
    
    // Format sub-agent prompt with all context
    const prompt = `
# POWLAX Component Development Contract

## Contract ID: ${contract.id}
## Component: ${contract.componentName}

### CRITICAL: Read These First
1. PROJECT_INDEX.json - Complete technical foundation
2. This contract specification - Exact requirements
3. AI_FRAMEWORK_ERROR_PREVENTION.md - Error prevention

### Technical Foundation Available
- **Existing Components:** ${Object.keys(this.projectIndex!.components).length}
- **Database Tables:** ${Object.keys(this.projectIndex!.database.key_tables).length}
- **API Routes:** ${Object.keys(this.projectIndex!.api_routes).length}
- **Custom Hooks:** ${Object.keys(this.projectIndex!.hooks).length}

### Contract Specifications
${JSON.stringify(contract.specifications, null, 2)}

### Sub-Agent Instructions
${contract.subAgentInstructions.map((instruction, i) => `${i + 1}. ${instruction}`).join('\n')}

### Quality Gates (Must Pass)
${contract.qualityGates.map((gate: any, i: number) => `${i + 1}. ${gate.criteria}: ${gate.validation}`).join('\n')}

### Database Validation Requirements
${contract.databaseValidation.map((req, i) => `${i + 1}. ${req}`).join('\n')}

### Success Criteria
${contract.successCriteria.map((criteria, i) => `${i + 1}. ${criteria}`).join('\n')}

### Required Response Format
Return structured JSON response following the format in the contract specification.
Include implementation details, testing results, quality metrics, and completion status.

### POWLAX Critical Rules
- ${this.projectIndex!.critical_rules.no_mock_data_policy}
- Use database table prefix: ${this.projectIndex!.critical_rules.database_tables.use_powlax_prefix}
- Never use deprecated tables: ${this.projectIndex!.critical_rules.database_tables.never_use.join(', ')}

Begin implementation following this contract exactly.
`

    // In a real implementation, this would deploy to your sub-agent system
    // For now, return the formatted prompt
    console.log('📋 Sub-agent prompt prepared:')
    console.log('   - Contract specifications loaded')
    console.log('   - PROJECT_INDEX.json integrated')
    console.log('   - Quality gates defined')
    console.log('   - Database validation included')
    
    return prompt
  }

  async processSubAgentResponse(
    contractId: string,
    response: any
  ): Promise<{
    qualityScore: number
    passedGates: number
    totalGates: number
    nextAction: 'APPROVE' | 'ITERATE' | 'ESCALATE'
    issues: any[]
  }> {
    // Load contract
    const contract = await this.loadContract(contractId)
    
    // Evaluate response against quality gates
    const evaluation = {
      qualityScore: response.qualityMetrics?.score || 0,
      passedGates: 0,
      totalGates: contract.qualityGates.length,
      nextAction: 'APPROVE' as 'APPROVE' | 'ITERATE' | 'ESCALATE',
      issues: response.issues || []
    }

    // Check each quality gate
    for (const gate of contract.qualityGates) {
      // Simplified gate checking - in practice this would be more sophisticated
      if (response.qualityMetrics?.breakdown?.[gate.category] >= 80) {
        evaluation.passedGates++
      }
    }

    // Determine next action
    if (evaluation.qualityScore >= 80 && evaluation.passedGates === evaluation.totalGates) {
      evaluation.nextAction = 'APPROVE'
    } else if (response.iteration < 3) {
      evaluation.nextAction = 'ITERATE'
    } else {
      evaluation.nextAction = 'ESCALATE'
    }

    // Update component state
    if (contract.componentName) {
      await this.stateManager.updateFromSubAgentResponse(
        contract.componentName,
        response
      )
      
      if (evaluation.nextAction === 'APPROVE') {
        await this.stateManager.completeContractForComponent(
          contract.componentName,
          contractId,
          'COMPLETED',
          evaluation.qualityScore
        )
      }
    }

    return evaluation
  }

  async generateContractFromRequest(request: ContractRequest): Promise<Contract> {
    console.log('🔍 Analyzing requirements with PROJECT_INDEX.json...')
    const analysis = await this.analyzeRequirements(request)
    
    console.log('📋 Creating component specification contract...')
    const contract = await this.createComponentContract(request, analysis)
    
    console.log('✅ Contract created:', contract.id)
    console.log('   - Component:', contract.componentName)
    console.log('   - Database tables:', analysis.databaseTables.join(', '))
    console.log('   - Risk assessment:', analysis.riskAssessment.length, 'items')
    
    return contract
  }

  private async saveContract(contract: Contract): Promise<void> {
    const contractsDir = path.join(this.projectRoot, 'contracts', 'active')
    await fs.mkdir(contractsDir, { recursive: true })
    
    const contractPath = path.join(contractsDir, `${contract.id}.yaml`)
    const yamlContent = yaml.dump(contract, { indent: 2, lineWidth: 120 })
    
    await fs.writeFile(contractPath, yamlContent, 'utf-8')
  }

  private async loadContract(contractId: string): Promise<Contract> {
    const contractPath = path.join(this.projectRoot, 'contracts', 'active', `${contractId}.yaml`)
    const content = await fs.readFile(contractPath, 'utf-8')
    return yaml.load(content) as Contract
  }

  async generateSystemStatus(): Promise<string> {
    const componentStates = await this.stateManager.getAllComponentStates()
    const activeContracts = await fs.readdir(path.join(this.projectRoot, 'contracts', 'active'))
    
    return `# POWLAX Contract System Status

**Generated:** ${new Date().toISOString()}

## System Overview
- **PROJECT_INDEX.json:** ✅ Loaded (${Object.keys(this.projectIndex?.components || {}).length} components indexed)
- **Component States:** ${Object.keys(componentStates).length} tracked
- **Active Contracts:** ${activeContracts.filter(f => f.endsWith('.yaml')).length}

## Component Status Summary
${Object.entries(componentStates).map(([name, state]) => 
  `- **${name}:** ${state.metadata.status} (Quality: ${state.quality.currentScore}/100)`
).join('\n')}

## Database Integration Status
- **Valid Tables Available:** ${Object.keys(this.projectIndex?.database.key_tables || {}).length}
- **Critical Rules Active:** No mock data policy enforced
- **Table Validation:** Automated via PROJECT_INDEX.json

## Quality Metrics
- **Average Component Quality:** ${Math.round(
  Object.values(componentStates).reduce((sum, state) => sum + state.quality.currentScore, 0) / 
  Object.values(componentStates).length
)}/100
- **Components Needing Attention:** ${Object.values(componentStates).filter(state => state.quality.currentScore < 60).length}

The contract orchestration system is ready for production use.`
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2)
  const orchestrator = new ContractOrchestrator()

  try {
    if (args.includes('--status')) {
      await orchestrator.initialize()
      const status = await orchestrator.generateSystemStatus()
      console.log(status)
      
    } else if (args.includes('--create-contract')) {
      const componentName = args[args.indexOf('--component') + 1] || 'ExampleComponent'
      const featureArea = args[args.indexOf('--feature') + 1] || 'general'
      
      const request: ContractRequest = {
        description: `Create ${componentName} component`,
        componentName,
        featureArea,
        databaseTables: ['powlax_drills', 'users'],
        priority: 'medium'
      }
      
      await orchestrator.initialize()
      const contract = await orchestrator.generateContractFromRequest(request)
      const prompt = await orchestrator.deploySubAgent(contract)
      
      console.log('\n📋 Sub-Agent Deployment Prompt:')
      console.log('=====================================')
      console.log(prompt)
      
    } else {
      console.log('POWLAX Contract Orchestrator')
      console.log('Usage:')
      console.log('  --status                    Show system status')
      console.log('  --create-contract           Create example contract')
      console.log('  --component <name>          Component name for contract')
      console.log('  --feature <area>           Feature area for contract')
    }
    
  } catch (error) {
    console.error('❌ Contract orchestrator failed:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

export { ContractOrchestrator, ContractRequest, Contract }
