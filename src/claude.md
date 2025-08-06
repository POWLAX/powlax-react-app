# Claude Context: Source Code

*Auto-updated: 2025-01-16*  
*Purpose: Local context for Claude when working in POWLAX source code*

## 🎯 **What This Area Does**
Complete POWLAX application source code including Next.js 14 App Router pages, React components with Shadcn/UI, custom hooks, TypeScript utilities, and Supabase integration.

## 🔧 **Key Components**
**Primary Directories:**
- `app/` - Next.js 14 App Router pages and layouts
- `components/` - React components (Shadcn/UI + custom POWLAX components)
- `hooks/` - Custom React hooks (useSupabase, useAuthContext, etc.)
- `lib/` - Utility libraries and Supabase client configuration
- `types/` - TypeScript definitions matching Supabase schema
- `contexts/` - React contexts for auth and global state
- `middleware/` - Next.js middleware for route protection

**Dependencies:**
- Next.js 14 with App Router
- React 18 with TypeScript 5
- Tailwind CSS with POWLAX brand colors
- Shadcn/UI components (New York style)
- Supabase for database, auth, and realtime
- TanStack React Query v5 for state management

## 📱 **Mobile & Age Band Considerations**
**Mobile Responsiveness:**
- Mobile-first design: 375px+ screens supported
- Touch targets: 44px+ for field usage with gloves
- High contrast for outdoor sunlight visibility
- Bottom navigation on mobile, sidebar on desktop
- Battery-efficient interactions

**Age Band Appropriateness:**
- **Do it (8-10):** Large buttons, simple navigation, guided workflows
- **Coach it (11-14):** Scaffolded interfaces, learning prompts, progressive disclosure
- **Own it (15+):** Advanced controls, full feature access, customization options

## 🔗 **Integration Points**
**This area connects to:**
- Supabase database (33+ tables with RLS policies)
- WordPress JWT authentication system
- Practice planning workflow (core POWLAX feature)
- Skills Academy educational content
- Team management and role-based access
- Gamification system (points, badges, progress)

**When you modify this area, also check:**
- Mobile responsiveness across all breakpoints
- Age-appropriate interface validation
- TypeScript type consistency
- Supabase RLS policy compatibility
- Integration with authentication context

## 🧪 **Testing Strategy**
**Essential Tests:**
- `npm run lint` - ESLint code quality checks
- `npm run build` - Next.js build verification
- `npm run typecheck` - TypeScript type validation
- Mobile testing on 375px, 768px, 1024px breakpoints
- Age band interface usability testing

## ⚠️ **Common Issues & Gotchas**
**Known Problems:**
- Server/client component boundary issues with Supabase
- Mobile touch target sizing for outdoor field usage
- Age-appropriate interface complexity balancing
- Authentication state synchronization

**Before Making Changes:**
1. Verify you're on `powlax-sub-agent-system` branch
2. Run quality gates: `npm run lint && npm run build`
3. Test mobile responsiveness on multiple breakpoints
4. Validate age-appropriate interfaces for target users
5. Check authentication flow compatibility
6. Verify Supabase integration works correctly

**POWLAX Brand Standards:**
- Colors: #003366 (blue), #FF6600 (orange), #4A4A4A (gray)
- Mobile-first responsive design
- High contrast for outdoor field usage
- 15-minute practice planning workflow target

---
*This file auto-updates when structural changes are made to ensure context accuracy*