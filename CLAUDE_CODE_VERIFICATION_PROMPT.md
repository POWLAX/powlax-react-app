# 🔍 CLAUDE CODE VERIFICATION PROMPT

**Purpose:** Verify POWLAX authentication architecture understanding  
**For:** New Claude Code instances with no prior context  
**Critical:** Must understand self-contained system approach  

---

## 📋 **VERIFICATION CHECKLIST FOR CLAUDE CODE**

Please analyze the POWLAX codebase and confirm your understanding by answering these questions:

### **1. Authentication System Understanding**
- ❓ What authentication system is currently implemented?
- ❓ What authentication system is planned for production?
- ❓ Are there any WordPress authentication integrations planned?
- ❓ What is the role of MemberPress in this system?

### **2. Payment System Architecture**
- ❓ What payment system will be used for subscriptions?
- ❓ Are there any MemberPress API integrations planned?
- ❓ How will subscription management work?
- ❓ What external payment dependencies exist?

### **3. Database Integration**
- ❓ What is the primary database system?
- ❓ Are there WordPress database dependencies?
- ❓ How is user data managed?
- ❓ What tables handle subscription/membership data?

### **4. API Architecture**
- ❓ What APIs exist for WordPress integration?
- ❓ What is the purpose of `/api/wordpress/memberpress/route.ts`?
- ❓ What external API calls are planned for production?
- ❓ How will email services be handled?

---

## ✅ **CORRECT ANSWERS (MANDATORY UNDERSTANDING)**

### **Authentication:**
- **Current:** Mock authentication for development
- **Planned:** Supabase Auth with magic links ONLY
- **WordPress Auth:** ❌ NO - Not planned, not implemented
- **MemberPress Role:** Webhook only for membership status sync

### **Payment System:**
- **Payment Method:** Stripe/PayPal integration (self-contained)
- **MemberPress APIs:** ❌ NO - Webhook only, no API calls
- **Subscription Management:** Internal system with Stripe
- **External Dependencies:** Stripe/PayPal only, no WordPress

### **Database:**
- **Primary DB:** Supabase PostgreSQL
- **WordPress Dependencies:** ❌ NO - Self-contained system
- **User Management:** Supabase Auth + internal user tables
- **Subscription Tables:** `user_subscriptions`, `stripe_customers` (planned)

### **APIs:**
- **WordPress APIs:** ❌ NONE - All marked for removal/replacement
- **MemberPress Route:** Development placeholder only - NOT for production
- **External APIs:** Stripe, SendGrid only
- **Email Service:** SendGrid (self-contained), no WordPress

---

## 🚨 **CRITICAL WARNINGS TO UNDERSTAND**

### **RED FLAGS - NEVER IMPLEMENT:**
1. WordPress JWT authentication
2. WordPress user synchronization
3. MemberPress API calls (beyond webhook receiver)
4. WordPress email integration
5. WordPress session management

### **GREEN FLAGS - ALWAYS IMPLEMENT:**
1. Supabase Auth patterns
2. Stripe payment integration
3. Self-contained subscription logic
4. Internal email systems (SendGrid)
5. Database-first architecture

---

## 📖 **REQUIRED READING**

Before working on this codebase, you MUST read:

1. **`AUTHENTICATION_ARCHITECTURE_CLARIFICATION.md`** - Authentication strategy
2. **`COMPLETE_AUTH_REMOVAL_SUCCESS.md`** - Why auth was removed
3. **`CLAUDE.md`** - Updated development guidelines
4. **`docs/codebase-index/MASTER_INDEX.md`** - Updated system overview

---

## 🎯 **VERIFICATION QUESTIONS FOR YOU**

**Please answer these to confirm understanding:**

1. **If asked to implement user authentication, what system would you use?**
   - ✅ Correct: Supabase Auth with magic links
   - ❌ Wrong: WordPress integration, MemberPress auth

2. **If asked to implement subscription payments, what would you build?**
   - ✅ Correct: Stripe integration with internal subscription management
   - ❌ Wrong: MemberPress API integration, WordPress payments

3. **If you see WordPress integration code in the codebase, what should you do?**
   - ✅ Correct: Flag for removal, replace with self-contained alternative
   - ❌ Wrong: Build upon it, extend WordPress integration

4. **What is the ONLY acceptable MemberPress integration?**
   - ✅ Correct: Webhook receiver for membership status sync
   - ❌ Wrong: API calls, user sync, authentication

5. **If asked to add email functionality, what service would you use?**
   - ✅ Correct: SendGrid with self-contained templates
   - ❌ Wrong: WordPress email system, MemberPress emails

---

## 📝 **RESPONSE FORMAT**

Please respond with:

```
AUTHENTICATION UNDERSTANDING: [Supabase Auth only]
PAYMENT UNDERSTANDING: [Stripe self-contained]
WORDPRESS INTEGRATION: [None - webhook only]
MEMBERPRESS ROLE: [Webhook receiver only]
EXTERNAL DEPENDENCIES: [Stripe, SendGrid only]

VERIFICATION STATUS: ✅ UNDERSTOOD / ❌ NEEDS CLARIFICATION
```

**Only proceed with codebase work after confirming ✅ UNDERSTOOD status.**

---

## 🔄 **FOR HANDOFFS**

When handing off work to another Claude instance, include this verification prompt and ensure they complete it before continuing development.

**The goal is ZERO WordPress integration assumptions in future development.**
