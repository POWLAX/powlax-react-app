# Context Window Management & Recovery

## Current Situation: Context Getting Full

### ❌ DON'T Use Compact
- Compact generates 1.5 pages of summary
- Creates confused, "off-kilter" Claude instances  
- Wastes tokens and degrades quality

### ✅ DO Use These Rescue Techniques:

## Option 1: Strategic Rewind (Recommended)

1. **Identify the Sweet Spot**: Scroll back to 40% context usage
2. **Document Progress**: Create quick summary of what was accomplished
3. **Continue Forward**: "Here's what I accomplished so far: [summary]. Continue from here."

**Why this works**: You keep the smart Claude instance and good context quality.

## Option 2: Double Escape Fork

```
Step 1: Double escape (⎋⎋) to preserve current smart Claude
Step 2: Start new tab/terminal  
Step 3: Use `resume` to pull in the expert knowledge
Step 4: Reference previous progress via markdown summary
```

**Context Economics**: You only pay for NEW tokens. Reusing smart Claude instances is cost-effective.

## Option 3: Strategic Fresh Start

When current Claude has lost context quality:

1. **Start completely fresh**
2. **Use comprehensive prep phase**: 
   ```
   "Prepare to continue working on [current task]. Read all relevant files 
   and understand exactly where we left off in the implementation."
   ```
3. **Rebuild context properly** with 50k+ tokens

## Multi-Terminal Strategy

### The Expert Context Pattern:
- **Terminal 1**: Frontend expert (built context on React/components)
- **Terminal 2**: Backend expert (built context on API/database)  
- **Terminal 3**: Integration expert (built context on full-stack flow)
- **Terminal 4**: Planning/review expert
- **Terminal 5**: Current active work

### Context Preservation Commands:
```bash
# Fork current smart Claude to new terminal
resume

# Pull specific context into new session  
resume [conversation-id]

# Start new terminal with same base context
claude --resume
```

## Context Quality Indicators

### Good Context (Keep Working):
- Claude references specific files/functions correctly
- Maintains architectural awareness
- Gives contextual warnings about edge cases
- Suggests appropriate patterns for your codebase

### Bad Context (Time to Rescue):
- Generic responses that could apply to any project
- Suggests patterns inconsistent with your architecture  
- Forgets recent decisions or constraints
- Starts over-engineering or adding unnecessary complexity

## Emergency Recovery Protocols

### If Claude Becomes Confused Mid-Task:
1. **Stop immediately** - don't try to correct
2. **Double escape** to preserve any remaining good context
3. **Start fresh** with proper context building
4. **Document** what was working before confusion set in

### If You're Near Token Limit with Good Claude:
1. **Document current state** in markdown
2. **Double escape** to fork the smart instance
3. **Continue in new terminal** with resume
4. **Keep original as backup** for complex questions

## Context Window Economics

### Token Cost Reality:
- Building context: 50k tokens = ~$2-3 (one-time cost)
- Reusing context: Only new tokens count
- Multiple smart instances: Extremely cost-effective
- Poor context leading to rework: Very expensive

### Best Practices:
- Maintain 5+ terminals with expert context
- Don't compact - rewind or fork instead
- Build context once, reuse extensively  
- Quality context is an investment, not a cost

## Next Steps After Context Rescue:
- Use `/workflow-start` to rebuild context properly
- Use `/workflow-plan` to re-establish task direction
- Remember: Smart Claude instances are valuable - preserve them!