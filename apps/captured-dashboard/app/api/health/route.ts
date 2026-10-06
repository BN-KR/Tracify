import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    status: "ok",
    mode: "sandbox",
    backend: "in-memory",
    writesEnabled: false,
  });
}
