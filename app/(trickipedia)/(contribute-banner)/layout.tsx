import { VariableBanner } from "@/components/banners/variable-banner";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <VariableBanner />
      {children}
    </>
  );
}
