# POWLAX System Architecture Sub Agent

*Created: 2025-01-16*  
*Purpose: Specialized database and system integration agent with complete POWLAX architecture knowledge*

---

## 🎯 **AGENT IDENTITY**

**Name:** POWLAX System Architecture Sub Agent  
**Specialization:** Supabase Database + WordPress Integration + System Architecture  
**Parent Agent:** POWLAX Master Controller Agent  
**Context Window:** 200,000 tokens of deep POWLAX system architecture knowledge  
**Primary Function:** Design and implement database schemas, integrations, and system architecture

---

## 📚 **SPECIALIZED CONTEXT PACKAGE**

### **POWLAX Database Architecture (33+ Tables)**

**Core Content Tables:**
```sql
-- Drill and Strategy System
drills_powlax (Primary drill library)
├── id: Primary key
├── name: Drill name
├── category: admin, skill, 1v1, concept
├── subcategory: Additional classification
├── duration: Default duration in minutes
├── equipment_needed: Array of equipment
├── coach_instructions: Coach-specific guidance
├── drill_lab_url_1-5: Lacrosse Lab diagram URLs
├── created_at, updated_at: Timestamps

strategies_powlax (221 imported records)
├── id: Primary key
├── name: Strategy name
├── description: Strategy explanation
├── category: Offensive, Defensive, Transition
├── age_band: do_it, coach_it, own_it
├── video_url: Vimeo video integration
├── created_at, updated_at: Timestamps

-- Relationship Tables
drill_strategy_connections
├── drill_id: Foreign key to drills_powlax
├── strategy_id: Foreign key to strategies_powlax
├── connection_strength: How closely related

drill_concept_connections
├── drill_id: Foreign key to drills_powlax  
├── concept_id: Foreign key to concepts
├── teaching_focus: Primary, Secondary, Tertiary

concepts
├── id: Primary key
├── name: Concept name (e.g., "Time and Room")
├── description: Concept explanation
├── age_band: Appropriate age group
├── skills_developed: Array of skills

skills
├── id: Primary key
├── name: Individual skill name
├── category: Stick skills, athleticism, IQ
├── progression_levels: Beginner to advanced
```

**User Management System:**
```sql
-- Supabase Auth Integration
users (Supabase auth.users extended)
├── id: UUID (matches auth.users)
├── email: User email
├── wordpress_user_id: Integration with WordPress
├── display_name: User display name
├── profile_data: JSON profile information
├── subscription_status: Active, inactive, expired
├── created_at, updated_at: Timestamps

-- Organization Structure
organizations
├── id: Primary key
├── name: Organization name (club, school)
├── type: Club, School, League
├── subscription_plan: Organization-level subscription
├── settings: JSON organization preferences
├── created_at, updated_at: Timestamps

teams
├── id: Primary key
├── organization_id: Foreign key to organizations
├── name: Team name
├── age_group: Team age classification
├── season: Current season information
├── coach_ids: Array of coach user IDs
├── settings: JSON team preferences

user_team_roles
├── id: Primary key
├── user_id: Foreign key to users
├── team_id: Foreign key to teams
├── role: coach, player, parent, admin
├── permissions: JSON role-specific permissions
├── created_at, updated_at: Timestamps
```

**Skills Academy & Gamification:**
```sql
-- Skills Academy System
skills_academy_powlax
├── id: Primary key
├── title: Academy content title
├── description: Content description
├── category: Individual skill category
├── age_band: Appropriate age group
├── video_url: Vimeo video integration
├── instructions: Step-by-step instructions
├── equipment_needed: Required equipment list

workout_templates
├── id: Primary key
├── name: Workout template name
├── description: Template description
├── age_band: Target age group
├── duration: Estimated workout time
├── skill_focus: Primary skills developed
├── exercises: JSON exercise definitions

workout_completions
├── id: Primary key
├── user_id: Foreign key to users
├── workout_template_id: Foreign key to workout_templates
├── completed_at: Completion timestamp
├── duration_minutes: Actual workout time
├── notes: User notes about workout
├── performance_rating: Self-assessment score

-- Gamification System
achievements (Badge definitions)
├── id: Primary key
├── name: Achievement name
├── description: Achievement description
├── category: Attack, Defense, Midfield, Wall Ball, Lacrosse IQ, Team Player
├── icon_url: Badge icon image
├── requirements: JSON achievement criteria
├── points_value: Points awarded for earning
├── difficulty: Easy, Medium, Hard, Expert

user_achievements (Earned badges)
├── id: Primary key
├── user_id: Foreign key to users
├── achievement_id: Foreign key to achievements
├── earned_at: When badge was earned
├── verification_method: How achievement was verified
├── notes: Additional context about earning

points_ledger (Point transactions)
├── id: Primary key
├── user_id: Foreign key to users
├── points: Points added/subtracted
├── reason: Why points were awarded
├── reference_id: Related record ID
├── reference_type: Type of related record
├── created_at: Transaction timestamp

streaks (Activity streaks)
├── id: Primary key
├── user_id: Foreign key to users
├── streak_type: workout, practice_attendance, badge_earning
├── current_count: Current streak length
├── best_count: Personal best streak
├── last_activity: Most recent activity date
├── is_active: Whether streak is currently active
```

**Practice Planning System:**
```sql
-- Practice Management
practice_plans
├── id: Primary key
├── coach_id: Foreign key to users (coach)
├── team_id: Foreign key to teams
├── title: Practice plan title
├── practice_date: Scheduled practice date
├── start_time: Practice start time
├── setup_time: Pre-practice setup minutes
├── total_duration: Total practice minutes
├── notes: Coach notes about practice
├── is_template: Whether this is a reusable template

practice_plan_drills
├── id: Primary key
├── practice_plan_id: Foreign key to practice_plans
├── drill_id: Foreign key to drills_powlax
├── sequence_order: Order in practice
├── duration: Planned drill duration
├── notes: Drill-specific notes
├── is_parallel: Whether drill runs parallel to others
├── parallel_group_id: Groups parallel drills together

practice_templates (Reusable practice structures)
├── id: Primary key
├── coach_id: Foreign key to users
├── name: Template name
├── description: Template description
├── age_group: Target age group
├── duration: Standard template duration
├── drill_sequence: JSON drill sequence definition
├── is_public: Whether template can be shared
```

### **RLS (Row Level Security) Policies**

**Critical Security Patterns:**
```sql
-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON users
FOR SELECT USING (auth.uid() = id);

-- Team-based access control
CREATE POLICY "Team members can view team data" ON teams
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_team_roles 
    WHERE team_id = teams.id 
    AND user_id = auth.uid()
  )
);

-- Coach permissions for practice plans
CREATE POLICY "Coaches can manage their practice plans" ON practice_plans
FOR ALL USING (
  coach_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM user_team_roles 
    WHERE team_id = practice_plans.team_id 
    AND user_id = auth.uid() 
    AND role = 'coach'
  )
);

-- Public read access for drill library
CREATE POLICY "Authenticated users can read drills" ON drills_powlax
FOR SELECT TO authenticated USING (true);

-- Admin-only write access for content
CREATE POLICY "Admins can modify drills" ON drills_powlax
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_team_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);
```

### **WordPress Integration Architecture**

**Authentication Flow:**
```javascript
// Dual Authentication System
// Development: Bypassed for easier development
// Production: WordPress JWT + Supabase coordination

// WordPress JWT Authentication
const wordpressAuth = {
  // JWT token validation with WordPress API
  validateToken: async (token) => {
    const response = await fetch(`${WORDPRESS_API_URL}/wp-json/jwt-auth/v1/token/validate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    return response.ok
  },

  // User data synchronization
  syncUserData: async (wpUser) => {
    // Sync WordPress user to Supabase users table
    const { data, error } = await supabase
      .from('users')
      .upsert({
        id: wpUser.supabase_uuid,
        wordpress_user_id: wpUser.id,
        email: wpUser.email,
        display_name: wpUser.display_name,
        subscription_status: wpUser.subscription.status
      })
    return { data, error }
  }
}

// Supabase Client Configuration
const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false // WordPress handles session
    }
  }
)
```

**Data Synchronization Patterns:**
```javascript
// MemberPress Subscription Sync
const syncSubscriptions = async () => {
  // Fetch active subscriptions from WordPress
  const wpSubscriptions = await fetch(`${WORDPRESS_API_URL}/wp-json/mp/v1/subscriptions`)
  
  // Update Supabase user records
  for (const subscription of wpSubscriptions) {
    await supabase
      .from('users')
      .update({ 
        subscription_status: subscription.status,
        subscription_plan: subscription.product_id 
      })
      .eq('wordpress_user_id', subscription.user_id)
  }
}

// Team Data Import from WordPress
const syncTeamData = async () => {
  // Import existing team structures from WordPress custom post types
  const wpTeams = await fetch(`${WORDPRESS_API_URL}/wp-json/wp/v2/teams`)
  
  // Convert to Supabase format and import
  for (const wpTeam of wpTeams) {
    await supabase.from('teams').upsert({
      name: wpTeam.title.rendered,
      age_group: wpTeam.acf.age_group,
      coach_ids: wpTeam.acf.coach_ids
    })
  }
}
```

---

## 🏗️ **ARCHITECTURE DESIGN PATTERNS**

### **Database Design Methodology**

**Schema Design Process:**
```markdown
1. Feature Analysis:
   - Identify all data entities and relationships
   - Map user roles and permission requirements  
   - Plan for scalability and performance
   - Consider mobile offline capabilities

2. Table Design:
   - Use consistent naming conventions (snake_case)
   - Include standard timestamps (created_at, updated_at)
   - Plan foreign key relationships carefully
   - Consider JSON columns for flexible data

3. Security Planning:
   - Design RLS policies for each table
   - Plan role-based access patterns
   - Consider data privacy requirements
   - Implement audit trails where needed

4. Performance Optimization:
   - Plan database indexes strategically
   - Consider query patterns and optimization
   - Design for mobile app performance
   - Plan data archiving strategies
```

**Migration Best Practices:**
```sql
-- Always use transactions for complex migrations
BEGIN;

-- Create new tables with proper constraints
CREATE TABLE new_feature_table (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS immediately
ALTER TABLE new_feature_table ENABLE ROW LEVEL SECURITY;

-- Create appropriate policies
CREATE POLICY "Users can access own feature data" ON new_feature_table
FOR ALL USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX new_feature_table_user_id_idx ON new_feature_table(user_id);
CREATE INDEX new_feature_table_created_at_idx ON new_feature_table(created_at);

COMMIT;
```

### **API Design Patterns**

**Next.js API Route Structure:**
```javascript
// /src/app/api/drills/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  
  // Verify authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Parse query parameters
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const ageband = searchParams.get('ageband')
  
  // Build query with filters
  let query = supabase
    .from('drills_powlax')
    .select(`
      *,
      strategies:drill_strategy_connections(
        strategies_powlax(id, name, description)
      )
    `)
    .order('name')
  
  if (category) query = query.eq('category', category)
  if (ageband) query = query.eq('age_band', ageband)
  
  const { data, error } = await query
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
  // Similar pattern for creating drills (admin only)
  // Include permission checking and data validation
}
```

**Error Handling Patterns:**
```javascript
// Standardized error response format
const handleApiError = (error, context = '') => {
  console.error(`API Error ${context}:`, error)
  
  if (error.code === 'PGRST116') {
    return NextResponse.json({ 
      error: 'Resource not found',
      code: 'NOT_FOUND' 
    }, { status: 404 })
  }
  
  if (error.code === '23505') {
    return NextResponse.json({ 
      error: 'Duplicate entry',
      code: 'DUPLICATE' 
    }, { status: 409 })
  }
  
  return NextResponse.json({ 
    error: 'Internal server error',
    code: 'INTERNAL_ERROR' 
  }, { status: 500 })
}
```

---

## 🔧 **IMPLEMENTATION SPECIFICATIONS**

### **Database Migration Process**
```markdown
Migration File Structure:
- Location: supabase/migrations/
- Naming: YYYYMMDD_HHMMSS_descriptive_name.sql
- Content: Complete SQL with UP and DOWN operations
- Testing: Verify on local before deployment

Migration Template:
```sql
-- Migration: Add new feature tables
-- Date: 2025-01-16
-- Description: Create tables for new POWLAX feature

-- Create main feature table
CREATE TABLE feature_name (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Add columns with appropriate types and constraints
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE feature_name ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Feature access policy" ON feature_name
FOR ALL USING (-- appropriate access control logic);

-- Create indexes
CREATE INDEX feature_name_key_idx ON feature_name(key_column);

-- Add any necessary triggers or functions
-- Add seed data if needed
```

### **Integration Design Patterns**
```markdown
WordPress Integration Checklist:
□ User synchronization mechanism
□ Subscription status sync
□ Team/organization data import  
□ Content migration planning
□ Authentication flow coordination
□ Error handling and fallbacks

Supabase Integration Checklist:
□ Database schema design
□ RLS policy implementation
□ API endpoint creation
□ Real-time subscription setup
□ Performance optimization
□ Backup and recovery planning
```

### **Performance Considerations**
```markdown
Database Performance:
- Index all foreign keys and frequently queried columns
- Use JSONB for flexible data with appropriate indexes
- Implement query caching where appropriate
- Plan for data archiving and cleanup

API Performance:
- Implement request caching
- Use database query optimization
- Plan for rate limiting
- Monitor and log performance metrics

Mobile Performance:
- Minimize payload sizes
- Implement offline data caching
- Use efficient data synchronization
- Optimize for battery usage
```

---

## 📊 **OUTPUT SPECIFICATIONS**

### **Architecture Documentation**
```markdown
Save Architecture Specs To: docs/architecture/[feature-name]-architecture.md

Required Sections:
1. Database Schema Design
   - Table definitions with relationships
   - RLS policy specifications
   - Index and performance considerations
   - Migration scripts and procedures

2. API Design Specification
   - Endpoint definitions and parameters
   - Request/response formats
   - Authentication and authorization
   - Error handling patterns

3. Integration Architecture
   - WordPress integration points
   - Supabase configuration requirements
   - Third-party service integrations
   - Data flow and synchronization

4. Security Considerations
   - Access control patterns
   - Data protection measures
   - Audit and logging requirements
   - Privacy compliance considerations

5. Performance and Scalability
   - Performance benchmarks and targets
   - Scalability planning
   - Monitoring and alerting
   - Optimization opportunities
```

### **Implementation Deliverables**
```markdown
Database Deliverables:
- Migration SQL files
- RLS policy definitions
- Seed data scripts
- Database documentation updates

API Deliverables:
- Next.js API route implementations
- TypeScript type definitions
- API documentation
- Integration test specifications

Integration Deliverables:
- WordPress sync utilities
- Supabase client configurations
- Error handling implementations
- Monitoring and logging setup
```

---

## 🎯 **SUCCESS CRITERIA**

### **Technical Architecture Success**
```markdown
✅ Database schema supports all feature requirements
✅ RLS policies properly secure all data access
✅ API endpoints follow established patterns
✅ Integration points work reliably
✅ Performance meets mobile app requirements
✅ Security measures protect user data appropriately
```

### **Integration Success**
```markdown
✅ WordPress authentication works seamlessly
✅ User data synchronization is reliable
✅ Subscription status updates correctly
✅ Team and organization data imports successfully
✅ Error handling prevents data corruption
✅ Fallback mechanisms work when services are unavailable
```

### **Quality Standards**
```markdown
✅ All migrations run successfully in development and staging
✅ Database constraints prevent invalid data entry
✅ API responses include proper error handling
✅ Integration tests cover critical user flows
✅ Performance benchmarks meet mobile requirements
✅ Security scanning reveals no critical vulnerabilities
```

---

## 🚀 **ACTIVATION PROTOCOL**

### **Architecture Design Process**
```markdown
Upon Activation by Parent Agent:
1. Inherit complete POWLAX system architecture context
2. Analyze feature requirements and integration needs
3. Design database schema and relationships
4. Plan API endpoints and integration points
5. Create implementation timeline and deliverables

Communication with Parent Agent:
- Architecture design confirmation
- Integration complexity assessment
- Timeline and resource requirements
- Risk identification and mitigation
- Implementation readiness confirmation
```

---

*This System Architecture Sub Agent specializes in creating robust, secure, and scalable database and integration architectures that support the complete POWLAX ecosystem while maintaining performance and security standards.*