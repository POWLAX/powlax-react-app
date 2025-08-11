# 🔍 Ultra-Think Context Verification Template

**Purpose:** Prevent context mix-ups and assumption-based failures by verifying actual system state before implementation

---

## 🚨 MANDATORY ULTRA-THINK CONTEXT VERIFICATION

**Add this section to EVERY contract's Ultra-Think phase:**

```yaml
# ULTRA-THINK CONTEXT VERIFICATION (15+ MINUTES MANDATORY)
ultraThinkContextVerification:
  completed: false # Must be true before ANY implementation
  startTime: null
  endTime: null
  duration: null # Must be >= 15 minutes
  
  # 1. DATABASE REALITY CHECK
  databaseVerification:
    tableNamingPattern:
      question: "What table naming convention is ACTUALLY used?"
      command: |
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name LIKE '%drill%' OR table_name LIKE '%strategy%' OR table_name LIKE '%workout%'
        ORDER BY table_name;
      discovered: [] # Fill with actual table names
      expected: [] # What the code expects
      mismatch: false # Set to true if different
      
    dataConnectionMethod:
      question: "How are relationships ACTUALLY stored?"
      options:
        junction_table: false # many-to-many table
        array_column: false # drill_ids[]
        json_field: false # JSONB
        foreign_key: false # direct FK
      verification: |
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'skills_academy_workouts' 
        AND column_name LIKE '%drill%';
      discovered: null # Document actual method
      
    dataPresence:
      question: "Is the data ACTUALLY there?"
      verification: |
        SELECT 
          'skills_academy_drills' as table_name, 
          COUNT(*) as row_count,
          COUNT(*) FILTER (WHERE video_url IS NOT NULL) as with_video
        FROM skills_academy_drills
        UNION ALL
        SELECT 
          'skills_academy_workouts', 
          COUNT(*),
          COUNT(*) FILTER (WHERE drill_ids IS NOT NULL AND drill_ids != '{}') as with_drills
        FROM skills_academy_workouts
        UNION ALL
        SELECT 
          'skills_academy_workout_drills',
          COUNT(*),
          COUNT(*) as junction_records
        FROM skills_academy_workout_drills;
      results:
        drills_count: null
        workouts_count: null
        junction_count: null # CRITICAL: Check if 0!
        
    rlsStatus:
      question: "Is RLS blocking access?"
      testWithAnonKey: |
        curl "$SUPABASE_URL/rest/v1/[TABLE]?limit=1" \
          -H "apikey: $ANON_KEY"
      testWithServiceKey: |
        curl "$SUPABASE_URL/rest/v1/[TABLE]?limit=1" \
          -H "apikey: $SERVICE_KEY"
      results:
        anonReturnsData: false # If false, RLS is blocking!
        serviceReturnsData: false
        rlsEnabled: false
        policiesExist: false
        
  # 2. CODE REALITY CHECK
  codeVerification:
    hookTableReferences:
      question: "What tables do hooks ACTUALLY reference?"
      files:
        - path: "src/hooks/useDrills.ts"
          references: [] # Fill with actual table names
        - path: "src/hooks/useStrategies.ts"
          references: []
        - path: "src/hooks/useSkillsAcademyWorkouts.ts"
          references: []
      mismatchFound: false
      
    forbiddenPatterns:
      question: "What patterns will BREAK the system?"
      checkCommand: |
        grep -r "dynamic\|lazy\|framer-motion\|AnimatePresence" src/components/
      found: [] # List any found
      criticalFiles: [] # Files with forbidden patterns
      
    componentTypes:
      question: "Client or Server components?"
      checkFor: "'use client'"
      criticalComponents:
        - path: null
          hasUseClient: false
          shouldHaveUseClient: false
          
  # 3. MEDIA/URL REALITY CHECK
  mediaVerification:
    videoUrlFormats:
      question: "What video URL formats exist?"
      checkCommand: |
        SELECT DISTINCT 
          CASE 
            WHEN video_url LIKE '%player.vimeo.com%' THEN 'player.vimeo.com'
            WHEN video_url LIKE '%vimeo.com%' THEN 'vimeo.com'
            WHEN vimeo_id IS NOT NULL THEN 'vimeo_id_field'
            ELSE 'other'
          END as format_type,
          COUNT(*) as count
        FROM skills_academy_drills
        WHERE video_url IS NOT NULL OR vimeo_id IS NOT NULL
        GROUP BY format_type;
      formats:
        wall_ball: null # e.g., "player.vimeo.com/video/"
        skills_academy: null # e.g., "vimeo.com/"
        practice_planner: null
      conversionNeeded: false
      
  # 4. EXISTING FUNCTIONALITY CHECK
  functionalityVerification:
    workingFeatures:
      question: "What MUST NOT break?"
      criticalFeatures:
        - name: "Practice Planner drag-drop"
          working: false
          tested: false
        - name: "Auto-save every 3 seconds"
          working: false
          tested: false
        - name: "Study modals"
          working: false
          tested: false
      command: "Test each manually or with Playwright"
      
    fragileComponents:
      question: "What breaks easily?"
      knownFragile:
        - component: "Practice Planner"
          reasonFragile: "Complex import chains"
          protectionMethod: "noTouch list"
        - component: null
          reasonFragile: null
          protectionMethod: null
          
  # 5. DEPENDENCY MAPPING
  dependencyVerification:
    agentDependencies:
      question: "Which agents must complete before others?"
      discovered:
        - dependency: null # e.g., "Agent 2 must complete before 1,3,4,5"
          reason: null # e.g., "Database migration required first"
      
    fileDependencies:
      question: "Which files depend on others?"
      criticalPaths:
        - file: null
          dependsOn: []
          
  # 6. CRITICAL DISCOVERIES
  discoveries:
    dataStructure:
      - finding: null # e.g., "drill_ids array exists, junction table empty"
        impact: null # e.g., "Changes entire approach"
        
    blockingIssues:
      - issue: null # e.g., "RLS blocking all anonymous access"
        severity: null # CRITICAL|HIGH|MEDIUM|LOW
        resolution: null # e.g., "Must disable RLS first"
        
    assumptions:
      - assumption: null # e.g., "Junction table would be populated"
        reality: null # e.g., "Junction table is empty"
        impact: null # e.g., "Must use drill_ids array instead"

# CONTRACT UPDATE REQUIREMENT
contractUpdateRequired:
  needed: false # Set to true if discoveries change approach
  updates:
    - section: null
      change: null
      reason: null
```

---

## 📋 Quick Verification Commands

**Run these BEFORE creating any contract:**

```bash
#!/bin/bash
# quick-verify.sh

echo "=== 1. CHECK TABLE NAMES ==="
psql -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND (table_name LIKE '%drill%' OR table_name LIKE '%workout%' OR table_name LIKE '%strategy%')"

echo "=== 2. CHECK DATA POPULATION ==="
psql -c "SELECT 'skills_academy_drills' as table, COUNT(*) FROM skills_academy_drills UNION ALL SELECT 'skills_academy_workouts', COUNT(*) FROM skills_academy_workouts UNION ALL SELECT 'skills_academy_workout_drills', COUNT(*) FROM skills_academy_workout_drills"

echo "=== 3. CHECK COLUMN STRUCTURE ==="
psql -c "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'skills_academy_workouts' ORDER BY ordinal_position"

echo "=== 4. TEST RLS ==="
curl -s "$SUPABASE_URL/rest/v1/skills_academy_drills?limit=1" -H "apikey: $ANON_KEY" | python -m json.tool

echo "=== 5. CHECK FOR FORBIDDEN PATTERNS ==="
grep -l "dynamic\|lazy\|framer-motion" src/components/practice-planner/*.tsx 2>/dev/null

echo "=== 6. CHECK VIDEO URL FORMATS ==="
psql -c "SELECT SUBSTRING(video_url FROM 1 FOR 30) as url_start, COUNT(*) FROM skills_academy_drills WHERE video_url IS NOT NULL GROUP BY url_start"
```

---

## 🚫 Common Context Mix-ups to Prevent

### 1. **Table Naming Confusion**
```yaml
PREVENT:
  assuming: "Table is named powlax_drills"
  reality: "Table is actually drills_powlax"
  verify: "SELECT table_name FROM information_schema.tables"
```

### 2. **Empty Junction Tables**
```yaml
PREVENT:
  assuming: "Junction table has relationships"
  reality: "Junction table exists but is EMPTY"
  verify: "SELECT COUNT(*) FROM junction_table"
```

### 3. **RLS Blocking Access**
```yaml
PREVENT:
  assuming: "If table has data, app can read it"
  reality: "RLS policies block anonymous users"
  verify: "Test with actual anon key, not service key"
```

### 4. **Different Video URL Formats**
```yaml
PREVENT:
  assuming: "All video URLs use same format"
  reality: "Each system uses different Vimeo URL format"
  verify: "SELECT DISTINCT video URL patterns"
```

### 5. **Array vs Junction Table**
```yaml
PREVENT:
  assuming: "Many-to-many uses junction table"
  reality: "Using array column (drill_ids[])"
  verify: "Check actual column data types"
```

### 6. **Hook Table Mismatches**
```yaml
PREVENT:
  assuming: "Hook uses correct table name"
  reality: "Hook references non-existent table"
  verify: "grep through hooks for table names"
```

---

## ✅ Verification Sign-off

**Before ANY implementation begins:**

```yaml
verificationSignoff:
  contextVerificationComplete: false
  allQuestionsAnswered: false
  discoveriesDocumented: false
  contractUpdatedWithFindings: false
  stabilityGuideReviewed: false
  
  approvals:
    - role: "Primary Claude"
      verified: false
      timestamp: null
    - role: "User"
      verified: false
      timestamp: null
      
  readyToExecute: false # Only true when ALL above are true
```

---

## 📊 Success Formula

```
Implementation Success = 
  (Context Verification × Pre-work Hours × Stability Guides) 
  ÷ 
  (Assumptions × Unverified Context × Parallel Conflicts)
```

**Remember:** Every assumption is a potential failure point. Verify everything!

---

**Usage:** Copy the `ultraThinkContextVerification` section into EVERY contract's ultra-think phase and complete ALL verifications before implementation begins.