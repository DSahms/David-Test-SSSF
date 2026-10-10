"use client";

import { useStudio } from "@/lib/studio-store";
import { api, type AdwInfo } from "@/lib/sssf/api-client";
import { useEffect, useState, useCallback, useRef } from "react";
import { Layers, Rocket, Loader2, Play, Database, RefreshCw, CheckCircle2, XCircle, Clock, Cpu, DollarSign, FileText, Sparkles, Terminal, Wrench, GitBranch, AlertTriangle, ChevronRight, FlaskConical, CircleDot } from "lucide-react";
import { cn, timeAgo, fmtDuration, durationMs, fmtTokens, fmtCost } from "@/lib/sssf/ui";
import { toast } from "sonner";
import { APPROVED_SPEC_REL } from "@/lib/paths";

const KIND_COLOR: Record<string, string> = {
  engineer: "border-border bg-surface-2 text-fg-muted",
  agent: "border-accent/40 bg-accent-soft text-accent",
  code: "border-border bg-surface-2 text-fg-muted",
};

export function RunsTab() {
  const { activeWorkspace } = useStudio();
  const slug = activeWorkspace?.slug;
  const [adws, setAdws] = useState<AdwInfo[]>([]);
  const [rosters, setRosters] = useState<string[]>([]);
  const [roster, setRoster] = useState<string | undefined>(undefined);
  const [adw, setAdw] = useState("adw_simple_sdlc");
  const [approvedSpec, setApprovedSpec] = useState<{ path: string; preview: string } | null>(null);
  const [launching, setLaunching] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [dbExists, setDbExists] = useState(false);
  const [activeAdwId, setActiveAdwId] = useState<string | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [eventsCursor, setEventsCursor] = useState(0);
  const [launches, setLaunches] = useState<any[]>([]);
  const [tab, setTab] = useState<"trace" | "log" | "visualizer">("trace");
  const [activeLaunchLog, setActiveLaunchLog] = useState<string>("");
  const [seeding, setSeeding] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load adws/rosters/spec.
  const loadMeta = useCallback(async () => {
    if (!slug) return;
    try {
      const r = await api.getAdws(slug);
      setAdws(r.adws); setRosters(r.rosters); setApprovedSpec(r.approvedSpec);
      if (!roster && r.rosters.length) setRoster(r.rosters.includes("sssf.config.yaml") ? "sssf.config.yaml" : r.rosters[0]);
      if (r.adws.length && !r.adws.find((a) => a.name === adw)) setAdw(r.adws[0].name);
    } catch {}
  }, [slug, roster, adw]);
  useEffect(() => { loadMeta(); }, [loadMeta]);

  // Poll session list.
  const refreshSessions = useCallback(async () => {
    if (!slug) return;
    try {
      const r = await api.traceSessions(slug);
      setSessions(r.sessions); setDbExists(r.dbExists);
      const r2 = await api.listLaunches(slug);
      setLaunches(r2.launches);
    } catch {}
  }, [slug]);
  useEffect(() => {
    refreshSessions();
    const id = setInterval(refreshSessions, 4000);
    return () => clearInterval(id);
  }, [refreshSessions]);

  // Auto-select most recent session.
  useEffect(() => {
    if (!activeAdwId && sessions.length > 0) setActiveAdwId(sessions[0].adw_id);
  }, [sessions, activeAdwId]);

  // Load detail for active session.
  const loadDetail = useCallback(async () => {
    if (!slug || !activeAdwId) { setDetail(null); setEvents([]); setEventsCursor(0); return; }
    try {
      const r = await api.traceDetail(slug, activeAdwId);
      setDetail(r.detail);
    } catch { setDetail(null); }
  }, [slug, activeAdwId]);
  useEffect(() => { loadDetail(); }, [loadDetail]);

  // Poll events for an active trace session. A launch-only entry (no trace
  // session, e.g. failed validation) has nothing to poll — skip it entirely so
  // we don't hammer a 404.
  useEffect(() => {
    if (!slug || !activeAdwId || !detail) return;
    const isRunning = detail.session?.status === "running";
    let stop = false;
    async function poll() {
      if (stop || !slug || !activeAdwId) return;
      try {
        const page = await api.traceEvents(slug, activeAdwId, eventsCursor);
        if (page.events.length) { setEvents((e) => [...e, ...page.events]); setEventsCursor(page.cursor); }
        if (isRunning) { await loadDetail(); }
      } catch {}
    }
    poll();
    const id = setInterval(poll, isRunning ? 1500 : 8000);
    return () => { stop = true; clearInterval(id); };
  }, [slug, activeAdwId, eventsCursor, detail, loadDetail]);

  // active launch log + auto-tab on session change (NOT on every poll — the
  // user may have manually switched to the visualizer/log view).
  const prevAdwId = useRef<string | null>(null);
  useEffect(() => {
    const match = launches.find((l) => l.adwId === activeAdwId);
    setActiveLaunchLog(match?.logTail || "");
    if (prevAdwId.current !== activeAdwId) {
      prevAdwId.current = activeAdwId;
      setTab(match ? "log" : "trace");
    }
  }, [activeAdwId, launches]);

  async function launch() {
    if (!slug) return;
    if (!approvedSpec) { toast.error("No approved spec. Approve one in Discovery first."); return; }
    setLaunching(true);
    try {
      const r = await api.launch(slug, adw, roster, approvedSpec.path);
      toast.success(`Launched ${adw} (adw-id ${r.adwId})`);
      setActiveAdwId(r.adwId);
      setTab("log");
      setTimeout(refreshSessions, 800);
    } catch (e: any) { toast.error(e.message); }
    finally { setLaunching(false); }
  }

  async function seedDemo() {
    if (!slug) return;
    setSeeding(true);
    try {
      const r = await api.seedDemo(slug, approvedSpec ? undefined : "Add a light mode to contrast the default dark mode, with theme tokens.", "success");
      toast.success(`Demo trace seeded (adw-id ${r.adwId})`);
      setActiveAdwId(r.adwId);
      setTimeout(refreshSessions, 400);
    } catch (e: any) { toast.error(e.message); }
    finally { setSeeding(false); }
  }

  if (!slug) return null;
  const dbPath = activeWorkspace ? `${activeWorkspace.path}/adws/adw_data/sssf.db` : "";
  const recommended = adws.find((a) => a.recommended);
  const selectedAdw = adws.find((a) => a.name === adw);

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-border bg-surface px-6 py-3">
        <div className="flex items-center gap-3">
          <Rocket className="h-5 w-5 text-accent" />
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-fg-muted">Runs</div>
            <div className="font-display text-[17px] font-semibold tracking-tight">Launch & observe</div>
          </div>
          <button onClick={refreshSessions} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[12px] font-medium text-fg-muted hover:bg-bg"><RefreshCw className="h-3.5 w-3.5" /> Refresh</button>
          <button onClick={seedDemo} disabled={seeding} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[12px] font-medium text-fg-muted hover:bg-bg disabled:opacity-50">
            {seeding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FlaskConical className="h-3.5 w-3.5" />} Seed demo trace
          </button>
        </div>

        {/* Launch bar */}
        <div className="mt-3 flex flex-wrap items-end gap-3" data-tour="tour-runs-launch">
          <div className="min-w-[220px] flex-1">
            <label className="mb-1 block text-[11px] font-medium text-fg-muted">ADW workflow</label>
            <select value={adw} onChange={(e) => setAdw(e.target.value)} className="w-full rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[13px] outline-none focus:border-accent">
              {adws.map((a) => <option key={a.name} value={a.name}>{a.name}{a.recommended ? "  (recommended)" : ""}</option>)}
            </select>
          </div>
          <div className="min-w-[180px]">
            <label className="mb-1 block text-[11px] font-medium text-fg-muted">Roster config</label>
            <select value={roster ?? ""} onChange={(e) => setRoster(e.target.value)} className="w-full rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[13px] outline-none focus:border-accent">
              {rosters.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="min-w-[180px]">
            <label className="mb-1 block text-[11px] font-medium text-fg-muted">Approved spec</label>
            <div className={cn("rounded-lg border px-2.5 py-1.5 text-[12px] font-mono", approvedSpec ? "border-accent/30 bg-accent-soft text-accent" : "border-warning/30 bg-warning/10 text-warning")}>
              {approvedSpec ? approvedSpec.path : "none — approve in Discovery"}
            </div>
          </div>
          <button onClick={launch} disabled={launching || !approvedSpec} className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-[13px] font-medium text-fg hover:bg-accent disabled:opacity-50">
            {launching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />} Launch {adw}
          </button>
        </div>
        {selectedAdw && (
          <div className="mt-2 flex items-start gap-2 text-[12px] text-fg-muted">
            <GitBranch className="mt-0.5 h-3.5 w-3.5 shrink-0 text-fg-muted" />
            <span><span className="font-medium text-fg-muted">Phases:</span> {selectedAdw.chain}</span>
            <span className="text-fg-muted">·</span>
            <span>{selectedAdw.description}</span>
            {selectedAdw.requiredAgents.length > 0 && <><span className="text-fg-muted">·</span><span>requires: {selectedAdw.requiredAgents.join(", ")}</span></>}
          </div>
        )}
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Session list */}
        <aside className="w-72 shrink-0 border-r border-border bg-surface overflow-y-auto studio-scroll" data-tour="tour-runs-sessions">
          <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-fg-muted">Trace sessions {dbExists ? `(${sessions.length})` : "(no db yet)"}</div>
          {sessions.length === 0 && (
            <div className="px-3 py-6 text-center text-[12px] text-fg-muted">
              <Database className="mx-auto mb-2 h-6 w-6 text-fg-muted" />
              {dbExists ? "No sessions yet. Launch a run or seed a demo trace." : "No trace DB. Launch a run (the factory creates it) or seed a demo."}
            </div>
          )}
          {sessions.map((s) => (
            <button key={s.adw_id} onClick={() => { setActiveAdwId(s.adw_id); setEvents([]); setEventsCursor(0); }} className={cn("block w-full border-l-2 px-3 py-2 text-left", activeAdwId === s.adw_id ? "border-accent bg-accent-soft/50" : "border-transparent hover:bg-bg")}>
              <div className="flex items-center gap-1.5">
                <StatusDot status={s.status} />
                <span className="truncate font-mono text-[12px] font-medium text-fg">{s.adw_id}</span>
              </div>
              <div className="mt-0.5 truncate text-[11px] text-fg-muted">{s.adw_name || s.request?.slice(0, 50) || "—"}</div>
              <div className="mt-1 flex items-center gap-2 text-[10.5px] text-fg-muted">
                <span>{timeAgo(s.started_at)}</span>
                {s.total_tokens ? <span>· {fmtTokens(s.total_tokens)}</span> : null}
                {s.total_cost ? <span>· {fmtCost(s.total_cost)}</span> : null}
                <span>· {s.phase_count} phases</span>
              </div>
              {/* phase dots */}
              <div className="mt-1.5 flex flex-wrap gap-0.5">
                {s.phases?.slice(0, 16).map((p: any) => (
                  <span key={p.phase_id} title={`${p.name}: ${p.status}`} className={cn("h-1.5 w-3 rounded-sm", p.status === "success" ? "bg-success" : p.status === "fail" ? "bg-danger" : p.status === "running" ? "bg-warning animate-pulse" : "bg-fg-muted/40")} />
                ))}
              </div>
            </button>
          ))}
          {/* Launches without a trace session (e.g. failed validation before a
              session was created) — still show them so the log is reachable. */}
          {launches
            .filter((l) => !sessions.some((s) => s.adw_id === l.adwId))
            .map((l) => (
              <button key={l.id} onClick={() => { setActiveAdwId(l.adwId); setEvents([]); setEventsCursor(0); setTab("log"); }} className={cn("block w-full border-l-2 px-3 py-2 text-left", activeAdwId === l.adwId ? "border-warning bg-warning/10/50" : "border-transparent hover:bg-bg")}>
                <div className="flex items-center gap-1.5">
                  <span className={cn("h-2 w-2 rounded-full", l.status === "done" ? "bg-accent" : l.status === "error" ? "bg-danger" : "bg-warning")} />
                  <span className="truncate font-mono text-[12px] font-medium text-fg">{l.adwId}</span>
                </div>
                <div className="mt-0.5 truncate text-[11px] text-fg-muted">{l.adw} · no trace (launch only)</div>
                <div className="mt-1 text-[10.5px] text-fg-muted">{timeAgo(l.createdAt)}</div>
              </button>
            ))}
        </aside>

        {/* Detail */}
        <div className="min-w-0 flex-1 overflow-y-auto studio-scroll">
          {!detail ? (
            <LaunchOnlyView activeAdwId={activeAdwId} launches={launches} onRetrySeed={() => {}} slug={slug} />
          ) : (
            <RunDetail detail={detail} events={events} tab={tab} setTab={setTab} launchLog={activeLaunchLog} dbPath={dbPath} adwId={activeAdwId} />
          )}
        </div>
      </div>
    </div>
  );
}

function LaunchOnlyView({ activeAdwId, launches, slug }: { activeAdwId: string | null; launches: any[]; onRetrySeed: () => void; slug: string }) {
  const launch = launches.find((l) => l.adwId === activeAdwId);
  if (!launch) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-[13px] text-fg-muted">
        <div>
          <Rocket className="mx-auto mb-3 h-8 w-8 text-fg-muted" />
          Select a session on the left, or launch a new run.
        </div>
      </div>
    );
  }
  return (
    <div className="p-5">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-mono text-[15px] font-semibold text-fg">{launch.adwId}</h2>
        <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium", launch.status === "error" ? "border-danger/30 bg-danger/10 text-danger" : launch.status === "done" ? "border-accent/30 bg-accent-soft text-accent" : "border-warning/30 bg-warning/10 text-warning")}>{launch.status}</span>
        <span className="text-[12px] text-fg-muted">{launch.adw}</span>
        <span className="ml-auto text-[12px] text-fg-muted">{timeAgo(launch.createdAt)}</span>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-[12px] sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-surface px-3 py-2"><div className="text-[10px] uppercase tracking-wide text-fg-muted">Config</div><div className="truncate font-mono text-[11px] text-fg-muted">{launch.configPath?.split("/").slice(-2).join("/")}</div></div>
        <div className="rounded-lg border border-border bg-surface px-3 py-2"><div className="text-[10px] uppercase tracking-wide text-fg-muted">Spec</div><div className="truncate font-mono text-[11px] text-fg-muted">{launch.specPath}</div></div>
        <div className="rounded-lg border border-border bg-surface px-3 py-2"><div className="text-[10px] uppercase tracking-wide text-fg-muted">PID</div><div className="font-mono text-[11px] text-fg-muted">{launch.pid ?? "—"}</div></div>
      </div>
      {launch.error && <div className="mt-3 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-[12px] text-danger">{launch.error}</div>}
      <div className="mt-4">
        <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-fg-muted"><Terminal className="h-3.5 w-3.5" /> Launch log</div>
        {launch.logTail ? (
          <pre className="rounded-lg bg-surface-3 p-3 text-[11.5px] leading-relaxed text-fg-muted overflow-auto max-h-[60vh] studio-scroll whitespace-pre-wrap">{launch.logTail}</pre>
        ) : (
          <div className="rounded-lg border border-dashed border-border bg-bg px-3 py-6 text-center text-[12px] text-fg-muted">No output yet — the run may still be starting.</div>
        )}
        <p className="mt-2 text-[11px] text-fg-muted">
          No trace session was recorded. The factory's <code className="rounded bg-surface-2 px-1">agents.validate()</code> runs before any session is created, so a misconfigured roster (e.g. a model not registered with <code className="rounded bg-surface-2 px-1">pi --list-models</code>, or a missing API key) fails here. Fix the roster in <b>Configuration</b> or set keys, then relaunch.
        </p>
      </div>
    </div>
  );
}

function RunDetail({ detail, events, tab, setTab, launchLog, dbPath, adwId }: { detail: any; events: any[]; tab: "trace" | "log" | "visualizer"; setTab: (t: "trace" | "log" | "visualizer") => void; launchLog: string; dbPath: string; adwId: string | null }) {
  const { session, phases, agents, envelopes, gates, usage } = detail;
  const [filterPhase, setFilterPhase] = useState<string | null>(null);
  const shownEvents = filterPhase ? events.filter((e) => e.phase_id === filterPhase) : events;
  const dur = durationMs(session.started_at, session.ended_at);
  const isRunning = session.status === "running";

  return (
    <div className="p-5">
      {/* Summary */}
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-mono text-[15px] font-semibold text-fg">{session.adw_id}</h2>
        <StatusBadge status={session.status} />
        <span className="text-[12px] text-fg-muted">{session.adw_name}</span>
        <div className="ml-auto flex items-center gap-4 text-[12px] text-fg-muted">
          <Stat icon={Clock} label={fmtDuration(dur)} />
          <Stat icon={Cpu} label={fmtTokens(session.total_tokens)} />
          <Stat icon={DollarSign} label={fmtCost(session.total_cost)} />
          <Stat icon={FileText} label={`${usage.read + usage.written > 0 ? `${fmtTokens(usage.read)} read / ${fmtTokens(usage.written)} written` : "—"}`} />
        </div>
      </div>
      {session.request && <p className="mt-1.5 max-w-3xl text-[12px] text-fg-muted">{session.request}</p>}

      {/* Agent lanes */}
      {agents.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {agents.map((a: any) => (
            <span key={a.agent} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2 py-0.5 text-[11px]">
              <span className="h-2 w-2 rounded-full" style={{ background: a.color || "#a1a1aa" }} />
              <span className="font-medium text-fg">{a.agent}</span>
              {a.model && <span className="font-mono text-[10px] text-fg-muted">{a.model}</span>}
              {a.context_tokens && a.context_window ? <span className="text-[10px] text-fg-muted">{fmtTokens(a.context_tokens)}/{fmtTokens(a.context_window)}</span> : null}
            </span>
          ))}
        </div>
      )}

      {/* Phase timeline */}
      <div className="mt-4">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-fg-muted">Phases</div>
        <div className="flex flex-wrap gap-1.5">
          {phases.map((p: any) => (
            <button key={p.phase_id} onClick={() => setFilterPhase((f) => (f === p.phase_id ? null : p.phase_id))} className={cn("group flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-left transition-all", filterPhase === p.phase_id ? "ring-2 ring-accent/40" : "", KIND_COLOR[p.kind] || "border-border bg-surface")}>
              <PhaseKindIcon kind={p.kind} />
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="font-mono text-[11.5px] font-semibold">{p.name}</span>
                  <PhaseStatus status={p.status} />
                </div>
                <div className="text-[10px] text-fg-muted">{p.owner} · {fmtDuration(durationMs(p.started_at, p.ended_at))}</div>
              </div>
              {p.attempt > 1 && <span className="rounded bg-surface/70 px-1 text-[9px] font-medium text-fg-muted">×{p.attempt}</span>}
            </button>
          ))}
        </div>
        {filterPhase && <button onClick={() => setFilterPhase(null)} className="mt-1.5 text-[11px] text-accent hover:underline">Clear phase filter</button>}
      </div>

      {/* Tabs: trace events / launch log / embedded visualizer */}
      <div className="mt-4 flex items-center gap-1 border-b border-border">
        <TabBtn active={tab === "trace"} onClick={() => setTab("trace")} icon={Sparkles} label={`Events (${shownEvents.length})`} />
        <TabBtn active={tab === "log"} onClick={() => setTab("log")} icon={Terminal} label="Launch log" />
        <TabBtn active={tab === "visualizer"} onClick={() => setTab("visualizer")} icon={Layers} label="Visualizer" />
      </div>

      {tab === "trace" ? (
        <div className="mt-3 space-y-4">
          {shownEvents.length === 0 && <div className="py-6 text-center text-[12px] text-fg-muted">{isRunning ? "Waiting for events…" : "No events recorded."}</div>}
          <div className="space-y-0.5">
            {shownEvents.map((e) => <EventRow key={e.event_id} e={e} />)}
          </div>
          {(envelopes.length > 0 || gates.length > 0) && (
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {envelopes.length > 0 && <DetailSection title={`Envelopes (${envelopes.length})`} icon={FileText}>{envelopes.map((en: any) => <EnvelopeRow key={en.envelope_id} en={en} />)}</DetailSection>}
              {gates.length > 0 && <DetailSection title={`Gate results (${gates.length})`} icon={CheckCircle2}>{gates.map((g: any) => <GateRow key={g.id} g={g} />)}</DetailSection>}
            </div>
          )}
        </div>
      ) : tab === "log" ? (
        <div className="mt-3">
          {launchLog ? (
            <pre className="rounded-lg bg-surface-3 p-3 text-[11.5px] leading-relaxed text-fg-muted overflow-auto max-h-[60vh] studio-scroll whitespace-pre-wrap">{launchLog}</pre>
          ) : <div className="py-6 text-center text-[12px] text-fg-muted">No launch log for this session. Logs appear for runs started from SSSF Studio.</div>}
        </div>
      ) : (
        <VisualizerEmbed dbPath={dbPath} adwId={session.adw_id} />
      )}
    </div>
  );
}

/** Embedded copy of the factory's official Vue visualizer, served from the
 *  mini-service on port 4600 with the workspace's sssf.db passed via ?db=. */
function VisualizerEmbed({ dbPath, adwId }: { dbPath: string; adwId: string }) {
  const src = `/?XTransformPort=4600&db=${encodeURIComponent(dbPath)}#/${encodeURIComponent(adwId)}`;
  return (
    <div className="mt-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[11.5px] text-fg-muted">The factory's official visualizer, embedded. It polls the same <code className="rounded bg-surface-2 px-1 font-mono text-[11px]">sssf.db</code> as the Studio view — use it for the full waterfall / lane / envelope UX.</p>
        <a href={src} target="_blank" rel="noreferrer" className="text-[11.5px] font-medium text-accent hover:underline">Open in new tab ↗</a>
      </div>
      <iframe
        src={src}
        title="SSSF visualizer"
        className="h-[70vh] w-full rounded-xl border border-border bg-surface"
        loading="lazy"
      />
    </div>
  );
}

function EventRow({ e }: { e: any }) {
  const [open, setOpen] = useState(false);
  const payload = e.payload_json ? JSON.parse(e.payload_json) : {};
  const icon = EVENT_ICON[e.type] || CircleDot;
  const Icon = icon;
  const time = e.started_at ? new Date(e.started_at).toLocaleTimeString(undefined, { hour12: false }) + (e.ended_at ? ` → ${new Date(e.ended_at).toLocaleTimeString(undefined, { hour12: false })}` : "") : "";
  return (
    <div className="rounded-md hover:bg-bg">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-2 px-1.5 py-1 text-left">
        <Icon className={cn("h-3.5 w-3.5 shrink-0", EVENT_COLOR[e.type] || "text-fg-muted")} />
        <span className={cn("font-mono text-[11.5px]", e.type === "error" ? "text-danger" : "text-fg")}>{e.name || e.type}</span>
        <span className="rounded bg-surface-2 px-1 text-[10px] text-fg-muted">{e.type}</span>
        {e.tokens ? <span className="text-[10px] text-fg-muted">{fmtTokens(e.tokens)}</span> : null}
        <span className="ml-auto font-mono text-[10px] text-fg-muted">{time}</span>
        {e.payload_json && e.payload_json !== "{}" && <ChevronRight className={cn("h-3 w-3 text-fg-muted transition-transform", open && "rotate-90")} />}
      </button>
      {open && e.payload_json && e.payload_json !== "{}" && (
        <pre className="ml-7 mb-1 max-h-48 overflow-auto rounded bg-surface-3 p-2 text-[10.5px] text-fg-muted studio-scroll">{JSON.stringify(payload, null, 2)}</pre>
      )}
    </div>
  );
}

function EnvelopeRow({ en }: { en: any }) {
  const [open, setOpen] = useState(false);
  const payload = JSON.parse(en.payload_json);
  return (
    <div className="rounded-lg border border-border bg-surface p-2">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-2 text-left">
        <span className="h-2 w-2 rounded-full" style={{ background: payload.status === "success" ? "#10b981" : "#f43f5e" }} />
        <span className="font-mono text-[11.5px] font-medium text-fg">{en.agent}</span>
        <span className="rounded bg-surface-2 px-1 text-[10px] text-fg-muted">{en.output_type}</span>
        {en.valid ? <CheckCircle2 className="h-3 w-3 text-success" /> : <XCircle className="h-3 w-3 text-danger" />}
        <ChevronRight className={cn("ml-auto h-3 w-3 text-fg-muted transition-transform", open && "rotate-90")} />
      </button>
      {open && (
        <div className="mt-1.5">
          {payload.summary && <p className="text-[11.5px] text-fg-muted">{payload.summary}</p>}
          {payload.artifacts?.length > 0 && <div className="mt-1 text-[10.5px] text-fg-muted">artifacts: {payload.artifacts.join(", ")}</div>}
          <pre className="mt-1.5 max-h-40 overflow-auto rounded bg-surface-3 p-2 text-[10px] text-fg-muted studio-scroll">{JSON.stringify(payload, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

function GateRow({ g }: { g: any }) {
  const checks = g.checks_json ? JSON.parse(g.checks_json) : [];
  return (
    <div className={cn("rounded-lg border p-2", g.passed ? "border-accent/30 bg-accent-soft/40" : "border-danger/30 bg-danger/10/40")}>
      <div className="flex items-center gap-2">
        {g.passed ? <CheckCircle2 className="h-3.5 w-3.5 text-accent" /> : <XCircle className="h-3.5 w-3.5 text-danger" />}
        <span className="font-mono text-[11.5px] font-medium text-fg">{g.gate}</span>
        <span className="text-[10px] text-fg-muted">attempt {g.attempt}</span>
      </div>
      {checks.length > 0 && (
        <ul className="mt-1 space-y-0.5">
          {checks.map((c: any, i: number) => (
            <li key={i} className="flex items-start gap-1.5 text-[11px] text-fg-muted">
              {c.ok ? <CheckCircle2 className="mt-0.5 h-3 w-3 text-success" /> : <XCircle className="mt-0.5 h-3 w-3 text-danger" />}
              <span className="font-mono">{c.item}</span>
              {c.note && <span className="text-fg-muted">— {c.note}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── bits ────────────────────────────────────────────────────────────────────
const EVENT_ICON: Record<string, any> = {
  phase_start: Play, phase_end: CheckCircle2, agent_start: Sparkles, agent_end: Cpu,
  tool_call: Wrench, gate_pass: CheckCircle2, gate_fail: XCircle, handoff: GitBranch,
  log: CircleDot, error: AlertTriangle,
};
const EVENT_COLOR: Record<string, string> = {
  phase_start: "text-fg-muted", phase_end: "text-success", agent_start: "text-success", agent_end: "text-success",
  tool_call: "text-fg-muted", gate_pass: "text-success", gate_fail: "text-danger", handoff: "text-fg-muted", error: "text-danger", log: "text-fg-muted",
};

function Stat({ icon: Icon, label }: { icon: any; label: string }) {
  return <span className="inline-flex items-center gap-1"><Icon className="h-3.5 w-3.5 text-fg-muted" /> {label}</span>;
}
function TabBtn({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: any; label: string }) {
  return <button onClick={onClick} className={cn("inline-flex items-center gap-1.5 border-b-2 px-3 py-1.5 text-[12px] font-medium", active ? "border-accent text-fg" : "border-transparent text-fg-muted hover:text-fg-muted")}><Icon className="h-3.5 w-3.5" /> {label}</button>;
}
function DetailSection({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return <div><div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-fg-muted"><Icon className="h-3.5 w-3.5" /> {title}</div><div className="space-y-1.5">{children}</div></div>;
}
function StatusDot({ status }: { status: string }) {
  return <span className={cn("h-2 w-2 rounded-full", status === "success" ? "bg-accent" : status === "fail" ? "bg-danger" : status === "running" ? "bg-warning animate-pulse" : "bg-fg-muted/40")} />;
}
function StatusBadge({ status }: { status: string }) {
  return <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium", status === "success" ? "border-accent/30 bg-accent-soft text-accent" : status === "fail" ? "border-danger/30 bg-danger/10 text-danger" : status === "running" ? "border-warning/30 bg-warning/10 text-warning" : "border-border bg-bg text-fg-muted")}>{status === "running" && <Loader2 className="h-3 w-3 animate-spin" />}{status}</span>;
}
function PhaseStatus({ status }: { status: string }) {
  if (status === "success") return <CheckCircle2 className="h-3 w-3 text-success" />;
  if (status === "fail") return <XCircle className="h-3 w-3 text-danger" />;
  if (status === "running") return <Loader2 className="h-3 w-3 animate-spin text-warning" />;
  return <Clock className="h-3 w-3 text-fg-muted" />;
}
function PhaseKindIcon({ kind }: { kind: string }) {
  if (kind === "agent") return <Sparkles className="h-3.5 w-3.5" />;
  if (kind === "code") return <Terminal className="h-3.5 w-3.5" />;
  return <CircleDot className="h-3.5 w-3.5" />;
}
