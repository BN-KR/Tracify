import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([]);
}

export async function POST() {
  return NextResponse.json({ error: "This is a read-only demo. Create a free project to save your own views." }, { status: 403 });
}
