# 🚀 Wishlist Quick Start Guide

## 1️⃣ Setup Database (Choose one method)

### Method A: Supabase Dashboard (Easiest)

1. Go to your Supabase project
2. Click **SQL Editor** → **New query**
3. Copy & paste from `migrations/create_user_wishlist_table.sql`
4. Click **Run**

### Method B: Supabase CLI

```bash
supabase db push
```

### Method C: Direct SQL

```bash
psql "YOUR_CONNECTION_STRING" -f migrations/create_user_wishlist_table.sql
```

## 2️⃣ Verify Installation

```sql
-- Should return the wishlist table info
SELECT * FROM information_schema.tables
WHERE table_name = 'user_wishlist';

-- Should return 3 RLS policies
SELECT * FROM pg_policies
WHERE tablename = 'user_wishlist';
```

## 3️⃣ Use in Your App

### Basic Usage (Recommended)

```tsx
import { Wishlist } from "@/components/wishlist";

export default function Dashboard() {
  return <Wishlist />;
}
```

### Custom Search Page

```tsx
import { TrickSearch } from "@/components/trick-search";

export default function AddToWishlist() {
  return (
    <TrickSearch
      mode="wishlist"
      onAddToWishlist={(id) => console.log("Added:", id)}
    />
  );
}
```

### Direct API Usage

```tsx
import { supabase } from "@/utils/supabase/client";
import { addToWishlist, getWishlist } from "@/lib/client/wishlist-client";

// Add to wishlist
const user = await supabase.auth.getUser();
await addToWishlist(supabase, user.data.user.id, trickId);

// Get wishlist
const { tricks } = await getWishlist(supabase, user.data.user.id);
```

## 🎯 Component Props Quick Reference

### TrickSearch

| Prop              | Type                       | Default      | Description       |
| ----------------- | -------------------------- | ------------ | ----------------- |
| `mode`            | `"navigate" \| "wishlist"` | `"navigate"` | Click behavior    |
| `variant`         | `"default" \| "icon"`      | `"default"`  | Visual style      |
| `categories`      | `Category[]`               | `[]`         | Filter options    |
| `onAddToWishlist` | `(id: string) => void`     | -            | Callback function |

### Wishlist

No props needed - works out of the box!

## 🔑 API Functions

| Function                                        | Purpose        |
| ----------------------------------------------- | -------------- |
| `addToWishlist(supabase, userId, trickId)`      | Add trick      |
| `removeFromWishlist(supabase, userId, trickId)` | Remove trick   |
| `getWishlist(supabase, userId)`                 | Get all tricks |
| `isInWishlist(supabase, userId, trickId)`       | Check if saved |
| `getWishlistCount(supabase, userId)`            | Get count      |

## ✅ Testing Checklist

```
□ Database migration ran successfully
□ Can add tricks to wishlist
□ Can remove tricks from wishlist
□ Can view trick details from wishlist
□ Empty state shows correctly
□ Loading states work
□ Toast notifications appear
□ Works on mobile
□ RLS policies protect data
```

## 🐛 Common Issues & Fixes

| Issue               | Solution                                      |
| ------------------- | --------------------------------------------- |
| "Permission denied" | Check user is logged in: `SELECT auth.uid();` |
| Table not found     | Run migration in SQL Editor                   |
| Can't add tricks    | Verify RLS policies exist                     |
| UI not updating     | Check browser console for errors              |

## 📚 Documentation Files

- `WISHLIST_IMPLEMENTATION_SUMMARY.md` - Overview & architecture
- `WISHLIST_FEATURE.md` - Complete API documentation
- `WISHLIST_DATABASE_SETUP.md` - Detailed setup guide
- `components/wishlist-examples.tsx` - 7 code examples

## 🎨 Customization

### Change colors

```tsx
// In wishlist.tsx
<Heart className="w-5 h-5 text-red-500" /> // Change color here
```

### Change max displayed tricks

```tsx
// In wishlist.tsx
const displayTricks = wishlistTricks.slice(0, 5); // Change 5 to your number
```

### Add custom categories

```tsx
<TrickSearch
  mode="wishlist"
  categories={[
    { name: "Parkour", slug: "parkour", color: "#3b82f6" },
    { name: "Tricking", slug: "tricking", color: "#ec4899" },
  ]}
/>
```

## 🚀 Next Steps

1. ✅ Run database migration
2. ✅ Add `<Wishlist />` to your dashboard
3. ✅ Test adding/removing tricks
4. ✅ Customize styling if needed
5. ✅ Deploy and celebrate! 🎉

---

**Need Help?** Check the full documentation files or review the example implementations.
