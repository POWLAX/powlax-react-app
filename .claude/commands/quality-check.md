# Code Quality Enforcement Guide

## Pre-Implementation Quality Checklist

### Context Quality (Foundation):
- [ ] Built sufficient context (50k+ tokens spent)  
- [ ] Claude demonstrates understanding of existing architecture
- [ ] Clear, specific requirements established
- [ ] Edge cases and failure modes considered

### Architectural Alignment:
- [ ] Follows established patterns in codebase
- [ ] Integrates cleanly with existing systems
- [ ] Minimal changes to achieve objectives
- [ ] No unnecessary abstractions or over-engineering

## Implementation Quality Standards

### Code Writing Principles:
```
"Write elegant code that completes this task. Edit existing code rather than 
rewriting unless absolutely necessary. No graceful fallbacks - fail fast and visibly."
```

### Anti-Pattern Prevention:
- **NO backwards compatibility** unless absolutely critical
- **NO graceful degradation** (creates silent failures)
- **NO enterprise bloat** (over-configurable, over-extensible)
- **NO code duplication** across multiple files

### Quality Enforcement Prompts:

#### For Clean Implementation:
```
"Make the minimal changes necessary to integrate this properly with the existing codebase"
"Edit the existing [file/function] rather than creating a new one"
"Fail fast and provide clear error messages rather than silent fallbacks"
```

#### For Testing:
```
"Use TDD: Write the failing test first, then write code that makes it pass"
"Create tests that would catch the most common failure modes"
"Write integration tests that verify the complete workflow"
```

## Quality Verification Process

### Automated Checks (Run After Each Change):
1. **Linting**: Fix all linter errors immediately
2. **Compilation**: Code must compile without warnings
3. **Type Checking**: Resolve all TypeScript errors
4. **Test Execution**: All tests must pass

### Claude Self-Verification:
```
"Write a script to verify this feature works correctly. Test:
- Happy path functionality
- Error conditions and edge cases  
- Integration with existing systems
- Performance under expected load"
```

## Quality Review Questions

### Technical Quality:
- "What are the potential failure modes?"
- "What happens under high load or stress?"
- "How will this behave with invalid input?"
- "What are the security implications?"

### Maintainability:
- "How easy is this to debug when it breaks?"
- "What would another developer need to know to modify this?"
- "What's the testing strategy for ongoing changes?"
- "How does this affect system complexity?"

### Performance:
- "What's the performance impact of this change?"
- "Are there any memory leaks or resource issues?"
- "How does this scale with data growth?"
- "What monitoring/logging is needed?"

## Common Quality Issues & Solutions

### Issue: Over-Engineering
**Signs**: Excessive abstractions, configuration options, "future-proofing"
**Solution**: "Build the simplest version that actually works"

### Issue: Silent Failures  
**Signs**: Try/catch blocks that hide errors, graceful degradation
**Solution**: "Fail fast with clear error messages"

### Issue: Code Duplication
**Signs**: Same logic in multiple files, copied-paste patterns
**Solution**: "Extract this to a shared utility/service"

### Issue: Poor Integration
**Signs**: New patterns that don't match existing code
**Solution**: "Make this consistent with how we handle [similar feature]"

## Testing Standards

### Test Coverage Requirements:
- [ ] **Unit Tests**: Core functionality and business logic
- [ ] **Integration Tests**: API endpoints and database interactions
- [ ] **Edge Case Tests**: Error conditions and boundary values
- [ ] **Regression Tests**: Previously fixed bugs stay fixed

### Test Quality Checklist:
- [ ] Tests are independent (can run in any order)
- [ ] Tests have clear, descriptive names
- [ ] Tests verify behavior, not implementation details
- [ ] Tests fail for the right reasons
- [ ] Test data is realistic and representative

## Documentation Standards

### Code Documentation:
- Complex business logic explained in comments
- API interfaces documented with examples
- Configuration options and their impacts explained
- Performance considerations noted where relevant

### Change Documentation:
- Update CHANGELOG with user-facing changes
- Document breaking changes and migration steps
- Update README if setup/usage changes
- Note any new dependencies or requirements

## Quality Gate Criteria

### Before Committing:
- [ ] All automated checks pass
- [ ] Manual testing completed
- [ ] Code review feedback addressed
- [ ] Documentation updated
- [ ] No temporary/debug code remains

### Before PR/Handoff:
- [ ] Feature works end-to-end
- [ ] Error handling tested
- [ ] Performance is acceptable
- [ ] Security considerations addressed
- [ ] Team review completed

## Emergency Quality Recovery

### If Quality Issues Discovered:
1. **Stop adding features** - fix quality first
2. **Identify root cause** - missing context, poor planning, rushed implementation
3. **Fix systematically** - don't band-aid over problems
4. **Update process** - prevent similar issues in future

### Quality Debt Management:
- Document known quality issues clearly
- Prioritize fixes based on risk and impact
- Don't let quality debt compound
- Address technical debt in regular sprint planning

## Next Steps:
- Use `/workflow-review` for comprehensive code review
- Use `/context-rescue` if quality degrades due to context issues
- Remember: Quality up-front prevents expensive rework later