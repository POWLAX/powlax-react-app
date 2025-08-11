# 🔧 RLS Migration Instructions - Practice Planner Fix

## 🚨 **CRITICAL: Save/Load Practice Plans Currently Broken**

The Save/Load functionality in the Practice Planner is not working due to a missing `created_by` column and RLS (Row Level Security) policies. Follow these steps to fix it:

## ❌ **ERROR ENCOUNTERED:**
**Migration 110 failed with:** `column "created_by" does not exist`

**✅ SOLUTION:** Use Migration 111 instead (fixes the missing column issue)

---

## 📋 **Step-by-Step Instructions**

### **1. Access Supabase Dashboard**
- Go to: `https://supabase.com/dashboard/project/[your-project-id]`
- Log in to your account

### **2. Navigate to SQL Editor**
- Click **"SQL Editor"** in the left sidebar
- Click **"New Query"** or open an existing editor tab

### **3. Run the CORRECT Migration**
- **SKIP Migration 110** (has the missing column error)
- **USE Migration 111 instead:** `supabase/migrations/111_add_created_by_column_and_fix_rls.sql`
- Copy the entire contents of Migration 111
- Paste it into the SQL Editor
- Click **"Run"** button

### **4. Verify Success**
- Check the output panel for any errors
- Look for the completion message:
  ```
  Migration 111 completed successfully!
  Added missing created_by column to practices table
  Fixed RLS policy for practices table
  Save/Load functionality should now work
  ```

### **5. Test the Fix**
- Go to your Practice Planner: `http://localhost:3000/teams/[teamId]/practice-plans`
- Try to save a practice plan
- Try to load a saved practice plan
- Both should now work without errors

---

## 🔍 **What This Migration Does**

### **RLS Policy Fix:**
- Enables Row Level Security on the `practices` table
- Creates policy: Users can only access practices they created
- Ensures `created_by = auth.uid()` for all operations

### **Permission Grants:**
- Grants authenticated users access to `practices` table
- Grants access to the sequence for ID generation

### **Verification:**
- Checks that the `practices` table exists
- Verifies required columns are present
- Provides clear success/error messages

---

## 🚨 **If Migration Fails**

### **Common Issues & Solutions:**

1. **Table doesn't exist:**
   - The `practices` table may not be created yet
   - Check if you need to run earlier migrations first

2. **Column missing:**
   - The `created_by` column may not exist
   - May need to run table creation migration first

3. **Permission denied:**
   - Your Supabase user may not have admin privileges
   - Try logging out and back in to Supabase dashboard

### **Manual Fallback:**
If the migration fails, run these individual commands in SQL Editor:

```sql
-- Enable RLS
ALTER TABLE practices ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can manage their own practices" ON practices
    FOR ALL 
    TO authenticated 
    USING (created_by = auth.uid())
    WITH CHECK (created_by = auth.uid());

-- Grant permissions
GRANT ALL ON practices TO authenticated;
```

---

## ✅ **Success Indicators**

After running the migration successfully:
- ✅ No error messages in SQL Editor output
- ✅ "Migration 110 completed successfully" message appears
- ✅ Save Practice button works in Practice Planner
- ✅ Load Practice modal shows saved practices
- ✅ No "access denied" or authentication errors

---

## 📞 **Support**

If you continue having issues:
1. Check the Supabase Dashboard → Authentication to ensure you're logged in
2. Verify your project ID and database connection
3. Try the manual fallback commands above
4. Check browser console for JavaScript errors

This migration is **required** for the Practice Planner to function properly. The Save/Load feature will not work until this RLS policy is in place.