# POWLAX Drill-Level Gamification Integration Plan

**Date**: January 15, 2025  
**Purpose**: Comprehensive implementation plan for drill-level point system with anti-gaming measures  
**Integration**: Existing Supabase tables and gamification architecture

---

## 🎯 **Executive Summary**

Transform POWLAX from workout-based to **drill-level gamification** where individual drills contribute points toward badges, with escalating multipliers (2x for workouts 6-10, 3x for 11-15) and anti-gaming timer validation. Each drill can contribute to multiple badges with proportional point distribution based on skill relevance.

---

## 📊 **Current Supabase Table Architecture**

### **Core Tables (CONFIRMED EXISTING)**

#### **1. Drill Content Tables**
```sql
-- Skills Academy Individual Drills
skills_academy_drills (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    vimeo_id VARCHAR(50),
    drill_category TEXT[],           -- ['Offense (with ball)', 'Cradling']
    equipment_needed TEXT[],
    complexity VARCHAR(50),          -- 'foundation', 'building', 'advanced'
    duration_minutes INTEGER,
    point_values JSONB,             -- Current point structure
    tags TEXT[]
)

-- Wall Ball Individual Drills  
powlax_wall_ball_drill_library (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    strong_hand_video_url TEXT,
    off_hand_video_url TEXT,
    both_hands_video_url TEXT,
    description TEXT,
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5)
)
```

#### **2. Gamification Tables**
```sql
-- Badge Definitions
badges_powlax (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,                -- KEY: Used for drill mapping
    icon_url TEXT,
    category VARCHAR(100),           -- 'attack', 'defense', 'midfield', 'wall_ball'
    points_type_required VARCHAR(50), -- 'attack_token', 'defense_dollar', etc.
    points_required INTEGER
)

-- User Points Tracking
user_points_balance_powlax (
    user_id UUID,
    point_type VARCHAR(50),         -- 'lax_credit', 'attack_token', etc.
    balance INTEGER,
    total_earned INTEGER,
    last_earned_at TIMESTAMP
)

-- Points Transaction Audit
points_transactions_powlax (
    user_id UUID,
    point_type VARCHAR(50),
    amount INTEGER,
    source_type VARCHAR(50),        -- 'drill_completion'
    source_id INTEGER,              -- drill_id
    description TEXT,
    metadata JSONB                  -- Multipliers, workout context
)
```

#### **3. Progress Tracking Tables**
```sql
-- Workout Completions (EXISTING)
powlax_workout_completions (
    user_id UUID,
    workout_type VARCHAR(50),       -- 'skills_academy', 'wall_ball'
    workout_id INTEGER,
    completed_at TIMESTAMP,
    completion_time_seconds INTEGER,
    score INTEGER
)

-- Individual Drill Completions (EXISTING)
powlax_drill_completions (
    user_id UUID,
    drill_type VARCHAR(50),         -- 'skills_academy', 'wall_ball'
    drill_id INTEGER,
    completed_at TIMESTAMP,
    completion_time_seconds INTEGER,
    quality_score INTEGER           -- 1-5 rating
)
```

---

## 🔥 **New Drill-Level Point System Design**

### **1. Core Point Calculation Formula**
```typescript
// Base Points Per Drill
const basePoints = {
  foundation: 10,    // Complexity level 1-2
  building: 15,      // Complexity level 3
  advanced: 25       // Complexity level 4-5
}

// Workout Position Multipliers (YOUR KEY REQUIREMENT)
const workoutMultipliers = {
  workouts_1_5: 1.0,     // Standard rate
  workouts_6_10: 2.0,    // Double points
  workouts_11_15: 3.0    // Triple points
}

// Final Calculation
drillPoints = basePoints[complexity] * workoutMultiplier * consistencyBonus * timingValidation
```

### **2. Anti-Gaming Timer Validation**
```typescript
interface DrillTimingValidation {
  minimumTime: number      // 80% of expected drill duration
  maximumTime: number      // 300% of expected duration
  expectedDuration: number // From drill.duration_minutes
  actualDuration: number   // User's completion time
  isValid: boolean        // Passes timing validation
  validationMultiplier: number // 0.5 if suspicious, 1.0 if valid
}

// Implementation
function validateDrillTiming(drill: Drill, completionTime: number): DrillTimingValidation {
  const expected = drill.duration_minutes * 60 // Convert to seconds
  const minimum = expected * 0.8  // Must take at least 80% of time
  const maximum = expected * 3.0  // But not more than 3x (reasonable for learning)
  
  const isValid = completionTime >= minimum && completionTime <= maximum
  const validationMultiplier = isValid ? 1.0 : 0.5 // Penalty for suspicious timing
  
  return {
    minimumTime: minimum,
    maximumTime: maximum,
    expectedDuration: expected,
    actualDuration: completionTime,
    isValid,
    validationMultiplier
  }
}
```

### **3. Multi-Badge Point Distribution System**
```typescript
interface DrillBadgeMapping {
  drillId: number
  applicableBadges: {
    badgeId: number
    relevanceScore: number    // 0.0 - 1.0 based on description analysis
    pointType: string        // 'attack_token', 'defense_dollar', etc.
    distributionWeight: number // Percentage of points for this badge
  }[]
}

// Example: "2 Hand Cradle Away Drill"
const exampleMapping = {
  drillId: 47507,
  applicableBadges: [
    {
      badgeId: 12, // "Ball Handling Master"
      relevanceScore: 0.9,
      pointType: 'attack_token',
      distributionWeight: 0.6  // 60% of drill points
    },
    {
      badgeId: 23, // "Offensive Fundamentals"  
      relevanceScore: 0.7,
      pointType: 'attack_token',
      distributionWeight: 0.4  // 40% of drill points
    }
  ]
}
```

---

## 🚀 **Implementation Plan**

### **Phase 1: Database Schema Extensions (Week 1)**

#### **1.1: Add Required Columns**
```sql
-- Add difficulty scoring to Skills Academy drills
ALTER TABLE skills_academy_drills 
ADD COLUMN IF NOT EXISTS difficulty_score INTEGER DEFAULT 3 CHECK (difficulty_score BETWEEN 1 AND 5);

-- Add workout position tracking
ALTER TABLE powlax_workout_completions
ADD COLUMN IF NOT EXISTS workout_position INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS weekly_workout_count INTEGER DEFAULT 1;

-- Add drill timing validation
ALTER TABLE powlax_drill_completions
ADD COLUMN IF NOT EXISTS expected_duration_seconds INTEGER,
ADD COLUMN IF NOT EXISTS timing_validation_passed BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS timing_multiplier DECIMAL(3,2) DEFAULT 1.0;
```

#### **1.2: Create Drill-Badge Mapping Table**
```sql
CREATE TABLE IF NOT EXISTS drill_badge_mappings_powlax (
    id SERIAL PRIMARY KEY,
    drill_id INTEGER NOT NULL,
    drill_type VARCHAR(50) NOT NULL, -- 'skills_academy' or 'wall_ball'
    badge_id INTEGER REFERENCES badges_powlax(id),
    relevance_score DECIMAL(3,2) CHECK (relevance_score BETWEEN 0 AND 1),
    point_distribution_weight DECIMAL(3,2) CHECK (point_distribution_weight BETWEEN 0 AND 1),
    point_type VARCHAR(50) REFERENCES point_types_powlax(name),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(drill_id, drill_type, badge_id)
);
```

#### **1.3: Create Consistency Tracking**
```sql
CREATE TABLE IF NOT EXISTS user_consistency_tracking_powlax (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users,
    drill_id INTEGER NOT NULL,
    drill_type VARCHAR(50) NOT NULL,
    week_of_year INTEGER NOT NULL,   -- ISO week number
    completion_count INTEGER DEFAULT 0,
    last_completed_at TIMESTAMP,
    consistency_bonus_earned DECIMAL(3,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, drill_id, drill_type, week_of_year)
);
```

Continue reading the next section...
