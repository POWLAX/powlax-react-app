# Agent Plan Modification Rules

## Overview
All BMad agents have the ability to update project plans and track progress using the TodoWrite tool. This document defines the rules and protocols.

---

## 1. What Agents CAN Do Without Permission

### Direct Updates Allowed:
1. **Update Task Status**
   ```javascript
   // Agents can change status to:
   - "pending" (not started)
   - "in_progress" (currently working)
   - "completed" (finished)
   ```

2. **Add Progress Notes**
   - Brief descriptions of work completed
   - Token usage percentages
   - Blockers encountered

3. **Create Subtasks**
   - Break down current tasks into smaller items
   - Add implementation details
   - Track incremental progress

### Example TodoWrite Usage:
```javascript
TodoWrite({
  todos: [{
    id: "track-a-3",
    content: "Import CSV data into Supabase", 
    status: "completed",
    priority: "high"
  }]
})
```

---

## 2. What Requires User Approval

### Must Ask Before:
1. **Adding New Major Tasks**
   - Anything outside current scope
   - New features not in requirements
   - Significant architectural changes

2. **Removing Tasks**
   - Even if deemed unnecessary
   - Must explain why removal is suggested

3. **Changing Priorities**
   - High → Medium → Low adjustments
   - Re-ordering task sequences

4. **Extending Timelines**
   - Pushing back deadlines
   - Adding time estimates

### Approval Request Format:
```
I'd like to modify the plan:
- Add new task: "Create API integration tests"
- Reason: Ensure data import reliability
- Priority: Medium
- Estimated time: 2 hours

Shall I update the plan?
- [Agent Name]
```

---

## 3. Progress Tracking Format

### In Track Progress Files:
```markdown
### ✅ Task 3: [Task Name]
**Status**: Completed
**Completed**: 2025-08-04
**Duration**: 2 hours
**Notes**: 
- Implemented X feature
- Fixed Y issue
- Created Z documentation
**Token Usage**: 15% (session), 40% (total)
```

### In TodoWrite Updates:
- Keep descriptions concise
- Include task ID for continuity
- Update immediately after status change
- Don't batch updates (real-time is better)

---

## 4. Best Practices

### DO:
- ✅ Update status when starting a task
- ✅ Mark complete immediately when done
- ✅ Add helpful notes for next agent
- ✅ Track token usage in major tasks
- ✅ Create subtasks for complex work

### DON'T:
- ❌ Leave tasks "in_progress" indefinitely
- ❌ Skip status updates
- ❌ Remove tasks without asking
- ❌ Change priorities without discussion
- ❌ Forget to sign your updates

---

## 5. Multi-Agent Coordination

When handing off to another agent:
1. Update all task statuses first
2. Add notes about what's ready for next agent
3. Mention in handoff message what needs attention

Example:
```
Updated TRACK_A_PROGRESS.md:
- Task 3: CSV Import (completed)
- Task 4: Data Verification (ready to start)
- Note: 276 drills imported, need strategy mapping

Ready for handoff to analyst for mapping work.
- Sam (Developer)
```

---

## 6. Token Usage Tracking

Include in progress updates:
- **Session Usage**: Tokens used in current task
- **Total Usage**: Cumulative for the track
- **Estimate Remaining**: For complex tasks

Format:
```
**Token Usage**: 
- This task: ~2000 tokens (10%)
- Track total: ~5000 tokens (25%)
- Remaining capacity: ~75%
```

---

*These rules ensure consistent progress tracking across all agents while maintaining user control over scope changes*