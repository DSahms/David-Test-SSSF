import { execSync } from "node:child_process";
import { spawn, type SpawnOptions } from "node:child_process";

/**
 * Cross-platform `uv` subprocess spawning.
 *
 * THE PROBLEM (Windows):
 *   When `spawn("uv", args, { shell: true })` is used on Windows, Node.js
 *   joins the command and arguments into a single string that cmd.exe
 *   parses. If any argument contains a space (e.g.
 *   "C:\Software Factory Suite\sssf-factory\...\install.py"), cmd.exe
 *   splits it at the space, producing "C:\Software" as a separate token.
 *   The subprocess then fails with:
 *     "Failed to spawn: `C:\Software` ... (os error 2)"
 *
 * THE FIX:
 *   1. Resolve the full filesystem path to the `uv` executable (preferring
 *      .exe, which can be spawned directly by the OS without cmd.exe).
 *   2. Spawn with `shell: false` (the default). When shell is false, Node
 *      passes the arguments array directly to CreateProcess on Windows,
 *      which does NOT do shell parsing. Each argument stays as a single
 *      string regardless of spaces.
 *
 * This is the standard, robust pattern for cross-platform subprocess
 * execution in Node.js when paths may contain spaces.
 */

let _uvCommand: string | null = null;

/**
 * Resolve the `uv` executable to a full path on Windows.
 * On Unix, returns "uv" (PATH resolution handles it).
 *
 * On Windows, uses `where uv` to find the executable. Prefers `.exe` over
 * `.cmd` because `.exe` files can be spawned directly (CreateProcess),
 * while `.cmd` files require cmd.exe (which brings back the space-splitting
 * problem).
 */
export function getUvCommand(): string {
  if (_uvCommand) return _uvCommand;

  if (process.platform === "win32") {
    try {
      // `where` is a Windows built-in that searches PATH (including PATHEXT).
      // It returns one full path per line.
      const out = execSync("where uv", { encoding: "utf8", timeout: 5000 });
      const lines = out.trim().split(/\r?\n/).filter(Boolean);
      // Prefer .exe — directly spawnable without cmd.exe
      const exe = lines.find((l) => /\.exe$/i.test(l));
      _uvCommand = exe || lines[0] || "uv";
    } catch {
      // `where` failed (uv not on PATH). Fall back to bare "uv" — spawn
      // will still search PATH + PATHEXT on modern Node.
      _uvCommand = "uv";
    }
  } else {
    _uvCommand = "uv";
  }

  return _uvCommand;
}

/**
 * Spawn `uv` with the given args, without shell:true.
 *
 * Critical: `shell: false` ensures that arguments containing spaces
 * (like Windows paths under "C:\Software Factory Suite\...") are passed
 * as-is to the OS, not split by a shell parser.
 */
export function spawnUv(
  args: string[],
  options: { cwd: string; env?: NodeJS.ProcessEnv; detached?: boolean; stdio?: SpawnOptions["stdio"] },
) {
  return spawn(getUvCommand(), args, {
    ...options,
    shell: false,
  });
}
