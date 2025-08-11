// COLUMN MAPPERS FOR DATABASE SCHEMA MISMATCHES
// 🚨 These functions transform database records to match expected interface contracts

import { 
  PowerlaxDrill, 
  UserDrill, 
  PowerlaxStrategy, 
  UserStrategy, 
  DatabaseUser, 
  DatabaseTeam, 
  DatabasePractice 
} from '@/types/database'

// ============================================================================
// DRILL MAPPERS
// ============================================================================

export interface LegacyDrillInterface {
  id: string
  name: string // WRONG - should be 'title'
  duration: number // WRONG - should be 'duration_minutes'
  category: string
  subcategory?: string
  strategies?: string[]
  concepts?: string[]
  skills?: string[]
  videoUrl?: string
  notes?: string
  source: 'powlax' | 'user'
}

/**
 * Maps PowerlaxDrill database record to legacy drill interface
 */
export function mapPowlaxDrillToLegacy(drill: PowerlaxDrill): LegacyDrillInterface {
  return {
    id: drill.id,
    name: drill.title, // 🚨 CRITICAL MAPPING: title -> name
    duration: drill.duration_minutes, // 🚨 CRITICAL MAPPING: duration_minutes -> duration
    category: drill.category,
    subcategory: drill.category,
    strategies: extractStrategiesFromDrill(drill),
    concepts: extractConceptsFromGameStates(drill.game_states),
    skills: extractSkillsFromCategory(drill.category),
    videoUrl: drill.video_url || undefined,
    notes: drill.notes || undefined,
    source: 'powlax'
  }
}

/**
 * Maps UserDrill database record to legacy drill interface
 */
export function mapUserDrillToLegacy(drill: UserDrill): LegacyDrillInterface {
  return {
    id: `user-${drill.id}`,
    name: drill.name || drill.title || 'Unnamed Custom Drill', // User drills already use 'name'
    duration: parseDuration(drill.drill_duration) || 10,
    category: 'Custom Drills',
    subcategory: drill.drill_category || undefined,
    strategies: extractStrategiesFromDrill(drill),
    concepts: extractConceptsFromGameStates(drill.game_states),
    skills: extractSkillsFromCategory(drill.drill_category),
    videoUrl: drill.vimeo_url || drill.drill_video_url || undefined,
    notes: drill.drill_notes || drill.content || undefined,
    source: 'user'
  }
}

// ============================================================================
// STRATEGY MAPPERS
// ============================================================================

export interface LegacyStrategyInterface {
  id: string
  name: string // WRONG - should be 'strategy_name'
  strategy_categories?: string
  description?: string
  vimeo_link?: string
  source: 'powlax' | 'user'
}

/**
 * Maps PowerlaxStrategy database record to legacy strategy interface
 */
export function mapPowlaxStrategyToLegacy(strategy: PowerlaxStrategy): LegacyStrategyInterface {
  return {
    id: strategy.id.toString(), // 🚨 CRITICAL: Convert number to string for consistency
    name: strategy.strategy_name, // 🚨 CRITICAL MAPPING: strategy_name -> name
    strategy_categories: strategy.strategy_categories || undefined,
    description: strategy.description || undefined,
    vimeo_link: strategy.vimeo_link || undefined,
    source: 'powlax'
  }
}

/**
 * Maps UserStrategy database record to legacy strategy interface
 */
export function mapUserStrategyToLegacy(strategy: UserStrategy): LegacyStrategyInterface {
  return {
    id: `user-${strategy.id}`,
    name: strategy.strategy_name, // Already correct for user strategies
    strategy_categories: strategy.strategy_categories || undefined,
    description: strategy.description || undefined,
    vimeo_link: strategy.vimeo_link || undefined,
    source: 'user'
  }
}

// ============================================================================
// USER MAPPERS
// ============================================================================

export interface LegacyUserInterface {
  id: string
  email: string
  full_name: string // WRONG - should be 'display_name'
  role: string
  roles: string[]
}

/**
 * Maps DatabaseUser to legacy user interface
 */
export function mapDatabaseUserToLegacy(user: DatabaseUser): LegacyUserInterface {
  return {
    id: user.id,
    email: user.email,
    full_name: user.display_name, // 🚨 CRITICAL MAPPING: display_name -> full_name
    role: user.role,
    roles: user.roles || []
  }
}

// ============================================================================
// TEAM MAPPERS
// ============================================================================

export interface LegacyTeamInterface {
  id: string
  organization_id?: string // WRONG - should be 'club_id'
  name: string
  slug?: string
  team_type?: string
}

/**
 * Maps DatabaseTeam to legacy team interface
 */
export function mapDatabaseTeamToLegacy(team: DatabaseTeam): LegacyTeamInterface {
  return {
    id: team.id,
    organization_id: team.club_id || undefined, // 🚨 CRITICAL MAPPING: club_id -> organization_id
    name: team.name,
    slug: team.slug || undefined,
    team_type: team.team_type || undefined
  }
}

// ============================================================================
// PRACTICE MAPPERS
// ============================================================================

export interface LegacyPracticeInterface {
  id: string
  user_id: string // WRONG - should be 'coach_id'
  team_id?: string
  name: string
  duration_minutes: number
}

/**
 * Maps DatabasePractice to legacy practice interface
 */
export function mapDatabasePracticeToLegacy(practice: DatabasePractice): LegacyPracticeInterface {
  return {
    id: practice.id,
    user_id: practice.coach_id, // 🚨 CRITICAL MAPPING: coach_id -> user_id
    team_id: practice.team_id || undefined,
    name: practice.name,
    duration_minutes: practice.duration_minutes
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function extractStrategiesFromDrill(drill: any): string[] {
  const strategies: string[] = []
  
  // Extract from game_states
  if (drill.game_states && Array.isArray(drill.game_states)) {
    drill.game_states.forEach((state: string) => {
      if (state.includes('offensive')) strategies.push('Offense')
      if (state.includes('defense')) strategies.push('Defense')
      if (state.includes('transition')) strategies.push('Transition')
    })
  }
  
  return strategies.filter((v, i, a) => a.indexOf(v) === i)
}

function extractConceptsFromGameStates(gameStates: any): string[] {
  if (!gameStates || !Array.isArray(gameStates)) return []
  
  const concepts: string[] = []
  gameStates.forEach(state => {
    if (state.includes('settled')) concepts.push('Settled Play')
    if (state.includes('transition')) concepts.push('Transition')
  })
  
  return concepts.filter((v, i, a) => a.indexOf(v) === i)
}

function extractSkillsFromCategory(category?: string | null): string[] {
  if (!category) return []
  
  const skills: string[] = []
  const lowerCategory = category.toLowerCase()
  
  if (lowerCategory.includes('1v1')) {
    skills.push('Dodging', 'Defense')
  }
  if (lowerCategory.includes('shooting')) {
    skills.push('Shooting')
  }
  if (lowerCategory.includes('passing')) {
    skills.push('Passing', 'Catching')
  }
  
  return skills
}

function parseDuration(durationText: string | null): number {
  if (!durationText) return 10
  
  const match = durationText.match(/\d+/)
  return match ? parseInt(match[0], 10) : 10
}

// ============================================================================
// BACKWARD COMPATIBILITY EXPORTS
// ============================================================================

/**
 * Use these functions in existing hooks to maintain compatibility
 * while fixing the underlying database column mismatches
 */
export const columnMappers = {
  drill: {
    powlaxToLegacy: mapPowlaxDrillToLegacy,
    userToLegacy: mapUserDrillToLegacy
  },
  strategy: {
    powlaxToLegacy: mapPowlaxStrategyToLegacy,
    userToLegacy: mapUserStrategyToLegacy
  },
  user: {
    databaseToLegacy: mapDatabaseUserToLegacy
  },
  team: {
    databaseToLegacy: mapDatabaseTeamToLegacy
  },
  practice: {
    databaseToLegacy: mapDatabasePracticeToLegacy
  }
}