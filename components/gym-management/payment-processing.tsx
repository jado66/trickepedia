"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Plus,
  Trash2,
} from "lucide-react";
import { useGym } from "@/contexts/gym/gym-provider";

export function PaymentProcessing() {
  const { payments, addPayment, removePayment, demoMode, limits } = useGym();

  const handleQuickAdd = async () => {
    const member = prompt("Member name")?.trim();
    if (!member) return;
    const amount = prompt("Amount (numbers only)") || "0";
    const type = prompt("Type (e.g. Monthly Membership)") || "Misc";
    const method = prompt("Method (Card/Cash/etc)") || "Card";
    const status: any = "paid"; // For quick add assume paid
    const res = await addPayment({
      member,
      amount: `$${Number.parseFloat(amount).toFixed(2)}`,
      type,
      status,
      date: new Date().toISOString().split("T")[0],
      method,
    });
    if (!res.success) alert(res.error);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-3 w-3" />;
      case "overdue":
        return <AlertCircle className="h-3 w-3" />;
      default:
        return <CreditCard className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <span>Payment Processing</span>
            <Badge variant="secondary" className="ml-3 text-xs uppercase">
              Beta
            </Badge>
          </h2>
          <p className="text-muted-foreground">
            Manage payments, invoices, and billing
          </p>
        </div>
        <Button
          onClick={handleQuickAdd}
          disabled={demoMode && payments.length >= limits.payments}
        >
          <Plus className="h-4 w-4 mr-2" />
          {demoMode && payments.length >= limits.payments
            ? "Demo Limit"
            : "Process Payment"}
        </Button>
      </div>

      {/* Payment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today&apos;s Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,240</div>
            <p className="text-xs text-muted-foreground">+12% from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Payments
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">$450 total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">$150 total</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Payments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
          <CardDescription>Latest payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">{payment.member}</p>
                    <p className="text-sm text-muted-foreground">
                      {payment.type}
                    </p>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <p className="font-semibold">{payment.amount}</p>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(payment.status)}>
                      {getStatusIcon(payment.status)}
                      <span className="ml-1 capitalize">{payment.status}</span>
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removePayment(payment.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                      <span className="sr-only">Remove payment</span>
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {payment.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
