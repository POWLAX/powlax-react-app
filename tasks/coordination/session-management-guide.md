# Master Controller Session Management Guide

## Purpose
This guide ensures the POWLAX Master Controller prevents duplicate work across parallel sessions and maintains complete work state awareness.

## Activation Checklist

### STEP 1: Pre-Activation Assessment
```bash
# Check for active work
list_dir tasks/active/

# Check coordination status
read_file tasks/coordination/active-work-sessions.md

# Review any ongoing agent assignments
```

### STEP 2: Session Initialization
```markdown
# Add new session entry to active-work-sessions.md
## Session: [CURRENT-TIMESTAMP] - Master Controller Activation
- **Session ID:** session-[timestamp]
- **User Request:** [User's actual request]
- **Assigned Agents:** [TBD - will be determined during analysis]
- **Work Items:** [TBD - will be broken down from user request]
- **Session Status:** ACTIVE
- **Started:** [timestamp]
- **Last Updated:** [timestamp]
- **Next Steps:** Analyze user request and determine agent assignments
```

### STEP 3: Conflict Detection
- **Check for overlapping work:** Review active sessions for similar tasks
- **Identify resource conflicts:** Ensure no agent is double-assigned
- **Assess build state:** Verify system is in stable state for new work

## During Work Session

### Agent Assignment Protocol
1. **Document Assignment:** Log which agent is handling which specific task
2. **Update Status:** Mark items as in-progress when agents start work
3. **Track Progress:** Update active-work-sessions.md with checkpoints
4. **Monitor Build Health:** Ensure compilation stays healthy

### Status Update Format
```markdown
- **Last Updated:** [new-timestamp]
- **Work Items:** 
  - [x] Completed item - Assigned to: [agent] - Status: completed
  - [ ] In progress item - Assigned to: [agent] - Status: in-progress
  - [ ] Pending item - Assigned to: [agent] - Status: not-started
```

## Session Completion

### Cleanup Protocol
1. **Mark Session Complete:**
   ```markdown
   - **Session Status:** COMPLETED
   - **Completed:** [timestamp]
   - **Outcome:** [Brief summary of what was accomplished]
   ```

2. **Archive Work:**
   - Move completed tasks to `tasks/completed/`
   - Update active registry to remove completed items
   - Document any follow-up needs

3. **Clean Active Registry:**
   - Remove session from active tracking
   - Archive to completed sessions section
   - Clear any temporary work files

## Conflict Resolution Scenarios

### Scenario 1: Duplicate Work Detected
- **Action:** HALT new work assignment
- **Response:** "I notice [specific work] is already assigned to [agent] in session [ID]. Should I coordinate with that session or wait for completion?"

### Scenario 2: Build Break During Session
- **Action:** STOP all agents immediately
- **Response:** "Build stability compromised. Halting all agent work until resolved."
- **Resolution:** Fix build issues before resuming any agent assignments

### Scenario 3: Unclear Work State
- **Action:** ASK USER for clarification
- **Response:** "Work state unclear. Please clarify: [specific question about priorities/conflicts]"

## Best Practices

### Session Naming
- Use timestamp format: `session-YYYYMMDDHHMMSS`
- Include brief descriptor: `session-20250115230000-practice-planner-fix`

### Work Item Granularity
- Break down user requests into specific, trackable tasks
- Assign each task to a specific agent
- Use actionable language (verb + object)

### Status Tracking
- Update timestamps on every status change
- Include brief notes on major decisions
- Link to specific files or components being modified

### Documentation Standards
- Always include context for future sessions
- Document decisions and rationale
- Note any dependencies or blockers

## Emergency Procedures

### If Session Tracking Fails
1. Stop all agent work immediately
2. Manually audit all active tasks
3. Recreate active work registry from task directories
4. Resume with proper tracking in place

### If Conflicts Arise Mid-Session
1. Pause conflicting agents
2. Document the conflict clearly
3. Present options to user for resolution
4. Resume only after explicit user direction

---

This system ensures that when you activate the Master Controller again, it will immediately know what work is already in progress and avoid duplicating efforts across parallel sessions.
