/**
 * Anthropic SDK helper for Supabase Edge Functions (Deno).
 *
 * Loaded via npm: specifier so the SDK runs in the Deno runtime used by
 * Supabase Edge. The API key (`ANTHROPIC_API_KEY`) MUST be set as a
 * Supabase secret — it is never exposed to the SPA.
 *
 * `callClaudeJSON` enforces a JSON-only response by:
 *   - asking the model for a single JSON object in the system prompt
 *   - extracting the first {...} block from the text content
 *   - parsing & returning the typed result
 *
 * If the response cannot be parsed, the function throws — callers should
 * surface a 502 to the client.
 */

import Anthropic from "npm:@anthropic-ai/sdk@0.30.1";

let cached: Anthropic | null = null;

function getClient(): Anthropic {
  if (cached) return cached;
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }
  cached = new Anthropic({ apiKey });
  return cached;
}

export const MODEL_HAIKU = "claude-haiku-4-5-20251001";
export const MODEL_SONNET = "claude-sonnet-4-5-20250929";

export interface ClaudeJsonOptions {
  model: string;
  system: string;
  user: string;
  maxTokens?: number;
}

function extractFirstJsonObject(text: string): string {
  const start = text.indexOf("{");
  if (start === -1) throw new Error("No JSON object found in model output");
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === "\\") {
      escape = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  throw new Error("Unterminated JSON object in model output");
}

export async function callClaudeJSON<T>(opts: ClaudeJsonOptions): Promise<T> {
  const client = getClient();
  const response = await client.messages.create({
    model: opts.model,
    max_tokens: opts.maxTokens ?? 800,
    system: opts.system,
    messages: [{ role: "user", content: opts.user }],
  });

  const block = response.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") {
    throw new Error("Claude returned no text content");
  }

  const raw = extractFirstJsonObject(block.text);
  return JSON.parse(raw) as T;
}
