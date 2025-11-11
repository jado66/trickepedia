import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Lightbulb, Heart } from "lucide-react";

export default function ContributingSection() {
  return (
    <div className="text-center space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
          Contribute to Trickipedia
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Join our community of creators and help build the ultimate resource
          for tricks, tips, and knowledge sharing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
        <Card className="border-border/50 hover:shadow-lg transition-all duration-300 hover:border-primary/20">
          <CardHeader className="text-center pb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-lg">Share Knowledge</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-center">
              Add new tricks, guides, and tutorials to help others learn and
              grow.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover:shadow-lg transition-all duration-300 hover:border-primary/20">
          <CardHeader className="text-center pb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-lg">Build Community</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-center">
              Connect with like-minded individuals and foster collaborative
              learning.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover:shadow-lg transition-all duration-300 hover:border-primary/20">
          <CardHeader className="text-center pb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Lightbulb className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-lg">Innovate</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-center">
              Bring fresh ideas and creative solutions to improve the platform.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover:shadow-lg transition-all duration-300 hover:border-primary/20">
          <CardHeader className="text-center pb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-lg">Make Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-center">
              Your contributions directly help thousands of learners worldwide.
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mt-6">
        <Badge variant="accent">Open Source</Badge>
        <Badge variant="accent">Community Driven</Badge>
        <Badge variant="accent">Beginner Friendly</Badge>
        <Badge variant="accent">Rewarding</Badge>
      </div>
    </div>
  );
}
