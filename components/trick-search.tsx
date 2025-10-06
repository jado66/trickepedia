"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
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

interface TrickSearchProps {
  categories?: Array<{ name: string; slug: string; color?: string }>;
  /**
   * Variant controls the trigger style.
   * - default: full (desktop) button with text label
   * - icon: circular icon button (mobile, matches NotificationBell styling)
   */
  variant?: "default" | "icon";
}

export function TrickSearch({
  categories = [],
  variant = "default",
}: TrickSearchProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Trick[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const searchTricks = useCallback(
    async (query: string, category?: string) => {
      if (!supabase) return;

      if (!query.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const { tricks } = await getTricks(supabase, {
          search: query,
          category: category || undefined,
          limit: 8,
        });
        setResults(tricks);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      searchTricks(search, selectedCategory || undefined);
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
    const categorySlug = trick.subcategory?.master_category?.slug;
    const subcategorySlug = trick.subcategory?.slug;
    router.push(`/${categorySlug}/${subcategorySlug}/${trick.slug}`);
    setOpen(false);
    setSearch("");
    setResults([]);
  };

  // ICON VARIANT (mobile popover, existing behavior)
  if (variant === "icon") {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            aria-label="Search tricks"
            className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-blue-400 dark:focus:ring-offset-gray-800 rounded-full transition-colors"
          >
            <Search className="h-5 w-5" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[90vw] md:w-[480px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search tricks..."
              value={search}
              onValueChange={setSearch}
              onFocus={() => setOpen(true)}
            />
            {categories.length > 0 && (
              <div className="flex gap-1 px-3 py-2 border-b overflow-x-auto">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  size="sm"
                  className="h-6 text-xs shrink-0"
                  onClick={() => setSelectedCategory(null)}
                >
                  All
                </Button>
                {categories.map((cat) => {
                  const isActive = selectedCategory === cat.slug;
                  const color = cat.color;
                  return (
                    <Button
                      key={cat.slug}
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      className="h-6 text-xs shrink-0 transition-colors"
                      style={
                        color
                          ? isActive
                            ? { backgroundColor: color, borderColor: color }
                            : { borderColor: color, color: color }
                          : undefined
                      }
                      onClick={() => setSelectedCategory(cat.slug)}
                    >
                      {cat.name}
                    </Button>
                  );
                })}
              </div>
            )}
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
                  {results.map((trick) => (
                    <CommandItem
                      key={trick.id}
                      value={trick.id}
                      onSelect={() => handleSelectTrick(trick)}
                      className="group flex items-center justify-between gap-2"
                    >
                      <span className="truncate transition-colors group-hover:text-muted group-aria-selected:text-muted">
                        {trick.name}
                      </span>
                      <Badge
                        variant="accent"
                        className="shrink-0 text-[10px] font-medium border transition-colors group-hover:bg-background group-hover:text-accent group-hover:border-accent"
                      >
                        {trick.subcategory?.master_category?.name}
                      </Badge>
                    </CommandItem>
                  ))}
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
          placeholder="Search tricks..."
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
        />
        {loading && (
          <span className="animate-spin h-4 w-4 rounded-full border-[2px] border-muted-foreground/30 border-t-muted-foreground" />
        )}
      </div>
      {open && (
        <div className="absolute left-0 right-0 mt-1 z-50 rounded-md border bg-popover text-popover-foreground shadow-md overflow-hidden">
          {categories.length > 0 && (
            <div className="flex gap-1 px-3 py-2 border-b overflow-x-auto">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                className="h-6 text-xs shrink-0"
                onClick={() => setSelectedCategory(null)}
              >
                All
              </Button>
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.slug;
                const color = cat.color;
                return (
                  <Button
                    key={cat.slug}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    className="h-6 text-xs shrink-0 transition-colors"
                    style={
                      color
                        ? isActive
                          ? { backgroundColor: color, borderColor: color }
                          : { borderColor: color, color: color }
                        : undefined
                    }
                    onClick={() => setSelectedCategory(cat.slug)}
                  >
                    {cat.name}
                  </Button>
                );
              })}
            </div>
          )}
          <div className="max-h-80 overflow-y-auto p-1">
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
                  {results.map((trick) => (
                    <li
                      key={trick.id}
                      onClick={() => handleSelectTrick(trick)}
                      className="group flex items-center justify-between gap-2 px-2 py-2 rounded-sm cursor-pointer hover:bg-accent focus:bg-accent focus:outline-none transition-colors"
                    >
                      <span className="truncate text-sm font-medium transition-colors group-hover:text-muted group-aria-selected:text-muted">
                        {trick.name}
                      </span>
                      <Badge
                        variant="accent"
                        className="shrink-0 text-[10px] font-medium border transition-colors group-hover:bg-background group-hover:text-accent group-hover:border-accent"
                      >
                        {trick.subcategory?.master_category?.name}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
