import { NextResponse } from "next/server";

/** Liveness probe for the frontend container. */
export function GET() {
  return NextResponse.json({ status: "ok" });
}
