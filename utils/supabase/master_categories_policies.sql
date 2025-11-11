-- Master Categories RLS & role setup
-- Run this in your Supabase SQL editor.

-- Ensure enum has moderator role (idempotent)
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

-- Drop broad legacy policy if present
DROP POLICY IF EXISTS allow_authenticated_cud_master_categories ON public.master_categories;

-- READ: allow anyone to read active master categories
CREATE POLICY IF NOT EXISTS master_categories_public_read
ON public.master_categories
FOR SELECT
USING ( is_active = true );

-- INSERT: moderators & admins
CREATE POLICY IF NOT EXISTS master_categories_insert_moderator
ON public.master_categories
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
      AND u.role IN ('moderator','admin')
  )
);

-- UPDATE: moderators & admins
CREATE POLICY IF NOT EXISTS master_categories_update_moderator
ON public.master_categories
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
      AND u.role IN ('moderator','admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
      AND u.role IN ('moderator','admin')
  )
);

-- DELETE: moderators & admins
CREATE POLICY IF NOT EXISTS master_categories_delete_moderator
ON public.master_categories
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
      AND u.role IN ('moderator','admin')
  )
);

ALTER TABLE public.master_categories ENABLE ROW LEVEL SECURITY;
-- Optionally enforce
-- ALTER TABLE public.master_categories FORCE ROW LEVEL SECURITY;

-- Bulk reorder function for master categories
-- Call with: supabase.rpc('bulk_reorder_master_categories', { p: JSON.stringify([{id: 'uuid', sort_order: 1}, ...]) })
CREATE OR REPLACE FUNCTION public.bulk_reorder_master_categories(p jsonb)
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
    UPDATE master_categories
    SET sort_order = r.sort_order,
        updated_at = now()
    WHERE id = r.id;
  END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION public.bulk_reorder_master_categories(jsonb) TO authenticated;

-- Verification helpers
-- SELECT id, name, sort_order FROM master_categories ORDER BY sort_order;
