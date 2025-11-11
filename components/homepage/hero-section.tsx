import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, ChevronDown, Hand } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { disciplines as disciplineList } from "./discipline-data";

interface HeroSectionProps {
  publishedTricks: number;
  totalViews: number;
  disciplines: number;
}

// Lightweight number formatter (k / M with 1 decimal)
function formatNumber(num: number) {
  if (num >= 1_000_000)
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  return num.toString();
}

export function HeroSection({
  publishedTricks,
  totalViews,
  disciplines,
}: HeroSectionProps) {
  const tricksDisplay = publishedTricks
    ? `${formatNumber(publishedTricks)}+`
    : "—";
  const viewsDisplay = totalViews ? `${formatNumber(totalViews)}+` : "—";
  const disciplinesDisplay = disciplines || 0;

  return (
    <section className="relative min-h-[calc(100vh-65px)] flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-muted">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23000000' fillOpacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              {tricksDisplay} Tricks • Growing Daily
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-balance mb-6 animate-fade-in-up leading-tight">
            Master Every Trick.
            <br />
            <span className="text-primary">Track Your Progress.</span>
            <br />
            Level Up Your Skills.
          </h1>

          {/* Subheadline */}
          <p className="text-xl sm:text-2xl text-muted-foreground text-pretty mb-10 max-w-3xl mx-auto animate-fade-in-up leading-relaxed">
            The ultimate collaborative wiki for parkour, tricking, trampoline,
            and trampwall. Learn with interactive skill trees, track your
            progress, and join a global community of athletes.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-fade-in-up">
            <Button
              size="lg"
              className="text-lg px-8 py-6 h-auto font-semibold group"
              asChild
            >
              <Link href="/signup">
                Start Learning Free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6 h-auto font-semibold bg-transparent group"
                >
                  Explore Tricks
                  <ChevronDown className="ml-2 w-5 h-5 transition-transform group-data-[state=open]:rotate-180" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="min-w-48">
                {disciplineList.map((d) => (
                  <DropdownMenuItem key={d.slug} asChild>
                    <Link href={`/${d.slug}`}>{d.name}</Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem asChild>
                  <Link
                    href="/sports-and-disciplines"
                    className="font-medium text-primary"
                  >
                    View All
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto pt-8 border-t border-border/50 animate-fade-in">
            <div>
              <div className="text-3xl font-bold text-primary mb-1">
                {tricksDisplay}
              </div>
              <div className="text-sm text-muted-foreground">
                Documented Tricks
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-1">
                {disciplinesDisplay}
              </div>
              <div className="text-sm text-muted-foreground">Disciplines</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-1">
                {viewsDisplay}
              </div>
              <div className="text-sm text-muted-foreground">Total Views</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-1">24/7</div>
              <div className="text-sm text-muted-foreground">Free Access</div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop scroll indicator (mouse) */}
      <div
        className="hidden sm:flex absolute bottom-6 left-1/2 -translate-x-1/2 flex-col items-center gap-2 text-muted-foreground/60"
        aria-hidden="true"
      >
        <div className="animate-bounce">
          <div className="w-10 h-16 rounded-full border-2 border-muted-foreground/40 flex items-start justify-center p-3 relative overflow-hidden">
            <div className="w-2 h-5 rounded-full bg-muted-foreground/40 animate-[scroll-dot_1.8s_ease-in-out_infinite]" />
          </div>
        </div>
        <span className="text-xs tracking-wide uppercase">Scroll</span>
      </div>

      {/* Mobile touch indicator */}
      <div
        className="sm:hidden absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-muted-foreground/70"
        aria-hidden="true"
      >
        <div className="flex flex-col items-center leading-none animate-pulse">
          <ChevronDown className="w-5 h-5 -mt-2 animate-bounce" />
        </div>
        <span className="text-xs font-medium">Swipe Down</span>
      </div>
    </section>
  );
}
