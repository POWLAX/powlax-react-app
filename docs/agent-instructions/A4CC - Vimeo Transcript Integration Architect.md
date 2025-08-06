# A4CC - Vimeo Transcript Integration Architect

## AUTHORIZATION & SCOPE

**Target System**: POWLAX Practice Planner - Vimeo API Transcript Integration
**Authorization Level**: Full system analysis and implementation planning
**Primary Focus**: Enhance drill recommendations through video transcript context analysis
**Scope Boundaries**: Vimeo API integration, database schema extensions, AI-powered content analysis

---

## ASSESSMENT - Current State Analysis

### Current Vimeo Integration Status
**File**: `powlax-react-app/src/lib/vimeo-service.ts` (lines 1-127)
- ✅ Basic Vimeo API service exists
- ✅ Video metadata retrieval implemented
- ✅ Mock data fallback for testing
- ❌ **NO transcript/text track functionality**

### Video-Strategy-Drill Relationship Structure
**Files Analyzed**:
- `powlax-react-app/src/components/practice-planner/DrillLibrary.tsx`
- `powlax-react-app/docs/technical/powlax-data-source-mapping.md`
- `powlax-react-app/supabase/consolidated_migration.sql`

**Current Data Flow**:
```
Strategies (Master Classes) 
    ↓ (vimeo_url field)
Video Content (Vimeo) 
    ↓ (strategies field)
Drills (Team Practice)
    ↓ (manual selection)
Practice Planning
```

**Key Findings**:
1. **Strategies** have `vimeo_url` field linking to instructional videos
2. **Drills** have `strategies[]` arrays but connection is manual
3. **NO automated content analysis** between video content and drill recommendations

### Database Schema Analysis
**Current Tables with Video Content**:
- `staging_wp_strategies` - Has `vimeo_url` field
- `staging_wp_drills` - Has `drill_video_url` field  
- `staging_wp_academy_drills` - Has `vimeo_id` field

**Missing**: No transcript storage or analysis capabilities

---

## ARCHITECTURE - Technical Integration Design

### Vimeo API Transcript Capabilities Research
**Confirmed Capabilities**:
- ✅ Vimeo API supports text track retrieval via `/videos/{video_id}/texttracks` endpoint
- ✅ Requires account owner personal access token
- ✅ Returns VTT format transcripts
- ✅ Supports auto-generated captions (`en-x-autogen`)

**API Endpoint Structure**:
```javascript
GET https://api.vimeo.com/videos/{video_id}/texttracks
Authorization: bearer {personal_access_token}
Accept: application/vnd.vimeo.*+json;version=3.4

// Returns array of text tracks with download links
```

### Proposed System Architecture

#### 1. Enhanced Vimeo Service Layer
**File**: `powlax-react-app/src/lib/vimeo-service.ts`
**New Methods Needed**:
```typescript
// Add to existing VimeoService class
async getVideoTranscripts(videoId: string): Promise<VideoTranscript[]>
async downloadTranscriptContent(transcriptUrl: string): Promise<string>
async analyzeTranscriptForSkills(transcript: string): Promise<SkillAnalysis>
```

#### 2. Database Schema Extensions
**New Tables Required**:

```sql
-- Store video transcripts
CREATE TABLE video_transcripts_powlax (
  id SERIAL PRIMARY KEY,
  video_id TEXT NOT NULL, -- Vimeo video ID
  video_url TEXT NOT NULL, -- Full Vimeo URL  
  language TEXT DEFAULT 'en',
  transcript_type TEXT DEFAULT 'auto-generated', -- 'manual', 'auto-generated'
  raw_transcript TEXT NOT NULL, -- Full VTT content
  processed_text TEXT, -- Clean text without timestamps
  skill_tags TEXT[], -- Extracted skill keywords
  concept_tags TEXT[], -- Extracted concept keywords
  drill_type_indicators TEXT[], -- Detected drill type mentions
  confidence_score DECIMAL(3,2), -- AI analysis confidence
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced strategy-drill recommendations
CREATE TABLE strategy_drill_recommendations_powlax (
  id SERIAL PRIMARY KEY,
  strategy_id INTEGER REFERENCES strategies_powlax(id),
  drill_id INTEGER REFERENCES drills_powlax(id),
  recommendation_score DECIMAL(3,2), -- 0.00-1.00 relevance
  transcript_based BOOLEAN DEFAULT FALSE,
  matched_keywords TEXT[], -- Keywords that created the match
  context_summary TEXT, -- Brief explanation of the match
  recommendation_type TEXT, -- 'skill_drill', '1v1_drill', 'concept_drill', 'team_drill'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 3. AI Content Analysis System
**Integration Points**:
- **OpenAI GPT-4**: For transcript analysis and skill extraction
- **Vector Embeddings**: For semantic similarity between strategy content and drill descriptions
- **Keyword Matching**: For explicit skill/concept identification

---

## COORDINATION - Implementation Phases

### Phase 1: Foundation (Week 1-2)
**Priority**: High - Core transcript retrieval

**Tasks**:
1. **Extend Vimeo Service** (`src/lib/vimeo-service.ts`)
   - Add text track retrieval methods
   - Add error handling for missing transcripts
   - Add transcript content processing

2. **Database Schema Updates**
   - Create `video_transcripts_powlax` table
   - Create `strategy_drill_recommendations_powlax` table
   - Add indexes for performance

3. **Basic Transcript Storage**
   - Batch process existing strategy videos
   - Store transcripts for all Vimeo URLs in database
   - Handle auto-generated vs manual transcripts

### Phase 2: Content Analysis (Week 3-4) 
**Priority**: High - AI-powered analysis

**Tasks**:
1. **AI Analysis Service** (`src/lib/transcript-analysis.ts`)
   ```typescript
   interface SkillAnalysis {
     skill_keywords: string[]
     concept_keywords: string[]
     drill_type_indicators: string[]
     technique_focus: string[]
     age_suitability: string[]
     confidence_score: number
   }
   ```

2. **Skill Extraction Logic**
   - Create lacrosse-specific keyword dictionaries
   - Implement GPT-4 analysis for context understanding
   - Map transcript content to existing skill/concept taxonomies

3. **Drill Recommendation Engine**
   - Algorithm to match strategy transcripts with drill characteristics
   - Scoring system for recommendation relevance
   - Filter by drill categories (Skill/1v1/Concept/Team)

### Phase 3: User Interface Integration (Week 5-6)
**Priority**: Medium - Coach experience enhancement

**Tasks**:
1. **Strategy Page Enhancement** (`src/app/(authenticated)/strategies/page.tsx`)
   - Display transcript-based drill recommendations
   - Show skill/concept tags extracted from videos
   - Add confidence indicators for recommendations

2. **Practice Planner Integration** (`src/components/practice-planner/`)
   - Enhanced drill filtering by transcript-derived tags
   - "Related to Strategy" recommendations in DrillLibrary
   - Context tooltips showing why drills are recommended

3. **Admin Interface** (New)
   - Transcript processing status dashboard
   - Manual override capabilities for AI recommendations
   - Batch processing tools for new videos

---

## CONSTRAINTS & CONSIDERATIONS

### Technical Constraints
1. **Vimeo API Limitations**:
   - Requires account owner token (security consideration)
   - Rate limiting for API calls
   - Not all videos may have transcripts

2. **AI Analysis Costs**:
   - GPT-4 API costs for transcript processing
   - Need efficient batching and caching strategies

3. **Data Quality**:
   - Auto-generated transcripts may have accuracy issues
   - Lacrosse terminology may not be well-recognized

### Privacy & Security
- Vimeo personal access tokens need secure storage
- Transcript data should be cached to minimize API calls
- Consider data retention policies for transcript storage

### Scalability Considerations
- Design for batch processing of large video libraries
- Implement caching layers for processed transcripts
- Consider background job processing for analysis

---

## CAPABILITIES UNLOCKED

### 1. Enhanced Drill Discovery
**Before**: Coaches manually browse drill categories
**After**: AI suggests drills based on strategy video content

**Example**: Strategy video mentions "transition offense" → Automatically recommends transition-focused drills

### 2. Contextual Practice Planning  
**Before**: Generic drill selection by category
**After**: Strategy-specific drill recommendations with explanation

**Coach Workflow**:
```
1. Coach selects "Fast Break Strategy"
2. System shows transcript summary: "Focuses on quick decision-making, outlet passes, field vision"
3. Recommended drill categories:
   - Skill Drills: "Outlet Passing", "Field Vision"
   - 1v1 Drills: "Fast Break 2v1"
   - Concept Drills: "Transition Timing"
   - Team Drills: "Full Field Transition"
```

### 3. Content Quality Insights
- Identify gaps where strategy content doesn't have supporting drills
- Surface underutilized drills that match strategy content
- Track which drills are most recommended across strategies

### 4. Automated Content Tagging
- Reduce manual tagging workload for new content
- Ensure consistent skill/concept categorization
- Enable better search and filtering capabilities

---

## IMPLEMENTATION ESTIMATE

### Development Time: 6-8 weeks
- **Phase 1**: 2 weeks (Foundation)  
- **Phase 2**: 2-3 weeks (AI Analysis)
- **Phase 3**: 2-3 weeks (UI Integration)

### Resource Requirements
- 1 Full-stack developer (primary)
- AI/ML consultation for analysis algorithms
- Access to Vimeo Pro account for API testing
- OpenAI API credits for transcript analysis

### Success Metrics
1. **Technical**: 80%+ of strategy videos have processed transcripts
2. **Accuracy**: 70%+ coach satisfaction with drill recommendations  
3. **Usage**: 40%+ increase in drill discovery through recommendations
4. **Efficiency**: 30% reduction in practice planning time

---

## NEXT STEPS

1. **Immediate**: Set up Vimeo personal access token with text track permissions
2. **Week 1**: Implement basic transcript retrieval and storage
3. **Week 2**: Begin AI analysis service development  
4. **Week 3**: Create recommendation engine algorithms
5. **Week 4**: Build user interface components
6. **Week 5**: Integration testing and refinement
7. **Week 6**: Beta testing with select coaches

This integration would transform the POWLAX practice planner from a static drill library into an intelligent, context-aware coaching assistant that leverages the rich video content already in the system.