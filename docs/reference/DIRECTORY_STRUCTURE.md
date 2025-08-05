# POWLAX Project Directory Structure

## 📁 Organized Documentation Structure

### Root Level (Essential Files Only)
- `.claude.md` - Agent context and workflow options
- `TRACK_A_PROGRESS.md` - Active data integration progress
- `TRACK_A_START.md` - Quick start for Track A 
- `AGENT-MODIFICATIONS-LOG.md` - Agent enhancement log
- `README.md` - Project overview

### Documentation Organization

#### `docs/research/`
Research and analysis files that don't need frequent agent access:
- `POWLAX-Gamification-*.md` - Gamification research and plans
- `USA_Lacrosse_POWLAX_Cost_Benefit_Analysis.md` - Business analysis

#### `docs/agent-instructions/`  
Agent instruction files and frameworks:
- `C4A - Cursor For Agents.md` - Component architecture framework
- `C4A - Analyst - 2025-01-15 - Gamification Research.md` - Analyst prompt
- `C4A - Data Integration - 2025-01-15 - Video Lacrosse Lab URL Linking Plan.md` - Data integration prompt

#### `docs/development/`
Development summaries and progress reports:
- `MODAL_FIXES_SUMMARY.md` - UI fixes completed
- `CHANGES_SUMMARY.md` - Change log
- `track-b-project-summary.md` - Track B completion summary

#### `docs/reference/`
Reference materials and supporting documentation:
- `ICON_REFERENCE.md` - UI icon reference
- `FREE-mentions.md` - Marketing notes
- `DIRECTORY_STRUCTURE.md` - This file

#### `docs/existing/` (Unchanged)
WordPress exports and existing content (not analyzed per user request)

#### `docs/technical/` (Unchanged)  
Technical architecture and data specifications

#### `docs/requirements/` (Unchanged)
Product requirements and specifications

### BMad Core Structure
- `.bmad-core/agents/` - Specialized agent definitions
- `.bmad-core/context/` - Project context files
- `.bmad-core/utils/` - Agent utilities and protocols
- `.bmad-core/templates/` - Document templates
- `.bmad-core/tasks/` - Reusable task definitions

## 🎯 Benefits of This Organization

1. **Reduced Agent Overwhelm**: Root directory contains only essential files
2. **Clear Context Loading**: Agents know where to find specific information types
3. **Logical Grouping**: Related files are co-located
4. **Scalable Structure**: Easy to add new files to appropriate categories
5. **BMad Integration**: Follows load-on-demand documentation principles

## 🔄 File Access Patterns

**For Quick Context** (300 tokens):
- `.bmad-core/context/POWLAX-AGENT-QUICK-CONTEXT.md`

**For Implementation Work** (load as needed):
- Technical specs: `docs/technical/`
- Component structure: `docs/agent-instructions/C4A - Cursor For Agents.md`
- Requirements: `docs/requirements/`

**For Research/Analysis** (rarely needed by agents):
- Business analysis: `docs/research/`
- Development summaries: `docs/development/`
- Reference materials: `docs/reference/`