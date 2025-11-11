"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Copy, Share2, Users } from "lucide-react";
import { toast } from "sonner";
import { generateReferralLink } from "@/lib/referral-utils";
import ReferredUsersList from "@/components/referred-users-list";
import { ReferredUser } from "@/hooks/use-user-referral-data";

interface ReferralDashboardProps {
  userEmail: string;
  referralCount: number;
  referredUsers: ReferredUser[];
}

export default function ReferralDashboard({
  userEmail,
  referralCount,
  referredUsers,
}: ReferralDashboardProps) {
  const [copied, setCopied] = useState(false);
  const referralLink = generateReferralLink(userEmail);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success(
        "Referral link copied to clipboard. Now go and send it to a friend!"
      );
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join me on Trickipedia!",
          text: "Check out Trickipedia - the world's largest action sports trick database and community!",
          url: referralLink,
        });
      } catch (error) {
        // User cancelled or sharing failed, fall back to copy
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Refer Friends
          </CardTitle>
          <CardDescription>
            Share Trickipedia with friends and earn referral points when they
            sign up!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="referral-link">Your Referral Link</Label>
            <div className="flex gap-2">
              <Input
                id="referral-link"
                value={referralLink}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={handleCopyLink}
                title="Copy link"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={handleShare}
                title="Share link"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
            {copied && (
              <p className="text-sm text-green-600">
                Link copied to clipboard!
              </p>
            )}
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {referralCount}
              </div>
              <div className="text-sm text-muted-foreground">
                {referralCount === 1 ? "person has" : "people have"} signed up
                using your link
              </div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>
              When someone signs up using your referral link, your referral
              count increases. Share your link on social media, with friends, or
              in your community to help grow the Trickipedia database!
            </p>
          </div>
        </CardContent>
      </Card>

      <ReferredUsersList
        referredUsers={referredUsers}
        totalCount={referralCount}
      />
    </div>
  );
}
