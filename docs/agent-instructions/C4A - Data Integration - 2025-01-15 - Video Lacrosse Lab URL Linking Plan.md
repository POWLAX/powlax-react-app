# C4A Data Integration Plan: Video & Lacrosse Lab URL Linking

## 🎯 Mission Statement

**Objective**: Create a comprehensive data integration plan to link lacrosse lab URLs to strategy videos, categorize by game phases, formations, and educational content, and prepare final CSV for Supabase upload.

**Data Sources:**
- `Video Sheet with Vimeo References for Supabase Upload.csv` (186 rows)
- `POWLAX Lacrosse Lab URLS - Strategies and Concepts.csv` (1,435 rows)

**Expected Deliverable**: Integrated CSV with proper video-to-diagram linkings, formation categorizations, and game phase assignments.

---

## 📋 Data Structure Analysis

### **Video Sheet Structure (Primary Data):**
- **Column A**: `id` (empty in most rows)
- **Column B**: `strategy_id` (empty in most rows) 
- **Column C**: `name` (video title)
- **Column D**: **Reference Number** (KEY LINKING FIELD: 1, 2, 3, 4, 6, 7, 8, etc.)
- **Column E**: `Content` (video description)
- **Column F**: `type` (offense, defense, man-up, etc.)
- **Column G**: `category` (subcategories)
- **Columns H-T**: Age bands, PDFs, Vimeo IDs, etc.

### **Lacrosse Lab URLs Structure (Diagram Data):**
- **Column A-E**: Hierarchical path (B→C→D→E creates full path)
- **Column F**: `name` (diagram name)
- **Column G**: **CSV Reference** (KEY LINKING FIELD: matches Column D from videos)
- **Column H**: Embed code (iframe)
- **Column I**: Share link (direct URL)
- **Column L**: `description` (detailed description)

### **Current Linking Status:**
- **Partial Cross-Reference**: User has begun linking in Column G of lacrosse lab URLs
- **Confirmed Matches Found**: 
  - Video ID 4 → Multiple lacrosse lab diagrams with CSV Reference "4"
  - Video ID 15 → Multiple lacrosse lab diagrams with CSV Reference "15"
  - Video ID 183 → Multiple lacrosse lab diagrams with CSV Reference "183"

---

## 🔍 Phase 1: Data Analysis & Validation

### **Step 1.1: Cross-Reference Validation**
**Task**: Verify existing linking between Video Column D and Lacrosse Lab Column G

**Process**:
1. Extract all unique values from Video CSV Column D (Reference Numbers)
2. Extract all unique values from Lacrosse Lab CSV Column G (CSV Reference)
3. Create matching matrix to identify:
   - **Complete matches**: Videos with corresponding lacrosse lab URLs
   - **Orphaned videos**: Videos without lacrosse lab diagrams
   - **Orphaned diagrams**: Lacrosse lab URLs without video matches
   - **Multiple diagram groups**: Videos with >5 lacrosse lab URLs (need " - 2" splits)

**Expected Output**: Cross-reference validation report with statistics

### **Step 1.2: Content Description Matching**
**Task**: Use semantic matching between Video Column E and Lacrosse Lab Column L for additional links

**Process**:
1. Compare video descriptions (Column E) with diagram descriptions (Column L)
2. Use keyword matching for concepts, formations, and techniques
3. Flag potential matches for manual review
4. Prioritize matches where CSV Reference is empty or uncertain

**Expected Output**: Potential content-based matches for manual verification

---

## 🏗️ Phase 2: Formation & Game Phase Categorization

### **Step 2.1: Formation Classification**
**Offensive Formations Identified:**
- **21-12 Motion Offense** (combines 2-2-2, 2-3-1, 1-3-2, Open)
- **1-4-1 Variations** (Double Mumbo, Wing Pairs, Shifted Triangles)
- **Penn State Offense** (1-4-1 Wing Pairs, 3 High Pairs, Picks Behind)
- **2-2-2 Set** (Top, Sides, Center variations)
- **2-3-1 Formation**
- **3-1-2 Formation** 
- **Open Formation**
- **Box Offense** (Up Pick, Down Pick, Weave)

**Defensive Schemes Identified:**
- **Zone Defense** (Box and 1, 2-3 Zone, rotational zones)
- **Man-to-Man Defense** (Adjacent slide, 5-man rotation)
- **Man-Down Defense** (4-man rotation, 5-man rotation, Box and 1)

**Process**:
1. Scan video names and descriptions for formation keywords
2. Scan lacrosse lab hierarchical paths (Columns B-E) for formation categories
3. Create formation taxonomy with primary/secondary classifications
4. Assign formation tags to each video-diagram group

### **Step 2.2: Game Phase Assignment**
**Game Phases Framework:**
1. **Face-off**: Specialized face-off plays and strategies
2. **Transition Offense**: Fast breaks, slow breaks, numbered advantages
3. **Transition Defense**: Riding, clearing, defensive transitions  
4. **Settled Offense**: Half-field offensive sets and motion
5. **Settled Defense**: Half-field defensive schemes and slides
6. **Special Teams**: Man-up, man-down, extra-man situations
7. **Individual Skills**: 1v1, dodging, shooting, stick skills
8. **Team Concepts**: Strategy, systems, coaching philosophy

**Process**:
1. Analyze video type/category fields for game phase indicators
2. Review lacrosse lab hierarchical structure for phase groupings
3. Cross-reference content descriptions for situational context
4. Assign primary game phase with secondary phases where applicable

### **Step 2.3: Educational Content Classification**
**Educational Categories:**
- **Technical Skills**: Shooting, passing, dodging, ground balls
- **Tactical Concepts**: 2-man games, picks, cuts, spacing
- **Coaching Strategy**: Practice planning, player development
- **Rules & Regulations**: Technical fouls, game management  
- **Player Development**: Recruiting advice, mental preparation
- **Drill Instructions**: Practice drills, competitive games

---

## 🔧 Phase 3: Data Integration & Organization

### **Step 3.1: Primary Video-Diagram Linking**
**Process**:
1. **Direct ID Matching**: Link videos to diagrams using Column D ↔ Column G matching
2. **Quantity Management**: For videos with >5 lacrosse lab URLs:
   - Create primary row with first 5 diagram URLs
   - Create secondary row with title suffix " - 2" for additional diagrams
   - Continue pattern (" - 3", " - 4") if needed
3. **URL Field Population**: 
   - `drill_lab_url_1` through `drill_lab_url_5` (max 5 per row)
   - Use share links from Lacrosse Lab Column I

### **Step 3.2: Enhanced Data Fields Addition**
**New Fields to Add:**
- `formation_primary`: Main offensive/defensive formation
- `formation_secondary`: Secondary formation if applicable  
- `game_phase_primary`: Primary game phase (1-8 from framework)
- `game_phase_secondary`: Secondary phases where relevant
- `educational_category`: Educational content classification
- `concepts`: Key teaching concepts (from existing strategies field)
- `skills_focus`: Individual skills emphasized
- `age_appropriateness`: Alignment with "do it, coach it, own it" framework

### **Step 3.3: Quality Control & Validation**
**Validation Checks**:
1. **Completeness**: Ensure all videos have appropriate categorizations
2. **Consistency**: Verify formation and phase assignments align with content
3. **URL Validity**: Test sample of lacrosse lab URLs for accessibility
4. **Duplicate Detection**: Identify and resolve duplicate content
5. **Missing Links**: Flag videos without lacrosse lab diagrams for manual review

---

## 📊 Phase 4: Final CSV Preparation

### **Step 4.1: Consolidated CSV Structure**
**Final CSV Columns** (existing + new):
```
id, strategy_id, name, reference_id, content, type, category,
formation_primary, formation_secondary, game_phase_primary, game_phase_secondary,
educational_category, concepts, skills_focus, age_appropriateness,
drill_lab_url_1, drill_lab_url_2, drill_lab_url_3, drill_lab_url_4, drill_lab_url_5,
see_n_do_it, coach_it, own_it, pdf, target_audience, lesson_category,
playbook_url, vimeo_id, featured_image
```

### **Step 4.2: Supabase Upload Preparation**
**Database Considerations**:
1. **Primary Key**: Use auto-generated ID or existing reference numbers
2. **Foreign Key Relationships**: Link to existing strategies and concepts tables
3. **JSON Fields**: Consider storing drill_lab_urls as JSON array for flexibility
4. **Index Fields**: Formation, game_phase, educational_category for fast queries
5. **Full-Text Search**: Enable on name, content, concepts fields

### **Step 4.3: Data Migration Strategy**
**Upload Sequence**:
1. **Validation CSV**: Test subset with 10-20 complete records
2. **Formation Verification**: Ensure formation taxonomy aligns with existing data
3. **Full Upload**: Complete dataset with all linkings and categorizations
4. **Post-Upload Testing**: Verify query performance and data integrity

---

## 🎯 Implementation Approach

### **Option A: Automated Script Approach**
**Advantages**: Fast processing, consistent rules, scalable
**Process**: 
1. Python/TypeScript script to parse both CSVs
2. Automated cross-referencing using ID matching
3. Rule-based formation and phase assignment
4. Output integrated CSV ready for Supabase

**Recommended For**: Bulk processing, initial data integration

### **Option B: Hybrid Manual-Automated Approach**  
**Advantages**: Higher accuracy, domain expertise application, flexible
**Process**:
1. Automated cross-referencing for clear ID matches
2. Manual review for complex content matching
3. Expert validation of formation and phase assignments
4. Iterative refinement based on lacrosse knowledge

**Recommended For**: Final production dataset, quality assurance

### **Option C: Agent-Assisted Approach**
**Advantages**: Leverages AI pattern recognition, maintains oversight
**Process**:
1. Use `dev` agent for technical CSV processing and script creation
2. Use `analyst` agent for content analysis and categorization
3. Use domain expert for lacrosse-specific validation
4. Use `qa` agent for final validation and testing

**Recommended For**: POWLAX project integration, learning system development

---

## 📋 Success Metrics

### **Quantitative Goals**:
- **>95% Video Coverage**: At least 95% of videos linked to lacrosse lab diagrams
- **100% Formation Classification**: All videos assigned appropriate formation tags
- **100% Game Phase Assignment**: All content categorized by game phase
- **Zero Broken Links**: All lacrosse lab URLs validated and accessible
- **<5% Manual Review**: Less than 5% of linkings require manual intervention

### **Qualitative Goals**:
- **Logical Consistency**: Formation and phase assignments align with lacrosse expertise
- **Educational Value**: Categorizations support coach and player development needs
- **User Experience**: Integrated data supports intuitive practice planning workflows
- **System Performance**: Database queries return results in <200ms

---

## 🚀 Next Steps & Recommendations

### **Immediate Actions** (Week 1):
1. **Data Export & Analysis**: Extract unique IDs and analyze cross-reference patterns
2. **Formation Taxonomy Development**: Create comprehensive formation classification system
3. **Sample Integration**: Process 20-30 video records as proof of concept
4. **Tool Selection**: Choose between automated script vs. agent-assisted approach

### **Development Phase** (Weeks 2-3):
1. **Primary Integration**: Link all videos with direct ID matches to lacrosse lab URLs
2. **Content Analysis**: Use description matching for additional linkings
3. **Categorization Engine**: Implement formation and game phase assignment logic
4. **Quality Assurance**: Validate sample outputs with lacrosse domain expertise

### **Production Phase** (Week 4):
1. **Full Dataset Processing**: Complete integration of all 186 videos
2. **Final CSV Generation**: Output production-ready dataset for Supabase
3. **Database Migration**: Upload and test integrated data
4. **Performance Optimization**: Index and optimize for practice planner queries

---

**Final Note**: This plan addresses the complex multi-layered data integration while maintaining lacrosse domain expertise and supporting the POWLAX practice planning system. The flexible approach allows for both automated efficiency and manual quality control where domain knowledge is critical.