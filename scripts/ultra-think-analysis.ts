import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function performUltraThinkAnalysis() {
  console.log('🧠 ULTRA THINK ANALYSIS - Skills Academy Deep Dive\n')
  console.log('=' .repeat(60))
  
  // 1. DATABASE SCHEMA ANALYSIS
  console.log('\n📊 DATABASE SCHEMA ANALYSIS\n')
  
  // Check skills_academy_drills structure
  const { data: drillSample, error: drillError } = await supabase
    .from('skills_academy_drills')
    .select('*')
    .limit(1)
  
  if (drillSample && drillSample[0]) {
    console.log('Skills Academy Drills Table Columns:')
    Object.keys(drillSample[0]).forEach(col => {
      const value = drillSample[0][col]
      const type = value === null ? 'null' : typeof value
      console.log(`  - ${col}: ${type}`)
    })
  }
  
  // Check for video fields specifically
  const { data: videoCheck } = await supabase
    .from('skills_academy_drills')
    .select('*')
    .or('video_url.not.is.null,vimeo_id.not.is.null,video_link.not.is.null')
    .limit(5)
  
  console.log(`\nDrills with video data: ${videoCheck?.length || 0}`)
  
  if (videoCheck && videoCheck.length > 0) {
    console.log('Sample video data:')
    videoCheck.slice(0, 2).forEach((drill, i) => {
      console.log(`  Drill ${i + 1}:`)
      console.log(`    - name: ${drill.name || drill.drill_name || 'N/A'}`)
      console.log(`    - video_url: ${drill.video_url || 'N/A'}`)
      console.log(`    - vimeo_id: ${drill.vimeo_id || 'N/A'}`)
      console.log(`    - video_link: ${drill.video_link || 'N/A'}`)
    })
  }
  
  // 2. WORKOUT CONNECTION ANALYSIS
  console.log('\n🔗 WORKOUT-DRILL CONNECTION ANALYSIS\n')
  
  const { data: workouts } = await supabase
    .from('skills_academy_workouts')
    .select('id, workout_name, drill_ids, drill_count')
    .limit(5)
  
  console.log(`Sample workouts (${workouts?.length || 0}):`)
  workouts?.forEach(w => {
    console.log(`  - ${w.workout_name}`)
    console.log(`    ID: ${w.id}`)
    console.log(`    Drill count: ${w.drill_count}`)
    console.log(`    Drill IDs array: ${w.drill_ids ? `[${w.drill_ids.length} items]` : 'NULL'}`)
    if (w.drill_ids && w.drill_ids.length > 0) {
      console.log(`    First 3 IDs: ${w.drill_ids.slice(0, 3).join(', ')}`)
    }
  })
  
  // 3. FILE DEPENDENCY ANALYSIS
  console.log('\n📁 FILE DEPENDENCY ANALYSIS\n')
  
  const criticalFiles = [
    'src/app/(authenticated)/skills-academy/workout/[id]/page.tsx',
    'src/hooks/useSkillsAcademyWorkouts.ts',
    'src/components/skills-academy/SkillsAcademyHubEnhanced.tsx',
    'src/app/(authenticated)/layout.tsx'
  ]
  
  for (const file of criticalFiles) {
    const fullPath = path.join(process.cwd(), file)
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8')
      const lines = content.split('\n')
      
      // Find imports
      const imports = lines.filter(line => line.includes('import'))
      const framerImports = imports.filter(line => line.includes('framer-motion'))
      const supabaseImports = imports.filter(line => line.includes('supabase'))
      const radixImports = imports.filter(line => line.includes('@radix-ui'))
      
      console.log(`${file}:`)
      console.log(`  Total imports: ${imports.length}`)
      console.log(`  Framer-motion: ${framerImports.length > 0 ? '❌ YES' : '✅ NO'}`)
      console.log(`  Supabase: ${supabaseImports.length > 0 ? 'YES' : 'NO'}`)
      console.log(`  Radix UI: ${radixImports.length > 0 ? 'YES' : 'NO'}`)
      
      if (framerImports.length > 0) {
        console.log(`  Framer imports found:`)
        framerImports.slice(0, 2).forEach(imp => {
          const lineNum = lines.indexOf(imp) + 1
          console.log(`    Line ${lineNum}: ${imp.trim()}`)
        })
      }
    }
  }
  
  // 4. WEBPACK VENDOR CHUNKS ANALYSIS
  console.log('\n⚙️ WEBPACK VENDOR CHUNKS ANALYSIS\n')
  
  const nextBuildPath = path.join(process.cwd(), '.next/server')
  if (fs.existsSync(nextBuildPath)) {
    const vendorChunksPath = path.join(nextBuildPath, 'vendor-chunks')
    if (fs.existsSync(vendorChunksPath)) {
      const chunks = fs.readdirSync(vendorChunksPath)
      console.log(`Found ${chunks.length} vendor chunks`)
      
      const criticalChunks = ['@radix-ui.js', '@supabase.js', 'framer-motion.js']
      criticalChunks.forEach(chunk => {
        const exists = chunks.includes(chunk)
        console.log(`  ${chunk}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`)
      })
    } else {
      console.log('❌ No vendor-chunks directory found')
    }
  } else {
    console.log('❌ No .next/server directory found')
  }
  
  // 5. RISK ASSESSMENT
  console.log('\n⚠️ RISK ASSESSMENT\n')
  
  const risks = []
  
  // Check package.json for framer-motion
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'))
  if (packageJson.dependencies['framer-motion']) {
    risks.push('HIGH: framer-motion still in package.json dependencies')
  }
  
  // Check for commented out imports
  for (const file of criticalFiles) {
    const fullPath = path.join(process.cwd(), file)
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8')
      if (content.includes('// import') && content.includes('framer-motion')) {
        risks.push(`MEDIUM: Commented framer-motion imports in ${file}`)
      }
    }
  }
  
  if (risks.length > 0) {
    console.log('Identified Risks:')
    risks.forEach((risk, i) => {
      console.log(`  ${i + 1}. ${risk}`)
    })
  } else {
    console.log('✅ No critical risks identified')
  }
  
  // 6. EXECUTION STRATEGY
  console.log('\n🎯 RECOMMENDED EXECUTION STRATEGY\n')
  
  console.log('Sequential Execution Required (NO PARALLELIZATION):')
  console.log('  Reason: Vendor chunk errors create cascading failures')
  console.log('  Reason: Framer-motion removal affects multiple components')
  console.log('  Reason: Database schema uncertainties need resolution first')
  
  console.log('\nExecution Order:')
  console.log('  1. Clean framer-motion (all 12 files)')
  console.log('  2. Fix webpack configuration')
  console.log('  3. Verify database schema')
  console.log('  4. Fix video component')
  console.log('  5. Run comprehensive tests')
  
  console.log('\n' + '=' .repeat(60))
  console.log('ULTRA THINK ANALYSIS COMPLETE')
}

performUltraThinkAnalysis().catch(console.error)