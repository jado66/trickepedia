import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bug, Calendar, Mail, User } from "lucide-react";
import { getBugReports } from "../../actions/bug-report";

import { DeleteBugButton } from "@/components/delete-bug-button";

export default async function AdminBugsPage() {
  const { data: bugs, error } = await getBugReports();

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">
              Error loading bug reports: {error}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Bug Reports</h1>
        <p className="text-muted-foreground">
          View and manage all submitted bug reports
        </p>
      </div>

      <div className="grid gap-4">
        {bugs && bugs.length > 0 ? (
          bugs.map((bug) => (
            <Card key={bug.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <CardTitle className="text-xl">{bug.title}</CardTitle>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(bug.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      {bug.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5" />
                          {bug.email}
                        </div>
                      )}
                      {bug.user_id && (
                        <div className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          Authenticated User
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        bug.priority === "high"
                          ? "destructive"
                          : bug.priority === "medium"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {bug.priority}
                    </Badge>
                    <DeleteBugButton id={bug.id} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {bug.description}
                </p>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bug className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No bug reports submitted yet
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
