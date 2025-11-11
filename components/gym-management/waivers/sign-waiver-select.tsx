import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { WaiverSigningForm } from "./waiver-signing-form";
import { useWaivers } from "@/contexts/waivers/waiver-provider";

export default function SignWaiverSelect({ setWaiverPage }) {
  const { templates } = useWaivers();
  const activeTemplates = templates.filter((t) => t.active);
  const [waiverId, setWaiverId] = useState<string | null>(null);

  if (activeTemplates.length === 0) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-semibold">No Active Waiver Templates</h2>
        <p className="text-muted-foreground">
          Ask an administrator to create or activate a template.
        </p>
        <Button variant="ghost" onClick={() => setWaiverPage("dashboard")}>
          Back
        </Button>
      </div>
    );
  }

  if (activeTemplates.length === 1 || waiverId) {
    return <WaiverSigningForm templateId={waiverId || activeTemplates[0].id} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-12 px-4">
        <div className="mb-6">
          <Button
            variant="ghost"
            className="mb-2 px-0 gap-2 text-sm text-muted-foreground"
            onClick={() => setWaiverPage("dashboard")}
          >
            <ArrowLeft className="h-4 w-4" /> Back to Waivers
          </Button>
        </div>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Sign a Waiver
            </h1>
            <p className="text-muted-foreground">
              Select the waiver you need to complete
            </p>
          </div>

          <div className="space-y-4">
            {activeTemplates.map((template) => (
              <Card
                key={template.id}
                className="bg-card border-border hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <FileText className="w-8 h-8 text-accent mt-1" />
                    <div className="flex-1">
                      <CardTitle className="text-card-foreground">
                        {template.name}
                      </CardTitle>
                      {/* Business name could be added to template later */}
                      <CardDescription className="text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mt-1">
                        {template.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between flex-col sm:flex-row gap-2">
                    <Button
                      className="flex-grow "
                      onClick={() => setWaiverId(template.id)}
                    >
                      Sign This Waiver
                    </Button>

                    <Link href={`/sign-waiver/${template.id}`} target="_blank">
                      <Button
                        variant="outline"
                        className="w-full text-muted-foreground"
                      >
                        Open a Dedicated Waiver Signing Page
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              Don&apos;t see the waiver you&apos;re looking for? Contact the
              facility directly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
