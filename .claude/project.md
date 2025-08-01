# Practice Planner - shadcn Configuration

## Component Library
This project uses shadcn/ui components. To add new components:
```bash
npx shadcn@latest add [component-name]
```

## Available shadcn Components

Button, Card, Dialog, Dropdown Menu
Form components (Input, Label, Textarea)
Data Display (Table, Badge, Avatar)
Feedback (Alert, Toast, Progress)
Navigation (Tabs, Navigation Menu)

## Styling Conventions

Use shadcn components as base, customize with Tailwind classes
Component variants: default, destructive, outline, secondary, ghost, link
Sizes: default, sm, lg, icon

## Example Component Usage
```tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// In your component
<Button variant="outline" size="sm">
  Add Drill
</Button>
```

## Custom Theme Variables
Located in app/globals.css:

--primary: Your POWLAX blue (#3B4AA8)
--secondary: POWLAX gray (#383535)
Custom category colors for drills