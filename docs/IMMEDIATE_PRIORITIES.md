# POWLAX React App - Immediate Development Priorities

## Critical Tasks for Next Few Days

### 1. 🗄️ Team Migrations Verification
**Priority: CRITICAL**
- [ ] Verify all team-related database migrations are correct
- [ ] Test team creation, joining, and role assignment flows
- [ ] Validate the following tables and relationships:
  - `organizations`
  - `teams`
  - `user_team_roles`
  - `team_invitations`
- [ ] Ensure WordPress team sync is working correctly
- [ ] Test multi-role support (coaches, players, parents)
- [ ] Verify data integrity after migration

**Files to Review:**
- `/supabase/migrations/` - All team-related migrations
- `/src/lib/wordpress-team-sync.ts`
- `/src/app/api/sync/teams/route.ts`

---

### 2. 🛠️ Backend Drill/Strategy Editor Component
**Priority: HIGH**
- [ ] Create admin interface for editing drills and strategies
- [ ] Build CRUD operations for:
  - Individual drills (`drills_powlax` table)
  - Strategies (`strategies_powlax` table)
  - Skills Academy content (`skills_academy_powlax` table)
- [ ] Features needed:
  - Edit drill title, description, difficulty
  - Update video URLs and Lacrosse Lab URLs
  - Modify categorization and tags
  - Adjust point values and complexity scores
  - Save changes directly to database
- [ ] Add role-based access control (admin only)
- [ ] Include validation and error handling

**Proposed Location:**
- `/src/app/admin/content-editor/`
- `/src/components/admin/drill-editor/`
- `/src/components/admin/strategy-editor/`

---

### 3. 🖨️ Practice Planner Print Functionality
**Priority: HIGH**
- [ ] Implement print-friendly CSS for practice plans
- [ ] Create print preview component
- [ ] Features to include:
  - Clean layout optimized for paper
  - Remove unnecessary UI elements
  - Include practice metadata (date, duration, team)
  - List drills with timing and notes
  - QR code for accessing digital version
- [ ] Test on multiple browsers and printers
- [ ] Add "Export to PDF" option

**Files to Update:**
- `/src/components/practice-planner/PracticePlanner.tsx`
- `/src/components/practice-planner/PrintView.tsx` (new)
- `/src/styles/print.css` (new)

---

### 4. 🎓 Skills Academy Interface Build-Out
**Priority: HIGH**
- [ ] Complete the Skills Academy dashboard
- [ ] Build workout selection interface
- [ ] Implement progress tracking views
- [ ] Create certification/badge display
- [ ] Add interactive elements:
  - Video tutorials with progress tracking
  - Quizzes and assessments
  - Skill progression paths
  - Achievement unlocking
- [ ] Connect to gamification system

**Components Needed:**
- Workout browser with filters
- Progress dashboard
- Achievement gallery
- Interactive workout player
- Quiz/assessment interface

---

### 5. 💪 Skills Academy Workouts Migration
**Priority: HIGH**
- [ ] Import all workouts from original WordPress app
- [ ] Structure in database:
  ```sql
  - workout_id
  - name
  - description
  - workout_type (beginner/intermediate/advanced)
  - duration_minutes
  - drills[] (array of drill IDs)
  - point_values
  - prerequisites
  - video_urls
  ```
- [ ] Create workout templates
- [ ] Build workout progression system
- [ ] Test point calculation and rewards

**Data Sources:**
- `/csv-exports/` - Legacy workout data
- Original WordPress database exports
- `/scripts/import-workouts.ts` (to be created)

---

### 6. 🗺️ Complete App Structure & Navigation Documentation
**Priority: MEDIUM**
- [ ] Document all existing pages and routes
- [ ] Create comprehensive sitemap
- [ ] Build navigation structure document
- [ ] Identify missing pages that need creation
- [ ] Map user journeys for each role type

**Deliverables:**
- Complete sitemap with all routes
- User flow diagrams
- Navigation hierarchy
- List of pages to be created
- Role-based access matrix

---

## Implementation Order

### Day 1-2: Foundation
1. **Morning**: Verify team migrations
2. **Afternoon**: Start backend editor component
3. **Evening**: Test and fix any migration issues

### Day 3-4: Content Management
1. **Morning**: Complete drill/strategy editor
2. **Afternoon**: Implement print functionality
3. **Evening**: Import Skills Academy workouts

### Day 5-6: User Experience
1. **Morning**: Build out Skills Academy interface
2. **Afternoon**: Complete navigation documentation
3. **Evening**: Integration testing

### Day 7: Polish & Testing
1. **Morning**: Bug fixes from testing
2. **Afternoon**: Performance optimization
3. **Evening**: Documentation updates

---

## Success Criteria

### Team Migrations ✅
- All team data correctly migrated
- Users can create/join teams
- Roles properly assigned
- No data loss or corruption

### Content Editor ✅
- Admin can edit all drill/strategy fields
- Changes persist to database
- Validation prevents bad data
- Audit log tracks changes

### Print Functionality ✅
- Practice plans print cleanly
- All essential info included
- Works across browsers
- PDF export available

### Skills Academy ✅
- All workouts imported
- Interface fully functional
- Progress tracking works
- Gamification integrated

### Documentation ✅
- Complete sitemap exists
- All routes documented
- Missing pages identified
- Clear navigation paths

---

## Technical Considerations

### Database
- Ensure all foreign keys are properly set
- Add indexes for performance
- Implement soft deletes where appropriate
- Set up database backups

### Security
- Validate all user inputs
- Implement proper authentication checks
- Add rate limiting to APIs
- Sanitize HTML content

### Performance
- Lazy load components
- Optimize database queries
- Implement caching where appropriate
- Monitor API response times

### Testing
- Write E2E tests for critical paths
- Unit test utility functions
- Integration test API endpoints
- Manual testing on multiple devices

---

## Resources & References

### Documentation
- [Supabase Schema](/docs/database/schema.md)
- [API Documentation](/docs/api/)
- [Component Library](/docs/components/)
- [Deployment Guidelines](/docs/deployment-guidelines.md)

### Key Files
- Database migrations: `/supabase/migrations/`
- Import scripts: `/scripts/`
- Test files: `/tests/`
- Type definitions: `/src/types/`

### External Resources
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com)

---

## Questions to Address

1. **Team Migrations**
   - Are all WordPress team relationships preserved?
   - How do we handle orphaned data?
   - What's the rollback plan if issues arise?

2. **Content Editor**
   - Who should have edit permissions?
   - Do we need version history?
   - Should changes require approval?

3. **Skills Academy**
   - How many workouts from the original app?
   - What's the progression logic?
   - How do prerequisites work?

4. **Navigation**
   - What's the ideal menu structure?
   - How do we handle role-based navigation?
   - Mobile vs desktop navigation differences?

---

## Notes for Development

- **Use TypeScript** for all new components
- **Follow existing patterns** in the codebase
- **Test on mobile** - this is a mobile-first app
- **Document as you go** - update this file with progress
- **Commit frequently** with clear messages
- **Ask questions** if requirements are unclear

---

## Progress Tracking

Use this section to track completion:

- [ ] Team Migrations Verified
- [ ] Backend Editor Component Built
- [ ] Print Functionality Implemented
- [ ] Skills Academy Interface Complete
- [ ] Workouts Migrated
- [ ] Navigation Documentation Done

Last Updated: [Current Date]
Next Review: [In 2 Days]