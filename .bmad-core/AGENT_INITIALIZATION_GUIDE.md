# Agent Initialization Guide for POWLAX Project

## Overview
This document specifies what each agent should access during initialization and approximate token usage for efficiency.

---

## 1. Required Reading on Initialization

### For ALL Agents (Minimal Context - ~500 tokens)
Agents should quickly scan these sections:

1. **Project Status Check** (~200 tokens)
   - Read: `TRACK_A_PROGRESS.md` - Line 1-20 (current status only)
   - Read: `docs/track-b-project-summary.md` - Line 1-20 (completion status)
   - Purpose: Understand what's currently in progress

2. **Quick Context** (~300 tokens)
   - Load: `.bmad-core/context/POWLAX-AGENT-QUICK-CONTEXT.md` (optimized for 300 tokens)
   - Alternative: Use mental quick reference card (see section 6)
   - Key rule: Sign all messages with "- [Agent Name]"

### For Deep Work (Load on Request - ~2000-5000 tokens)
Only load these when user's task requires detailed knowledge:

1. **Full Project Context** (~1500 tokens)
   - `.bmad-core/context/POWLAX-PROJECT-CONTEXT.md`
   - When: Complex implementation tasks

2. **Master Requirements** (~3500 tokens)
   - `docs/requirements/POWLAX_MASTER_REQUIREMENTS.md`
   - When: Feature development or major decisions

3. **Technical Specifications** (~1000 tokens each)
   - `docs/technical/powlax-data-architecture-explained.md`
   - `docs/technical/powlax-data-source-mapping.md`
   - When: Data-related tasks

---

## 2. Agent-Specific Initialization

### BMad Orchestrator
- **Always Check**: Current active tracks (A/B progress files)
- **Token Usage**: ~500 on init, up to 2000 when coordinating
- **Special Note**: Must understand all agents' capabilities

### Analyst (Mary)
- **Focus**: Data relationships and business logic
- **Extra Reading**: Brainstorming results if referenced
- **Token Usage**: ~500 on init, 3000-5000 for analysis tasks

### Developer (Sam)
- **Focus**: Current implementation tasks
- **Extra Reading**: Technical architecture docs
- **Token Usage**: ~500 on init, 2000-4000 for coding

### PM (Alex)
- **Focus**: Feature priorities and user stories
- **Extra Reading**: Requirements and brief
- **Token Usage**: ~500 on init, 2000-3000 for planning

### Architect (Archie)
- **Focus**: System design and technical decisions
- **Extra Reading**: Full technical documentation
- **Token Usage**: ~500 on init, 3000-5000 for design work

---

## 3. Plan Modification Rules

### Agents CAN Directly Update Plans With:
1. **Task Status Changes**:
   - `completed` - When finishing a task
   - `in_progress` - When starting work
   - `pending` - Default for new tasks

2. **Adding Subtasks**: For current work breakdown

3. **Progress Notes**: Brief updates on what was done

### Agents MUST Prompt User Before:
1. **Adding Major New Tasks**: Outside current scope
2. **Removing Tasks**: Even if deemed unnecessary
3. **Changing Task Priorities**: High/Medium/Low
4. **Modifying Timeline**: Extending deadlines

### Update Format Example:
```markdown
### ✅ Task 3: Import CSV data
**Status**: Completed
**Completed**: 2025-08-04
**Notes**: Successfully imported 276 team drills, 150+ academy drills
**Token Usage**: ~15%
```

---

## 4. Efficient Token Management

### Initialization Best Practices:
1. **Start Minimal**: 500 tokens for basic context
2. **Load on Demand**: Full docs only when needed
3. **Cache Mentally**: Remember key concepts without re-reading
4. **Track Usage**: Note percentage in progress updates

### When to Request Full Context:
- User says "work on [specific feature]"
- Task requires architectural decisions
- Need to understand data relationships
- Creating new components/features

### Token-Saving Tips:
1. Reference line numbers instead of quoting
2. Summarize findings instead of copying
3. Use "as discussed" for known context
4. Ask user for specific sections needed

---

## 5. Communication Protocol

### Every Message Must End With:
```
- [Agent Name]
```

Examples:
- "- BMad Orchestrator"
- "- Mary (Analyst)"
- "- Sam (Developer)"

### File References:
```
See implementation at: src/components/practice-planner/DrillCard.tsx:45-67
```

### Status Updates:
```
Task completed. Updated TRACK_A_PROGRESS.md with results.
Token usage: 25% total, 5% this session.
- [Agent Name]
```

---

## 6. Quick Reference Card (50 tokens - Ultra-Fast Context)

```
POWLAX Context:
- Platform: Youth lacrosse skill development
- Status: MVP with data integration + UI fixes  
- Tracks: A=Data (drill→strategy), B=UI/UX (completed)
- Framework: "Do it, Coach it, Own it" age bands (8-10, 11-14, 15+)
- Tech: Next.js + Supabase + WordPress auth
- Rule: Always sign "- [Agent Name]"
```

## 7. Documentation Organization (New)

**Root Level** (Essential files only):
- `TRACK_A_PROGRESS.md` - Current active work
- `AGENT-MODIFICATIONS-LOG.md` - Agent enhancements
- `.claude.md` - Agent workflow options

**Organized Structure**:
- `docs/agent-instructions/` - C4A frameworks and agent prompts
- `docs/research/` - Business analysis and gamification research  
- `docs/development/` - Development summaries and progress reports
- `docs/reference/` - Reference materials and directory structure
- `.bmad-core/context/` - Streamlined agent context files

**Load-on-Demand Philosophy**:
Agents start with minimal context and load detailed documentation only when user's task requires it.

---

*This guide ensures efficient, consistent agent initialization while managing token usage*