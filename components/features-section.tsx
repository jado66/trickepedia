import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MapPin, Calendar, Clock, Users, Trophy, Heart } from "lucide-react";

const features = [
  {
    icon: MapPin,
    title: "Discover Local Hubs",
    description:
      "Find action sports facilities near you with detailed information about amenities and sports offered.",
  },
  {
    icon: Calendar,
    title: "Join Events & Meetups",
    description:
      "Participate in classes, competitions, and community meetups organized by local hubs and athletes.",
  },
  {
    icon: Clock,
    title: "Schedule Your Training",
    description:
      "Track your regular training sessions and see when other athletes are training at your favorite hubs.",
  },
  {
    icon: Users,
    title: "Connect with Athletes",
    description:
      "Meet like-minded athletes, find training partners, and build lasting connections in the community.",
  },
  {
    icon: Trophy,
    title: "Compete & Grow",
    description:
      "Join competitions, track your progress, and challenge yourself alongside other passionate athletes.",
  },
  {
    icon: Heart,
    title: "Support Local Gyms",
    description:
      "Help local businesses thrive by discovering and supporting action sports facilities in your area.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-balance mb-4">
            Everything You Need to{" "}
            <span className="text-orange-600">Train & Connect</span>
          </h2>
          <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
            Flipside brings together athletes, hubs, and events in one platform
            designed for the action sports community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="h-full transition-all hover:shadow-lg hover:scale-[1.02]"
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-orange-600" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
