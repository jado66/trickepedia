// components/prerequisites-form-field.tsx
// Enhanced prerequisite_ids field with autocomplete for existing tricks

"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Plus,
  Trash2,
  Search,
  Check,
  Filter,
  ExternalLink,
} from "lucide-react";
import { searchPotentialPrerequisites } from "@/lib/client/tricks-data-client";
import { PrerequisitesDisplay } from "./prerequisites-display"; // NEW: Import for display
import { PrerequisiteTrick } from "@/types/trick";
import { supabase } from "@/utils/supabase/client";

interface PrerequisitesFormFieldProps {
  prerequisite_ids: string[];
  prerequisiteTricks?: PrerequisiteTrick[]; // NEW: For displaying names/links instead of UUIDs
  onChange: (prerequisite_ids: string[]) => void;
  subcategoryId?: string;
  currentTrickId?: string;
  currentCategorySlug?: string; // Add current category info
  currentCategoryName?: string; // Add current category name
}

export function PrerequisitesFormField({
  prerequisite_ids,
  prerequisiteTricks = [], // NEW: Default to empty array
  onChange,
  subcategoryId,
  currentTrickId,
  currentCategorySlug,
  currentCategoryName,
}: PrerequisitesFormFieldProps) {
  const [inputValue, setInputValue] = useState("");
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<
    {
      id: string;
      name: string;
      slug: string;
      category: string;
      categorySlug: string;
      subcategory: string;
      subcategorySlug: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [searchOnlyInCategory, setSearchOnlyInCategory] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>(null);

  // Fetch trick suggestions when input changes with better debouncing
  useEffect(() => {
    if (!supabase) {
      return;
    }

    // Clear existing timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Don't search for very short inputs
    if (inputValue.length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    // Show loading immediately for better UX
    setLoading(true);

    // Set new timeout with shorter delay for better responsiveness
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await searchPotentialPrerequisites(
          supabase,
          inputValue,
          subcategoryId,
          currentTrickId,
          searchOnlyInCategory ? currentCategorySlug : undefined // Pass category filter
        );
        setSuggestions(data);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 150); // Reduced from 300ms to 150ms for better responsiveness

    // Cleanup function
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [
    inputValue,
    subcategoryId,
    currentTrickId,
    searchOnlyInCategory,
    currentCategorySlug,
    supabase,
  ]);

  // Only allow adding by UUID from suggestions
  const addPrerequisite = (id: string) => {
    if (id && !prerequisite_ids.includes(id)) {
      onChange([...prerequisite_ids, id]);
      setInputValue("");
      setOpen(false);
    }
  };

  const removePrerequisite = (index: number) => {
    onChange(prerequisite_ids.filter((_, i) => i !== index));
  };

  // NEW: Filter prerequisiteTricks to only include those in prerequisite_ids
  const selectedPrerequisiteTricks = prerequisiteTricks.filter((trick) =>
    prerequisite_ids.includes(trick.id)
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium">Prerequisites</Label>
        {prerequisite_ids.filter((prereq) => prereq.trim() !== "").length >
          0 && (
          <Badge variant="secondary" className="text-xs">
            {prerequisite_ids.filter((prereq) => prereq.trim() !== "").length}
          </Badge>
        )}
      </div>

      {/* Category filter toggle */}
      {currentCategorySlug && currentCategoryName && (
        <div className="flex items-center space-x-2 p-3 bg-muted/30 rounded-lg">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Switch
            id="category-filter"
            checked={searchOnlyInCategory}
            onCheckedChange={setSearchOnlyInCategory}
          />
          <Label htmlFor="category-filter" className="text-sm cursor-pointer">
            Search only within{" "}
            <span className="font-medium">{currentCategoryName}</span>
          </Label>
        </div>
      )}

      <div className="space-y-2">
        {/* NEW: Display existing prerequisites with names and links instead of UUIDs */}
        {selectedPrerequisiteTricks.length > 0 ? (
          <PrerequisitesDisplay
            prerequisiteTricks={selectedPrerequisiteTricks}
            prerequisite_ids={prerequisite_ids}
            className="mb-4"
          />
        ) : null}

        {/* Add new prerequisite with autocomplete (only allow selecting from suggestions) */}
        <div className="flex gap-2">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <div className="flex-1 relative">
                <Input
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    if (e.target.value.length >= 2) {
                      setOpen(true);
                    }
                  }}
                  onFocus={() => {
                    if (inputValue.length >= 2) {
                      setOpen(true);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setOpen(false);
                    }
                  }}
                  placeholder="Search for existing tricks..."
                  className="pr-10"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </PopoverTrigger>
            <PopoverContent
              className="w-[var(--radix-popover-trigger-width)] p-0"
              align="start"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              {loading ? (
                <div className="p-4 text-sm text-muted-foreground">
                  Searching...
                </div>
              ) : suggestions.length > 0 ? (
                <Command>
                  <CommandGroup>
                    {suggestions.map((trick) => (
                      <CommandItem
                        key={trick.id}
                        onSelect={() => {
                          addPrerequisite(trick.id);
                        }}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center w-full">
                          <Check
                            className={`mr-2 h-4 w-4 flex-shrink-0 ${
                              prerequisite_ids.includes(trick.id)
                                ? "opacity-100"
                                : "opacity-0"
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">
                              {trick.name}
                            </div>
                            {!searchOnlyInCategory && (
                              <div className="text-xs text-muted-foreground truncate">
                                <span
                                  className="inline-block w-2 h-2 rounded-full mr-1"
                                  style={{ backgroundColor: "#6b7280" }}
                                />
                                {trick.category} → {trick.subcategory}
                              </div>
                            )}
                          </div>
                          <ExternalLink className="h-4 w-4 text-muted-foreground ml-2 flex-shrink-0" />{" "}
                          {/* NEW: Add link icon for clarity */}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              ) : inputValue.length >= 2 ? (
                <div className="p-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    No existing tricks found. Only published tricks can be
                    prerequisites.
                  </p>
                </div>
              ) : null}
            </PopoverContent>
          </Popover>
        </div>

        <p className="text-xs text-muted-foreground">
          Add prerequisites by searching and selecting published tricks. Custom
          strings are not allowed.
          {searchOnlyInCategory && currentCategoryName && (
            <>
              {" "}
              Currently searching only within{" "}
              <span className="font-medium">{currentCategoryName}</span>.
            </>
          )}{" "}
          Only published tricks can be prerequisites.
        </p>
      </div>
    </div>
  );
}
