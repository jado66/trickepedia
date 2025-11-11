// app/dashboard/page.tsx
import { UserDashboard } from "@/components/user-dashboard/user-dashboard";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  return (
    <main>
      <section className="w-full flex flex-col items-center py-8 lg:px-4">
        <div className="container mx-auto lg:px-4">
          <UserDashboard />
        </div>
      </section>
    </main>
  );
}
