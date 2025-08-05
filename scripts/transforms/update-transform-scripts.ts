import fs from 'fs'
import path from 'path'

// Update all transform scripts to use _powlax naming convention

const scriptsToUpdate = [
  'transform-strategies-csv.ts',
  'import-csv-to-supabase.ts',
  'csv-import.ts'
]

const tableNameMapping = {
  'wp_strategies': 'strategies_powlax',
  'wp_drills': 'drills_powlax',
  'staging_wp_drills': 'staging_drills_powlax',
  'staging_wp_strategies': 'staging_strategies_powlax',
  'staging_wp_academy_drills': 'staging_academy_drills_powlax',
  'staging_wp_wall_ball': 'staging_wall_ball_powlax',
  'staging_wp_lessons': 'staging_lessons_powlax',
  'staging_drill_strategy_map': 'drill_strategy_map_powlax'
}

console.log('🔄 Updating table names to follow _powlax convention...\n')

// Update scripts
scriptsToUpdate.forEach(scriptName => {
  const scriptPath = path.join(__dirname, scriptName)
  if (fs.existsSync(scriptPath)) {
    let content = fs.readFileSync(scriptPath, 'utf-8')
    
    Object.entries(tableNameMapping).forEach(([oldName, newName]) => {
      const regex = new RegExp(`'${oldName}'|"${oldName}"|from\\('${oldName}'\\)|table ${oldName}`, 'g')
      content = content.replace(regex, (match) => {
        return match.replace(oldName, newName)
      })
    })
    
    fs.writeFileSync(scriptPath, content)
    console.log(`✅ Updated ${scriptName}`)
  }
})

// Update lib files
const libPath = path.join(__dirname, '../src/lib')
if (fs.existsSync(libPath)) {
  const libFiles = fs.readdirSync(libPath).filter(f => f.endsWith('.ts'))
  
  libFiles.forEach(fileName => {
    const filePath = path.join(libPath, fileName)
    let content = fs.readFileSync(filePath, 'utf-8')
    let updated = false
    
    Object.entries(tableNameMapping).forEach(([oldName, newName]) => {
      if (content.includes(oldName)) {
        content = content.replace(new RegExp(oldName, 'g'), newName)
        updated = true
      }
    })
    
    if (updated) {
      fs.writeFileSync(filePath, content)
      console.log(`✅ Updated ${fileName}`)
    }
  })
}

console.log('\n📋 Table Naming Convention: [entity]_powlax')
console.log('All POWLAX tables should follow this pattern for consistency.')