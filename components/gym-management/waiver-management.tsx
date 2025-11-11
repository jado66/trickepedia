"use client";

import { Badge } from "@/components/ui/badge";

import { WaiverDashboard } from "./waivers/waiver-dashboard";
import { useState } from "react";
import SignWaiverSelect from "./waivers/sign-waiver-select";
import { TemplateManager } from "./waivers/template-manager";

// Local interface retained only if needed for TS hints; actual types from provider
interface WaiverBasic {
  id: string;
  memberName: string;
  memberEmail: string;
  waiverType: string;
  status: string;
  signedDate?: string;
  expiryDate: string;
  guardianName?: string;
  guardianSignature?: boolean;
  notes: string;
}

export function WaiverManagement() {
  const [waiverPage, setWaiverPage] = useState("dashboard");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <span>Waiver Management</span>
            <Badge variant="secondary" className="ml-3 text-xs uppercase">
              Beta
            </Badge>
          </h2>
          <p className="text-muted-foreground">
            Manage liability waivers and legal documents
          </p>
        </div>
      </div>

      {waiverPage === "dashboard" && (
        <WaiverDashboard setWaiverPage={setWaiverPage} />
      )}

      {waiverPage === "sign" && (
        <SignWaiverSelect setWaiverPage={setWaiverPage} />
      )}

      {waiverPage === "templates" && (
        <TemplateManager setWaiverPage={setWaiverPage} />
      )}
    </div>
  );
}
