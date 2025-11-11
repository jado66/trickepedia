"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Users } from "lucide-react";

interface Minor {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  relationship: string;
}

interface MinorChildrenManagerProps {
  minors: Minor[];
  onChange: (minors: Minor[]) => void;
  maxMinors: number;
}

export function MinorChildrenManager({
  minors,
  onChange,
  maxMinors,
}: MinorChildrenManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMinor, setNewMinor] = useState<Partial<Minor>>({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    relationship: "child",
  });

  const handleAddMinor = () => {
    if (newMinor.firstName && newMinor.lastName && newMinor.dateOfBirth) {
      const minor: Minor = {
        id: Date.now().toString(),
        firstName: newMinor.firstName,
        lastName: newMinor.lastName,
        dateOfBirth: newMinor.dateOfBirth,
        relationship: newMinor.relationship || "child",
      };
      onChange([...minors, minor]);
      setNewMinor({
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        relationship: "child",
      });
      setShowAddForm(false);
    }
  };

  const handleRemoveMinor = (id: string) => {
    onChange(minors.filter((minor) => minor.id !== id));
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Minor Children</span>
          <Badge variant="secondary" className="text-xs">
            {minors.length} / {maxMinors}
          </Badge>
        </div>
        {minors.length < maxMinors && (
          <Button
            size="sm"
            onClick={() => setShowAddForm(true)}
            disabled={showAddForm}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Child
          </Button>
        )}
      </div>

      {minors.length === 0 && !showAddForm && (
        <div className="text-center py-6 text-muted-foreground">
          <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No minor children added</p>
          <p className="text-xs">
            You can add up to {maxMinors} children to this waiver
          </p>
        </div>
      )}

      {/* Existing Minors */}
      {minors.map((minor) => (
        <Card key={minor.id} className="bg-muted/30 border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">
                  {minor.firstName} {minor.lastName}
                </div>
                <div className="text-xs text-muted-foreground">
                  Age: {calculateAge(minor.dateOfBirth)} • {minor.relationship}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRemoveMinor(minor.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Add Minor Form */}
      {showAddForm && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Add Minor Child</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm">
                  First Name *
                </Label>
                <Input
                  id="firstName"
                  value={newMinor.firstName || ""}
                  onChange={(e) =>
                    setNewMinor({ ...newMinor, firstName: e.target.value })
                  }
                  placeholder="Child's first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm">
                  Last Name *
                </Label>
                <Input
                  id="lastName"
                  value={newMinor.lastName || ""}
                  onChange={(e) =>
                    setNewMinor({ ...newMinor, lastName: e.target.value })
                  }
                  placeholder="Child's last name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="text-sm">
                  Date of Birth *
                </Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={newMinor.dateOfBirth || ""}
                  onChange={(e) =>
                    setNewMinor({ ...newMinor, dateOfBirth: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="relationship" className="text-sm">
                  Relationship
                </Label>
                <Select
                  value={newMinor.relationship}
                  onValueChange={(value) =>
                    setNewMinor({ ...newMinor, relationship: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="child">Child</SelectItem>
                    <SelectItem value="ward">Ward</SelectItem>
                    <SelectItem value="stepchild">Stepchild</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddMinor}
                className="bg-accent hover:bg-accent/90"
              >
                Add Child
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
