# 🏑 POWLAX Mobile App - Complete Page Structure Schematic

## 🏗️ Overall Architecture

```
┌─────────────────────────────────────────┐
│              MAIN APP SHELL             │
├─────────────────────────────────────────┤
│  [Dashboard] [Teams] [Academy] [Resources] [Community]  │
│                Bottom Navigation                        │
└─────────────────────────────────────────┘
```

## 🔑 Authentication & Onboarding Flow

```
Auth Flow:
├── Login/Register Page
├── Role Selection (Director/Coach/Player/Parent)
├── Onboarding Wizard (Role-specific)
│   ├── Club Director: Club Setup
│   ├── Coach: Team Setup
│   ├── Player: Profile + Skill Check
│   └── Parent: Child Linking
└── Main App Entry
```

---

## 📱 Page Structure by Tab

### 🏠 **DASHBOARD TAB**

#### **Club Director Dashboard**
- **Club Overview Page**
  - Club metrics cards
  - Team summary grid
  - Recent activity feed
  - Quick action buttons

#### **Coach Dashboard**  
- **Team HQ Home Page**
  - Upcoming events
  - Recent activity
  - Team stats widget
  - Quick links carousel
- **Multi-Team Selection** (if applicable)

#### **Player Dashboard**
- **Personal Home Page**
  - Progress snapshot
  - "Continue Training" CTA
  - Achievements preview
  - Team updates section

#### **Parent Dashboard**
- **Child Overview Page**
  - Child selector (if multiple)
  - Progress summary
  - Recent achievements
  - Upcoming events

---

### 👥 **TEAMS TAB**

#### **Club Director**
- **Teams List Page**
  - Scrollable team cards
  - Filter/search functionality
- **Team Detail Pages** (for each team)
  - Team HQ View (read-only)
  - Roster oversight
  - Activity monitoring

#### **Coach**
- **Team HQ Main Page**
  - Team dashboard
  - Navigation to sub-pages
- **Roster Management Page**
  - Player list
  - Player detail modals/pages
- **Player Profile Pages**
  - Individual player stats
  - Progress tracking
  - Coach notes section
  - Assessment forms
- **Practice Plans Page**
  - Practice builder interface
  - Saved plans list
  - Template library
- **Playbook Page**
  - Play categories
  - Play detail views
  - Diagram viewer
- **Team Communications**
  - Announcement feed
  - Message composer
  - Parent communication

#### **Player**
- **Team Home Page**
  - Coach announcements
  - Upcoming events
  - Team playbook access
- **Team Roster Page**
  - Teammate list
  - Basic profiles
- **Team Playbook Viewer**
  - Read-only play diagrams
  - Video content
- **Team Chat/Forum** (age-appropriate)

#### **Parent**
- **Team Info Page**
  - Announcements feed
  - Schedule view
  - Roster with contact info
- **Schedule/Calendar Page**
  - Upcoming practices/games
  - Event details
- **Team Documents Page**
  - Shared files
  - Important notices

---

### 🎓 **ACADEMY TAB**

#### **Club Director**
- **Club Academy Analytics**
  - Aggregate progress charts
  - Team comparisons
  - Player development trends

#### **Coach**
- **Team Academy Dashboard**
  - Team leaderboard
  - Drill completion matrix
  - Badge achievements
- **Academy Content Browser**
  - Drill library (read-only)
  - Progress analytics

#### **Player**
- **Skills Academy Home**
  - Tabbed interface:
    - **Workouts Tab**
      - Recommended drills
      - Program progression
      - Challenge mode
    - **My Progress Tab**
      - Completion stats
      - Skill breakdowns
      - Badge collection
    - **Leaderboard Tab**
      - Team rankings
      - Achievement comparisons
- **Drill Detail Pages**
  - Video player
  - Instructions
  - Completion tracking
- **Lax Skill Check Page**
  - Assessment quiz
  - Results and recommendations

#### **Parent**
- **Child Progress Dashboard**
  - Progress analytics
  - Recent activities
  - Comparison metrics
- **Drill Content Viewer** (optional)
  - View-only drill library
  - Understanding child's training

---

### 📚 **RESOURCES TAB**

#### **Club Director**
- **Administrative Resources**
  - Coaching materials
  - Club management tools
  - Content sharing interface

#### **Coach**
- **Coaching Kits Library**
  - Master Class videos
  - Drill bank
  - Season playbooks
  - Assessment tools
- **Content Categories:**
  - Video & Playbook Library
  - Practice Plan Templates
  - Printable Resources

#### **Player**
- **Drill Bank Browser**
  - Free exploration mode
  - Category filters
- **Extra Challenges**
  - Special skill challenges
  - Bonus content
- **Knowledge Base** (optional)
  - Rules guide
  - Equipment tips

#### **Parent**
- **Parent Education Hub**
  - Support My Player Quiz
  - Lacrosse 101 Guide
  - Equipment Guide
  - Camps & Clinics Info
- **Quiz Results Page**
  - Personalized tips
  - Resource recommendations

---

### 💬 **COMMUNITY TAB**

#### **All Roles**
- **Forum List Page**
  - Available groups/forums
  - Role-based filtering
- **Forum Detail Pages**
  - Discussion threads
  - Post creation
- **Direct Messages**
  - Conversation list
  - Chat interface
- **Club Groups** (internal)
  - Team-specific discussions
  - Club-wide announcements

#### **Privacy Considerations**
- **Child Account Limitations**
  - Restricted forum access
  - Read-only or limited posting
  - Safety notifications

---

## 🔧 **SUPPORTING PAGES & MODALS**

### **Profile & Settings**
- **User Profile Page**
  - Personal information
  - Avatar/photo
  - Role-specific data
- **Settings Page**
  - Notifications
  - Privacy controls
  - Account management
- **Child Management** (Parents)
  - Add child modal
  - Link existing accounts

### **Content Creation & Management**
- **Announcement Composer**
- **Practice Plan Builder**
  - Drag-and-drop interface
  - Drill selection
  - Timeline view
- **Assessment Forms**
  - Player evaluation
  - Skill check interface

### **Media & Content Viewers**
- **Video Player Page**
  - Full-screen playback
  - Controls and metadata
- **Document Viewer**
  - PDF/image display
  - Download options
- **Diagram Viewer**
  - Interactive play diagrams
  - Zoom and annotations

### **Analytics & Reports**
- **Progress Detail Pages**
  - Detailed statistics
  - Historical data
  - Export options
- **Team Analytics Dashboard**
  - Performance metrics
  - Engagement reports

---

## 🔄 **NAVIGATION PATTERNS**

### **Tab-Based Navigation**
```
Bottom Navigation (Persistent):
[Dashboard] [Teams] [Academy] [Resources] [Community]
     ↓        ↓        ↓         ↓          ↓
  Role-based Role-based Role-based Role-based Role-based
   Content    Content    Content    Content    Content
```

### **Hierarchical Navigation**
```
Tab → Main Page → Sub Page → Detail Page → Modal/Action
 ↓         ↓          ↓           ↓            ↓
Teams → Team HQ → Roster → Player Profile → Assessment
```

### **Cross-Tab Linking**
```
Dashboard Alert → Deep Link → Relevant Tab/Page
Academy Drill → Team Playbook → Teams Tab
Progress Issue → Coaching Resources → Resources Tab
```

---

## 📊 **RESPONSIVE DESIGN CONSIDERATIONS**

### **Mobile-First Components**
- **Card-Based Layouts**
- **Collapsible Sections**
- **Touch-Optimized Controls**
- **Swipe Gestures**
- **Modal Overlays**

### **Content Adaptation**
- **Progressive Disclosure**
- **Contextual Menus**
- **Floating Action Buttons**
- **Bottom Sheets**
- **Pull-to-Refresh**

---

## 🔐 **ACCESS CONTROL MATRIX**

| Page/Feature | Director | Coach | Player | Parent |
|-------------|----------|-------|--------|--------|
| Club Analytics | ✅ Full | ❌ No | ❌ No | ❌ No |
| Team Management | ✅ Read | ✅ Full | ❌ No | ❌ No |
| Player Profiles | ✅ Read | ✅ Full | ✅ Own | ✅ Child |
| Practice Planning | ✅ Read | ✅ Full | ✅ Read | ❌ No |
| Coaching Resources | ✅ Full | ✅ Full | ❌ No | ❌ No |
| Academy Content | ✅ Analytics | ✅ Team View | ✅ Full | ✅ Child View |
| Community Forums | ✅ Full | ✅ Full | ✅ Limited | ✅ Limited |
| Assessment Tools | ✅ View | ✅ Full | ✅ Receive | ✅ View Child |

---

## 🚀 **IMPLEMENTATION PRIORITY**

### **Phase 1: Core Framework**
1. Authentication & Role Management
2. Bottom Navigation Shell
3. Basic Dashboard Pages
4. User Profile System

### **Phase 2: Core Features**
1. Teams Tab (Coach & Player views)
2. Academy Tab (Player experience)
3. Basic Resources
4. Communication System

### **Phase 3: Advanced Features**
1. Director Analytics
2. Parent Portal
3. Advanced Coaching Tools
4. Community Features

### **Phase 4: Polish & Optimization**
1. Advanced Gamification
2. Offline Capabilities
3. Push Notifications
4. Performance Optimization

---

## 📱 **TOTAL PAGE COUNT ESTIMATE**

- **Authentication/Onboarding**: 8 pages
- **Dashboard Variants**: 4 pages
- **Teams Section**: 25+ pages
- **Academy Section**: 15+ pages  
- **Resources Section**: 12+ pages
- **Community Section**: 8+ pages
- **Supporting Pages**: 20+ pages
- **Modals & Overlays**: 15+ components

**Total Estimated Pages: 100+ unique page layouts**
**Total Components: 200+ reusable components**

This schematic provides the complete page structure needed to implement the POWLAX mobile app according to the UI blueprint specifications.