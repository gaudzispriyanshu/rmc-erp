"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1 className="page-title">Something broke</h1>
        <p className="page-description">{error.message}</p>
        <Button variant="secondary" className="mt-5" onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  );
}
