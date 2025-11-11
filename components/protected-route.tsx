"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@/contexts/user-provider";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireModerator?: boolean;
  requireAdmin?: boolean;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  requireAuth = false,
  requireModerator = false,
  requireAdmin = false,
  redirectTo = "/login",
  fallback,
}: ProtectedRouteProps) {
  const { user, isLoading: loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    // Check authentication
    if (requireAuth && !user) {
      // Store the attempted URL for redirect after login
      const redirectUrl = `${redirectTo}?from=${encodeURIComponent(pathname)}`;
      router.push(redirectUrl);
      return;
    }

    // Check role-based access
    if (user) {
      const userRole = user.role;

      // Admin requirement
      if (requireAdmin && userRole !== "administrator") {
        router.push("/unauthorized");
        return;
      }

      // Moderator requirement (admin also satisfies moderator requirement)
      if (
        requireModerator &&
        userRole !== "moderator" &&
        userRole !== "administrator"
      ) {
        router.push("/unauthorized");
        return;
      }
    }
  }, [
    user,
    loading,
    requireAuth,
    requireAdmin,
    requireModerator,
    router,
    pathname,
    redirectTo,
  ]);

  // Show loading state
  if (loading) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )
    );
  }

  // Check authentication
  if (requireAuth && !user) {
    return fallback || null;
  }

  // Check role-based access
  if (user) {
    const userRole = user.role;

    if (requireAdmin && userRole !== "administrator") {
      return (
        fallback || (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Admin Access Required
              </h2>
              <p className="text-gray-600">
                You need administrator privileges to access this page.
              </p>
            </div>
          </div>
        )
      );
    }

    if (
      requireModerator &&
      userRole !== "moderator" &&
      userRole !== "administrator"
    ) {
      return (
        fallback || (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Moderator Access Required
              </h2>
              <p className="text-gray-600">
                You need moderator privileges to access this page.
              </p>
            </div>
          </div>
        )
      );
    }
  }

  // If all checks pass, render children
  return <>{children}</>;
}
