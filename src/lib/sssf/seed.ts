import Database from "better-sqlite3";
import { mkdirSync, existsSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { randomBytes } from "node:crypto";

/**
 * Seed a realistic trace DB into a target repo so the Run observer is
 * demonstrable without a live `pi`-backed factory run (which needs the pi
 * binary + provider keys, available in the user's target environment, not here).
 *
 * The schema matches sssf-factory/adws/adw_modules/tracer.py exactly, so a real
 * run later writes into the same db seamlessly.
 */

const SCHEMA = `
CREATE TABLE IF NOT EXISTS sessions (
  adw_id TEXT PRIMARY KEY, adw_name TEXT, request TEXT, status TEXT, engineer TEXT,
  started_at TEXT, ended_at TEXT, total_tokens INTEGER DEFAULT 0, total_cost REAL DEFAULT 0,
  archived INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS phases (
  phase_id TEXT PRIMARY KEY, adw_id TEXT REFERENCES sessions, seq INTEGER,
  name TEXT, kind TEXT, owner TEXT, description TEXT, status TEXT DEFAULT 'fail',
  attempt INTEGER DEFAULT 0, retries INTEGER DEFAULT 0, error TEXT,
  started_at TEXT, ended_at TEXT
);
CREATE TABLE IF NOT EXISTS events (
  event_id TEXT PRIMARY KEY, adw_id TEXT REFERENCES sessions, phase_id TEXT REFERENCES phases,
  parent_id TEXT, type TEXT, name TEXT, payload_json TEXT, tokens INTEGER,
  started_at TEXT, ended_at TEXT
);
CREATE TABLE IF NOT EXISTS envelopes (
  envelope_id TEXT PRIMARY KEY, adw_id TEXT REFERENCES sessions, phase_id TEXT REFERENCES phases,
  agent TEXT, output_type TEXT, payload_json TEXT, valid INTEGER, attempt INTEGER, created_at TEXT
);
CREATE TABLE IF NOT EXISTS gate_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT, adw_id TEXT REFERENCES sessions, phase_id TEXT REFERENCES phases,
  attempt INTEGER, gate TEXT, passed INTEGER, violations_json TEXT, checks_json TEXT, created_at TEXT
);
CREATE TABLE IF NOT EXISTS processes (
  id INTEGER PRIMARY KEY AUTOINCREMENT, adw_id TEXT REFERENCES sessions, kind TEXT, name TEXT,
  pid INTEGER, command TEXT, started_at TEXT, ended_at TEXT
);
CREATE TABLE IF NOT EXISTS agent_sessions (
  adw_id TEXT REFERENCES sessions, agent TEXT, coding_agent TEXT, model TEXT, color TEXT,
  session_id TEXT, context_tokens INTEGER, context_window INTEGER,
  created_at TEXT, last_used_at TEXT, PRIMARY KEY (adw_id, agent)
);
`;

function now(offsetMs = 0): string {
  return new Date(Date.now() + offsetMs).toISOString();
}
function rid(n = 12): string {
  return randomBytes(Math.ceil(n / 2)).toString("hex").slice(0, n);
}

export interface SeedOptions {
  dbPath: string;
  request: string;
  status?: "success" | "fail" | "running";
}

export function seedDemoTrace(opts: SeedOptions): { adwId: string; dbPath: string } {
  const { dbPath, request } = opts;
  const status = opts.status ?? "success";
  mkdirSync(join(dbPath, ".."), { recursive: true });
  // Start fresh for a clean demo.
  if (existsSync(dbPath)) unlinkSync(dbPath);
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.exec(SCHEMA);

  const adwId = `demo${rid(4)}`;
  const t0 = Date.now();
  const startedAt = now(-(1000 * 60 * 4)); // 4 min ago
  const endedAt = status === "running" ? null : now();
  const totalTokens = 184320;
  const totalCost = 0.2143;

  db.prepare(
    `INSERT INTO sessions (adw_id, adw_name, request, status, engineer, started_at, ended_at, total_tokens, total_cost, archived)
     VALUES (?,?,?,?,?,?,?,?,?,0)`,
  ).run(adwId, "adw_simple_sdlc", request.slice(0, 500), status, "studio-engineer", startedAt, endedAt, totalTokens, totalCost);

  type PhaseDef = {
    name: string; kind: string; owner: string; description: string;
    status: "success" | "fail" | "running"; tokens?: number; agent?: string;
    model?: string; color?: string; envelope?: { type: string; payload: object };
    gates?: { name: string; passed: boolean; checks: { item: string; ok: boolean; note: string }[] }[];
  };

  const phases: PhaseDef[] = [
    { name: "request", kind: "engineer", owner: "studio-engineer", description: "Capture the incoming ask", status: "success" },
    {
      name: "plan", kind: "agent", owner: "planner", description: "Turn the request into an implementable plan",
      status: "success", tokens: 41200, agent: "planner", model: "fireworks/accounts/fireworks/models/kimi-k3", color: "#a78bfa",
      envelope: { type: "PlanOutput", payload: { status: "success", summary: "Plan written to specs/<id>_feature.md with 6 steps.", artifacts: ["specs/demo_feature.md"], commit_message: "plan: add light mode theming with token sets" } },
      gates: [
        { name: "artifacts_exist", passed: true, checks: [{ item: "specs/demo_feature.md", ok: true, note: "exists, 1.4KB" }] },
        { name: "files_non_empty", passed: true, checks: [{ item: "specs/demo_feature.md", ok: true, note: "23 lines" }] },
      ],
    },
    { name: "commit_plan", kind: "code", owner: "git", description: "Put the spec on record before any code exists to blur it", status: "success" },
    {
      name: "build", kind: "agent", owner: "builder", description: "Implement the plan exactly",
      status: "success", tokens: 88400, agent: "builder", model: "google/gemini-3.6-flash", color: "#22d3ee",
      envelope: { type: "BuildOutput", payload: { status: "success", summary: "Implemented theme tokens + toggle across style.css, app.js, index.html.", artifacts: ["apps/inkwell/public/style.css"], changed_files: ["apps/inkwell/public/style.css", "apps/inkwell/public/app.js", "apps/inkwell/public/index.html"], commit_message: "build: add light theme tokens + toggle with persistence" } },
      gates: [{ name: "diff_matches_claims", passed: true, checks: [{ item: "apps/inkwell/public/style.css", ok: true, note: "in diff" }, { item: "apps/inkwell/public/app.js", ok: true, note: "in diff" }] }],
    },
    {
      name: "test_1", kind: "code", owner: "quality", description: "Run the suite — a known command, so code runs it",
      status: "success",
    },
    {
      name: "review_1", kind: "agent", owner: "reviewer", description: "Confirm the build matches the plan",
      status: "success", tokens: 32600, agent: "reviewer", model: "openai/gpt-5.6-terra", color: "#fb7185",
      envelope: { type: "ReviewOutput", payload: { status: "success", approved: true, summary: "All requirements met; toggle persists and dark remains default.", findings: [{ requirement: "switch between dark and light from the UI", met: true, evidence: "app.js:42 toggle handler" }, { requirement: "dark remains default on first load", met: true, evidence: "index.html data-theme=dark" }], blocking: [] } },
      gates: [
        { name: "artifacts_exist", passed: true, checks: [{ item: "review.md", ok: true, note: "exists" }] },
        { name: "verdict_consistent", passed: true, checks: [{ item: "approved=true consistent with findings", ok: true, note: "0 blocking" }] },
      ],
    },
    { name: "commit_build", kind: "code", owner: "git", description: "Land the code only now: green suite, approved review", status: "success" },
    { name: "changes", kind: "code", owner: "git", description: "Diff the whole run against its pinned baseline, for the documenter", status: "success" },
    {
      name: "document", kind: "agent", owner: "documenter", description: "Write up the completed change",
      status: status === "running" ? "running" : "success", tokens: 22120, agent: "documenter", model: "openai/gpt-5.6-luna", color: "#e879f9",
      envelope: status === "running" ? undefined : { type: "DocumentOutput", payload: { status: "success", summary: "Wrote app_docs/demo_light-mode-theming.md.", artifacts: ["app_docs/demo_light-mode-theming.md"], document_path: "app_docs/demo_light-mode-theming.md", documented_files: ["apps/inkwell/public/style.css", "apps/inkwell/public/app.js"], commit_message: "docs: light mode theming" } },
    },
    { name: "commit_docs", kind: "code", owner: "git", description: "Ship the write-up in its own commit, beside the code it describes", status: status === "running" ? "fail" : "success" },
  ];

  let seq = 0;
  for (const p of phases) {
    seq++;
    const phaseId = `ph_${rid(12)}`;
    const pStarted = now(-((phases.length - seq + 1) * 28000));
    const pEnded = p.status === "running" ? null : now(-((phases.length - seq) * 28000));
    db.prepare(
      `INSERT INTO phases (phase_id, adw_id, seq, name, kind, owner, description, status, attempt, retries, error, started_at, ended_at)
       VALUES (?,?,?,?,?,?,?,?,?,0,NULL,?,?)`,
    ).run(phaseId, adwId, seq, p.name, p.kind, p.owner, p.description, p.status, 1, pStarted, pEnded);

    db.prepare(
      `INSERT INTO events (event_id, adw_id, phase_id, parent_id, type, name, payload_json, tokens, started_at, ended_at)
       VALUES (?,?,?,?,?,?,'{}',NULL,?,NULL)`,
    ).run(`evt_${rid(12)}`, adwId, phaseId, "", "phase_start", p.name, pStarted);

    if (p.kind === "agent" && p.agent) {
      const aStart = pStarted;
      db.prepare(
        `INSERT INTO events (event_id, adw_id, phase_id, parent_id, type, name, payload_json, tokens, started_at, ended_at)
         VALUES (?,?,?,?,?,?,'{}',NULL,?,NULL)`,
      ).run(`evt_${rid(12)}`, adwId, phaseId, "", "agent_start", p.agent, aStart);
      // a couple of tool calls
      const tools = p.agent === "builder" ? [["bash", "ls apps/inkwell/public"], ["edit", "apps/inkwell/public/style.css"], ["bash", "bun test"]] : [["read", "requests/approved-spec.md"], ["read", "specs/demo_feature.md"]];
      for (const [t, arg] of tools) {
        const ts = now(-((phases.length - seq) * 28000) + Math.random() * 5000);
        db.prepare(
          `INSERT INTO events (event_id, adw_id, phase_id, parent_id, type, name, payload_json, tokens, started_at, ended_at)
           VALUES (?,?,?,?,?,?,?,NULL,?,?)`,
        ).run(`evt_${rid(12)}`, adwId, phaseId, "", "tool_call", `${t}: ${arg}`, JSON.stringify({ tool: t, args: { command: arg, path: arg }, agent: p.agent }), ts, now(50 + Math.random() * 400));
      }
      if (p.tokens) {
        db.prepare(
          `INSERT INTO events (event_id, adw_id, phase_id, parent_id, type, name, payload_json, tokens, started_at, ended_at)
           VALUES (?,?,?,?,?,?,?,?,?,NULL)`,
        ).run(`evt_${rid(12)}`, adwId, phaseId, "", "agent_end", p.agent, JSON.stringify({ cost: p.tokens * 0.000004, usage: { input_tokens: Math.floor(p.tokens * 0.7), output_tokens: Math.floor(p.tokens * 0.3), cache_read_tokens: 0, cache_write_tokens: 0, reasoning_tokens: 0, total_tokens: p.tokens, input_cost: 0, output_cost: 0, cache_read_cost: 0, cache_write_cost: 0, total_cost: p.tokens * 0.000004 }, context_tokens: Math.floor(p.tokens * 0.85), context_window: 200000 }), p.tokens, now(-((phases.length - seq) * 28000)));
      }
      // agent_sessions row
      db.prepare(
        `INSERT INTO agent_sessions (adw_id, agent, coding_agent, model, color, session_id, context_tokens, context_window, created_at, last_used_at)
         VALUES (?,?,?,?,?,?,?,?,?,?)
         ON CONFLICT(adw_id, agent) DO UPDATE SET model=excluded.model, color=excluded.color, session_id=excluded.session_id, context_tokens=excluded.context_tokens, context_window=excluded.context_window, last_used_at=excluded.last_used_at`,
      ).run(adwId, p.agent, "pi", p.model!, p.color!, `sssf-${adwId}-${p.agent}-${rid(4)}`, Math.floor((p.tokens ?? 0) * 0.85), 200000, pStarted, pEnded ?? pStarted);
    }

    if (p.envelope) {
      db.prepare(
        `INSERT INTO envelopes (envelope_id, adw_id, phase_id, agent, output_type, payload_json, valid, attempt, created_at)
         VALUES (?,?,?,?,?,?,?,?,?)`,
      ).run(`env_${rid(12)}`, adwId, phaseId, p.agent ?? p.owner, p.envelope.type, JSON.stringify(p.envelope.payload), 1, 1, pEnded ?? pStarted);
    }
    for (const g of p.gates ?? []) {
      db.prepare(
        `INSERT INTO gate_results (adw_id, phase_id, attempt, gate, passed, violations_json, checks_json, created_at)
         VALUES (?,?,?,?,?,?,?,?)`,
      ).run(adwId, phaseId, 1, g.name, g.passed ? 1 : 0, JSON.stringify(g.passed ? [] : g.checks.filter((c) => !c.ok).map((c) => `${c.item}: ${c.note}`)), JSON.stringify(g.checks), pEnded ?? pStarted);
      db.prepare(
        `INSERT INTO events (event_id, adw_id, phase_id, parent_id, type, name, payload_json, tokens, started_at, ended_at)
         VALUES (?,?,?,?,?,?,?,NULL,?,NULL)`,
      ).run(`evt_${rid(12)}`, adwId, phaseId, "", g.passed ? "gate_pass" : "gate_fail", g.name, JSON.stringify({ attempt: 1, violations: g.passed ? [] : ["check failed"], checks: g.checks }), pEnded ?? pStarted);
    }
    db.prepare(
      `INSERT INTO events (event_id, adw_id, phase_id, parent_id, type, name, payload_json, tokens, started_at, ended_at)
       VALUES (?,?,?,?,?,?,'{}',NULL,?,?)`,
    ).run(`evt_${rid(12)}`, adwId, phaseId, "", p.status === "running" ? "log" : "phase_end", p.name, pEnded ?? pStarted, pEnded ?? pStarted);
  }

  db.close();
  return { adwId, dbPath };
}
