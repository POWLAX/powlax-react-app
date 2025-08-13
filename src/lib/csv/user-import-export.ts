import { supabase } from '@/lib/supabase'

export interface CSVUser {
  email: string
  display_name?: string
  roles?: string
  teams?: string
  clubs?: string
  membership_products?: string
  phone?: string
  bio?: string
}

export interface ImportOptions {
  updateExisting: boolean
  createNew: boolean
  validateEmails: boolean
  assignDefaultRole?: string
  dryRun?: boolean
}

export interface ExportOptions {
  includeRoles: boolean
  includeMemberships: boolean
  includeTeams: boolean
  includeActivity: boolean
  includePersonalInfo: boolean
  userIds?: string[]
}

export interface ImportValidationError {
  row: number
  field: string
  value: string
  error: string
}

export interface ImportPreviewUser {
  row: number
  email: string
  display_name?: string
  roles: string[]
  teams: string[]
  membership_products: string[]
  action: 'create' | 'update' | 'skip'
  existingUser?: {
    id: string
    email: string
    display_name?: string
    roles: string[]
  }
  validationErrors: ImportValidationError[]
}

export interface ImportResult {
  success: boolean
  totalRows: number
  processed: number
  created: number
  updated: number
  skipped: number
  errors: Array<{
    row: number
    email: string
    error: string
  }>
}

export interface PreviewResult {
  users: ImportPreviewUser[]
  validationErrors: ImportValidationError[]
  summary: {
    totalRows: number
    toCreate: number
    toUpdate: number
    toSkip: number
    hasErrors: boolean
  }
}

export class UserCSVProcessor {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  private static readonly CSV_HEADERS = [
    'email',
    'display_name',
    'roles',
    'teams',
    'clubs',
    'membership_products',
    'phone',
    'bio'
  ]

  static parseCSV(csvContent: string): CSVUser[] {
    const lines = csvContent.trim().split('\n')
    if (lines.length < 2) {
      throw new Error('CSV file must contain at least a header row and one data row')
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    const users: CSVUser[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i])
      if (values.length !== headers.length) {
        console.warn(`Row ${i + 1}: Column count mismatch. Expected ${headers.length}, got ${values.length}`)
      }

      const user: Partial<CSVUser> = {}
      
      headers.forEach((header, index) => {
        const value = values[index]?.trim()
        if (value) {
          switch (header) {
            case 'email':
              user.email = value
              break
            case 'display_name':
            case 'name':
              user.display_name = value
              break
            case 'roles':
            case 'role':
              user.roles = value
              break
            case 'teams':
            case 'team':
              user.teams = value
              break
            case 'clubs':
            case 'club':
              user.clubs = value
              break
            case 'membership_products':
            case 'memberships':
            case 'membership':
              user.membership_products = value
              break
            case 'phone':
              user.phone = value
              break
            case 'bio':
              user.bio = value
              break
          }
        }
      })

      if (user.email) {
        users.push(user as CSVUser)
      }
    }

    return users
  }

  private static parseCSVLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current)
        current = ''
      } else {
        current += char
      }
    }
    
    result.push(current)
    return result
  }

  static validateUser(user: CSVUser, row: number): ImportValidationError[] {
    const errors: ImportValidationError[] = []

    // Validate email
    if (!user.email) {
      errors.push({
        row,
        field: 'email',
        value: '',
        error: 'Email is required'
      })
    } else if (!this.EMAIL_REGEX.test(user.email)) {
      errors.push({
        row,
        field: 'email',
        value: user.email,
        error: 'Invalid email format'
      })
    }

    // Validate roles format
    if (user.roles) {
      const roles = user.roles.split(';').map(r => r.trim()).filter(r => r)
      const validRoles = ['administrator', 'club_director', 'team_coach', 'player', 'parent']
      
      for (const role of roles) {
        if (!validRoles.includes(role)) {
          errors.push({
            row,
            field: 'roles',
            value: role,
            error: `Invalid role: ${role}. Valid roles: ${validRoles.join(', ')}`
          })
        }
      }
    }

    // Validate phone format (basic)
    if (user.phone && !/^\+?[\d\s-()]+$/.test(user.phone)) {
      errors.push({
        row,
        field: 'phone',
        value: user.phone,
        error: 'Invalid phone number format'
      })
    }

    return errors
  }

  static async previewImport(csvContent: string, options: ImportOptions): Promise<PreviewResult> {
    try {
      const csvUsers = this.parseCSV(csvContent)
      const users: ImportPreviewUser[] = []
      const validationErrors: ImportValidationError[] = []

      // Get existing users for comparison
      const { data: existingUsers, error } = await supabase
        .from('users')
        .select('id, email, display_name, roles')

      if (error) {
        throw new Error(`Failed to fetch existing users: ${error.message}`)
      }

      const existingUserMap = new Map(
        existingUsers?.map(user => [user.email.toLowerCase(), user]) || []
      )

      for (let i = 0; i < csvUsers.length; i++) {
        const csvUser = csvUsers[i]
        const row = i + 2 // Account for 0-based index and header row

        // Validate user data
        const userValidationErrors = this.validateUser(csvUser, row)
        validationErrors.push(...userValidationErrors)

        // Determine action
        const existingUser = existingUserMap.get(csvUser.email.toLowerCase())
        let action: 'create' | 'update' | 'skip' = 'skip'
        let existingUserData: { id: string; email: string; display_name?: string; roles: string[]; } | undefined = undefined

        if (existingUser) {
          existingUserData = {
            id: existingUser.id,
            email: existingUser.email,
            display_name: existingUser.display_name,
            roles: existingUser.roles || []
          }
          if (options.updateExisting) {
            action = 'update'
          }
        } else {
          if (options.createNew) {
            action = 'create'
          }
        }

        // Parse arrays
        const roles = csvUser.roles 
          ? csvUser.roles.split(';').map(r => r.trim()).filter(r => r)
          : options.assignDefaultRole ? [options.assignDefaultRole] : []
        
        const teams = csvUser.teams 
          ? csvUser.teams.split(';').map(t => t.trim()).filter(t => t)
          : []
        
        const membershipProducts = csvUser.membership_products 
          ? csvUser.membership_products.split(';').map(m => m.trim()).filter(m => m)
          : []

        users.push({
          row,
          email: csvUser.email,
          display_name: csvUser.display_name,
          roles,
          teams,
          membership_products: membershipProducts,
          action,
          existingUser: existingUserData,
          validationErrors: userValidationErrors
        })
      }

      const summary = {
        totalRows: users.length,
        toCreate: users.filter(u => u.action === 'create').length,
        toUpdate: users.filter(u => u.action === 'update').length,
        toSkip: users.filter(u => u.action === 'skip').length,
        hasErrors: validationErrors.length > 0
      }

      return {
        users,
        validationErrors,
        summary
      }
    } catch (error) {
      console.error('CSV preview failed:', error)
      throw error
    }
  }

  static async importUsers(csvContent: string, options: ImportOptions): Promise<ImportResult> {
    if (options.dryRun) {
      const preview = await this.previewImport(csvContent, options)
      return {
        success: !preview.summary.hasErrors,
        totalRows: preview.summary.totalRows,
        processed: 0,
        created: 0,
        updated: 0,
        skipped: preview.summary.totalRows,
        errors: preview.validationErrors.map(error => ({
          row: error.row,
          email: 'N/A',
          error: `${error.field}: ${error.error}`
        }))
      }
    }

    try {
      const preview = await this.previewImport(csvContent, options)
      
      if (preview.summary.hasErrors) {
        throw new Error('CSV contains validation errors. Please fix them before importing.')
      }

      const result: ImportResult = {
        success: true,
        totalRows: preview.users.length,
        processed: 0,
        created: 0,
        updated: 0,
        skipped: 0,
        errors: []
      }

      // Process users in batches
      const batchSize = 5
      for (let i = 0; i < preview.users.length; i += batchSize) {
        const batch = preview.users.slice(i, i + batchSize)
        
        await Promise.all(batch.map(async (user) => {
          try {
            if (user.action === 'create') {
              await this.createUser(user)
              result.created++
            } else if (user.action === 'update') {
              await this.updateUser(user)
              result.updated++
            } else {
              result.skipped++
            }
            result.processed++
          } catch (error) {
            result.errors.push({
              row: user.row,
              email: user.email,
              error: (error as Error).message
            })
          }
        }))
      }

      result.success = result.errors.length === 0
      return result

    } catch (error) {
      console.error('CSV import failed:', error)
      throw error
    }
  }

  private static async createUser(user: ImportPreviewUser): Promise<void> {
    // Create user record
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        email: user.email,
        display_name: user.display_name,
        roles: user.roles
      })
      .select()
      .single()

    if (userError) {
      throw new Error(`Failed to create user: ${userError.message}`)
    }

    // Add team memberships if specified
    if (user.teams.length > 0) {
      await this.addTeamMemberships(userData.id, user.teams)
    }

    // Add membership products if specified
    if (user.membership_products.length > 0) {
      await this.addMembershipProducts(userData.id, user.membership_products)
    }
  }

  private static async updateUser(user: ImportPreviewUser): Promise<void> {
    if (!user.existingUser) {
      throw new Error('Cannot update: existing user not found')
    }

    // Update user record
    const { error: userError } = await supabase
      .from('users')
      .update({
        display_name: user.display_name || user.existingUser.display_name,
        roles: user.roles.length > 0 ? user.roles : user.existingUser.roles
      })
      .eq('id', user.existingUser.id)

    if (userError) {
      throw new Error(`Failed to update user: ${userError.message}`)
    }

    // Add team memberships if specified
    if (user.teams.length > 0) {
      await this.addTeamMemberships(user.existingUser.id, user.teams)
    }

    // Add membership products if specified
    if (user.membership_products.length > 0) {
      await this.addMembershipProducts(user.existingUser.id, user.membership_products)
    }
  }

  private static async addTeamMemberships(userId: string, teamNames: string[]): Promise<void> {
    // Get team IDs by name
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('id, name')
      .in('name', teamNames)

    if (teamsError) {
      throw new Error(`Failed to find teams: ${teamsError.message}`)
    }

    const foundTeamIds = teams?.map(t => t.id) || []
    
    if (foundTeamIds.length !== teamNames.length) {
      const foundNames = teams?.map(t => t.name) || []
      const notFound = teamNames.filter(name => !foundNames.includes(name))
      console.warn(`Teams not found: ${notFound.join(', ')}`)
    }

    // Create team memberships
    if (foundTeamIds.length > 0) {
      const memberships = foundTeamIds.map(teamId => ({
        user_id: userId,
        team_id: teamId
      }))

      const { error: membershipError } = await supabase
        .from('team_members')
        .upsert(memberships, { onConflict: 'user_id,team_id' })

      if (membershipError) {
        throw new Error(`Failed to create team memberships: ${membershipError.message}`)
      }
    }
  }

  private static async addMembershipProducts(userId: string, productNames: string[]): Promise<void> {
    // Get product IDs by name
    const { data: products, error: productsError } = await supabase
      .from('membership_products')
      .select('id, name')
      .in('name', productNames)

    if (productsError) {
      throw new Error(`Failed to find membership products: ${productsError.message}`)
    }

    const foundProductIds = products?.map(p => p.id) || []
    
    if (foundProductIds.length !== productNames.length) {
      const foundNames = products?.map(p => p.name) || []
      const notFound = productNames.filter(name => !foundNames.includes(name))
      console.warn(`Membership products not found: ${notFound.join(', ')}`)
    }

    // Create membership entitlements
    if (foundProductIds.length > 0) {
      const entitlements = foundProductIds.map(productId => ({
        user_id: userId,
        membership_product_id: productId,
        granted_at: new Date().toISOString(),
        is_active: true
      }))

      const { error: entitlementError } = await supabase
        .from('membership_entitlements')
        .upsert(entitlements, { onConflict: 'user_id,membership_product_id' })

      if (entitlementError) {
        throw new Error(`Failed to create membership entitlements: ${entitlementError.message}`)
      }
    }
  }

  static async exportUsers(options: ExportOptions): Promise<string> {
    try {
      // Build query based on options
      let query = supabase
        .from('users')
        .select(`
          id,
          email,
          display_name,
          created_at,
          last_sign_in_at,
          ${options.includePersonalInfo ? 'phone, bio,' : ''}
          ${options.includeRoles ? 'roles,' : ''}
          ${options.includeTeams ? `
            team_members(
              teams(name),
              role_in_team
            ),
          ` : ''}
          ${options.includeMemberships ? `
            membership_entitlements(
              membership_products(name)
            ),
          ` : ''}
          ${options.includeActivity ? `
            user_points_wallets(
              balance,
              powlax_points_currencies(name)
            ),
            user_badges(
              badge_name
            ),
          ` : ''}
        `)

      if (options.userIds && options.userIds.length > 0) {
        query = query.in('id', options.userIds)
      }

      const { data: users, error } = await query.order('created_at', { ascending: false })

      if (error) {
        throw new Error(`Failed to fetch users for export: ${error.message}`)
      }

      // Build CSV headers
      const headers = ['email', 'display_name', 'created_at', 'last_sign_in_at']
      
      if (options.includePersonalInfo) {
        headers.push('phone', 'bio')
      }
      
      if (options.includeRoles) {
        headers.push('roles')
      }
      
      if (options.includeTeams) {
        headers.push('teams', 'team_roles')
      }
      
      if (options.includeMemberships) {
        headers.push('membership_products')
      }
      
      if (options.includeActivity) {
        headers.push('points_balance', 'badges')
      }

      // Build CSV content
      const csvLines = [headers.join(',')]

      users?.forEach(user => {
        const row = [
          this.escapeCsvValue(user.email),
          this.escapeCsvValue(user.display_name || ''),
          this.escapeCsvValue(user.created_at),
          this.escapeCsvValue(user.last_sign_in_at || '')
        ]

        if (options.includePersonalInfo) {
          row.push(
            this.escapeCsvValue((user as any).phone || ''),
            this.escapeCsvValue((user as any).bio || '')
          )
        }

        if (options.includeRoles) {
          const roles = (user.roles || []).join(';')
          row.push(this.escapeCsvValue(roles))
        }

        if (options.includeTeams) {
          const teamData = (user as any).team_members || []
          const teams = teamData.map((tm: any) => tm.teams?.name).filter(Boolean).join(';')
          const teamRoles = teamData.map((tm: any) => tm.role_in_team).filter(Boolean).join(';')
          row.push(this.escapeCsvValue(teams), this.escapeCsvValue(teamRoles))
        }

        if (options.includeMemberships) {
          const membershipData = (user as any).membership_entitlements || []
          const products = membershipData
            .map((me: any) => me.membership_products?.name)
            .filter(Boolean)
            .join(';')
          row.push(this.escapeCsvValue(products))
        }

        if (options.includeActivity) {
          const pointsData = (user as any).user_points_wallets || []
          const totalBalance = pointsData.reduce((sum: number, wallet: any) => sum + (wallet.balance || 0), 0)
          
          const badgesData = (user as any).user_badges || []
          const badges = badgesData.map((badge: any) => badge.badge_name).join(';')
          
          row.push(
            this.escapeCsvValue(totalBalance.toString()),
            this.escapeCsvValue(badges)
          )
        }

        csvLines.push(row.join(','))
      })

      return csvLines.join('\n')

    } catch (error) {
      console.error('User export failed:', error)
      throw error
    }
  }

  private static escapeCsvValue(value: string): string {
    if (typeof value !== 'string') {
      value = String(value)
    }
    
    // If the value contains commas, quotes, or newlines, wrap it in quotes
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      // Escape any existing quotes by doubling them
      const escaped = value.replace(/"/g, '""')
      return `"${escaped}"`
    }
    
    return value
  }

  static generateSampleCSV(): string {
    const headers = ['email', 'display_name', 'roles', 'teams', 'membership_products']
    const sampleData = [
      ['coach@example.com', 'John Coach', 'team_coach', 'Varsity Team', 'Coach Access'],
      ['player1@example.com', 'Jane Player', 'player', 'Varsity Team', 'Academy Access'],
      ['parent@example.com', 'Mike Parent', 'parent', '', 'Parent Access'],
      ['admin@example.com', 'Admin User', 'administrator', '', 'Full Access']
    ]

    const csvLines = [headers.join(',')]
    sampleData.forEach(row => {
      csvLines.push(row.map(value => this.escapeCsvValue(value)).join(','))
    })

    return csvLines.join('\n')
  }
}

export default UserCSVProcessor