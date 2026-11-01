import { NextResponse } from "next/server";
import { AIProviderError, generateAIText, getAIProvider, isAIConfigured } from "@/lib/ai";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const instructions = {
  document: "Analyze the supplied business document in 120 words or fewer. Return exactly four complete plain-text lines beginning Summary:, Key fields:, Risk:, and Next action:. Do not use markdown, hashtags, asterisks, a Result heading, or partial sentences. Do not invent facts.",
  workflow: "Create a practical workflow draft in 160 words or fewer. Return complete plain-text lines beginning Goal:, Trigger:, Steps:, Decision:, Owner:, and Complete when:. Keep Steps to three concise numbered actions. Do not use markdown, hashtags, asterisks, a Result heading, or partial sentences. Flag missing information in the Decision line.",
  email: "Draft a professional business email in 130 words or fewer. Return a complete plain-text Subject: line, followed by the email body. Do not use markdown, hashtags, asterisks, a Result heading, or partial sentences. Do not claim facts not supplied.",
} as const;

type Task = keyof typeof instructions;

function requiresAuthentication() { return process.env.NODE_ENV === "production" || process.env.AI_REQUIRE_AUTH === "true"; }

function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try { return new URL(origin).host === request.headers.get("host"); } catch { return false; }
}

function providerErrorMessage(error: unknown) {
  const provider = getAIProvider() === "gemini" ? "Gemini" : "AI provider";
  if (error instanceof AIProviderError && error.status === 401) return `${provider} rejected the API key. Check the configured key and restart the app.`;
  if (error instanceof AIProviderError && error.status === 403) return `${provider} denied access to the configured model or API.`;
  if (error instanceof AIProviderError && error.status === 404) return "The configured model was not found. Check the model name.";
  if (error instanceof AIProviderError && error.status === 429) return `${provider} rate limit or billing limit reached. Check provider usage limits.`;
  if (error instanceof AIProviderError) return error.message;
  if (error instanceof Error && error.name === "TimeoutError") return `${provider} took longer than 45 seconds to respond. Try a shorter request or a faster model.`;
  if (error instanceof Error && error.name === "AbortError") return `${provider} request was cancelled before it completed.`;
  if (error instanceof Error && error.message === "fetch failed") return `${provider} could not be reached. Check your internet connection, firewall, and provider API availability.`;
  return "The AI request could not be completed. Check the model, endpoint, and API key.";
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Cross-origin requests are not allowed." }, { status: 403 });
  if (!isAIConfigured()) return NextResponse.json({ error: "AI is not configured. Add the selected provider key to .env.local and restart the app." }, { status: 503 });

  try {
    const body = await request.json() as { task?: Task; content?: string };
    if (!body.task || !(body.task in instructions) || typeof body.content !== "string" || !body.content.trim()) return NextResponse.json({ error: "Provide a supported task and content." }, { status: 400 });
    if (body.content.length > 12000) return NextResponse.json({ error: "Keep requests under 12,000 characters." }, { status: 400 });

    if (requiresAuthentication()) {
      if (!isSupabaseConfigured()) return NextResponse.json({ error: "Production AI access requires Supabase authentication. Configure Supabase first." }, { status: 503 });
      const supabase = await createSupabaseServerClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) return NextResponse.json({ error: "Sign in before using AI tools." }, { status: 401 });
      const { data: allowed, error: limitError } = await supabase.rpc("check_and_record_ai_request", { request_task: body.task });
      if (limitError) return NextResponse.json({ error: "AI usage tracking is not configured. Apply the Supabase schema before enabling production AI access." }, { status: 503 });
      if (!allowed) return NextResponse.json({ error: "AI request limit reached. Please wait a minute and try again." }, { status: 429 });
    }

    const result = await generateAIText(instructions[body.task], body.content.trim());
    return NextResponse.json({ result });
  } catch (error) {
    console.error("AI request failed", error);
    return NextResponse.json({ error: providerErrorMessage(error) }, { status: 502 });
  }
}
