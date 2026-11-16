"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type SyncButtonProps = {
  onBusyChange?: (busy: boolean) => void;
};

export function SyncButton({ onBusyChange }: SyncButtonProps) {
  const router = useRouter();
  const [isFetching, setIsFetching] = useState(false);
  const [isRefreshing, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showUpdated, setShowUpdated] = useState(false);

  const busy = isFetching || isRefreshing;

  useEffect(() => {
    onBusyChange?.(busy);
  }, [busy, onBusyChange]);

  useEffect(() => {
    if (!showUpdated) {
      return;
    }
    const timer = window.setTimeout(() => setShowUpdated(false), 2000);
    return () => window.clearTimeout(timer);
  }, [showUpdated]);

  async function onSync() {
    setError(null);
    setIsFetching(true);
    try {
      const response = await fetch("/api/sync", { method: "POST" });
      const body = (await response.json()) as {
        ok: boolean;
        error?: string;
      };
      if (!response.ok || !body.ok) {
        throw new Error("refresh_failed");
      }
      setIsFetching(false);
      startTransition(() => {
        router.refresh();
      });
      setShowUpdated(true);
    } catch {
      setError("Couldn't refresh right now. Please try again.");
      setIsFetching(false);
    }
  }

  return (
    <div className="relative flex items-center gap-2">
      {showUpdated && !busy ? (
        <Badge variant="secondary" className="animate-in fade-in duration-300">
          Updated
        </Badge>
      ) : null}
      <Button
        type="button"
        onClick={() => void onSync()}
        disabled={busy}
        aria-busy={busy}
      >
        {busy ? (
          <Loader2 className="animate-spin" data-icon="inline-start" />
        ) : null}
        {busy ? "Refreshing…" : "Refresh"}
      </Button>
      {error ? (
        <Alert
          variant="destructive"
          className="absolute top-full right-0 z-30 mt-2 w-64 shadow-md"
        >
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
