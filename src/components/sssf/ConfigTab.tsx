"use client";

import { useStudio } from "@/lib/studio-store";
import { api } from "@/lib/sssf/api-client";
import { useEffect, useState, useCallback } from "react";
import { SlidersHorizontal, Loader2, Save, Plus, Trash2, AlertCircle, CheckCircle2, KeyRound, Eye, EyeOff, X, FileCode2, ClipboardPaste } from "lucide-react";
import { cn } from "@/lib/sssf/ui";
import { toast } from "sonner";
import { THINKING_LEVELS, CODING_AGENTS, PI_TOOLS, type SSSFConfig, type AgentConfig } from "@/lib/sssf/config";

export function ConfigTab() {
  const { activeWorkspace } = useStudio();
  const slug = activeWorkspace?.slug;
  const [rosters, setRosters] = useState<string[]>([]);
  const [roster, setRoster] = useState<string | undefined>(undefined);
  const [config, setConfig] = useState<SSSFConfig | null>(null);
  const [configPath, setConfigPath] = useState("");
  const [problems, setProblems] = useState<any[]>([]);
  const [providers, setProviders] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showYaml, setShowYaml] = useState(false);
  const [dirty, setDirty] = useState(false);

  const load = useCallback(async (r?: string) => {
    if (!slug) return;
    setLoading(true);
    try {
      const adws = await api.getAdws(slug);
      setRosters(adws.rosters);
      const useRoster = r ?? (adws.rosters.includes("sssf.config.yaml") ? "sssf.config.yaml" : adws.rosters[0]);
      setRoster(useRoster);
      if (useRoster) {
        const c = await api.getConfig(slug, useRoster);
        setConfig(c.config);
        setConfigPath(c.configPath);
        setProblems(c.problems);
        setProviders(c.providers);
        setDirty(false);
      }
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  async function save() {
    if (!slug || !config || !roster) return;
    setSaving(true);
    try {
      const r = await api.saveConfig(slug, config, roster);
      setProblems(r.problems);
      setProviders(r.providers);
      setDirty(false);
      toast.success(`Saved ${roster}`);
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  }

  function update(mut: (c: SSSFConfig) => void) {
    setConfig((c) => { if (!c) return c; const next = structuredClone(c); mut(next); return next; });
    setDirty(true);
  }

  function addAgent() {
    update((c) => {
      c.agents.push({
        name: `agent_${c.agents.length + 1}`,
        purpose: "",
        prompt_engineering: { system: "adws/adw_data/prompt_engineering/<name>/system.md", user: "adws/adw_data/prompt_engineering/<name>/user.md" },
        model: c.defaults.model,
        thinking: c.defaults.thinking,
        tools: c.defaults.tools ? [...c.defaults.tools] : null,
        writes: [],
      });
    });
  }
  function removeAgent(i: number) { update((c) => { c.agents.splice(i, 1); }); }

  if (!slug || !config) return (
    <div className="flex h-full items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-fg-muted" /></div>
  );

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-3 border-b border-border bg-surface px-6 py-3">
        <SlidersHorizontal className="h-5 w-5 text-accent" />
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-fg-muted">Configuration</div>
          <div className="font-display text-[17px] font-semibold tracking-tight">Agent roster</div>
        </div>
        {/* roster selector */}
        <div className="flex items-center gap-1.5" data-tour="tour-config-roster">
          <span className="text-[12px] text-fg-muted">Roster</span>
          <select value={roster ?? ""} onChange={(e) => load(e.target.value)} className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[13px] font-medium text-fg outline-none focus:border-accent">
            {rosters.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <button onClick={() => setShowYaml((v) => !v)} className={cn("inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-medium", showYaml ? "border-border bg-surface-2 text-fg" : "border-border bg-surface text-fg-muted hover:bg-bg")}>
          <FileCode2 className="h-3.5 w-3.5" /> {showYaml ? "Editor" : "YAML"}
        </button>
        <button onClick={save} disabled={saving || !dirty} className="inline-flex items-center gap-2 rounded-lg bg-accent px-3.5 py-1.5 text-[13px] font-medium text-fg hover:bg-accent disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save roster
        </button>
      </header>

      {showYaml ? (
        <div className="flex-1 overflow-auto p-4 studio-scroll">
          <pre className="rounded-xl bg-surface-3 p-4 text-[12px] leading-relaxed text-fg overflow-auto">{toYamlPreview(config)}</pre>
          <p className="mt-2 text-[11px] text-fg-muted">Read-only preview of what will be written. Edit fields in the visual editor.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto studio-scroll">
          <div className="mx-auto max-w-4xl px-6 py-5 space-y-5">
            {/* problems banner */}
            {problems.length > 0 && (
              <div className="rounded-xl border border-warning/30 bg-warning/10 p-3">
                <div className="flex items-center gap-1.5 text-[12px] font-semibold text-warning"><AlertCircle className="h-4 w-4" /> {problems.length} validation issue(s)</div>
                <ul className="mt-1.5 space-y-0.5 text-[12px] text-warning">
                  {problems.map((p, i) => <li key={i}>· {p.agent ? `[${p.agent}] ` : ""}{p.field}: {p.message}</li>)}
                </ul>
              </div>
            )}
            {dirty && (
              <div className="rounded-xl border border-border bg-bg px-3 py-2 text-[12px] text-fg-muted">Unsaved changes — click Save roster to write <code className="rounded bg-surface px-1">{configPath}</code>.</div>
            )}

            {/* Defaults */}
            <Card title="Defaults" subtitle="Inherited by every agent that does not override the field">
              <div className="grid grid-cols-2 gap-3">
                <Field label="coding_agent"><Select value={config.defaults.coding_agent ?? "pi"} onChange={(v) => update((c) => { c.defaults.coding_agent = v as any; })} options={[...CODING_AGENTS]} /></Field>
                <Field label="model (provider/id)"><Text value={config.defaults.model ?? ""} onChange={(v) => update((c) => { c.defaults.model = v; })} mono /></Field>
                <Field label="thinking"><Select value={config.defaults.thinking ?? "medium"} onChange={(v) => update((c) => { c.defaults.thinking = v; })} options={[...THINKING_LEVELS]} /></Field>
                <Field label="data_dir"><Text value={config.defaults.data_dir ?? ""} onChange={(v) => update((c) => { c.defaults.data_dir = v; })} mono /></Field>
                <Field label="observability.db"><Text value={config.observability.db ?? ""} onChange={(v) => update((c) => { c.observability.db = v; })} mono /></Field>
                <Field label="observability.poll_ms"><Text type="number" value={String(config.observability.poll_ms ?? 500)} onChange={(v) => update((c) => { c.observability.poll_ms = Number(v) || 500; })} mono /></Field>
              </div>
              <div className="mt-3">
                <Field label="default tools (roster-wide allowlist)">
                  <ToolsEditor value={config.defaults.tools ?? null} onChange={(v) => update((c) => { c.defaults.tools = v; })} />
                </Field>
              </div>
              <div className="mt-3">
                <Field label="protected_files (no agent may edit unless named in its writes)">
                  <TagInput values={config.defaults.protected_files ?? []} onChange={(v) => update((c) => { c.defaults.protected_files = v; })} mono placeholder="adws/adw_modules/" />
                </Field>
              </div>
            </Card>

            {/* Agents */}
            <div className="flex items-center justify-between">
              <h3 className="text-[13px] font-semibold text-fg">Agents ({config.agents.length})</h3>
              <button onClick={addAgent} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[12px] font-medium text-fg-muted hover:bg-bg"><Plus className="h-3.5 w-3.5" /> Add agent</button>
            </div>
            <div className="space-y-3">
              {config.agents.map((a, i) => (
                <AgentCard key={i} agent={a} defaultModel={config.defaults.model ?? ""} onChange={(na) => update((c) => { c.agents[i] = na; })} onRemove={() => removeAgent(i)} />
              ))}
            </div>

            {/* Keys */}
            <KeysCard slug={slug} providers={providers} />
          </div>
        </div>
      )}
    </div>
  );
}

function KeysCard({ slug, providers }: { slug: string; providers: string[] }) {
  const [keys, setKeys] = useState<{ name: string; set: boolean; masked: string }[]>([]);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [show, setShow] = useState<Record<string, boolean>>({});
  const [envExists, setEnvExists] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getKeys(slug).then((r) => { setKeys(r.keys); setEnvExists(r.envExists); }).catch((error) => {
      toast.error(error instanceof Error ? error.message : "Could not load provider settings");
    });
  }, [slug]);

  async function pasteKey(name: string) {
    try {
      const value = await navigator.clipboard.readText();
      if (!value.trim()) {
        toast.info("The clipboard is empty");
        return;
      }
      setEdits((current) => ({ ...current, [name]: value.trim() }));
    } catch (error) {
      toast.error(error instanceof Error ? `Could not read clipboard: ${error.message}` : "Could not read clipboard");
    }
  }

  async function save() {
    const updates: Record<string, string> = {};
    for (const [k, v] of Object.entries(edits)) if (v.trim()) updates[k] = v.trim();
    if (Object.keys(updates).length === 0) { toast.info("Nothing to save"); return; }
    setSaving(true);
    try {
      await api.saveKeys(slug, updates);
      setEdits({});
      const r = await api.getKeys(slug);
      setKeys(r.keys); setEnvExists(r.envExists);
      toast.success("Keys written to .env (gitignored)");
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  }

  const relevant = new Set(providers.map((p) => p.toUpperCase()));
  return (
    <Card title="AI provider setup" data-tour="tour-config-keys" subtitle="Copy a setting from your provider and paste it here. Values are stored in the target repo's gitignored .env, never committed. The intake assistant uses LLM_BASE_URL, LLM_MODEL, and LLM_API_KEY; specialist agents use their provider keys.">
      <div className="space-y-1.5">
        {keys.map((k) => {
          const isDiscoverySetting = k.name.startsWith("LLM_");
          const isRelevant = isDiscoverySetting || relevant.size === 0 || [...relevant].some((p) => k.name.startsWith(p)) || k.name === "ENGINEER_NAME" || k.name.startsWith("PI_");
          return (
            <div key={k.name} className={cn("flex items-center gap-2 rounded-lg border px-2.5 py-1.5", k.set ? "border-border bg-surface" : "border-dashed border-border bg-bg")}>
              <KeyRound className={cn("h-3.5 w-3.5 shrink-0", k.set ? "text-success" : "text-fg-muted")} />
              <div className="w-44 shrink-0 font-mono text-[12px] text-fg">{k.name}</div>
              {isRelevant && (providers.length > 0 || isDiscoverySetting) && <span className="rounded bg-accent-soft px-1.5 py-0.5 text-[10px] font-medium text-accent">used</span>}
              <input
                type={show[k.name] ? "text" : "password"}
                value={edits[k.name] ?? ""}
                onChange={(e) => setEdits((s) => ({ ...s, [k.name]: e.target.value }))}
                placeholder={k.set ? k.masked : "not set"}
                aria-label={`${k.name} (paste or type optionally)`}
                className="flex-1 rounded border border-border bg-surface px-2 py-1 font-mono text-[12px] outline-none focus:border-accent"
              />
              <button onClick={() => pasteKey(k.name)} aria-label={`Paste ${k.name} from clipboard`} title="Paste from clipboard" className="rounded p-2 text-fg-muted hover:bg-surface-2 hover:text-fg">
                <ClipboardPaste className="h-4 w-4" />
              </button>
              <button onClick={() => setShow((s) => ({ ...s, [k.name]: !s[k.name] }))} className="text-fg-muted hover:text-fg-muted">
                {show[k.name] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
              {k.set && !edits[k.name] && <CheckCircle2 className="h-3.5 w-3.5 text-success" />}
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-[11px] text-fg-muted">{envExists ? ".env exists" : "no .env yet — will be created"}{providers.length > 0 && ` · roster uses: ${providers.join(", ")}`}</span>
        <button onClick={save} disabled={saving} className="inline-flex items-center gap-1.5 rounded-lg bg-surface px-3 py-1.5 text-[12px] font-medium text-fg hover:bg-surface-2 disabled:opacity-50">
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save keys
        </button>
      </div>
    </Card>
  );
}

function AgentCard({ agent, defaultModel, onChange, onRemove }: { agent: AgentConfig; defaultModel: string; onChange: (a: AgentConfig) => void; onRemove: () => void }) {
  const set = (patch: Partial<AgentConfig>) => onChange({ ...agent, ...patch });
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="h-3 w-3 shrink-0 rounded-full border border-border" style={{ background: agent.color || "#a1a1aa" }} />
        <input value={agent.name} onChange={(e) => set({ name: e.target.value })} className="flex-1 rounded border border-transparent bg-transparent px-1 py-0 font-mono text-[14px] font-semibold text-fg outline-none hover:border-border focus:border-accent" />
        <label className="flex items-center gap-1 text-[11px] text-fg-muted">color
          <input type="color" value={agent.color || "#a1a1aa"} onChange={(e) => set({ color: e.target.value })} className="h-6 w-6 cursor-pointer rounded border border-border bg-transparent p-0" />
        </label>
        <button onClick={onRemove} className="text-fg-muted hover:text-danger"><Trash2 className="h-4 w-4" /></button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="purpose"><Text value={agent.purpose} onChange={(v) => set({ purpose: v })} placeholder="One sentence: what this agent is for" /></Field>
        <Field label="model (provider/id) — blank inherits default"><Text value={agent.model ?? ""} onChange={(v) => set({ model: v || undefined })} mono placeholder={defaultModel} /></Field>
        <Field label="thinking"><Select value={agent.thinking ?? "medium"} onChange={(v) => set({ thinking: v })} options={[...THINKING_LEVELS]} /></Field>
        <Field label="coding_agent"><Select value={agent.coding_agent ?? "pi"} onChange={(v) => set({ coding_agent: v as any })} options={[...CODING_AGENTS]} /></Field>
        <Field label="prompt_engineering.system"><Text value={agent.prompt_engineering.system} onChange={(v) => set({ prompt_engineering: { ...agent.prompt_engineering, system: v } })} mono /></Field>
        <Field label="prompt_engineering.user"><Text value={agent.prompt_engineering.user} onChange={(v) => set({ prompt_engineering: { ...agent.prompt_engineering, user: v } })} mono /></Field>
      </div>
      <div className="mt-3">
        <Field label="tools (allowlist; blank = inherit default)">
          <ToolsEditor value={agent.tools ?? null} onChange={(v) => set({ tools: v })} />
        </Field>
      </div>
      <div className="mt-3">
        <Field label="writes (repo paths this agent may modify; [] = read-only; blank = unrestricted minus protected_files)">
          <TagInput values={agent.writes ?? []} onChange={(v) => set({ writes: v })} mono placeholder="specs/" />
        </Field>
      </div>
      <div className="mt-3">
        <Field label="harness_engineering (pi extension file paths)">
          <TagInput values={agent.harness_engineering ?? []} onChange={(v) => set({ harness_engineering: v })} mono placeholder="adws/adw_data/harness_engineering/x.ts" />
        </Field>
      </div>
    </div>
  );
}

// ── Small field primitives ──────────────────────────────────────────────────
function Card({ title, subtitle, children, "data-tour": dataTour }: { title: string; subtitle?: string; children: React.ReactNode; "data-tour"?: string }) {
  return (
    <section className="rounded-xl border border-border bg-surface p-4" data-tour={dataTour}>
      <div className="mb-3"><h3 className="text-[13px] font-semibold text-fg">{title}</h3>{subtitle && <p className="text-[11.5px] text-fg-muted">{subtitle}</p>}</div>
      {children}
    </section>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-[11px] font-medium text-fg-muted">{label}</span>{children}</label>;
}
function Text({ value, onChange, mono, placeholder, type = "text" }: { value: string; onChange: (v: string) => void; mono?: boolean; placeholder?: string; type?: string }) {
  return <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cn("w-full rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[13px] outline-none focus:border-accent focus:ring-2 focus:ring-accent/20", mono && "font-mono text-[12px]")} />;
}
function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[13px] outline-none focus:border-accent">{options.map((o) => <option key={o} value={o}>{o}</option>)}</select>;
}
function ToolsEditor({ value, onChange }: { value: string[] | null; onChange: (v: string[] | null) => void }) {
  const inherit = value === null || value === undefined;
  return (
    <div>
      <label className="mb-1 flex items-center gap-1.5 text-[11px] text-fg-muted">
        <input type="checkbox" checked={inherit} onChange={(e) => onChange(e.target.checked ? null : [...PI_TOOLS])} className="accent-accent" /> inherit default (no override)
      </label>
      <div className="flex flex-wrap gap-1.5">
        {[...PI_TOOLS].map((t) => {
          const on = !inherit && (value?.includes(t) ?? false);
          return (
            <button key={t} type="button" disabled={inherit} onClick={() => { if (inherit) return; const s = new Set(value); if (on) { s.delete(t); } else { s.add(t); } onChange([...s]); }} className={cn("rounded-md border px-2 py-0.5 font-mono text-[11.5px]", on ? "border-accent/40 bg-accent-soft text-accent" : "border-border bg-surface text-fg-muted", inherit && "opacity-40")}>
              {t}
            </button>
          );
        })}
      </div>
      {!inherit && <TagInput values={value?.filter((t) => !(PI_TOOLS as readonly string[]).includes(t)) ?? []} onChange={(extra) => onChange([...value!.filter((t) => (PI_TOOLS as readonly string[]).includes(t)), ...extra])} mono placeholder="custom tool name" compact />}
    </div>
  );
}
function TagInput({ values, onChange, mono, placeholder, compact }: { values: string[]; onChange: (v: string[]) => void; mono?: boolean; placeholder?: string; compact?: boolean }) {
  const [text, setText] = useState("");
  function add() { const v = text.trim(); if (!v) return; if (!values.includes(v)) onChange([...values, v]); setText(""); }
  return (
    <div className={cn("rounded-lg border border-border bg-surface p-1.5", compact && "p-1")}>
      <div className="flex flex-wrap gap-1">
        {values.map((v, i) => (
          <span key={i} className={cn("inline-flex items-center gap-1 rounded bg-surface-2 px-1.5 py-0.5 text-[11.5px] text-fg", mono && "font-mono")}>
            {v}
            <button onClick={() => onChange(values.filter((_, j) => j !== i))} className="text-fg-muted hover:text-danger"><X className="h-3 w-3" /></button>
          </span>
        ))}
        <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); } if (e.key === "Backspace" && !text && values.length) onChange(values.slice(0, -1)); }} placeholder={placeholder} className={cn("min-w-[120px] flex-1 bg-transparent px-1 py-0.5 text-[12px] outline-none", mono && "font-mono")} />
      </div>
    </div>
  );
}

function toYamlPreview(c: SSSFConfig): string {
  // Lightweight YAML preview (the server writes the real file with the `yaml` lib).
  const lines: string[] = [];
  lines.push("defaults:");
  const d = c.defaults;
  if (d.coding_agent) lines.push(`  coding_agent: ${d.coding_agent}`);
  if (d.model) lines.push(`  model: ${d.model}`);
  if (d.thinking) lines.push(`  thinking: ${d.thinking}`);
  if (d.data_dir) lines.push(`  data_dir: ${d.data_dir}`);
  if (d.tools) lines.push(`  tools: [${d.tools.join(", ")}]`);
  if (d.protected_files) lines.push(`  protected_files: [${d.protected_files.map((p) => `"${p}"`).join(", ")}]`);
  lines.push("observability:");
  lines.push(`  db: ${c.observability.db ?? "adws/adw_data/sssf.db"}`);
  lines.push(`  poll_ms: ${c.observability.poll_ms ?? 500}`);
  lines.push("agents:");
  for (const a of c.agents) {
    lines.push(`  - name: ${a.name}`);
    if (a.purpose) lines.push(`    purpose: ${JSON.stringify(a.purpose)}`);
    if (a.model) lines.push(`    model: ${a.model}`);
    if (a.thinking) lines.push(`    thinking: ${a.thinking}`);
    if (a.color) lines.push(`    color: "${a.color}"`);
    if (a.coding_agent) lines.push(`    coding_agent: ${a.coding_agent}`);
    if (a.prompt_engineering) { lines.push(`    prompt_engineering:`); lines.push(`      system: ${a.prompt_engineering.system}`); lines.push(`      user: ${a.prompt_engineering.user}`); }
    if (a.tools) lines.push(`    tools: [${a.tools.join(", ")}]`);
    if (a.writes) lines.push(`    writes: [${a.writes.map((w) => `"${w}"`).join(", ")}]`);
    if (a.harness_engineering?.length) lines.push(`    harness_engineering: [${a.harness_engineering.map((h) => `"${h}"`).join(", ")}]`);
  }
  return lines.join("\n");
}
