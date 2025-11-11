import { Card } from "@/components/ui/card";
import { UserPlus, Search, Trophy } from "lucide-react";

interface HowItWorksProps {
  publishedTricks: number;
  disciplines: number;
}

export function HowItWorks({ publishedTricks, disciplines }: HowItWorksProps) {
  const steps = [
    {
      icon: UserPlus,
      title: "Create Free Account",
      description:
        "Sign up in seconds. No credit card required, no commitments. Just pure learning.",
    },
    {
      icon: Search,
      title: "Explore & Learn",
      description: `Browse ${publishedTricks || 0}+ tricks across ${disciplines || 0} disciplines. Watch tutorials, read tips, and understand prerequisites.`,
    },
    {
      icon: Trophy,
      title: "Track Progress",
      description:
        "Mark tricks as learned, visualize your journey on skill trees, and watch your mastery grow.",
    },
  ];
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-balance">
            Start Learning in{" "}
            <span className="text-primary">3 Simple Steps</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
            From beginner to pro, we make progression simple and rewarding
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connection lines for desktop */}
          <div className="hidden md:block absolute top-20 left-0 right-0 h-0.5 bg-border -z-10">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          </div>

          {steps.map((step, index) => (
            <Card
              key={step.title}
              className="relative p-8 text-center border-2 hover:border-primary/50 transition-all"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 text-primary mb-4">
                <step.icon className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
