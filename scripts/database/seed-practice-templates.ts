import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { practiceTemplates } from '../../src/data/practice-templates'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

// Convert existing templates to new database format
function convertTemplate(template: any) {
  return {
    name: template.name,
    description: template.description,
    age_group: template.ageGroup === '15-18' ? '15+' : template.ageGroup,
    duration_minutes: template.duration,
    category: mapCategory(template.focus),
    drill_sequence: {
      timeSlots: template.timeSlots,
      focus: template.focus,
      difficulty: template.difficulty
    },
    coaching_tips: template.coachingTips || [],
    equipment_needed: template.equipment || [],
    is_public: true,
    is_official: true, // Mark as POWLAX official templates
    tags: template.focus || []
  }
}

function mapCategory(focus: string[]): string {
  if (focus.includes('Fundamentals')) return 'fundamentals'
  if (focus.includes('Conditioning')) return 'conditioning'
  if (focus.includes('Game Prep')) return 'game_prep'
  if (focus.includes('Team Building')) return 'team_building'
  if (focus.includes('Tryout')) return 'tryout'
  if (focus.includes('Advanced')) return 'advanced_tactics'
  return 'skill_development'
}

async function seedTemplates() {
  console.log('🌱 Seeding practice templates...\n')
  
  // Check if templates already exist
  const { data: existing, error: checkError } = await supabase
    .from('practice_templates')
    .select('id')
    .eq('is_official', true)
    .limit(1)
  
  if (existing && existing.length > 0) {
    console.log('⚠️  Official templates already exist. Skipping seed.')
    return
  }
  
  // Convert and insert templates
  const templatesToInsert = practiceTemplates.map(convertTemplate)
  
  console.log(`📝 Inserting ${templatesToInsert.length} practice templates...`)
  
  const { data, error } = await supabase
    .from('practice_templates')
    .insert(templatesToInsert)
    .select()
  
  if (error) {
    console.error('❌ Error seeding templates:', error)
    return
  }
  
  console.log(`✅ Successfully seeded ${data?.length || 0} practice templates!`)
  
  // Display summary
  console.log('\n📊 Template Summary:')
  const ageGroups = ['8-10', '11-14', '15+']
  for (const age of ageGroups) {
    const count = data?.filter(t => t.age_group === age).length || 0
    console.log(`  ${age} years: ${count} templates`)
  }
}

// Also seed some sample data for testing save/load
async function seedSamplePracticePlan() {
  console.log('\n📋 Creating sample practice plan...')
  
  // Get a user to assign as owner (using service role key)
  const { data: users } = await supabase
    .from('user_profiles')
    .select('user_id')
    .limit(1)
  
  if (!users || users.length === 0) {
    console.log('⚠️  No users found. Skipping sample practice plan.')
    return
  }
  
  const userId = users[0].user_id
  
  const samplePlan = {
    title: 'Sample Practice - Fundamentals',
    user_id: userId,
    practice_date: new Date().toISOString().split('T')[0],
    start_time: '16:00:00',
    duration_minutes: 90,
    field_type: 'turf',
    setup_time: 15,
    setup_notes: 'Set up cones for stations, prepare balls and pinnies',
    practice_notes: 'Focus on stick skills and ground balls today',
    drill_sequence: {
      timeSlots: [
        {
          id: 'slot-1',
          drills: [
            {
              id: 'warmup-1',
              name: 'Dynamic Warm-Up',
              duration: 10,
              category: 'warm-up'
            }
          ],
          duration: 10
        },
        {
          id: 'slot-2',
          drills: [
            {
              id: 'skill-1',
              name: 'Partner Passing',
              duration: 15,
              category: 'skill'
            }
          ],
          duration: 15
        }
      ]
    },
    template: false,
    is_draft: false
  }
  
  const { data, error } = await supabase
    .from('practice_plans')
    .insert([samplePlan])
    .select()
  
  if (error) {
    console.error('❌ Error creating sample practice plan:', error)
  } else {
    console.log('✅ Sample practice plan created successfully!')
  }
}

async function main() {
  console.log('🚀 POWLAX Practice Templates Seeder\n')
  console.log('================================\n')
  
  await seedTemplates()
  await seedSamplePracticePlan()
  
  console.log('\n✨ Seeding complete!')
}

main()