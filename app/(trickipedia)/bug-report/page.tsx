import { BugReportForm } from "@/components/bug-report-form";

export default function BugReportPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Report a Bug
          </h1>
          <p className="text-lg text-muted-foreground text-pretty">
            Help us improve by reporting any issues you encounter. We appreciate
            your feedback and will investigate every report.
          </p>
        </div>

        <BugReportForm />
      </div>
    </main>
  );
}
