import { NextRequest, NextResponse } from "next/server";
import { readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname, resolve, sep } from "node:path";
import { homedir } from "node:os";

export const dynamic = "force-dynamic";

/**
 * Directory browser API for the "Pick Existing Repo" picker.
 *
 * GET /api/browse?path=<dir>
 *
 * Returns the subdirectories of <dir> (files are excluded — only directories
 * are shown in the picker). If no path is given, defaults to the user's home
 * directory.
 *
 * On Windows, also returns a list of available drive letters so the user can
 * switch drives in the picker UI.
 */

interface DirEntry {
  name: string;
  path: string;
}

function isWindows(): boolean {
  return process.platform === "win32";
}

/** List available Windows drive letters by probing A:\ through Z:\. */
function listWindowsDrives(): string[] {
  const drives: string[] = [];
  for (let code = 65; code <= 90; code++) {
    const letter = String.fromCharCode(code);
    const drive = `${letter}:\\`;
    try {
      access(drive);
      drives.push(drive);
    } catch {
      // drive doesn't exist or not accessible
    }
  }
  return drives;
}

function access(p: string): void {
  // Use statSync to check accessibility — throws if not accessible.
  statSync(p);
}

/** Get the parent directory of a path. Returns null if already at the root. */
function getParent(path: string): string | null {
  const parent = dirname(path);
  // dirname("C:\\") === "C:\\" on Windows; dirname("/") === "/" on Unix.
  // If parent equals path, we're at the root.
  if (parent === path || parent === "" ) return null;
  return parent;
}

export async function GET(req: NextRequest) {
  const queryPath = req.nextUrl.searchParams.get("path");

  // Default to home directory if no path specified.
  let currentPath: string;
  if (queryPath) {
    currentPath = resolve(queryPath);
  } else {
    currentPath = homedir();
  }

  // Validate the path exists and is a directory.
  if (!existsSync(currentPath)) {
    return NextResponse.json({
      currentPath,
      parentPath: getParent(currentPath),
      directories: [],
      drives: isWindows() ? listWindowsDrives() : [],
      error: `Path does not exist: ${currentPath}`,
    });
  }

  let stat;
  try {
    stat = statSync(currentPath);
  } catch (e: any) {
    return NextResponse.json({
      currentPath,
      parentPath: getParent(currentPath),
      directories: [],
      drives: isWindows() ? listWindowsDrives() : [],
      error: `Cannot access path: ${e.message}`,
    });
  }

  if (!stat.isDirectory()) {
    return NextResponse.json({
      currentPath,
      parentPath: getParent(currentPath),
      directories: [],
      drives: isWindows() ? listWindowsDrives() : [],
      error: `Not a directory: ${currentPath}`,
    });
  }

  // List subdirectories (skip files, hidden dirs, and common noise).
  const directories: DirEntry[] = [];
  try {
    const entries = readdirSync(currentPath, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name.startsWith(".")) continue;
      // Skip common noise directories
      if (["node_modules", "__pycache__", ".git", "AppData", "Application Data"].includes(entry.name)) continue;
      try {
        const fullPath = join(currentPath, entry.name);
        // Verify we can stat it (some dirs may be access-denied)
        statSync(fullPath);
        directories.push({ name: entry.name, path: fullPath });
      } catch {
        // Skip directories we can't access
      }
    }
  } catch (e: any) {
    return NextResponse.json({
      currentPath,
      parentPath: getParent(currentPath),
      directories: [],
      drives: isWindows() ? listWindowsDrives() : [],
      error: `Cannot read directory: ${e.message}`,
    });
  }

  directories.sort((a, b) => a.name.localeCompare(b.name));

  return NextResponse.json({
    currentPath,
    parentPath: getParent(currentPath),
    directories,
    drives: isWindows() ? listWindowsDrives() : [],
    error: null,
  });
}
