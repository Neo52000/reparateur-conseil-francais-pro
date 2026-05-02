/**
 * Helper de génération de texte pour Edge Functions.
 * Ordre de fallback : Gemini direct → OpenAI → Mistral.
 * Aucune dépendance Lovable.
 */

export type AIProvider = 'gemini' | 'openai' | 'mistral';

export interface AITool {
  type: 'function';
  function: {
    name: string;
    description?: string;
    parameters: Record<string, unknown>;
  };
}

export interface AIRequestOptions {
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
  temperature?: number;
  tools?: AITool[];
  toolChoice?: 'auto' | 'any' | { type: 'function'; function: { name: string } };
  preferredProvider?: AIProvider;
  geminiModel?: string;
  openaiModel?: string;
  mistralModel?: string;
}

export interface AIResult {
  success: boolean;
  content?: string;
  toolCallArguments?: unknown;
  provider?: AIProvider;
  error?: string;
  usage?: { prompt_tokens: number; completion_tokens: number };
}

const PROVIDER_ORDER: AIProvider[] = ['gemini', 'openai', 'mistral'];

export async function callAIWithFallback(opts: AIRequestOptions): Promise<AIResult> {
  const order = opts.preferredProvider
    ? [opts.preferredProvider, ...PROVIDER_ORDER.filter((p) => p !== opts.preferredProvider)]
    : PROVIDER_ORDER;

  let lastError = 'No provider configured';

  for (const provider of order) {
    const result = await callProvider(provider, opts);
    if (result.success) return result;
    if (result.error) lastError = `${provider}: ${result.error}`;
  }

  return { success: false, error: lastError };
}

async function callProvider(provider: AIProvider, opts: AIRequestOptions): Promise<AIResult> {
  switch (provider) {
    case 'gemini':
      return callGemini(opts);
    case 'openai':
      return callOpenAI(opts);
    case 'mistral':
      return callMistral(opts);
  }
}

async function callGemini(opts: AIRequestOptions): Promise<AIResult> {
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) return { success: false, error: 'GEMINI_API_KEY missing' };

  const model = opts.geminiModel || 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const body: Record<string, unknown> = {
    contents: [
      { role: 'user', parts: [{ text: `${opts.systemPrompt}\n\n${opts.userPrompt}` }] },
    ],
    generationConfig: {
      temperature: opts.temperature ?? 0.7,
      maxOutputTokens: opts.maxTokens ?? 8000,
    },
  };

  if (opts.tools && opts.tools.length > 0) {
    body.tools = [
      {
        functionDeclarations: opts.tools.map((t) => ({
          name: t.function.name,
          description: t.function.description,
          parameters: t.function.parameters,
        })),
      },
    ];
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      return { success: false, error: `HTTP ${res.status}: ${text.substring(0, 200)}` };
    }
    const data = (await res.json()) as GeminiResponse;
    const candidate = data.candidates?.[0];
    const parts = candidate?.content?.parts ?? [];

    const functionCall = parts.find((p) => p.functionCall)?.functionCall;
    if (functionCall) {
      return {
        success: true,
        provider: 'gemini',
        toolCallArguments: functionCall.args,
        usage: extractGeminiUsage(data),
      };
    }

    const textPart = parts.find((p) => typeof p.text === 'string')?.text;
    if (!textPart) return { success: false, error: 'Empty response' };

    return {
      success: true,
      provider: 'gemini',
      content: textPart,
      usage: extractGeminiUsage(data),
    };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

interface GeminiPart {
  text?: string;
  functionCall?: { name: string; args: unknown };
}

interface GeminiResponse {
  candidates?: Array<{ content?: { parts?: GeminiPart[] } }>;
  usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number };
}

function extractGeminiUsage(data: GeminiResponse) {
  const um = data.usageMetadata;
  if (!um) return undefined;
  return {
    prompt_tokens: um.promptTokenCount ?? 0,
    completion_tokens: um.candidatesTokenCount ?? 0,
  };
}

async function callOpenAI(opts: AIRequestOptions): Promise<AIResult> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) return { success: false, error: 'OPENAI_API_KEY missing' };

  const body: Record<string, unknown> = {
    model: opts.openaiModel || 'gpt-4o-mini',
    messages: [
      { role: 'system', content: opts.systemPrompt },
      { role: 'user', content: opts.userPrompt },
    ],
    temperature: opts.temperature ?? 0.7,
    max_tokens: opts.maxTokens ?? 8000,
  };

  if (opts.tools && opts.tools.length > 0) {
    body.tools = opts.tools;
    body.tool_choice = opts.toolChoice ?? 'auto';
  }

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      return { success: false, error: `HTTP ${res.status}: ${text.substring(0, 200)}` };
    }
    const data = await res.json();
    const choice = data.choices?.[0];
    const usage = data.usage
      ? { prompt_tokens: data.usage.prompt_tokens, completion_tokens: data.usage.completion_tokens }
      : undefined;

    const toolCall = choice?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      return {
        success: true,
        provider: 'openai',
        toolCallArguments: JSON.parse(toolCall.function.arguments),
        usage,
      };
    }

    const content = choice?.message?.content?.trim();
    if (!content) return { success: false, error: 'Empty response' };
    return { success: true, provider: 'openai', content, usage };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

async function callMistral(opts: AIRequestOptions): Promise<AIResult> {
  const apiKey = Deno.env.get('MISTRAL_API_KEY') ?? Deno.env.get('CLE_API_MISTRAL');
  if (!apiKey) return { success: false, error: 'MISTRAL_API_KEY missing' };

  const body: Record<string, unknown> = {
    model: opts.mistralModel || 'mistral-small-latest',
    messages: [
      { role: 'system', content: opts.systemPrompt },
      { role: 'user', content: opts.userPrompt },
    ],
    temperature: opts.temperature ?? 0.7,
    max_tokens: opts.maxTokens ?? 8000,
  };

  if (opts.tools && opts.tools.length > 0) {
    body.tools = opts.tools;
    body.tool_choice = opts.toolChoice ?? 'auto';
  }

  try {
    const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      return { success: false, error: `HTTP ${res.status}: ${text.substring(0, 200)}` };
    }
    const data = await res.json();
    const choice = data.choices?.[0];
    const usage = data.usage
      ? { prompt_tokens: data.usage.prompt_tokens, completion_tokens: data.usage.completion_tokens }
      : undefined;

    const toolCall = choice?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      return {
        success: true,
        provider: 'mistral',
        toolCallArguments: JSON.parse(toolCall.function.arguments),
        usage,
      };
    }

    const content = choice?.message?.content?.trim();
    if (!content) return { success: false, error: 'Empty response' };
    return { success: true, provider: 'mistral', content, usage };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export function parseJsonFromContent(content: string): unknown {
  let clean = content.trim();
  if (clean.startsWith('```json')) clean = clean.slice(7);
  if (clean.startsWith('```')) clean = clean.slice(3);
  if (clean.endsWith('```')) clean = clean.slice(0, -3);
  return JSON.parse(clean.trim());
}
