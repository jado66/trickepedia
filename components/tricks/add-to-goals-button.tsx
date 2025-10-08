"use client";

import { useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/contexts/wishlist-context";
import { Heart, Check } from "lucide-react";

interface AddToGoalsButtonProps {
  trick: {
    id: string;
    name: string;
    slug?: string;
    subcategory?: any; // carries nested category for optimistic display
  };
  className?: string;
  size?: "sm" | "default" | "lg" | "icon";
  variant?:
    | "default"
    | "outline"
    | "link"
    | "destructive"
    | "secondary"
    | "ghost";
  label?: string;
}

/**
 * AddToGoalsButton
 * Client-side button that adds the current trick to the user's wishlist ("goal" tricks).
 * Uses optimistic data so the wishlist immediately has name + category without a refetch.
 */
export function AddToGoalsButton({
  trick,
  className,
  size = "sm",
  variant = "outline",
  label = "Add to Goals",
}: AddToGoalsButtonProps) {
  const { items, add, adding } = useWishlist();

  const alreadyInGoals = useMemo(
    () => items.some((t) => t.id === trick.id),
    [items, trick.id]
  );

  const isAdding = adding[trick.id];

  const handleAdd = useCallback(async () => {
    if (alreadyInGoals || isAdding) return;
    await add(trick.id, {
      name: trick.name,
      slug: trick.slug,
      subcategory: trick.subcategory,
    });
  }, [alreadyInGoals, isAdding, add, trick]);

  return (
    <Button
      type="button"
      size={size}
      variant={alreadyInGoals ? "secondary" : variant}
      disabled={alreadyInGoals || isAdding}
      onClick={handleAdd}
      className={["inline-flex items-center gap-1", className]
        .filter(Boolean)
        .join(" ")}
    >
      {alreadyInGoals ? (
        <Check className="h-4 w-4" />
      ) : (
        <Heart
          className={["h-4 w-4", isAdding && "animate-pulse"]
            .filter(Boolean)
            .join(" ")}
        />
      )}
      <span>
        {alreadyInGoals ? "In Goals" : isAdding ? "Adding..." : label}
      </span>
    </Button>
  );
}
