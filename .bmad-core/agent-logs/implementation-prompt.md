# Agent Log Implementation Prompt

## 🎯 Purpose
Update all agent MD files to reference their personal work logs and establish a protocol for maintaining these logs throughout the project.

## 📋 Implementation Options

### Option 1: Individual Agent Updates (Recommended)
**Best for:** Thorough, agent-specific customization

```bash
# Activate each agent individually
/BMad:agents:analyst
*update-with-log

/BMad:agents:ux-expert
*update-with-log

# Continue for each agent...
```

**Pros:**
- Each agent can customize their log usage
- Agent stays in character during update
- Can add agent-specific logging preferences

**Cons:**
- Takes more time (9 separate sessions)
- Requires switching between agents

### Option 2: Party Mode Update
**Best for:** Quick, collaborative approach

```bash
/BMad:agents:bmad-orchestrator
*party-mode

# Then provide this prompt:
"All agents: Please update your agent files to reference your new work logs located at .bmad-core/agent-logs/[agent-id]-log.md. Each of you should add a work-log section to your YAML configuration."
```

**Pros:**
- All agents updated simultaneously
- Can see how each agent approaches logging
- Fosters inter-agent awareness

**Cons:**
- Less individual customization
- May be chaotic with 9 agents responding

### Option 3: Orchestrator Batch Update (Most Efficient)
**Best for:** Systematic, consistent implementation

```bash
/BMad:agents:bmad-orchestrator
*task update-agent-logs

# Or use this prompt:
"Please update all agent MD files to include references to their work logs. Add a 'work-log' section to each agent's YAML configuration pointing to .bmad-core/agent-logs/[agent-id]-log.md"
```

**Pros:**
- Single command execution
- Consistent implementation
- Orchestrator ensures completeness

**Cons:**
- Less agent personality in implementation
- Generic rather than customized

## 📝 What to Add to Each Agent File

Add this section after the `dependencies` section in each agent's YAML:

```yaml
work-log:
  enabled: true
  location: .bmad-core/agent-logs/[agent-id]-log.md
  update-protocol:
    - Log tasks completed after each session
    - Document handoffs with context
    - Note blockers and resolutions
    - Track key decisions made
    - Update "I work best with" based on experience
  session-format: |
    ### Session: [Date] - [Brief Description]
    **Tasks Completed:**
    - [Task]: [Outcome]
    
    **Handoffs:**
    - To [Agent]: [Context]
    
    **Key Learnings:**
    - [Learning that improves future work]
```

## 🎯 Recommended Approach

**For POWLAX Project:** Use **Option 3 (Orchestrator Batch Update)** because:
1. You need consistency across all agents
2. It's the most time-efficient
3. The orchestrator can ensure all agents follow the same format
4. You can always have individual agents customize later

## 📌 Next Steps After Implementation

1. Each agent should review their log at session start
2. Update logs before handoffs
3. Reference logs when making decisions
4. Use logs for continuity between sessions

## 🚀 Quick Start Command

```bash
# In your next session, run:
/BMad:agents:bmad-orchestrator

# Then paste:
"Please implement the agent work log system by updating all agent MD files to include a work-log section pointing to their logs at .bmad-core/agent-logs/[agent-id]-log.md. Ensure each agent knows to check and update their log during sessions."
```

This will establish the logging system across all agents efficiently and consistently.