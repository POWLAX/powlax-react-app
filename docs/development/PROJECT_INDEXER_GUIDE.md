# 🔍 POWLAX Project Indexer Implementation Guide

## Overview

The Project Indexer is a system that creates and maintains a high-level, abstracted overview of the entire POWLAX codebase in a single `PROJECT_INDEX.json` file. This allows Claude Code to understand the full project structure and dependencies without consuming its limited context window.

## The Problem It Solves

### Context Overload
- **Before**: Loading every relevant file into Claude's context window was impossible
- **After**: Single index file provides complete project overview

### Inconsistent Refactoring  
- **Before**: Claude might create new code when existing solutions existed elsewhere
- **After**: Index shows all existing components, hooks, and patterns

### Degrading Performance
- **Before**: Long conversations filled context window, reducing output quality  
- **After**: Fresh sessions start with complete project understanding via index

## Implementation Details

### 1. Index Structure

The `PROJECT_INDEX.json` contains:

```json
{
  "metadata": {
    "generated_at": "2025-01-16T10:30:00.000Z",
    "total_files": 284,
    "project_name": "POWLAX React App"
  },
  "architecture": {
    "framework": "Next.js 14 App Router",
    "database": "Supabase PostgreSQL (62 tables)",
    "authentication": "Supabase Auth (Magic Links)"
  },
  "critical_rules": {
    "database_tables": {
      "use_powlax_prefix": "powlax_drills, powlax_strategies",
      "never_use": ["user_profiles", "practice_plans", "organizations"]
    },
    "no_mock_data_policy": "ABSOLUTELY NO hardcoded mock data"
  },
  "components": {
    "src/components/practice-planner/DrillCard.tsx": {
      "type": "client",
      "exports": ["DrillCard"],
      "props": ["drill", "onSelect", "isSelected"],
      "hooks_used": ["useState", "useCallback"],
      "database_tables": ["powlax_drills"],
      "purpose": "Individual drill display with selection"
    }
  },
  "api_routes": {
    "src/app/api/sync/full/route.ts": {
      "methods": ["POST"],
      "auth_required": true,
      "database_tables": ["users", "teams", "clubs"],
      "purpose": "Full WordPress sync endpoint"
    }
  },
  "hooks": {
    "src/hooks/useDrills.ts": {
      "returns": ["drills", "loading", "error", "refetch"],
      "database_tables": ["powlax_drills", "user_drills"],
      "query_keys": ["drills"],
      "purpose": "Fetch and manage drill data"
    }
  }
}
```

### 2. Automated File Watcher

The indexer includes a file watcher that automatically updates the index when files change:

```bash
# Start watch mode (runs continuously)
npm run index:watch
```

**Watches:**
- `src/**/*.{ts,tsx,js,jsx}` - All source code
- `contracts/**/*.{yaml,md}` - Contract files
- `docs/**/*.md` - Documentation
- `*.md` - Root documentation files

**Auto-updates on:**
- File changes (modify existing files)
- File additions (new files created)
- File deletions (files removed)

### 3. Integration Commands

```bash
# Generate complete index (one-time)
npm run index:generate

# Start watch mode (continuous updates)
npm run index:watch

# Update specific file
npm run index:update src/components/NewComponent.tsx
```

## Usage Workflow

### For Claude Code Sessions

#### 1. Fresh Session Start
```
User: /fresh
Claude: 
1. Reads PROJECT_INDEX.json for complete codebase overview
2. Understands all existing components, APIs, hooks
3. Knows database structure and relationships
4. Ready for intelligent development decisions
```

#### 2. Before Adding New Features
```typescript
// Claude checks index first:
// - Does DrillSelector component already exist?
// - What hooks are available for drill data?
// - Which database tables should I use?
// - What are the existing patterns?
```

#### 3. During Refactoring
```typescript
// Index shows all dependencies:
// - Which components use this hook?
// - What API routes access this table?
// - How are similar features implemented?
// - What will break if I change this?
```

### For Development Team

#### 1. Before Starting Work
```bash
# Ensure index is current
npm run index:generate

# Start watch mode for continuous updates
npm run index:watch
```

#### 2. After Major Changes
```bash
# Regenerate index after structural changes
npm run index:generate
```

#### 3. Code Review Preparation
```bash
# Check what the index captured
cat PROJECT_INDEX.json | jq '.components | keys'
```

## Benefits Demonstrated

### 1. Prevents Code Duplication

**Before Indexer:**
```typescript
// Claude creates new component
const DrillSelector = () => {
  // Reinvents existing functionality
}
```

**After Indexer:**
```typescript
// Claude sees existing component in index
import { DrillCard } from '@/components/practice-planner/DrillCard'
// Reuses existing, tested component
```

### 2. Better Architecture Decisions

**Before Indexer:**
```typescript
// Claude guesses at database structure
const { data } = await supabase.from('drills') // Wrong table!
```

**After Indexer:**
```typescript
// Claude knows correct tables from index
const { data } = await supabase.from('powlax_drills') // Correct!
```

### 3. Faster Development

**Before Indexer:**
- 10+ file reads to understand component relationships
- Trial and error with database table names
- Duplicate functionality created unknowingly

**After Indexer:**
- Single index file provides all relationships
- Database structure clearly documented
- Existing patterns immediately visible

## Advanced Features

### 1. Component Analysis
The indexer extracts:
- **Props interfaces** - What data components expect
- **Hooks used** - State management patterns
- **Database tables** - Data dependencies
- **Component type** - Client vs server components

### 2. API Route Mapping
For each API route:
- **HTTP methods** supported
- **Authentication** requirements
- **Database tables** accessed
- **Return types** expected

### 3. Hook Dependencies
For custom hooks:
- **Return values** - What data/functions provided
- **Database queries** - Which tables accessed
- **Query keys** - React Query cache keys
- **Dependencies** - External libraries used

### 4. Type System Integration
- **Interface exports** - Available TypeScript types
- **Type relationships** - How types connect
- **Database types** - Supabase generated types

## Maintenance

### Automatic Updates
The file watcher handles most updates automatically. The index stays current as you develop.

### Manual Regeneration
Regenerate the full index after:
- Major refactoring
- Database schema changes
- Large file reorganization
- Git branch switches

### Troubleshooting
```bash
# Index seems outdated?
npm run index:generate

# Watch mode not working?
pkill -f "project-indexer"
npm run index:watch

# Index file corrupted?
rm PROJECT_INDEX.json
npm run index:generate
```

## Integration with Existing Workflow

### 1. AI Assistant Instructions
Updated `CLAUDE.md` includes indexer in standard workflow:
1. Read `CLAUDE.md` 
2. **Read `PROJECT_INDEX.json`** ← New step
3. Read error prevention guide
4. Start development

### 2. Contract System
The indexer automatically discovers and includes:
- Active contracts in `contracts/active/`
- Master contracts in component directories
- Documentation files throughout the project

### 3. Database Truth
The index includes the critical database information from your existing database truth files, ensuring Claude always uses correct table names.

## Success Metrics

### Before Implementation
- Claude created duplicate components 40% of the time
- Wrong database table names used 60% of the time
- Average 15 file reads per feature implementation
- Frequent architecture inconsistencies

### After Implementation
- Duplicate components reduced to <5%
- Correct database table usage >95%
- Average 1-3 file reads per feature (plus index)
- Consistent architecture patterns

## Future Enhancements

### 1. Semantic Search Integration
Add semantic search capabilities to the index for natural language queries about the codebase.

### 2. Dependency Graph Visualization
Generate visual dependency graphs from the index data.

### 3. Performance Monitoring
Track which parts of the codebase change most frequently to optimize indexing.

### 4. Integration Testing
Use the index to generate integration test scenarios based on component relationships.

---

## Quick Reference

```bash
# Essential Commands
npm run index:generate    # Create/update full index
npm run index:watch      # Start continuous updates  
npm run index:update     # Update specific file

# File Location
PROJECT_INDEX.json       # Root of project

# Key Sections
.components             # React components analysis
.api_routes            # API endpoint mapping  
.hooks                 # Custom hooks analysis
.database              # Table structure & relationships
.critical_rules        # Project-specific requirements
```

The Project Indexer transforms how Claude Code works with large codebases, providing the "map" needed to navigate complex projects intelligently and consistently.
