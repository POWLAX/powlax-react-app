#!/usr/bin/env npx tsx

/**
 * Component State Manager
 * 
 * Manages state tracking for POWLAX components including:
 * - Component specifications and contracts
 * - Database table dependencies
 * - Quality metrics and test results
 * - Integration relationships
 * - Implementation status
 */

import fs from 'fs/promises'
import path from 'path'
import yaml from 'js-yaml'

interface ComponentState {
  metadata: {
    name: string
    type: 'client' | 'server' | 'mixed'
    featureArea: string
    version: string
    lastModified: string
    status: 'draft' | 'in_progress' | 'complete' | 'needs_attention' | 'deprecated'
  }
  
  functionality: {
    purpose: string
    userInteractions: string[]
    businessRules: string[]
    edgeCases: string[]
  }
  
  technical: {
    filePath: string
    propsInterface: string
    stateManagement: {
      localState: string[]
      sharedState: string[]
      externalState: string[]
    }
    dependencies: string[]
    exports: string[]
  }
  
  database: {
    primaryTables: Array<{
      tableName: string
      usagePattern: string
      purpose: string
      queries: Array<{
        description: string
        queryType: string
        performanceRequirements: string
      }>
    }>
    relationships: Array<{
      fromTable: string
      toTable: string
      relationshipType: string
      componentUsage: string
    }>
  }
  
  relationships: {
    parentComponents: Array<{
      component: string
      relationship: string
      dataFlow: string
    }>
    childComponents: Array<{
      component: string
      relationship: string
      dataFlow: string
    }>
    siblingComponents: Array<{
      component: string
      sharedData: string
      communication: string
    }>
  }
  
  quality: {
    currentScore: number
    breakdown: {
      functionality: number
      performance: number
      mobile: number
      accessibility: number
    }
    lastTestResults: {
      unitTests: { created: number; passing: number }
      integrationTests: { created: number; passing: number }
      e2eTests: { created: number; passing: number }
      coverage: number
    }
    performanceMetrics: {
      loadTime: number
      renderTime: number
      memoryUsage: number
    }
  }
  
  contracts: {
    active: Array<{
      id: string
      type: string
      createdAt: string
      status: string
    }>
    completed: Array<{
      id: string
      type: string
      completedAt: string
      result: string
      qualityScore: number
    }>
  }
  
  issues: Array<{
    id: string
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    description: string
    createdAt: string
    resolvedAt?: string
  }>
}

class ComponentStateManager {
  private stateDir: string
  private projectRoot: string

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot
    this.stateDir = path.join(projectRoot, 'state', 'components')
  }

  async ensureStateDirectory(): Promise<void> {
    await fs.mkdir(this.stateDir, { recursive: true })
  }

  async createComponentState(
    componentName: string,
    specification: any
  ): Promise<ComponentState> {
    const initialState: ComponentState = {
      metadata: {
        name: componentName,
        type: specification.component_type || 'client',
        featureArea: specification.feature_area || 'general',
        version: '1.0.0',
        lastModified: new Date().toISOString(),
        status: 'draft'
      },
      
      functionality: {
        purpose: specification.functional_requirements?.primary_purpose || '',
        userInteractions: specification.functional_requirements?.user_interactions || [],
        businessRules: specification.functional_requirements?.business_rules || [],
        edgeCases: specification.functional_requirements?.edge_cases || []
      },
      
      technical: {
        filePath: '',
        propsInterface: specification.technical_requirements?.props_interface || '',
        stateManagement: {
          localState: specification.technical_requirements?.state_management?.local_state || [],
          sharedState: specification.technical_requirements?.state_management?.shared_state || [],
          externalState: specification.technical_requirements?.state_management?.external_state || []
        },
        dependencies: [],
        exports: []
      },
      
      database: {
        primaryTables: specification.database_integration?.primary_tables || [],
        relationships: specification.database_integration?.relationships || []
      },
      
      relationships: {
        parentComponents: specification.component_relationships?.parent_components || [],
        childComponents: specification.component_relationships?.child_components || [],
        siblingComponents: specification.component_relationships?.sibling_components || []
      },
      
      quality: {
        currentScore: 0,
        breakdown: {
          functionality: 0,
          performance: 0,
          mobile: 0,
          accessibility: 0
        },
        lastTestResults: {
          unitTests: { created: 0, passing: 0 },
          integrationTests: { created: 0, passing: 0 },
          e2eTests: { created: 0, passing: 0 },
          coverage: 0
        },
        performanceMetrics: {
          loadTime: 0,
          renderTime: 0,
          memoryUsage: 0
        }
      },
      
      contracts: {
        active: [],
        completed: []
      },
      
      issues: []
    }

    await this.saveComponentState(componentName, initialState)
    return initialState
  }

  async updateComponentState(
    componentName: string,
    updates: Partial<ComponentState>
  ): Promise<ComponentState> {
    const currentState = await this.getComponentState(componentName)
    
    const updatedState: ComponentState = {
      ...currentState,
      ...updates,
      metadata: {
        ...currentState.metadata,
        ...updates.metadata,
        lastModified: new Date().toISOString(),
        version: this.incrementVersion(currentState.metadata.version)
      }
    }

    await this.saveComponentState(componentName, updatedState)
    return updatedState
  }

  async updateFromSubAgentResponse(
    componentName: string,
    response: any
  ): Promise<ComponentState> {
    const updates: Partial<ComponentState> = {
      metadata: {
        status: response.completionStatus === 'COMPLETE' ? 'complete' : 'in_progress'
      } as any,
      
      technical: {
        filePath: response.implementation?.filesCreated?.[0] || '',
        dependencies: response.implementation?.dependencies || [],
        exports: response.implementation?.exports || []
      } as any,
      
      quality: {
        currentScore: response.qualityMetrics?.score || 0,
        breakdown: response.qualityMetrics?.breakdown || {},
        lastTestResults: {
          unitTests: response.testing?.unitTests || { created: 0, passing: 0 },
          integrationTests: response.testing?.integrationTests || { created: 0, passing: 0 },
          e2eTests: response.testing?.e2eTests || { created: 0, passing: 0 },
          coverage: response.testing?.coverage || 0
        },
        performanceMetrics: {
          loadTime: response.performance?.loadTime || 0,
          renderTime: response.performance?.renderTime || 0,
          memoryUsage: response.performance?.memoryUsage || 0
        }
      } as any,
      
      issues: response.issues?.map((issue: any) => ({
        id: `issue-${Date.now()}`,
        severity: issue.severity || 'MEDIUM',
        description: issue.description,
        createdAt: new Date().toISOString()
      })) || []
    }

    return await this.updateComponentState(componentName, updates)
  }

  async getComponentState(componentName: string): Promise<ComponentState> {
    const stateFile = path.join(this.stateDir, `${componentName}.yaml`)
    
    try {
      const content = await fs.readFile(stateFile, 'utf-8')
      return yaml.load(content) as ComponentState
    } catch (error) {
      // Component state doesn't exist, return minimal state
      return {
        metadata: {
          name: componentName,
          type: 'client',
          featureArea: 'unknown',
          version: '1.0.0',
          lastModified: new Date().toISOString(),
          status: 'draft'
        },
        functionality: { purpose: '', userInteractions: [], businessRules: [], edgeCases: [] },
        technical: { 
          filePath: '', 
          propsInterface: '', 
          stateManagement: { localState: [], sharedState: [], externalState: [] },
          dependencies: [],
          exports: []
        },
        database: { primaryTables: [], relationships: [] },
        relationships: { parentComponents: [], childComponents: [], siblingComponents: [] },
        quality: {
          currentScore: 0,
          breakdown: { functionality: 0, performance: 0, mobile: 0, accessibility: 0 },
          lastTestResults: {
            unitTests: { created: 0, passing: 0 },
            integrationTests: { created: 0, passing: 0 },
            e2eTests: { created: 0, passing: 0 },
            coverage: 0
          },
          performanceMetrics: { loadTime: 0, renderTime: 0, memoryUsage: 0 }
        },
        contracts: { active: [], completed: [] },
        issues: []
      }
    }
  }

  async saveComponentState(
    componentName: string,
    state: ComponentState
  ): Promise<void> {
    await this.ensureStateDirectory()
    
    const stateFile = path.join(this.stateDir, `${componentName}.yaml`)
    const yamlContent = yaml.dump(state, { 
      indent: 2,
      lineWidth: 120,
      noRefs: true
    })
    
    await fs.writeFile(stateFile, yamlContent, 'utf-8')
  }

  async getAllComponentStates(): Promise<Record<string, ComponentState>> {
    await this.ensureStateDirectory()
    
    const stateFiles = await fs.readdir(this.stateDir)
    const states: Record<string, ComponentState> = {}
    
    for (const file of stateFiles) {
      if (file.endsWith('.yaml')) {
        const componentName = path.basename(file, '.yaml')
        states[componentName] = await this.getComponentState(componentName)
      }
    }
    
    return states
  }

  async generateComponentReport(): Promise<string> {
    const states = await this.getAllComponentStates()
    const components = Object.values(states)
    
    const report = `# POWLAX Component State Report

**Generated:** ${new Date().toISOString()}  
**Total Components:** ${components.length}

## Status Overview

${this.generateStatusSummary(components)}

## Quality Overview

${this.generateQualitySummary(components)}

## Database Usage Overview

${this.generateDatabaseSummary(components)}

## Issues Overview

${this.generateIssuesSummary(components)}

## Component Details

${components.map(comp => this.generateComponentSummary(comp)).join('\n\n')}
`

    return report
  }

  private generateStatusSummary(components: ComponentState[]): string {
    const statusCounts = components.reduce((acc, comp) => {
      acc[comp.metadata.status] = (acc[comp.metadata.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(statusCounts)
      .map(([status, count]) => `- **${status}:** ${count}`)
      .join('\n')
  }

  private generateQualitySummary(components: ComponentState[]): string {
    const avgScore = components.reduce((sum, comp) => sum + comp.quality.currentScore, 0) / components.length
    const highQuality = components.filter(comp => comp.quality.currentScore >= 80).length
    const needsWork = components.filter(comp => comp.quality.currentScore < 60).length

    return `- **Average Quality Score:** ${Math.round(avgScore)}/100
- **High Quality (80+):** ${highQuality} components
- **Needs Work (<60):** ${needsWork} components`
  }

  private generateDatabaseSummary(components: ComponentState[]): string {
    const allTables = new Set<string>()
    components.forEach(comp => {
      comp.database.primaryTables.forEach(table => {
        allTables.add(table.tableName)
      })
    })

    const tableUsage = Array.from(allTables).map(tableName => {
      const usage = components.filter(comp => 
        comp.database.primaryTables.some(table => table.tableName === tableName)
      ).length
      return `- **${tableName}:** Used by ${usage} components`
    }).join('\n')

    return `**Tables Referenced:** ${allTables.size}\n\n${tableUsage}`
  }

  private generateIssuesSummary(components: ComponentState[]): string {
    const allIssues = components.flatMap(comp => comp.issues)
    const criticalIssues = allIssues.filter(issue => issue.severity === 'CRITICAL').length
    const highIssues = allIssues.filter(issue => issue.severity === 'HIGH').length

    return `- **Total Issues:** ${allIssues.length}
- **Critical:** ${criticalIssues}
- **High Priority:** ${highIssues}`
  }

  private generateComponentSummary(component: ComponentState): string {
    return `### ${component.metadata.name}

- **Status:** ${component.metadata.status}
- **Quality Score:** ${component.quality.currentScore}/100
- **Database Tables:** ${component.database.primaryTables.map(t => t.tableName).join(', ')}
- **Issues:** ${component.issues.length}
- **Last Modified:** ${new Date(component.metadata.lastModified).toLocaleDateString()}`
  }

  private incrementVersion(version: string): string {
    const parts = version.split('.')
    const patch = parseInt(parts[2] || '0') + 1
    return `${parts[0]}.${parts[1]}.${patch}`
  }

  async addContractToComponent(
    componentName: string,
    contractId: string,
    contractType: string
  ): Promise<void> {
    const state = await this.getComponentState(componentName)
    
    state.contracts.active.push({
      id: contractId,
      type: contractType,
      createdAt: new Date().toISOString(),
      status: 'active'
    })
    
    await this.saveComponentState(componentName, state)
  }

  async completeContractForComponent(
    componentName: string,
    contractId: string,
    result: string,
    qualityScore: number
  ): Promise<void> {
    const state = await this.getComponentState(componentName)
    
    // Move from active to completed
    const activeIndex = state.contracts.active.findIndex(c => c.id === contractId)
    if (activeIndex >= 0) {
      const contract = state.contracts.active[activeIndex]
      state.contracts.active.splice(activeIndex, 1)
      
      state.contracts.completed.push({
        id: contract.id,
        type: contract.type,
        completedAt: new Date().toISOString(),
        result,
        qualityScore
      })
    }
    
    await this.saveComponentState(componentName, state)
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2)
  const stateManager = new ComponentStateManager()

  try {
    if (args.includes('--report')) {
      const report = await stateManager.generateComponentReport()
      console.log(report)
    } else if (args.includes('--list')) {
      const states = await stateManager.getAllComponentStates()
      console.log('📊 Component States:')
      Object.entries(states).forEach(([name, state]) => {
        console.log(`   ${name}: ${state.metadata.status} (Score: ${state.quality.currentScore}/100)`)
      })
    } else if (args.includes('--component') && args[args.indexOf('--component') + 1]) {
      const componentName = args[args.indexOf('--component') + 1]
      const state = await stateManager.getComponentState(componentName)
      console.log(yaml.dump(state, { indent: 2 }))
    } else {
      console.log('Usage:')
      console.log('  --report     Generate component report')
      console.log('  --list       List all components')
      console.log('  --component <name>  Show specific component state')
    }
  } catch (error) {
    console.error('❌ State manager failed:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

export { ComponentStateManager, ComponentState }
