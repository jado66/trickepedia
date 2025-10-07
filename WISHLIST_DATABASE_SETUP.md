# Wishlist Database Setup Guide

## Prerequisites

- Access to your Supabase project
- SQL Editor access in Supabase Dashboard OR Supabase CLI installed

## Setup Instructions

### Option 1: Using Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**

   - Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project

2. **Navigate to SQL Editor**

   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the Migration**

   - Copy the contents of `migrations/create_user_wishlist_table.sql`
   - Paste into the SQL editor
   - Click "Run" or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

4. **Verify the Table**
   - Navigate to "Table Editor" in the left sidebar
   - Look for the `user_wishlist` table
   - Click on it to verify the schema

### Option 2: Using Supabase CLI

1. **Install Supabase CLI** (if not already installed)

   ```bash
   npm install -g supabase
   ```

2. **Link your project**

   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

3. **Run the migration**
   ```bash
   supabase db push --dry-run  # Preview changes
   supabase db push            # Apply migration
   ```

### Option 3: Using psql (Advanced)

1. **Get your database connection string**

   - From Supabase Dashboard → Settings → Database
   - Copy the "Connection string" with password

2. **Run the migration**
   ```bash
   psql "YOUR_CONNECTION_STRING" -f migrations/create_user_wishlist_table.sql
   ```

## Verification

After running the migration, verify the setup:

### 1. Check Table Exists

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'user_wishlist';
```

### 2. Check Indexes

```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'user_wishlist';
```

Expected indexes:

- `user_wishlist_pkey` (primary key on id)
- `user_wishlist_unique` (unique constraint on user_id, trick_id)
- `idx_user_wishlist_user_id`
- `idx_user_wishlist_trick_id`
- `idx_user_wishlist_created_at`

### 3. Check RLS Policies

```sql
SELECT policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'user_wishlist';
```

Expected policies:

- `Users can view own wishlist` (SELECT)
- `Users can add to own wishlist` (INSERT)
- `Users can remove from own wishlist` (DELETE)

### 4. Test Insert (Optional)

```sql
-- This should succeed if you're authenticated
INSERT INTO user_wishlist (user_id, trick_id)
VALUES (auth.uid(), 'some-trick-uuid')
RETURNING *;
```

## Rollback (if needed)

If you need to undo the migration:

```sql
-- Remove RLS policies
DROP POLICY IF EXISTS "Users can view own wishlist" ON public.user_wishlist;
DROP POLICY IF EXISTS "Users can add to own wishlist" ON public.user_wishlist;
DROP POLICY IF EXISTS "Users can remove from own wishlist" ON public.user_wishlist;

-- Drop indexes (they'll be dropped with the table, but listed for reference)
DROP INDEX IF EXISTS idx_user_wishlist_user_id;
DROP INDEX IF EXISTS idx_user_wishlist_trick_id;
DROP INDEX IF EXISTS idx_user_wishlist_created_at;

-- Drop the table
DROP TABLE IF EXISTS public.user_wishlist;
```

## Troubleshooting

### Error: "permission denied for schema public"

**Solution:** Ensure you're running the SQL as a user with sufficient permissions (typically the postgres role or project owner).

### Error: "relation 'tricks' does not exist"

**Solution:** The `tricks` table must exist before creating `user_wishlist`. Verify it exists:

```sql
SELECT * FROM information_schema.tables WHERE table_name = 'tricks';
```

### Error: "relation 'users' does not exist"

**Solution:** The `users` table must exist. Apply the users table migration first (see your original SQL).

### RLS is blocking my queries

**Solution:**

1. Verify you're authenticated:
   ```sql
   SELECT auth.uid();  -- Should return your user ID, not NULL
   ```
2. Check if RLS is properly configured:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'user_wishlist';
   ```

## Next Steps

After successful migration:

1. ✅ Table created with proper schema
2. ✅ Indexes added for performance
3. ✅ RLS policies configured for security
4. 📝 Update your frontend to use the wishlist feature
5. 🧪 Test the functionality in your application

## Support

If you encounter issues:

- Check Supabase logs in Dashboard → Logs
- Review RLS policies
- Verify foreign key constraints (users and tricks tables must exist)
- Check authentication status when testing

---

**Last Updated:** October 7, 2025  
**Migration File:** `migrations/create_user_wishlist_table.sql`
