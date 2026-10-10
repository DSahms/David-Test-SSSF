import { create } from "zustand";
import { useStudio, type TabId } from "@/lib/studio-store";

export type Placement = "top" | "bottom" | "left" | "right" | "center";

export interface TourStep {
  id: string;
  /** Which app tab the target lives on. The tour switches to it before showing. */
  tab?: TabId;
  /** data-tour attribute value of the target element. Undefined = centered modal. */
  target?: string;
  title: string;
  body: string;
  placement?: Placement;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to SSSF Studio",
    body: "SSSF Studio is one workspace for the whole flow: take a rough idea, refine it into an approved spec, then hand it to the Super Simple Software Factory to run — all without leaving this app. This short tour walks you through each step and what it produces. You can restart it any time from the sidebar, and skip it whenever you like.",
  },
  {
    id: "tabs",
    tab: "workspace",
    target: "tour-nav",
    title: "The four tabs",
    body: "Everything lives in four tabs. Workspace sets up a target repo. Discovery turns a rough idea into an approved markdown spec. Configuration tunes the agent roster the factory uses. Runs launches a workflow and watches it. We'll visit each in order.",
    placement: "right",
  },
  {
    id: "ws-create",
    tab: "workspace",
    target: "tour-ws-switcher",
    title: "1 · Pick or create a workspace",
    body: "A workspace is a project directory on disk that the factory gets stamped into. Create one here (a folder is made for you) or pick an existing one from the list. The dot next to each turns green once the factory is stamped in.",
    placement: "right",
  },
  {
    id: "ws-stamp",
    tab: "workspace",
    target: "tour-ws-stamp",
    title: "2 · Stamp the factory",
    body: "Stamping copies the Super Simple Software Factory into the target repo — the ADW scripts, the agent modules, the starter roster, and the justfile. It's idempotent: run it once on a fresh workspace, or again with Overwrite to refresh. The factory code itself is never modified by SSSF Studio.",
    placement: "bottom",
  },
  {
    id: "discovery-spec",
    tab: "discovery",
    target: "tour-discovery-spec",
    title: "3 · Review the proposal",
    body: "You do not need to write a specification. Tell the Discovery agent what you want by speaking, pasting copied text, or importing an existing Markdown file. The agent builds a proposal here as you talk; you can preview it and ask for changes.",
    placement: "left",
  },
  {
    id: "discovery-review",
    tab: "discovery",
    target: "tour-discovery-chat",
    title: "4 · Review with the Discovery agent",
    body: "Talk with the Discovery agent using Speak, or paste text and press Send. It asks about one detail at a time and updates the proposal for you. You can still review the draft and request changes before approving.",
    placement: "right",
  },
  {
    id: "discovery-approve",
    tab: "discovery",
    target: "tour-discovery-approve",
    title: "5 · Approve the specification",
    body: "When the spec is ready, click 'Approve specification'. SSSF Studio writes it to requests/approved-spec.md inside the target repo and records the approval. That file is exactly what the factory later consumes as its prompt — untouched.",
    placement: "bottom",
  },
  {
    id: "config-roster",
    tab: "config",
    target: "tour-config-roster",
    title: "6 · Tune the agent roster",
    body: "Configuration is a visual editor for sssf.config.yaml — the roster the factory reads. Set defaults (model, thinking, tools), then edit each agent: its model, reasoning level, allowed tools, and what it may write in the repo. Switch between named rosters at the top. Save writes a valid YAML file the factory reads unchanged.",
    placement: "left",
  },
  {
    id: "config-keys",
    tab: "config",
    target: "tour-config-keys",
    title: "7 · Set your API keys",
    body: "The roster names providers (google, openai, fireworks…); each may need a key. Paste a key from your clipboard here and save it to the repo's gitignored .env. Keys are never committed. The 'used' tag marks keys referenced by your current roster.",
    placement: "top",
  },
  {
    id: "runs-launch",
    tab: "runs",
    target: "tour-runs-launch",
    title: "8 · Launch a run",
    body: "With an approved spec in place, pick an ADW workflow (adw_simple_sdlc is the recommended full chain), choose a roster, and click Launch. SSSF Studio invokes the factory as a subprocess, passing your approved markdown as the prompt. A launch log is captured for diagnostics.",
    placement: "bottom",
  },
  {
    id: "runs-observe",
    tab: "runs",
    target: "tour-runs-sessions",
    title: "9 · Watch the run",
    body: "Runs stream their progress into the factory's own trace database, which this tab polls live. Select a session to see its phase timeline, agent lanes, every event, the typed envelopes, and gate results. Switch to the 'Visualizer' sub-tab to see the same data in the factory's official waterfall view.",
    placement: "right",
  },
  {
    id: "done",
    title: "That's the whole flow",
    body: "Choose a starting point → talk through your goal → review and approve the proposal → follow the Python workflow. The sidebar links to both manuals, and you can restart this tour whenever you like.",
  },
];

interface TourState {
  active: boolean;
  index: number;
  start: () => void;
  next: () => void;
  prev: () => void;
  stop: () => void;
}

function applyTab(i: number) {
  const step = TOUR_STEPS[i];
  if (step?.tab) useStudio.getState().setTab(step.tab);
}

export const useTour = create<TourState>((set, get) => ({
  active: false,
  index: 0,
  start: () => {
    set({ active: true, index: 0 });
    applyTab(0);
  },
  next: () => {
    const i = Math.min(get().index + 1, TOUR_STEPS.length - 1);
    set({ index: i });
    applyTab(i);
  },
  prev: () => {
    const i = Math.max(get().index - 1, 0);
    set({ index: i });
    applyTab(i);
  },
  stop: () => set({ active: false, index: 0 }),
}));

const SEEN_KEY = "sssf-tour-seen-v1";

export function tourHasBeenSeen(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(SEEN_KEY) === "1";
}

export function markTourSeen() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SEEN_KEY, "1");
  } catch {}
}
