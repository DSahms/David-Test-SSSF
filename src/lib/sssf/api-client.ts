// Typed client-side fetch helpers for SSSF Studio's own API.

export interface WorkspaceInfo {
  slug: string;
  path: string;
  name: string;
  createdAt: string;
  factoryInstalled: boolean;
  hasConfig: boolean;
  hasApprovedSpec: boolean;
  hasTraceDb: boolean;
}
export interface WorkspaceRow {
  id: string;
  slug: string;
  name: string;
  path: string;
  info: WorkspaceInfo;
}

export interface AdwInfo {
  name: string;
  file: string;
  chain: string;
  description: string;
  requiredAgents: string[];
  recommended: boolean;
}

export interface DiscoveryFeedback {
  summary: string;
  missing: string[];
  ambiguities: string[];
  suggestions: string[];
  questions: string[];
  risks: string[];
}

export interface DiscoveryMessage {
  id: string;
  role: string;
  content: string;
  feedback: string | null;
  createdAt: string;
}
export interface DiscoverySession {
  id: string;
  title: string;
  specDraft: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  messages: DiscoveryMessage[];
  _count?: { messages: number };
}

async function jfetch<T>(url: string, init?: RequestInit): Promise<T> {
  const r = await fetch(url, { ...init, headers: { "content-type": "application/json", ...(init?.headers || {}) } });
  const body = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((body as any).error || `request failed: ${r.status}`);
  return body as T;
}

export const api = {
  listWorkspaces: () => jfetch<{ workspaces: WorkspaceRow[] }>("/api/workspaces"),
  createWorkspace: (name: string) => jfetch<{ workspace: WorkspaceRow }>("/api/workspaces", { method: "POST", body: JSON.stringify({ name }) }),
  importWorkspace: (path: string) => jfetch<{ workspace: WorkspaceRow }>("/api/workspaces/import", { method: "POST", body: JSON.stringify({ path }) }),
  getWorkspace: (slug: string) => jfetch<{ workspace: WorkspaceRow }>(`/api/workspaces/${slug}`),
  browse: (path?: string) => jfetch<{ currentPath: string; parentPath: string | null; directories: { name: string; path: string }[]; drives: string[]; error: string | null }>(`/api/browse${path ? `?path=${encodeURIComponent(path)}` : ""}`),
  stamp: (slug: string, force = false) => jfetch<{ result: any; installed: boolean }>(`/api/workspaces/${slug}/stamp`, { method: "POST", body: JSON.stringify({ force }) }),
  getAdws: (slug: string) => jfetch<{ adws: AdwInfo[]; rosters: string[]; approvedSpec: { path: string; content: string; preview: string } | null }>(`/api/workspaces/${slug}/adws`),

  listSessions: (slug: string) => jfetch<{ sessions: any[] }>(`/api/workspaces/${slug}/discovery`),
  createSession: (slug: string, title: string, specDraft = "") => jfetch<{ session: DiscoverySession }>(`/api/workspaces/${slug}/discovery`, { method: "POST", body: JSON.stringify({ title, specDraft }) }),
  getSession: (slug: string, sid: string) => jfetch<{ session: DiscoverySession }>(`/api/workspaces/${slug}/discovery/${sid}`),
  patchSession: (slug: string, sid: string, data: Partial<Pick<DiscoverySession, "title" | "specDraft" | "status">>) => jfetch<{ session: DiscoverySession }>(`/api/workspaces/${slug}/discovery/${sid}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteSession: (slug: string, sid: string) => jfetch<{ ok: boolean }>(`/api/workspaces/${slug}/discovery/${sid}`, { method: "DELETE" }),
  review: (slug: string, sid: string, userMessage: string | undefined, specDraft: string) => jfetch<{ message: DiscoveryMessage; feedback: DiscoveryFeedback }>(`/api/workspaces/${slug}/discovery/${sid}/review`, { method: "POST", body: JSON.stringify({ userMessage, specDraft }) }),
  chat: (slug: string, sid: string, userMessage: string, specDraft: string) => jfetch<{ message: DiscoveryMessage; specDraft: string }>(`/api/workspaces/${slug}/discovery/${sid}/chat`, { method: "POST", body: JSON.stringify({ userMessage, specDraft }) }),
  approve: (slug: string, sid: string, specDraft: string) => jfetch<{ approval: any; specPath: string; absolutePath: string }>(`/api/workspaces/${slug}/discovery/${sid}/approve`, { method: "POST", body: JSON.stringify({ specDraft }) }),

  getConfig: (slug: string, roster?: string) => jfetch<{ config: any; configPath: string; problems: any[]; providers: string[] }>(`/api/workspaces/${slug}/config${roster ? `?roster=${encodeURIComponent(roster)}` : ""}`),
  saveConfig: (slug: string, config: any, roster?: string) => jfetch<{ ok: boolean; configPath: string; problems: any[]; providers: string[] }>(`/api/workspaces/${slug}/config${roster ? `?roster=${encodeURIComponent(roster)}` : ""}`, { method: "PUT", body: JSON.stringify({ config }) }),
  getKeys: (slug: string) => jfetch<{ keys: { name: string; set: boolean; masked: string }[]; envExists: boolean }>(`/api/workspaces/${slug}/keys`),
  saveKeys: (slug: string, updates: Record<string, string>) => jfetch<{ ok: boolean }>(`/api/workspaces/${slug}/keys`, { method: "PUT", body: JSON.stringify({ updates }) }),

  launch: (slug: string, adw: string, roster?: string, specPath?: string) => jfetch<{ launch: any; adwId: string; pid: number; logPath: string }>(`/api/workspaces/${slug}/launch`, { method: "POST", body: JSON.stringify({ adw, roster, specPath }) }),
  listLaunches: (slug: string) => jfetch<{ launches: any[] }>(`/api/workspaces/${slug}/launches`),
  listApprovals: (slug: string) => jfetch<{ approvals: any[] }>(`/api/workspaces/${slug}/approvals`),
  traceSessions: (slug: string) => jfetch<{ sessions: any[]; count: number; dbExists: boolean }>(`/api/workspaces/${slug}/trace/sessions`),
  traceDetail: (slug: string, adwId: string) => jfetch<{ detail: any }>(`/api/workspaces/${slug}/trace/sessions/${adwId}`),
  traceEvents: (slug: string, adwId: string, after = 0) => jfetch<{ events: any[]; cursor: number; has_more: boolean }>(`/api/workspaces/${slug}/trace/sessions/${adwId}/events?after=${after}`),
  seedDemo: (slug: string, request?: string, status?: string) => jfetch<{ adwId: string; dbPath: string }>(`/api/workspaces/${slug}/seed-demo`, { method: "POST", body: JSON.stringify({ request, status }) }),
};
