import { NextResponse } from "next/server";

import { runSync } from "@/lib/sync/run-sync";

export const maxDuration = 300;

export async function POST() {
  // Local challenge app: sync stays server-side so MOCK_API_KEY never reaches the browser.
  // Single-flight lock inside runSync prevents stampedes.
  try {
    const result = await runSync();
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    console.error("Sync failed", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Sync failed",
      },
      { status: 500 },
    );
  }
}
