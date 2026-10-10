import { spawnUv } from "@/lib/sssf/spawn";
import { existsSync, mkdirSync, openSync, writeFileSync, appendFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { randomBytes } from "node:crypto";

export interface LaunchInput {
  repoPath: string;
  adw: string; // e.g. adw_simple_sdlc
  configPath: string; // absolute path to sssf.config.yaml
  specPath: string; // absolute path to the approved markdown
  adwId?: string; // optional; generated if absent
  envPath?: string; // absolute path to a .env to load (factory loads it via python-dotenv)
}

export interface LaunchResult {
  adwId: string;
  pid: number;
  logPath: string;
  error?: string;
}

/**
 * Launch an ADW against a target repo. The factory is treated as a black box:
 * we invoke `uv run adws/<adw>.py "<spec>" --config <cfg> --adw-id <id>` with
 * cwd = the target repo, detached so the web request returns immediately. The
 * tracer inside the factory writes live progress into sssf.db, which the Run
 * tab polls. stdout/stderr are teed to a log file for diagnostics.
 */
export function launchAdw(input: LaunchInput): LaunchResult {
  const { repoPath, adw, configPath, specPath } = input;
  if (!existsSync(join(repoPath, "adws", `${adw}.py`)))
    throw new Error(`ADW not found in target repo: adws/${adw}.py`);
  if (!existsSync(specPath)) throw new Error(`approved spec not found: ${specPath}`);
  if (!existsSync(configPath)) throw new Error(`config not found: ${configPath}`);

  const adwId = input.adwId || `s${randomBytes(3).toString("hex")}`;
  const logDir = join(repoPath, "adws", "adw_data", "studio-logs");
  mkdirSync(logDir, { recursive: true });
  const logPath = join(logDir, `${adwId}.log`);
  writeFileSync(logPath, `$ sssf studio launch\n$ uv run adws/${adw}.py "${specPath}" --config ${configPath} --adw-id ${adwId}\n\n`, "utf8");

  const env = { ...process.env };
  // The factory loads .env itself via python-dotenv; we just ensure cwd is right.

  const child = spawnUv(
    ["run", `adws/${adw}.py`, specPath, "--config", configPath, "--adw-id", adwId],
    // spawnUv uses shell:false, so paths with spaces are passed correctly
    // to the OS without shell splitting.
    { cwd: repoPath, env, detached: true, stdio: ["ignore", "pipe", "pipe"] },
  );

  const logFd = openSync(logPath, "a");
  const append = (label: string, data: Buffer) => {
    appendFileSync(logFd, `[${label}] ${data.toString()}`);
  };
  child.stdout?.on("data", (d: Buffer) => append("stdout", d));
  child.stderr?.on("data", (d: Buffer) => append("stderr", d));
  child.on("close", (code) => {
    appendFileSync(logFd, `\n[exit] code=${code}\n`);
  });

  if (typeof child.pid !== "number") {
    return { adwId, pid: -1, logPath, error: "failed to spawn" };
  }
  // Detach so the web process does not keep the child in its tree.
  child.unref();
  return { adwId, pid: child.pid, logPath };
}

export function readLaunchLog(logPath: string): string {
  if (!existsSync(logPath)) return "";
  try {
    return readFileSync(logPath, "utf8");
  } catch {
    return "";
  }
}
