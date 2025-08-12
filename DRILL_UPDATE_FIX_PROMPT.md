# 🎯 PROMPT: Complete Fix for Custom Drill Creation AND Update - From Start to Finish

## 🚨 CRITICAL FIRST STEP: Analyze SQL Migration History

### Before ANY Code Changes, Review Migration Patterns:
```bash
# List all migration files to understand what's been changed
ls -la supabase/migrations/ | grep -E "(drill|user_drill|RLS|rls)"

# Look for patterns of changes and reversions
# Common pattern: Migration adds feature → Next migration fixes RLS → Later migration reverts
```

**WHY THIS MATTERS:** 
- 119+ migrations have been run
- Many migrations likely changed things back and forth
- Understanding the pattern prevents repeating past mistakes
- The final state in migrations 110-119 should be the truth

### Key Migration Files to Review:
1. Check for `user_drills` table creation
2. Look for RLS policy additions/modifications
3. Find any column additions (especially team_share, club_share)
4. Identify any type changes (e.g., boolean → array conversions)

**IMPORTANT:** The database likely already has the correct schema. The problem is usually in the JavaScript/TypeScript code, NOT the database.

---

## 🔴 THE PROBLEMS YOU'LL ENCOUNTER

### Problem 1: Custom Drills Don't Save All Fields
When users create custom drills, only minimal fields save (title and user_id), missing:
- Duration, equipment, category
- Video URLs, drill lab URLs
- Team/club sharing settings
- All other metadata

### Problem 2: Custom Drills Can't Be Updated
When users try to update custom drills, they get an error:
```
Failed to update drill: expected JSON array at updateUserDrill
```

## 🔍 ROOT CAUSE ANALYSIS

### The Issues: Multiple Problems

#### Problem 1: useUserDrills Only Saves Minimal Fields
The `createUserDrill` function assumes database columns don't exist and only saves basic fields.

#### Problem 2: Data Type Mismatch on Updates  
The database expects `team_share` and `club_share` to be **INTEGER[] arrays**, but the code is sending **booleans**.

### Why This Happens:
1. **Creation Issue**: Code assumes missing database columns and extracts from "content" field
2. **Update Issue**: UI uses checkboxes (boolean state) but database expects arrays
3. **Historical Migrations**: 119+ migrations likely changed schema multiple times
4. **Result**: Only minimal fields save + "expected JSON array" error on updates

## ✅ THE COMPLETE FIX - STEP BY STEP

### Step 0: Understand Current Database Schema
**CRITICAL:** Check what the database actually has after 119 migrations:
```bash
# Check the actual user_drills table structure
npx tsx scripts/check-user-drills-schema.ts

# Or manually inspect:
PGPASSWORD=$SUPABASE_DB_PASSWORD psql -h db.bhviqmmtzjvqkyfsddtk.supabase.co -U postgres -d postgres -c "\d user_drills"
```

**Expected Columns After Migrations:**
- All standard drill fields (title, content, duration_minutes, equipment, etc.)
- team_share: INTEGER[] 
- club_share: INTEGER[]
- All drill_lab_url_1 through drill_lab_url_5 columns

### Step 1: Fix createUserDrill to Save ALL Fields  
**Location:** `/src/hooks/useUserDrills.ts` - `createUserDrill` function

**PROBLEM:** Only saves minimal fields, ignoring most form data.

**FIND THE CURRENT createUserDrill FUNCTION (around line 138-176)**
**LIKELY LOOKS LIKE:**
```typescript
const createUserDrill = async (drillData: any) => {
  // Only saves user_id and title, missing everything else!
  const { data, error } = await supabase
    .from('user_drills')
    .insert([{
      user_id: drillData.user_id,
      title: drillData.title || 'New Drill',
      // Missing: content, duration_minutes, equipment, etc.
      team_share: drillData.team_share === true,  // WRONG! Should be array
      club_share: drillData.club_share === true   // WRONG! Should be array
    }])
}
```

**REPLACE WITH COMPLETE FIELD SAVING:**
```typescript
const createUserDrill = async (drillData: any) => {
  try {
    // Save ALL fields directly to their database columns
    const { data, error } = await supabase
      .from('user_drills')
      .insert([{
        user_id: drillData.user_id,
        title: drillData.title || 'New Drill',
        content: drillData.content || '',
        duration_minutes: drillData.duration_minutes || 10,
        category: drillData.category || 'Custom',
        equipment: drillData.equipment || '',
        tags: drillData.tags || '',
        video_url: drillData.video_url || null,
        drill_lab_url_1: drillData.drill_lab_url_1 || null,
        drill_lab_url_2: drillData.drill_lab_url_2 || null,
        drill_lab_url_3: drillData.drill_lab_url_3 || null,
        drill_lab_url_4: drillData.drill_lab_url_4 || null,
        drill_lab_url_5: drillData.drill_lab_url_5 || null,
        game_states: drillData.game_states || [],
        is_public: drillData.is_public || false,
        // Handle arrays properly
        team_share: Array.isArray(drillData.team_share) ? drillData.team_share : 
                   (drillData.team_share === true ? [] : []),
        club_share: Array.isArray(drillData.club_share) ? drillData.club_share : 
                   (drillData.club_share === true ? [] : [])
      }])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create drill: ${error.message}`)
    }

    // Refresh the drill list
    await fetchUserDrills()
    return data
  } catch (err: any) {
    console.error('Error creating user drill:', err)
    setError(err.message)
    throw err
  }
}
```

### Step 2: Fix fetchUserDrills to Read ALL Fields
**Location:** `/src/hooks/useUserDrills.ts` - `fetchUserDrills` function  

**PROBLEM:** Might be trying to extract data from non-existent "content" field instead of reading direct columns.

**FIND THE CURRENT fetchUserDrills (around line 62-135)**
**LOOK FOR CONTENT EXTRACTION PATTERNS:**
```typescript
// WRONG - Extracting from content field that may not exist
const transformedDrills = data.map((drill: any) => ({
  // Extracting duration from content instead of duration_minutes column
  duration: extractDurationMinutes(drill.content),
  // Missing direct column mapping
}))
```

**REPLACE WITH DIRECT COLUMN READING:**
```typescript
const fetchUserDrills = async () => {
  try {
    setLoading(true)
    console.log('Fetching user drills...')
    
    const { data, error } = await supabase
      .from('user_drills')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error fetching user drills:', error)
      throw new Error(`Failed to fetch user drills: ${error.message}`)
    }

    if (!data) {
      console.log('No user drills found')
      setUserDrills([])
      return
    }

    // Read ALL fields directly from database columns (don't extract from content)
    const transformedDrills = data.map((drill: any) => ({
      // Direct column mapping - use what's actually in the database
      id: drill.id?.toString(),
      user_id: drill.user_id,
      title: drill.title,
      content: drill.content,
      duration_minutes: drill.duration_minutes, // Direct from column
      category: drill.category,                 // Direct from column
      equipment: drill.equipment,               // Direct from column
      tags: drill.tags,                         // Direct from column
      video_url: drill.video_url,               // Direct from column
      drill_lab_url_1: drill.drill_lab_url_1,   // Direct from column
      drill_lab_url_2: drill.drill_lab_url_2,   // Direct from column
      drill_lab_url_3: drill.drill_lab_url_3,   // Direct from column
      drill_lab_url_4: drill.drill_lab_url_4,   // Direct from column
      drill_lab_url_5: drill.drill_lab_url_5,   // Direct from column
      game_states: drill.game_states || [],
      team_share: drill.team_share || [],       // Arrays from database
      club_share: drill.club_share || [],       // Arrays from database
      is_public: drill.is_public || false,
      created_at: drill.created_at,
      updated_at: drill.updated_at,
      
      // Legacy compatibility fields for practice planner
      name: drill.title,
      duration: drill.duration_minutes || 10,
      notes: drill.content || ''
    }))

    console.log(`Loaded ${transformedDrills.length} user drills`)
    setUserDrills(transformedDrills)
  } catch (err: any) {
    console.error('Error fetching user drills:', err)
    setError(err.message)
    setUserDrills([])
  } finally {
    setLoading(false)
  }
}
```

### Step 3: Fix the updateUserDrill Function
**Location:** `/src/hooks/useUserDrills.ts` (around line 179)

**PROBLEM:** Sending booleans for array fields, missing other fields.

**REPLACE updateUserDrill with complete array handling:**
```typescript
const updateUserDrill = async (drillId: string, updates: Partial<UserDrill>) => {
  try {
    // Update ALL fields directly to their database columns
    const updateData: any = {
      title: updates.title,
      content: updates.content,
      duration_minutes: updates.duration_minutes || updates.duration,
      category: updates.category,
      equipment: updates.equipment,
      tags: updates.tags,
      video_url: updates.video_url,
      drill_lab_url_1: updates.drill_lab_url_1,
      drill_lab_url_2: updates.drill_lab_url_2,
      drill_lab_url_3: updates.drill_lab_url_3,
      drill_lab_url_4: updates.drill_lab_url_4,
      drill_lab_url_5: updates.drill_lab_url_5,
      game_states: updates.game_states,
      is_public: updates.is_public,
      updated_at: new Date().toISOString()
    }
    
    // CRITICAL: Handle team_share and club_share as arrays, not booleans
    if ('team_share' in updates) {
      updateData.team_share = Array.isArray(updates.team_share) 
        ? updates.team_share 
        : (updates.team_share === true ? [] : [])
    }
    
    if ('club_share' in updates) {
      updateData.club_share = Array.isArray(updates.club_share) 
        ? updates.club_share 
        : (updates.club_share === true ? [] : [])
    }

    // Remove undefined values to avoid overwriting with null
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key]
      }
    })

    const { error } = await supabase
      .from('user_drills')
      .update(updateData)
      .eq('id', drillId)

    if (error) {
      throw new Error(`Failed to update drill: ${error.message}`)
    }

    // Refresh the drill list
    await fetchUserDrills()
  } catch (err: any) {
    console.error('Error updating user drill:', err)
    setError(err.message)
    throw err
  }
}
```

### Step 4: Create AddCustomDrillModal Component (If Missing)
**Location:** `/src/components/practice-planner/modals/AddCustomDrillModal.tsx`

**PURPOSE:** Allow users to create custom drills with all fields.

**BASED ON:** AddCustomStrategiesModal pattern but with drill-specific fields:
```typescript
const AddCustomDrillModal = ({ onClose, onAdd }) => {
  // All drill-specific form states
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(10)
  const [category, setCategory] = useState('Custom')
  const [equipment, setEquipment] = useState('')
  const [tags, setTags] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [drillLabUrl1, setDrillLabUrl1] = useState('')
  const [drillLabUrl2, setDrillLabUrl2] = useState('')
  const [drillLabUrl3, setDrillLabUrl3] = useState('')
  const [drillLabUrl4, setDrillLabUrl4] = useState('')
  const [drillLabUrl5, setDrillLabUrl5] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [teamShare, setTeamShare] = useState(false)
  const [clubShare, setClubShare] = useState(false)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Send ALL fields to useUserDrills.createUserDrill
    const drillData = {
      title,
      content,
      duration_minutes: durationMinutes,
      category,
      equipment,
      tags,
      video_url: videoUrl || null,
      drill_lab_url_1: drillLabUrl1 || null,
      drill_lab_url_2: drillLabUrl2 || null,
      drill_lab_url_3: drillLabUrl3 || null,
      drill_lab_url_4: drillLabUrl4 || null,
      drill_lab_url_5: drillLabUrl5 || null,
      is_public: isPublic,
      team_share: teamShare ? [] : [], // For now, empty arrays
      club_share: clubShare ? [] : []  // Can enhance later with team/club IDs
    }
    
    await onAdd(drillData)
    onClose()
  }
  
  // Form UI with all fields...
}
```

### Step 5: Create/Fix EditCustomDrillModal Component
**Location:** `/src/components/practice-planner/modals/EditCustomDrillModal.tsx`

**PURPOSE:** Allow users to edit existing custom drills, fixing the array error.

**BASED ON:** EditCustomStrategyModal pattern that was successfully fixed:

**Key Requirements:**
1. Add array state variables to preserve IDs
2. Convert checkboxes to arrays when saving
3. Handle form population properly

**Template:**
```typescript
const EditCustomDrillModal = ({ drill, onClose, onUpdate }) => {
  // Form states
  const [title, setTitle] = useState(drill?.title || '')
  const [content, setContent] = useState(drill?.content || '')
  const [teamShare, setTeamShare] = useState(false)
  const [clubShare, setClubShare] = useState(false)
  
  // CRITICAL: Store the actual arrays separately to preserve IDs
  const [teamShareIds, setTeamShareIds] = useState<number[]>([])
  const [clubShareIds, setClubShareIds] = useState<number[]>([])
  
  // Populate form when drill changes
  useEffect(() => {
    if (drill) {
      setTitle(drill.title || '')
      setContent(drill.content || '')
      
      // Handle array fields
      const teamIds = Array.isArray(drill.team_share) ? drill.team_share : []
      const clubIds = Array.isArray(drill.club_share) ? drill.club_share : []
      setTeamShareIds(teamIds)
      setClubShareIds(clubIds)
      setTeamShare(teamIds.length > 0)
      setClubShare(clubIds.length > 0)
    }
  }, [drill])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const updateData = {
      title,
      content,
      // ... other fields ...
      // CRITICAL: Send arrays, not booleans!
      team_share: teamShare ? teamShareIds : [],
      club_share: clubShare ? clubShareIds : []
    }
    
    await onUpdate(drill.id, updateData)
    onClose()
  }
  
  // ... rest of component
}
```

### Step 4: Add DrillsTab Component (If Missing)
Create a DrillsTab component similar to StrategiesTab to display user drills:

```typescript
const DrillsTab = () => {
  const { userDrills, loading, error, updateUserDrill, deleteUserDrill } = useUserDrills()
  const [editingDrill, setEditingDrill] = useState<any>(null)
  
  return (
    <div>
      <Accordion type="single" collapsible>
        <AccordionItem value="user-drills">
          <AccordionTrigger>
            My Custom Drills ({userDrills.length})
          </AccordionTrigger>
          <AccordionContent>
            {userDrills.map((drill) => (
              <DrillCard
                key={drill.id}
                drill={drill}
                onEdit={() => setEditingDrill(drill)}
                onDelete={() => deleteUserDrill(drill.id)}
              />
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      {editingDrill && (
        <EditCustomDrillModal
          drill={editingDrill}
          onClose={() => setEditingDrill(null)}
          onUpdate={updateUserDrill}
        />
      )}
    </div>
  )
}
```

## 🧪 HOW TO TEST YOUR FIX

### Create a Test Script:
```typescript
// scripts/test-drill-update-fix.ts
const testDrillUpdateFix = async () => {
  // Create drill with arrays
  const createData = {
    user_id: 'test-user-id',
    title: 'Test Drill',
    team_share: [1, 2, 3],  // Array with IDs
    club_share: [10, 20]     // Array with IDs
  }
  
  // Update with different arrays
  const updateData = {
    team_share: [],      // Empty array (checkbox unchecked)
    club_share: [30, 40] // Different array (checkbox checked)
  }
  
  // This should work without "expected JSON array" errors!
}
```

## 📋 COMPLETE CHECKLIST

- [ ] **ANALYZED MIGRATION HISTORY** - Reviewed 119+ migrations for patterns
- [ ] **Fixed `createUserDrill`** - Now saves ALL fields to database columns  
- [ ] **Fixed `fetchUserDrills`** - Reads directly from columns (no content extraction)
- [ ] **Fixed `updateUserDrill`** - Handles arrays properly, includes all fields
- [ ] **Created AddCustomDrillModal** - Complete form for drill creation
- [ ] **Created EditCustomDrillModal** - Array state variables for updates  
- [ ] **Added array preservation logic** - Preserves existing team/club IDs
- [ ] **Fixed submit handlers** - Send arrays instead of booleans
- [ ] **Created DrillsTab component** - Display user drills with edit functionality
- [ ] **Tested creation AND updates** - Both work without errors
- [ ] **Verified all fields save** - Duration, equipment, tags, URLs, etc.

## 🎯 KEY INSIGHTS

1. **Database columns are INTEGER[]** - Always send arrays, never booleans
2. **Preserve existing IDs** - Don't lose team/club associations
3. **Empty arrays are valid** - Use `[]` not `null` or `false`
4. **The fix pattern is identical to strategies** - Same solution applies

## 💡 COMMON MISTAKES TO AVOID

1. **Don't send booleans to array columns**
2. **Don't forget to preserve existing IDs**
3. **Don't use `null` - use empty array `[]`**
4. **Don't forget to handle both create AND update**

## 🚀 FINAL VERIFICATION

Your update should transform data like this:
- **Before:** `{ team_share: true, club_share: false }` ❌
- **After:** `{ team_share: [1, 2], club_share: [] }` ✅

## 📌 ADDITIONAL DRILL-SPECIFIC FIELDS

The user_drills table has these additional fields that strategies don't have:
- `drill_lab_url_1` through `drill_lab_url_5` - Multiple drill lab URLs
- `equipment` - Equipment needed for the drill
- `tags` - Comma-separated tags
- `duration_minutes` - Integer duration
- `category` - Drill category

Make sure to include these in your forms and update logic!

Remember: The database expects arrays for team_share and club_share. Always send arrays!