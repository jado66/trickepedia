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

export function FeaturesShowcase() {
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
                    mounted ? (
                      <InstallAppDialogTrigger
                        ios={isIOS}
                        android={isAndroid}
                      />
                    ) : (
                      <Button variant="outline" size="lg">
                        Install App
                      </Button>
                    )
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
