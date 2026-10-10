import Database from "better-sqlite3";
import { existsSync } from "node:fs";
import type { Database as DB } from "better-sqlite3";

/**
 * Read-only reader over a target repo's sssf.db — the trace DB the factory's
 * tracer writes (WAL) and the visualizer polls. Mirrors the schema in
 * sssf-factory/adws/adw_modules/tracer.py.
 */

export interface TraceSession {
  adw_id: string;
  adw_name: string | null;
  request: string | null;
  status: string | null;
  engineer: string | null;
  started_at: string | null;
  ended_at: string | null;
  total_tokens: number | null;
  total_cost: number | null;
  archived: number | null;
}

export interface TracePhase {
  phase_id: string;
  adw_id: string;
  seq: number;
  name: string;
  kind: string;
  owner: string;
  description: string;
  status: string;
  attempt: number;
  retries: number;
  error: string | null;
  started_at: string | null;
  ended_at: string | null;
}

export interface TraceEvent {
  rowid: number;
  event_id: string;
  adw_id: string;
  phase_id: string | null;
  parent_id: string | null;
  type: string;
  name: string | null;
  payload_json: string | null;
  tokens: number | null;
  started_at: string | null;
  ended_at: string | null;
}

export interface TraceEnvelope {
  envelope_id: string;
  adw_id: string;
  phase_id: string;
  agent: string;
  output_type: string;
  payload_json: string;
  valid: number;
  attempt: number;
  created_at: string;
}

export interface TraceGate {
  id: number;
  adw_id: string;
  phase_id: string;
  attempt: number;
  gate: string;
  passed: number;
  violations_json: string | null;
  checks_json: string | null;
  created_at: string;
}

export interface TraceAgentSession {
  adw_id: string;
  agent: string;
  coding_agent: string | null;
  model: string | null;
  session_id: string | null;
  color: string | null;
  context_tokens: number | null;
  context_window: number | null;
  created_at: string | null;
  last_used_at: string | null;
}

export interface SessionSummary extends TraceSession {
  phases: TracePhase[];
  phase_count: number;
  agents: TraceAgentSession[];
}

export interface SessionDetail {
  session: TraceSession;
  phases: TracePhase[];
  agents: TraceAgentSession[];
  envelopes: TraceEnvelope[];
  gates: TraceGate[];
  usage: { read: number; written: number };
}

export interface EventsPage {
  events: TraceEvent[];
  cursor: number;
  has_more: boolean;
}

function openReadonly(dbPath: string): DB {
  if (!existsSync(dbPath)) throw new Error(`trace db not found: ${dbPath}`);
  const db = new Database(dbPath, { readonly: true, fileMustExist: true });
  db.pragma("busy_timeout = 5000");
  return db;
}

/** Probe + lazy column detection, like the official visualizer's db.ts. */
function hasColumn(db: DB, table: string, column: string): boolean {
  const cols = db.pragma(`table_info(${table})`) as Array<{ name: string }>;
  return cols.some((c) => c.name === column);
}

export function listSessions(dbPath: string, limit = 100): SessionSummary[] {
  const db = openReadonly(dbPath);
  try {
    const archivedCol = hasColumn(db, "sessions", "archived") ? "archived" : "0";
    const adwNameCol = hasColumn(db, "sessions", "adw_name") ? "adw_name" : "NULL AS adw_name";
    const rows = db
      .prepare(
        `SELECT adw_id, ${adwNameCol}, request, status, engineer, started_at, ended_at,
                total_tokens, total_cost, ${archivedCol} AS archived
           FROM sessions
          WHERE COALESCE(${archivedCol}, 0) = 0
          ORDER BY started_at DESC, rowid DESC LIMIT ?`,
      )
      .all(limit) as TraceSession[];
    if (rows.length === 0) return [];
    const ids = rows.map((r) => r.adw_id);
    const placeholders = ids.map(() => "?").join(",");
    const phaseRows = db
      .prepare(
        `SELECT phase_id, adw_id, seq, name, kind, owner, description, status,
                attempt, retries, error, started_at, ended_at
           FROM phases WHERE adw_id IN (${placeholders}) ORDER BY seq, rowid`,
      )
      .all(...ids) as TracePhase[];
    const byAdw = new Map<string, TracePhase[]>();
    for (const p of phaseRows) {
      const list = byAdw.get(p.adw_id) ?? [];
      list.push(p);
      byAdw.set(p.adw_id, list);
    }
    const agentsByAdw = agentsFor(db, ids);
    return rows.map((s) => ({
      ...s,
      phases: byAdw.get(s.adw_id) ?? [],
      phase_count: byAdw.get(s.adw_id)?.length ?? 0,
      agents: agentsByAdw.get(s.adw_id) ?? [],
    }));
  } finally {
    db.close();
  }
}

function agentsFor(db: DB, ids: string[]): Map<string, TraceAgentSession[]> {
  const byAdw = new Map<string, TraceAgentSession[]>();
  if (ids.length === 0) return byAdw;
  const placeholders = ids.map(() => "?").join(",");
  const color = hasColumn(db, "agent_sessions", "color") ? "color" : "NULL AS color";
  const ctxT = hasColumn(db, "agent_sessions", "context_tokens") ? "context_tokens" : "NULL AS context_tokens";
  const ctxW = hasColumn(db, "agent_sessions", "context_window") ? "context_window" : "NULL AS context_window";
  const completed = db
    .prepare(
      `SELECT adw_id, agent, coding_agent, model, session_id, ${color},
              ${ctxT}, ${ctxW}, created_at, last_used_at
         FROM agent_sessions WHERE adw_id IN (${placeholders})
        ORDER BY created_at, agent`,
    )
    .all(...ids) as TraceAgentSession[];
  for (const r of completed) {
    const list = byAdw.get(r.adw_id) ?? [];
    list.push(r);
    byAdw.set(r.adw_id, list);
  }
  // Running agents not yet in agent_sessions — fill from agent_start events.
  const started = db
    .prepare(
      `SELECT e.adw_id, p.owner AS agent, e.payload_json, e.started_at
         FROM events e JOIN phases p ON p.phase_id = e.phase_id
        WHERE e.adw_id IN (${placeholders}) AND e.type = 'agent_start'
        ORDER BY e.rowid`,
    )
    .all(...ids) as { adw_id: string; agent: string | null; payload_json: string | null; started_at: string | null }[];
  for (const r of started) {
    if (!r.agent) continue;
    if (byAdw.get(r.adw_id)?.some((a) => a.agent === r.agent)) continue;
    let payload: any = {};
    try { payload = JSON.parse(r.payload_json ?? "{}"); } catch {}
    const list = byAdw.get(r.adw_id) ?? [];
    list.push({
      adw_id: r.adw_id, agent: r.agent, coding_agent: null,
      model: payload.model ?? null, session_id: payload.session_id ?? null,
      color: payload.color ?? null, context_tokens: null, context_window: null,
      created_at: r.started_at, last_used_at: r.started_at,
    });
    byAdw.set(r.adw_id, list);
  }
  return byAdw;
}

export function sessionDetail(dbPath: string, adwId: string): SessionDetail | null {
  const db = openReadonly(dbPath);
  try {
    const adwNameCol = hasColumn(db, "sessions", "adw_name") ? "adw_name" : "NULL AS adw_name";
    const session = db
      .prepare(
        `SELECT adw_id, ${adwNameCol}, request, status, engineer, started_at, ended_at,
                total_tokens, total_cost FROM sessions WHERE adw_id = ?`,
      )
      .get(adwId) as TraceSession | undefined;
    if (!session) return null;
    const phases = db
      .prepare(
        `SELECT phase_id, adw_id, seq, name, kind, owner, description, status,
                attempt, retries, error, started_at, ended_at
           FROM phases WHERE adw_id = ? ORDER BY seq, rowid`,
      )
      .all(adwId) as TracePhase[];
    const agents = agentsFor(db, [adwId]).get(adwId) ?? [];
    const envelopes = db
      .prepare(
        `SELECT envelope_id, adw_id, phase_id, agent, output_type, payload_json,
                valid, attempt, created_at FROM envelopes WHERE adw_id = ?
          ORDER BY created_at, rowid`,
      )
      .all(adwId) as TraceEnvelope[];
    const checksCol = hasColumn(db, "gate_results", "checks_json") ? "checks_json" : "NULL AS checks_json";
    const gates = db
      .prepare(
        `SELECT id, adw_id, phase_id, attempt, gate, passed, violations_json,
                ${checksCol}, created_at FROM gate_results WHERE adw_id = ? ORDER BY id`,
      )
      .all(adwId) as TraceGate[];
    const usage = computeUsage(db, adwId);
    return { session, phases, agents, envelopes, gates, usage };
  } finally {
    db.close();
  }
}

function computeUsage(db: DB, adwId: string): { read: number; written: number } {
  const rows = db
    .prepare("SELECT payload_json FROM events WHERE adw_id = ? AND type = 'agent_end'")
    .all(adwId) as { payload_json: string | null }[];
  let read = 0, written = 0;
  for (const r of rows) {
    if (!r.payload_json) continue;
    try {
      const u = (JSON.parse(r.payload_json) as { usage?: Record<string, number> }).usage;
      if (!u) continue;
      read += (u.input_tokens ?? 0) + (u.cache_write_tokens ?? 0);
      written += u.output_tokens ?? 0;
    } catch {}
  }
  return { read, written };
}

export function events(dbPath: string, adwId: string, after = 0, limit = 500): EventsPage {
  const db = openReadonly(dbPath);
  try {
    const capped = Math.min(Math.max(1, limit), 1000);
    const rows = db
      .prepare(
        `SELECT rowid, event_id, adw_id, phase_id, parent_id, type, name,
                payload_json, tokens, started_at, ended_at
           FROM events WHERE adw_id = ? AND rowid > ? ORDER BY rowid LIMIT ?`,
      )
      .all(adwId, Math.max(0, after), capped) as TraceEvent[];
    return {
      events: rows,
      cursor: rows.length > 0 ? rows[rows.length - 1].rowid : Math.max(0, after),
      has_more: rows.length === capped,
    };
  } finally {
    db.close();
  }
}

export function sessionCount(dbPath: string): number {
  if (!existsSync(dbPath)) return 0;
  const db = openReadonly(dbPath);
  try {
    const row = db.prepare("SELECT COUNT(*) AS n FROM sessions").get() as { n: number };
    return row?.n ?? 0;
  } catch {
    return 0;
  } finally {
    db.close();
  }
}
