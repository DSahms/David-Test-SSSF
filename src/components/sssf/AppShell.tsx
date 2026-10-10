"use client";

import { useStudio, type TabId } from "@/lib/studio-store";
import { Layers, Compass, SlidersHorizontal, Rocket, Factory, Plus, RefreshCw, BookOpen, FolderOpen } from "lucide-react";
import { cn } from "@/lib/sssf/ui";
import { useState } from "react";
import { api } from "@/lib/sssf/api-client";
import { WorkspaceTab } from "./WorkspaceTab";
import { DiscoveryTab } from "./DiscoveryTab";
import { ConfigTab } from "./ConfigTab";
import { RunsTab } from "./RunsTab";
import { ThemeToggle } from "./ThemeToggle";
import { useTour } from "@/lib/tour-store";
import { RepoPicker } from "./RepoPicker";
import { toast } from "sonner";

const TABS: { id: TabId; label: string; icon: typeof Layers; hint: string }[] = [
  { id: "workspace", label: "Workspace", icon: Layers, hint: "Select or create a target repo, stamp the factory" },
  { id: "discovery", label: "Discovery", icon: Compass, hint: "Refine a rough idea into an approved spec" },
  { id: "config", label: "Configuration", icon: SlidersHorizontal, hint: "Edit the agent roster (sssf.config.yaml)" },
  { id: "runs", label: "Runs", icon: Rocket, hint: "Launch an ADW and observe the trace" },
];

export function AppShell() {
  const { workspaces, activeSlug, activeWorkspace, tab, setActive, setTab, setWorkspaces } = useStudio();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  async function refresh() {
    setBusy(true);
    try {
      const r = await api.listWorkspaces();
      setWorkspaces(r.workspaces);
      if (activeSlug) {
        const w = r.workspaces.find((x) => x.slug === activeSlug);
        if (w) useStudio.getState().refreshActive(w);
      }
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function createWorkspace(requestedName = name.trim() || "My Workspace") {
    setBusy(true);
    setErr(null);
    try {
      let workspaceName = requestedName;
      if (requestedName === "My Workspace") {
        let suffix = 2;
        while (workspaces.some((workspace) => workspace.name === workspaceName)) {
          workspaceName = `My Workspace ${suffix}`;
          suffix += 1;
        }
      }
      const r = await api.createWorkspace(workspaceName);
      const r2 = await api.listWorkspaces();
      setWorkspaces(r2.workspaces);
      setActive(r.workspace.slug);
      setTab("workspace");
      setName("");
      setCreating(false);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function importExisting(path: string) {
    setBusy(true);
    setErr(null);
    setPickerOpen(false);
    try {
      const r = await api.importWorkspace(path);
      const r2 = await api.listWorkspaces();
      setWorkspaces(r2.workspaces);
      setActive(r.workspace.slug);
      setTab("workspace");
      toast.success(`Imported "${r.workspace.name}"`);
    } catch (e: any) {
      setErr(e.message);
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }

  const factoryReady = !!activeWorkspace?.info.factoryInstalled;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg text-fg">
      {/* Sidebar */}
      <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-surface text-fg">
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-border">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-[15px] font-bold text-fg-on-accent shadow-sm">
            S
          </div>
          <div className="min-w-0">
            <div className="font-display text-[15px] font-semibold tracking-tight">SSSF Studio</div>
            <div className="text-[11px] text-fg-muted truncate">Unified control layer</div>
          </div>
        </div>

        {/* Workspace switcher */}
        <div className="px-3 py-3 border-b border-border" data-tour="tour-ws-switcher">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-fg-muted">Target workspace</span>
            <button onClick={refresh} className="text-fg-muted hover:text-fg" title="Refresh">
              <RefreshCw className={cn("h-3.5 w-3.5", busy && "animate-spin")} />
            </button>
          </div>
          <div className="space-y-1 max-h-44 overflow-y-auto pr-1 studio-scroll">
            {workspaces.length === 0 && (
              <div className="text-[11px] text-fg-muted px-2 py-3">No workspaces yet.</div>
            )}
            {workspaces.map((w) => (
              <button
                key={w.slug}
                onClick={() => { setActive(w.slug); setTab("workspace"); }}
                className={cn(
                  "group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] transition-colors",
                  activeSlug === w.slug ? "bg-surface-2 text-fg" : "text-fg-muted hover:bg-surface-2/60",
                )}
              >
                <Factory className={cn("h-3.5 w-3.5 shrink-0", w.info.factoryInstalled ? "text-success" : "text-fg-muted")} />
                <span className="truncate flex-1">{w.name}</span>
                {w.info.factoryInstalled ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-fg-muted" />
                )}
              </button>
            ))}
          </div>
          {creating ? (
            <div className="mt-2 space-y-2">
              <button onClick={() => createWorkspace("My Workspace")} disabled={busy} className="w-full rounded-md bg-accent px-2 py-2 text-[12px] font-medium text-fg-on-accent hover:bg-accent/90 disabled:opacity-50">
                Create My Workspace
              </button>
              <div className="text-center text-[10px] text-fg-muted">Or choose a custom name (optional)</div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Paste a workspace name"
                aria-label="Optional custom workspace name"
                className="w-full rounded-md border border-border bg-surface-3 px-2 py-1.5 text-[13px] text-fg placeholder:text-fg-muted focus:border-accent focus:outline-none"
              />
              <div className="flex gap-1.5">
                <button onClick={() => createWorkspace()} disabled={busy || !name.trim()} className="flex-1 rounded-md bg-surface-2 px-2 py-1 text-[12px] font-medium text-fg hover:bg-surface-3 disabled:opacity-50">Create custom</button>
                <button onClick={() => setCreating(false)} className="rounded-md px-2 py-1 text-[12px] text-fg-muted hover:text-fg">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="mt-2 space-y-1.5">
              <button
                onClick={() => setCreating(true)}
                className="flex w-full items-center gap-1.5 rounded-md border border-dashed border-border px-2 py-1.5 text-[12px] text-fg-muted hover:border-fg-muted hover:text-fg"
              >
                <Plus className="h-3.5 w-3.5" /> New workspace
              </button>
              <button
                onClick={() => setPickerOpen(true)}
                className="flex w-full items-center gap-1.5 rounded-md border border-dashed border-border px-2 py-1.5 text-[12px] text-fg-muted hover:border-fg-muted hover:text-fg"
              >
                <FolderOpen className="h-3.5 w-3.5" /> Pick existing repo
              </button>
            </div>
          )}
          {err && <div className="mt-2 text-[11px] text-danger">{err}</div>}
        </div>

        {/* Tabs */}
        <nav className="flex-1 space-y-1 px-3 py-3" data-tour="tour-nav">
          {TABS.map((t) => {
            const Icon = t.icon;
            const disabled = t.id !== "workspace" && !factoryReady;
            return (
              <button
                key={t.id}
                onClick={() => !disabled && setTab(t.id)}
                disabled={disabled}
                className={cn(
                  "group flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors",
                  tab === t.id ? "bg-surface-2 text-fg" : "text-fg-muted hover:bg-surface-2/60",
                  disabled && "cursor-not-allowed opacity-40 hover:bg-transparent",
                )}
                title={disabled ? "Stamp the factory first" : t.hint}
              >
                <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", tab === t.id ? "text-success" : "text-fg-muted group-hover:text-fg-muted")} />
                <div className="min-w-0">
                  <div className="text-[13px] font-medium leading-tight">{t.label}</div>
                  <div className="text-[11px] leading-tight text-fg-muted">{t.hint}</div>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="border-t border-border px-4 py-3 text-[10px] text-fg-muted">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1.5">
              <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", factoryReady ? "bg-success" : "bg-warning")} />
              <span className="truncate">{factoryReady ? "Factory stamped" : "Factory not stamped"}</span>
            </div>
            <ThemeToggle />
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            <button onClick={() => useTour.getState().start()} className="flex-1 rounded-md border border-border px-2 py-1.5 text-[11px] font-medium text-fg-muted hover:bg-surface-2 hover:text-fg">
              <Compass className="mr-1 inline h-3 w-3" /> Take the tour
            </button>
            <a href="/users-manual/index.html" target="_blank" rel="noreferrer" className="rounded-md border border-border px-2 py-1.5 text-center text-[11px] font-medium text-fg-muted hover:bg-surface-2 hover:text-fg">
              <BookOpen className="mr-1 inline h-3 w-3" /> User's guide
            </a>
            <a href="/learners-manual/index.html" target="_blank" rel="noreferrer" className="col-span-2 rounded-md border border-border px-2 py-1.5 text-center text-[11px] font-medium text-fg-muted hover:bg-surface-2 hover:text-fg">
              <BookOpen className="mr-1 inline h-3 w-3" /> Learner's Manual
            </a>
          </div>
          {activeWorkspace && <div className="mt-2 truncate font-mono text-[10px] text-fg-muted opacity-70">{activeWorkspace.path}</div>}
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-hidden">
        {!activeWorkspace ? (
          <div className="flex h-full items-center justify-center p-8 text-center">
            <div className="max-w-md">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface text-success">
                <Layers className="h-7 w-7" />
              </div>
              <h1 className="font-display text-xl font-semibold text-fg">Welcome to SSSF Studio</h1>
              <p className="mt-2 text-sm text-fg-muted">
                Select a target workspace on the left, or create a new one. Each workspace is a project directory the Super Simple Software Factory is stamped into.
              </p>
            </div>
          </div>
        ) : tab === "workspace" ? (
          <WorkspaceTab />
        ) : tab === "discovery" ? (
          <DiscoveryTab />
        ) : tab === "config" ? (
          <ConfigTab />
        ) : (
          <RunsTab />
        )}
      </main>

      {/* Repository picker modal */}
      <RepoPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={importExisting}
      />
    </div>
  );
}
