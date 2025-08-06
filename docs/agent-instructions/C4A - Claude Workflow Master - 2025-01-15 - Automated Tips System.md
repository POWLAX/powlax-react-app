# C4A - Claude Workflow Master - 2025-01-15 - Automated Tips System

## Executive Summary

This document synthesizes advanced Claude Code workflow optimization techniques from Patrick's presentation and creates an implementation plan for automated, context-aware tip delivery during development workflows. The system will provide relevant guidance based on workflow stage and context.

## Core Workflow Principles

### The Sacred Trinity: Explore → Plan → Execute

**Never jump straight to execution.** This is the #1 mistake that leads to poor outputs.

1. **EXPLORE**: Build context before any work
2. **PLAN**: Create architectural overview with think-hard mode  
3. **EXECUTE**: Implement with full context loaded

### Context Window Mastery

**Context is everything.** These techniques maximize Claude's effectiveness:

#### The "Prepare" Method
```
"Prepare to discuss how our frontend works" 
"Read relevant files and prepare to work on document identification"
```
- Let Claude spend 50k+ tokens building context over 7+ minutes
- If overview is wrong, escape and restart (don't try to correct)
- Double escape to fork conversations and preserve smart instances

#### The Double Escape Pattern
- Build context → Double escape → Fork multiple terminals with same context
- Resume command pulls context into new tabs
- Rewind at 5% context instead of using compact (compact is wasteful)

#### Context Window Economics
- You only pay for new tokens, not context reuse
- Keep smart Claude instances and reuse them extensively
- Open 5+ terminals all with the same expert context

## The Developer Review System

### Two-Tab Architecture
1. **Developer Tab**: Does the actual work
2. **Planner Tab**: Reviews and critiques the developer's work

### Critical Prompting Pattern
❌ "Review this code" → Claude likes its own code
✅ "My developer came up with this plan/code. What do you think?" → Claude becomes your advocate

### Review Triggers
- After each PR-sized chunk completion
- When approaching context limits
- Before major architectural decisions

## Planning Best Practices

### Risk-Based Planning Strategy
- **Low Risk**: Skip elaborate planning, just execute
- **Medium/Large**: Break into PR-sized, testable chunks
- **High Risk**: Take 2-3 planning shots, get multiple perspectives

### Planning Prompts That Work
```
Write function names in 1-3 sentences about what they do
Write test names in 5-10 words about behavior they cover
Think architecturally, not in code details
NO backwards compatibility unless absolutely necessary
```

### The Multi-Claude Planning Method
1. Have Claude A create plan
2. Fork to Claude B, ask it to critique plan as your teammate
3. Optional: Claude C decides between approaches
4. Break final plan into PR-sized chunks

## Code Quality Enforcement

### Anti-Patterns to Fight
- **Backwards Compatibility**: Claude loves this, creates silent failures
- **Enterprise Bloat**: Claude over-engineers, fight this tendency
- **New Code Bias**: Claude prefers writing new vs. elegantly editing existing

### Quality Prompts
```
"Write elegant code that completes this task"
"No graceful fallbacks - fail fast and visibly" 
"Edit existing code, don't rewrite unless necessary"
"Use TDD: failing test → passing code"
```

### Automated Checking
- Have Claude write scripts to verify its own work
- Use linting/compilation after every change
- Test against known good/bad examples

## File Organization System

### Essential Files
- **Claude.md**: Comprehensive codebase overview per folder
- **Plan.md**: Current task breakdown and status  
- **CHANGELOG.md**: Decision history and reasoning
- **Commands/**: Shared team workflow automations

### GitHub Integration
- Tag @claude in issues for automated PR creation
- Modify YAML configs to use Opus instead of Sonnet
- Embed team-specific prompts and standards in configs

## Context-Aware Tip Delivery System

### Workflow Stage Detection
The system should trigger specific tips based on detected patterns:

#### Startup Triggers
**When user says**: "I'm going to begin working" / "Starting new task"
**Deliver**: Explore-Plan-Execute reminder, Prepare method instructions

#### Planning Triggers  
**When user mentions**: "plan" / "architecture" / "design"
**Deliver**: Risk assessment questions, multi-Claude planning method

#### Execution Triggers
**When user starts coding**: Large file changes, new implementations
**Deliver**: Context window tips, developer review setup

#### Context Limit Triggers
**When approaching limits**: Token usage high, complex conversations
**Deliver**: Double escape techniques, resume instructions

#### Review Triggers
**When task completion detected**: "done" / "finished" / "complete"  
**Deliver**: Prepare handoff instructions, developer critique method

## Implementation Architecture

### Phase 1: Tip Database Creation
Create structured tip library with:
- Trigger conditions (regex patterns, keywords)
- Context requirements (file types, project stage)
- Tip content (markdown formatted)
- Priority levels (critical, helpful, optional)

### Phase 2: Context Detection System
Monitor for:
- Workflow stage indicators
- File interaction patterns  
- Token usage metrics
- Task complexity signals
- Time-based triggers

### Phase 3: Delivery Mechanism
Options for implementation:
1. **Claude Code Commands**: Custom commands that inject tips
2. **Markdown Templates**: Pre-formatted guidance documents
3. **Interactive Prompts**: Context-sensitive question/answer flows
4. **Automated Comments**: Git hooks or CI integration

### Phase 4: Learning System
Track tip effectiveness:
- Usage frequency
- User feedback/dismissals
- Outcome improvements
- Refinement suggestions

## Command Templates for Implementation

### Essential Custom Commands

#### context-builder.md
```
Read the entire codebase structure and create a comprehensive overview.
Focus on: architecture patterns, key dependencies, folder organization, 
main workflows, and integration points. Spend significant tokens building
deep understanding before proceeding with any tasks.
```

#### plan-reviewer.md  
```
Act as a senior architect reviewing a development plan created by another
developer. Provide specific, actionable feedback on: architectural soundness,
potential pitfalls, missing considerations, and improvement opportunities.
Be critical but constructive.
```

#### handoff-preparer.md
```
Document the current state of work for the next developer, including:
what was accomplished, current challenges, next steps, important context
to preserve, and specific files/areas that need attention.
```

## Success Metrics

### Efficiency Indicators
- Reduced context window waste (fewer compacts/clears)
- Higher success rate on first attempts
- Decreased back-and-forth iterations
- Better code quality scores

### Workflow Metrics  
- Time from task start to quality output
- Number of "smart Claude" instances maintained
- Successful handoffs between work sessions
- Reduction in architectural rework

## Next Steps

1. **Immediate**: Implement basic tip document as reference
2. **Short-term**: Create essential custom commands  
3. **Medium-term**: Build context detection system
4. **Long-term**: Full automated delivery with learning

## File References

### Implementation Files
- `/docs/agent-instructions/` - Tip database storage
- `/claude-agents/powlax-controller/` - Master coordination
- `/.claude/commands/` - Custom command definitions
- `/tasks/templates/` - Workflow templates

### Integration Points
- Claude Code CLI configuration
- GitHub Actions for automated tips
- VS Code/Cursor extensions potential
- Terminal prompt modifications

---

**Remember**: The goal is not to overwhelm with tips, but to provide the RIGHT guidance at the RIGHT moment to maximize Claude Code's incredible capabilities.