# POWLAX Practice Planner - Drills Test Context

## Project Overview
This is a **TEST PROJECT** for building just the drills feature of the POWLAX Practice Planner in React/Next.js. This is a proof-of-concept to validate the React architecture before full migration from WordPress.

## Current State
- **Framework**: Next.js 14 with App Router
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Status**: Initial setup phase - testing drill library functionality only

## Test Scope (Drills Only)
Building a minimal viable drill library to prove the concept works:

### Features to Build:
1. **Drill List View**
   - Display all drills from Supabase
   - Show: title, category, duration, difficulty
   - Color-coded categories (matching WordPress colors)

2. **Drill Filtering**
   - Filter by category (Skill Drills, 1v1 Drills, etc.)
   - Filter by duration (5-60 minutes)
   - Search by drill name

3. **Drill Detail Modal**
   - Show full drill information
   - Display video URL (if exists)
   - Show drill notes/description
   - Display diagram URLs

4. **Favorite Drills**
   - Toggle favorite status
   - Persist favorites in Supabase
   - Show favorites count

## Database Schema (Drills Table Only)

```sql
-- Simplified drills table for testing
CREATE TABLE drills (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  duration_minutes INTEGER DEFAULT 10,
  difficulty INTEGER CHECK (difficulty >= 1 AND difficulty <= 5),
  description TEXT,
  video_url TEXT,
  diagram_urls TEXT[], -- Array of Lacrosse Lab URLs
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User favorites table
CREATE TABLE user_favorites (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  drill_id INTEGER REFERENCES drills(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, drill_id)
);
```

## Component Structure

```
app/
├── page.js                    // Home - redirects to drills
├── components/
│   ├── DrillCard.jsx         // Individual drill display
│   ├── DrillGrid.jsx         // Grid of drill cards
│   ├── DrillFilters.jsx      // Category/duration filters
│   └── DrillModal.jsx        // Drill detail popup
├── lib/
│   └── supabase.js           // Supabase client
└── (routes)/
    └── drills/
        └── page.js           // Main drills list page
```

## WordPress Reference Files
**DO NOT COPY** - Use these as reference only:
- `~/WordPress/powlax-drills/assets/js/planner.js` - See drill rendering logic
- `~/WordPress/powlax-drills/assets/css/planner.css` - Match category colors

Key things to reference:
- Category color system (lines 2834-2841 in CSS)
- Drill data structure (search for "drillsData" in JS)
- Modal patterns (but implement fresh in React)

## Category Colors to Match
```css
--category-skill-dev: #90EE90;     /* Light Green */
--category-competition: #FFA500;    /* Orange */
--category-gameplay: #87CEEB;       /* Sky Blue */
--category-team: #FFE4B5;          /* Moccasin */
--category-live-play: #FFB6C1;     /* Light Pink */
--category-admin: #E6E6FA;         /* Lavender */
```

## Test Success Criteria
1. ✅ Can display 20+ drills from Supabase
2. ✅ Category filters work instantly
3. ✅ Search updates results as you type
4. ✅ Modal shows drill details smoothly
5. ✅ Favorites persist between sessions
6. ✅ Mobile responsive (works on phone)
7. ✅ Loads in under 2 seconds

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Next Steps After Test Success
1. Add drag-and-drop to practice builder
2. Implement full practice planner
3. Add user authentication
4. Build team management features

## Notes
- This is a TEST - keep it simple
- Don't over-engineer - just prove it works
- Match WordPress UX where it was good
- Improve mobile experience (WordPress weakness)
- No authentication required for test phase

## Sample Drill Data for Testing
```javascript
const sampleDrill = {
  id: 1,
  title: "2v1 Ground Balls",  
  category: "Skill Drills",
  duration_minutes: 10,
  difficulty: 2,
  description: "Players compete for ground balls in 2v1 scenarios",
  video_url: "https://vimeo.com/123456789",
  diagram_urls: ["https://lacrosselab.com/diagram1"],
  notes: "Focus on body position and communication"
}
```

Remember: This is just a test to validate the React approach works better than WordPress!