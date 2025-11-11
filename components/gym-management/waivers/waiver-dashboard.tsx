"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Download,
  Eye,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle,
  Plus,
  Settings,
  Pen,
} from "lucide-react";
import { WaiverDetailsModal } from "./waiver-details-modal";
import { ExpirationManager } from "./expiration-manager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useWaivers } from "@/contexts/waivers/waiver-provider";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function WaiverDashboard({ setWaiverPage }) {
  const { signedWaivers, stats, deleteWaiver } = useWaivers();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [templateFilter, setTemplateFilter] = useState("all");
  const [selectedWaiver, setSelectedWaiver] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [waiverToDelete, setWaiverToDelete] = useState<any>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Filter and search logic
  const filteredWaivers = useMemo(() => {
    const needle = searchTerm.toLowerCase();
    return signedWaivers.filter((waiver) => {
      const name = (waiver.participantName || "").toLowerCase();
      const matchesSearch = name.includes(needle);
      const matchesStatus =
        statusFilter === "all" || waiver.status === statusFilter;
      const matchesTemplate =
        templateFilter === "all" || waiver.templateName === templateFilter;

      return matchesSearch && matchesStatus && matchesTemplate;
    });
  }, [searchTerm, statusFilter, templateFilter, signedWaivers]);

  // Get unique templates for filter
  const uniqueTemplates = Array.from(
    new Set(signedWaivers.map((w) => w.templateName))
  );

  const handleViewDetails = (waiver: any) => {
    setSelectedWaiver(waiver);
    setShowDetailsModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
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

  const isExpiringSoon = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    const expiryDate = new Date(expiresAt);
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    return expiryDate <= thirtyDaysFromNow;
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="records" className="w-full">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <TabsList>
            <TabsTrigger value="records">Records</TabsTrigger>
            <TabsTrigger value="expiration">Expiring Waivers </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Button
              size="lg"
              className="gap-1 "
              variant="default"
              onClick={() => setWaiverPage("sign")}
            >
              <Pen className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Waivers</span>
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="gap-1"
              variant="default"
              onClick={() => setWaiverPage("templates")}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Manage Templates</span>
            </Button>

            <Button size="sm" variant="outline" className="gap-1">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export CSV</span>
            </Button>
          </div>
        </div>

        <TabsContent value="records" className="space-y-6 mt-2">
          {/* Statistics Cards */}

          {/* Search and Filters */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">
                Search & Filter
              </CardTitle>
              <CardDescription>
                Find participants by name and filter by status or template
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="search">Search by Name</Label>
                  <div className="relative mt-2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="search"
                      placeholder="Enter participant name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="status-filter" className="mb-2">
                    Status
                  </Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="template-filter" className="mb-2">
                    Waiver Template
                  </Label>
                  <Select
                    value={templateFilter}
                    onValueChange={setTemplateFilter}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Templates</SelectItem>
                      {uniqueTemplates.map((template) => (
                        <SelectItem key={template} value={template}>
                          {template}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-card-foreground">
                  Waiver Records
                </CardTitle>
                <CardDescription>
                  Showing {filteredWaivers.length} of {signedWaivers.length}{" "}
                  waivers
                </CardDescription>
              </div>
              <Button variant="outline" className="gap-2 bg-transparent">
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              {filteredWaivers.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-card-foreground mb-2">
                    No waivers found
                  </h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search terms or filters
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredWaivers.map((waiver) => (
                    <div
                      key={waiver.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-card-foreground">
                            {waiver.participantName}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {waiver.email}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {waiver.templateName}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-card-foreground">
                            Signed: {formatDate(waiver.signedAt)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {waiver.expiresAt
                              ? `Expires: ${formatDate(waiver.expiresAt)}`
                              : "Never expires"}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge
                            className={`${getStatusColor(
                              waiver.status
                            )} border`}
                          >
                            {waiver.status === "active" ? "Active" : "Expired"}
                          </Badge>
                          {waiver.status === "active" &&
                            isExpiringSoon(waiver.expiresAt) && (
                              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 border">
                                Expiring Soon
                              </Badge>
                            )}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(waiver)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setWaiverToDelete(waiver);
                            setConfirmOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <User className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-card-foreground">
                      {stats.total}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Total Waivers
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-card-foreground">
                      {stats.active}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Active Waivers
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-card-foreground">
                      {stats.expired}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Expired Waivers
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-card-foreground">
                      {stats.expiringSoon}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Expiring Soon
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Details Modal */}
          {showDetailsModal && selectedWaiver && (
            <WaiverDetailsModal
              waiver={selectedWaiver}
              isOpen={showDetailsModal}
              onClose={() => setShowDetailsModal(false)}
            />
          )}
        </TabsContent>
        <TabsContent value="expiration" className="mt-4">
          <ExpirationManager />
        </TabsContent>
      </Tabs>
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Waiver</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently remove the
              waiver record for {waiverToDelete?.participantName}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (waiverToDelete) {
                  await deleteWaiver(waiverToDelete.id);
                }
                setConfirmOpen(false);
                setWaiverToDelete(null);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
