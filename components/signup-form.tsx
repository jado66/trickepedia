"use client";

import { signup } from "@/app/(trickipedia)/actions/auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PasswordInput from "@/components/password-input";
import { Label } from "@/components/ui/label";
import { useState, useTransition, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import Link from "next/link";
import { useUser } from "@/contexts/user-provider";

export default function SignUpForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [referralEmail, setReferralEmail] = useState<string>("");
  const [isReferralFromUrl, setIsReferralFromUrl] = useState<boolean>(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  // Auto-populate referral email from query params
  useEffect(() => {
    const refParam = searchParams.get("ref");
    if (refParam) {
      setReferralEmail(refParam);
      setIsReferralFromUrl(true);
    }
  }, [searchParams]);

  const handleSignUp = async (formData: FormData) => {
    setError(null);

    // Add referral email to form data
    if (referralEmail.trim()) {
      formData.append("referral_email", referralEmail.trim());
    }

    startTransition(async () => {
      const result = await signup(formData);

      if (!result.success) {
        setError(result.error || "Failed to sign up");
        toast.error(result.error || "Failed to sign up");
      } else {
        toast.success("Account created successfully!");
        // Small delay to allow auth state to propagate
        setTimeout(() => {
          router.push("/dashboard");
        }, 100);
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-2 border-grey-600 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-extrabold text-grey-600 tracking-tight">
            Join Trickipedia
          </CardTitle>
          <CardDescription className="text-base text-grey-500 mt-2">
            Create your account and start contributing to the world&apos;s
            largest action sports trick database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSignUp} className="space-y-4" autoComplete="off">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first-name">First Name</Label>
                <Input
                  id="first-name"
                  name="first_name"
                  required
                  placeholder="First name"
                  className="bg-white/80"
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name">Last Name</Label>
                <Input
                  id="last-name"
                  name="last_name"
                  required
                  placeholder="Last name"
                  className="bg-white/80"
                  disabled={isPending}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <Input
                id="signup-email"
                name="email"
                type="email"
                required
                placeholder="john@example.com"
                className="bg-white/80"
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-password">Password</Label>
              <PasswordInput
                id="signup-password"
                name="password"
                required
                minLength={6}
                placeholder="Create a password"
                className="bg-white/80"
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="referral-email">
                Referral Email{" "}
                <span className="text-grey-400 text-sm">(Optional)</span>
                {isReferralFromUrl && (
                  <span className="text-xs text-blue-600 ml-1">(From URL)</span>
                )}
              </Label>
              <Input
                id="referral-email"
                type="email"
                placeholder="friend@example.com"
                className="bg-white/80"
                disabled={isPending}
                value={referralEmail}
                onChange={(e) => setReferralEmail(e.target.value)}
                readOnly={isReferralFromUrl}
              />
              <p className="text-xs text-grey-500">
                {isReferralFromUrl
                  ? "You were referred by this email address. This cannot be changed."
                  : "Enter the email of the person who referred you to earn them a referral point!"}
              </p>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-grey-600">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
