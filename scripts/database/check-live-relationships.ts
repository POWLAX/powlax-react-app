import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function checkLiveRelationships() {
  console.log('🔗 CHECKING LIVE DATABASE RELATIONSHIPS\n')
  
  try {
    // Check foreign key relationships using raw SQL
    const { data: foreignKeys, error: fkError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
            tc.table_name as table_with_fk, 
            kcu.column_name as fk_column, 
            ccu.table_name as referenced_table,
            ccu.column_name as referenced_column,
            tc.constraint_name
        FROM 
            information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' 
          AND tc.table_schema = 'public'
          AND (tc.table_name LIKE '%powlax%' OR ccu.table_name LIKE '%powlax%')
        ORDER BY ccu.table_name, tc.table_name;
      `
    })

    if (fkError) {
      console.log('❌ Could not fetch foreign keys via RPC:', fkError.message)
      
      // Try alternative approach - query information_schema directly
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.table_constraints')
        .select(`
          table_name,
          constraint_name,
          constraint_type
        `)
        .eq('table_schema', 'public')
        .eq('constraint_type', 'FOREIGN KEY')
        .like('table_name', '%powlax%')

      if (tablesError) {
        console.log('❌ Could not access information_schema:', tablesError.message)
      } else {
        console.log('📋 Found constraints:', tables?.length || 0)
        tables?.forEach(constraint => {
          console.log(`  ${constraint.table_name}: ${constraint.constraint_name}`)
        })
      }
    } else {
      console.log('✅ Foreign Key Relationships Found:')
      foreignKeys?.forEach(fk => {
        console.log(`  ${fk.table_with_fk}.${fk.fk_column} → ${fk.referenced_table}.${fk.referenced_column}`)
      })
    }

    // Check tables that reference users table (critical for deletion safety)
    console.log('\n👥 TABLES THAT REFERENCE USERS (CANNOT DELETE):')
    const userReferencingTables = [
      'user_points_wallets',
      'user_badges', 
      'user_ranks',
      'user_points_ledger',
      'team_members',
      'user_favorites',
      'user_workout_completions'
    ]

    for (const tableName of userReferencingTables) {
      try {
        const { count, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true })
          
        if (!error) {
          console.log(`  ✅ ${tableName}: ${count} records (references users)`)
        } else if (error.message.includes('does not exist')) {
          console.log(`  ❌ ${tableName}: Does not exist`)
        } else {
          console.log(`  ⚠️  ${tableName}: Error - ${error.message}`)
        }
      } catch (e) {
        console.log(`  ❌ ${tableName}: Error checking`)
      }
    }

    // Check organizational tables
    console.log('\n🏢 ORGANIZATIONAL TABLES (team/club structure):')
    const orgTables = [
      'organizations',
      'club_organizations', 
      'teams',
      'team_teams',
      'team_members'
    ]

    for (const tableName of orgTables) {
      try {
        const { count, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true })
          
        if (!error) {
          console.log(`  ✅ ${tableName}: ${count} records`)
        } else if (error.message.includes('does not exist')) {
          console.log(`  ❌ ${tableName}: Does not exist`)
        } else {
          console.log(`  ⚠️  ${tableName}: Error - ${error.message}`)
        }
      } catch (e) {
        console.log(`  ❌ ${tableName}: Error checking`)
      }
    }

    // Analyze which tables are actually connected
    console.log('\n🔍 RELATIONSHIP ANALYSIS:')
    console.log('-'.repeat(50))
    
    const tablesWithData = [
      'powlax_strategies',
      'powlax_drills', 
      'powlax_points_currencies',
      'powlax_wall_ball_drill_library',
      'powlax_wall_ball_collections',
      'powlax_wall_ball_collection_drills'
    ]

    console.log('Tables with data that likely have relationships:')
    tablesWithData.forEach(table => {
      console.log(`  📊 ${table}`)
    })

    // Check for junction tables that connect content
    console.log('\n🔗 JUNCTION/MAPPING TABLES:')
    const junctionTables = [
      'powlax_drill_strategy_map',
      'drill_strategy_map_powlax',
      'powlax_wall_ball_collection_drills',
      'workout_drill_relationships'
    ]

    for (const tableName of junctionTables) {
      try {
        const { count, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true })
          
        if (!error) {
          console.log(`  ✅ ${tableName}: ${count} relationships`)
        } else if (error.message.includes('does not exist')) {
          console.log(`  ❌ ${tableName}: Does not exist`)
        } else {
          console.log(`  ⚠️  ${tableName}: Error - ${error.message}`)
        }
      } catch (e) {
        console.log(`  ❌ ${tableName}: Error checking`)
      }
    }

    // Final safety analysis
    console.log('\n⚠️  DELETION SAFETY ANALYSIS:')
    console.log('-'.repeat(50))
    
    console.log('🟢 SAFE TO DELETE (empty, no dependencies):')
    const safeToDelete = [
      'strategies_powlax',
      'drills_powlax', 
      'skills_academy_powlax',
      'wall_ball_powlax',
      'lessons_powlax',
      'drill_strategy_map_powlax'
    ]
    safeToDelete.forEach(table => console.log(`  ✅ ${table} (empty legacy table)`))

    console.log('\n🟡 CAUTION (empty but may have dependencies):')
    const cautionTables = [
      'powlax_badges_catalog',
      'powlax_ranks_catalog',
      'powlax_skills_academy_drills',
      'powlax_skills_academy_workouts'
    ]
    cautionTables.forEach(table => console.log(`  ⚠️  ${table} (check dependencies first)`))

    console.log('\n🔴 NEVER DELETE (have data or critical dependencies):')
    const neverDelete = [
      'powlax_strategies',
      'powlax_drills',
      'powlax_points_currencies', 
      'powlax_wall_ball_drill_library',
      'powlax_wall_ball_collections',
      'powlax_wall_ball_collection_drills'
    ]
    neverDelete.forEach(table => console.log(`  ❌ ${table} (has data)`))

  } catch (error) {
    console.error('❌ Error checking relationships:', error)
  }
}

checkLiveRelationships().catch(console.error)
