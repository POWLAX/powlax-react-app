import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

async function checkDrillFields() {
  // Check the skills_academy_drill_library table structure
  const { data: drills, error } = await supabase
    .from('skills_academy_drill_library')
    .select('*')
    .limit(1)

  if (drills && drills.length > 0) {
    console.log('Skills Academy Drill Library fields:')
    console.log(Object.keys(drills[0]))
    console.log('\nSample drill:')
    console.log(JSON.stringify(drills[0], null, 2))
  }
}

checkDrillFields()
