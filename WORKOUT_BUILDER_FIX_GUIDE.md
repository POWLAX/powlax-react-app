# 🔧 Workout Builder Fix & Vimeo API Setup Guide

## 🔍 **Problem Solved**

The workout builder at `http://localhost:3000/skills-academy/workout-builder` was failing because:
1. Missing `skills_academy_drills` table in Supabase
2. No Vimeo API credentials configured

## 🚀 **Quick Fix Steps**

### **Step 1: Fix Database (2 minutes)**

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/editor
2. Copy and paste the contents of `fix_workout_builder_database.sql` into the SQL Editor
3. Click "Run" to create the missing table and sample data

### **Step 2: Test the Fix**

1. Start your dev server: `npm run dev`
2. Navigate to: `http://localhost:3000/skills-academy/workout-builder`
3. You should now see the workout builder with sample drills loaded!

---

## 🎥 **Vimeo API Setup (Complete Guide)**

### **Step 1: Create Vimeo Developer Account**

1. Go to: https://developer.vimeo.com/
2. Click "Create an app" or navigate to: https://developer.vimeo.com/apps
3. Fill out the app form:
   - **App Name**: "POWLAX Practice Planner"
   - **App Description**: "Video integration for lacrosse practice planning and skills academy"
   - **Website**: `http://localhost:3000` (for development)

### **Step 2: Generate Personal Access Token**

1. In your Vimeo app dashboard, click on your new app
2. Go to the "Authentication" tab
3. Scroll to "Personal access tokens"
4. Click "Generate" and select these scopes:
   ```
   ✅ public        - View public videos
   ✅ private       - View private videos (if needed)
   ✅ video_files   - Access video files
   ✅ stats         - View statistics
   ✅ interact      - Like and subscribe to videos
   ✅ upload        - Upload videos (if needed)
   ```
5. **IMPORTANT**: Copy the access token immediately - you won't see it again!

### **Step 3: Add Vimeo Credentials to Your App**

1. Create/update `.env.local` in your project root:

```bash
# Vimeo API Configuration
NEXT_PUBLIC_VIMEO_ACCESS_TOKEN=your_access_token_here
VIMEO_CLIENT_ID=your_client_id_here
VIMEO_CLIENT_SECRET=your_client_secret_here
```

2. Update your Vimeo service file with real credentials:

**File**: `src/lib/vimeo-service.ts` (line 10)
```typescript
constructor() {
  this.accessToken = process.env.NEXT_PUBLIC_VIMEO_ACCESS_TOKEN || null
  this.hasApiAccess = !!this.accessToken
}
```

### **Step 4: Test Your Vimeo Setup**

1. Restart your development server: `npm run dev`
2. Open browser console and test:
```javascript
// Test API call in browser console
fetch('https://api.vimeo.com/me', {
  headers: {
    'Authorization': 'bearer YOUR_ACCESS_TOKEN_HERE',
    'Accept': 'application/vnd.vimeo.*+json;version=3.4'
  }
})
.then(response => response.json())
.then(data => console.log('Vimeo API Success:', data))
.catch(error => console.error('Vimeo API Error:', error))
```

---

## 🎯 **Enhanced Features Now Available**

With the database and Vimeo API properly configured, your workout builder now supports:

### **Core Functionality**
- ✅ Browse drills by category (Attack, Defense, Midfield, Wall Ball)
- ✅ Filter by complexity level (Foundation, Building, Advanced)
- ✅ Filter by duration (Quick <5min, Medium 5-10min, Long >10min)
- ✅ Add drills to custom workout sequences
- ✅ Calculate total points and duration
- ✅ Category streak bonuses (2x, 2.5x, 3x multipliers)

### **Gamification System**
- **Lax Credits**: Universal currency for all drills
- **Attack Tokens**: Earned from attack-specific drills
- **Defense Dollars**: Earned from defensive drills  
- **Midfield Medals**: Earned from midfield drills
- **Rebound Rewards**: Earned from wall ball drills

### **Video Integration** (with Vimeo API)
- View drill demonstration videos directly in the builder
- Access video metadata (duration, thumbnail, title)
- Track video play statistics
- Support for private/unlisted Vimeo content

---

## 🔄 **Next Steps: Enable Transcript Analysis**

Now that your Vimeo API is working, we can implement the transcript integration we discussed:

1. **Extend Vimeo Service** for transcript retrieval
2. **Add transcript storage** to database
3. **Implement AI analysis** for drill recommendations
4. **Enhanced strategy-to-drill matching**

This will transform your workout builder from a static drill library into an intelligent, context-aware coaching assistant!

---

## 🐛 **Troubleshooting**

### Database Issues
```sql
-- Check if table exists
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'skills_academy_drills';

-- Check sample data
SELECT id, title, complexity, duration_minutes FROM skills_academy_drills LIMIT 5;
```

### Vimeo API Issues
```bash
# Test API with curl
curl -H "Authorization: bearer YOUR_ACCESS_TOKEN" https://api.vimeo.com/me

# Expected response: Your Vimeo account info JSON
```

### App Issues
1. Clear browser cache and restart dev server
2. Check browser console for specific error messages
3. Verify `.env.local` file is in project root and properly formatted

---

## 🎉 **Success Indicators**

You'll know everything is working when:
1. ✅ Workout builder loads without "Loading drills..." forever
2. ✅ You see 5 sample drills in different categories
3. ✅ You can add drills to your workout sequence
4. ✅ Point calculations work correctly
5. ✅ Video icons appear next to drills with Vimeo IDs

**Ready to build some amazing workouts!** 🏑