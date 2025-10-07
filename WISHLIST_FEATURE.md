# Wishlist Feature

## Overview

The wishlist feature allows users to save tricks they want to learn or master in the future. Users can search for tricks, add them to their wishlist, view their saved tricks, and remove them when completed.

## Database Schema

### Table: `user_wishlist`

```sql
create table if not exists public.user_wishlist (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null,
  trick_id uuid not null,
  created_at timestamp with time zone not null default now(),
  constraint user_wishlist_pkey primary key (id),
  constraint user_wishlist_user_id_fkey foreign key (user_id) references public.users (id) on delete cascade,
  constraint user_wishlist_trick_id_fkey foreign key (trick_id) references public.tricks (id) on delete cascade,
  constraint user_wishlist_unique unique (user_id, trick_id)
);
```

### Indexes

- `idx_user_wishlist_user_id`: For fast user-based queries
- `idx_user_wishlist_trick_id`: For fast trick-based queries
- `idx_user_wishlist_created_at`: For sorting by date added

### Row Level Security (RLS)

- Users can only view their own wishlist
- Users can only add to their own wishlist
- Users can only remove from their own wishlist

## Components

### `TrickSearch`

Enhanced to support two modes:

- **navigate** (default): Clicking a trick navigates to its detail page
- **wishlist**: Clicking a trick adds it to the user's wishlist

#### Props

```typescript
interface TrickSearchProps {
  categories?: Array<{ name: string; slug: string; color?: string }>;
  variant?: "default" | "icon";
  mode?: "navigate" | "wishlist";
  onAddToWishlist?: (trickId: string) => void;
}
```

#### Usage Examples

**Navigate mode (default):**

```tsx
<TrickSearch variant="default" mode="navigate" />
```

**Wishlist mode:**

```tsx
<TrickSearch
  variant="default"
  mode="wishlist"
  onAddToWishlist={(trickId) => {
    console.log("Added trick:", trickId);
    // Refresh wishlist, etc.
  }}
/>
```

### `Wishlist`

Displays the user's wishlist with the following features:

- View saved tricks (first 5 shown by default)
- Add new tricks via integrated search dialog
- Remove tricks from wishlist
- Navigate to trick detail pages
- Real-time loading states

#### Usage

```tsx
import { Wishlist } from "@/components/wishlist";

export default function Dashboard() {
  return (
    <div>
      <Wishlist />
    </div>
  );
}
```

## API Functions

Located in `lib/client/wishlist-client.ts`:

### `addToWishlist(supabase, userId, trickId)`

Adds a trick to the user's wishlist.

**Parameters:**

- `supabase`: SupabaseClient instance
- `userId`: UUID of the user
- `trickId`: UUID of the trick

**Returns:**

```typescript
{ success: boolean; error?: string }
```

### `removeFromWishlist(supabase, userId, trickId)`

Removes a trick from the user's wishlist.

**Parameters:**

- `supabase`: SupabaseClient instance
- `userId`: UUID of the user
- `trickId`: UUID of the trick

**Returns:**

```typescript
{ success: boolean; error?: string }
```

### `getWishlist(supabase, userId)`

Fetches all tricks in the user's wishlist.

**Parameters:**

- `supabase`: SupabaseClient instance
- `userId`: UUID of the user

**Returns:**

```typescript
{ tricks: any[]; error?: string }
```

### `isInWishlist(supabase, userId, trickId)`

Checks if a trick is in the user's wishlist.

**Parameters:**

- `supabase`: SupabaseClient instance
- `userId`: UUID of the user
- `trickId`: UUID of the trick

**Returns:**

```typescript
boolean;
```

### `getWishlistCount(supabase, userId)`

Gets the total number of tricks in the user's wishlist.

**Parameters:**

- `supabase`: SupabaseClient instance
- `userId`: UUID of the user

**Returns:**

```typescript
number;
```

## Installation Steps

1. **Run the database migration:**

   ```bash
   # Apply the migration to create the user_wishlist table
   # Using Supabase CLI or dashboard SQL editor
   psql -f migrations/create_user_wishlist_table.sql
   ```

2. **Import the components:**

   ```tsx
   import { TrickSearch } from "@/components/trick-search";
   import { Wishlist } from "@/components/wishlist";
   ```

3. **Use in your application:**

   ```tsx
   // In a dashboard or profile page
   <Wishlist />

   // Or integrate the search in wishlist mode
   <TrickSearch mode="wishlist" onAddToWishlist={handleAdd} />
   ```

## Features

- ✅ Add tricks to wishlist via search
- ✅ Remove tricks from wishlist
- ✅ View wishlist with trick details
- ✅ Navigate to trick pages from wishlist
- ✅ Real-time database updates
- ✅ Optimistic UI updates
- ✅ Toast notifications for user feedback
- ✅ Loading states and error handling
- ✅ Row Level Security (RLS) for data protection
- ✅ Responsive design (desktop & mobile)

## Future Enhancements

- [ ] Reorder wishlist items (drag & drop)
- [ ] Wishlist categories/tags
- [ ] Mark tricks as "in progress"
- [ ] Set priority levels for tricks
- [ ] Share wishlist with others
- [ ] Export wishlist as PDF
- [ ] Integration with user progress tracking
- [ ] Automatic removal when trick is mastered
- [ ] Wishlist analytics (time to complete, success rate)
