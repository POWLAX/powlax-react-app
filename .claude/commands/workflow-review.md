# Code Review & Handoff Guide

## The Two-Tab Review System

### Tab 1: Developer (Current Tab)  
This is where the actual implementation work happens.

### Tab 2: Planner/Reviewer (Double Escape First)
This becomes your technical advisor and code reviewer.

## Critical Review Prompting Pattern

### ❌ This Doesn't Work:
```
"Review this code"  
"What do you think of this implementation?"
```
**Problem**: Claude likes its own code and gives generic praise.

### ✅ This Works:
```
"My developer just implemented [specific feature]. Give them specific technical 
feedback as if you're on my team, not theirs. What concerns do you have?"

"A contractor delivered this code. What would you flag in a code review?"
```

**Why it works**: Claude becomes YOUR advocate, not the code's defender.

## Effective Review Questions

### Technical Quality:
```
"What are the potential failure modes of this implementation?"
"What edge cases might this miss?"  
"How does this integrate with our existing architecture?"
"What would break if we scaled this?"
```

### Code Quality:
```
"What would you flag in a code review?"
"Are there any anti-patterns here?"
"What's the maintenance burden of this approach?"
"Where could this code be simplified?"
```

### Architecture Alignment:
```
"Does this follow our established patterns?"
"What inconsistencies do you see with the rest of the codebase?"
"What would make this more maintainable?"
```

## Handoff Preparation

### Before Finishing Session:
```
"Document what you've accomplished for the next developer. Include:
- Current state and what was completed
- Any challenges encountered and how they were solved  
- Specific files that need attention
- Next logical steps in priority order
- Important context that must be preserved
- Any technical debt or shortcuts taken"
```

### Quality Verification Checklist:
- [ ] **Linting**: Run and fix all linter errors
- [ ] **Compilation**: Ensure code compiles without warnings
- [ ] **Testing**: Write/update tests for new functionality  
- [ ] **Integration**: Verify works with existing systems
- [ ] **Documentation**: Update relevant docs/comments

## Automated Quality Checks

### Have Claude Write Verification Scripts:
```
"Write a script to verify this feature works correctly. Include:
- Happy path testing
- Error condition testing  
- Integration point verification
- Performance/load considerations"
```

### Testing Strategy:
```
"Use TDD approach: Write the failing test first, then implement code that makes it pass"
"Create tests that would catch the most likely bugs in this implementation"  
"Write integration tests that verify the end-to-end flow"
```

## Handoff Documentation Template

### Progress Summary:
- **Completed**: [Specific features/functions implemented]
- **In Progress**: [What's partially done]  
- **Blocked**: [Dependencies or issues preventing progress]
- **Next Steps**: [Immediate next actions in priority order]

### Technical Notes:
- **Architecture Decisions**: [Why certain approaches were chosen]
- **Integration Points**: [How this connects to existing systems]
- **Edge Cases**: [Known limitations or special handling needed]
- **Performance**: [Any performance considerations or optimizations]

### File Changes:
- **Modified Files**: [List with brief description of changes]
- **New Files**: [Purpose and relationship to existing code]
- **Configuration**: [Any config changes needed]
- **Dependencies**: [New packages or version updates]

## Review Timing Strategy

### After Each PR-Sized Chunk:
- Get technical feedback from reviewer tab
- Document progress and decisions
- Verify quality before moving to next chunk

### Before Major Architectural Changes:
- Get multiple perspectives (use 2-3 Claude instances)
- Validate against existing patterns
- Consider long-term maintenance implications

### At Natural Stopping Points:
- End of feature implementation
- Before switching to different part of codebase  
- When approaching context limits
- Before significant refactoring

## Common Review Failure Modes

### What to Watch For:
- **Over-engineering**: Claude adding unnecessary complexity
- **Pattern Inconsistency**: New code not matching existing style
- **Silent Failures**: Graceful degradation that hides problems
- **Backwards Compatibility Bloat**: Unnecessary legacy support
- **Testing Gaps**: Missing edge cases or integration tests

### Recovery Strategies:
- Challenge Claude's assumptions directly
- Ask for simpler alternatives
- Reference existing codebase patterns
- Insist on fail-fast approaches
- Require comprehensive testing

## Next Steps After Review:
- Use `/context-rescue` if context window is full
- Use `/workflow-start` for next task/feature
- Use `/quality-check` for final verification before handoff