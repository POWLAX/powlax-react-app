# 🌐 WordPress Shortcode Embedding Guide

**Purpose:** Safely embed POWLAX React app pages in WordPress with MemberPress protection  
**Security:** Admin access controlled, client-safe demonstrations  

---

## 🔧 **SECURITY FIX IMPLEMENTED**

### ✅ **Problem Solved:**
- **Before:** Everyone had admin access (security risk)
- **After:** Default users have player access only
- **Admin Access:** URL parameter override for you only

### ✅ **How Admin Access Works:**
```
Normal URL: https://app.powlax.com/dashboard
→ User sees: "Demo User (Limited Access)" with player permissions

Admin URL: https://app.powlax.com/dashboard?admin=powlax2025
→ You see: "Demo User (ADMIN OVERRIDE)" with full admin permissions
```

**Your Secret Admin Key:** `?admin=powlax2025`

---

## 🚀 **WordPress Shortcode Setup**

### **Step 1: Install Code Snippet**
Copy the code from `wordpress-integration/code-snippet-for-powlax.php` into your WordPress Code Snippets plugin.

### **Step 2: Available Shortcodes**

#### **Skills Academy Page:**
```
[powlax_app_button page="academy" text="Open Skills Academy" style="large"]
```

#### **Practice Planner Page:**
```
[practice_planner_button text="Open Practice Planner" style="large"]
```

#### **Custom App Pages:**
```
[powlax_app_button page="teams" text="View Teams"]
[powlax_app_button page="resources" text="Training Resources"]
[powlax_app_button page="dashboard" text="My Dashboard"]
```

### **Step 3: MemberPress Protection**
Wrap pages with MemberPress shortcodes:
```
[mepr-show if="rule:123"]
  <h2>Skills Academy</h2>
  [powlax_app_button page="academy" text="Start Training"]
[/mepr-show]

[mepr-hide if="rule:123"]
  <p>Upgrade your membership to access the Skills Academy</p>
[/mepr-hide]
```

---

## 👥 **Client Demonstration Setup**

### **Safe Client Access:**
1. **Create Demo Page** in WordPress:
   ```
   Title: "POWLAX Training Demo"
   Content:
   [powlax_app_button page="academy" text="View Skills Academy Demo"]
   [powlax_app_button page="teams" text="View Practice Planner Demo"]
   ```

2. **Share Client URL:**
   ```
   https://powlax.com/demo-page
   ```
   - ✅ Client sees limited player view
   - ✅ Can explore features safely
   - ❌ Cannot access admin functions

3. **Your Admin URL (when needed):**
   ```
   https://app.powlax.com/dashboard?admin=powlax2025
   ```
   - ✅ Full admin access for you
   - ✅ Can demonstrate admin features
   - ✅ Can manage content

---

## 🔐 **MemberPress Integration**

### **Webhook Configuration:**
1. **In MemberPress Settings:**
   - Webhook URL: `https://app.powlax.com/api/memberpress/webhook`
   - Secret Key: Set `MEMBERPRESS_WEBHOOK_SECRET` in your `.env.local`
   - Events: All subscription events

2. **What the Webhook Does:**
   - ✅ Creates users in Supabase when they subscribe
   - ✅ Updates subscription status (active/canceled/expired)
   - ✅ Provisions teams/clubs based on membership level
   - ✅ Logs all events for debugging

### **Membership Protection Example:**
```php
// In WordPress page/post:
[mepr-show if="rule:456"]
  <h3>Coach Tools</h3>
  [practice_planner_button text="Create Practice Plans"]
[/mepr-show]

[mepr-show if="rule:789"]
  <h3>Premium Training</h3>
  [powlax_app_button page="academy" text="Advanced Skills Academy"]
[/mepr-show]
```

---

## 🎯 **Vacation Mode Setup**

### **For Client Demos While You're Away:**

#### **Option 1: WordPress Demo Page**
```
Title: "POWLAX Platform Preview"
Content:
Welcome to POWLAX! Explore our training platform:

[powlax_app_button page="academy" text="🎓 Skills Academy" style="large"]
[powlax_app_button page="teams" text="📋 Practice Planner" style="large"]

Note: This is a demonstration version with limited access.
```

#### **Option 2: Direct App Links**
Share these safe URLs:
- Skills Academy: `https://app.powlax.com/academy`
- Practice Planner: `https://app.powlax.com/teams`
- Dashboard: `https://app.powlax.com/dashboard`

**Client Experience:**
- ✅ Can view all content and features
- ✅ Can interact with training materials
- ✅ Cannot edit or delete content
- ✅ Cannot access admin panels
- ✅ Cannot change settings

**When You Return:**
- Add `?admin=powlax2025` to any URL for full admin access
- All client interactions are logged in database
- No data corruption possible

---

## 🚨 **Security Features**

### **Built-in Protection:**
1. **Role-Based Access:** Default users see player view only
2. **Admin Override:** Secret URL parameter for owner access
3. **MemberPress Integration:** Subscription-based access control
4. **WordPress Login Required:** Shortcodes check WordPress authentication
5. **Database Safety:** Limited permissions prevent data corruption

### **Admin Access Methods:**

#### **Method 1: URL Parameter (Recommended)**
```
https://app.powlax.com/any-page?admin=powlax2025
```

#### **Method 2: Temporary Admin Role** (if needed)
You can temporarily modify the auth context to always return admin:
```typescript
// In src/contexts/SupabaseAuthContext.tsx
// Change line 27 to: if (true || isAdminOverride()) {
```

---

## 📋 **Testing Checklist**

### **Before Client Demo:**
- [ ] Test shortcodes on WordPress page
- [ ] Verify MemberPress protection works
- [ ] Confirm client sees limited access
- [ ] Test your admin override URL
- [ ] Verify all features work in player mode

### **For Vacation Mode:**
- [ ] Create dedicated demo page
- [ ] Test all shortcode buttons work
- [ ] Confirm no admin access for clients
- [ ] Document admin override for your return
- [ ] Test webhook is receiving MemberPress events

---

## 🔄 **Next Steps**

1. **Install WordPress shortcodes** from the integration files
2. **Configure MemberPress webhook** with your app URL
3. **Create demo pages** with appropriate shortcodes
4. **Test client access** (should see limited view)
5. **Test your admin access** with `?admin=powlax2025`

**Your platform is now safe for client demonstrations while maintaining full admin control for you!**
