import { NextResponse } from "next/server";
import { getAIModel, getAIProvider, isAIConfigured } from "@/lib/ai";

export const runtime = "nodejs";

export function GET() {
  return NextResponse.json({ configured: isAIConfigured(), provider: getAIProvider(), model: getAIModel() });
}
