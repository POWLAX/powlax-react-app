# BMad Agent Communication Protocol

## Overview
This document defines the standard communication protocol for inter-agent collaboration within the BMad framework.

## Agent Registry

| Agent | Icon | Expertise |
|-------|------|-----------|
| architect | 🏗️ | System design, architecture documents, technology selection, API design, infrastructure planning |
| analyst | 📊 | Requirements gathering, process analysis, data modeling, business logic documentation |
| dev | 💻 | Code implementation, debugging, performance optimization, technical problem solving |
| pm | 📋 | Product strategy, roadmap planning, feature prioritization, stakeholder communication |
| po | 🎯 | Backlog management, user story refinement, acceptance criteria, sprint planning |
| qa | 🧪 | Test planning, bug tracking, quality assurance, test automation strategy |
| sm | 🏃 | Agile process facilitation, team coordination, impediment removal, sprint ceremonies |
| ux-expert | 🎨 | User interface design, user experience optimization, prototyping, usability testing |
| bmad-orchestrator | 🎭 | Workflow coordination, multi-agent tasks, role switching guidance |

## Communication Templates

### 1. Task Handoff Request
```
[CURRENT_AGENT_ICON] needs [TARGET_AGENT_ICON]: [specific_issue]

Context:
- Current Status: [what has been done]
- Blocker: [what is preventing progress]
- Required Expertise: [specific skill needed]

Relevant Files/Code:
- [file paths or code sections]

Suggested Next Steps:
- [specific actions for target agent]
```

### 2. Agent Suggestion to User
```
I notice this task involves [specific area]. This would be better handled by [ICON] [AGENT_NAME] who specializes in [EXPERTISE].

Would you like me to suggest using *agent [AGENT_ID] for this?
```

### 3. Context Preservation Template
```
## Handoff Context from [CURRENT_AGENT]

### Work Completed:
- [List of completed items]

### Current State:
- [Description of current situation]

### Open Questions:
- [Questions for next agent]

### Critical Information:
- [Any warnings, dependencies, or important notes]

### Recommended Actions:
- [Suggested next steps]
```

## Handoff Scenarios

### Scenario 1: UX → Dev
**Trigger**: UI implementation needs technical solution
```
🎨 needs 💻: Modal state management not working on mobile

Context:
- Current Status: Designed responsive modal system
- Blocker: State doesn't persist when switching views
- Required Expertise: React state management

Relevant Files:
- src/components/practice-planner/modals/FilterDrillsModal.tsx

Suggested Next Steps:
- Investigate state persistence issue
- Implement proper state management solution
```

### Scenario 2: Analyst → Architect
**Trigger**: Data model needs system design
```
📊 needs 🏗️: Complex data relationships need architecture

Context:
- Current Status: Mapped drill→strategy→skill relationships
- Blocker: Need efficient query pattern design
- Required Expertise: Database architecture optimization

Relevant Files:
- supabase/migrations/001_staging_tables.sql
- docs/data-relationships.md

Suggested Next Steps:
- Design optimized table structure
- Create efficient join patterns
```

### Scenario 3: Dev → QA
**Trigger**: Feature ready for testing
```
💻 needs 🧪: Practice planner feature complete

Context:
- Current Status: Implemented drill filtering and selection
- Testing Needed: Cross-browser and mobile testing
- Test Scenarios: Drill selection, filtering, time calculations

Relevant Files:
- src/components/practice-planner/*
- tests/e2e/practice-planner.spec.ts

Suggested Next Steps:
- Create comprehensive test suite
- Test on multiple devices/browsers
```

## Best Practices

1. **Always Preserve Context**: Never hand off without providing sufficient background
2. **Be Specific**: Clearly state what expertise is needed and why
3. **Include Examples**: Provide code snippets or file references when relevant
4. **Set Clear Expectations**: Define what success looks like for the handoff
5. **Use Standard Format**: Follow the templates for consistency
6. **Sign All Messages**: End every message with "- [Agent Name]" for clear identification
   - Example: "- Mary (Analyst)" or "- BMad Orchestrator"
   - This is MANDATORY for all agent communications

## Quick Reference

### When to Hand Off:
- Task requires expertise outside your core competency
- Technical blocker needs specialized knowledge
- Quality check needed from different perspective
- Integration point between disciplines

### How to Hand Off:
1. Identify the need
2. Choose appropriate target agent
3. Prepare context using template
4. Make the handoff clear to user
5. Ensure target agent has everything needed

### Common Handoff Patterns:
- UX → Dev: Implementation of designs
- Dev → QA: Testing new features
- Analyst → Architect: System design needs
- PM → PO: User story creation
- Architect → Dev: Technical implementation
- Any → Orchestrator: Multi-agent coordination needed