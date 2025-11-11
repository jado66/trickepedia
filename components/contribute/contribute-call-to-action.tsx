import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight, Edit, Plus, Trophy, UserCheck, Zap } from "lucide-react";
import { XP_LEVELS } from "@/lib/xp/levels";

export default function ContributeCallToAction() {
  return (
    <Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-primary/20">
      <CardHeader className="text-center pb-6">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
            <Zap className="w-8 h-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl md:text-3xl mb-4">
          Ready to Start Earning XP?
        </CardTitle>
        <CardDescription className="text-lg max-w-3xl mx-auto leading-relaxed">
          Every contribution counts! Start with small edits, add new tricks, and
          invite friends to begin your journey to Legend status.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center border-border/50 hover:shadow-md transition-all duration-300">
            <CardHeader className="pb-4">
              <Plus className="w-8 h-8 text-primary mx-auto mb-3" />
              <CardTitle className="text-lg">Add Content</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Create new tricks and comprehensive guides to help others learn
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-border/50 hover:shadow-md transition-all duration-300">
            <CardHeader className="pb-4">
              <Edit className="w-8 h-8 text-primary mx-auto mb-3" />
              <CardTitle className="text-lg">Improve Existing</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Edit and enhance existing content to make it even better
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-border/50 hover:shadow-md transition-all duration-300">
            <CardHeader className="pb-4">
              <UserCheck className="w-8 h-8 text-primary mx-auto mb-3" />
              <CardTitle className="text-lg">Invite Friends</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Earn the most XP by bringing active contributors to the
                community
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="lg" className="px-8 group">
            Start Contributing
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button variant="outline" size="lg" className="px-8 bg-transparent">
            View Guidelines
          </Button>
        </div>

        <div className="text-center flex flex-wrap justify-center">
          {/** Map levels 2-5 with color-coded badges **/}
          {XP_LEVELS.filter((l) => l.level > 1).map((level) => {
            const messages: Record<number, string> = {
              2: "Reach Level 2 to unlock dark mode for a personalized experience",
              3: "Reach Level 3 to unlock moderator privileges and tools like the skill-tree builder",
              4: "Reach Level 4 to unlock expert privileges like feature requests",
              5: "Reach Level 5 to get early access to our sister site Flipside, which is currently in development.",
            };
            return (
              <div
                key={level.level}
                className={[
                  "m-1 inline-flex items-center gap-2 text-sm rounded-full px-4 py-2 border",
                  level.bgColor,
                  level.borderColor,
                  // Use proper dark mode friendly text colors
                  "text-slate-700 dark:text-slate-300",
                ].join(" ")}
              >
                <Trophy className={["w-4 h-4", level.color].join(" ")} />
                <span className="font-medium">{messages[level.level]}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
