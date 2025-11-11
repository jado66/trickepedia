"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, UserIcon, Plus, Heart } from "lucide-react";
import { UserNav } from "@/components/user-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationBell } from "@/components/notifications";
import { TrickipediaLogo } from "@/components/trickipedia-logo";
import { TrickSearch } from "@/components/trick-search";
import { useUser } from "@/contexts/user-provider";
import { generateReferralLink } from "@/lib/referral-utils";
import { useToast } from "@/hooks/use-toast";
import { useCallback } from "react";

export function TrickipediaHeader({
  onMobileMenuClick,
  categories = [],
}: {
  onMobileMenuClick?: () => void;
  categories?: Array<{ name: string; slug: string }>;
}) {
  const { user } = useUser();
  const { toast } = useToast();

  const handleInvite = async () => {
    try {
      const link = user?.email
        ? generateReferralLink(user.email)
        : `${
            typeof window !== "undefined" ? window.location.origin : ""
          }/signup`;
      await navigator.clipboard.writeText(link);
      toast({
        title: "Invite link copied",
        description: user?.email
          ? "Your referral link (with your email) is in the clipboard!"
          : "Signup link copied. Create an account to earn XP from referrals!",
      });
    } catch (e) {
      toast({
        title: "Could not copy link",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-2 md:gap-4">
          {/* Logo */}
          <TrickipediaLogo hasUser={user && user?.email ? true : false} />

          <div className="flex-1 max-w-lg hidden md:block">
            <TrickSearch categories={categories} />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            <Link
              href="/about"
              className="text-foreground hover:text-primary transition-colors text-sm"
            >
              About
            </Link>
            <Link
              href="/contribute"
              className="text-foreground hover:text-primary transition-colors text-sm"
            >
              Contribute
            </Link>
            <Link
              href="/sports-and-disciplines"
              className="text-foreground hover:text-primary transition-colors text-sm"
            >
              Sports & Disciplines
            </Link>
            <Link
              href="/faqs"
              className="text-foreground hover:text-primary transition-colors text-sm"
            >
              FAQs
            </Link>

            {!user && (
              <>
                <Link
                  href="/login"
                  className="text-foreground hover:text-primary transition-colors text-sm"
                >
                  Sign In
                </Link>
                <Button asChild size="sm" className="font-semibold">
                  <Link href="/signup">Join Now</Link>
                </Button>
              </>
            )}
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {user && user?.email && <NotificationBell />}
            {user && (user.xp ?? 0) >= 500 && <ThemeToggle />}

            {user && <UserNav user={user} />}
          </div>

          {/* Mobile Actions */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile icon search placed next to notification bell */}
            <TrickSearch categories={categories} variant="icon" />
            {user && user?.email && <NotificationBell />}
            {/* Mobile Menu Button triggers sidebar for mobile navigation. */}
            <Button variant="ghost" size="sm" onClick={onMobileMenuClick}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
