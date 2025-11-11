"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, SortAsc, SortDesc } from "lucide-react";
import { TrickCard } from "./trick-card";
import { AddTrickCard } from "./add-trick-card";
import { Trick } from "@/types/trick";

interface TricksListProps {
  tricks: Trick[];
  categorySlug: string;
  subcategorySlug: string;
  subcategoryName: string;
  difficultyLabels: Record<number, string>;
  difficultyColors: Record<number, string>;
}

type SortOption = "difficulty" | "alphabetical";
type SortOrder = "asc" | "desc";

export function TricksList({
  tricks,
  categorySlug,
  subcategorySlug,
  subcategoryName,
  difficultyLabels,
  difficultyColors,
}: TricksListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("difficulty");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Filter and sort tricks
  const filteredAndSortedTricks = useMemo(() => {
    // First filter by search term
    let filtered = tricks;
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = tricks.filter(
        (trick) =>
          trick.name.toLowerCase().includes(searchLower) ||
          trick.description?.toLowerCase().includes(searchLower) ||
          trick.tags?.some((tag) => tag.toLowerCase().includes(searchLower)) ||
          trick.tips_and_tricks?.toLowerCase().includes(searchLower)
      );
    }

    // Then sort
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;

      if (sortBy === "difficulty") {
        comparison = (a.difficulty_level || 0) - (b.difficulty_level || 0);
      } else if (sortBy === "alphabetical") {
        comparison = a.name.localeCompare(b.name);
      }

      return sortOrder === "desc" ? -comparison : comparison;
    });

    return sorted;
  }, [tricks, searchTerm, sortBy, sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder((current) => (current === "asc" ? "desc" : "asc"));
  };

  if (tricks.length === 0) {
    return (
      <div>
        <p className="text-muted-foreground text-lg mb-4">
          No tricks found for {subcategoryName}.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AddTrickCard
            categorySlug={categorySlug}
            subcategorySlug={subcategorySlug}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header with sorting and search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold">
          {filteredAndSortedTricks.length} Tricks
        </h2>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search tricks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2">
            <Select
              value={sortBy}
              onValueChange={(value: SortOption) => setSortBy(value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="difficulty">Difficulty</SelectItem>
                <SelectItem value="alphabetical">A-Z</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={toggleSortOrder}
              className="px-3"
            >
              {sortOrder === "asc" ? (
                <SortAsc className="h-4 w-4" />
              ) : (
                <SortDesc className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Tricks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedTricks.length > 0 ? (
          <>
            {filteredAndSortedTricks.map((trick) => (
              <TrickCard
                key={trick.id}
                trick={trick}
                categorySlug={categorySlug}
                subcategorySlug={subcategorySlug}
                difficultyLabels={difficultyLabels}
                difficultyColors={difficultyColors}
              />
            ))}

            {/* Add New Trick Card */}
            <AddTrickCard
              categorySlug={categorySlug}
              subcategorySlug={subcategorySlug}
            />
          </>
        ) : (
          <div className="col-span-full text-center py-8 space-y-4">
            <p className="text-muted-foreground text-lg">
              No tricks found matching &quot;{searchTerm}&quot;
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Button variant="outline" onClick={() => setSearchTerm("")}>
                Clear search
              </Button>
              <Button asChild>
                <Link
                  href={`/${categorySlug}/add-trick?subcategory=${subcategorySlug}`}
                >
                  Add Trick
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
