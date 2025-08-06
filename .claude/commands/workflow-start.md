# Workflow Start Guide

## Before You Begin: The Sacred Trinity

Remember: **Explore → Plan → Execute** (Never skip to Execute!)

### Step 1: Context Building
Use the "Prepare" method:

**Instead of**: "Build a login form"
**Try**: "Prepare to discuss how our authentication system works. Read relevant files and understand the current implementation."

Let Claude spend 50k+ tokens building context (7+ minutes). If the overview is wrong, escape and restart.

### Step 2: Context Preservation  
After building context:
- Double escape (`⎋⎋`) to fork the conversation
- Use `resume` to pull context into new terminals
- Keep multiple smart Claude instances running

### Critical Context Building Prompts:

```
"Prepare to work on [specific task]. Read relevant files, understand the architecture, 
and build comprehensive context about how this system works."

"Dig into the codebase and prepare to discuss the ins and outs of how [component/feature] works."
```

### Context Quality Check:
Ask follow-up questions to ensure Claude has deep understanding:
- "What are the key architectural patterns in this codebase?"
- "What are the main integration points I need to be aware of?"
- "What could go wrong with this approach?"

### Next Steps
- Run `/workflow-plan` when ready to create task breakdown
- Remember: Context is everything - invest in it upfront!

### Emergency Context Recovery:
If Claude seems confused or gives poor output:
1. Escape immediately (don't try to correct)
2. Start fresh with better context building
3. This is a "gambling game" - when you lose, restart rather than fix