import "./globals.css";

import { ConfettiProvider } from "@/contexts/confetti-provider";
import { UserProvider } from "@/contexts/user-provider";
import { UserProgressProvider } from "@/contexts/user-progress-provider";
import { NotificationsProvider } from "@/contexts/notifications-provider";
import { CategoriesProvider } from "@/contexts/categories-provider";
import { TricksProvider } from "@/contexts/tricks-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { WishlistProvider } from "@/contexts/wishlist-context";

import { Toaster } from "sonner";

import { Analytics } from "@vercel/analytics/react";
import { TrickipediaLayoutServer } from "./layout-server";
import { TrickipediaFooter } from "@/components/trickipedia-footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="trickipedia"
          themes={["trickipedia", "dark"]}
          storageKey="trickipedia-theme"
          enableSystem={false}
        >
          <Toaster position="top-center" closeButton />

          <ConfettiProvider>
            <UserProvider>
              <CategoriesProvider>
                <TricksProvider>
                  <WishlistProvider>
                    <UserProgressProvider>
                      <NotificationsProvider>
                        <TrickipediaLayoutServer>
                          {children}
                          <TrickipediaFooter />
                        </TrickipediaLayoutServer>
                      </NotificationsProvider>
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
