"use client";

import { useState } from "react";
import { useGym } from "@/contexts/gym/gym-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  Plus,
  FileText,
  Clock,
  CheckCircle,
  Search,
} from "lucide-react";

// Local interface left minimal if TS needs shape hints; actual types from provider
interface IncidentBasic {
  id: string;
  memberName: string;
  incidentType: string;
  severity: string;
  status: string;
  dateTime: string;
  location: string;
  description: string;
  staffMember: string;
  actionTaken: string;
  followUpRequired: boolean;
}

export function IncidentReporting() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { incidents, addIncident, updateIncident, staff, demoMode, limits } =
    useGym();

  const handleAddIncident = async (formData: FormData) => {
    const res = await addIncident({
      memberName: formData.get("memberName") as string,
      incidentType: formData.get("incidentType") as string,
      severity: formData.get("severity") as any,
      dateTime: `${formData.get("date")}T${formData.get("time")}:00`,
      location: formData.get("location") as string,
      description: formData.get("description") as string,
      injuryDetails: (formData.get("injuryDetails") as string) || undefined,
      witnessName: (formData.get("witnessName") as string) || undefined,
      staffMember: formData.get("staffMember") as string,
      actionTaken: formData.get("actionTaken") as string,
      followUpRequired: formData.get("followUpRequired") === "yes",
      parentNotified: formData.get("parentNotified") === "yes",
    });
    if (!res.success) return alert(res.error);
    setIsAddDialogOpen(false);
  };

  const filteredIncidents = incidents.filter(
    (incident) =>
      incident.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.incidentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "minor":
        return "bg-yellow-100 text-yellow-800";
      case "moderate":
        return "bg-orange-100 text-orange-800";
      case "serious":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "reported":
        return "bg-blue-100 text-blue-800";
      case "investigating":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "reported":
        return <FileText className="h-3 w-3" />;
      case "investigating":
        return <Clock className="h-3 w-3" />;
      case "resolved":
        return <CheckCircle className="h-3 w-3" />;
      default:
        return <FileText className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Incident Reporting</h2>
          <p className="text-muted-foreground">
            Track and manage safety incidents and injuries
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Report Incident
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Report New Incident</DialogTitle>
              <DialogDescription>
                Document any safety incidents, injuries, or near misses.
              </DialogDescription>
            </DialogHeader>
            <form action={handleAddIncident} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="memberName">Member Name</Label>
                  <Input id="memberName" name="memberName" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="staffMember">Reporting Staff Member</Label>
                  <Select name="staffMember" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select staff member" />
                    </SelectTrigger>
                    <SelectContent>
                      {staff.map((s: any) => (
                        <SelectItem key={s.id} value={s.name}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" name="date" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input id="time" name="time" type="time" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Select name="location" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Main Gym">Main Gym</SelectItem>
                      <SelectItem value="Tumbling Area">
                        Tumbling Area
                      </SelectItem>
                      <SelectItem value="Parkour Zone">Parkour Zone</SelectItem>
                      <SelectItem value="Fitness Area">Fitness Area</SelectItem>
                      <SelectItem value="Reception">Reception</SelectItem>
                      <SelectItem value="Changing Rooms">
                        Changing Rooms
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="incidentType">Incident Type</Label>
                  <Select name="incidentType" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select incident type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Minor Injury">Minor Injury</SelectItem>
                      <SelectItem value="Serious Injury">
                        Serious Injury
                      </SelectItem>
                      <SelectItem value="Equipment Issue">
                        Equipment Issue
                      </SelectItem>
                      <SelectItem value="Near Miss">Near Miss</SelectItem>
                      <SelectItem value="Behavioral Issue">
                        Behavioral Issue
                      </SelectItem>
                      <SelectItem value="Property Damage">
                        Property Damage
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="severity">Severity</Label>
                  <Select name="severity" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minor">Minor</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="serious">Serious</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Incident Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Detailed description of what happened..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="injuryDetails">
                  Injury Details (if applicable)
                </Label>
                <Textarea
                  id="injuryDetails"
                  name="injuryDetails"
                  placeholder="Description of any injuries sustained..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="witnessName">Witness Name</Label>
                  <Input
                    id="witnessName"
                    name="witnessName"
                    placeholder="Name of any witnesses"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parentNotified">
                    Parent/Guardian Notified?
                  </Label>
                  <Select name="parentNotified">
                    <SelectTrigger>
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="na">N/A (Adult Member)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="actionTaken">Action Taken</Label>
                <Textarea
                  id="actionTaken"
                  name="actionTaken"
                  placeholder="Describe immediate actions taken..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="followUpRequired">Follow-up Required?</Label>
                <Select name="followUpRequired">
                  <SelectTrigger>
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Submit Report</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Stats */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search incidents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex space-x-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-blue-600">
              {incidents.filter((i: any) => i.status === "reported").length}
            </div>
            <div className="text-muted-foreground">Reported</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-yellow-600">
              {
                incidents.filter((i: any) => i.status === "investigating")
                  .length
              }
            </div>
            <div className="text-muted-foreground">Investigating</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-green-600">
              {incidents.filter((i: any) => i.status === "resolved").length}
            </div>
            <div className="text-muted-foreground">Resolved</div>
          </div>
        </div>
      </div>

      {/* Incidents List */}
      <div className="grid gap-4">
        {filteredIncidents.map((incident: any) => (
          <Card key={incident.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    <h3 className="font-semibold text-lg">
                      {incident.memberName}
                    </h3>
                    <Badge variant="outline">{incident.incidentType}</Badge>
                    <Badge className={getSeverityColor(incident.severity)}>
                      {String(incident.severity).toUpperCase()}
                    </Badge>
                    <Badge className={getStatusColor(incident.status)}>
                      {getStatusIcon(incident.status)}
                      <span className="ml-1 capitalize">{incident.status}</span>
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                    <div>
                      <p className="font-medium">Date & Time</p>
                      <p className="text-muted-foreground">
                        {new Date(incident.dateTime).toLocaleDateString()} at{" "}
                        {new Date(incident.dateTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-muted-foreground">
                        {incident.location}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Staff Member</p>
                      <p className="text-muted-foreground">
                        {incident.staffMember}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Follow-up Required</p>
                      <p className="text-muted-foreground">
                        {incident.followUpRequired ? "Yes" : "No"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="font-medium text-sm mb-1">Description:</p>
                      <p className="text-sm">{incident.description}</p>
                    </div>
                    {incident.injuryDetails && (
                      <div className="p-3 bg-red-50 rounded-lg">
                        <p className="font-medium text-sm mb-1">
                          Injury Details:
                        </p>
                        <p className="text-sm">{incident.injuryDetails}</p>
                      </div>
                    )}
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="font-medium text-sm mb-1">Action Taken:</p>
                      <p className="text-sm">{incident.actionTaken}</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  {/* Full report dialog */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        View Full Report
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>Incident Report</DialogTitle>
                        <DialogDescription>
                          Full incident details for {incident.memberName}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="p-4 bg-muted rounded-md">
                          <p className="font-medium">Member</p>
                          <p className="text-sm">{incident.memberName}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-muted rounded-md">
                            <p className="font-medium">Type</p>
                            <p className="text-sm">{incident.incidentType}</p>
                          </div>
                          <div className="p-4 bg-muted rounded-md">
                            <p className="font-medium">Severity</p>
                            <p className="text-sm">{incident.severity}</p>
                          </div>
                        </div>
                        <div className="p-4 bg-muted rounded-md">
                          <p className="font-medium">Description</p>
                          <p className="text-sm">{incident.description}</p>
                        </div>
                        {incident.injuryDetails && (
                          <div className="p-4 bg-red-50 rounded-md">
                            <p className="font-medium">Injury Details</p>
                            <p className="text-sm">{incident.injuryDetails}</p>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-muted rounded-md">
                            <p className="font-medium">Staff</p>
                            <p className="text-sm">{incident.staffMember}</p>
                          </div>
                          <div className="p-4 bg-muted rounded-md">
                            <p className="font-medium">Location</p>
                            <p className="text-sm">{incident.location}</p>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Inline status select */}
                  <Select
                    value={incident.status}
                    onValueChange={(v) =>
                      updateIncident(incident.id, {
                        status: v as "reported" | "investigating" | "resolved",
                      })
                    }
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reported">Reported</SelectItem>
                      <SelectItem value="investigating">
                        Investigating
                      </SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
