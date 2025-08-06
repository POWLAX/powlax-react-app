# Claude Code Workflow Optimization System

This directory contains an automated tip delivery system based on advanced Claude Code workflows from Patrick's presentation. The system helps you follow the **Explore → Plan → Execute** methodology and maximize Claude's effectiveness.

## Quick Start

### Test the Tip Monitor
```bash
# Test pattern detection
node ../claude-tips-monitor.js "I'm going to start working on authentication"

# Should output: Suggestion to use /workflow-start
```

### Use Commands Directly
```bash
# Get context building guidance
claude /workflow-start

# Get planning methodology
claude /workflow-plan

# Handle context window issues  
claude /context-rescue

# Code review and handoff
claude /workflow-review

# Quality enforcement
claude /quality-check
```

## Core Principles

### 1. The Sacred Trinity: Explore → Plan → Execute
- **NEVER** jump straight to execution
- Build 50k+ tokens of context first using the "Prepare" method
- Plan with architectural thinking, not implementation details
- Execute with full context loaded

### 2. Context Window Mastery
- Use double escape (`⎋⎋`) to fork smart Claude instances
- Use `resume` to pull context into new terminals
- **NEVER** use compact - rewind to 40% usage instead
- Maintain multiple expert Claude instances simultaneously

### 3. The Developer Review System
- Use separate tabs: Developer (implementation) + Planner (review)
- Critical prompt: "My developer did X. What do you think as my technical advisor?"
- Claude becomes YOUR advocate, not the code's defender

## Available Commands

| Command | When to Use | Key Benefits |
|---------|-------------|--------------|
| `/workflow-start` | Beginning new work | Context building, Explore→Plan→Execute setup |
| `/workflow-plan` | Planning phase | Risk assessment, architectural thinking |
| `/context-rescue` | Context issues | Window management, smart instance preservation |
| `/workflow-review` | Task completion | Code review, handoff preparation |
| `/quality-check` | Code verification | Quality standards, anti-pattern prevention |

## Pattern Detection

The `claude-tips-monitor.js` script automatically detects workflow patterns and suggests relevant commands:

### Detected Patterns
- **Starting work**: "begin working", "start task", "working on"
- **Planning needed**: "how should I", "architecture", "plan approach" 
- **Context issues**: "context full", "token limit", "confused"
- **Quality checks**: "review", "check code", "does this look"
- **Handoff needed**: "done", "finished", "what's next"

### Integration Options

#### Terminal Integration (Optional)
Add to your `.zshrc` or `.bashrc`:
```bash
claude_with_tips() {
  local suggestions=$(node /path/to/claude-tips-monitor.js "$*")
  if [ -n "$suggestions" ]; then
    echo "$suggestions"
    read -p "Continue with claude command? (y/n): " -n 1 -r
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then return; fi
  fi
  claude "$*"
}
alias claude=claude_with_tips
```

## Key Anti-Patterns to Avoid

### ❌ Don't Do This:
- Jump straight to execution without building context
- Use "compact" when context gets full
- Ask Claude to "review this code" (it likes its own work)
- Allow backwards compatibility bloat
- Accept graceful degradation (silent failures)

### ✅ Do This Instead:
- Spend 7+ minutes building context with "Prepare" method
- Double escape and rewind instead of compact
- Use developer/reviewer two-tab system
- Fail fast with clear error messages
- Edit existing code rather than rewriting

## Context Economics

**Remember**: You only pay for NEW tokens, not context reuse.
- Building context: One-time investment (~50k tokens)
- Reusing smart Claude instances: Nearly free
- Multiple expert terminals: Extremely cost-effective
- Poor context leading to rework: Very expensive

## Success Indicators

You're using Claude Code effectively when:
- First attempts produce high-quality results
- Context remains relevant throughout tasks
- Code integrates cleanly with existing architecture
- Less back-and-forth iteration needed
- Multiple smart Claude instances working simultaneously

## File Structure

```
.claude/
├── README.md                 # This file
├── commands/
│   ├── workflow-start.md     # Context building guidance
│   ├── workflow-plan.md      # Planning methodology
│   ├── context-rescue.md     # Context window management
│   ├── workflow-review.md    # Code review and handoff
│   └── quality-check.md      # Quality standards
└── ../claude-tips-monitor.js # Pattern detection script
```

## Advanced Techniques

### Multi-Claude Planning
1. Have Claude A create initial plan
2. Fork to Claude B: "My developer created this plan. Critique it as my advisor."
3. Refine plan based on specific feedback
4. Break into PR-sized chunks

### Context Preservation
- Maintain frontend expert (Terminal 1)
- Maintain backend expert (Terminal 2)  
- Maintain integration expert (Terminal 3)
- Use planning expert (Terminal 4)
- Work in active terminal (Terminal 5)

### Quality Gates
- Linting after every change
- Automated testing verification
- Claude writes self-verification scripts
- Two-tab review system for all commits

## Troubleshooting

### If Claude Seems Confused:
1. Stop immediately (don't try to correct)
2. Double escape to preserve any good context
3. Start fresh with proper context building
4. Document what was working before confusion

### If Context Quality Degrades:
1. Check context window usage
2. Use `/context-rescue` for management strategies
3. Consider strategic rewind to 40% usage
4. Rebuild with comprehensive "Prepare" method

---

**Remember**: These techniques turn Claude Code from a simple code generator into a powerful agentic workflow system. The investment in learning these patterns pays off exponentially in productivity and code quality.