"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Shield, UserCheck, User } from "lucide-react";

interface UserRoleManagerProps {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    createdAt: string;
    lastLogin: string;
  };
  onRoleUpdate: (userId: string, newRole: string) => void;
  onCancel: () => void;
}

const roleDescriptions = {
  administrator: {
    icon: Shield,
    description: "Full system access with all administrative privileges",
    color: "destructive",
  },
  moderator: {
    icon: UserCheck,
    description: "Can manage users and moderate content",
    color: "secondary",
  },
  user: {
    icon: User,
    description: "Standard user with basic access permissions",
    color: "outline",
  },
};

export function UserRoleManager({
  user,
  onRoleUpdate,
  onCancel,
}: UserRoleManagerProps) {
  const [selectedRole, setSelectedRole] = useState(user.role);

  const handleSave = () => {
    onRoleUpdate(user.id, selectedRole);
  };

  const currentRoleInfo =
    roleDescriptions[selectedRole as keyof typeof roleDescriptions];
  const IconComponent = currentRoleInfo?.icon || User;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
            <User className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="role-select">Current Role</Label>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                roleDescriptions[user.role as keyof typeof roleDescriptions]
                  ?.color as any
              }
            >
              {user.role}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Member since {user.createdAt}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="role-select">New Role</Label>
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="administrator">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-destructive" />
                  Administrator
                </div>
              </SelectItem>
              <SelectItem value="moderator">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-secondary" />
                  Moderator
                </div>
              </SelectItem>
              <SelectItem value="user">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  User
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {currentRoleInfo && (
          <div className="rounded-lg border p-4 space-y-2">
            <div className="flex items-center gap-2">
              <IconComponent className="h-4 w-4" />
              <span className="font-medium capitalize">
                {selectedRole} Permissions
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {currentRoleInfo.description}
            </p>
          </div>
        )}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={selectedRole === user.role}>
          Update Role
        </Button>
      </DialogFooter>
    </div>
  );
}
