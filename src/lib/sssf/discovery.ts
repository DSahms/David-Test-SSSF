import { chatCompletion, type ChatMessage } from "@/lib/sssf/llm";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { ChatOptions } from "./llm";

/**
 * The Discovery agent — the missing interactive layer SSSF Studio adds.
 *
 * It is NOT a factory agent: it never touches the ADW graph. Its only job is to
 * read the user's current spec draft and return structured feedback that turns a
 * rough idea into a high-quality, human-approved markdown specification. The
 * approved markdown is then placed in the target repo and handed to the factory
 * unchanged.
 *
 * Uses z-ai-web-dev-sdk (server-side only).
 */

export interface DiscoveryFeedback {
  summary: string;
  missing: string[]; // missing requirements
  ambiguities: string[]; // unclear points
  suggestions: string[]; // concrete, actionable improvements
  questions: string[]; // open questions for the user
  risks: string[]; // risks / things that could go wrong
}

export interface ReviewInput {
  specDraft: string;
  /** recent conversation for context (role + content), most recent last */
  history?: { role: "user" | "assistant"; content: string }[];
  /** the user's latest free-form message / direction, if any */
  userMessage?: string;
  repoContext?: string; // a short repo summary if available
}

export function workspaceDiscoveryOptions(workspacePath: string): ChatOptions {
  const envPath = join(workspacePath, ".env");
  const values: Record<string, string> = {};
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
      const match = line.match(/^\s*(LLM_BASE_URL|LLM_MODEL|LLM_API_KEY)\s*=\s*(.*)$/);
      if (match) values[match[1]] = match[2].trim().replace(/^(["'])(.*)\1$/, "$2");
    }
  }
  return {
    baseURL: values.LLM_BASE_URL || undefined,
    model: values.LLM_MODEL || undefined,
    apiKey: values.LLM_API_KEY || undefined,
  };
}

const SYSTEM_PROMPT = `You are the SSSF Studio Discovery agent — an interactive specification reviewer that sits BEFORE the Super Simple Software Factory runs.

Your job: turn a rough idea into a high-quality, human-approved markdown specification. You never write code and you never launch anything. You review the user's current spec draft and return STRICT JSON feedback.

A great spec for the factory answers, at minimum:
- WHAT is being asked for (the change, in one or two sentences).
- WHERE it lives (which files, modules, or areas of the repo).
- WHY it matters (the motivation, so the planner agent can weigh trade-offs).
- DONE MEANS: a concrete, checkable definition of complete.
- OUT OF SCOPE: what is explicitly not in this request.

You return ONLY a JSON object with this exact shape:
{
  "summary": "2-3 sentences on the overall state of the spec and what it most needs next",
  "missing":   ["each missing requirement, one per item"],
  "ambiguities": ["each unclear or under-specified point"],
  "suggestions": ["each concrete, actionable improvement — phrased so the user could paste it in"],
  "questions":   ["each open question the user should answer, phrased as a question"],
  "risks":       ["each risk or thing that could go wrong"]
}

Rules:
- Be specific and grounded in what the draft actually says. Quote fragments when useful.
- Never invent requirements the user did not hint at; "missing" means things a competent spec of THIS request would contain.
- "suggestions" must be concrete enough to act on — not "be more detailed" but "add a 'Done means' line that names the exact file".
- If the spec is already strong, say so in "summary" and return shorter lists rather than padding.
- Output ONLY the JSON object. No prose, no markdown fences.`;

export async function reviewSpec(input: ReviewInput, options: ChatOptions = {}): Promise<DiscoveryFeedback> {
  const userParts: string[] = [];
  if (input.repoContext) userParts.push(`Repo context:\n${input.repoContext}\n`);
  if (input.history && input.history.length) {
    userParts.push("Recent conversation:");
    for (const m of input.history.slice(-6)) {
      userParts.push(`${m.role.toUpperCase()}: ${m.content}`);
    }
    userParts.push("");
  }
  if (input.userMessage) userParts.push(`User's latest message:\n${input.userMessage}\n`);
  userParts.push("Current spec draft:");
  userParts.push("----");
  userParts.push(input.specDraft || "(empty)");
  userParts.push("----");
  userParts.push("\nReturn the JSON feedback object now.");

  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userParts.join("\n") },
  ];
  const text = await chatCompletion(messages, { ...options, temperature: 0.4 });
  return parseFeedback(text);
}

/** Free-form chat reply from the discovery agent, for answering the user's open questions. */
export async function chatReply(
  history: { role: "user" | "assistant"; content: string }[],
  specDraft: string,
  options: ChatOptions = {},
): Promise<{ message: string; specDraft: string }> {
  const system = `You are a warm, patient project interviewer. Help the user explain what they want through natural conversation. The user may speak, paste text, or provide a file; never require them to type or understand software jargon. Ask at most one clear question at a time. Offer simple choices when that would make answering easier.

As you learn the user's goal, maintain a useful, readable proposal in Markdown. Incorporate only facts the user has provided or confirmed; preserve earlier confirmed details and do not invent decisions. If important details are unknown, ask about the most important one and leave it clearly marked as undecided in the proposal. Keep the proposal easy for the user to review.

Return ONLY a JSON object with exactly these string fields:
{"message":"Your conversational response and next question, if needed.","specDraft":"The complete updated Markdown proposal."}`;
  const messages: ChatMessage[] = [
    { role: "system", content: system },
    { role: "user", content: `Current proposal (preserve confirmed details and update it from this conversation):\n----\n${specDraft || "(not started)"}\n----` },
    ...history.slice(-8).map((m) => ({ role: m.role, content: m.content }) as ChatMessage),
  ];
  const response = await chatCompletion(messages, { ...options, temperature: 0.6 });
  const fenced = response.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : response;
  let parsed: unknown;
  try {
    parsed = JSON.parse(candidate);
  } catch {
    throw new Error("The Discovery agent returned an invalid response. Please try again.");
  }
  if (!parsed || typeof parsed !== "object" ||
      typeof (parsed as { message?: unknown }).message !== "string" ||
      typeof (parsed as { specDraft?: unknown }).specDraft !== "string") {
    throw new Error("The Discovery agent response did not include both a reply and an updated proposal.");
  }
  return {
    message: (parsed as { message: string }).message,
    specDraft: (parsed as { specDraft: string }).specDraft,
  };
}

export function parseFeedback(text: string): DiscoveryFeedback {
  const empty: DiscoveryFeedback = {
    summary: "", missing: [], ambiguities: [], suggestions: [], questions: [], risks: [],
  };
  let candidate = text;
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) candidate = fence[1];
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end <= start) return { ...empty, summary: text.slice(0, 400) };
  try {
    const obj = JSON.parse(candidate.slice(start, end + 1));
    return {
      summary: str(obj.summary),
      missing: list(obj.missing),
      ambiguities: list(obj.ambiguities),
      suggestions: list(obj.suggestions),
      questions: list(obj.questions),
      risks: list(obj.risks),
    };
  } catch {
    return { ...empty, summary: text.slice(0, 400) };
  }
}

function str(v: unknown): string {
  return typeof v === "string" ? v : v == null ? "" : JSON.stringify(v);
}
function list(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => (typeof x === "string" ? x : str(x))).filter(Boolean);
  if (typeof v === "string" && v.trim()) return [v];
  return [];
}

/** A short repo summary to give the discovery agent grounding (top-level files + any README excerpt). */
export function repoSummary(repoPath: string): string {
  try {
    const entries = readdirSync(repoPath).filter((f) => !f.startsWith(".")).slice(0, 25);
    let readme = "";
    for (const f of entries) {
      if (/^readme/i.test(f) && existsSync(join(repoPath, f))) {
        readme = readFileSync(join(repoPath, f), "utf8").slice(0, 800);
        break;
      }
    }
    return `Top-level entries: ${entries.join(", ")}\n\nREADME excerpt:\n${readme || "(none)"}`;
  } catch {
    return "(no repo context available)";
  }
}
