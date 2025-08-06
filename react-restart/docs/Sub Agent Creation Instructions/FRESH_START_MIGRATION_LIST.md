# POWLAX Fresh Start Migration List

*Created: 2025-01-16*  
*Purpose: Complete list of files needed to restart POWLAX development in a new app folder*

---

## 🎯 **ESSENTIAL FILES FOR FRESH START**

### **1. POWLAX Sub Agent System (CRITICAL)**
```
MUST COPY:
~/.claude/agents/powlax-controller/powlax-master-controller.md
~/.claude/agents/powlax-design/powlax-ux-researcher.md  
~/.claude/agents/powlax-engineering/powlax-frontend-developer.md
~/.claude/agents/powlax-engineering/powlax-backend-architect.md
~/.claude/agents/powlax-product/powlax-sprint-prioritizer.md

DESTINATION: Copy to ~/.claude/agents/ in new environment
```

### **2. Core Project Configuration**
```
MUST COPY:
├── package.json                     # Dependencies and scripts
├── package-lock.json               # Lock file for exact versions
├── tailwind.config.ts              # POWLAX brand colors + styling
├── next.config.mjs                 # Next.js configuration
├── tsconfig.json                   # TypeScript configuration  
├── components.json                 # Shadcn/UI configuration
├── playwright.config.ts            # E2E testing configuration
├── .env.local.example              # Environment variables template
└── .gitignore                      # Git ignore patterns
```

### **3. Complete System Documentation**
```
MUST COPY:
docs/development/
├── COMPLETE_SYSTEM_ARCHITECTURE.md      # Complete system knowledge
├── AGENT_COMMUNICATION_PROTOCOL.md      # Agent coordination standards
├── POWLAX-AGENT-WORKFLOW-ANALYSIS.md    # Agent capabilities analysis
├── INTEGRATED_WORKFLOW_PLAN.md          # Development workflow
├── CLAUDE_CODE_SUB_AGENT_STRATEGY.md    # Sub agent implementation
└── LOGGING_AND_TRACKING_SYSTEM.md       # Progress tracking system

docs/Sub Agent Creation Instructions/
├── POWLAX_CLAUDE_CODE_SETUP_GUIDE.md    # Setup instructions
├── AGENT_CLEANUP_PLAN.md                # System cleanup plan
├── FRESH_START_MIGRATION_LIST.md        # This file
├── AGENT_MASTER_CONTEXT.md              # Complete POWLAX context
└── brief.md                             # Project brief (1299 lines)
```

### **4. POWLAX Project Context**
```
MUST COPY:
docs/requirements/
└── POWLAX_MASTER_REQUIREMENTS.md        # Complete requirements

docs/technical/
├── powlax-data-architecture-explained.md
├── coach-daily-journey-map.md
├── admin-role-toggle-requirements.md
└── [other technical specifications]

docs/existing/
├── Gamification/
│   ├── POWLAX-Gamification-Implementation-Plan.md
│   └── powlax-gamification-chatgpt-output.pdf
└── POWLAX Brand Master File v1.2.pdf
```

### **5. Database Schema & Migrations**
```
MUST COPY:
supabase/
├── migrations/                    # All database migrations  
├── seed.sql                      # Seed data if exists
└── config.toml                   # Supabase configuration

docs/database/
├── CORRECT_RLS_POLICIES.sql      # Row level security policies
├── CHECK_TABLE_STRUCTURE.sql     # Schema validation
├── schema-diagram.json           # Database relationships
└── [database documentation files]
```

### **6. Data Import Systems**
```
MUST COPY:
scripts/
├── imports/                      # CSV import scripts
├── transforms/                   # Data transformation utilities
└── database/                     # Database management scripts

docs/Wordpress CSV's/
├── Strategies and Concepts to LL/    # Strategy data
├── 2015 POWLAX Plan CSV's Skills Drills/  # Historical drill data
├── Gamipress Gamification Exports/   # Gamification data
└── Custom-Code-Export-2025-July-31-1850.csv
```

### **7. Source Code (Core Application)**
```
MUST COPY:
src/
├── app/                          # Next.js App Router pages
├── components/                   # All React components
├── hooks/                        # Custom React hooks
├── lib/                          # Utility libraries and configurations
├── types/                        # TypeScript type definitions
├── contexts/                     # React contexts
└── middleware/                   # Next.js middleware

Key Components:
src/components/
├── ui/                          # Shadcn/UI components (17 components)  
├── practice-planner/            # Practice planning system
├── navigation/                  # Responsive navigation
├── animations/                  # Gamification animations
└── [other component directories]
```

### **8. Testing Infrastructure**
```
MUST COPY:
tests/e2e/                       # Playwright E2E tests
├── practice-planner.spec.ts
├── navigation.spec.ts
├── authentication.spec.ts
└── [other test files]

playwright-report/               # Test reports (if needed)
test-results/                    # Test artifacts (if needed)
```

---

## 📋 **MIGRATION EXECUTION PLAN**

### **Phase 1: Environment Setup**
```bash
# 1. Create new Next.js app
npx create-next-app@latest powlax-fresh --typescript --tailwind --eslint --app

# 2. Copy POWLAX sub agents to Claude
cp -r ~/.claude/agents/powlax* [new-location]/.claude/agents/

# 3. Copy core configuration files
cp package.json tailwind.config.ts next.config.mjs components.json [new-location]/

# 4. Install dependencies
cd [new-location] && npm install
```

### **Phase 2: Core System Files**
```bash
# 5. Copy complete documentation
cp -r docs/development [new-location]/docs/
cp -r docs/Sub\ Agent\ Creation\ Instructions [new-location]/docs/
cp -r docs/requirements [new-location]/docs/

# 6. Copy POWLAX context and project files
cp -r docs/technical [new-location]/docs/
cp -r docs/existing [new-location]/docs/
```

### **Phase 3: Database & Scripts**
```bash
# 7. Copy database infrastructure
cp -r supabase [new-location]/
cp -r scripts [new-location]/
cp -r docs/database [new-location]/docs/

# 8. Copy data files
cp -r docs/Wordpress\ CSV\'s [new-location]/docs/
```

### **Phase 4: Application Code**
```bash
# 9. Copy source code
cp -r src [new-location]/
cp -r tests [new-location]/

# 10. Copy essential root files
cp CLAUDE.md .env.local.example README.md [new-location]/
```

### **Phase 5: Verification**
```bash
# 11. Test the fresh installation
cd [new-location]
npm run lint
npm run build
npm run dev

# 12. Verify POWLAX sub agents work
# Use Master Controller: "Please verify your POWLAX context and show available sub agents"
```

---

## 🚫 **SAFE TO EXCLUDE (DON'T COPY)**

### **Old Agent Systems:**
```
❌ .bmad-core/agents/            # Old BMad agents
❌ docs/agent-instructions/A4CC* # Old A4CC agents
❌ docs/agent-instructions/C4A*  # Old C4A agents
❌ tasks/active/                 # Old task management
❌ tasks/coordination/           # Old coordination logs
```

### **Generated/Runtime Files:**
```
❌ node_modules/                # Regenerated by npm install
❌ .next/                      # Generated by Next.js build
❌ dist/                       # Generated build files
❌ .env.local                  # Environment-specific (create new)
❌ logs/                       # Runtime logs
❌ playwright-report/          # Generated test reports
❌ test-results/              # Generated test artifacts
```

### **Development Artifacts:**
```
❌ screenshots/               # Development screenshots
❌ docs/brainstorming/       # Brainstorming session files
❌ docs/data/analysis/       # Analysis artifacts
❌ temp-*                    # Temporary files
```

---

## ✅ **POST-MIGRATION VERIFICATION**

### **Essential Checks:**
1. **Sub Agent System**: Master Controller loads complete POWLAX context
2. **Build System**: `npm run dev` starts without errors
3. **Component Library**: Shadcn/UI components render correctly
4. **Database**: Connection to Supabase works (if configured)
5. **Mobile Responsive**: All pages work on mobile breakpoints
6. **Documentation**: All context files accessible and current

### **Test Commands:**
```bash
# Development server
npm run dev

# Quality gates
npm run lint
npm run build

# E2E testing (if database configured)
npx playwright test

# POWLAX sub agent verification
# Use Master Controller with: "Please verify your complete POWLAX context"
```

---

## 📊 **MIGRATION SIZE ESTIMATE**

**Total Files**: ~500-700 files
**Total Size**: ~50-75 MB (excluding node_modules)
**Critical Files**: ~50 files for basic functionality
**Time Estimate**: 30-60 minutes for complete migration

**Most Critical (5 minutes):**
- POWLAX sub agents (5 files)
- Core config files (package.json, tailwind.config.ts, etc.)
- System architecture documentation

---

## 🎯 **SUCCESS CRITERIA**

### **Fresh Start Complete When:**
✅ POWLAX Master Controller agent responds with complete context  
✅ Development server runs without errors
✅ All Shadcn/UI components render correctly
✅ Mobile responsive design works across breakpoints
✅ Build process completes successfully
✅ Essential documentation accessible
✅ Database migrations can be applied (when configured)

**Result**: Complete POWLAX development environment ready for immediate use with full sub agent system coordination.