# GitHub Copilot Instructions for POWLAX

## Before Suggesting Code

1. Check `AI_FRAMEWORK_ERROR_PREVENTION.md` for common patterns
2. Verify imports exist for all JSX elements
3. Escape quotes in JSX strings

## Import Pattern
```typescript
// Always complete imports BEFORE writing JSX
import { Play, Pause, Trophy, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
```

## JSX Pattern
```typescript
// Always escape quotes
<p>doesn&apos;t</p>  // NOT: doesn't
<p>&quot;quoted&quot;</p>  // NOT: "quoted"
```

## Type Pattern
```typescript
// Never use 'any'
const [data, setData] = useState<SpecificType | null>(null)
// NOT: useState<any>(null)
```

## File Check Pattern
```bash
# Before creating files
ls src/components/
# Only create if doesn't exist
```

## Validation Pattern
```bash
# After every change
npm run lint
npm run build
```

## Common Lucide Icons
- Trophy, Play, Pause, CheckCircle
- ArrowLeft, ArrowRight, ChevronDown, ChevronUp
- Home, Settings, User, Activity
- Timer, Clock, Calendar

## Shadcn/UI Components
Check before importing:
- button, card, badge, progress
- dialog, dropdown-menu, tabs
- form, input, label, textarea
- alert, toast, skeleton

If missing: `npx shadcn@latest add [component]`

## Testing Shortcuts
```bash
npm run lint       # Check for errors
npm run build      # Verify builds
npx playwright test # Run tests
```