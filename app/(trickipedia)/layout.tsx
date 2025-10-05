import { TrickipediaLayoutServer } from "./layout-server";
import { TrickipediaFooter } from "@/components/trickipedia-footer";
import { ThemeProvider } from "@/components/theme-provider";

import "../globals.css";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Note: With standard supabase-js, we can't access session server-side
  // The AuthProvider will handle session initialization client-side

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="trickipedia"
      themes={["trickipedia", "dark"]}
      storageKey="trickipedia-theme"
      enableSystem={false}
    >
      <TrickipediaLayoutServer>
        {children}
        <TrickipediaFooter />
      </TrickipediaLayoutServer>
    </ThemeProvider>
  );
}
