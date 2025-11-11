// Example usage of the Wishlist feature components
// This file demonstrates different ways to integrate the wishlist functionality

import { useState } from "react";
import { TrickSearch } from "@/components/trick-search";
import { Wishlist } from "@/components/wishlist";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

/**
 * Example 1: Basic Wishlist Display (User Dashboard)
 * Shows the wishlist component with built-in add functionality
 */
export function UserDashboardExample() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Dashboard</h1>

      {/* The Wishlist component includes everything needed */}
      <Wishlist />
    </div>
  );
}

/**
 * Example 2: Standalone Trick Search (Wishlist Mode)
 * Use when you want a dedicated search interface for adding to wishlist
 */
export function WishlistSearchPageExample() {
  const handleTrickAdded = (trickId: string) => {
    console.log("Trick added to wishlist:", trickId);
    // Optional: Navigate somewhere, show success message, etc.
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Add to Wishlist</h1>
      <p className="text-muted-foreground mb-6">
        Search for tricks you want to learn and add them to your wishlist
      </p>

      <TrickSearch
        mode="wishlist"
        variant="default"
        onAddToWishlist={handleTrickAdded}
      />
    </div>
  );
}

/**
 * Example 3: Navigate Mode (Default behavior)
 * Standard search that navigates to trick pages
 */
export function StandardSearchExample() {
  return (
    <div className="container mx-auto p-6">
      <div className="max-w-md">
        <TrickSearch mode="navigate" variant="default" />
      </div>
    </div>
  );
}

/**
 * Example 4: Mobile Header with Icon Search
 * Compact search icon for mobile navigation
 */
export function MobileHeaderExample() {
  return (
    <header className="flex items-center justify-between p-4 border-b">
      <h1 className="text-xl font-bold">Trickipedia</h1>

      <div className="flex items-center gap-2">
        {/* Icon variant for mobile */}
        <TrickSearch variant="icon" mode="navigate" />
        {/* Other header icons... */}
      </div>
    </header>
  );
}

/**
 * Example 5: Trick Detail Page with "Add to Wishlist" Button
 * Shows how to add a specific trick to wishlist without search
 */
export function TrickDetailPageExample({ trick }: { trick: any }) {
  const [isInWishlist, setIsInWishlist] = useState(false);

  const handleAddToWishlist = async () => {
    // You can use the wishlist-client functions directly
    const { supabase } = await import("@/utils/supabase/client");
    const { addToWishlist } = await import("@/lib/client/wishlist-client");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const result = await addToWishlist(supabase, user.id, trick.id);
    if (result.success) {
      setIsInWishlist(true);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">{trick.name}</h1>

      <Button onClick={handleAddToWishlist} disabled={isInWishlist}>
        <Heart className={isInWishlist ? "fill-current" : ""} />
        {isInWishlist ? "In Wishlist" : "Add to Wishlist"}
      </Button>

      {/* Rest of trick details... */}
    </div>
  );
}

/**
 * Example 6: Using Wishlist API Functions Directly
 * Advanced usage for custom implementations
 */
export async function DirectAPIUsageExample() {
  const { supabase } = await import("@/utils/supabase/client");
  const {
    addToWishlist,
    removeFromWishlist,
    getWishlist,
    isInWishlist,
    getWishlistCount,
  } = await import("@/lib/client/wishlist-client");

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  // Add a trick
  await addToWishlist(supabase, user.id, "trick-uuid-123");

  // Check if in wishlist
  const inWishlist = await isInWishlist(supabase, user.id, "trick-uuid-123");
  console.log("In wishlist?", inWishlist);

  // Get all wishlist tricks
  const { tricks } = await getWishlist(supabase, user.id);
  console.log("Wishlist:", tricks);

  // Get wishlist count
  const count = await getWishlistCount(supabase, user.id);
  console.log("Wishlist count:", count);

  // Remove from wishlist
  await removeFromWishlist(supabase, user.id, "trick-uuid-123");
}

/**
 * Example 7: Category-Filtered Wishlist Search
 * Pass categories to enable filtering
 */
export function CategoryFilteredSearchExample() {
  const categories = [
    { name: "Parkour", slug: "parkour", color: "#3b82f6" },
    { name: "Tricking", slug: "tricking", color: "#ec4899" },
    { name: "Gymnastics", slug: "gymnastics", color: "#8b5cf6" },
  ];

  return (
    <div className="container mx-auto p-6">
      <TrickSearch mode="wishlist" variant="default" categories={categories} />
    </div>
  );
}
