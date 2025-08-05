# POWLAX Role Hierarchy & Permissions

## 🎯 Role Definitions

### 1. **Administrator** (System Admin - You)
- **Access Level**: FULL SYSTEM ACCESS
- **Scope**: Entire platform, all organizations, all teams
- **Key Permissions**:
  - Manage all Club OS instances
  - Create/modify/delete any organization
  - Access all data across the platform
  - Modify system settings
  - View all analytics and metrics
  - Manage billing and subscriptions
  - Deploy updates and features
  - Access production database
  - Modify user roles system-wide

### 2. **Director** (Club/Organization Director)
- **Access Level**: FULL ACCESS within their Club OS only
- **Scope**: Their specific organization/club
- **Key Permissions**:
  - Full management of their Club OS
  - Create/manage multiple teams within their club
  - Assign coaches to teams
  - View analytics for their entire club
  - Manage club-wide settings
  - Create club-wide announcements
  - Access financial reports for their club only
  - Cannot access other clubs' data
  - Cannot modify system-wide settings

### 3. **Coach**
- **Access Level**: READ-ONLY Club OS + FULL Team HQ Management
- **Scope**: Their assigned team(s) within a Club OS
- **Key Permissions**:
  - **Club OS**: Read-only access to club resources
  - **Team HQ**: Full management capabilities
    - Create/edit practice plans
    - Manage team roster
    - Post team announcements
    - Track player progress
    - Submit practices for team visibility
  - View club-wide announcements
  - Access shared drill library
  - Cannot modify club-level settings
  - Cannot access other teams' private data

### 4. **Player**
- **Access Level**: READ-ONLY access
- **Scope**: Their team within Team HQ + Club OS public data
- **Key Permissions**:
  - **Team HQ**: Read-only access to their team's content
    - View practice plans
    - See team announcements
    - Check team schedule
  - **Club OS**: Read-only access to:
    - Leaderboards
    - General club information
    - Public announcements
  - **Skills Academy**: Full access to their personal training
  - Cannot create or modify any team/club content
  - Cannot access other teams' data

### 5. **Parent**
- **Access Level**: READ-ONLY for children's data
- **Scope**: Their children's teams and progress
- **Key Permissions**:
  - View all children's progress
  - See children's team schedules
  - Access parent resources
  - Read team announcements
  - Cannot modify any data
  - Cannot access other children's data

---

## 🔒 Data Boundaries

### Club OS Hierarchy
```
Administrator
    └── Club OS 1 (Director A)
         ├── Team HQ 1 (Coach 1)
         │   ├── Player 1
         │   ├── Player 2
         │   └── Parent 1 (viewing Player 1)
         └── Team HQ 2 (Coach 2)
             ├── Player 3
             └── Player 4
    └── Club OS 2 (Director B)
         └── Team HQ 3 (Coach 3)
             └── Players...
```

### Access Matrix

| Feature | Admin | Director | Coach | Player | Parent |
|---------|-------|----------|-------|--------|--------|
| **System Settings** | ✅ Full | ❌ | ❌ | ❌ | ❌ |
| **All Club OS** | ✅ Full | ❌ | ❌ | ❌ | ❌ |
| **Own Club OS** | ✅ Full | ✅ Full | 👁️ Read | 👁️ Read | ❌ |
| **Other Teams in Club** | ✅ Full | ✅ Full | 👁️ Read | ❌ | ❌ |
| **Own Team HQ** | ✅ Full | ✅ Full | ✅ Full | 👁️ Read | 👁️ Read |
| **Practice Planning** | ✅ Full | ✅ Full | ✅ Full | ❌ | ❌ |
| **Player Progress** | ✅ Full | ✅ Full | ✅ Full | 👁️ Own | 👁️ Children |
| **Skills Academy** | ✅ Full | 👁️ Analytics | 👁️ Analytics | ✅ Own | 👁️ Children |
| **Leaderboards** | ✅ Full | ✅ Full | 👁️ Read | 👁️ Read | 👁️ Read |
| **Billing/Subscriptions** | ✅ Full | 👁️ Own Club | ❌ | ❌ | 👁️ Own |

---

## 🛡️ Implementation Notes

### WordPress Role Mapping
```php
// WordPress roles should map as follows:
'administrator' => 'admin'      // Full system access
'club_director' => 'director'   // Club OS manager
'team_coach'    => 'coach'      // Team HQ manager
'player'        => 'player'     // Read-only access
'parent'        => 'parent'     // Children viewer
```

### Row Level Security (RLS) Considerations
1. **Club OS Isolation**: Directors can only access their `organization_id`
2. **Team Isolation**: Coaches can only manage teams where they are assigned
3. **Player Privacy**: Players can only see their own data + team public data
4. **Parent Boundaries**: Parents can only access their linked children

### Future Considerations
- Assistant coaches with limited write permissions
- Guest coaches with temporary access
- Trial accounts with feature limitations
- Multi-role users (e.g., Coach who is also a Parent)

---

## 🚨 Security Reminders
1. Always verify `organization_id` for Directors
2. Check `team_id` assignment for Coaches
3. Validate parent-child relationships
4. Log all role changes with full audit trail
5. Never allow cross-organization data access (except Admin)