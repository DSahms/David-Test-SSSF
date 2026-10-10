"use client";

import { useStudio } from "@/lib/studio-store";
import { api } from "@/lib/sssf/api-client";
import { useState } from "react";
import { Factory, CheckCircle2, AlertCircle, Loader2, FileCode2, FileCheck2, Database, Stamp, FolderPlus, ArrowRight } from "lucide-react";
import { cn, timeAgo } from "@/lib/sssf/ui";
import { toast } from "sonner";

export function WorkspaceTab() {
  const { activeWorkspace, setActive, setTab, refreshActive, workspaces } = useStudio();
  const [stamping, setStamping] = useState(false);
  const [force, setForce] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  if (!activeWorkspace) return null;
  const info = activeWorkspace.info;

  async function stamp() {
    setStamping(true);
    setResult(null);
    try {
      const r = await api.stamp(activeWorkspace!.slug, force);
      const lists = await api.listWorkspaces();
      useStudio.getState().setWorkspaces(lists.workspaces);
      const w = lists.workspaces.find((x) => x.slug === activeWorkspace!.slug);
      if (w) refreshActive(w);
      setResult(r.result.stdout + (r.result.stderr ? `\n${r.result.stderr}` : ""));
      toast.success(force ? "Factory re-stamped (force)" : "Factory stamped into target repo");
    } catch (e: any) {
      toast.error(e.message);
      setResult(e.message);
    } finally {
      setStamping(false);
    }
  }

  const checks: { label: string; ok: boolean; icon: typeof FileCode2; detail: string }[] = [
    { label: "Factory stamped", ok: info.factoryInstalled, icon: Factory, detail: info.factoryInstalled ? "adws/ + modules + config present" : "adws/adw_modules + config missing" },
    { label: "Agent roster", ok: info.hasConfig, icon: FileCode2, detail: info.hasConfig ? "sssf.config.yaml present" : "no sssf.config.yaml" },
    { label: "Approved spec", ok: info.hasApprovedSpec, icon: FileCheck2, detail: info.hasApprovedSpec ? "requests/approved-spec.md exists" : "no approved spec yet" },
    { label: "Trace DB", ok: info.hasTraceDb, icon: Database, detail: info.hasTraceDb ? "sssf.db ready to poll" : "no runs yet — db appears after first launch" },
  ];

  return (
    <div className="h-full overflow-y-auto studio-scroll">
      <div className="mx-auto max-w-4xl px-8 py-8">
        <header className="mb-6">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-fg-muted">Workspace</div>
          <h1 className="mt-1 text-2xl font-display font-semibold tracking-tight">{activeWorkspace.name}</h1>
          <div className="mt-1 flex items-center gap-2 font-mono text-[12px] text-fg-muted">
            <span className="rounded bg-surface-2 px-1.5 py-0.5">{activeWorkspace.slug}</span>
            <span>·</span>
            <span>{activeWorkspace.path}</span>
          </div>
          <div className="mt-1 text-[12px] text-fg-muted">Created {timeAgo(info.createdAt)}</div>
        </header>

        {/* Status grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {checks.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.label} className={cn("rounded-xl border p-3.5", c.ok ? "border-accent/30 bg-accent-soft/60" : "border-border bg-surface")}>
                <div className="flex items-center justify-between">
                  <Icon className={cn("h-4 w-4", c.ok ? "text-accent" : "text-fg-muted")} />
                  {c.ok ? <CheckCircle2 className="h-4 w-4 text-success" /> : <AlertCircle className="h-4 w-4 text-warning" />}
                </div>
                <div className="mt-2 text-[13px] font-medium text-fg">{c.label}</div>
                <div className="text-[11px] text-fg-muted">{c.detail}</div>
              </div>
            );
          })}
        </div>

        {/* Stamp action */}
        <section className="mt-6 rounded-xl border border-border bg-surface p-5" data-tour="tour-ws-stamp">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[15px] font-semibold text-fg">Factory installation</h2>
              <p className="mt-1 text-[13px] text-fg-muted">
                Stamps the official Super Simple Software Factory into this repo using <code className="rounded bg-surface-2 px-1 py-0.5 text-[12px]">install.py</code> — idempotent, copies <code className="rounded bg-surface-2 px-1 py-0.5 text-[12px]">adws/</code>, the starter agent roster, prompt engineering, and the justfile. Existing files are skipped unless force is set.
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <label className="flex items-center gap-1.5 text-[12px] text-fg-muted">
                <input type="checkbox" checked={force} onChange={(e) => setForce(e.target.checked)} className="accent-accent" />
                Overwrite (--force)
              </label>
              <button
                onClick={stamp}
                disabled={stamping}
                className="inline-flex items-center gap-2 rounded-lg bg-surface px-3.5 py-2 text-[13px] font-medium text-fg hover:bg-surface-2 disabled:opacity-50"
              >
                {stamping ? <Loader2 className="h-4 w-4 animate-spin" /> : info.factoryInstalled ? <Stamp className="h-4 w-4" /> : <Factory className="h-4 w-4" />}
                {info.factoryInstalled ? "Re-stamp factory" : "Stamp factory into this repo"}
              </button>
            </div>
          </div>
          {result && (
            <pre className="mt-4 max-h-56 overflow-y-auto rounded-lg bg-surface-3 p-3 text-[11px] leading-relaxed text-fg-muted studio-scroll whitespace-pre-wrap">{result}</pre>
          )}
        </section>

        {/* Next steps */}
        {info.factoryInstalled && (
          <section className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { tab: "discovery" as const, icon: Compass, title: "Start Discovery", body: "Refine a rough idea into an approved markdown spec." },
              { tab: "config" as const, icon: Sliders, title: "Tune the roster", body: "Edit models, thinking levels, tools, and write permissions." },
              { tab: "runs" as const, icon: Rocket, title: "Launch a run", body: "Pick an ADW and watch the trace stream in." },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <button key={s.tab} onClick={() => setTab(s.tab)} className="group rounded-xl border border-border bg-surface p-4 text-left hover:border-border hover:shadow-sm transition-all">
                  <div className="flex items-center justify-between">
                    <Icon className="h-5 w-5 text-accent" />
                    <ArrowRight className="h-4 w-4 text-fg-muted group-hover:translate-x-0.5 group-hover:text-fg-muted transition-all" />
                  </div>
                  <div className="mt-2 text-[14px] font-semibold text-fg">{s.title}</div>
                  <div className="mt-0.5 text-[12px] text-fg-muted">{s.body}</div>
                </button>
              );
            })}
          </section>
        )}

        {/* Other workspaces */}
        {workspaces.length > 1 && (
          <section className="mt-6">
            <h2 className="text-[13px] font-semibold text-fg">Other workspaces</h2>
            <div className="mt-2 space-y-1.5">
              {workspaces.filter((w) => w.slug !== activeWorkspace.slug).map((w) => (
                <button key={w.slug} onClick={() => { setActive(w.slug); }} className="flex w-full items-center gap-3 rounded-lg border border-border bg-surface px-3.5 py-2.5 text-left hover:border-border">
                  <Factory className={cn("h-4 w-4", w.info.factoryInstalled ? "text-success" : "text-fg-muted")} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-medium text-fg">{w.name}</div>
                    <div className="truncate font-mono text-[11px] text-fg-muted">{w.path}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-fg-muted" />
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// local icons to avoid extra imports churn
function Compass(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}
function Sliders(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="4" x2="4" y1="21" y2="14" /><line x1="4" x2="4" y1="10" y2="3" /><line x1="12" x2="12" y1="21" y2="12" /><line x1="12" x2="12" y1="8" y2="3" /><line x1="20" x2="20" y1="21" y2="16" /><line x1="20" x2="20" y1="12" y2="3" /><line x1="2" x2="6" y1="14" y2="14" /><line x1="10" x2="14" y1="8" y2="8" /><line x1="18" x2="22" y1="16" y2="16" />
    </svg>
  );
}
function Rocket(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}
