"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, UserCheck, User, Check, X } from "lucide-react";

const rolePermissions = {
  admin: {
    icon: Shield,
    color: "destructive",
    permissions: [
      { name: "User Management", granted: true },
      { name: "Role Assignment", granted: true },
      { name: "System Settings", granted: true },
      { name: "Content Moderation", granted: true },
      { name: "Analytics Access", granted: true },
      { name: "Bulk Operations", granted: true },
    ],
  },
  moderator: {
    icon: UserCheck,
    color: "secondary",
    permissions: [
      { name: "User Management", granted: false },
      { name: "Role Assignment", granted: false },
      { name: "System Settings", granted: false },
      { name: "Content Moderation", granted: true },
      { name: "Analytics Access", granted: true },
      { name: "Bulk Operations", granted: false },
    ],
  },
  user: {
    icon: User,
    color: "outline",
    permissions: [
      { name: "User Management", granted: false },
      { name: "Role Assignment", granted: false },
      { name: "System Settings", granted: false },
      { name: "Content Moderation", granted: false },
      { name: "Analytics Access", granted: false },
      { name: "Bulk Operations", granted: false },
    ],
  },
};

export function RolePermissionsOverview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Role Permissions Overview</CardTitle>
        <CardDescription>
          Compare permissions across different user roles
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(rolePermissions).map(([role, config]) => {
            const IconComponent = config.icon;
            return (
              <div key={role} className="space-y-4">
                <div className="flex items-center gap-2">
                  <IconComponent className="h-5 w-5" />
                  <Badge variant={config.color as any} className="capitalize">
                    {role}
                  </Badge>
                </div>

                <div className="space-y-2">
                  {config.permissions.map((permission) => (
                    <div
                      key={permission.name}
                      className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                    >
                      <span className="text-sm">{permission.name}</span>
                      {permission.granted ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
