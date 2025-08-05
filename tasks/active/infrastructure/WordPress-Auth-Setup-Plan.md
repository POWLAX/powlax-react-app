# WordPress Authentication Setup & Confirmation Plan

**Goal**: Transition from demo mode to real WordPress authentication functionality  
**Duration**: 2-4 hours  
**Priority**: High - Enables real user functionality  
**Status**: Ready to Execute

---

## 🎯 **Objective**

Set up and confirm WordPress authentication integration to enable real user accounts, role-based access, and MemberPress subscription management.

---

## 📋 **Phase 1: Environment & WordPress Configuration** (30-60 minutes)

### **1.1 Environment Variables Setup**
Based on codebase analysis, configure these required variables in `.env.local`:

```bash
# WordPress REST API Configuration
WORDPRESS_API_URL=https://your-wordpress-site.com/wp-json/wp/v2
WORDPRESS_CUSTOM_API_KEY=your-custom-api-key-if-needed

# WordPress Application Password Authentication
WORDPRESS_USERNAME=your-admin-username
WORDPRESS_APP_PASSWORD=your-application-password

# Alternative: JWT Token Authentication
WORDPRESS_JWT_TOKEN=your-jwt-token-if-using-jwt

# Supabase Configuration (for user sync)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### **1.2 WordPress Site Requirements**
**WordPress Plugins Needed**:
- ✅ **MemberPress** - Already integrated in codebase
- ✅ **BuddyBoss/BuddyPress** - For community features
- 🔧 **Application Passwords** - Enable in WordPress admin
- 🔧 **REST API** - Ensure endpoints are accessible
- 🔧 **Custom REST API endpoints** (if using custom API key)

**WordPress Configuration Steps**:
1. **Enable Application Passwords**:
   - Go to Users → Profile → Application Passwords
   - Generate new password for POWLAX app
   - Copy password to `WORDPRESS_APP_PASSWORD` env var

2. **Verify REST API Access**:
   - Test: `https://your-site.com/wp-json/wp/v2/users/me`
   - Should require authentication

3. **Configure CORS** (if needed):
   - Allow requests from `localhost:3000` during development
   - Allow requests from production domain

---

## 📋 **Phase 2: Authentication Testing & Validation** (60-90 minutes)

### **2.1 Create Authentication Test Suite**

**Test File**: `src/lib/__tests__/wordpress-auth.test.ts`
```typescript
// Test cases to implement:
- Valid username/password authentication
- Invalid credentials handling  
- MemberPress subscription validation
- Supabase user sync verification
- Session persistence testing
- Role-based access verification
```

### **2.2 Manual Authentication Testing**

**Create Test Route**: `/test/auth` (temporary)
```typescript
// Test page with:
- Login form
- User info display
- Subscription status
- Role verification
- Supabase sync status
```

### **2.3 Validation Checklist**
- [ ] WordPress REST API accessible
- [ ] Basic Auth working with Application Password
- [ ] User authentication successful
- [ ] MemberPress subscription data retrieved
- [ ] User synced to Supabase
- [ ] Session persistence working
- [ ] Role-based access control functional
- [ ] Logout clears session properly

---

## 📋 **Phase 3: Integration Testing** (45-60 minutes)

### **3.1 Test User Journey**
**Complete Flow Testing**:
1. **Landing Page** → Login redirect
2. **Login Process** → Role-based dashboard
3. **Subscription Check** → Access control
4. **Navigation** → Authenticated routes
5. **Session Management** → Persistence across refreshes
6. **Logout** → Return to login

### **3.2 Role-Based Access Testing**
**Test Each Role**:
- **Admin**: Full access to all features
- **Coach**: Practice planner, team management
- **Player**: Skills academy, progress tracking
- **Parent**: View player progress, team info
- **Director**: Organizational oversight

### **3.3 Subscription Integration Testing**
- **Active Subscription**: Full feature access
- **Expired Subscription**: Limited access
- **No Subscription**: Basic access only
- **Subscription Changes**: Real-time updates

---

## 📋 **Phase 4: Demo-to-Production Migration** (30-45 minutes)

### **4.1 Remove Demo Mode**
**Files to Update**:
- Remove demo banners from all pages
- Update navigation to use real authentication
- Replace mock data with real user data
- Enable protected route middleware

### **4.2 Update Landing Page**
- Change root redirect from `/demo` to `/auth/login`
- Update navigation components
- Enable authenticated user detection

### **4.3 Enable Protected Routes**
**Route Protection**:
```typescript
// Apply to all authenticated routes:
- /dashboard/*
- /teams/*
- /practice-planner/*
- /skills-academy/* (non-demo)
- /admin/* (admin only)
```

---

## 📋 **Phase 5: Production Readiness** (30 minutes)

### **5.1 Security Hardening**
- [ ] Validate all input sanitization
- [ ] Ensure secure token storage
- [ ] Verify HTTPS enforcement
- [ ] Test rate limiting
- [ ] Confirm error handling doesn't leak sensitive info

### **5.2 Performance Optimization**
- [ ] Cache user sessions appropriately
- [ ] Optimize Supabase sync operations
- [ ] Minimize API calls during authentication
- [ ] Test concurrent user scenarios

### **5.3 Monitoring & Logging**
- [ ] Set up authentication success/failure logging
- [ ] Monitor subscription status changes
- [ ] Track user sync operations
- [ ] Alert on authentication failures

---

## 🔧 **Implementation Commands**

### **Start Authentication Setup**:
```bash
# 1. Test WordPress API connectivity
curl -u "username:app-password" "https://your-site.com/wp-json/wp/v2/users/me"

# 2. Run authentication tests
npm run test:auth

# 3. Start development server with real auth
npm run dev
```

### **Validation Commands**:
```bash
# Test Supabase connection
npm run test:supabase

# Verify environment variables
npm run check:env

# Test full authentication flow
npm run test:auth-flow
```

---

## 🚨 **Common Issues & Solutions**

### **Issue**: CORS errors with WordPress API
**Solution**: Configure WordPress CORS headers or use proxy

### **Issue**: Application Password not working
**Solution**: Verify WordPress Application Passwords plugin enabled

### **Issue**: MemberPress data not accessible
**Solution**: Check MemberPress REST API endpoints and permissions

### **Issue**: Supabase sync failures
**Solution**: Verify service role key and RLS policies

---

## 📊 **Success Criteria**

- [ ] ✅ WordPress authentication working end-to-end
- [ ] ✅ All user roles authenticate correctly
- [ ] ✅ MemberPress subscriptions properly detected
- [ ] ✅ Supabase user sync operational
- [ ] ✅ Session persistence across browser refreshes
- [ ] ✅ Protected routes enforcing authentication
- [ ] ✅ Role-based access control functional
- [ ] ✅ Demo mode completely removed
- [ ] ✅ Error handling graceful and secure
- [ ] ✅ Performance meets production standards

---

## 🎯 **Next Steps After Auth Setup**

Once WordPress authentication is confirmed:
1. **Team HQ Development** - Real team functionality
2. **BuddyBoss Integration** - Community features with auth
3. **Practice Planner** - Coach-specific authenticated features
4. **Skills Academy** - Player progress tracking
5. **Admin Dashboard** - Organization management

---

**Estimated Total Time**: 3-4 hours  
**Risk Level**: Medium (existing infrastructure in place)  
**Dependencies**: WordPress site access, environment configuration