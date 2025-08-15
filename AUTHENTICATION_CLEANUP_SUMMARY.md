# Authentication Architecture Cleanup - Quick Reference

## 🎯 **Contract Overview**

**File**: `contracts/active/authentication-architecture-cleanup-contract.yaml`

**Objective**: Implement Supabase Auth-only system with magic links per architectural decision, remove competing auth systems causing loading loops.

## 👥 **Sub-Agent Team**

### **Primary Agent: Authentication Architect**
- Orchestrates entire cleanup process
- Validates architectural consistency
- Coordinates between all sub-agents

### **Sub-Agents:**
1. **Context Cleaner** - Remove competing auth from contexts/hooks
2. **API Specialist** - Clean authentication API endpoints  
3. **Middleware Engineer** - Fix route protection and layouts
4. **Component Updater** - Update UI components for unified auth

## 📋 **5-Phase Implementation Plan**

### **Phase 1: System Audit** (1 hour)
- Map all existing authentication systems
- Identify what to remove vs preserve
- Create removal strategy

### **Phase 2: Remove Competing Systems** (2 hours) 
- Clean SupabaseAuthContext (remove WordPress auth)
- Remove/convert direct-login system
- Clean authentication APIs

### **Phase 3: Unified Implementation** (2 hours)
- Simplify middleware to single auth check
- Fix authenticated layout loading issues
- Enhance magic link system

### **Phase 4: UI Updates** (1.5 hours)
- Convert login page to magic link only
- Update navigation components
- Fix auth-dependent components

### **Phase 5: Testing & Validation** (1 hour)
- Test complete magic link flow
- Verify WordPress integration still works
- Performance and loading loop testing

## 🎯 **Success Criteria**

### **Critical Requirements:**
- ✅ **Single Auth System**: Only Supabase Auth exists
- ✅ **No Loading Loops**: All pages load without auth blocking  
- ✅ **Magic Link Works**: End-to-end authentication flow

### **Key Files Being Modified:**
- `src/contexts/SupabaseAuthContext.tsx` - Remove WordPress auth
- `src/app/direct-login/` - Remove or convert
- `src/middleware.ts` - Simplify to single auth check
- `src/app/(authenticated)/layout.tsx` - Fix loading loops
- `src/app/auth/login/page.tsx` - Convert to magic link only

## 🔄 **Current vs Target Architecture**

### **BEFORE (Broken):**
```
WordPress Auth ← → Supabase Auth ← → Direct Login Mock
     ↓                   ↓                    ↓
  JWT Tokens      Magic Links        localStorage
     ↓                   ↓                    ↓
  Loading Loops    Working System     Dev Bypass
```

### **AFTER (Clean):**
```
WordPress (Reference Only) → Supabase Auth → Magic Links
                                    ↓
                              Session Management
                                    ↓
                            Clean User Experience
```

## 🚀 **To Execute This Contract**

1. **Review the contract**: `contracts/active/authentication-architecture-cleanup-contract.yaml`
2. **Assign sub-agents** or execute phases sequentially
3. **Follow the 5-phase plan** with proper handoffs
4. **Test thoroughly** after each phase
5. **Validate success criteria** before completion

## 📞 **Coordination Protocol**

- Each agent reports completion before next phase
- Primary agent validates all changes
- Blocking issues escalated immediately
- Full system test before contract completion

This contract will solve your authentication loading loops and create the clean, single-source Supabase Auth system with magic links that you originally intended! 🎉
