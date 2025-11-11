"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Heart, Check, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import type { Trick } from "@/types/trick";
import { getTricks } from "@/lib/client/tricks-data-client";
import { supabase } from "@/utils/supabase/client";
import { addToWishlist } from "@/lib/client/wishlist-client";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/user-provider"; // NEW
import { useUserProgress } from "@/contexts/user-progress-provider";

interface TrickSearchProps {
  categories?: Array<{ name: string; slug: string; color?: string }>;
  /**
   * Variant controls the trigger style.
   * - default: full (desktop) button with text label
   * - icon: circular icon button (mobile, matches NotificationBell styling)
   */
  variant?: "default" | "icon";
  /**
   * Mode controls the behavior.
   * - navigate: clicking a trick navigates to its page (default)
   * - wishlist: clicking a trick adds it to the wishlist
   * - select: clicking a trick toggles selection (multi-select)
   */
  mode?: "navigate" | "wishlist" | "select";
  /**
   * Callback when a trick is added to wishlist (only used in wishlist mode)
   */
  onAddToWishlist?: (trickId: string) => void;
  /**
   * Selected tricks set (only used in select mode)
   */
  selectedTricks?: Set<string>;
  /**
   * Callback when a trick is toggled (only used in select mode)
   */
  onToggleTrick?: (trickId: string) => void;
}

export function TrickSearch({
  categories = [],
  variant = "default",
  mode = "navigate",
  onAddToWishlist,
  selectedTricks = new Set(),
  onToggleTrick,
}: TrickSearchProps) {
  const { userCategories } = useUser(); // NEW
  // Only ever show the user's own categories; ignore categories prop to avoid leaking others
  const effectiveCategories = useMemo(
    () =>
      userCategories.map((c) => ({
        name: c.name,
        slug: c.slug,
        color: c.color || undefined,
      })),
    [userCategories]
  ); // NEW
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Trick[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null); // UPDATED default null
  const userSetSelectionRef = useRef(false); // NEW: track if user has manually chosen
  const lastSignatureRef = useRef<string>(""); // NEW: prevent duplicate fetches
  const currentFetchIdRef = useRef(0); // NEW: race protection
  const [loading, setLoading] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState<
    Record<string, boolean>
  >({});
  const router = useRouter();
  const { toast } = useToast();
  const { userCanDoTricks } = useUserProgress();
  // Visible result count target & pool size multiplier when filtering mastered tricks
  const VISIBLE_LIMIT = 12;
  const RAW_MULTIPLIER = mode === "wishlist" || mode === "select" ? 3 : 1; // fetch more to compensate for filtering

  useEffect(() => {
    // Determine default selection only once (unless categories shape changes drastically)
    if (userSetSelectionRef.current) return; // don't override user choice

    if (effectiveCategories.length === 1) {
      if (selectedCategory !== effectiveCategories[0].slug) {
        setSelectedCategory(effectiveCategories[0].slug);
      }
    } else if (effectiveCategories.length > 1) {
      // Use aggregate 'My Sports' sentinel when multiple categories
      if (selectedCategory === null) {
        setSelectedCategory("__MY_SPORTS__");
      }
    } else {
      // No categories -> leave null (All)
      if (selectedCategory !== null) setSelectedCategory(null);
    }
  }, [effectiveCategories, selectedCategory]);

  const searchTricks = useCallback(
    async (query: string, categoryFilter: string | null) => {
      if (!supabase) return;
      const trimmed = query.trim();
      const signature = `${trimmed}|${categoryFilter || "__ALL__"}`;
      if (trimmed === "") {
        setResults([]);
        lastSignatureRef.current = signature;
        return;
      }
      // Skip if same signature already fetched (prevents re-trigger loops from stable deps)
      if (signature === lastSignatureRef.current) return;
      lastSignatureRef.current = signature;

      const fetchId = ++currentFetchIdRef.current;
      setLoading(true);
      try {
        if (categoryFilter === "__MY_SPORTS__") {
          const categorySlugs = effectiveCategories.map((c) => c.slug);
          if (categorySlugs.length === 0) {
            setResults([]);
            return;
          }
          const desiredPool = VISIBLE_LIMIT * RAW_MULTIPLIER;
          const perCategoryLimit = Math.max(
            2,
            Math.ceil(desiredPool / Math.max(1, categorySlugs.length))
          );
          const responses = await Promise.all(
            categorySlugs.map((slug) =>
              getTricks(supabase, {
                search: trimmed,
                category: slug,
                limit: perCategoryLimit,
              }).catch(() => ({ tricks: [] }))
            )
          );
          if (fetchId !== currentFetchIdRef.current) return; // stale
          const merged: Trick[] = [];
          const seen = new Set<string>();
          for (const r of responses) {
            for (const t of r.tricks) {
              if (!seen.has(t.id)) {
                seen.add(t.id);
                merged.push(t);
              }
            }
          }
          // Filter mastered BEFORE slicing so we can fill up list
          let pool = merged;
          if (
            (mode === "wishlist" || mode === "select") &&
            userCanDoTricks.size > 0
          ) {
            pool = pool.filter((t) => !userCanDoTricks.has(t.id));
          }
          pool.sort(
            (a, b) => (a.difficulty_level || 0) - (b.difficulty_level || 0)
          );
          setResults(pool.slice(0, VISIBLE_LIMIT));
        } else {
          const { tricks } = await getTricks(supabase, {
            search: trimmed,
            category: categoryFilter || undefined, // null -> global
            limit: VISIBLE_LIMIT * RAW_MULTIPLIER,
          });
          if (fetchId !== currentFetchIdRef.current) return; // stale
          let pool = tricks;
          if (
            (mode === "wishlist" || mode === "select") &&
            userCanDoTricks.size > 0
          ) {
            pool = pool.filter((t) => !userCanDoTricks.has(t.id));
          }
          setResults(pool.slice(0, VISIBLE_LIMIT));
        }
      } catch (error) {
        console.error("Search error:", error);
        if (fetchId === currentFetchIdRef.current) setResults([]);
      } finally {
        if (fetchId === currentFetchIdRef.current) setLoading(false);
      }
    },
    [effectiveCategories]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      searchTricks(search, selectedCategory);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedCategory, searchTricks]);

  // DEFAULT VARIANT (desktop inline input with dropdown results)
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (search.length > 0) setOpen(true);
  }, [search]);

  const handleSelectTrick = (trick: Trick) => {
    if (mode === "select") {
      onToggleTrick?.(trick.id);
    } else if (mode === "wishlist") {
      handleAddToWishlist(trick);
    } else {
      const categorySlug = trick.subcategory?.master_category?.slug;
      const subcategorySlug = trick.subcategory?.slug;
      router.push(`/${categorySlug}/${subcategorySlug}/${trick.slug}`);
      setOpen(false);
      setSearch("");
      setResults([]);
    }
  };

  const handleAddToWishlist = async (trick: Trick) => {
    if (!supabase) {
      toast({
        title: "Error",
        description: "Not connected to database",
        variant: "destructive",
      });
      return;
    }

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add tricks to your wishlist",
        variant: "destructive",
      });
      return;
    }

    setAddingToWishlist((prev) => ({ ...prev, [trick.id]: true }));

    try {
      const result = await addToWishlist(supabase, user.id, trick.id);

      if (result.success) {
        toast({
          title: "Added to wishlist",
          description: `"${trick.name}" has been added to your wishlist`,
        });
        onAddToWishlist?.(trick.id);

        // Don't close the search in wishlist mode so they can add more
        if (mode !== "wishlist") {
          setOpen(false);
          setSearch("");
          setResults([]);
        }
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Failed to add to wishlist:", error);
      toast({
        title: "Error",
        description: "Failed to add trick to wishlist",
        variant: "destructive",
      });
    } finally {
      setAddingToWishlist((prev) => ({ ...prev, [trick.id]: false }));
    }
  };

  const handleSelectCategory = (value: string | null) => {
    userSetSelectionRef.current = true;
    setSelectedCategory(value);
  };

  const renderCategoryFilter = () => {
    if (effectiveCategories.length === 0) {
      return null;
    }

    const multiple = effectiveCategories.length > 1;

    return (
      <div className="flex items-center gap-2 px-3 py-2 border-b">
        <div className="flex gap-1 overflow-x-auto">
          {multiple && (
            <Button
              variant={
                selectedCategory === "__MY_SPORTS__" ? "default" : "outline"
              }
              size="sm"
              className="h-7 text-xs shrink-0"
              onClick={() => handleSelectCategory("__MY_SPORTS__")}
            >
              My Sports
            </Button>
          )}
          {effectiveCategories.map((cat) => {
            const isActive = selectedCategory === cat.slug;
            return (
              <Button
                key={cat.slug}
                variant={isActive ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs shrink-0"
                onClick={() => handleSelectCategory(cat.slug)}
              >
                {cat.name}
              </Button>
            );
          })}
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            className="h-7 text-xs shrink-0 gap-1"
            onClick={() => handleSelectCategory(null)}
          >
            <Globe className="h-3 w-3" />
            All
          </Button>
        </div>
      </div>
    );
  };

  // ICON VARIANT (mobile popover, existing behavior)
  if (variant === "icon") {
    const placeholder =
      mode === "select"
        ? "Search tricks to select..."
        : mode === "wishlist"
        ? "Search tricks to add to wishlist..."
        : selectedCategory === "__MY_SPORTS__"
        ? "Search my sports..."
        : selectedCategory === null
        ? "Search all tricks..."
        : "Search tricks...";

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            aria-label={
              mode === "wishlist"
                ? "Search tricks for wishlist"
                : "Search tricks"
            }
            className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-blue-400 dark:focus:ring-offset-gray-800 rounded-full transition-colors"
          >
            <Search className="h-5 w-5" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[90vw] md:w-[480px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={placeholder}
              value={search}
              onValueChange={setSearch}
              onFocus={() => setOpen(true)}
            />
            {renderCategoryFilter()}
            <CommandList>
              {loading && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Searching...
                </div>
              )}
              {!loading && results.length === 0 && (
                <CommandEmpty>
                  {search ? "No tricks found." : "Start typing to search..."}
                </CommandEmpty>
              )}
              {!loading && results.length > 0 && (
                <CommandGroup heading="Tricks">
                  {results.map((trick) => {
                    const isSelected = selectedTricks.has(trick.id);
                    return (
                      <CommandItem
                        key={trick.id}
                        value={trick.id}
                        onSelect={() => handleSelectTrick(trick)}
                        className="group flex items-center justify-between gap-2"
                      >
                        <span className="truncate transition-colors group-hover:text-muted group-aria-selected:text-muted">
                          {trick.name}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge
                            variant="accent"
                            className="text-[10px] font-medium border transition-colors group-hover:bg-background group-hover:text-accent group-hover:border-accent"
                          >
                            {trick.subcategory?.master_category?.name}
                          </Badge>
                          {mode === "wishlist" && (
                            <div className="flex items-center gap-1">
                              {addingToWishlist[trick.id] ? (
                                <div className="animate-spin h-4 w-4 rounded-full border-[2px] border-muted-foreground/30 border-t-muted-foreground" />
                              ) : (
                                <Heart className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                          )}
                          {mode === "select" && (
                            <div
                              className={`flex items-center justify-center h-5 w-5 rounded border-2 transition-colors ${
                                isSelected
                                  ? "bg-primary border-primary"
                                  : "border-muted-foreground/50"
                              }`}
                            >
                              {isSelected && (
                                <Check className="h-3 w-3 text-primary-foreground" />
                              )}
                            </div>
                          )}
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="flex items-center gap-2 h-10 px-3 rounded-md border bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition-shadow">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder={
            mode === "select"
              ? "Search tricks to select..."
              : mode === "wishlist"
              ? "Search tricks to add to wishlist..."
              : selectedCategory === "__MY_SPORTS__"
              ? "Search my sports..."
              : selectedCategory === null
              ? "Search all tricks..."
              : "Search tricks..."
          }
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
        />
        {loading && (
          <span className="animate-spin h-4 w-4 rounded-full border-[2px] border-muted-foreground/30 border-t-muted-foreground" />
        )}
      </div>
      {open && (
        <div className="absolute left-0 right-0 mt-1 z-[100] rounded-md border bg-popover text-popover-foreground shadow-md overflow-hidden max-h-[400px] flex flex-col">
          {renderCategoryFilter()}
          <div className="max-h-80 overflow-y-auto p-1 flex-1">
            {loading && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Searching...
              </div>
            )}
            {!loading && results.length === 0 && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {search ? "No tricks found." : "Start typing to search..."}
              </div>
            )}
            {!loading && results.length > 0 && (
              <div className="py-1">
                <p className="px-2 pb-2 pt-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Tricks
                </p>
                <ul className="space-y-1">
                  {results.map((trick) => {
                    const isSelected = selectedTricks.has(trick.id);
                    return (
                      <li
                        key={trick.id}
                        onClick={() => handleSelectTrick(trick)}
                        className="group flex items-center justify-between gap-2 px-2 py-2 rounded-sm cursor-pointer hover:bg-accent focus:bg-accent focus:outline-none transition-colors"
                      >
                        <span className="truncate text-sm font-medium transition-colors group-hover:text-muted group-aria-selected:text-muted">
                          {trick.name}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge
                            variant="accent"
                            className="text-[10px] font-medium border transition-colors group-hover:bg-background group-hover:text-accent group-hover:border-accent"
                          >
                            {trick.subcategory?.master_category?.name}
                          </Badge>
                          {mode === "wishlist" && (
                            <div className="flex items-center gap-1">
                              {addingToWishlist[trick.id] ? (
                                <div className="animate-spin h-4 w-4 rounded-full border-[2px] border-muted-foreground/30 border-t-muted-foreground" />
                              ) : (
                                <Heart className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                          )}
                          {mode === "select" && (
                            <div
                              className={`flex items-center justify-center h-5 w-5 rounded border-2 transition-colors ${
                                isSelected
                                  ? "bg-primary border-primary"
                                  : "border-muted-foreground/50"
                              }`}
                            >
                              {isSelected && (
                                <Check className="h-3 w-3 text-primary-foreground" />
                              )}
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
