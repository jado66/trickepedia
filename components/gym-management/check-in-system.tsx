"use client";

import { useState, useMemo, useRef } from "react";
import { useGym } from "@/contexts/gym/gym-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, CheckCircle, Clock, Users, X, Undo2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export function CheckInSystem() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [selectedClassId, setSelectedClassId] =
    useState<string>("open-training");
  const { members, classes, updateMember } = useGym();
  const { toast } = useToast();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter members based on search
  const filteredMembers = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const search = searchTerm.toLowerCase();
    return members
      .filter(
        (m) =>
          m.name.toLowerCase().includes(search) ||
          m.email.toLowerCase().includes(search) ||
          m.phone.includes(search)
      )
      .slice(0, 5); // Limit to 5 results
  }, [searchTerm, members]);

  // Get today's check-ins (members who visited today)
  const today = new Date().toISOString().split("T")[0];
  const todayCheckIns = useMemo(() => {
    return members
      .filter((m) => m.lastVisit === today)
      .map((m) => ({
        id: m.id,
        member: m.name,
        avatar: m.avatar,
        class: "Open Training", // Could be enhanced with actual class tracking
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: "checked-in" as const,
      }))
      .slice(0, 10); // Show last 10 check-ins
  }, [members, today]);

  // Get upcoming classes for today
  const upcomingClasses = useMemo(() => {
    return classes
      .filter((c) => c.status === "active")
      .slice(0, 4)
      .map((c) => ({
        id: c.id,
        name: c.name,
        time: c.time.split("-")[0].trim(),
        instructors: c.instructors || [],
        capacity: c.capacity,
        checkedIn: c.enrolled || 0,
      }));
  }, [classes]);

  // Handle check-in
  const handleCheckIn = async () => {
    if (!selectedMemberId) {
      toast({
        title: "No member selected",
        description: "Please search and select a member to check in.",
        variant: "destructive",
      });
      return;
    }

    const member = members.find((m) => m.id === selectedMemberId);
    if (!member) return;

    // Update member's last visit to today
    const result = await updateMember(selectedMemberId, {
      lastVisit: today,
    });

    if (result.success) {
      toast({
        title: "Check-in successful!",
        description: `${member.name} has been checked in.`,
      });
      // Reset form but preserve selected class
      setSearchTerm("");
      setSelectedMemberId(null);
      // Don't reset selectedClassId - preserve it for batch check-ins
    } else {
      toast({
        title: "Check-in failed",
        description: result.error || "An error occurred during check-in.",
        variant: "destructive",
      });
    }
  };

  // Handle undo check-in
  const handleUndoCheckIn = async (memberId: string, memberName: string) => {
    const member = members.find((m) => m.id === memberId);
    if (!member) return;

    // Find the previous visit date (if any) or set to empty string
    const result = await updateMember(memberId, {
      lastVisit: "", // Clear today's check-in
    });

    if (result.success) {
      toast({
        title: "Check-in removed",
        description: `${memberName}'s check-in has been undone.`,
      });
    } else {
      toast({
        title: "Undo failed",
        description:
          result.error || "An error occurred while undoing check-in.",
        variant: "destructive",
      });
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCheckIn();
    }
  };

  // Select member from search results
  const selectMember = (memberId: string) => {
    setSelectedMemberId(memberId);
    const member = members.find((m) => m.id === memberId);
    if (member) {
      setSearchTerm(member.name);
    }
    // Refocus the input so Enter key works after selecting
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Check-in System</h2>
          <p className="text-muted-foreground">
            Manage member check-ins and class attendance
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{todayCheckIns.length}</div>
          <p className="text-sm text-muted-foreground">Check-ins today</p>
        </div>
      </div>

      {/* Quick Check-in */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Check-in</CardTitle>
          <CardDescription>Search for members to check them in</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  placeholder="Search member name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setSelectedMemberId(null);
                  }}
                  onKeyPress={handleKeyPress}
                  className="pl-10"
                />
                {selectedMemberId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedMemberId(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Select
                value={selectedClassId}
                onValueChange={setSelectedClassId}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open-training">Open Training</SelectItem>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleCheckIn} disabled={!selectedMemberId}>
                Check In
              </Button>
            </div>

            {/* Search Results Dropdown */}
            {searchTerm && !selectedMemberId && filteredMembers.length > 0 && (
              <Card>
                <CardContent className="p-2">
                  <div className="space-y-1">
                    {filteredMembers.map((member) => (
                      <Button
                        key={member.id}
                        variant="ghost"
                        className="w-full justify-start h-auto p-3"
                        onClick={() => selectMember(member.id)}
                      >
                        <Avatar className="h-8 w-8 mr-3">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-left flex-1">
                          <p className="font-medium">{member.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {member.email} • {member.phone}
                          </p>
                        </div>
                        <Badge
                          variant={
                            member.status === "active" ? "default" : "secondary"
                          }
                        >
                          {member.status}
                        </Badge>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {searchTerm &&
              !selectedMemberId &&
              filteredMembers.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  No members found matching &quot;{searchTerm}&quot;
                </p>
              )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Check-ins */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              Today&apos;s Check-ins
            </CardTitle>
            <CardDescription>
              {todayCheckIns.length} members checked in today
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todayCheckIns.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>No check-ins today yet</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {todayCheckIns.map((checkIn) => (
                  <div
                    key={checkIn.id}
                    className="flex items-center justify-between p-3 border rounded-lg group"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={checkIn.avatar} />
                        <AvatarFallback>
                          {checkIn.member
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{checkIn.member}</p>
                        <p className="text-sm text-muted-foreground">
                          {checkIn.class}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Checked In
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() =>
                          handleUndoCheckIn(checkIn.id, checkIn.member)
                        }
                        title="Undo check-in"
                      >
                        <Undo2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Classes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-600" />
              Upcoming Classes
            </CardTitle>
            <CardDescription>Classes starting soon</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingClasses.map((classItem) => (
                <div key={classItem.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{classItem.name}</h3>
                    <Badge variant="outline">{classItem.time}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Instructor{classItem.instructors.length > 1 ? "s" : ""}:{" "}
                    {classItem.instructors.length
                      ? classItem.instructors.join(", ")
                      : "TBD"}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-1" />
                      {classItem.checkedIn}/{classItem.capacity}
                    </div>
                    <Button variant="outline" size="sm">
                      View Roster
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
