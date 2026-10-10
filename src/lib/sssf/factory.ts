import { existsSync, mkdirSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { WORKSPACES_ROOT, INSTALL_SCRIPT, DEFAULT_CONFIG_REL, TEMPLATES_ROOT, FACTORY_ROOT } from "@/lib/paths";
import { spawnUv } from "@/lib/sssf/spawn";

/** A workspace on disk + its factory status. */
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

export function listWorkspaceDirs(): string[] {
  if (!existsSync(WORKSPACES_ROOT)) return [];
  return readdirSync(WORKSPACES_ROOT)
    .filter((d) => {
      const p = join(WORKSPACES_ROOT, d);
      return statSync(p).isDirectory() && !d.startsWith(".");
    })
    .sort();
}

export function workspaceInfo(slug: string, customPath?: string): WorkspaceInfo | null {
  const path = customPath || join(WORKSPACES_ROOT, slug);
  if (!existsSync(path) || !statSync(path).isDirectory()) return null;
  const st = statSync(path);
  return {
    slug,
    path,
    name: slug,
    createdAt: st.birthtime.toISOString(),
    factoryInstalled: isFactoryInstalled(path),
    hasConfig: existsSync(join(path, DEFAULT_CONFIG_REL)),
    hasApprovedSpec: existsSync(join(path, "requests", "approved-spec.md")),
    hasTraceDb: existsSync(join(path, "adws", "adw_data", "sssf.db")),
  };
}

export function isFactoryInstalled(repoPath: string): boolean {
  return (
    existsSync(join(repoPath, "adws", "adw_modules", "__init__.py")) &&
    existsSync(join(repoPath, DEFAULT_CONFIG_REL))
  );
}

export function createWorkspaceDir(slug: string): string {
  const path = join(WORKSPACES_ROOT, slug);
  if (existsSync(path)) throw new Error(`workspace '${slug}' already exists`);
  mkdirSync(path, { recursive: true });
  return path;
}

export function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || `ws-${Date.now().toString(36)}`
  );
}

export interface StampResult {
  ok: boolean;
  stampedCount: number;
  skippedCount: number;
  error?: string;
  stdout: string;
  stderr: string;
}

/**
 * Stamp the SSSF factory into a target repo using the official install.py.
 * Idempotent: existing files are skipped unless force is set.
 */
export async function stampFactory(repoPath: string, force = false): Promise<StampResult> {
  const args = ["run", INSTALL_SCRIPT];
  if (force) args.push("--force");

  return new Promise((resolve) => {
    // spawnUv resolves the full path to uv.exe and spawns with shell:false,
    // so arguments containing spaces (like "C:\Software Factory Suite\...")
    // are passed correctly to the OS without shell parsing.
    const child = spawnUv(args, { cwd: repoPath, env: process.env });
    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (d) => (stdout += d.toString()));
    child.stderr?.on("data", (d) => (stderr += d.toString()));
    child.on("error", (err) =>
      resolve({ ok: false, stampedCount: 0, skippedCount: 0, error: err.message, stdout, stderr }),
    );
    child.on("close", (code) => {
      const ok = code === 0;
      const stampedMatch = stdout.match(/stamped:\s*(\d+)/i);
      const skippedMatch = stdout.match(/skipped.*?:\s*(\d+)/i);
      resolve({
        ok,
        stampedCount: stampedMatch ? parseInt(stampedMatch[1], 10) : 0,
        skippedCount: skippedMatch ? parseInt(skippedMatch[1], 10) : 0,
        stdout,
        stderr,
        error: ok ? undefined : `install.py exited ${code}`,
      });
    });
  });
}

export interface AdwInfo {
  name: string;
  file: string;
  chain: string;
  description: string;
  requiredAgents: string[];
  recommended: boolean;
}

const ADW_META: Record<string, { recommended?: boolean; blurb: string }> = {
  adw_simple_sdlc: { recommended: true, blurb: "The full chain: plan → build → test → review → document, 3 commits." },
  adw_plan_build_test: { blurb: "Plan → build → deterministic test/fix, then commit." },
  adw_plan_build: { blurb: "Planner → builder → commit." },
  adw_build_test: { blurb: "Build → deterministic test with bounded fix loop." },
  adw_build_review: { blurb: "Build → reviewer with bounded revise loop." },
  adw_plan: { blurb: "One-shot planning: request → planner." },
  adw_build: { blurb: "One-shot implementation: request → builder." },
  adw_scout: { blurb: "Read-only recon: request → scout. Nothing changes." },
  adw_document: { blurb: "Write up the work just done, from the git diff." },
  adw_quality: { blurb: "Lint, typecheck, and build the project (no agents)." },
  adw_prompt: { blurb: "The smallest ADW: one agent, one prompt." },
  adw_plan_build_test_quality: { blurb: "Full chain plus deterministic verify + test." },
};

export function listAdws(repoPath: string): AdwInfo[] {
  const adwsDir = join(repoPath, "adws");
  if (!existsSync(adwsDir)) return [];
  const out: AdwInfo[] = [];
  for (const f of readdirSync(adwsDir).sort()) {
    if (!f.startsWith("adw_") || !f.endsWith(".py")) continue;
    const name = f.replace(/\.py$/, "");
    const text = readFileSync(join(adwsDir, f), "utf8");
    const chain = extractChain(text);
    const required = extractRequiredAgents(text);
    const meta = ADW_META[name] ?? { blurb: chain };
    out.push({
      name,
      file: `adws/${f}`,
      chain,
      description: meta.blurb,
      requiredAgents: required,
      recommended: !!meta.recommended,
    });
  }
  return out;
}

function extractChain(text: string): string {
  const m = text.match(/Phases:\s*([^\n]+)/);
  return m ? m[1].trim() : "";
}

function extractRequiredAgents(text: string): string[] {
  const m = text.match(/REQUIRED_AGENTS\s*=\s*\[([^\]]*)\]/);
  if (!m) return [];
  return m[1]
    .split(",")
    .map((s) => s.replace(/["'\s]/g, ""))
    .filter(Boolean);
}

export function listRosters(repoPath: string): string[] {
  const dir = join(repoPath, "adws", "adw_sssf_config");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"))
    .sort();
}

export { FACTORY_ROOT, TEMPLATES_ROOT };
