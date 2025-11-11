import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, FileText, AlertTriangle } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
            <p className="text-lg text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Agreement to Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p>
                  By accessing and using Trickipedia, you accept and agree to be
                  bound by the terms and provision of this agreement. If you do
                  not agree to abide by the above, please do not use this
                  service.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  User-Generated Content & Community Platform
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none space-y-4">
                <p>
                  Trickipedia is a community-driven platform where users can
                  contribute, edit, and share information about action sports
                  tricks. We operate as an interactive computer service under
                  Section 230 of the Communications Decency Act.
                </p>
                <h4 className="font-semibold">Content Responsibility</h4>
                <ul>
                  <li>
                    Users are solely responsible for the content they contribute
                  </li>
                  <li>Trickipedia does not pre-screen user contributions</li>
                  <li>
                    We reserve the right to remove content that violates our
                    Community Guidelines
                  </li>
                  <li>
                    Content moderation is performed by volunteer community
                    moderators
                  </li>
                </ul>
                <h4 className="font-semibold">Your Content Rights</h4>
                <p>
                  By contributing content to Trickipedia, you grant us a
                  non-exclusive, worldwide, royalty-free license to use,
                  display, and distribute your contributions for the purpose of
                  operating the platform. You retain ownership of your content.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Platform Protection & Section 230
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none space-y-4">
                <p>
                  Trickipedia operates as an interactive computer service
                  provider under 47 U.S.C. § 230. We are not liable for
                  user-generated content and maintain immunity for third-party
                  content posted on our platform.
                </p>
                <h4 className="font-semibold">Content Moderation</h4>
                <ul>
                  <li>
                    We moderate content in good faith to maintain community
                    standards
                  </li>
                  <li>
                    Moderation decisions are made by volunteer community
                    moderators
                  </li>
                  <li>
                    We may remove content that violates our guidelines without
                    prior notice
                  </li>
                  <li>
                    Appeals can be submitted to jd@platinumprogramming.com
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Prohibited Uses
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p>You may not use Trickipedia to:</p>
                <ul>
                  <li>Post false, misleading, or harmful information</li>
                  <li>Harass, abuse, or harm other users</li>
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe on intellectual property rights</li>
                  <li>Attempt to gain unauthorized access to the platform</li>
                  <li>Post spam, advertisements, or promotional content</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="prose prose-sm max-w-none">
                <h3 className="font-semibold">Disclaimer of Warranties</h3>
                <p>
                  Trickipedia is provided &quot;as is&quot; without any
                  warranties. Action sports involve inherent risks, and users
                  participate at their own risk. We are not responsible for
                  injuries or damages resulting from the use of information on
                  our platform.
                </p>

                <h3 className="font-semibold">Contact Information</h3>
                <p>
                  For questions about these Terms of Service, please contact us
                  at:
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
