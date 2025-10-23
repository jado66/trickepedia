// cspell:disable

import React from "react";
import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";

import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";
import { StructuredData } from "@/components/structured-data";
import {
  generateWebsiteStructuredData,
  generateOrganizationStructuredData,
} from "@/lib/structured-data-utils";
import { ConfettiProvider } from "@/contexts/confetti-provider";
import { UserProvider } from "@/contexts/user-provider";
import { UserProgressProvider } from "@/contexts/user-progress-provider";
import { NotificationsProvider } from "@/contexts/notifications-provider";
import { CategoriesProvider } from "@/contexts/categories-provider";
import { TricksProvider } from "@/contexts/tricks-provider";

export const metadata: Metadata = {
  title: "Trickipedia - Learn New Tricks",
  description:
    "Discover and master new skills with Trickipedia. Explore a wide range of tricks, track your progress, and join a community of learners.",
  keywords:
    "tricks, learn tricks, skill development, trick tutorials, progress tracking, community learning",
  authors: [{ name: "Trickipedia", url: "https://trickipedia.app" }],
  openGraph: {
    title: "Trickipedia - Learn New Tricks",
    description:
      "Discover and master new skills with Trickipedia. Explore a wide range of tricks, track your progress, and join a community of learners.",
    url: "https://trickipedia.app",
    siteName: "Trickipedia",
  },
};

import "./globals.css";
import { WishlistProvider } from "@/contexts/wishlist-context";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Note: With standard supabase-js, we can't access session server-side
  // The AuthProvider will handle session initialization client-side

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
  {/* PWA manifest & Apple tags removed to disable PWA behavior */}
  {/* <link rel="manifest" href="/favicon/site.webmanifest" /> */}
  {/* <link rel="apple-touch-icon" href="/favicon/apple-touch-icon.png" /> */}
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon/favicon-16x16.png"
        />
        <link rel="icon" href="/favicon/favicon.ico" />
        {/* Removed PWA-specific meta tags */}
        {/* <meta name="apple-mobile-web-app-capable" content="yes" /> */}
        {/* <meta name="apple-mobile-web-app-title" content="Trickipedia" /> */}
        {/* <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" /> */}
        {/* <meta name="mobile-web-app-capable" content="yes" /> */}
        {/* <meta name="application-name" content="Trickipedia" /> */}
        {/* Keeping theme-color for browser UI coloring */}
        <meta name="theme-color" content="#000000" />
        {/* Removed development-only PWA debug script */}
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="trickipedia"
          themes={["trickipedia", "dark"]}
          storageKey="trickipedia-theme"
          enableSystem={false}
        >
          <Toaster position="top-center" closeButton />

          <StructuredData data={generateWebsiteStructuredData()} />
          <StructuredData data={generateOrganizationStructuredData()} />

          <ConfettiProvider>
            <UserProvider>
              <CategoriesProvider>
                <TricksProvider>
                  <WishlistProvider>
                    <UserProgressProvider>
                      <NotificationsProvider>{children}</NotificationsProvider>
                    </UserProgressProvider>
                  </WishlistProvider>
                </TricksProvider>
              </CategoriesProvider>
            </UserProvider>
          </ConfettiProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
