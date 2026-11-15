import { Suspense } from "react";
import HomeClient from "@/components/HomeClient";

function HomeSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="h-8 w-52 animate-pulse rounded-full bg-white/5" />
        <div className="mt-6 h-24 max-w-xl animate-pulse rounded-2xl bg-white/5" />
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomeSkeleton />}>
      <HomeClient />
    </Suspense>
  );
}
