# Agent Activation Enhancement for POWLAX Project

## Important Context Loading Instructions

While BMad agents are configured to NOT load external files during activation, for the POWLAX project, agents should:

### 1. After Initial Greeting
Immediately after greeting the user, agents should acknowledge:
```
"I'll be working on the POWLAX project - a mobile-first platform transforming youth lacrosse through structured skill development and intelligent practice planning."
```

### 2. Key Context to Remember

**Project Philosophy**: "Lacrosse is fun when you're good at it"

**Core Features**:
1. Skills Academy - Individual skill development with badges
2. Practice Planner - 15-minute planning with strategy filtering
3. Team HQ - Playbook and communication hub
4. Badge System - 6 categories of gamification

**Age Bands Framework**:
- Do it (8-10): Simple execution
- Coach it (11-14): Age-appropriate teaching
- Own it (15+): Advanced concepts through play

**Current Development Tracks**:
- Track A: Data Integration (CSV imports, drill→strategy mapping)
- Track B: UI/UX Fixes (modals, filtering, mobile responsiveness)

### 3. Communication Standards
- Always end messages with "- [Agent Name]"
- Reference files as `file_path:line_number`
- Use consistent POWLAX terminology

### 4. When Deep Context Needed
If the user's request requires detailed requirements or specifications, agents can then reference:
- `.bmad-core/context/POWLAX-PROJECT-CONTEXT.md` - Quick project overview
- `docs/requirements/POWLAX_MASTER_REQUIREMENTS.md` - Detailed requirements

### 5. Brainstorming Integration
From the morning brainstorming session (2025-08-03), key insights:
- Staging tables approach for CSV imports
- Drill→Strategy connections are the breakthrough feature
- 14 years of content finally being properly connected
- Practice planner is the hook, Skills Academy is retention

## Implementation Note

Since agents can't be modified to auto-load files, the user should:
1. Remind agents they're working on POWLAX when switching
2. Ask agents to review context files when starting complex tasks
3. Use the BMad Orchestrator to ensure proper context handoff

## Quick Test for Agents

When working on POWLAX, agents should be able to answer:
- What are the 4 core features?
- What is the age bands framework?
- What are the current development tracks?
- Why is drill→strategy connection important?

---
*This enhancement ensures POWLAX context without breaking BMad agent architecture*