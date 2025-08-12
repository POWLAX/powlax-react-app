# Permanence Pattern Implementation - Role Management Page

**Created:** January 2025  
**Reference:** @.claude/SUPABASE_PERMANENCE_PATTERN.md  
**Purpose:** Identify where the Supabase Permanence Pattern needs to be implemented in the Role Management page

---

## 🎯 Features Requiring Permanence Pattern

### 1. User Roles Array Management
**Location:** `page.tsx` - Lines 460-485 (Role selection checkboxes)  
**Current State:** Already using array pattern but UI needs refinement  
**Database Status:** `users.roles` column already exists as TEXT[]

#### Current Implementation Analysis:
```typescript
// EXISTING - Already follows the pattern partially
// Lines 462-478: Checkbox UI that modifies array
checked={roleChangeModal.newRoles.includes(role)}
onChange={(e) => {
  if (e.target.checked) {
    setRoleChangeModal(prev => ({
      ...prev,
      newRoles: [...prev.newRoles, role]  // ✅ Correct array handling
    }))
  } else {
    setRoleChangeModal(prev => ({
      ...prev,
      newRoles: prev.newRoles.filter(r => r !== role)  // ✅ Correct removal
    }))
  }
}}
```

**Pattern Already Applied:** ✅ The role management already follows the permanence pattern correctly!

**Potential Enhancement:** Add role history tracking
```typescript
// Enhanced tracking with history
const updateRolesWithHistory = async (userId: string, newRoles: string[]) => {
  // Get current roles for history
  const { data: currentUser } = await supabase
    .from('users')
    .select('roles')
    .eq('id', userId)
    .single()
  
  // Update roles
  await supabase
    .from('users')
    .update({ 
      roles: newRoles,
      previous_roles: currentUser?.roles || [],  // Store previous
      role_updated_at: new Date().toISOString()
    })
    .eq('id', userId)
  
  // Log the change
  await supabase
    .from('role_change_log')
    .insert({
      user_id: userId,
      changed_by: currentUserId,
      old_roles: currentUser?.roles || [],
      new_roles: newRoles,
      reason: roleChangeModal.reason
    })
}
```

---

### 2. Permission Sets (Future Enhancement)
**Location:** Not yet implemented  
**Current State:** Only role-based permissions  
**Database Need:** `permission_sets` table for granular control

#### Implementation Requirements:
```typescript
// UI State
const [canViewReports, setCanViewReports] = useState(false)
const [canEditDrills, setCanEditDrills] = useState(false)
const [canManageTeams, setCanManageTeams] = useState(false)

// Data State (arrays of permission strings)
const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
const [customPermissionSets, setCustomPermissionSets] = useState<string[]>([])

// Transformation
const savePermissionSet = {
  name: setName,
  permissions: selectedPermissions,
  applicable_roles: applicableRoles,
  restricted_features: restrictedFeatures || [],
  resource_access: allowedResourceTypes || []
}
```

**Database Schema Needed:**
```sql
CREATE TABLE permission_sets (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  permissions TEXT[] NOT NULL,           -- ['view_reports', 'edit_drills', etc.]
  applicable_roles TEXT[] DEFAULT '{}',  -- Which roles can use this set
  restricted_features TEXT[] DEFAULT '{}', -- Features explicitly blocked
  resource_access TEXT[] DEFAULT '{}',   -- Resource types allowed
  created_by TEXT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
)

-- User permission assignments
CREATE TABLE user_permission_overrides (
  id UUID PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  permission_sets TEXT[] DEFAULT '{}',   -- Array of permission set IDs
  additional_permissions TEXT[] DEFAULT '{}', -- Extra permissions
  restricted_permissions TEXT[] DEFAULT '{}', -- Removed permissions
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
)
```

---

### 3. Team Access Controls
**Location:** Not yet implemented but needed  
**Current State:** No team-specific access control  
**Database Need:** Enhanced user table or separate access table

#### Implementation Requirements:
```typescript
// UI State
const [accessAllTeams, setAccessAllTeams] = useState(false)
const [selectedTeams, setSelectedTeams] = useState<number[]>([])
const [teamPermissions, setTeamPermissions] = useState<Record<number, string[]>>({})

// Data State
const [allowedTeamIds, setAllowedTeamIds] = useState<number[]>([])
const [teamSpecificRoles, setTeamSpecificRoles] = useState<Record<number, string[]>>({})

// Transformation
const saveTeamAccess = {
  user_id: userId,
  allowed_team_ids: accessAllTeams ? [] : allowedTeamIds, // Empty = all teams
  team_roles: teamSpecificRoles, // {teamId: ['coach', 'viewer']}
  organization_access: allowedOrganizations || [],
  access_level: determineAccessLevel(allowedTeamIds)
}
```

**Database Schema Needed:**
```sql
ALTER TABLE users
ADD COLUMN allowed_team_ids INTEGER[] DEFAULT '{}',
ADD COLUMN organization_access INTEGER[] DEFAULT '{}',
ADD COLUMN team_specific_roles JSONB DEFAULT '{}';

-- Or separate table for complex permissions
CREATE TABLE team_access_controls (
  id UUID PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  team_id INTEGER REFERENCES teams(id),
  roles_in_team TEXT[] DEFAULT '{}',     -- ['coach', 'assistant', 'viewer']
  permissions_in_team TEXT[] DEFAULT '{}', -- Team-specific permissions
  access_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, team_id)
)
```

---

### 4. Bulk Role Operations
**Location:** Not yet implemented  
**Current State:** Only individual role changes  
**Database Need:** Batch processing with arrays

#### Implementation Requirements:
```typescript
// UI State
const [selectByRole, setSelectByRole] = useState(false)
const [selectByTeam, setSelectByTeam] = useState(false)
const [applyToAll, setApplyToAll] = useState(false)

// Data State
const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
const [rolesToAdd, setRolesToAdd] = useState<string[]>([])
const [rolesToRemove, setRolesToRemove] = useState<string[]>([])

// Transformation for bulk update
const bulkUpdateRoles = {
  user_ids: applyToAll ? [] : selectedUserIds, // Empty = all users
  add_roles: rolesToAdd,
  remove_roles: rolesToRemove,
  reason: bulkChangeReason,
  filters: {
    current_roles: filterByCurrentRoles || [],
    team_ids: filterByTeams || [],
    created_after: dateFilter
  }
}
```

---

### 5. Role Change Audit Log
**Location:** Lines 492-499 show reason field  
**Current State:** Reason captured but not stored  
**Database Need:** `role_change_log` table

#### Implementation Requirements:
```typescript
// Automatic tracking
const logRoleChange = {
  user_id: targetUserId,
  changed_by: currentUserId,
  old_roles: previousRoles,
  new_roles: updatedRoles,
  changes: {
    added: newRoles.filter(r => !previousRoles.includes(r)),
    removed: previousRoles.filter(r => !newRoles.includes(r))
  },
  reason: changeReason,
  ip_address: requestIp,
  user_agent: requestUserAgent
}
```

**Database Schema Needed:**
```sql
CREATE TABLE role_change_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  changed_by TEXT REFERENCES users(id),
  old_roles TEXT[] NOT NULL,
  new_roles TEXT[] NOT NULL,
  added_roles TEXT[] GENERATED ALWAYS AS (
    array(SELECT unnest(new_roles) EXCEPT SELECT unnest(old_roles))
  ) STORED,
  removed_roles TEXT[] GENERATED ALWAYS AS (
    array(SELECT unnest(old_roles) EXCEPT SELECT unnest(new_roles))
  ) STORED,
  reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_role_changes_user ON role_change_log(user_id);
CREATE INDEX idx_role_changes_by ON role_change_log(changed_by);
```

---

## 📋 Implementation Checklist

### Current State Assessment
- [x] Basic role array management working
- [x] UI checkboxes properly modify arrays
- [x] Database update sends arrays correctly
- [ ] Role history tracking missing
- [ ] Bulk operations not available
- [ ] Team-specific access not implemented

### Enhancements Needed
- [ ] Add role change logging
- [ ] Implement permission sets
- [ ] Add team access controls
- [ ] Create bulk operations UI
- [ ] Add role expiration dates
- [ ] Implement delegation features

---

## 🔗 Enhanced Hook Implementation

```typescript
// useRoleManagement.ts (enhanced version)
export function useRoleManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [changeLog, setChangeLog] = useState<RoleChange[]>([])
  
  const updateUserRoles = async (
    userId: string, 
    newRoles: string[], 
    reason?: string
  ) => {
    // Get current state for logging
    const currentUser = users.find(u => u.id === userId)
    const previousRoles = currentUser?.roles || []
    
    // Update roles with full tracking
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        roles: newRoles,
        role_updated_at: new Date().toISOString()
      })
      .eq('id', userId)
    
    if (!updateError) {
      // Log the change
      await supabase
        .from('role_change_log')
        .insert({
          user_id: userId,
          changed_by: getCurrentUserId(),
          old_roles: previousRoles,
          new_roles: newRoles,
          reason: reason || null,
          metadata: {
            ip: await getUserIp(),
            user_agent: navigator.userAgent
          }
        })
      
      // Update local state
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, roles: newRoles } : u
      ))
    }
    
    return { error: updateError }
  }
  
  const bulkUpdateRoles = async (
    userIds: string[],
    operations: {
      add?: string[],
      remove?: string[],
      set?: string[]
    },
    reason?: string
  ) => {
    const updates = []
    
    for (const userId of userIds) {
      const user = users.find(u => u.id === userId)
      if (!user) continue
      
      let newRoles = [...(user.roles || [])]
      
      if (operations.set) {
        newRoles = operations.set
      } else {
        if (operations.add) {
          newRoles = [...new Set([...newRoles, ...operations.add])]
        }
        if (operations.remove) {
          newRoles = newRoles.filter(r => !operations.remove!.includes(r))
        }
      }
      
      updates.push({
        userId,
        previousRoles: user.roles || [],
        newRoles
      })
    }
    
    // Batch update
    for (const update of updates) {
      await updateUserRoles(update.userId, update.newRoles, reason)
    }
    
    return { updated: updates.length }
  }
  
  return {
    users,
    changeLog,
    updateUserRoles,
    bulkUpdateRoles
  }
}
```

---

## 🚨 Critical Notes

1. **Role arrays already working** - Main pattern already implemented correctly
2. **Audit requirements** - Role changes need full audit trail for compliance
3. **Permission inheritance** - Complex when mixing roles and permission sets
4. **Performance** - Bulk operations need careful optimization
5. **Security** - Role changes are high-risk operations

---

## 📅 Implementation Priority

1. **High** - Role change audit logging (compliance requirement)
2. **Medium** - Team-specific access controls (multi-team organizations)
3. **Medium** - Bulk role operations (admin efficiency)
4. **Low** - Permission sets (advanced feature)
5. **Low** - Role delegation (future enhancement)