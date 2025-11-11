"use client";

import { Card } from "@/components/ui/card";
import {
  Network,
  TrendingUp,
  Users,
  Zap,
  Smartphone,
  Share,
  Plus,
  Download,
  Menu,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { InteractiveSkillTreeDemo } from "@/components/homepage/interactive-skill-tree-demo";
import { InteractiveProgressDemo } from "@/components/homepage/interactive-progress-demo";

const features = [
  {
    icon: Network,
    title: "Interactive Skill Trees",
    description:
      "Visualize your progression with beautiful, interactive skill trees. See prerequisites, track what you've mastered, and discover what's next.",
    demo: <InteractiveSkillTreeDemo />,
    cta: "View Skill Trees",
    href: "/parkour/skill-tree",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description:
      "Mark tricks as learned, track your mastery percentage, and watch your skills grow across all disciplines. Your journey, visualized.",
    demo: <InteractiveProgressDemo />,
    cta: "Track Progress",
    href: "/signup",
  },
  {
    icon: Users,
    title: "Community Driven",
    description:
      "Learn from athletes worldwide. Contribute tricks, share tips, and help build the most comprehensive action sports database.",
    image: "/placeholder.svg?height=400&width=600",
    cta: "Join Community",
    href: "/signup",
  },
];

function InstallAppDialogTrigger({
  ios,
  android,
  buttonClassName = "",
}: {
  ios: boolean;
  android: boolean;
  buttonClassName?: string;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg" className={buttonClassName}>
          Install App
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-primary" /> Install Trickipedia
          </DialogTitle>
          <DialogDescription>
            Add the app to your device for faster access and offline support.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 text-sm">
          {ios && (
            <div>
              <h3 className="font-semibold mb-2 text-muted-foreground uppercase tracking-wide text-xs">
                iOS (Safari)
              </h3>
              <ol className="space-y-3">
                <li className="flex gap-3 items-start">
                  <span className="inline-flex w-5 h-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex-shrink-0">
                    1
                  </span>
                  Tap the Share icon in Safari.
                </li>
                <li className="flex gap-3 items-start">
                  <span className="inline-flex w-5 h-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex-shrink-0">
                    2
                  </span>
                  Choose “Add to Home Screen”.
                </li>
                <li className="flex gap-3 items-start">
                  <span className="inline-flex w-5 h-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex-shrink-0">
                    3
                  </span>
                  Tap “Add” to finish.
                </li>
              </ol>
            </div>
          )}
          {android && (
            <div>
              <h3 className="font-semibold mb-2 text-muted-foreground uppercase tracking-wide text-xs">
                Android (Chrome / Edge)
              </h3>
              <ol className="space-y-3">
                <li className="flex gap-3 items-start">
                  <span className="inline-flex w-5 h-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex-shrink-0">
                    1
                  </span>
                  Open the browser menu (⋮).
                </li>
                <li className="flex gap-3 items-start">
                  <span className="inline-flex w-5 h-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex-shrink-0">
                    2
                  </span>
                  Tap “Install app” or “Add to Home screen”.
                </li>
                <li className="flex gap-3 items-start">
                  <span className="inline-flex w-5 h-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex-shrink-0">
                    3
                  </span>
                  Confirm the prompt.
                </li>
              </ol>
            </div>
          )}
          {!ios && !android && (
            <div>
              <h3 className="font-semibold mb-2 text-muted-foreground uppercase tracking-wide text-xs">
                Desktop
              </h3>
              <ol className="space-y-3">
                <li className="flex gap-3 items-start">
                  <span className="inline-flex w-5 h-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex-shrink-0">
                    1
                  </span>
                  Click the install icon in the address bar (if visible) or open
                  the browser menu.
                </li>
                <li className="flex gap-3 items-start">
                  <span className="inline-flex w-5 h-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex-shrink-0">
                    2
                  </span>
                  Choose “Install App” / “Install Trickipedia”.
                </li>
                <li className="flex gap-3 items-start">
                  <span className="inline-flex w-5 h-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex-shrink-0">
                    3
                  </span>
                  Confirm the dialog.
                </li>
              </ol>
            </div>
          )}
          <div className="rounded-md bg-muted/40 p-3 text-xs text-muted-foreground leading-relaxed">
            If you don’t see an install option, make sure you’re using a modern
            browser and have visited the site online at least once so assets can
            cache.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function FeaturesShowcase() {
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream);
    setIsAndroid(/Android/.test(ua));
  }, []);
  const primaryFeatures = features.slice(0, 2);
  const combinedFeatures = features.slice(2, 4); // last two

  function MiniFeature({
    feature,
    className = "",
  }: {
    feature: (typeof features)[number];
    className?: string;
  }) {
    return (
      <div className={className}>
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 text-primary mb-6">
          <feature.icon className="w-7 h-7" />
        </div>
        <h3 className="text-2xl sm:text-3xl font-bold mb-4">{feature.title}</h3>
        <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
          {feature.description}
        </p>
        {feature.cta === "Install App" && feature.href === null ? (
          <InstallAppDialogTrigger
            ios={isIOS}
            android={isAndroid}
            buttonClassName=""
          />
        ) : (
          <Button asChild variant="outline" size="lg">
            <Link href={feature.href || "#"}>{feature.cta}</Link>
          </Button>
        )}
      </div>
    );
  }

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-balance">
            Everything You Need to{" "}
            <span className="text-primary">Level Up</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
            Powerful features designed to accelerate your learning and track
            your progression
          </p>
        </div>

        <div className="grid gap-8 lg:gap-12">
          {primaryFeatures.map((feature, index) => (
            <Card
              key={feature.title}
              className="overflow-hidden sm:p-1 border-2 hover:border-primary/50 transition-all duration-300"
            >
              <div
                className={`grid md:grid-cols-2 gap-8 p-4 lg:p-12 items-center ${
                  index % 2 === 1 ? "md:grid-flow-dense" : ""
                }`}
              >
                <div className={index % 2 === 1 ? "md:col-start-2" : ""}>
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 text-primary mb-6">
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-3xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                    {feature.description}
                  </p>
                  {feature.cta === "Install App" && feature.href === null ? (
                    <InstallAppDialogTrigger ios={isIOS} android={isAndroid} />
                  ) : (
                    <Button asChild variant="outline" size="lg">
                      <Link href={feature.href || "#"}>{feature.cta}</Link>
                    </Button>
                  )}
                </div>
                <div
                  className={
                    index % 2 === 1 ? "md:col-start-1 md:row-start-1" : ""
                  }
                >
                  {feature.demo ? (
                    <div className="relative aspect-[3/2]">{feature.demo}</div>
                  ) : null}
                </div>
              </div>
            </Card>
          ))}

          {combinedFeatures.length === 2 && (
            <>
              {/* Mobile: render as two independent cards (no nesting) */}
              <div className="space-y-8 md:hidden">
                <Card className="overflow-hidden border-2 hover:border-primary/50 transition-all duration-300">
                  <div className="p-6">
                    <MiniFeature feature={combinedFeatures[0]} />
                  </div>
                </Card>
                <Card className="overflow-hidden border-2 hover:border-primary/50 transition-all duration-300">
                  <div className="p-6">
                    <MiniFeature feature={combinedFeatures[1]} />
                  </div>
                </Card>
              </div>

              {/* Desktop: combined side-by-side layout inside a single card */}
              <Card className="hidden md:block overflow-hidden border-2 hover:border-primary/50 transition-all duration-300">
                <div className="p-2 lg:p-12">
                  <div className="flex items-start gap-12 divide-x divide-border">
                    <MiniFeature
                      feature={combinedFeatures[0]}
                      className="md:w-1/2 pr-12"
                    />
                    <MiniFeature
                      feature={combinedFeatures[1]}
                      className="md:w-1/2 pl-12"
                    />
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
