import "server-only";

import OpenAI from "openai";

/** Creates the OpenAI SDK only in server-side code. */
export function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured.");
  return new OpenAI({ apiKey, baseURL: process.env.OPENAI_BASE_URL || undefined });
}

/** Central model setting for future server actions and route handlers. */
export function getOpenAIModel() { return process.env.OPENAI_MODEL || "gpt-4.1-mini"; }

export function isAIConfigured() { return Boolean(process.env.OPENAI_API_KEY); }
