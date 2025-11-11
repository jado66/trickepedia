import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Home, BookOpen, Users, TrendingUp } from "lucide-react";

export default function NotFoundComponent() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Hero Section */}
          <div className="space-y-6">
            {/* Animated 404 with action sports flair */}
            <div className="relative">
              <h1 className="text-8xl md:text-9xl font-black text-black select-none">
                4&nbsp;&nbsp;&nbsp;&nbsp;4
              </h1>
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="text-7xl animate-spin transform rotate-180"
                  style={{
                    filter: "brightness(0)",
                    animationDuration: "3s",
                  }}
                >
                  🏃
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
                {"Oops! You've taken a wrong turn!"}
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
                {
                  "The trick you're looking for isn't here, but don't worry — let's get you back on track!"
                }
              </p>
            </div>
          </div>

          {/* Search Section */}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="min-w-[160px]">
              <Link href="/">
                <Home className="mr-2 h-5 w-5" />
                Return to Home
              </Link>
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              {"Join our growing community of action sports enthusiasts. "}
              <Link href="/about" className="text-primary hover:underline">
                Learn more about Trickipedia
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
