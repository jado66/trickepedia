import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Mail, AlertCircle } from "lucide-react";

export default function DMCAPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">DMCA Policy</h1>
            <p className="text-lg text-muted-foreground">
              Digital Millennium Copyright Act Notice and Takedown Procedure
            </p>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Copyright Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="max-w-none">
                <p>
                  Trickipedia respects the intellectual property rights of
                  others and expects our users to do the same. In accordance
                  with the Digital Millennium Copyright Act of 1998 (DMCA), we
                  will respond expeditiously to claims of copyright infringement
                  committed using our platform.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Filing a DMCA Notice
                </CardTitle>
              </CardHeader>
              <CardContent className="max-w-none space-y-4">
                <p>
                  If you believe that your copyrighted work has been copied in a
                  way that constitutes copyright infringement and is accessible
                  on Trickipedia, please notify our designated copyright agent
                  with the following information:
                </p>

                <h4 className="font-semibold">Required Information</h4>
                <ol>
                  <li>
                    A physical or electronic signature of the copyright owner or
                    authorized agent
                  </li>
                  <li>
                    Identification of the copyrighted work claimed to have been
                    infringed
                  </li>
                  <li>
                    Identification of the material that is claimed to be
                    infringing, including its location on our platform
                  </li>
                  <li>
                    Your contact information (address, telephone number, and
                    email address)
                  </li>
                  <li>
                    A statement that you have a good faith belief that the use
                    is not authorized by the copyright owner
                  </li>
                  <li>
                    A statement that the information in the notification is
                    accurate, and under penalty of perjury, that you are
                    authorized to act on behalf of the copyright owner
                  </li>
                </ol>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  Designated Copyright Agent
                </CardTitle>
              </CardHeader>
              <CardContent className="max-w-none">
                <p>
                  Please send DMCA notices to our designated copyright agent:
                </p>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="font-semibold">DMCA Agent</p>
                  <p>
                    Email:{" "}
                    <a
                      href="mailto:jd@platinumprogramming.com"
                      className="text-primary hover:underline"
                    >
                      jd@platinumprogramming.com
                    </a>
                  </p>
                  <p>Subject Line: &quot;DMCA Takedown Notice&quot;</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Counter-Notification Process</CardTitle>
              </CardHeader>
              <CardContent className="max-w-none space-y-4">
                <p>
                  If you believe that your content was removed or disabled by
                  mistake or misidentification, you may file a
                  counter-notification with the following information:
                </p>

                <ol>
                  <li>Your physical or electronic signature</li>
                  <li>
                    Identification of the material that was removed and its
                    location before removal
                  </li>
                  <li>
                    A statement under penalty of perjury that you have a good
                    faith belief that the material was removed as a result of
                    mistake or misidentification
                  </li>
                  <li>
                    Your contact information and a statement that you consent to
                    the jurisdiction of the Federal District Court for your
                    address
                  </li>
                </ol>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="max-w-none">
                <h3 className="font-semibold">Repeat Infringer Policy</h3>
                <p>
                  Trickipedia will terminate user accounts that are determined
                  to be repeat infringers of copyright.
                </p>

                <h3 className="font-semibold">Good Faith Requirement</h3>
                <p>
                  Please note that filing a false DMCA notice may result in
                  liability for damages, including costs and attorney fees. We
                  recommend consulting with an attorney before filing a DMCA
                  notice.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
