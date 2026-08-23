"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "brecho-announcement-dismissed";

export function AnnouncementBar({ message }: { message: string }) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of localStorage on mount
    setDismissed(localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  if (dismissed) return null;

  return (
    <div className="relative flex items-center justify-center bg-sage-dark px-10 py-2 text-center text-xs font-medium tracking-wide text-cream sm:text-sm">
      <span>{message}</span>
      <button
        type="button"
        aria-label="Fechar aviso"
        onClick={() => {
          localStorage.setItem(STORAGE_KEY, "1");
          setDismissed(true);
        }}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-cream/60 transition hover:text-cream"
      >
        ✕
      </button>
    </div>
  );
}
