# 🔐 Real WordPress Authentication Setup for POWLAX

## Overview
This guide will help you connect your localhost POWLAX app to your real WordPress account at powlax.com, allowing you to login with your patrick@powlax.com credentials and have full admin oversight.

---

## ✅ Good News: Everything is Already Configured!

Your `.env.local` file already has the WordPress configuration:
- **WordPress URL**: https://powlax.com
- **Admin Username**: powlax
- **App Password**: Already set up

The authentication system is ready to use!

---

## 🚀 How to Login with Your Real Account

### Step 1: Navigate to the Login Page
Open your browser and go to:
```
http://localhost:3000/auth/login
```

### Step 2: Enter Your Credentials
Use your real POWLAX WordPress credentials:
- **Username**: `patrick` (or your WordPress username, not email)
- **Password**: Your actual WordPress password

> **Note**: Use your WordPress username, not your email. If you usually login with patrick@powlax.com, try just "patrick" as the username.

### Step 3: You're In!
Once logged in, you'll have:
- ✅ Full admin permissions
- ✅ Access to admin editing features
- ✅ Team playbook functionality
- ✅ Your real user data from WordPress

---

## 🔍 How It Works

### Authentication Flow
1. **Login Request** → Your credentials go to `/api/auth/login`
2. **Proxy Authentication** → The app uses the proxy API to authenticate with WordPress
3. **WordPress Verification** → Your credentials are verified against powlax.com
4. **Session Creation** → A local session token is created
5. **User Data Fetch** → Your WordPress user data (roles, email, etc.) is retrieved
6. **Access Granted** → You're logged in with your real permissions!

### The Proxy System
The app uses a proxy authentication system to avoid CORS issues:
- The proxy uses your admin app password to verify users
- It creates secure session tokens for local development
- Your real WordPress data is fetched and stored locally

---

## 🎯 What You'll See Once Logged In

### 1. Your Real User Data
```javascript
{
  id: 123,  // Your WordPress user ID
  username: "patrick",
  name: "Patrick",
  email: "patrick@powlax.com",
  roles: ["administrator"],  // Your real WordPress roles
  avatar: "your-gravatar-url"
}
```

### 2. Admin Features (Because You're Admin!)
- **Orange edit buttons** on drill/strategy cards
- **Admin toolbar** appears on hover
- **Direct database editing** capability
- **Full access** to all admin-only features

### 3. Personalized Experience
- Your drills and strategies
- Your team associations
- Your saved practice plans
- Your custom content

---

## 🛠️ Troubleshooting

### Can't Login?

#### 1. Check Your Username
WordPress authentication often requires the username, not email:
- ❌ `patrick@powlax.com`
- ✅ `patrick`

#### 2. Verify WordPress Password
Make sure you're using your actual WordPress password, not an app password.

#### 3. Check Console for Errors
Open browser DevTools (F12) and check the Console tab for error messages.

#### 4. Test WordPress Connection
```bash
# Test if WordPress API is accessible
curl https://powlax.com/wp-json/wp/v2/users
```

### Getting 401 Unauthorized?
This usually means:
- Wrong username/password
- Account doesn't exist
- Account is disabled

### Getting 500 Server Error?
Check that your `.env.local` has:
```env
WORDPRESS_USERNAME=powlax
WORDPRESS_APP_PASSWORD=0xDT JlPT JRHe jnXd lIkC e0zt
```

---

## 🔒 Security Notes

### What's Stored Locally
- **Session Token**: Temporary token in localStorage
- **User Data**: Your WordPress profile info
- **Expires**: After 60 minutes of inactivity

### What's NOT Stored
- Your actual WordPress password
- Sensitive account information
- Payment/subscription data

---

## 📊 Verifying Your Admin Access

### After Login, Check Your Permissions
1. **Open DevTools Console** (F12)
2. **Type this command**:
```javascript
const user = JSON.parse(localStorage.getItem('wp_user_data'))
console.log('User:', user)
console.log('Is Admin:', user?.roles?.includes('administrator'))
console.log('Email:', user?.email)
```

### You Should See:
```javascript
User: {id: 123, username: "patrick", email: "patrick@powlax.com", ...}
Is Admin: true
Email: patrick@powlax.com
```

---

## 🚦 Quick Start Checklist

1. ✅ Navigate to http://localhost:3000/auth/login
2. ✅ Enter username: `patrick` (not email)
3. ✅ Enter your WordPress password
4. ✅ Click Login
5. ✅ Redirected to Dashboard
6. ✅ Go to Practice Planner
7. ✅ See admin features!

---

## 💡 Pro Tips

### Stay Logged In
The session persists for 60 minutes and auto-refreshes every 50 minutes while active.

### Force Refresh User Data
```javascript
// In browser console
localStorage.removeItem('wp_user_data')
localStorage.removeItem('wp_jwt_token')
// Then refresh the page and login again
```

### Check Current Auth Status
```javascript
// In browser console
const token = localStorage.getItem('wp_jwt_token')
const user = JSON.parse(localStorage.getItem('wp_user_data'))
console.log('Logged in:', !!token)
console.log('User:', user?.email)
```

---

## 🎉 You're All Set!

Once you login with your real credentials:
1. **You ARE the admin** - Full oversight of the app
2. **Real data** - Your actual WordPress account
3. **Full permissions** - All admin features available
4. **Persistent session** - Stay logged in while developing

The authentication system is fully functional and connects directly to your WordPress site at powlax.com!

---

## 🆘 Need Help?

If you're still having issues:
1. Check the Network tab in DevTools for failed requests
2. Look at the Console for JavaScript errors
3. Verify your WordPress account works at powlax.com
4. Make sure you're using username (not email) to login

Remember: The system is designed to use your real WordPress account, giving you the exact same permissions and data you have on the live site!