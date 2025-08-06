# 🚨 IMMEDIATE FIX CHECKLIST
## When POWLAX App Won't Load Properly

*Created: 2025-01-15*  
*Quick reference for common issues*

---

## ✅ STEP-BY-STEP FIX PROCESS

### 1. **Check Your Port** ⚠️ CRITICAL
- Look at your terminal output
- Find the line: `- Local: http://localhost:XXXX`
- **Use THAT port number in your browser**
- Don't assume it's 3000!

**Example:**
```bash
⚠ Port 3000 is in use, trying 3001 instead.
- Local:        http://localhost:3001  ← USE THIS URL
```

### 2. **If Still Getting 404 Errors**
```bash
# Kill whatever is using port 3000
lsof -ti:3000 | xargs kill -9

# Force Next.js to use port 3000
npm run dev -- --port 3000
```

### 3. **If Getting "Custom Element Already Defined"**
- This is usually harmless but annoying
- Clear browser cache: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (PC)
- Restart dev server: `Ctrl+C` then `npm run dev`

### 4. **If Page Shows "Loading user data..." Forever**
- Check browser console for auth errors
- Verify you're in development mode (should bypass auth)
- Try refreshing the page

### 5. **Nuclear Option - Full Reset**
```bash
# Stop dev server (Ctrl+C)
rm -rf .next
rm -rf node_modules/.cache
npm run dev
```

---

## 🎯 QUICK DIAGNOSTIC QUESTIONS

| Problem | Check This | Fix This |
|---------|------------|----------|
| 404 for chunks/static files | Terminal port vs browser URL | Match the ports |
| Custom element error | Browser cache | Clear cache + restart |
| Auth loading forever | Console errors | Check auth context |
| App won't start | Package.json scripts | Run `npm install` |

---

## 📱 IMMEDIATE ACTIONS FOR AGENTS

**When user says "app won't load" or "500 errors everywhere":**

1. **FIRST**: Check terminal for `Module not found` or `Can't resolve` errors
2. **IF BAD IMPORT**: Fix import immediately + restart server
3. **SECOND**: Ask what port they're accessing (3000, 3001, etc.)
4. **THIRD**: Check their terminal output for actual port
5. **FOURTH**: Tell them the correct URL to use
6. **ONLY THEN**: Start debugging other code issues

**Example Response:**
> "I see Next.js started on port 3001. Please go to `http://localhost:3001/admin/content-editor` instead of port 3000. This should fix the 404 errors you're seeing."

---

## ⚡ ONE-MINUTE FIXES

### Bad Import - 500 Errors Everywhere (Most Critical)
```bash
# Look for terminal error like:
# "Module not found: Can't resolve '@/hooks/useAuthContext'"

# Fix the import in that file:
# Change: import { useAuthContext } from '@/hooks/useAuthContext'
# To:     import { useAuth } from '@/contexts/JWTAuthContext'

# Then restart:
rm -rf .next && npm run dev
```

### Port Mismatch (Second Most Common)
```bash
# Check what port it's actually running on
npm run dev
# Look for: "Local: http://localhost:XXXX"
# Use that URL in browser
```

### Static File 404s
```bash
# Clear cache and restart
rm -rf .next && npm run dev
# Then use the correct port from terminal output
```

### Custom Element Conflicts
```bash
# Just restart everything
Ctrl+C
npm run dev
# Refresh browser with Cmd+Shift+R
```

### Loading State Stuck
- Check browser console
- Verify correct port
- Try incognito/private browsing mode

---

**REMEMBER**: 90% of "app won't load" issues are port mismatches. Always check the terminal output first! 🎯