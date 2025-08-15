# 🚨 CONTRACTS WORDPRESS AUTH CLEANUP PLAN

## ⚠️ **CRITICAL FINDING**

The contracts contain **188 WordPress references** and **71 MemberPress/wp_ references** that could mislead future development back into the broken auth patterns.

## 📊 **CONTRACTS REQUIRING CLEANUP**

### **🔴 HIGH PRIORITY - Auth-Related Contracts**
These contracts contain direct authentication references that MUST be cleaned:

1. **`contracts/active/claude-to-claude-auth-migration-007.yaml`**
   - Contains WordPress JWT authentication instructions
   - **Action**: DELETE or completely rewrite for Supabase-only

2. **`contracts/active/authentication-enhancement-system-001.yaml`**
   - References WordPress role migration and authentication
   - **Action**: Update to Supabase-only patterns

3. **`contracts/active/authentication-architecture-cleanup-contract.yaml`**
   - Mixed WordPress/Supabase auth instructions
   - **Action**: Clean to Supabase-only approach

4. **`contracts/pages/core/page-auth-login-contract.yaml`**
   - **Line 56**: "WordPress credential validation"
   - **Line 102**: "Direct integration with WordPress authentication system"
   - **Action**: Rewrite for Supabase magic links only

### **🟡 MEDIUM PRIORITY - Data Sync References**
These can stay but need clarification that they're for DATA SYNC ONLY, not authentication:

1. **`contracts/MEMBERPRESS-INTEGRATION-FIX-CONTRACT.md`**
   - MemberPress integration for subscriptions (not auth)
   - **Action**: Add header clarifying "DATA SYNC ONLY - NO AUTH"

2. **`contracts/active/management-foundation-001.yaml`**
   - MemberPress API for membership management
   - **Action**: Clarify this is for subscription data, not authentication

### **🟢 LOW PRIORITY - Template References**
These are template examples and can be updated:

1. **`contracts/templates/enhanced-contract-template.yaml`**
   - Example WordPress references
   - **Action**: Update examples to show Supabase patterns

## 🔧 **IMMEDIATE CLEANUP ACTIONS**

### **Step 1: Delete Dangerous Auth Contracts**
```bash
# Remove contracts that promote WordPress auth
rm contracts/active/claude-to-claude-auth-migration-007.yaml
```

### **Step 2: Update Critical Auth Contracts**
Update these files to remove WordPress auth references:
- `contracts/active/authentication-enhancement-system-001.yaml`
- `contracts/active/authentication-architecture-cleanup-contract.yaml`
- `contracts/pages/core/page-auth-login-contract.yaml`

### **Step 3: Add Auth Mandate Headers**
Add this header to ALL auth-related contracts:
```yaml
# 🚨 AUTHENTICATION MANDATE
# This contract uses SUPABASE AUTHENTICATION ONLY
# WordPress references are for DATA SYNC ONLY, never authentication
# Any WordPress auth patterns must be converted to Supabase patterns
```

## 📋 **SPECIFIC CONTRACT FIXES NEEDED**

### **`page-auth-login-contract.yaml`** - CRITICAL FIX
```yaml
# CURRENT (BROKEN):
businessLogic: "WordPress credential validation, dual auth state handling"
authentication: "WordPress credentials via useAuth hook"
externalAPIs: ["WordPress authentication endpoint"]

# SHOULD BE (FIXED):
businessLogic: "Supabase magic link authentication, single auth state"
authentication: "Supabase magic links via useSupabaseAuth hook"  
externalAPIs: ["Supabase Auth API", "SendGrid Email API"]
```

### **`authentication-enhancement-system-001.yaml`** - CRITICAL FIX
Remove all WordPress role migration sections and replace with:
```yaml
supabaseRoleSystem:
  standardRoles: ["player", "parent", "coach", "admin", "club_director"]
  roleAssignment: "Direct assignment in Supabase, no WordPress dependency"
  authFlow: "Magic links → Supabase Auth → Role-based access"
```

## 🎯 **CLEANUP EXECUTION PLAN**

### **Phase 1: Remove Dangerous Contracts** (5 minutes)
```bash
# Delete contracts that promote WordPress auth
rm contracts/active/claude-to-claude-auth-migration-007.yaml

# Backup the dangerous contract for analysis
cp contracts/active/authentication-enhancement-system-001.yaml \
   contracts/active/authentication-enhancement-system-001.yaml.WORDPRESS_BACKUP
```

### **Phase 2: Update Auth Contracts** (15 minutes)
- Rewrite auth contracts to use Supabase-only patterns
- Add authentication mandate headers
- Remove WordPress auth references

### **Phase 3: Clarify Data Sync Contracts** (10 minutes)
- Add headers clarifying "DATA SYNC ONLY - NO AUTH"
- Update MemberPress contracts to focus on subscription management
- Remove any auth-related MemberPress references

## 🚨 **IMMEDIATE DANGER PREVENTION**

### **Files to Delete NOW**
```bash
rm contracts/active/claude-to-claude-auth-migration-007.yaml
```

### **Files to Update ASAP**
- `contracts/active/authentication-enhancement-system-001.yaml`
- `contracts/active/authentication-architecture-cleanup-contract.yaml`  
- `contracts/pages/core/page-auth-login-contract.yaml`

## 🎯 **SUCCESS CRITERIA**

After cleanup:
- [ ] No contracts promote WordPress authentication
- [ ] All auth contracts specify Supabase-only patterns
- [ ] MemberPress contracts clarify "data sync only"
- [ ] Templates show correct Supabase examples
- [ ] Authentication mandate headers added to all auth contracts

**This cleanup is CRITICAL to prevent future agents from reintroducing WordPress auth based on contract instructions.**

