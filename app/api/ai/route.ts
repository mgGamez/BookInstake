import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getOpenAIClient, getOpenAIModel, isAIConfigured } from "@/lib/openai";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const instructions = {
  document: "Analyze the supplied business document. Return concise markdown with: Summary, Key fields, Risks or missing information, and a recommended next action. Do not invent facts.",
  workflow: "Turn the supplied business requirement into a practical workflow draft. Return concise markdown with: Goal, Trigger, ordered steps, decision points, owner, and completion condition. Flag missing assumptions.",
  email: "Draft a professional business email from the supplied context. Return only the email with a subject line. Do not claim actions, dates, or facts that were not supplied.",
} as const;

type Task = keyof typeof instructions;

function requiresAuthentication() { return process.env.NODE_ENV === "production" || process.env.AI_REQUIRE_AUTH === "true"; }

function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try { return new URL(origin).host === request.headers.get("host"); } catch { return false; }
}

function providerErrorMessage(error: unknown) {
  if (error instanceof OpenAI.AuthenticationError) return "OpenAI rejected the API key. Check OPENAI_API_KEY and restart the app.";
  if (error instanceof OpenAI.PermissionDeniedError) return "This API key does not have permission to use the configured model.";
  if (error instanceof OpenAI.NotFoundError) return "The configured model was not found. Check OPENAI_MODEL.";
  if (error instanceof OpenAI.RateLimitError) return "OpenAI rate limit or billing limit reached. Check your API billing and usage limits.";
  if (error instanceof OpenAI.APIConnectionError) return "The AI endpoint could not be reached. Leave OPENAI_BASE_URL blank for official OpenAI.";
  return "The AI request could not be completed. Check the model, endpoint, and API key.";
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Cross-origin requests are not allowed." }, { status: 403 });
  if (!isAIConfigured()) return NextResponse.json({ error: "AI is not configured. Add OPENAI_API_KEY to .env.local and restart the app." }, { status: 503 });

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

    const completion = await getOpenAIClient().chat.completions.create({
      model: getOpenAIModel(),
      temperature: 0.2,
      messages: [{ role: "system", content: instructions[body.task] }, { role: "user", content: body.content.trim() }],
    });
    const result = completion.choices[0]?.message.content?.trim();
    if (!result) return NextResponse.json({ error: "The provider returned no usable output." }, { status: 502 });
    return NextResponse.json({ result });
  } catch (error) {
    console.error("AI request failed", error);
    return NextResponse.json({ error: providerErrorMessage(error) }, { status: 502 });
  }
}
