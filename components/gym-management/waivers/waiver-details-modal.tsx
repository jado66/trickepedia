"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Download,
  Mail,
  Phone,
  Calendar,
  User,
  Shield,
  FileText,
  X,
} from "lucide-react";

interface WaiverDetailsModalProps {
  waiver: any;
  isOpen: boolean;
  onClose: () => void;
}

export function WaiverDetailsModal({
  waiver,
  isOpen,
  onClose,
}: WaiverDetailsModalProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "expired":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const isExpiringSoon = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    const expiryDate = new Date(expiresAt);
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    return expiryDate <= thirtyDaysFromNow;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Waiver Details</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className={`${getStatusColor(waiver.status)} border`}>
                {waiver.status === "active" ? "Active" : "Expired"}
              </Badge>
              {waiver.status === "active" &&
                isExpiringSoon(waiver.expiresAt) && (
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 border">
                    Expiring Soon
                  </Badge>
                )}
            </div>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>

          {/* Participant Information */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <User className="w-5 h-5" />
                Participant Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-card-foreground text-lg">
                    {waiver.participantName}
                  </h4>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {waiver.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {waiver.phone}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Born:{" "}
                        {new Date(waiver.dateOfBirth).toLocaleDateString()}{" "}
                        (Age: {calculateAge(waiver.dateOfBirth)})
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-card-foreground mb-2">
                    Emergency Contact
                  </h5>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {waiver.emergencyContact}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {waiver.emergencyPhone}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {waiver.medicalConditions &&
                waiver.medicalConditions !== "None" && (
                  <>
                    <Separator />
                    <div>
                      <h5 className="font-medium text-card-foreground mb-2">
                        Medical Conditions
                      </h5>
                      <p className="text-sm text-muted-foreground bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                        {waiver.medicalConditions}
                      </p>
                    </div>
                  </>
                )}
            </CardContent>
          </Card>

          {/* Waiver Information */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <FileText className="w-5 h-5" />
                Waiver Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-card-foreground">
                    Template
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {waiver.templateName}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-card-foreground">
                    Status
                  </Label>
                  <p className="text-sm text-muted-foreground capitalize">
                    {waiver.status}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-card-foreground">
                    Signed Date
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(waiver.signedAt)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-card-foreground">
                    Expiration Date
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {waiver.expiresAt
                      ? formatDate(waiver.expiresAt)
                      : "Never expires"}
                  </p>
                </div>
              </div>

              {waiver.status === "active" && waiver.expiresAt && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <div>
                      <h5 className="font-medium text-blue-900">
                        Waiver Valid
                      </h5>
                      <p className="text-sm text-blue-700">
                        This waiver is currently active and valid for
                        participation.
                        {isExpiringSoon(waiver.expiresAt) &&
                          " However, it will expire soon."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {waiver.status === "expired" && (
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-red-600" />
                    <div>
                      <h5 className="font-medium text-red-900">
                        Waiver Expired
                      </h5>
                      <p className="text-sm text-red-700">
                        This waiver has expired. The participant needs to sign a
                        new waiver before participating.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" className="flex-1 bg-transparent">
              <Mail className="w-4 h-4 mr-2" />
              Send Reminder
            </Button>
            <Button variant="outline" className="flex-1 bg-transparent">
              <FileText className="w-4 h-4 mr-2" />
              View Signature
            </Button>
            <Button variant="outline" className="flex-1 bg-transparent">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Label({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <label className={className}>{children}</label>;
}
