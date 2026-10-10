/**
 * LLM helper — calls an OpenAI-compatible chat completions endpoint.
 *
 * Server-side only. Credentials come from the environment and are never
 * embedded in the application.
 */

const DEFAULT_BASE_URL = process.env.LLM_BASE_URL || "http://127.0.0.1:31415/v1";
const API_KEY = process.env.LLM_API_KEY;
const DEFAULT_MODEL = process.env.LLM_MODEL || "auto";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  baseURL?: string;
  apiKey?: string;
}

export async function chatCompletion(messages: ChatMessage[], opts: ChatOptions = {}): Promise<string> {
  const baseURL = opts.baseURL || DEFAULT_BASE_URL;
  const apiKey = opts.apiKey || API_KEY;
  const url = `${baseURL.replace(/\/$/, "")}/chat/completions`;
  const body: Record<string, unknown> = {
    model: opts.model || DEFAULT_MODEL,
    messages,
    temperature: opts.temperature ?? 0.7,
    stream: false,
  };
  if (opts.maxTokens) body.max_tokens = opts.maxTokens;

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(apiKey ? { authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify(body),
    });
  } catch (e: any) {
    throw new Error(`Could not reach the LLM gateway at ${url} — ${e?.message || e}. Check that the local server is running and reachable from this process.`);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`LLM request failed (${res.status}): ${text.slice(0, 400) || res.statusText}`);
  }
  const data = await res.json().catch(() => ({}));
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error(`LLM returned no content: ${JSON.stringify(data).slice(0, 400)}`);
  }
  return content;
}

export const llmDefaults = {
  baseURL: DEFAULT_BASE_URL,
  model: DEFAULT_MODEL,
  apiKeyConfigured: !!API_KEY,
};
