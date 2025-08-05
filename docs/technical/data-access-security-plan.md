# POWLAX Data Access & Security Management Plan

## 🎯 Overview

This document defines the comprehensive data access patterns and security boundaries for the POWLAX platform, ensuring proper role-based access while maintaining data integrity and privacy across all user types.

## 📊 Data Access Matrix

### Core Data Entities & Access Patterns

| Entity | Admin | Director | Coach | Player | Parent |
|--------|-------|----------|-------|--------|--------|
| **System Settings** | ✅ Full | ❌ | ❌ | ❌ | ❌ |
| **All Organizations** | ✅ Full | ❌ | ❌ | ❌ | ❌ |
| **Own Organization (Club OS)** | ✅ Full | ✅ Full | 👁️ Read | 👁️ Read* | ❌ |
| **Teams in Organization** | ✅ Full | ✅ Full | 👁️ List Only | ❌ | ❌ |
| **Own Team (Team HQ)** | ✅ Full | ✅ Full | ✅ Full | 👁️ Read | 👁️ Read** |
| **Practice Plans** | ✅ Full | ✅ Full | ✅ CRUD Own | 👁️ Published | 👁️ Published |
| **Drill Library** | ✅ Full | ✅ Full | 👁️ Read | 👁️ Read | ❌ |
| **Player Progress** | ✅ Full | ✅ All in Org | ✅ Team Only | ✅ Own Only | 👁️ Children |
| **Skills Academy** | ✅ Full | 👁️ Analytics | 👁️ Team Stats | ✅ Own Progress | 👁️ Children |
| **Badges/Achievements** | ✅ Full | 👁️ Org-wide | 👁️ Team | ✅ Own | 👁️ Children |
| **Team Communications** | ✅ Full | ✅ All Teams | ✅ Create/Send | 👁️ Receive | 👁️ Receive |
| **Parent Resources** | ✅ Full | ✅ Manage | 👁️ Read | ❌ | ✅ Full Access |
| **Billing/Subscriptions** | ✅ Full | ✅ Own Org | ❌ | ❌ | 👁️ Own |
| **Leaderboards** | ✅ Full | ✅ Org Filter | 👁️ Team+Public | 👁️ Public | 👁️ Public |
| **Team Playbooks** | ✅ Full | ✅ All Teams | ✅ CRUD Own | 👁️ View | ❌ |
| **Understanding Checks** | ✅ Full | ✅ Create | ✅ Assign | ✅ Take | 👁️ Children |

*Players see limited Club OS info (announcements, leaderboards)
**Parents only see their children's team data

## 🔐 Security Implementation Strategy

### 1. Row-Level Security (RLS) Policies

#### Organization-Level Security
```sql
-- Directors can only access their organization
CREATE POLICY "director_org_access" ON organizations
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM users 
      WHERE 'club_director' = ANY(roles)
      AND organization_id = organizations.id
    )
    OR 
    auth.uid() IN (
      SELECT user_id FROM users 
      WHERE 'administrator' = ANY(roles)
    )
  );

-- Coaches see limited org data
CREATE POLICY "coach_org_read" ON organizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN teams t ON tm.team_id = t.id
      WHERE tm.user_id = auth.uid()
      AND tm.role = 'coach'
      AND t.organization_id = organizations.id
    )
  );
```

#### Team-Level Security
```sql
-- Team visibility based on membership
CREATE POLICY "team_access" ON teams
  FOR SELECT USING (
    -- Admins see all
    auth.uid() IN (SELECT user_id FROM users WHERE 'administrator' = ANY(roles))
    OR
    -- Directors see their org's teams
    (
      auth.uid() IN (SELECT user_id FROM users WHERE 'club_director' = ANY(roles))
      AND organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
    OR
    -- Members see their team
    auth.uid() IN (
      SELECT user_id FROM team_members WHERE team_id = teams.id
    )
  );

-- Coaches can modify their teams
CREATE POLICY "coach_team_management" ON teams
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_id = teams.id
      AND user_id = auth.uid()
      AND role = 'coach'
    )
  );
```

#### Player Data Security
```sql
-- Players see only their own data
CREATE POLICY "player_own_data" ON player_progress
  FOR ALL USING (
    player_id = auth.uid()
    OR
    -- Parents see children's data
    player_id IN (
      SELECT id FROM users WHERE parent_id = auth.uid()
    )
    OR
    -- Coaches see their team's players
    EXISTS (
      SELECT 1 FROM team_members tm1
      JOIN team_members tm2 ON tm1.team_id = tm2.team_id
      WHERE tm1.user_id = auth.uid() 
      AND tm1.role = 'coach'
      AND tm2.user_id = player_progress.player_id
    )
    OR
    -- Directors see their organization's players
    EXISTS (
      SELECT 1 FROM users u
      JOIN teams t ON u.organization_id = t.organization_id
      JOIN team_members tm ON t.id = tm.team_id
      WHERE u.id = auth.uid()
      AND 'club_director' = ANY(u.roles)
      AND tm.user_id = player_progress.player_id
    )
  );
```

#### Parent-Specific Access
```sql
-- Parents access their own resources and children's data
CREATE POLICY "parent_resource_access" ON parent_resources
  FOR SELECT USING (
    -- All parents can read parent resources
    auth.uid() IN (
      SELECT user_id FROM users WHERE 'parent' = ANY(roles)
    )
  );

-- Parent-child relationship validation
CREATE POLICY "parent_child_access" ON users
  FOR SELECT USING (
    -- Parents can see their children's profiles
    id = auth.uid()
    OR
    parent_id = auth.uid()
    OR
    -- Other standard visibility rules...
  );
```

### 2. Data Scope Validation

#### API Middleware for Role Validation
```typescript
// middleware/roleValidation.ts
export const validateDataAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { user } = req;
  const { resourceType, resourceId, action } = req.params;

  // Get user's complete role context
  const userContext = await getUserContext(user.id);
  
  // Validate based on role hierarchy
  switch (userContext.primaryRole) {
    case 'administrator':
      // Admins bypass all checks
      next();
      break;
      
    case 'club_director':
      // Validate organization scope
      if (await isInDirectorScope(userContext, resourceType, resourceId)) {
        next();
      } else {
        res.status(403).json({ error: 'Access denied: Outside organization scope' });
      }
      break;
      
    case 'team_coach':
      // Validate team scope
      if (await isInCoachScope(userContext, resourceType, resourceId, action)) {
        next();
      } else {
        res.status(403).json({ error: 'Access denied: Outside team scope' });
      }
      break;
      
    case 'player':
      // Validate personal data only
      if (await isPlayerOwnData(userContext, resourceType, resourceId)) {
        next();
      } else {
        res.status(403).json({ error: 'Access denied: Not your data' });
      }
      break;
      
    case 'parent':
      // Validate children's data
      if (await isParentChildData(userContext, resourceType, resourceId)) {
        next();
      } else {
        res.status(403).json({ error: 'Access denied: Not your child\'s data' });
      }
      break;
  }
};
```

### 3. Feature-Specific Access Controls

#### Skills Academy Access
```typescript
interface SkillsAcademyAccess {
  // Player access
  player: {
    viewOwnProgress: true,
    completeWorkouts: true,
    earnBadges: true,
    viewLeaderboards: 'public_only',
    createCustomWorkouts: false
  },
  
  // Parent access
  parent: {
    viewChildProgress: true,
    assignWorkouts: false,
    viewChildBadges: true,
    modifySettings: false
  },
  
  // Coach access
  coach: {
    viewTeamProgress: true,
    assignWorkouts: true,
    createCustomDrills: true,
    viewDetailedAnalytics: 'team_only'
  },
  
  // Director access
  director: {
    viewAllProgress: 'organization_only',
    manageCurriculum: true,
    viewAnalytics: 'organization_wide',
    exportData: true
  }
}
```

#### Practice Planner Access
```typescript
interface PracticePlannerAccess {
  // Coach full access
  coach: {
    create: true,
    edit: 'own_only',
    delete: 'own_only',
    publish: true,
    duplicate: true,
    share: 'within_organization'
  },
  
  // Director oversight
  director: {
    view: 'all_in_organization',
    edit: 'emergency_only',
    approve: true,
    mandate: true,
    analytics: true
  },
  
  // Player/Parent read-only
  player_parent: {
    view: 'published_only',
    download: true,
    feedback: true
  }
}
```

### 4. Data Privacy & Compliance

#### COPPA Compliance for Youth Data
```typescript
// Youth data protection
export const youthDataProtection = {
  // No PII collection for under-13 without parent consent
  requiredParentConsent: ['email', 'photo', 'video', 'location'],
  
  // Restricted features for youth accounts
  restrictedFeatures: {
    messaging: false,
    publicProfile: false,
    socialSharing: false,
    externalLinks: false
  },
  
  // Data retention limits
  retentionPolicy: {
    practiceData: '1 year',
    progressData: '3 years',
    videoAnalysis: '6 months'
  }
};
```

### 5. Audit & Monitoring

#### Comprehensive Audit Trail
```sql
-- Enhanced audit table for all data access
CREATE TABLE data_access_audit (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_role TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  organization_id UUID,
  team_id UUID,
  success BOOLEAN NOT NULL,
  denied_reason TEXT,
  ip_address INET,
  user_agent TEXT,
  additional_context JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance
CREATE INDEX idx_audit_user_time ON data_access_audit(user_id, created_at DESC);
CREATE INDEX idx_audit_resource ON data_access_audit(resource_type, resource_id);
```

## 🔄 Implementation Phases

### Phase 1: Core Security (Immediate)
1. Implement RLS policies for all tables
2. Add role validation middleware
3. Create audit logging system
4. Test with each role type

### Phase 2: Enhanced Features (Week 2)
1. Add organization scope validation
2. Implement parent-child relationships
3. Create data export controls
4. Add COPPA compliance checks

### Phase 3: Advanced Security (Week 3-4)
1. Implement field-level encryption for PII
2. Add suspicious activity detection
3. Create data anonymization for analytics
4. Build compliance reporting tools

## 📋 Testing & Validation

### Security Test Cases
1. **Cross-Organization Access**: Ensure directors cannot access other orgs
2. **Parent Boundaries**: Verify parents cannot see other children
3. **Coach Limitations**: Confirm coaches cannot modify director settings
4. **Player Privacy**: Validate players cannot see teammate personal data
5. **Data Leakage**: Check API responses don't include unauthorized fields

### Compliance Validation
1. Run COPPA compliance audit
2. Verify data retention policies
3. Test consent workflows
4. Validate data export capabilities

## 🚨 Security Monitoring

### Real-time Alerts
- Failed access attempts (>5 in 5 minutes)
- Cross-organization access attempts
- Bulk data exports
- Role elevation attempts
- Unusual access patterns

### Regular Reviews
- Weekly: Access pattern analysis
- Monthly: Role assignment audit
- Quarterly: Security policy review
- Annually: Full security assessment

---

## Next Steps

1. Review and approve this plan
2. Begin implementing Phase 1 RLS policies
3. Update API endpoints with role validation
4. Create comprehensive test suite
5. Document for development team

This plan ensures that your role boundaries are properly enforced while maintaining the flexibility needed for your multi-tenant, family-oriented platform.