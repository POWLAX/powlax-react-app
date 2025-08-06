# Planning Phase Guide

## Risk Assessment First
Categorize your task complexity:

- **Low Risk**: Skip elaborate planning, just execute with good context
- **Medium/Large**: Break into PR-sized, testable chunks  
- **High Risk**: Take 2-3 planning shots with multiple Claude instances

## Effective Planning Prompts

### For Architectural Planning:
```
"Create a plan for [task]. Write function names in 1-3 sentences about what they do. 
Write test names in 5-10 words about behavior they cover. 
Think architecturally, not in code details. 
Focus on high-level approach, not implementation."
```

### Critical Instructions to Include:
- "NO backwards compatibility unless absolutely necessary"
- "NO graceful fallbacks - they create silent failures"  
- "Focus on editing existing code vs. rewriting"
- "Break into PR-sized chunks"

## The Multi-Claude Planning Method

### Step 1: Initial Plan
Have your current context-loaded Claude create the first plan.

### Step 2: Critical Review
1. Double escape (`⎋⎋`) to fork conversation
2. In new tab: "My developer created this plan for [task]. What do you think as my technical advisor? Be critical and specific."

**Why this works**: Claude becomes your advocate, not the plan defender.

### Step 3: Plan Refinement
- Address specific concerns raised
- Get multiple perspectives if high-risk
- Break final plan into implementable chunks

## Planning Anti-Patterns to Avoid

❌ **Enterprise Bloat**: "Let's make it extensible and configurable"
❌ **Backwards Compatibility**: "We'll maintain graceful fallbacks"  
❌ **Over-Architecture**: Planning 10 future features for 1 current need
❌ **Implementation Details**: Writing actual code in planning phase

## Quality Planning Prompts

### Risk Reduction:
```
"What could go wrong with this approach? What are the main failure modes?"
"What assumptions are we making that might be wrong?"
"What's the simplest version that actually works?"
```

### Scope Management:
```
"Break this into the smallest deployable increments"
"What's the MVP version of this plan?"
"Which parts can be done independently?"
```

## Plan Validation Checklist

Before proceeding to execution:
- [ ] Plan is broken into PR-sized chunks
- [ ] Each chunk is independently testable  
- [ ] Dependencies are clearly identified
- [ ] Failure modes have been considered
- [ ] Plan focuses on editing vs. rewriting existing code
- [ ] No unnecessary backwards compatibility

## Next Steps
- Use `/quality-check` before implementation
- Use `/context-rescue` if approaching token limits
- Remember: Good plans prevent context window waste during execution