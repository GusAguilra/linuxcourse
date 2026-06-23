import { getServerModules } from "@/lib/queries";
import { DashboardClient } from "@/components/DashboardClient";
import { Suspense } from "react";

export default async function Dashboard() {
  const modules = await getServerModules();

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl p-6">
          <div className="mb-8 space-y-3">
            <div className="skeleton h-8 w-72 rounded" />
            <div className="skeleton h-4 w-48 rounded" />
          </div>
          <div className="mb-8 grid gap-4 sm:grid-cols-4 grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-28 rounded-xl" />
            ))}
          </div>
          <div className="skeleton mb-8 h-32 rounded-xl" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-16 rounded-xl" />
            ))}
          </div>
        </div>
      }
    >
      <DashboardClient initialModules={modules} />
    </Suspense>
  );
}
