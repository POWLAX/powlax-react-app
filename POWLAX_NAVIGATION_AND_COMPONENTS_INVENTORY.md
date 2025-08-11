# POWLAX Navigation and Components Inventory

**Generated:** January 11, 2025  
**Purpose:** Complete inventory of navigation, pages, and reusable components

---

## 🧭 NAVIGATION STRUCTURE

### Desktop Navigation (Sidebar - width ≥768px)
**Location:** `src/components/navigation/SidebarNavigation.tsx`

#### Main Navigation Items:
1. **Dashboard** - `/dashboard` - Icon: Home
2. **Teams** - `/teams` - Icon: Users
3. **Academy** - `/skills-academy` - Icon: GraduationCap
4. **Achievements** - `/gamification-showcase` - Icon: Trophy
5. **Resources** - `/resources` - Icon: BookOpen
6. **Community** - `/community` - Icon: MessageCircle

#### Admin Navigation Items (Only visible to admin users):
1. **Role Management** - `/admin/role-management` - Icon: UserCog
2. **Drill Editor** - `/admin/drill-editor` - Icon: Edit3
3. **WP Import Check** - `/admin/wp-import-check` - Icon: Database
4. **Sync Data** - `/admin/sync` - Icon: Shield

**Features:**
- Collapsible sidebar (toggles between 64px and 256px width)
- POWLAX logo (full when expanded, icon when collapsed)
- Search bar (hidden when collapsed)
- Tooltips on hover when collapsed
- Active state highlighting
- Admin section with divider

### Mobile Navigation (Bottom Nav - width <768px)
**Location:** `src/components/navigation/BottomNavigation.tsx`

#### Mobile Navigation Items:
1. **Dashboard** - `/dashboard` - Icon: Home
2. **Teams** - `/teams` - Icon: Users
3. **Academy** - `/skills-academy` - Icon: GraduationCap
4. **Rewards** - `/gamification-showcase` - Icon: Trophy
5. **Resources** - `/resources` - Icon: BookOpen

**Features:**
- Fixed bottom position
- Active state highlighting
- Special collapsible mode for Practice Planner and Skills Academy Workout pages
- Expandable menu with chevron toggle

---

## 📄 ALL PAGES IN THE SYSTEM

### Authenticated Pages (`/src/app/(authenticated)/`)
**Main Pages:**
- `/dashboard` - Main dashboard
- `/teams` - Teams overview
- `/skills-academy` - Skills Academy hub
- `/resources` - Training resources
- `/community` - Community page
- `/strategies` - Strategy browser
- `/gamification-showcase` - Achievements and rewards
- `/academy` - Academy overview (different from skills-academy)

**Team-Specific Pages:**
- `/teams/[teamId]/dashboard` - Team dashboard
- `/teams/[teamId]/practice-plans` - Practice planner
- `/teams/[teamId]/playbook` - Team playbook
- `/teams/[teamId]/hq` - Team headquarters

**Skills Academy Pages:**
- `/skills-academy/workouts` - Browse all workouts
- `/skills-academy/workout/[id]` - Individual workout (quiz-style interface)
- `/skills-academy/progress` - Progress tracking
- `/skills-academy/wall-ball/[id]` - Wall ball workout
- `/skills-academy/interactive-workout` - Interactive workout mode

**Detail Pages:**
- `/details/[type]/[id]` - Generic detail page for drills/strategies

**Admin Pages:**
- `/admin/role-management` - User role management
- `/admin/drill-editor` - Drill content editor
- `/admin/wp-import-check` - WordPress import verification
- `/admin/sync` - Data synchronization

**Test/Debug Pages:**
- `/debug-auth` - Authentication debugging
- `/test-supabase` - Supabase connection test
- `/test-wordpress` - WordPress integration test
- `/test-gamification` - Gamification system test
- `/gamification-demo` - Gamification demo
- `/gamification` - Gamification page (different from showcase)

### Demo Pages (`/src/app/demo/`)
- `/demo` - Demo launcher
- `/demo/practice-planner` - Practice planner demo
- `/demo/skills-academy` - Skills Academy demo
- `/demo/skills-academy/workouts` - Workouts browser demo
- `/demo/skills-academy/progress` - Progress tracking demo
- `/demo/skills-academy/interactive-workout` - Interactive workout demo
- `/demo/strategies` - Strategies demo
- `/demo/team-playbook` - Team playbook demo
- `/demo/player-profile` - Player profile demo
- `/demo/gamification` - Gamification demo

### Public Pages (`/src/app/`)
- `/` - Home/landing page
- `/auth/login` - Login page
- `/auth/magic-link` - Magic link authentication
- `/register/[token]` - Registration with token
- `/direct-login` - Direct login page
- `/offline` - Offline page
- `/demo-launcher` - Demo launcher
- `/practice-planner-demo` - Practice planner demo
- `/animations-demo` - Animations showcase
- `/admin-demo` - Admin features demo
- `/print-test` - Print functionality test
- `/simple-test` - Simple test page
- `/test-practice-planner` - Practice planner test

---

## 🧩 REUSABLE COMPONENTS

### UI Components (Shadcn/UI - 19 components)
**Location:** `src/components/ui/`
- `accordion.tsx` - Expandable/collapsible content sections
- `alert.tsx` - Alert messages and notifications
- `avatar.tsx` - User avatars and profile images
- `badge.tsx` - Status badges and labels
- `button.tsx` - Button component with variants
- `card.tsx` - Content cards with header/content/footer
- `checkbox.tsx` - Checkbox input
- `collapsible.tsx` - Collapsible content container
- `dialog.tsx` - Modal dialogs
- `dropdown-menu.tsx` - Dropdown menu component
- `input.tsx` - Text input fields
- `label.tsx` - Form labels
- `progress.tsx` - Progress bars
- `scroll-area.tsx` - Scrollable content areas
- `select.tsx` - Select dropdown component
- `skeleton.tsx` - Loading skeleton placeholders
- `table.tsx` - Data tables
- `tabs.tsx` - Tab navigation
- `textarea.tsx` - Multi-line text input

### Navigation Components
**Location:** `src/components/navigation/`
- `SidebarNavigation.tsx` - Desktop sidebar navigation
- `BottomNavigation.tsx` - Mobile bottom navigation
- `Breadcrumbs.tsx` - Breadcrumb navigation (if exists)

### Practice Planner Components
**Location:** `src/components/practice-planner/`
- Practice timeline components
- Drill selector components
- Practice schedule components
- Print layout components

### Skills Academy Components
**Location:** `src/components/skills-academy/`
- `WorkoutCompletionAnimation.tsx` - Completion animations
- Workout cards
- Progress tracking components
- Wall ball specific components

### Dashboard Components
**Location:** `src/components/dashboards/`
- `StatCard` - Statistics display cards
- `TaskCard` - Task/activity cards
- Dashboard widgets
- Quick action components

### Team Components
**Location:** `src/components/teams/`
- Team cards
- Member lists
- Team management components
- `CoachQuickActions.tsx` - Coach action shortcuts

### Gamification Components
**Location:** `src/components/gamification/`
- Points display
- Badge showcase
- Leaderboard components
- Achievement notifications

### Animation Components
**Location:** `src/components/animations/`
- Loading animations
- Success animations
- Transition effects
- Interactive feedback

### Common/Shared Components
**Location:** `src/components/common/`
- Loading spinners
- Error boundaries
- Empty states
- Page headers

### Search Components
**Location:** `src/components/search/`
- `SearchTrigger` - Search bar trigger
- Search results display
- Filter components

### Theme Components
**Location:** `src/components/theme/`
- `ThemeToggle` - Dark/light mode toggle
- Theme provider wrapper

### Authentication Components
**Location:** `src/components/auth/`
- Login forms
- Registration forms
- Auth guards
- Session management

### Detail Page Components
**Location:** `src/components/details/`
- Detail page layouts
- Content viewers
- Media players

### Team Playbook Components
**Location:** `src/components/team-playbook/`
- `SaveToPlaybookModal.tsx` - Save to playbook dialog
- Play cards
- Strategy viewers

### Onboarding Components
**Location:** `src/components/onboarding/`
- Welcome modals
- Tutorial components
- First-time user guides

---

## 🎨 Component Usage Patterns

### Brand Colors (Tailwind Classes)
- **Primary Blue:** `bg-powlax-blue` (#003366)
- **Accent Orange:** `bg-powlax-orange` (#FF6600)
- **Text Gray:** `text-powlax-gray` (#4A4A4A)

### Common Component Combinations

#### Page Layout Pattern
```tsx
<div className="container mx-auto px-4 py-8">
  <PageHeader title="Page Title" />
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <Card>Content</Card>
  </div>
</div>
```

#### Dashboard Card Pattern
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <Badge>Status</Badge>
  </CardHeader>
  <CardContent>
    <Progress value={75} />
  </CardContent>
</Card>
```

#### Form Pattern
```tsx
<div className="space-y-4">
  <div>
    <Label htmlFor="input">Label</Label>
    <Input id="input" />
  </div>
  <Button>Submit</Button>
</div>
```

#### Mobile-Responsive Grid
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {items.map(item => <Card key={item.id} />)}
</div>
```

---

## 🔄 Components That Can Be Reused

### High Reusability (Can use anywhere)
1. **All UI Components** - Button, Card, Input, etc.
2. **StatCard** - For any statistics display
3. **Loading Spinners** - For any loading state
4. **Error Boundaries** - For error handling
5. **Empty States** - For no-data scenarios
6. **Badge** - For status indicators
7. **Progress** - For progress tracking
8. **Avatar** - For user profiles

### Medium Reusability (Domain-specific but flexible)
1. **WorkoutCompletionAnimation** - Can use for any completion event
2. **SearchTrigger** - Can add search to any page
3. **SaveToPlaybookModal** - Can adapt for saving other content
4. **CoachQuickActions** - Can adapt for other user roles
5. **Breadcrumbs** - Can use on any deep navigation page

### Low Reusability (Page-specific)
1. **Practice timeline components** - Specific to practice planner
2. **Wall ball components** - Specific to wall ball workouts
3. **Team HQ components** - Specific to team management
4. **Onboarding modals** - Specific to first-time setup

---

## 📱 Responsive Breakpoints

The system uses these breakpoints:
- **Mobile:** < 768px (bottom navigation)
- **Tablet:** 768px - 1023px (sidebar starts)
- **Desktop:** 1024px - 1279px
- **Large Desktop:** ≥ 1280px

Navigation automatically switches between:
- **Mobile:** Bottom navigation bar
- **Desktop:** Collapsible sidebar

---

## 🚀 Quick Component Import Reference

```tsx
// UI Components
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

// Navigation
import SidebarNavigation from '@/components/navigation/SidebarNavigation'
import BottomNavigation from '@/components/navigation/BottomNavigation'

// Dashboard Components
import StatCard from '@/components/dashboards/StatCard'
import TaskCard from '@/components/dashboards/TaskCard'

// Skills Academy
import WorkoutCompletionAnimation from '@/components/skills-academy/WorkoutCompletionAnimation'

// Teams
import CoachQuickActions from '@/components/teams/dashboard/CoachQuickActions'
```

---

This inventory provides a complete overview of all navigation, pages, and reusable components in the POWLAX system.