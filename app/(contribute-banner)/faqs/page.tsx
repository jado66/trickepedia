import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Edit, Shield, Zap, Mail } from "lucide-react";

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about using and contributing to
              Trickipedia
            </p>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Getting Started
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none space-y-6">
                <div>
                  <h4 className="font-semibold">
                    Do I need an account to view tricks?
                  </h4>
                  <p>
                    No! All content on Trickipedia is freely accessible without
                    an account. You only need to create an account if you want
                    to contribute content, edit existing tricks, or participate
                    in community discussions.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold">How do I create an account?</h4>
                  <p>
                    Click the &quot;Sign Up&quot; button in the header and
                    provide your email address. You&apos;ll receive a
                    confirmation email to verify your account. Once verified,
                    you can start contributing immediately.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold">Is Trickipedia really free?</h4>
                  <p>
                    Yes, completely free! Trickipedia is a community-driven
                    platform with no subscription fees, premium content, or
                    hidden costs. Our mission is to keep action sports knowledge
                    accessible to everyone.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Edit className="h-5 w-5 mr-2" />
                  Contributing Content
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none space-y-6">
                <div>
                  <h4 className="font-semibold">What can I contribute?</h4>
                  <p>
                    You can add new tricks, improve existing descriptions,
                    upload tutorial videos, share safety tips, add progression
                    pathways, and help with categorization. Any knowledge that
                    helps others learn is valuable!
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold">
                    Do I need to be an expert to contribute?
                  </h4>
                  <p>
                    Not at all! Whether you&apos;re a beginner sharing your
                    learning experience or a pro adding advanced techniques, all
                    perspectives are valuable. Community moderation helps ensure
                    accuracy and quality.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold">
                    Can I edit content created by others?
                  </h4>
                  <p>
                    Yes! Trickipedia works like a wiki - anyone can improve
                    existing content. All edits are tracked, and the community
                    helps maintain quality through collaborative moderation.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold">What if I make a mistake?</h4>
                  <p>
                    Don&apos;t worry! All changes are tracked and can be
                    reverted if needed. The community is supportive and will
                    help correct any errors. It&apos;s better to contribute and
                    learn than not contribute at all.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Content Quality & Safety
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none space-y-6">
                <div>
                  <h4 className="font-semibold">
                    How do you ensure content accuracy?
                  </h4>
                  <p>
                    Our community of experienced athletes and moderators reviews
                    contributions. We encourage citing sources, providing video
                    demonstrations, and including safety warnings where
                    appropriate.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold">
                    What about safety information?
                  </h4>
                  <p>
                    Safety is paramount. We strongly encourage including
                    prerequisite skills, safety gear recommendations, and risk
                    warnings with all trick descriptions. Remember: action
                    sports involve inherent risks.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold">
                    How do you handle inappropriate content?
                  </h4>
                  <p>
                    We have community guidelines and volunteer moderators who
                    help maintain a positive environment. Users can report
                    inappropriate content, and we take swift action when
                    necessary.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Technical Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none space-y-6">
                <div>
                  <h4 className="font-semibold">
                    Can I upload videos and images?
                  </h4>
                  <p>
                    Yes! Visual content is incredibly valuable for learning
                    tricks. You can upload images and videos to illustrate
                    techniques, show proper form, and demonstrate progressions.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold">Is there a mobile app?</h4>
                  <p>
                    Currently, Trickipedia is a web-based platform optimized for
                    mobile browsers. You can access all features through your
                    phone&apos;s browser with a great mobile experience. There
                    is also a progressive web app (PWA) in development for an
                    even better mobile experience.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold">
                    Can I use Trickipedia content elsewhere?
                  </h4>
                  <p>
                    Content on Trickipedia is contributed by the community for
                    educational purposes. Please respect contributors&apos; work
                    and check our Terms of Service for specific usage
                    guidelines.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  Still Have Questions?
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none text-center">
                <p>
                  Can&apos;t find what you&apos;re looking for? We&apos;re here
                  to help! Reach out to our team and we&apos;ll get back to you
                  as soon as possible.
                </p>
                <p>
                  <strong>Contact us:</strong>
                  <a
                    href="mailto:jd@platinumprogramming.com"
                    className="text-primary hover:underline ml-1"
                  >
                    jd@platinumprogramming.com
                  </a>
                </p>
                <p className="text-sm text-muted-foreground">
                  We typically respond within 24-48 hours. For urgent safety
                  concerns or content issues, please mark your email as
                  &quot;URGENT&quot; in the subject line.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
