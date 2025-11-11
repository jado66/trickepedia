"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight, Settings } from "lucide-react";
import { PermissionGate } from "@/components/permission-gate";
import type { MasterCategory } from "@/lib/types/database";
import { iconMap } from "@/components/side-nav";
import { getCategoryImage } from "@/components/category/category-images";

interface CategoriesSearchProps {
  categories: MasterCategory[];
}

export function CategoriesSearch({ categories }: CategoriesSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getIconComponent = (iconName: string) => {
    return iconMap[iconName] || iconMap.circle;
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-balance mb-4">
            Movement Disciplines
          </h1>
          <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto mb-8">
            Explore different movement disciplines and discover techniques to
            master your craft.
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="search"
              placeholder="Search disciplines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/50 border-border"
            />
          </div>
        </div>

        {/* Categories Grid (image cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCategories.map((category) => {
            const IconComponent = getIconComponent(
              category.icon_name || "circle"
            );
            const visual = getCategoryImage(category.slug);
            return (
              <Link
                key={category.id}
                href={`/${category.slug}`}
                className="group"
              >
                <Card className="relative overflow-hidden h-72 flex flex-col justify-end border-2 hover:border-primary transition-all duration-300">
                  {/* Background image */}
                  {visual ? (
                    <>
                      <img
                        src={visual.image}
                        alt={category.name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
                    </>
                  ) : (
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{
                        backgroundColor: category.color || "hsl(var(--muted))",
                      }}
                    >
                      <IconComponent className="h-16 w-16 text-white/80" />
                    </div>
                  )}

                  {/* Content overlay */}
                  <div className="relative z-10 p-6">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="secondary" className="text-xs">
                        {category.trick_count}{" "}
                        {category.move_name
                          ? `${category.move_name}s`
                          : "tricks"}
                      </Badge>
                      <ArrowRight className="h-4 w-4 text-white/80 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <h3 className="text-2xl font-semibold text-white mb-2">
                      {category.name}
                    </h3>
                    <p className="text-white/90 text-sm line-clamp-2 mb-4">
                      {category.description}
                    </p>
                    <div className="inline-flex items-center text-white text-sm font-medium gap-2">
                      Explore
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}

          {/* Management Card - Only visible to moderators/admins */}
          <PermissionGate requireModerator>
            <Link href="/admin/manage-sports" className="group">
              <Card className="relative overflow-hidden h-72 flex flex-col justify-end border-2 hover:border-primary transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 opacity-80 group-hover:opacity-70 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Settings className="h-16 w-16 text-white/60" />
                </div>
                <div className="relative z-10 p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="secondary" className="text-xs">
                      Admin Tools
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-white/80 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-2">
                    Manage Sports & Disciplines
                  </h3>
                  <p className="text-white/90 text-sm line-clamp-2 mb-4">
                    Add, edit, and organize movement disciplines
                  </p>
                  <div className="inline-flex items-center text-white text-sm font-medium gap-2">
                    Open Admin
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Card>
            </Link>
          </PermissionGate>
        </div>

        {filteredCategories.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No disciplines found matching &quot;{searchQuery}&quot;
            </p>
            <Button
              variant="outline"
              onClick={() => setSearchQuery("")}
              className="mt-4"
            >
              Clear Search
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
