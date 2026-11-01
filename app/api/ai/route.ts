import { NextResponse } from "next/server";
import { getOpenAIClient, getOpenAIModel, isAIConfigured } from "@/lib/openai";

export const runtime = "nodejs";

const instructions = {
  document: "Analyze the supplied business document. Return concise markdown with: Summary, Key fields, Risks or missing information, and a recommended next action. Do not invent facts.",
  workflow: "Turn the supplied business requirement into a practical workflow draft. Return concise markdown with: Goal, Trigger, ordered steps, decision points, owner, and completion condition. Flag missing assumptions.",
  email: "Draft a professional business email from the supplied context. Return only the email with a subject line. Do not claim actions, dates, or facts that were not supplied.",
} as const;

type Task = keyof typeof instructions;

export async function POST(request: Request) {
  if (!isAIConfigured()) return NextResponse.json({ error: "AI is not configured. Add OPENAI_API_KEY to .env.local and restart the app." }, { status: 503 });

  try {
    const body = await request.json() as { task?: Task; content?: string };
    if (!body.task || !(body.task in instructions) || typeof body.content !== "string" || !body.content.trim()) return NextResponse.json({ error: "Provide a supported task and content." }, { status: 400 });
    if (body.content.length > 12000) return NextResponse.json({ error: "Keep requests under 12,000 characters." }, { status: 400 });

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
    return NextResponse.json({ error: "The AI request could not be completed. Check the model, endpoint, and API key." }, { status: 502 });
  }
}
