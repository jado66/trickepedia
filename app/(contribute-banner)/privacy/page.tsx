import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Database, Shield, Cookie } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-lg text-muted-foreground">
              Last updated: 9/1/2025
            </p>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Information We Collect
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none space-y-4">
                <h4 className="font-semibold">Account Information</h4>
                <ul>
                  <li>
                    Email address (for account creation and communication)
                  </li>
                  <li>Username and profile information you provide</li>
                  <li>Authentication data through Supabase</li>
                </ul>

                <h4 className="font-semibold">Content and Contributions</h4>
                <ul>
                  <li>
                    Trick descriptions, tutorials, and media you contribute
                  </li>
                  <li>Comments, edits, and community interactions</li>
                  <li>Moderation actions (for moderators)</li>
                </ul>

                <h4 className="font-semibold">Technical Information</h4>
                <ul>
                  <li>IP address and browser information</li>
                  <li>Usage analytics through Vercel Analytics</li>
                  <li>Device and performance data</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  How We Use Your Information
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p>We use your information to:</p>
                <ul>
                  <li>Provide and maintain the Trickipedia platform</li>
                  <li>Enable user accounts and authentication</li>
                  <li>Display your contributions and profile information</li>
                  <li>Communicate important updates and support responses</li>
                  <li>Improve platform performance and user experience</li>
                  <li>Moderate content and maintain community standards</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Data Protection & Security
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none space-y-4">
                <h4 className="font-semibold">Security Measures</h4>
                <ul>
                  <li>Secure authentication through Supabase</li>
                  <li>Encrypted data transmission (HTTPS)</li>
                  <li>Regular security updates and monitoring</li>
                  <li>Limited access to personal data</li>
                </ul>

                <h4 className="font-semibold">Data Retention</h4>
                <p>
                  We retain your account information as long as your account is
                  active. Contributions to the platform may remain publicly
                  available even after account deletion, as they become part of
                  the community knowledge base.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Cookie className="h-5 w-5 mr-2" />
                  Third-Party Services
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p>We use the following third-party services:</p>
                <ul>
                  <li>
                    <strong>Supabase:</strong> Database and authentication
                    services
                  </li>
                  <li>
                    <strong>Vercel:</strong> Hosting and analytics
                  </li>
                  <li>
                    <strong>Vercel Analytics:</strong> Privacy-focused usage
                    analytics
                  </li>
                </ul>
                <p>
                  These services have their own privacy policies and may collect
                  additional information. We recommend reviewing their privacy
                  policies for more details.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="prose prose-sm max-w-none">
                <h3 className="font-semibold">Your Rights</h3>
                <p>You have the right to:</p>
                <ul>
                  <li>Access and update your account information</li>
                  <li>Delete your account and personal data</li>
                  <li>Request information about data we collect</li>
                  <li>Opt out of non-essential communications</li>
                </ul>

                <h3 className="font-semibold">Contact Us</h3>
                <p>
                  For privacy-related questions or requests, please contact us
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
