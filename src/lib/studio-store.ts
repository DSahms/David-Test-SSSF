import { create } from "zustand";
import type { WorkspaceRow } from "@/lib/sssf/api-client";

export type TabId = "workspace" | "discovery" | "config" | "runs";

interface StudioState {
  workspaces: WorkspaceRow[];
  activeSlug: string | null;
  activeWorkspace: WorkspaceRow | null;
  tab: TabId;
  setWorkspaces: (ws: WorkspaceRow[]) => void;
  setActive: (slug: string | null) => void;
  setTab: (t: TabId) => void;
  refreshActive: (ws: WorkspaceRow) => void;
}

export const useStudio = create<StudioState>((set) => ({
  workspaces: [],
  activeSlug: null,
  activeWorkspace: null,
  tab: "workspace",
  setWorkspaces: (workspaces) => set({ workspaces }),
  setActive: (slug) =>
    set((s) => ({
      activeSlug: slug,
      activeWorkspace: slug ? s.workspaces.find((w) => w.slug === slug) ?? null : null,
    })),
  setTab: (tab) => set({ tab }),
  refreshActive: (ws) =>
    set((s) => ({
      activeWorkspace: ws,
      workspaces: s.workspaces.map((w) => (w.slug === ws.slug ? ws : w)),
    })),
}));
