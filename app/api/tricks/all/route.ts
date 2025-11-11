import { getTricks } from "@/lib/server/tricks-data-server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { tricks } = await getTricks({ limit: 10000 });
    return NextResponse.json(tricks);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch tricks" },
      { status: 500 }
    );
  }
}
