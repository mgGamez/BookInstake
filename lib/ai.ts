import "server-only";

import OpenAI from "openai";

export type AIProvider = "openai" | "gemini";

export class AIProviderError extends Error {
  constructor(message: string, public readonly status?: number) { super(message); }
}

export function getAIProvider(): AIProvider { return process.env.AI_PROVIDER === "gemini" ? "gemini" : "openai"; }

export function getAIModel() {
  return getAIProvider() === "gemini"
    ? process.env.GEMINI_MODEL || "gemini-2.5-flash"
    : process.env.OPENAI_MODEL || "gpt-4.1-mini";
}

export function isAIConfigured() {
  return getAIProvider() === "gemini" ? Boolean(process.env.GEMINI_API_KEY) : Boolean(process.env.OPENAI_API_KEY);
}

async function generateWithGemini(systemInstruction: string, content: string) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new AIProviderError("GEMINI_API_KEY is not configured.");
  const model = getAIModel();
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ systemInstruction: { parts: [{ text: systemInstruction }] }, contents: [{ role: "user", parts: [{ text: content }] }], generationConfig: { temperature: 0.2 } }),
  });
  const payload = await response.json() as { error?: { message?: string }; candidates?: { content?: { parts?: { text?: string }[] } }[] };
  if (!response.ok) throw new AIProviderError(payload.error?.message || "Gemini could not complete the request.", response.status);
  const result = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();
  if (!result) throw new AIProviderError("Gemini returned no usable output.", response.status);
  return result;
}

async function generateWithOpenAI(systemInstruction: string, content: string) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new AIProviderError("OPENAI_API_KEY is not configured.");
  const client = new OpenAI({ apiKey: key, baseURL: process.env.OPENAI_BASE_URL || undefined });
  try {
    const completion = await client.chat.completions.create({ model: getAIModel(), temperature: 0.2, messages: [{ role: "system", content: systemInstruction }, { role: "user", content }] });
    const result = completion.choices[0]?.message.content?.trim();
    if (!result) throw new AIProviderError("The provider returned no usable output.");
    return result;
  } catch (error) {
    if (error instanceof OpenAI.APIError) throw new AIProviderError(error.message, error.status);
    throw error;
  }
}

export function generateAIText(systemInstruction: string, content: string) {
  return getAIProvider() === "gemini" ? generateWithGemini(systemInstruction, content) : generateWithOpenAI(systemInstruction, content);
}
