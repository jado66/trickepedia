import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { XP_ACTIONS } from "./xp-levels-data"; // TODO: consider moving XP_ACTIONS to shared xp module too

export default function XPActionsGrid() {
  return (
    <div className="mb-20">
      <div className="text-center mb-12">
        <h3 className="text-2xl md:text-3xl font-bold mb-4">How to Earn XP</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Every action counts towards your progression. Here are the main ways
          to earn experience points.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3  justify-center w-fit mx-auto">
        {XP_ACTIONS.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <Card
              key={index}
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                item.highlight ? "ring-2 ring-primary/20 bg-primary/5" : ""
              }`}
            >
              {item.highlight && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-bl-lg font-medium">
                  Bonus XP
                </div>
              )}
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <IconComponent className="w-6 h-6 text-primary" />
                  </div>
                  <Badge variant="accent" className="font-bold">
                    {item.xp}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{item.action}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="leading-relaxed">
                  {item.description}
                </CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
