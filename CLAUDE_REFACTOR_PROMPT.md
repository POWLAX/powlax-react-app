# Prompt for Claude to Refactor CLAUDE.md

## Instructions for Claude

You need to refactor the CLAUDE.md file based on comprehensive system analysis that has been completed. This is a critical task that will define the MVP roadmap.

### Your Task:

1. **READ AND ANALYZE these documents in order:**
   - `CLAUDE_MD_REFACTOR_GUIDE.md` - Your primary guide
   - `COMPONENT_ANALYSIS_MASTER_REPORT.md` - 122 component analysis
   - `PAGE_ORCHESTRATION_MASTER_REPORT.md` - 40+ page analysis
   - Current `CLAUDE.md` - Existing documentation

2. **VERIFY the analysis findings:**
   - Check if the security vulnerability truly exists in `(authenticated)/layout.tsx`
   - Confirm the 4 MVP blockers are accurate:
     - PlayerDashboard (100% mock data)
     - GlobalSearch (disconnected)
     - RankDisplay (hardcoded)
     - Point Transactions (not persisting)
   - Validate database table references against `contracts/active/database-truth-sync-002.yaml`

3. **REFACTOR CLAUDE.md to include:**

   **SECTION 1 - CRITICAL SECURITY ALERT (TOP OF FILE)**
   - The authentication bypass vulnerability
   - Exact line numbers and files
   - MUST FIX BEFORE ANY OTHER WORK message

   **SECTION 2 - MVP DEFINITION**
   - Based on the 75% readiness finding
   - Clear list of what MUST work for MVP
   - The 4 critical blockers with status

   **SECTION 3 - COMPONENT & PAGE STATUS**
   - Component readiness matrix (from analysis)
   - Page orchestration findings (90% client, 10% server)
   - Database integration reality (68% connected)

   **SECTION 4 - CONSOLIDATED TRUTH SOURCES**
   - Updated database tables (47 actually used)
   - Component contracts location
   - Page contracts location
   - Which tables DON'T exist but are referenced

   **SECTION 5 - DUPLICATE COMPONENTS**
   - List of 38 duplicate components found
   - Which to keep (winners with best Supabase integration)
   - Consolidation priority

   **SECTION 6 - ACTION PLAN**
   - Week 1: Security fixes + 4 blockers
   - Week 2: Core feature completion
   - Week 3: Testing and polish
   - Clear checkboxes for tracking

4. **PRESERVE these sections from current CLAUDE.md:**
   - Sub-agent workflow patterns that work
   - Development commands
   - Environment variables
   - But UPDATE with new findings

5. **ADD these new sections:**
   - System Architecture Overview (90% client, 10% server)
   - Excellence Examples (Practice Planner, Skills Academy)
   - Performance Considerations
   - Security Hardening Requirements

6. **STRUCTURE for clarity:**
   - Use clear headers with emojis
   - Put CRITICAL items in red/warning blocks
   - Use tables for status tracking
   - Include progress checkboxes
   - Keep it scannable and actionable

### Quality Checks:

Before finalizing, ensure:
- [ ] Security vulnerability is #1 item
- [ ] MVP is clearly defined with specific components
- [ ] Database truth is updated from analysis
- [ ] All 122 components are accounted for
- [ ] All 40+ pages are represented
- [ ] Duplicate consolidation plan is clear
- [ ] Timeline shows 3 weeks to MVP
- [ ] Action items are specific and measurable

### Output:

Create a refactored CLAUDE.md that:
1. Reflects the complete system analysis
2. Provides clear MVP requirements
3. Tracks critical blockers prominently
4. Gives actionable weekly plan
5. Maintains useful existing content
6. Adds new architectural insights

The goal is a CLAUDE.md that any developer can read and immediately understand:
- What's broken (security)
- What needs fixing (4 blockers)
- What's ready (75% of components)
- How to get to MVP (3-week plan)
- Where everything is documented (contracts)

Begin by reading the CLAUDE_MD_REFACTOR_GUIDE.md for complete context.