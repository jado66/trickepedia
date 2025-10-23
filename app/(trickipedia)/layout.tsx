import { TrickipediaLayoutServer } from "./layout-server";
import { TrickipediaFooter } from "@/components/trickipedia-footer";

// NOTE: Global CSS should only be imported once in the root layout.
// The previous duplicate import here could trigger per-route CSS loading
// leading to a flash of unstyled content (FOUC) on initial render.

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Note: With standard supabase-js, we can't access session server-side
  // The AuthProvider will handle session initialization client-side

  return (
    <TrickipediaLayoutServer>
      {children}
      <TrickipediaFooter />
    </TrickipediaLayoutServer>
  );
}
