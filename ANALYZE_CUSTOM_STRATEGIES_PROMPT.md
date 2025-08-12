# 🔍 PROMPT TO ANALYZE CUSTOM STRATEGIES ISSUES

## For Claude/AI Assistant:

Please perform a comprehensive analysis of the Custom Strategies creation feature in the POWLAX Practice Planner. Use the following systematic approach:

### 1. First, read these critical files:
- `src/components/practice-planner/PLANNER_MASTER_CONTRACT.md`
- `PRACTICE_PLANNER_ROOT_CAUSE_ANALYSIS.md` 
- `contracts/active/database-truth-sync-002.yaml`

### 2. Analyze the Custom Strategies flow:

#### A. Check the Modal Component:
```bash
# Find and read the AddCustomStrategiesModal or similar
find . -name "*CustomStrateg*" -type f | grep -E "\.(tsx|ts)$"
```
- What fields does it collect?
- What data does it send on submit?
- How does it handle errors?

#### B. Check the Hook:
```bash
# Find useUserStrategies or similar hook
grep -r "useUserStrategies\|useStrategies" --include="*.ts" --include="*.tsx"
```
- What columns does it expect in user_strategies table?
- How does createUserStrategy function work?
- What's the exact INSERT query structure?

#### C. Check the Database Table:
Create and run this analysis script:
```typescript
// scripts/analyze-strategies-table.ts
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

async function analyzeStrategiesTable() {
  console.log('🔍 ANALYZING user_strategies TABLE\n')
  
  // Get table structure
  const { data: sample } = await supabase
    .from('user_strategies')
    .select('*')
    .limit(1)
  
  if (sample && sample[0]) {
    console.log('Columns in user_strategies:')
    Object.keys(sample[0]).forEach(col => {
      const value = sample[0][col]
      const type = value === null ? 'null' : 
                   Array.isArray(value) ? 'array' : 
                   typeof value
      console.log(`  - ${col}: ${type}`)
    })
  }
  
  // Test insert with what the modal sends
  const testStrategy = {
    user_id: '523f2768-6404-439c-a429-f9eb6736aa17',
    strategy_name: 'Test Strategy',
    description: 'Test description',
    strategy_categories: 'Special Situations',
    // Add other fields the modal sends
  }
  
  const { error } = await supabase
    .from('user_strategies')
    .insert([testStrategy])
  
  if (error) {
    console.log('\n❌ INSERT FAILED:', error.message)
    console.log('Error details:', error.details)
  } else {
    console.log('\n✅ INSERT SUCCEEDED')
  }
}

analyzeStrategiesTable()
```

#### D. Check RLS Policies:
- Are the same RLS issues affecting strategies?
- Does Migration 119 fix strategies too?

### 3. Compare with Working Features:
- How does Custom Drills work (it's partially working)?
- What's different about Custom Strategies?

### 4. Check Error Messages:
Look at the browser console errors in the screenshots:
- "Failed to create strategy"
- Check the exact error text
- Is it RLS or something else?

### 5. Create a Fix Document:
Create `CUSTOM_STRATEGIES_FIX.md` with:
- Root cause identified
- Missing columns (if any)
- RLS issues (if any)
- SQL migration to fix
- Code changes needed (if any)

### Key Questions to Answer:
1. Does user_strategies table have all columns the modal expects?
2. Is the user_id being passed correctly?
3. Are RLS policies blocking inserts?
4. What's the exact error when creating a strategy?
5. Does the table structure match what powlax_strategies has?

### Expected Output:
A comprehensive analysis document that:
- Identifies the exact failure point
- Provides SQL to fix any database issues
- Suggests code changes if needed
- Includes test validation steps

Use maximum analysis depth and leave no stone unturned!