"use client";

import {
  Loader2,
  ChevronRight,
  Info,
  HandHeart,
  HelpCircle,
  ShieldCheck,
  UserCog,
  User,
  LogIn,
  UserPlus,
  LogOut,
  Network,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useNavigation } from "@/contexts/navigation-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { useUser } from "@/contexts/user-provider";
import { iconMap } from "./icon-map";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";

// Desktop version re-styled to mimic mobile list appearance
export function DesktopSideNav({ onItemClick }: { onItemClick?: () => void }) {
  const router = useRouter();
  const { user, signOut, hasModeratorAccess, hasAdminAccess } = useUser();
  const {
    categories,
    isLoading,
    error,
    loadSubcategories,
    loadTricks,
    expandedItems,
    setExpandedItems,
  } = useNavigation();

  const selectedIds: string[] = (user as any)?.users_sports_ids || [];
  // Show ONLY the user's selected categories if any exist; otherwise default to active categories.
  const displayCategories = selectedIds.length
    ? categories.filter((c: any) => selectedIds.includes(c.id))
    : categories.filter((c: any) => {
        const hasExplicit = c.is_active !== undefined;
        const isActive = hasExplicit ? c.is_active : c.status !== "hidden";
        return isActive;
      });

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    onItemClick?.();
  };

  const toggleExpanded = (
    id: string,
    isMasterCategory = false,
    categorySlug?: string,
    subcategorySlug?: string
  ) => {
    if (isMasterCategory && categorySlug) {
      setExpandedItems((prev) => {
        const ns = new Set(prev);
        if (ns.has(id)) {
          ns.delete(id);
          return ns;
        }
        loadSubcategories(categorySlug);
        return new Set([id]);
      });
    } else {
      setExpandedItems((prev) => {
        const ns = new Set(prev);
        if (ns.has(id)) ns.delete(id);
        else {
          ns.add(id);
          if (categorySlug && subcategorySlug)
            loadTricks(categorySlug, subcategorySlug);
        }
        return ns;
      });
    }
  };

  return (
    <div className="hidden sm:flex flex-col h-full min-h-0">
      <div className="h-14" />
      <ScrollArea className="flex-1 px-3 py-4 min-h-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : error ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            {error}
          </div>
        ) : (
          <nav className="flex flex-col gap-2">
            <Link
              href="/sports-and-disciplines"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-muted"
              onClick={onItemClick}
            >
              <Trophy className="h-4 w-4" />
              <span>Sports & Disciplines</span>
            </Link>

            {displayCategories.map((category) => {
              const Icon =
                iconMap[category.icon_name ?? "circle"] || iconMap["circle"];
              const isExpanded = expandedItems.has(category.slug);
              const isHidden =
                (category as any).is_active === false ||
                category.status === "hidden";
              return (
                <div key={category.slug} className="flex flex-col">
                  <button
                    onClick={() => {
                      // Keep expanded while navigating client-side
                      if (!isExpanded)
                        toggleExpanded(category.slug, true, category.slug);
                      router.push(`/${category.slug}`);
                      onItemClick?.();
                    }}
                    className={cn(
                      "flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-muted",
                      isExpanded && "bg-sidebar-accent/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      <span className="text-left">{category.name}</span>
                      {category.status === "in_progress" && (
                        <span className="ml-2 px-2 py-0.5 rounded text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-300">
                          BETA
                        </span>
                      )}
                      {isHidden && selectedIds.includes(category.id) && (
                        <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-semibold bg-muted text-muted-foreground border border-border">
                          UNLISTED
                        </span>
                      )}
                    </div>
                    <ChevronRight
                      className={cn(
                        "h-3.5 w-3.5 transition-transform",
                        isExpanded && "rotate-90"
                      )}
                    />
                  </button>
                  {isExpanded && (
                    <div className="ml-7 mt-1 mb-2 space-y-1">
                      {category.subcategoriesLoading ? (
                        <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Loading...</span>
                        </div>
                      ) : (
                        category.subcategories?.map((subcategory) => {
                          const subcatKey = `${category.slug}:${subcategory.slug}`;
                          const open = expandedItems.has(subcatKey);
                          return (
                            <Collapsible
                              key={subcategory.slug}
                              open={open}
                              onOpenChange={() =>
                                toggleExpanded(
                                  subcatKey,
                                  false,
                                  category.slug,
                                  subcategory.slug
                                )
                              }
                            >
                              <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-muted">
                                <span className="text-left">
                                  {subcategory.name}
                                </span>
                                <ChevronRight className="h-3.5 w-3.5 shrink-0 transition-transform duration-200 data-[state=open]:rotate-90" />
                              </CollapsibleTrigger>
                              <CollapsibleContent className="pb-1 pt-1">
                                <div className="ml-4 space-y-0.5">
                                  {subcategory.tricksLoading ? (
                                    <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground">
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                      <span>Loading...</span>
                                    </div>
                                  ) : (
                                    subcategory.tricks?.map((trick) => (
                                      <Link
                                        key={trick.slug}
                                        href={`/${category.slug}/${subcategory.slug}/${trick.slug}`}
                                        className="block rounded-md px-3 py-1.5 text-xs text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-muted capitalize"
                                        onClick={onItemClick}
                                      >
                                        {trick.name}
                                      </Link>
                                    ))
                                  )}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          );
                        })
                      )}
                      <Link
                        href={`/${category.slug}/skill-tree`}
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-accent transition-colors hover:bg-sidebar-accent hover:text-muted capitalize"
                        onClick={onItemClick}
                      >
                        <Network className="h-4 w-4" />
                        <span>View Skill Tree</span>
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}

            <div className="my-2 h-px bg-sidebar-border" />

            <Link
              href="/about"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-muted"
              onClick={onItemClick}
            >
              <Info className="h-4 w-4" />
              <span>About</span>
            </Link>
            <Link
              href="/contribute"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-muted"
              onClick={onItemClick}
            >
              <HandHeart className="h-4 w-4" />
              <span>Help Contribute</span>
            </Link>
            <Link
              href="/faqs"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-muted"
              onClick={onItemClick}
            >
              <HelpCircle className="h-4 w-4" />
              <span>FAQs</span>
            </Link>

            {user && user.xp && user?.xp >= 500 && (
              <ThemeToggle variant="nav" className="w-full justify-start" />
            )}

            {hasModeratorAccess() && (
              <Collapsible
                open={expandedItems.has("moderator-tools")}
                onOpenChange={() => toggleExpanded("moderator-tools")}
              >
                <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-muted">
                  <span className="text-left flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" /> Moderator Tools
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 transition-transform duration-200 data-[state=open]:rotate-90" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pb-1 pt-1">
                  <div className="ml-4 space-y-0.5">
                    <Link
                      href="/moderator/manage-tricks"
                      className="block rounded-md px-3 py-1.5 text-xs text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-muted"
                      onClick={onItemClick}
                    >
                      Manage Tricks
                    </Link>
                    <Link
                      href="/moderator/manage-subcategories"
                      className="block rounded-md px-3 py-1.5 text-xs text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-muted"
                      onClick={onItemClick}
                    >
                      Manage Subcategories
                    </Link>
                    <Link
                      href="/moderator/skill-trees"
                      className="block rounded-md px-3 py-1.5 text-xs text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-muted"
                      onClick={onItemClick}
                    >
                      Manage Skill Trees
                    </Link>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {hasAdminAccess() && (
              <Collapsible
                open={expandedItems.has("admin-tools")}
                onOpenChange={() => toggleExpanded("admin-tools")}
              >
                <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-muted">
                  <span className="text-left flex items-center gap-2">
                    <UserCog className="h-4 w-4" /> Admin Tools
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 transition-transform duration-200 data-[state=open]:rotate-90" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pb-1 pt-1">
                  <div className="ml-4 space-y-0.5">
                    <Link
                      href="/admin/user-management"
                      className="block rounded-md px-3 py-1.5 text-xs text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-muted"
                      onClick={onItemClick}
                    >
                      Manage Users
                    </Link>
                  </div>
                  <div className="ml-4 space-y-0.5">
                    <Link
                      href="/admin/manage-sports"
                      className="block rounded-md px-3 py-1.5 text-xs text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-muted"
                      onClick={onItemClick}
                    >
                      Manage Categories
                    </Link>
                  </div>
                  <div className="ml-4 space-y-0.5">
                    <Link
                      href="/admin/bugs"
                      className="block rounded-md px-3 py-1.5 text-xs text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-muted"
                      onClick={onItemClick}
                    >
                      Bugs
                    </Link>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
          </nav>
        )}
      </ScrollArea>
    </div>
  );
}
