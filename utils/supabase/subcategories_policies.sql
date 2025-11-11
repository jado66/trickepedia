-- Subcategories RLS & role setup
-- Run this in your Supabase SQL editor.

-- 1. Ensure enum has moderator role
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'user_role' AND e.enumlabel = 'moderator'
  ) THEN
    ALTER TYPE user_role ADD VALUE 'moderator';
  END IF;
END$$;

-- 2. (Optional) Show existing policies before changes
-- SELECT * FROM pg_policies WHERE tablename = 'subcategories';

-- 3. Drop old broad policy if it exists
DROP POLICY IF EXISTS allow_authenticated_cud_subcategories ON public.subcategories;

-- 4. READ policy (kept simple; adjust if you want wider visibility)
CREATE POLICY IF NOT EXISTS allow_public_read_subcategories
ON public.subcategories
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM master_categories mc
    WHERE mc.id = subcategories.master_category_id
      AND mc.is_active = true
  )
);

-- 5. INSERT policy for moderators/admins only
CREATE POLICY IF NOT EXISTS subcategories_insert_moderator
ON public.subcategories
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM users u
    JOIN master_categories mc ON mc.id = subcategories.master_category_id
    WHERE u.id = auth.uid()
      AND u.role IN ('moderator','admin')
      AND mc.is_active = true
  )
);

-- 6. UPDATE policy (same check for USING and WITH CHECK)
CREATE POLICY IF NOT EXISTS subcategories_update_moderator
ON public.subcategories
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users u
    JOIN master_categories mc ON mc.id = subcategories.master_category_id
    WHERE u.id = auth.uid()
      AND u.role IN ('moderator','admin')
      AND mc.is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users u
    JOIN master_categories mc ON mc.id = subcategories.master_category_id
    WHERE u.id = auth.uid()
      AND u.role IN ('moderator','admin')
      AND mc.is_active = true
  )
);

-- 7. DELETE policy
CREATE POLICY IF NOT EXISTS subcategories_delete_moderator
ON public.subcategories
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users u
    JOIN master_categories mc ON mc.id = subcategories.master_category_id
    WHERE u.id = auth.uid()
      AND u.role IN ('moderator','admin')
      AND mc.is_active = true
  )
);

-- 8. Ensure RLS enabled
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
-- Optional strictness
-- ALTER TABLE public.subcategories FORCE ROW LEVEL SECURITY;

-- 9. OPTIONAL: Bulk reorder function (definer) to minimize round trips
-- Call with: supabase.rpc('bulk_reorder_subcategories', { p: JSON.stringify([{id: 'uuid', sort_order: 1}, ...]) })
CREATE OR REPLACE FUNCTION public.bulk_reorder_subcategories(p jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT (elem->>'id')::uuid AS id,
           (elem->>'sort_order')::int AS sort_order
    FROM jsonb_array_elements(p) elem
  LOOP
    UPDATE subcategories
    SET sort_order = r.sort_order,
        updated_at = now()
    WHERE id = r.id;
  END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION public.bulk_reorder_subcategories(jsonb) TO authenticated;

-- 10. Verification helpers
-- SELECT id, name, sort_order FROM subcategories WHERE master_category_id = '...uuid...' ORDER BY sort_order;
-- EXPLAIN ANALYZE SELECT * FROM subcategories WHERE master_category_id = '...';

-- Done.
