import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Users, Heart, Zap, Globe, BookOpen } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">About Trickipedia</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The world&apos;s most comprehensive, community-driven encyclopedia
              of action sports tricks
            </p>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Our Mission
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p>
                  Trickipedia exists to democratize knowledge in action sports.
                  We believe that every trick, technique, and tip should be
                  accessible to anyone, anywhere, for free. Our mission is to
                  create the most comprehensive database of action sports
                  knowledge, built by the community, for the community.
                </p>
                <p>
                  Whether you&apos;re a beginner learning your first ollie or a
                  pro perfecting a new combo, Trickipedia is here to help you
                  progress, share knowledge, and connect with fellow athletes
                  worldwide.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Community-Driven Platform
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none space-y-4">
                <p>
                  Trickipedia is powered entirely by passionate athletes,
                  coaches, and enthusiasts from around the world. Every piece of
                  content is contributed, reviewed, and refined by our community
                  members who share a common love for action sports.
                </p>
                <h4 className="font-semibold">How It Works</h4>
                <ul>
                  <li>
                    <strong>Anyone can contribute:</strong> Create an account
                    and start adding tricks, tutorials, and tips
                  </li>
                  <li>
                    <strong>Community moderation:</strong> Experienced members
                    help maintain quality and accuracy
                  </li>
                  <li>
                    <strong>Collaborative editing:</strong> Multiple
                    contributors can improve and expand content
                  </li>
                  <li>
                    <strong>Free forever:</strong> All content remains freely
                    accessible to everyone
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  What You&apos;ll Find Here
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Sports Covered</h4>
                    <ul className="space-y-1">
                      <li>Parkour &amp; Freerunning</li>
                      <li>Tricking</li>
                      <li>Trampoline</li>
                      <li>Trampwall</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Soon We&apos; Have</h4>
                    <ul className="space-y-1">
                      <li>Skateboarding</li>
                      <li>BMX</li>
                      <li>Snowboarding</li>
                      <li>Skiing</li>
                      <li>Surfing</li>
                      <li>Gymnastics</li>
                      <li>And many more...</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Content Types</h4>
                    <ul className="space-y-1">
                      <li>Step-by-step trick tutorials</li>
                      <li>Video demonstrations</li>
                      <li>Safety tips and prerequisites</li>
                      <li>Common mistakes to avoid</li>
                      <li>Progression pathways</li>
                      <li>Equipment recommendations</li>
                      <li>Historical context</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 mr-2" />
                  Our Values
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold flex items-center mb-2">
                      <Globe className="h-4 w-4 mr-2" />
                      Accessibility
                    </h4>
                    <p className="text-sm">
                      Knowledge should be free and accessible to everyone,
                      regardless of location, background, or skill level.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold flex items-center mb-2">
                      <Users className="h-4 w-4 mr-2" />
                      Community
                    </h4>
                    <p className="text-sm">
                      We believe in the power of collective knowledge and the
                      strength of supportive communities.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold flex items-center mb-2">
                      <Zap className="h-4 w-4 mr-2" />
                      Progression
                    </h4>
                    <p className="text-sm">
                      Every athlete deserves the tools and knowledge to safely
                      progress and achieve their goals.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold flex items-center mb-2">
                      <Heart className="h-4 w-4 mr-2" />
                      Respect
                    </h4>
                    <p className="text-sm">
                      We foster an inclusive environment where all athletes are
                      welcomed and respected.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="prose prose-sm max-w-none text-center">
                <h3 className="font-semibold">Ready to Contribute?</h3>
                <p>
                  Join thousands of athletes who are building the future of
                  action sports knowledge. Create your free account today and
                  start sharing your expertise with the world.
                </p>
                <p>
                  Questions or suggestions? Reach out to our founder, JD, at:
                  <a
                    href="mailto:jd@platinumprogramming.com"
                    className="text-primary hover:underline ml-1"
                  >
                    jd@platinumprogramming.com
                  </a>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
