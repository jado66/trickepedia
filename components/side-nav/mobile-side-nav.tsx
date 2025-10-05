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
  CircleCheck,
} from "lucide-react";
import Link from "next/link";
import { TrickipediaLogo } from "../trickipedia-logo";
import { useRouter } from "next/navigation";
import { useNavigation } from "@/contexts/navigation-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { useUser } from "@/contexts/user-provider";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { iconMap } from "./icon-map";

export function MobileSideNav({ onItemClick }: { onItemClick?: () => void }) {
  const router = useRouter();
  const { user, signOut, hasModeratorAccess, hasAdminAccess } = useUser();
  const {
    categories,
    loadSubcategories,
    loadTricks,
    expandedItems,
    setExpandedItems,
  } = useNavigation();

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
          if (categorySlug && subcategorySlug) {
            loadTricks(categorySlug, subcategorySlug);
          }
        }
        return ns;
      });
    }
  };

  const openCategory: string | undefined =
    [...expandedItems].find((id) => categories.some((c) => c.slug === id)) ||
    undefined;

  return (
    <div className="block sm:hidden flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-sidebar-border px-4 py-4">
        <Link
          href="/"
          className="flex items-center gap-3"
          onClick={onItemClick}
        >
          <TrickipediaLogo />
        </Link>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-2">
          <Link
            href="/sports-and-disciplines"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent  hover:text-muted"
            onClick={onItemClick}
          >
            <CircleCheck className="h-4 w-4" />
            <span>Sports & Disciplines</span>
          </Link>

          <Accordion
            type="single"
            collapsible
            value={openCategory}
            onValueChange={(value) => {
              if (value) {
                if (!expandedItems.has(value))
                  toggleExpanded(value, true, value);
              } else if (openCategory) {
                toggleExpanded(openCategory, true, openCategory);
              }
            }}
            className="space-y-1"
          >
            {categories.map((category) => {
              const Icon =
                iconMap[category.icon_name ?? "circle"] || iconMap["circle"];
              return (
                <AccordionItem
                  key={category.slug}
                  value={category.slug}
                  className="border-none"
                >
                  <AccordionTrigger className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent  hover:text-muted hover:no-underline [&[data-state=open]>div>svg]:rotate-90">
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      <span className="text-left">{category.name}</span>
                      {category.status === "in_progress" && (
                        <span className="ml-2 px-2 py-0.5 rounded text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-300">
                          BETA
                        </span>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-1 pt-1">
                    <div className="ml-7 space-y-1">
                      <Link
                        href={`/${category.slug}`}
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-accent transition-colors hover:bg-sidebar-accent hover:text-muted  "
                        onClick={onItemClick}
                      >
                        <CircleCheck className="h-4 w-4" />
                        <span>All Tricks</span>
                      </Link>
                      {category.subcategoriesLoading ? (
                        <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Loading...</span>
                        </div>
                      ) : (
                        category.subcategories?.map((subcategory) => {
                          const subcatKey = `${category.slug}:${subcategory.slug}`;
                          return (
                            <Collapsible
                              key={subcategory.slug}
                              open={expandedItems.has(subcatKey)}
                              onOpenChange={() => {
                                toggleExpanded(
                                  subcatKey,
                                  false,
                                  category.slug,
                                  subcategory.slug
                                );
                              }}
                            >
                              <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent  hover:text-muted">
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
                                        className="block rounded-md px-3 py-1.5 text-xs text-sidebar-foreground transition-colors hover:bg-sidebar-accent  hover:text-muted"
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
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-accent transition-colors hover:bg-sidebar-accent  hover:text-muted capitalize"
                        onClick={onItemClick}
                      >
                        <Network className="h-4 w-4" />
                        <span>View Skill Tree</span>
                      </Link>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>

          <div className="my-2 h-px bg-sidebar-border" />

          <Link
            href="/about"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent  hover:text-muted"
            onClick={onItemClick}
          >
            <Info className="h-4 w-4" />
            <span>About</span>
          </Link>
          <Link
            href="/contribute"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent  hover:text-muted"
            onClick={onItemClick}
          >
            <HandHeart className="h-4 w-4" />
            <span>Help Contribute</span>
          </Link>
          <Link
            href="/faqs"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent  hover:text-muted"
            onClick={onItemClick}
          >
            <HelpCircle className="h-4 w-4" />
            <span>FAQs</span>
          </Link>

          {user && user?.xp && user.xp && >= 500 && (
            <ThemeToggle variant="nav" className="w-full justify-start" />
          )}

          {hasModeratorAccess() && (
            <Collapsible
              open={expandedItems.has("moderator-tools")}
              onOpenChange={() => toggleExpanded("moderator-tools")}
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent  hover:text-muted">
                <span className="text-left flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" /> Moderator Tools
                </span>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 transition-transform duration-200 data-[state=open]:rotate-90" />
              </CollapsibleTrigger>
              <CollapsibleContent className="pb-1 pt-1">
                <div className="ml-4 space-y-0.5">
                  <Link
                    href="/moderator/manage-tricks"
                    className="block rounded-md px-3 py-1.5 text-xs text-sidebar-foreground transition-colors hover:bg-sidebar-accent  hover:text-muted"
                    onClick={onItemClick}
                  >
                    Manage Tricks
                  </Link>
                  <Link
                    href="/moderator/manage-subcategories"
                    className="block rounded-md px-3 py-1.5 text-xs text-sidebar-foreground transition-colors hover:bg-sidebar-accent  hover:text-muted"
                    onClick={onItemClick}
                  >
                    Manage Subcategories
                  </Link>
                  <Link
                    href="/moderator/skill-trees"
                    className="block rounded-md px-3 py-1.5 text-xs text-sidebar-foreground transition-colors hover:bg-sidebar-accent  hover:text-muted"
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
              <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent  hover:text-muted">
                <span className="text-left flex items-center gap-2">
                  <UserCog className="h-4 w-4" /> Admin Tools
                </span>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 transition-transform duration-200 data-[state=open]:rotate-90" />
              </CollapsibleTrigger>
              <CollapsibleContent className="pb-1 pt-1">
                <div className="ml-4 space-y-0.5">
                  <Link
                    href="/admin/user-management"
                    className="block rounded-md px-3 py-1.5 text-xs text-sidebar-foreground transition-colors hover:bg-sidebar-accent  hover:text-muted"
                    onClick={onItemClick}
                  >
                    Manage Users
                  </Link>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          <Collapsible
            open={expandedItems.has("account")}
            onOpenChange={() => toggleExpanded("account")}
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent  hover:text-muted">
              <span className="text-left flex items-center gap-2">
                <User className="h-4 w-4" /> Account
              </span>
              <ChevronRight className="h-3.5 w-3.5 shrink-0 transition-transform duration-200 data-[state=open]:rotate-90" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pb-1 pt-1">
              <div className="ml-4 space-y-0.5">
                {user ? (
                  <>
                    <Link
                      href="/profile"
                      className="block rounded-md px-3 py-1.5 text-xs text-sidebar-foreground transition-colors hover:bg-sidebar-accent  hover:text-muted truncate"
                      onClick={onItemClick}
                    >
                      <span className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5" /> {user.email}
                      </span>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left rounded-md px-3 py-1.5 text-xs text-sidebar-foreground transition-colors hover:bg-sidebar-accent  hover:text-muted"
                    >
                      <span className="flex items-center gap-2">
                        <LogOut className="h-3.5 w-3.5" /> Sign Out
                      </span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="block rounded-md px-3 py-1.5 text-xs text-sidebar-foreground transition-colors hover:bg-sidebar-accent  hover:text-muted"
                      onClick={onItemClick}
                    >
                      <span className="flex items-center gap-2">
                        <LogIn className="h-3.5 w-3.5" /> Sign In
                      </span>
                    </Link>
                    <Link
                      href="/signup"
                      className="block rounded-md px-3 py-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                      onClick={onItemClick}
                    >
                      <span className="flex items-center gap-2">
                        <UserPlus className="h-3.5 w-3.5" /> Join Now
                      </span>
                    </Link>
                  </>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </nav>
      </ScrollArea>
    </div>
  );
}
