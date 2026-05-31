import { NextRequest, NextResponse } from "next/server";
import { runCoralQuery } from "@/lib/coral";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { query } = (await req.json()) as { query?: string };

    if (!query?.trim()) {
      return NextResponse.json(
        { error: "A Coral SQL query is required." },
        { status: 400 },
      );
    }

    const result = await runCoralQuery(query.trim());

    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to run Coral query.",
      },
      { status: 500 },
    );
  }
}
