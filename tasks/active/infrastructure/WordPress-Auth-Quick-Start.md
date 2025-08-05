# WordPress Auth Quick Start Guide

**IMMEDIATE ACTION PLAN** - Get WordPress authentication working in the next 15 minutes

---

## 🚀 **Step 1: WordPress Site Setup** (5 minutes)

### **Your WordPress Site Checklist**
1. **Know your WordPress admin credentials** - You'll use your regular WordPress login credentials

2. **Required Plugins** (verify installed & active):
   - ✅ MemberPress
   - ✅ BuddyBoss/BuddyPress
   
**That's it!** The app will automatically guide you through any additional setup needed.

---

## 🔧 **Step 2: Environment Configuration** (5 minutes)

### **Update your `.env.local` file**:
```bash
# Replace with your actual WordPress site URL
WORDPRESS_API_URL=https://yoursite.com/wp-json/wp/v2

# Your existing Supabase config (keep these if already set)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**That's it!** You don't need to generate Application Passwords or add username/password to the environment file. The app will prompt you for your WordPress login credentials.

### **Restart Development Server** (if not already running):
```bash
npm run dev
```

---

## 🧪 **Step 3: Test Your Login** (5 minutes)

### **Try Logging In**:
```
http://localhost:3000/auth/login
```

### **What Happens**:
1. **Enter your WordPress username and regular password**
2. **Click "Sign In"**
3. **If your regular password doesn't work** - The app will automatically show you step-by-step instructions to create an Application Password
4. **Follow the instructions** - Click the "Go to WordPress Profile" button for direct access
5. **Use the Application Password** - Copy and paste it back into the login form

### **Advanced Testing** (Optional):
For technical users who want detailed diagnostics:
```
http://localhost:3000/test/auth
```

---

## 🎯 **Step 4: Go Live** (15 minutes)

### **If All Tests Pass**:
```bash
# 1. Remove demo mode from main app
# 2. Enable protected routes
# 3. Update navigation to use real auth
```

### **If You Have Issues**:

**The app now provides automatic guidance!** When login fails, you'll see:
- ✅ **Clear error messages** explaining what went wrong
- ✅ **Step-by-step instructions** to create an Application Password
- ✅ **Direct links** to your WordPress profile page
- ✅ **No guesswork** - just follow the on-screen guidance

**Still having trouble?**
- Double-check your WordPress site URL in `.env.local`
- Make sure your WordPress site at powlax.com is online
- Verify you're using your exact WordPress admin username (not email)

---

## 🚀 **Success! What's Next?**

Once authentication is working:

1. **🏠 Team HQ Development** - Build real team functionality
2. **👥 BuddyBoss Integration** - Connect community features  
3. **📝 Practice Planner** - Enable coach-specific features
4. **🎓 Skills Academy** - Real player progress tracking
5. **⚙️ Admin Dashboard** - Organization management

---

## 📞 **Need Help?**

**Test Page**: `http://localhost:3000/test/auth`  
**Full Plan**: `tasks/active/infrastructure/WordPress-Auth-Setup-Plan.md`  
**Next Steps**: Ready to build real functionality! 🎉

---

**ESTIMATED TOTAL TIME: 15 minutes**  
**DIFFICULTY: Super Easy** (automatic guidance for any issues)  
**PAYOFF: Huge** (enables all real functionality)