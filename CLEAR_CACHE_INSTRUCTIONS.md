# 🧹 How to Clear Cache - POWLAX Practice Planner

## Browser Cache
1. **Chrome/Edge DevTools Method:**
   - Open DevTools (F12 or right-click → Inspect)
   - Right-click the Refresh button
   - Select "Empty Cache and Hard Reload"

2. **Manual Clear:**
   - Chrome: Settings → Privacy → Clear browsing data → Cached images and files
   - Safari: Develop → Empty Caches
   - Firefox: Settings → Privacy → Clear Data → Cached Web Content

## Next.js Build Cache
```bash
# Stop the dev server first (Ctrl+C)
# Then run:
rm -rf .next
rm -rf node_modules/.cache
npm run dev
```

## localStorage Clear
```javascript
// In browser console:
localStorage.clear()
sessionStorage.clear()
// Then refresh page
```

## Supabase Client Cache
```javascript
// In browser console:
// Force re-authentication
localStorage.removeItem('supabase.auth.token')
location.reload()
```