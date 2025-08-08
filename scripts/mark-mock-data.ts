#!/usr/bin/env node

import * as fs from 'fs'
import * as path from 'path'
import { glob } from 'glob'

const MOCK_PATTERNS = [
  /\/\/ Mock(?!ing)/gi,  // Matches "// Mock" but not "// Mocking"
  /\/\/ Fake/gi,
  /\/\/ Sample data/gi,
  /\/\/ Dummy/gi,
  /mockData/g,
  /fakeData/g,
  /sampleData(?! for testing)/g,  // Don't match "sampleData for testing"
  /dummyData/g,
]

const NOT_REAL_DATA_MARKER = '// ⚠️ NOT REAL DATA - '

async function markMockData() {
  console.log('🔍 Searching for mock data in source files...\n')
  
  // Find all TypeScript and TypeScript React files
  const files = await glob('src/**/*.{ts,tsx}', {
    cwd: process.cwd(),
    absolute: true,
    ignore: ['**/node_modules/**', '**/build/**', '**/dist/**']
  })
  
  let totalFound = 0
  let filesWithMock = []
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8')
    const lines = content.split('\n')
    let fileModified = false
    let foundInFile = []
    
    lines.forEach((line, index) => {
      // Skip if already marked
      if (line.includes(NOT_REAL_DATA_MARKER)) {
        return
      }
      
      // Check each pattern
      for (const pattern of MOCK_PATTERNS) {
        if (pattern.test(line)) {
          foundInFile.push({
            line: index + 1,
            content: line.trim().substring(0, 80)
          })
          totalFound++
          break
        }
      }
    })
    
    if (foundInFile.length > 0) {
      const relativePath = path.relative(process.cwd(), file)
      filesWithMock.push({
        path: relativePath,
        occurrences: foundInFile
      })
    }
  }
  
  // Report findings
  if (filesWithMock.length === 0) {
    console.log('✅ No unmarked mock data found!')
  } else {
    console.log(`⚠️  Found ${totalFound} instances of potential mock data in ${filesWithMock.length} files:\n`)
    
    filesWithMock.forEach(file => {
      console.log(`📄 ${file.path}`)
      file.occurrences.forEach(occ => {
        console.log(`   Line ${occ.line}: ${occ.content}...`)
      })
      console.log('')
    })
    
    console.log('📝 Recommendations:')
    console.log('1. Review each instance to determine if it\'s truly mock data')
    console.log('2. If it\'s temporary placeholder data, add the marker:')
    console.log(`   ${NOT_REAL_DATA_MARKER}Placeholder until [reason]`)
    console.log('3. If it\'s real data or necessary for testing, update the comment')
    console.log('4. Consider replacing with database queries where appropriate')
  }
  
  // Check for properly marked mock data
  console.log('\n📊 Checking for properly marked placeholder data...')
  let markedFiles = 0
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8')
    if (content.includes(NOT_REAL_DATA_MARKER)) {
      markedFiles++
      const relativePath = path.relative(process.cwd(), file)
      console.log(`   ✓ ${relativePath} (has marked placeholder data)`)
    }
  }
  
  if (markedFiles > 0) {
    console.log(`\n✅ Found ${markedFiles} files with properly marked placeholder data`)
  }
}

// Run the script
markMockData().catch(console.error)