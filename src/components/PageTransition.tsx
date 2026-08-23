"use client";

import { usePathname, useSearchParams } from "next/navigation";

// Only these params represent an actual "tab"/content switch (category
// filter, search). Refinement params like Filters shouldn't remount the
// page — that would wipe transient UI state (e.g. the filter panel being
// open) on every click.
const TRANSITION_PARAMS = ["categoria", "q"];

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const transitionKey = TRANSITION_PARAMS.map((p) => searchParams.get(p) ?? "").join("|");

  return (
    <div key={`${pathname}?${transitionKey}`} className="page-transition">
      {children}
    </div>
  );
}
