# Claude Context: Components

*Auto-updated: 2025-01-16*  
*Purpose: Local context for Claude when working with POWLAX React components*

## 🎯 **What This Area Does**
Complete React component library for POWLAX including 17 Shadcn/UI components, custom practice planner components, navigation systems, and domain-specific components for lacrosse coaching workflows.

## 🔧 **Key Components**
**Primary Directories:**
- `ui/` - 17 Shadcn/UI components (Button, Card, Input, Tabs, Avatar, etc.)
- `practice-planner/` - Core practice planning functionality components
- `navigation/` - Mobile-responsive navigation (SidebarNavigation, BottomNavigation)
- `animations/` - Gamification animations and visual feedback
- `dashboards/` - Dashboard components (StatCard, TaskCard, etc.)
- `skills-academy/` - Educational content and workout building components

**Shadcn/UI Components (17 total):**
- Core UI: Button, Card, Input, Textarea, Label, Select, Checkbox
- Layout: Tabs, Dialog, ScrollArea, Accordion  
- Data: Table, Progress, Badge
- Navigation: Avatar, Alert, Slider

**Custom POWLAX Components:**
- Practice planning workflow components
- Age-appropriate interface variations
- Mobile-first responsive layouts

## 📱 **Mobile & Age Band Considerations**
**Mobile Responsiveness:**
- All components work on 375px+ screens
- Touch targets minimum 44px for gloved hands
- Bottom navigation on mobile (<768px)
- Sidebar navigation on desktop (≥768px)
- High contrast for outdoor field visibility

**Age Band Appropriateness:**
- **Do it (8-10):** Large buttons, simple icons, minimal text, guided interactions
- **Coach it (11-14):** Progressive disclosure, helpful tooltips, scaffolded learning
- **Own it (15+):** Full functionality, advanced controls, customization options

## 🔗 **Integration Points**
**This area connects to:**
- Next.js App Router pages (server/client component boundaries)
- Supabase database with 62 actual tables for complete system functionality
- TanStack React Query for state management
- Supabase Auth + Magic Links with custom users table
- POWLAX custom hooks (useDrills targets powlax_drills, useStrategies targets powlax_strategies, etc.)
- Skills Academy system with drill_ids column relationships
- Tailwind CSS with POWLAX brand colors

**Database Integration (ACTUAL SCHEMA):**
- **Core Auth**: users, user_sessions, user_auth_status, magic_links, registration_links
- **Registration**: registration_sessions, user_onboarding
- **Content**: powlax_drills, user_drills, powlax_strategies, user_strategies, practices, practice_drills
- **Teams**: clubs, teams, team_members
- **Family**: family_accounts, family_members, parent_child_relationships
- **Skills Academy**: skills_academy_series (49), skills_academy_workouts (166), skills_academy_drills (167), wall_ball_drill_library (48)
- **Gamification**: user_points_wallets, user_badges, powlax_points_currencies, points_transactions_powlax, powlax_player_ranks
- **Integration**: webhook_queue, webhook_events, membership_products, membership_entitlements

**When you modify this area, also check:**
- Server/client component usage (use 'use client' when needed)
- TypeScript prop types and interfaces
- Mobile responsiveness across all breakpoints
- Age-appropriate interface variations
- Integration with parent page components
- Shadcn/UI component version compatibility

## 🧪 **Testing Strategy**
**Essential Tests:**
- Component rendering without errors
- Props validation and TypeScript compliance
- Mobile responsiveness on 375px, 768px, 1024px
- Age band interface usability
- Touch target accessibility (44px+ minimum)
- Integration with authentication contexts

**Testing Commands:**
- `npm run lint` - Component code quality
- `npm run build` - Build-time component validation
- `npm run typecheck` - TypeScript prop validation

## ⚠️ **Common Issues & Gotchas**
**Known Problems:**
- Server/client component boundary confusion with Supabase hooks
- Mobile touch targets too small for field usage
- Age band complexity not appropriate for target users
- Shadcn/UI component styling conflicts with Tailwind

**Before Making Changes:**
1. Check if component needs 'use client' directive
2. Validate TypeScript props and interfaces
3. Test mobile responsiveness on multiple devices
4. Verify age-appropriate interface design
5. Check integration with existing POWLAX patterns
6. Validate Shadcn/UI component usage follows New York style

**Component Patterns:**
- Use Shadcn/UI components as base, customize with POWLAX colors
- Mobile-first responsive design approach
- Age-appropriate interface variations using conditional rendering
- Server components by default, client components only when needed
- Consistent spacing using Tailwind utility classes

**POWLAX Brand Integration:**
- Primary: #003366 (blue) for main actions and branding
- Accent: #FF6600 (orange) for highlights and CTAs  
- Neutral: #4A4A4A (gray) for text and secondary elements
- High contrast ratios for outdoor field usage

---
*This file auto-updates when structural changes are made to ensure context accuracy*