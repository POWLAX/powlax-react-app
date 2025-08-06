# A4CC - Admin Content Management Architect

**Agent Purpose**: Build comprehensive admin interface for editing drills, strategies, and Skills Academy content directly in React with real-time Supabase updates.

**Development Environment**: Next.js development server running at `http://localhost:3000`

**Priority**: HIGH - Immediate value for content management and fixing existing data issues

---

## 🎯 **Agent Mission**

Build a comprehensive admin content management system that allows administrators to edit drills, strategies, Skills Academy content, and all Supabase table data directly within the React application. The user specifically mentioned needing to fix "bunch of strategies that have the wrong lacrosse lab links" and wants to "edit strategies, drills, academy drills, skills, concepts, anything we have added to the Supabase tables right in React."

---

## 📍 **Current State Analysis**

### **Existing Admin Infrastructure**
- ✅ **Admin Routes**: `/src/app/(authenticated)/admin/` exists with role management and sync pages
- ✅ **Role-Based Access**: Admin role detection in dashboard page
- ✅ **Database Connection**: Supabase integration fully functional
- ✅ **UI Components**: shadcn/ui components available

### **Content Tables to Manage**
- `drills` - Practice drills with lacrosse lab URLs, strategies, skills
- `strategies_powlax` - Strategy content with video links, diagrams  
- `skills_academy_drills` - Individual Skills Academy drills
- `skills_academy_workouts` - Workout collections
- `strategies` - Game phase strategies
- `concepts` - Teaching concepts
- `skills` - Granular abilities

### **Key Issues to Address**
- ❌ **No Content Editing Interface**: Currently no way to edit content in React
- ❌ **Broken Lacrosse Lab Links**: Multiple strategies have incorrect URLs
- ❌ **WordPress Dependency**: Content editing still requires WordPress admin

---

## 🎯 **Implementation Requirements**

### **Phase 1: Core Content Editor (2-3 hours)**

#### **Files to Create**
```
/src/app/(authenticated)/admin/content-editor/
├── page.tsx                    # Main content editor dashboard
├── drills/
│   ├── page.tsx               # Drill list with search/filter
│   └── [id]/
│       └── page.tsx           # Individual drill editor
├── strategies/
│   ├── page.tsx               # Strategy list with search/filter  
│   └── [id]/
│       └── page.tsx           # Individual strategy editor
└── academy/
    ├── page.tsx               # Academy content list
    └── [id]/
        └── page.tsx           # Individual academy drill editor
```

#### **Components to Create**
```
/src/components/admin/content-editor/
├── ContentEditorLayout.tsx     # Shared layout with navigation
├── DrillEditor.tsx            # Drill editing form
├── StrategyEditor.tsx         # Strategy editing form  
├── AcademyDrillEditor.tsx     # Skills Academy drill editor
├── ContentTable.tsx          # Reusable data table with search/filter
├── FieldEditor.tsx           # Generic field editing component
└── BulkActions.tsx           # Bulk edit/delete operations
```

### **Core Features Required**

#### **1. Drill Editor** (`DrillEditor.tsx`)
**Editable Fields**:
- `name` (text input)
- `description` (rich text editor)
- `category` (dropdown)
- `duration_min` (number input)
- `difficulty_level` (1-5 slider)
- `drill_video_url` (URL input with validation)
- `drill_lab_url_1` through `drill_lab_url_5` (URL inputs)
- `skill_ids` (multi-select with existing skills)
- `concept_ids` (multi-select with existing concepts)
- `strategy_ids` (multi-select with existing strategies)
- `notes` (textarea)

**Validation Requirements**:
- URL validation for video and lab links
- Required field validation
- Difficulty score 1-5 range
- Duration positive integer

#### **2. Strategy Editor** (`StrategyEditor.tsx`)
**Editable Fields**:
- `name` (text input)
- `description` (rich text editor)
- `game_phase` (dropdown from existing phases)
- `complexity_level` (1-5 slider)
- `video_url` (URL input with Vimeo validation)
- `diagram_url` (URL input)
- `lacrosse_lab_urls` (array of URL inputs - **PRIORITY FIX**)
- `drill_recommendations` (multi-select drills)
- `prerequisite_strategies` (multi-select strategies)

#### **3. Skills Academy Editor** (`AcademyDrillEditor.tsx`)
**Editable Fields**:
- `title` (text input)
- `vimeo_id` (text input with validation)
- `drill_category` (multi-select array)
- `equipment_needed` (multi-select array)
- `complexity` (dropdown: foundation/building/advanced)
- `duration_minutes` (number input)
- `point_values` (JSON editor for categories)
- `age_progressions` (JSON editor for do_it/coach_it/own_it)

### **Phase 2: Advanced Features (1-2 hours)**

#### **Bulk Operations**
- Multi-select rows with checkboxes
- Bulk edit common fields (category, difficulty, etc.)
- Bulk delete with confirmation
- Export selected items to CSV/JSON

#### **Search & Filter System**
- Real-time search across all text fields
- Filter by category, difficulty, game phase
- Sort by name, created date, last modified
- Saved filter presets

#### **Audit Trail**
- Track all changes with user ID and timestamp
- Show edit history for each content item
- Revert to previous versions
- Export audit logs

### **Phase 3: Quality Assurance (30 minutes)**

#### **Data Validation**
- URL checker for all video/lab links
- Broken link detection and reporting
- Duplicate content detection
- Missing field reporting

#### **Batch Import/Export**
- CSV import for bulk updates
- JSON export for backup
- Template downloads for data entry
- Import validation and error reporting

---

## 🔧 **Technical Implementation Details**

### **Database Integration Patterns**

#### **Supabase CRUD Operations**
```typescript
// Example for drill editing
const updateDrill = async (id: string, updates: Partial<Drill>) => {
  const { data, error } = await supabase
    .from('drills')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()
    
  if (error) throw error
  return data
}
```

#### **Real-time Updates**
```typescript
// Subscribe to changes for live updates
useEffect(() => {
  const subscription = supabase
    .channel('content-changes')
    .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'drills' },
        (payload) => {
          // Update local state
          handleDrillUpdate(payload)
        }
    )
    .subscribe()
    
  return () => subscription.unsubscribe()
}, [])
```

### **Form Handling Patterns**

#### **React Hook Form Integration**
```typescript
const DrillEditorForm = ({ drill }: { drill: Drill }) => {
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: drill
  })
  
  const onSubmit = async (data: Drill) => {
    try {
      await updateDrill(drill.id, data)
      toast.success('Drill updated successfully')
    } catch (error) {
      toast.error('Failed to update drill')
    }
  }
  
  // Auto-save functionality
  const watchedValues = watch()
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Auto-save logic
    }, 2000)
    return () => clearTimeout(timeoutId)
  }, [watchedValues])
}
```

### **URL Validation for Lacrosse Lab Links**
```typescript
const validateLacrosseLabUrl = (url: string): boolean => {
  // Validate Lacrosse Lab URL format
  const lacrosseLabPattern = /^https:\/\/(www\.)?lacrosselab\.(com|net)/
  return lacrosseLabPattern.test(url)
}

const validateVimeoUrl = (url: string): boolean => {
  // Validate Vimeo URL format
  const vimeoPattern = /^https:\/\/(player\.)?vimeo\.com\/video\/\d+/
  return vimeoPattern.test(url)
}
```

---

## 🎨 **UI/UX Requirements**

### **Layout Structure**
```
┌─────────────────────────────────────────────────┐
│ Admin Content Editor                             │
├─────────────────────────────────────────────────┤
│ [Drills] [Strategies] [Academy] [Skills] [Bulk] │
├─────────────────────────────────────────────────┤
│ Search: [________________]  Filter: [_______]   │
├─────────────────────────────────────────────────┤
│ ☐ Drill Name 1      | Category    | Modified   │
│ ☐ Drill Name 2      | Category    | Modified   │
│ ☐ Drill Name 3      | Category    | Modified   │
│ ☐ Strategy Name 1   | Game Phase  | Modified   │
├─────────────────────────────────────────────────┤
│ [Edit Selected] [Delete Selected] [Export]      │
└─────────────────────────────────────────────────┘
```

### **Editor Form Layout**
```
┌─────────────────────────────────────────────────┐
│ ← Back to List    Drill Editor    [Save] [Del]  │
├─────────────────────────────────────────────────┤
│ Name: [________________________________]        │
│ Category: [Dropdown___] Duration: [__] min      │
│ Difficulty: ●●●○○ (3/5)                        │
│                                                 │
│ Description:                                    │
│ ┌─────────────────────────────────────────────┐ │
│ │ Rich text editor for description            │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ Video URL: [_______________________________]    │
│ Lab URL 1: [_______________________________]    │
│ Lab URL 2: [_______________________________]    │
│                                                 │
│ Skills: [Multi-select dropdown____________]     │
│ Concepts: [Multi-select dropdown__________]     │
│                                                 │
│ [Save Changes] [Reset] [Preview]               │
└─────────────────────────────────────────────────┘
```

### **Visual Feedback**
- ✅ Green checkmarks for validated URLs
- ❌ Red X for broken/invalid URLs  
- 🟡 Yellow warning for missing required fields
- Auto-save indicator with timestamp
- Loading states for all operations
- Success/error toast notifications

---

## ✅ **Acceptance Criteria**

### **Phase 1 Complete When**:
- [ ] Admin can view list of all drills with search/filter
- [ ] Admin can edit individual drill fields and save to Supabase
- [ ] Admin can edit strategy Lacrosse Lab URLs and fix broken links
- [ ] Admin can edit Skills Academy drill content
- [ ] All changes reflect immediately in the live application
- [ ] Form validation prevents invalid data entry

### **Phase 2 Complete When**:
- [ ] Bulk operations work for multiple items
- [ ] Search and filter work across all content types
- [ ] Audit trail tracks all changes with user attribution
- [ ] Export functionality generates usable data files

### **Phase 3 Complete When**:
- [ ] URL validation catches broken links
- [ ] Data integrity checks prevent corruption
- [ ] Import/export handles large datasets
- [ ] Performance remains fast with 1000+ items

---

## 🚀 **Immediate Action Items**

### **Start Here** (Next 30 minutes):
1. **Create admin content editor route structure**
2. **Build basic drill list view with Supabase data**
3. **Implement simple drill editor form**
4. **Test editing and saving one drill field**

### **Priority Fix** (Next 60 minutes):
1. **Focus on strategy Lacrosse Lab URL editing**
2. **Build URL validation for lab links**
3. **Create interface to find and fix broken URLs**
4. **Test fixing actual broken links in database**

### **Core Features** (Next 90 minutes):
1. **Complete drill editor with all fields**
2. **Add strategy editor with full functionality**
3. **Implement Skills Academy drill editing**
4. **Add search and basic filtering**

---

## 🔍 **Testing & Validation**

### **Manual Testing Checklist**
- [ ] Edit drill name and verify change in practice planner
- [ ] Fix strategy Lacrosse Lab URL and verify link works
- [ ] Edit Skills Academy drill and verify in workout player
- [ ] Test bulk operations with multiple items
- [ ] Verify audit trail captures all changes

### **Data Integrity Checks**
- [ ] Foreign key relationships maintained
- [ ] Required fields enforced
- [ ] URL formats validated
- [ ] JSON fields properly structured
- [ ] No orphaned records created

### **Performance Testing**
- [ ] List view loads quickly with 1000+ items
- [ ] Search responds in real-time
- [ ] Form saves without blocking UI
- [ ] Bulk operations complete efficiently

---

## 📚 **Resources & References**

### **Existing Codebase Patterns**
- Study `/src/app/(authenticated)/admin/role-management/page.tsx` for admin interface patterns
- Review `/src/hooks/usePracticePlans.ts` for Supabase CRUD operations
- Reference `/src/components/practice-planner/DrillLibrary.tsx` for drill data handling

### **Database Schema**
- Check `/docs/existing/v3-supabase-tables-list.md` for complete field definitions
- Review migration files in `/supabase/migrations/` for table structures
- Use `/scripts/database/check-supabase-tables.ts` for schema validation

### **UI Components**
- Use existing shadcn/ui components for consistency
- Follow patterns from practice planner components
- Maintain mobile-responsive design principles

---

## 🎯 **Success Metrics**

- **Immediate Value**: Admin can fix broken Lacrosse Lab URLs within 2 hours
- **Content Velocity**: Editing content 10x faster than WordPress admin
- **Data Quality**: Zero broken URLs or invalid data entries
- **User Adoption**: Admin uses React editor instead of WordPress
- **System Integration**: Changes reflect immediately across all app features

Start with the broken Lacrosse Lab URL fix - this provides immediate, tangible value while establishing the content editing infrastructure for everything else!