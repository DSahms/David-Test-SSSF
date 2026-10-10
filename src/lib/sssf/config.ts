// Pure config types, constants, and validation — no node:fs, safe for client.
// Server-only file I/O (readConfig/writeConfig) lives in ./config-io.ts.

export interface PromptEngineering {
  system: string;
  user: string;
}

export interface AgentConfig {
  name: string;
  coding_agent?: "pi" | "claude_code";
  model?: string;
  thinking?: string;
  color?: string;
  purpose: string;
  prompt_engineering: PromptEngineering;
  harness_engineering?: string[];
  tools?: string[] | null;
  writes?: string[] | null;
}

export interface ConfigDefaults {
  coding_agent?: "pi" | "claude_code";
  model?: string;
  thinking?: string;
  color?: string;
  harness_engineering?: string[];
  tools?: string[] | null;
  protected_files?: string[];
  data_dir?: string;
}

export interface ObservabilityConfig {
  db?: string;
  poll_ms?: number;
}

export interface SSSFConfig {
  defaults: ConfigDefaults;
  observability: ObservabilityConfig;
  agents: AgentConfig[];
}

export const THINKING_LEVELS = ["off", "minimal", "low", "medium", "high", "xhigh", "max"] as const;
export const CODING_AGENTS = ["pi", "claude_code"] as const;
export const PI_TOOLS = ["read", "bash", "edit", "write", "grep", "find", "ls"] as const;

// ── Read / write live in ./config-io.ts (server-only) ────────────────────────

// ── Validation ───────────────────────────────────────────────────────────────

export interface ValidationProblem {
  agent?: string;
  field: string;
  message: string;
}

export function validateConfig(cfg: SSSFConfig): ValidationProblem[] {
  const problems: ValidationProblem[] = [];
  if (!cfg.defaults) problems.push({ field: "defaults", message: "defaults section is missing" });
  else {
    if (cfg.defaults.model && !cfg.defaults.model.includes("/"))
      problems.push({ field: "defaults.model", message: "model must be provider/model-id (missing '/')" });
    if (cfg.defaults.thinking && !THINKING_LEVELS.includes(cfg.defaults.thinking as any))
      problems.push({ field: "defaults.thinking", message: `must be one of ${THINKING_LEVELS.join("|")}` });
  }
  if (!Array.isArray(cfg.agents) || cfg.agents.length === 0)
    problems.push({ field: "agents", message: "at least one agent is required" });
  const names = new Set<string>();
  for (const a of cfg.agents) {
    if (!a.name) problems.push({ field: "agents", message: "an agent is missing a name" });
    else if (names.has(a.name)) problems.push({ agent: a.name, field: "name", message: "duplicate agent name" });
    else names.add(a.name);
    if (!a.purpose || !a.purpose.trim())
      problems.push({ agent: a.name, field: "purpose", message: "purpose is required" });
    if (!a.prompt_engineering?.system)
      problems.push({ agent: a.name, field: "prompt_engineering.system", message: "system prompt path is required" });
    if (!a.prompt_engineering?.user)
      problems.push({ agent: a.name, field: "prompt_engineering.user", message: "user prompt path is required" });
    if (a.model && !a.model.includes("/"))
      problems.push({ agent: a.name, field: "model", message: "model must be provider/model-id" });
    if (a.thinking && !THINKING_LEVELS.includes(a.thinking as any))
      problems.push({ agent: a.name, field: "thinking", message: `must be one of ${THINKING_LEVELS.join("|")}` });
  }
  return problems;
}

/** Resolve a roster config path relative to a repo root — lives in ./config-io.ts (server-only). */

/** Which providers are referenced across the roster — drives which keys matter. */
export function referencedProviders(cfg: SSSFConfig): string[] {
  const set = new Set<string>();
  const scan = (model?: string) => {
    if (!model) return;
    const idx = model.indexOf("/");
    if (idx > 0) set.add(model.slice(0, idx));
  };
  scan(cfg.defaults.model);
  for (const a of cfg.agents) scan(a.model);
  return [...set].sort();
}

/** Normalize a raw parsed object into a well-shaped SSSFConfig (pure). */
export function normalize(raw: any): SSSFConfig {
  const defaults: ConfigDefaults = raw.defaults ?? {};
  const observability: ObservabilityConfig = raw.observability ?? {};
  const agents: AgentConfig[] = Array.isArray(raw.agents) ? raw.agents : [];
  for (const a of agents) {
    a.prompt_engineering = a.prompt_engineering ?? { system: "", user: "" };
  }
  return { defaults, observability, agents };
}

