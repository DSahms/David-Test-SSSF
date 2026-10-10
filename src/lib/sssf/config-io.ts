import "server-only";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { parse, stringify } from "yaml";
import { normalize, type SSSFConfig } from "./config";

// Server-only file I/O for sssf.config.yaml. Kept separate from config.ts so
// the types/constants/validation can be imported safely on the client.

export function readConfig(configPath: string): SSSFConfig {
  if (!existsSync(configPath)) throw new Error(`config not found: ${configPath}`);
  const raw = parse(readFileSync(configPath, "utf8")) || {};
  return normalize(raw);
}

export function writeConfig(configPath: string, cfg: SSSFConfig): void {
  mkdirSync(dirname(configPath), { recursive: true });
  const doc = stringify(cfg as unknown as Record<string, unknown>, {
    lineWidth: 0,
    nullStr: "",
  });
  const header =
    "# sssf.config.yaml — the factory's agent roster. One agent, one prompt, one purpose.\n" +
    "# Edited with SSSF Studio. The factory reads this file unchanged.\n\n";
  writeFileSync(configPath, header + doc, "utf8");
}

export function resolveConfigPath(repoPath: string, roster?: string): string {
  const configDir = join(repoPath, "adws", "adw_sssf_config");
  if (!roster) return join(configDir, "sssf.config.yaml");
  if (roster.startsWith("/")) return roster;
  // A roster is a bare filename (e.g. "sssf.config.yaml") or a path; if it is a
  // bare filename with no slashes, resolve it under the config dir.
  if (!roster.includes("/")) return join(configDir, roster);
  return join(repoPath, roster);
}
