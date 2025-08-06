# Supabase Service Role Key Setup

## Why Service Role Key?

The service role key is needed for administrative operations like:
- Bulk data imports
- Creating/modifying tables
- Managing Row Level Security (RLS)
- Bypassing RLS for admin tasks

## How to Get Your Service Role Key

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard/project/avvpyjwytcmtoiyrbibb/settings/api

2. **Find Service Role Key**
   - Look for "Project API keys" section
   - Find the key labeled `service_role` (NOT the `anon` key)
   - Click the "Reveal" button to show the key

3. **Add to .env.local**
   ```bash
   # Add this line to your .env.local file
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

## ⚠️ SECURITY WARNING

**NEVER expose the service role key in:**
- Client-side code
- Public repositories
- Frontend applications
- Browser console logs

**The service role key should ONLY be used in:**
- Server-side scripts
- Database migrations
- Admin tools
- Secure backend operations

## Difference Between Keys

| Key Type | Purpose | Security Level | Use Cases |
|----------|---------|----------------|-----------|
| `anon` (public) | Client-side operations | Limited by RLS | Frontend apps, public API |
| `service_role` | Admin operations | Bypasses RLS | Migrations, bulk imports |

## Using Service Role Key Safely

```typescript
// ✅ CORRECT: Server-side script only
const supabase = createClient(url, serviceRoleKey)

// ❌ WRONG: Never in client components
export default function ClientComponent() {
  const supabase = createClient(url, serviceRoleKey) // NEVER DO THIS
}
```

## Import Process with Service Role

1. **Disable RLS** temporarily for bulk operations
2. **Import data** using service role privileges
3. **Re-enable RLS** with proper policies
4. **Verify** access works for regular users

This ensures data integrity while maintaining security.