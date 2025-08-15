# POWLAX React App - Complete Page & Component Index

## Index Overview
This document provides a comprehensive map of every page in the POWLAX React application and all components used on each page, with their exact file locations. This index makes it easy to find components when working on specific pages.

---

## 🏠 **ROOT PAGES**

### **Home Page**
- **URL**: `http://localhost:3000/`
- **File**: `src/app/page.tsx`
- **Components Used**: None (basic JSX only)

### **Simple Test Page**
- **URL**: `http://localhost:3000/simple-test`
- **File**: `src/app/simple-test/page.tsx`
- **Components Used**: None (basic JSX only)

---

## 🔐 **AUTHENTICATION PAGES**

### **Login Page**
- **URL**: `http://localhost:3000/auth/login`
- **File**: `src/app/auth/login/page.tsx`
- **Components Used**:
  - `Card, CardContent, CardDescription, CardHeader, CardTitle` → `src/components/ui/card`
  - `Button` → `src/components/ui/button`
  - `useAuth` → `src/contexts/SupabaseAuthContext`
  - `Loader2, AlertCircle` → `lucide-react`

### **Magic Link Page**
- **URL**: `http://localhost:3000/auth/magic-link`
- **File**: `src/app/auth/magic-link/page.tsx`

### **Registration Page**
- **URL**: `http://localhost:3000/register/[token]`
- **File**: `src/app/register/[token]/page.tsx`

---

## 📊 **DASHBOARD PAGES**

### **Main Dashboard**
- **URL**: `http://localhost:3000/dashboard`
- **File**: `src/app/(authenticated)/dashboard/page.tsx`
- **Components Used**:
  - `useAuth` → `src/contexts/SupabaseAuthContext`
  - `useRoleViewer` → `src/contexts/RoleViewerContext`
  - `Loader2` → `lucide-react`
  - **Role-Based Dashboards**:
    - `PlayerDashboard` → `src/components/dashboards/PlayerDashboard`
    - `CoachDashboard` → `src/components/dashboards/CoachDashboard`
    - `ParentDashboard` → `src/components/dashboards/ParentDashboard`
    - `DirectorDashboard` → `src/components/dashboards/DirectorDashboard`
    - `AdminDashboard` → `src/components/dashboards/AdminDashboard`
    - `PublicDashboard` → `src/components/dashboards/PublicDashboard`

---

## 👥 **TEAM PAGES**

### **Teams List**
- **URL**: `http://localhost:3000/teams`
- **File**: `src/app/(authenticated)/teams/page.tsx`
- **Components Used**:
  - `Card, CardContent, CardHeader, CardTitle` → `src/components/ui/card`
  - `Button` → `src/components/ui/button`
  - `Users, ChevronRight, Plus, Activity, Loader2` → `lucide-react`
  - `useTeams` → `src/hooks/useTeams`

### **Team Dashboard**
- **URL**: `http://localhost:3000/teams/[teamId]/dashboard`
- **File**: `src/app/(authenticated)/teams/[teamId]/dashboard/page.tsx`
- **Components Used**:
  - `useTeam` → `src/hooks/useTeams`
  - `useTeamDashboard` → `src/hooks/useTeamDashboard`
  - `useSupabase` → `src/hooks/useSupabase`
  - `Loader2, AlertCircle` → `lucide-react`
  - **Team Dashboard Components**:
    - `TeamHeader` → `src/components/teams/dashboard/TeamHeader`
    - `CoachQuickActions` → `src/components/teams/dashboard/CoachQuickActions`
    - `UpcomingSchedule` → `src/components/teams/dashboard/UpcomingSchedule`
    - `TeamRoster` → `src/components/teams/dashboard/TeamRoster`
    - `ProgressOverview` → `src/components/teams/dashboard/ProgressOverview`
    - `RecentActivity` → `src/components/teams/dashboard/RecentActivity`
    - `ParentView` → `src/components/teams/dashboard/ParentView`
    - `PlayerView` → `src/components/teams/dashboard/PlayerView`
    - `TeamPlaybookSection` → `src/components/teams/dashboard/TeamPlaybookSection`
  - `Button` → `src/components/ui/button`

### **Team HQ**
- **URL**: `http://localhost:3000/teams/[teamId]/hq`
- **File**: `src/app/(authenticated)/teams/[teamId]/hq/page.tsx`
- **Components Used**:
  - `useTeam` → `src/hooks/useTeams`
  - `Calendar, Users, BookOpen, Trophy, MessageSquare, BarChart3, Settings, ChevronRight, Loader2, AlertCircle` → `lucide-react`
  - `Card, CardContent, CardDescription, CardHeader, CardTitle` → `src/components/ui/card`
  - `Badge` → `src/components/ui/badge`
  - `Button` → `src/components/ui/button`

### **Team Playbook**
- **URL**: `http://localhost:3000/teams/[teamId]/playbook`
- **File**: `src/app/(authenticated)/teams/[teamId]/playbook/page.tsx`

---

## 🏈 **PRACTICE PLANNER**

### **Practice Plans Page**
- **URL**: `http://localhost:3000/teams/[teamId]/practiceplan` (Also accessible at `/teams/no-team/practiceplan`)
- **File**: `src/app/(authenticated)/teams/[teamId]/practiceplan/page.tsx`
- **Components Used**:
  - **Practice Planner Components**:
    - `DrillLibraryTabbed` → `src/components/practice-planner/DrillLibraryTabbed`
    - `StrategyCard` → `src/components/practice-planner/StrategyCard`
    - `PracticeTimelineWithParallel` → `src/components/practice-planner/PracticeTimelineWithParallel`
    - `PracticeDurationBar` → `src/components/practice-planner/PracticeDurationBar`
    - `PracticeTemplateSelector` → `src/components/practice-planner/PracticeTemplateSelector`
    - `PracticeScheduleCard` → `src/components/practice-planner/PracticeScheduleCard`
    - `ActiveStrategiesSection` → `src/components/practice-planner/ActiveStrategiesSection`
    - `PrintablePracticePlan` → `src/components/practice-planner/PrintablePracticePlan`
  - **Modal Components**:
    - `SavePracticeModal` → `src/components/practice-planner/modals/SavePracticeModal`
    - `LoadPracticeModal` → `src/components/practice-planner/modals/LoadPracticeModal`
    - `AddCustomStrategiesModal` → `src/components/practice-planner/modals/AddCustomStrategiesModal`
    - `StrategiesListModal` → `src/components/practice-planner/modals/StrategiesListModal`
    - `StudyDrillModal` → `src/components/practice-planner/modals/StudyDrillModal`
    - `StudyStrategyModal` → `src/components/practice-planner/modals/StudyStrategyModal`
  - **UI Components**:
    - `Accordion, AccordionContent, AccordionItem, AccordionTrigger` → `src/components/ui/accordion`
  - **Hooks**:
    - `usePracticePlans` → `src/hooks/usePracticePlans`
    - `useDrills` → `src/hooks/useDrills`
    - `usePrint` → `src/hooks/usePrint`
    - `useStrategies` → `src/hooks/useStrategies`
    - `useAuth` → `src/contexts/SupabaseAuthContext`
  - **Icons**: `Calendar, Clock, MapPin, Save, Printer, RefreshCw, FolderOpen, Plus, Target, Loader2` → `lucide-react`

### **Test Practice Planner**
- **URL**: `http://localhost:3000/test-practice-planner`
- **File**: `src/app/test-practice-planner/page.tsx`

---

## 🎓 **SKILLS ACADEMY**

### **Skills Academy Hub**
- **URL**: `http://localhost:3000/skills-academy`
- **File**: `src/app/(authenticated)/skills-academy/page.tsx`
- **Components Used**:
  - `SkillsAcademyHubEnhanced` → `src/components/skills-academy/SkillsAcademyHubEnhanced`
  - `createServerClient` → `src/lib/supabase-server`

### **Skills Academy Workouts List**
- **URL**: `http://localhost:3000/skills-academy/workouts`
- **File**: `src/app/(authenticated)/skills-academy/workouts/page.tsx`

### **Individual Workout Page**
- **URL**: `http://localhost:3000/skills-academy/workout/[id]`
- **File**: `src/app/(authenticated)/skills-academy/workout/[id]/page.tsx`
- **Components Used**:
  - `Card, CardContent` → `src/components/ui/card`
  - `Button` → `src/components/ui/button`
  - `Progress` → `src/components/ui/progress`
  - `ArrowLeft, CheckCircle, Trophy, PlayCircle, Check, Loader2` → `lucide-react`
  - **Skills Academy Components**:
    - `PointExplosion` → `src/components/skills-academy/PointExplosion`
    - `PointCounter` → `src/components/skills-academy/PointCounter`
    - `WorkoutReviewModal` → `src/components/skills-academy/WorkoutReviewModal`
    - `CelebrationAnimation` → `src/components/skills-academy/CelebrationAnimation`
    - `WorkoutErrorBoundary` → `src/components/skills-academy/WorkoutErrorBoundary`
  - **Hooks**:
    - `useAuth` → `src/contexts/SupabaseAuthContext`
    - `usePointTypes` → `src/hooks/usePointTypes`
    - `useWorkoutSession` → `src/hooks/useSkillsAcademyWorkouts`
    - `useGamificationTracking` → `src/hooks/useGamificationTracking`

### **Academy Page (Alternative)**
- **URL**: `http://localhost:3000/academy`
- **File**: `src/app/(authenticated)/academy/page.tsx`

### **Skills Academy Animations**
- **URL**: `http://localhost:3000/skills-academy/animations`
- **File**: `src/app/(authenticated)/skills-academy/animations/page.tsx`

---

## 🏆 **GAMIFICATION PAGES**

### **Gamification Dashboard**
- **URL**: `http://localhost:3000/gamification`
- **File**: `src/app/(authenticated)/gamification/page.tsx`
- **Components Used**:
  - `Card, CardHeader, CardTitle, CardContent` → `src/components/ui/card`
  - `Badge` → `src/components/ui/badge`
  - `Button` → `src/components/ui/button`
  - `Progress` → `src/components/ui/progress`
  - `Tabs, TabsContent, TabsList, TabsTrigger` → `src/components/ui/tabs`
  - **Icons**: `Trophy, Target, Shield, Zap, Star, Award, TrendingUp, Calendar, Clock, ChevronRight, Flame, Medal, Crown, Gem, Loader2` → `lucide-react`
  - **Hooks**:
    - `useGamificationData` → `src/hooks/useGamificationData`
    - `useAuth` → `src/contexts/SupabaseAuthContext`

### **Gamification Demo**
- **URL**: `http://localhost:3000/gamification-demo`
- **File**: `src/app/(authenticated)/gamification-demo/page.tsx`

### **Gamification Showcase**
- **URL**: `http://localhost:3000/gamification-showcase`
- **File**: `src/app/(authenticated)/gamification-showcase/page.tsx`

### **Test Gamification**
- **URL**: `http://localhost:3000/test-gamification`
- **File**: `src/app/(authenticated)/test-gamification/page.tsx`

---

## 📚 **RESOURCES & STRATEGIES**

### **Resources Page**
- **URL**: `http://localhost:3000/resources`
- **File**: `src/app/(authenticated)/resources/page.tsx`
- **Components Used**:
  - `Card, CardHeader, CardTitle, CardContent` → `src/components/ui/card`
  - `Button` → `src/components/ui/button`
  - `Badge` → `src/components/ui/badge`
  - **Resource Components**:
    - `ResourceDetailModal` → `src/components/resources/ResourceDetailModal`
    - `ResourceFilter` → `src/components/resources/ResourceFilter`
    - `ResourceCard` → `src/components/resources/ResourceCard`
  - `Checkbox` → `src/components/ui/checkbox`
  - **Icons**: `BookOpen, Video, FileText, Download, ExternalLink, Search, Filter, Star, Loader2, ClipboardList, Award, Users, Target, Activity, Film, ShoppingBag, Apple, Shield, Heart, DollarSign, GraduationCap, Megaphone, FileCode, Wrench, BarChart, Link` → `lucide-react`
  - **Hooks**:
    - `useViewAsAuth` → `src/hooks/useViewAsAuth`
    - `useResourceFavorites` → `src/hooks/useResourceFavorites`
  - `resourceDataProvider` → `src/lib/resources-data-provider-real`

### **Strategies Page**
- **URL**: `http://localhost:3000/strategies`
- **File**: `src/app/(authenticated)/strategies/page.tsx`
- **Components Used**:
  - `Card, CardHeader, CardTitle, CardContent` → `src/components/ui/card`
  - `Badge` → `src/components/ui/badge`
  - `Button` → `src/components/ui/button`
  - `Tabs, TabsContent, TabsList, TabsTrigger` → `src/components/ui/tabs`
  - `ScrollArea` → `src/components/ui/scroll-area`
  - **Icons**: `Target, Shield, Users, Zap, PlayCircle, ChevronRight, Search, Filter, BookOpen, Loader2` → `lucide-react`
  - **Practice Planner Modals**:
    - `VideoModal` → `src/components/practice-planner/modals/VideoModal`
    - `LacrosseLabModal` → `src/components/practice-planner/modals/LacrosseLabModal`
  - **Hooks**:
    - `useUserStrategies` → `src/hooks/useUserStrategies`
    - `useAuth` → `src/contexts/SupabaseAuthContext`

---

## 🛠️ **ADMIN PAGES**

### **Admin Management**
- **URL**: `http://localhost:3000/admin/management`
- **File**: `src/app/(authenticated)/admin/management/page.tsx`
- **Components Used**:
  - `Card, CardContent, CardDescription, CardHeader, CardTitle` → `src/components/ui/card`
  - `Button` → `src/components/ui/button`
  - `Badge` → `src/components/ui/badge`
  - `Input` → `src/components/ui/input`
  - `Select, SelectContent, SelectItem, SelectTrigger, SelectValue` → `src/components/ui/select`
  - `Table, TableBody, TableCell, TableHead, TableHeader, TableRow` → `src/components/ui/table`
  - `Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle` → `src/components/ui/dialog`
  - **Admin Components**:
    - `ManagementTabs` → `src/components/admin/management/ManagementTabs`
    - `DocumentationHelper, InlineDocumentation` → `src/components/admin/management/DocumentationHelper`
  - **Icons**: `AlertCircle, Shield, Users, UserCheck, Search, BarChart3, Settings` → `lucide-react`
  - **Hooks**:
    - `useAuth` → `src/contexts/SupabaseAuthContext`

### **Admin Role Management**
- **URL**: `http://localhost:3000/admin/role-management`
- **File**: `src/app/(authenticated)/admin/role-management/page.tsx`

### **Admin Drill Editor**
- **URL**: `http://localhost:3000/admin/drill-editor`
- **File**: `src/app/(authenticated)/admin/drill-editor/page.tsx`

### **Admin Sync**
- **URL**: `http://localhost:3000/admin/sync`
- **File**: `src/app/(authenticated)/admin/sync/page.tsx`

### **Admin WP Import Check**
- **URL**: `http://localhost:3000/admin/wp-import-check`
- **File**: `src/app/(authenticated)/admin/wp-import-check/page.tsx`

---

## 🔧 **TESTING & DEBUG PAGES**

### **Debug Auth**
- **URL**: `http://localhost:3000/debug-auth`
- **File**: `src/app/(authenticated)/debug-auth/page.tsx`

### **Debug Auth State**
- **URL**: `http://localhost:3000/debug-auth-state`
- **File**: `src/app/debug-auth-state/page.tsx`

### **Test Supabase**
- **URL**: `http://localhost:3000/test-supabase`
- **File**: `src/app/(authenticated)/test-supabase/page.tsx`

### **Test WordPress**
- **URL**: `http://localhost:3000/test-wordpress`
- **File**: `src/app/(authenticated)/test-wordpress/`

### **Test Auth**
- **URL**: `http://localhost:3000/test/auth`
- **File**: `src/app/test/auth/page.tsx`

### **Test Animations**
- **URL**: `http://localhost:3000/test-animations`
- **File**: `src/app/test-animations/page.tsx`

### **Test Cross Domain**
- **URL**: `http://localhost:3000/test-cross-domain`
- **File**: `src/app/test-cross-domain/page.tsx`

### **Print Test**
- **URL**: `http://localhost:3000/print-test`
- **File**: `src/app/print-test/page.tsx`

---

## 🌐 **COMMUNITY & MISC PAGES**

### **Community Page**
- **URL**: `http://localhost:3000/community`
- **File**: `src/app/(authenticated)/community/page.tsx`

### **Details Page**
- **URL**: `http://localhost:3000/details/[type]/[id]`
- **File**: `src/app/(authenticated)/details/[type]/[id]/page.tsx`

### **Direct Login**
- **URL**: `http://localhost:3000/direct-login`
- **File**: `src/app/direct-login/page.tsx`

### **Offline Page**
- **URL**: `http://localhost:3000/offline`
- **File**: `src/app/offline/page.tsx`

### **Skills Academy Public**
- **URL**: `http://localhost:3000/skills-academy-public`
- **File**: `src/app/skills-academy-public/page.tsx`

---

## 🏗️ **LAYOUT COMPONENTS**

### **Authenticated Layout**
- **File**: `src/app/(authenticated)/layout.tsx`
- **Components Used**:
  - `useRequireAuth` → `src/contexts/SupabaseAuthContext`
  - `SidebarProvider` → `src/contexts/SidebarContext`
  - `BottomNavigation` → `src/components/navigation/BottomNavigation`
  - `SidebarNavigation` → `src/components/navigation/SidebarNavigation`
  - `RoleViewerSelector, RoleViewerKeyboardHandler` → `src/components/admin/RoleViewerSelector`

### **Root Layout**
- **File**: `src/app/layout.tsx`
- **Components Used**:
  - `ClientProviders` → `src/app/ClientProviders`

### **Client Providers**
- **File**: `src/app/ClientProviders.tsx`
- **Components Used**: Various context providers and authentication setup

---

## 📁 **COMPONENT DIRECTORY STRUCTURE**

### **UI Components** (`src/components/ui/`)
- `accordion`, `badge`, `button`, `card`, `checkbox`, `dialog`, `input`, `progress`, `scroll-area`, `select`, `table`, `tabs`

### **Dashboard Components** (`src/components/dashboards/`)
- `AdminDashboard`, `CoachDashboard`, `DirectorDashboard`, `ParentDashboard`, `PlayerDashboard`, `PublicDashboard`
- Supporting components: `ActionCard`, `ProgressCard`, `ScheduleCard`, `StatCard`

### **Practice Planner Components** (`src/components/practice-planner/`)
- Main components: `DrillLibraryTabbed`, `PracticeTimelineWithParallel`, `StrategyCard`
- Modal components: `SavePracticeModal`, `LoadPracticeModal`, `StudyDrillModal`, etc.
- Supporting components: `ActiveStrategiesSection`, `PracticeScheduleCard`, `PrintablePracticePlan`

### **Skills Academy Components** (`src/components/skills-academy/`)
- `SkillsAcademyHubEnhanced`, `PointCounter`, `PointExplosion`, `CelebrationAnimation`
- `WorkoutReviewModal`, `WorkoutErrorBoundary`, `StreakTracker`

### **Team Components** (`src/components/teams/`)
- Dashboard: `TeamHeader`, `CoachQuickActions`, `UpcomingSchedule`, `TeamRoster`
- Views: `ParentView`, `PlayerView`, `ProgressOverview`, `RecentActivity`

### **Admin Components** (`src/components/admin/`)
- `RoleViewerSelector`, `CompleteUserEditor`, `CSVExportPanel`, `MagicLinkPanel`
- Management: `ManagementTabs`, `DocumentationHelper`

### **Navigation Components** (`src/components/navigation/`)
- `BottomNavigation`, `SidebarNavigation`

### **Gamification Components** (`src/components/gamification/`)
- `BadgeBrowser`, `RankDisplay`, `DifficultyIndicator`, `StreakCounter`

---

## 🎯 **KEY FINDINGS**

1. **Practice Planner** is the most complex page with 20+ components
2. **Skills Academy Workout** page has comprehensive gamification integration
3. **Dashboard** uses role-based component rendering
4. **Admin Management** has extensive user management capabilities
5. **Team Dashboard** provides different views for coaches, parents, and players
6. **All authenticated pages** use the shared layout with navigation components

---

## 📝 **USAGE NOTES**

- All authenticated pages are wrapped in `src/app/(authenticated)/layout.tsx`
- Components follow a consistent pattern: UI components from `src/components/ui/`, feature components from respective feature directories
- Icons are primarily from `lucide-react`
- State management uses custom hooks in `src/hooks/`
- Authentication context is provided by `src/contexts/SupabaseAuthContext`

This index provides the complete map of every page and component in the POWLAX React application. Use it to quickly locate components when working on specific features or pages.
