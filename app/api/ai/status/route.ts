import { NextResponse } from "next/server";
import { getOpenAIModel, isAIConfigured } from "@/lib/openai";

export const runtime = "nodejs";

export function GET() {
  return NextResponse.json({ configured: isAIConfigured(), model: getOpenAIModel() });
}
