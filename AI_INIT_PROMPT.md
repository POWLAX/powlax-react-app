# AI Assistant Initialization Prompt

## Copy this message when starting a new AI session:

```
I'm working on the POWLAX React/Next.js codebase. Before we begin:

1. Please read and acknowledge the AI_FRAMEWORK_ERROR_PREVENTION.md file in the root directory
2. Review CLAUDE.md for project conventions
3. Note these critical rules:
   - Always run `npm run lint` before and after changes
   - Use &apos; for apostrophes in JSX, never raw quotes
   - Check if files exist before creating new ones
   - Import all lucide-react icons that you use
   - Never use 'any' type in TypeScript
   - Only server components can be async

Please confirm you've understood these guidelines before we proceed.
```

## For Different AI Platforms:

### ChatGPT/GPT-4
Start your conversation with:
```
First, please review the file AI_FRAMEWORK_ERROR_PREVENTION.md in the project root. This contains critical error prevention guidelines for this codebase. Acknowledge each of the 10 common error patterns listed there.
```

### Cursor
Use the @ symbol to reference:
```
@AI_FRAMEWORK_ERROR_PREVENTION.md
@CLAUDE.md
Please review these files first and follow their guidelines strictly.
```

### GitHub Copilot Chat
```
Before suggesting code, check:
1. AI_FRAMEWORK_ERROR_PREVENTION.md for common errors
2. Existing imports in the file
3. Whether components exist in /src/components/ui/
```

### Claude (Anthropic)
```
The project has an AI_FRAMEWORK_ERROR_PREVENTION.md file with critical guidelines. Please read it and confirm you'll follow these patterns:
- Check existing files before creating new ones
- Escape quotes in JSX properly
- Include all imports
- Match import/export styles
```

## Quick Validation Commands

Always ask the AI to run these:
```bash
# Before starting
npm run lint
ls src/components/  # Check what exists

# After changes
npm run lint
npm run build
```

## Red Flag Phrases to Watch For

If the AI says any of these, stop and verify:
- "Let me create a new file for this..."
- "I'll implement this functionality..."
- "This should work..."
- "I assume..."
- "Typically..."

Instead, ask:
- "First, check if this file/component exists"
- "Show me the current imports"
- "Run ESLint to check for errors"
- "What's the existing pattern for this?"