# Track A: Data Integration - Terminal Setup

## Quick Start Commands for New Terminal

Run these commands in your new terminal to start Track A:

```bash
# 1. First, activate the appropriate agents for data work
/BMad:agents:analyst

# Or if you prefer to start with the orchestrator:
/BMad:agents:bmad-orchestrator
```

## Track A Context

### Primary Goal
Connect Supabase staging tables to the practice planner and map drill→strategy relationships.

### Key Tasks
1. 📊 + 💻 Connect Supabase staging tables to practice planner
2. 📊 Map drill→strategy relationships in Supabase

### Important Files
- `supabase/migrations/001_staging_tables.sql` - Staging table definitions
- `src/hooks/useSupabaseDrills.ts` - Current drill data hook
- `src/lib/supabase.ts` - Supabase client configuration

### What You'll Need Ready
- Supabase project URL
- Supabase anon key
- Access to Supabase dashboard
- CSV files location: `docs/Wordpress CSV's/`

### Suggested First Message
"I'm ready to work on Track A - Data Integration. I have my Supabase credentials ready. Let's start by connecting the staging tables to the practice planner."

---

## Track B is Running in Parallel
Track B (UI/UX Fixes) is being handled in the other terminal, focusing on:
- Modal functionality fixes
- Drill filtering by strategies implementation