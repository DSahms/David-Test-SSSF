import { db } from "@/lib/db";
import { listWorkspaceDirs, workspaceInfo, createWorkspaceDir, slugify } from "@/lib/sssf/factory";
import { existsSync, statSync } from "node:fs";
import { basename, dirname } from "node:path";
import { WORKSPACES_ROOT } from "@/lib/paths";

export interface WorkspaceRow {
  id: string; // prisma id
  slug: string;
  name: string;
  path: string;
  info: ReturnType<typeof workspaceInfo>;
}

/**
 * Build a complete list of workspaces from two sources:
 * 1. Auto-discovered directories under WORKSPACES_ROOT (created via "New workspace").
 * 2. Imported workspaces in the database whose paths may be anywhere on disk.
 *
 * Both are merged and deduplicated by slug. Workspaces whose on-disk directory
 * no longer exists are skipped (but not deleted from the DB, so they reappear
 * if the folder is restored).
 */
export async function syncAndListWorkspaces(): Promise<WorkspaceRow[]> {
  // 1. Auto-discover dirs under WORKSPACES_ROOT and upsert them into the DB.
  const dirs = listWorkspaceDirs();
  for (const slug of dirs) {
    const info = workspaceInfo(slug);
    if (info) {
      await db.workspace.upsert({
        where: { slug },
        create: { slug, name: slug, path: info.path },
        update: { path: info.path },
      });
    }
  }

  // 2. Query ALL workspaces from the database (includes imported ones whose
  //    paths are outside WORKSPACES_ROOT).
  const allDb = await db.workspace.findMany({ orderBy: { updatedAt: "desc" } });
  const rows: WorkspaceRow[] = [];
  for (const w of allDb) {
    // Compute live info from the actual path on disk.
    const info = workspaceInfo(w.slug, w.path);
    if (info) {
      rows.push({ id: w.id, slug: w.slug, name: w.name, path: w.path, info });
    }
    // If info is null (directory gone), we skip it from the list but leave
    // the DB row intact so it can resurface if the folder comes back.
  }
  return rows;
}

export async function getWorkspaceBySlug(slug: string): Promise<WorkspaceRow | null> {
  // Check the database first — covers imported workspaces whose path is
  // outside WORKSPACES_ROOT.
  const dbRow = await db.workspace.findUnique({ where: { slug } });
  if (dbRow) {
    const info = workspaceInfo(slug, dbRow.path);
    if (info) {
      return { id: dbRow.id, slug, name: dbRow.name, path: dbRow.path, info };
    }
  }

  // Fall back to auto-discovery under WORKSPACES_ROOT.
  const info = workspaceInfo(slug);
  if (!info) return null;
  const row = await db.workspace.upsert({
    where: { slug },
    create: { slug, name: slug, path: info.path },
    update: { path: info.path },
  });
  return { id: row.id, slug, name: row.name, path: row.path, info };
}

export async function createWorkspace(name: string): Promise<WorkspaceRow> {
  const slug = slugify(name);
  const path = createWorkspaceDir(slug);
  const row = await db.workspace.create({ data: { slug, name, path } });
  return { id: row.id, slug, name, path, info: workspaceInfo(slug)! };
}

/**
 * Register an existing repository directory as a workspace. Does NOT create
 * or modify any files on disk — it only adds a row to the database so the
 * folder appears in the sidebar and all tabs work against it.
 *
 * The folder can be anywhere on disk (including paths with spaces, and
 * including paths outside WORKSPACES_ROOT).
 */
export async function importWorkspace(absPath: string): Promise<WorkspaceRow> {
  // Validate the path exists and is a directory.
  if (!existsSync(absPath)) {
    throw new Error(`Path does not exist: ${absPath}`);
  }
  if (!statSync(absPath).isDirectory()) {
    throw new Error(`Path is not a directory: ${absPath}`);
  }

  // Derive slug and name from the directory name.
  const dirName = basename(absPath) || "imported";
  let slug = slugify(dirName);

  // Check for path conflicts — if this exact path is already a workspace,
  // just return it (idempotent).
  const existingByPath = await db.workspace.findUnique({ where: { path: absPath } });
  if (existingByPath) {
    const info = workspaceInfo(existingByPath.slug, absPath);
    return { id: existingByPath.id, slug: existingByPath.slug, name: existingByPath.name, path: absPath, info: info! };
  }

  // Ensure slug uniqueness — append a suffix if needed.
  let suffix = 1;
  let candidateSlug = slug;
  while (await db.workspace.findUnique({ where: { slug: candidateSlug } })) {
    candidateSlug = `${slug}-${++suffix}`;
  }
  slug = candidateSlug;

  const row = await db.workspace.create({
    data: { slug, name: dirName, path: absPath },
  });
  const info = workspaceInfo(slug, absPath);
  return { id: row.id, slug, name: dirName, path: absPath, info: info! };
}
