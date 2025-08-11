
-- =====================================================
-- FIX PRACTICES TABLE FOREIGN KEY
-- =====================================================
-- The issue: created_by references auth.users(id) but we're using public.users(id)
-- Solution: Change the foreign key to reference public.users(id) instead

-- Step 1: Drop the existing foreign key constraint
ALTER TABLE practices 
DROP CONSTRAINT IF EXISTS practices_created_by_fkey;

-- Step 2: Change created_by to reference public.users(id) instead of auth.users(id)
ALTER TABLE practices
ADD CONSTRAINT practices_created_by_fkey 
FOREIGN KEY (created_by) 
REFERENCES public.users(id) 
ON DELETE SET NULL;

-- Step 3: Update coach_id foreign key as well (if needed)
ALTER TABLE practices
DROP CONSTRAINT IF EXISTS practices_coach_id_fkey;

ALTER TABLE practices
ADD CONSTRAINT practices_coach_id_fkey
FOREIGN KEY (coach_id)
REFERENCES public.users(id)
ON DELETE SET NULL;

-- Step 4: Update RLS policy to work with public.users
DROP POLICY IF EXISTS "Users can manage their own practices" ON practices;

-- Create new policy that works with public.users
CREATE POLICY "Users can manage their own practices" ON practices
    FOR ALL 
    TO authenticated 
    USING (
      created_by IN (
        SELECT id FROM public.users 
        WHERE auth_user_id = auth.uid()
      )
    )
    WITH CHECK (
      created_by IN (
        SELECT id FROM public.users 
        WHERE auth_user_id = auth.uid()
      )
    );

-- Step 5: Update existing practices to use correct user IDs
UPDATE practices p
SET created_by = u.id
FROM public.users u
WHERE p.coach_id = u.id
AND p.created_by IS NULL;

-- Verify the changes
SELECT 
  'Practices table foreign keys updated successfully!' as message,
  'created_by now references public.users(id)' as detail1,
  'RLS policy updated to work with public.users' as detail2;
