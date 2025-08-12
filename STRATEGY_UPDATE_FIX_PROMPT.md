# 🎯 PROMPT: How to Fix Custom Strategy/Drill Update Feature - Array Field Error

## 🔴 THE PROBLEM YOU'LL ENCOUNTER
When users try to update custom strategies/drills, they get an error:
```
Failed to update strategy: expected JSON array at updateUserStrategy
```

## 🔍 ROOT CAUSE ANALYSIS

### The Issue: Data Type Mismatch
The database expects `team_share` and `club_share` to be **INTEGER[] arrays**, but the EditCustomModal is sending **booleans**.

### Why This Happens:
1. The UI uses checkboxes (boolean state) for user interaction
2. The form sends these boolean values directly to the database
3. The database rejects booleans when expecting arrays
4. Result: "expected JSON array" error

## ✅ THE COMPLETE FIX - STEP BY STEP

### Step 1: Understand the Data Flow
```
UI Checkbox (boolean) → Form State (boolean) → Database (expects array) = ERROR ❌
UI Checkbox (boolean) → Form State (boolean) → Convert to Array → Database = SUCCESS ✅
```

### Step 2: Add State Variables for Arrays
In your EditCustomStrategyModal (or EditCustomDrillModal):

**FIND:** The state declarations (around line 70-75)
```typescript
const [teamShare, setTeamShare] = useState(false)
const [clubShare, setClubShare] = useState(false)
```

**ADD:** Array state variables to preserve IDs
```typescript
const [teamShare, setTeamShare] = useState(false)
const [clubShare, setClubShare] = useState(false)
const [isPublic, setIsPublic] = useState(false)
// Store the actual arrays separately to preserve IDs
const [teamShareIds, setTeamShareIds] = useState<number[]>([])
const [clubShareIds, setClubShareIds] = useState<number[]>([])
```

### Step 3: Update Form Population Logic
When loading existing data into the form:

**FIND:** The useEffect that populates form (around line 95-98)
```typescript
setTeamShare(Array.isArray(strategy.team_share) && strategy.team_share.length > 0)
setClubShare(Array.isArray(strategy.club_share) && strategy.club_share.length > 0)
```

**REPLACE WITH:**
```typescript
// Handle team/club share arrays
const teamIds = Array.isArray(strategy.team_share) ? strategy.team_share : []
const clubIds = Array.isArray(strategy.club_share) ? strategy.club_share : []
setTeamShareIds(teamIds)
setClubShareIds(clubIds)
setTeamShare(teamIds.length > 0)
setClubShare(clubIds.length > 0)
```

### Step 4: Fix the Submit Handler
When submitting the form:

**FIND:** The data object being sent (around line 155-160)
```typescript
team_share: teamShare,  // This is a boolean!
club_share: clubShare,  // This is a boolean!
```

**REPLACE WITH:**
```typescript
team_share: teamShare ? teamShareIds : [],  // Use preserved IDs or empty array
club_share: clubShare ? clubShareIds : [],  // Use preserved IDs or empty array
```

### Step 5: Update Reset Function
If you have a reset function:

**FIND:**
```typescript
setTeamShare(false)
setClubShare(false)
```

**ADD:**
```typescript
setTeamShare(false)
setClubShare(false)
setTeamShareIds([])
setClubShareIds([])
```

### Step 6: BONUS - Fix GAME_PHASES Dropdown (Strategies Only)
If you're working on strategies and see an error with the Game Phase dropdown:

**FIND:**
```typescript
{Object.entries(GAME_PHASES).map(([key, label]) => (
  <option key={key} value={key}>
    {label}
  </option>
))}
```

**REPLACE WITH:**
```typescript
{GAME_PHASES.map((phase) => (
  <option key={phase} value={phase}>
    {phase}
  </option>
))}
```

**Why:** GAME_PHASES is an array, not an object!

## 🧪 HOW TO TEST YOUR FIX

### Create a Test Script:
```typescript
// Test with arrays
const updateData = {
  team_share: [],      // Empty array (checkbox unchecked)
  club_share: [30, 40] // Array with IDs (checkbox checked)
}

// This should work without errors!
await supabase
  .from('user_strategies') // or user_drills
  .update(updateData)
  .eq('id', strategyId)
```

### Expected Results:
- ✅ No "expected JSON array" error
- ✅ team_share saves as `[]` when unchecked
- ✅ club_share saves as `[id, id]` when checked
- ✅ Both are arrays, not booleans

## 📋 COMPLETE CHECKLIST

- [ ] Added array state variables (`teamShareIds`, `clubShareIds`)
- [ ] Updated form population to extract and store arrays
- [ ] Fixed submit handler to send arrays instead of booleans
- [ ] Updated reset function to clear array states
- [ ] Fixed GAME_PHASES dropdown (strategies only)
- [ ] Tested with actual database update
- [ ] Verified no type mismatch errors

## 🎯 KEY INSIGHTS

1. **Database columns are INTEGER[]** - Always send arrays, never booleans
2. **Preserve existing IDs** - Don't lose team/club associations
3. **Empty arrays are valid** - Use `[]` not `null` or `false`
4. **The fix is the same for drills and strategies** - Same pattern applies

## 💡 COMMON MISTAKES TO AVOID

1. **Don't send booleans to array columns**
2. **Don't forget to preserve existing IDs**
3. **Don't use `null` - use empty array `[]`**
4. **Don't assume GAME_PHASES is an object** - it's an array

## 🚀 FINAL VERIFICATION

Your update should now work perfectly! The key transformation:
- **Before:** `{ team_share: true, club_share: false }` ❌
- **After:** `{ team_share: [], club_share: [] }` ✅

Remember: The database expects arrays. Always send arrays!