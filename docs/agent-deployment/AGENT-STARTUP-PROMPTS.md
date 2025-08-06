# 🚀 **Agent Startup Prompts - Copy & Paste Ready**

## 🟣 **MemberPress Integration Agent Startup Prompt**

```
🟣 MEMBERPRESS INTEGRATION ARCHITECT - DEPLOY NOW

Your mission: Build WordPress MemberPress integration that automatically creates teams/organizations from membership purchases.

📖 COMPLETE DEPLOYMENT INSTRUCTIONS: 
docs/agent-deployment/MemberPress-Integration-Agent-Deployment.md

🎯 PRIORITY TASKS:
1. Create webhook endpoint `/api/webhooks/memberpress/route.ts`
2. Build auto team/organization creation service  
3. Generate registration QR codes and assets
4. Implement 30-day guarantee tracking

🔗 KEY DELIVERABLES:
- MemberPress webhook handler with signature verification
- Team HQ: Single team creation with coach role
- Club OS: Organization + 3 teams with director role  
- Registration codes, QR codes, and flyers for each team
- Subscription monitoring and access revocation

🗃️ DATABASE: Connect to existing Supabase schema, create new tables for subscriptions, registration assets, and guarantee tracking

🟣 COLOR THEME: Purple (#A855F7) for all MemberPress UI elements

⚙️ ENVIRONMENT: Next.js 14 running on localhost:3000 - start building immediately!

SUCCESS TARGET: MemberPress purchase → Automatic team creation → Registration assets generated → Welcome process initiated
```

---

## 🟠 **Team HQ & Club OS Management Agent Startup Prompt**

```
🟠 TEAM HQ & CLUB OS MANAGEMENT ARCHITECT - DEPLOY NOW

Your mission: Build comprehensive team and organization management dashboards for Directors and Coaches with customization, invitations, and scaling features.

📖 COMPLETE DEPLOYMENT INSTRUCTIONS: 
docs/agent-deployment/Team-HQ-Club-OS-Management-Agent-Deployment.md

🎯 PRIORITY TASKS:
1. Build organization dashboard for Club OS Directors
2. Create team customization wizard (4-step setup)
3. Implement member invitation system (individual + bulk)
4. Build Team HQ → Club OS upgrade flow

🔗 KEY DELIVERABLES:
- Director dashboard: `/organizations/[orgId]/dashboard`
- Team setup wizard with branding and customization
- Individual and bulk member invitation system
- QR code and flyer generation for team registration
- Upgrade flow for scaling Team HQ to Club OS
- Registration asset management and statistics

🗃️ DATABASE: Enhance existing teams/organizations tables, create team_invitations and upgrade_history tables

🟠 COLOR THEME: Orange (#F97316) for all team/organization management elements

⚙️ ENVIRONMENT: Next.js 14 running on localhost:3000 - enhance existing authenticated routes!

SUCCESS TARGET: Purchase → Setup wizard → Team customization → Member invitations → Active team management → Scaling options
```

---

## 📋 **Agent Deployment Checklist**

### **Before Starting Agents:**
- [ ] Confirm Next.js dev server running on `localhost:3000`
- [ ] Verify Supabase connection working
- [ ] Add required environment variables to `.env.local`
- [ ] Review existing authenticated route structure

### **MemberPress Agent Setup:**
- [ ] Get actual MemberPress product IDs from WordPress
- [ ] Configure MemberPress webhook URL and secret key
- [ ] Test webhook endpoint with sample data
- [ ] Verify Supabase table creation and permissions

### **Team Management Agent Setup:**  
- [ ] Confirm existing team/organization database schema
- [ ] Test user role verification and permissions
- [ ] Set up file upload handling for team logos
- [ ] Configure email sending for invitations

### **Integration Testing:**
- [ ] Test complete flow: Purchase → Team Creation → Customization → Invitations
- [ ] Verify QR codes generate and work for registration
- [ ] Test upgrade flow from Team HQ to Club OS
- [ ] Confirm 30-day guarantee tracking works

---

## 🎯 **Agent Coordination Notes**

### **Safe to Run in Parallel:**
✅ **These agents work on different areas and won't conflict:**
- Purple Agent: API routes, webhooks, background services
- Orange Agent: Dashboard pages, team management UI, customization flows

### **Shared Dependencies:**
🔗 **Both agents will use:**
- Same Supabase database (different tables)
- Existing user authentication system
- Same team/organization data structures
- Shared registration flow for new members

### **Sequential Dependencies:**
⚠️ **Orange Agent benefits from Purple Agent completion:**
- Team customization works better with auto-created teams
- Registration assets connect to MemberPress webhook data
- Upgrade flows need subscription monitoring in place

---

## 📞 **Support Information**

### **If Agents Need Help:**
- Full technical specifications in deployment documents
- Existing codebase patterns in `src/app/(authenticated)/` routes
- Database schema in `supabase/migrations/` files
- Authentication context in `src/contexts/JWTAuthContext.tsx`

### **Testing Endpoints:**
- Development server: `http://localhost:3000`
- Test webhook: `POST /api/webhooks/memberpress`
- Team dashboard: `/organizations/[orgId]/dashboard`
- Registration flow: `/register?code=TEAM_CODE&team=TEAM_ID`

Ready to deploy! Copy the startup prompts above to your agent conversations.