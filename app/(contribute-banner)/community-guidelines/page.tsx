import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Heart, Shield, AlertTriangle, CheckCircle } from "lucide-react";

export default function CommunityGuidelines() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">Community Guidelines</h1>
              <p className="text-lg text-muted-foreground">
                Building a positive and inclusive community for all action
                sports enthusiasts
              </p>
            </div>

            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="h-5 w-5 mr-2 text-red-500" />
                    Our Community Values
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <p>
                    Trickipedia is built on the foundation of community
                    collaboration, respect, and shared passion for action
                    sports. We believe in creating an inclusive environment
                    where everyone can learn, contribute, and grow together.
                  </p>
                  <ul>
                    <li>
                      <strong>Respect:</strong> Treat all community members with
                      kindness and respect
                    </li>
                    <li>
                      <strong>Collaboration:</strong> Work together to build the
                      best trick database
                    </li>
                    <li>
                      <strong>Accuracy:</strong> Strive for accurate and helpful
                      information
                    </li>
                    <li>
                      <strong>Inclusivity:</strong> Welcome practitioners of all
                      skill levels and backgrounds
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                    What We Encourage
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <ul>
                    <li>Share accurate trick descriptions and tutorials</li>
                    <li>Provide constructive feedback and suggestions</li>
                    <li>Help newcomers learn and improve</li>
                    <li>Contribute high-quality photos and videos</li>
                    <li>Cite sources and give credit where due</li>
                    <li>Report content that violates guidelines</li>
                    <li>Engage in respectful discussions about techniques</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
                    What&apos;s Not Allowed
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none space-y-4">
                  <h4 className="font-semibold">Harmful Content</h4>
                  <ul>
                    <li>Harassment, bullying, or personal attacks</li>
                    <li>Discriminatory language or hate speech</li>
                    <li>Threats or promotion of violence</li>
                    <li>
                      Doxxing or sharing personal information without consent
                    </li>
                  </ul>

                  <h4 className="font-semibold">Misleading Information</h4>
                  <ul>
                    <li>Deliberately false or misleading trick information</li>
                    <li>Dangerous advice that could lead to injury</li>
                    <li>Impersonation of other users or athletes</li>
                  </ul>

                  <h4 className="font-semibold">
                    Spam and Low-Quality Content
                  </h4>
                  <ul>
                    <li>Repetitive or irrelevant posts</li>
                    <li>Commercial advertisements or self-promotion</li>
                    <li>Off-topic discussions unrelated to action sports</li>
                    <li>Duplicate content or unnecessary edits</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Safety First
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <p>
                    Action sports involve inherent risks. When contributing
                    content:
                  </p>
                  <ul>
                    <li>
                      Always emphasize proper safety equipment and precautions
                    </li>
                    <li>Include appropriate skill level recommendations</li>
                    <li>Mention prerequisites and progression steps</li>
                    <li>Never encourage dangerous or reckless behavior</li>
                    <li>Include warnings for high-risk techniques</li>
                  </ul>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      <strong>Important:</strong> Trickipedia is for educational
                      purposes only. Always practice under proper supervision
                      and use appropriate safety equipment.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Moderation & Enforcement
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none space-y-4">
                  <h4 className="font-semibold">Community Moderation</h4>
                  <p>
                    Our platform is moderated by volunteer community members who
                    are passionate about maintaining a positive environment.
                    Moderators have the authority to:
                  </p>
                  <ul>
                    <li>Edit or remove content that violates guidelines</li>
                    <li>Issue warnings to users</li>
                    <li>Temporarily or permanently suspend accounts</li>
                    <li>Lock discussions that become unproductive</li>
                  </ul>

                  <h4 className="font-semibold">Reporting Issues</h4>
                  <p>
                    If you encounter content or behavior that violates these
                    guidelines, please report it to our moderation team. You can
                    contact us at{" "}
                    <a
                      href="mailto:jd@platinumprogramming.com"
                      className="text-primary hover:underline"
                    >
                      jd@platinumprogramming.com
                    </a>
                    .
                  </p>

                  <h4 className="font-semibold">Appeals Process</h4>
                  <p>
                    If you believe a moderation action was taken in error, you
                    can appeal by contacting
                    <a
                      href="mailto:jd@platinumprogramming.com"
                      className="text-primary hover:underline ml-1"
                    >
                      jd@platinumprogramming.com
                    </a>
                    with details about the situation.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}
