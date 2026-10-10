import { join } from "node:path";

// Derive the application root dynamically so the project is portable across
// platforms (Windows, macOS, Linux). When the Next.js server runs, process.cwd()
// is the project root (the directory containing package.json). This avoids any
// hard-coded path like "/home/z/my-project" or "C:\Software Factory Suite".
const APP_ROOT = process.cwd();

// Where target project repos live. Each workspace = one stamped factory repo.
export const WORKSPACES_ROOT = join(APP_ROOT, "workspaces");

// The cloned factory source (the skill + example). Used as the stamp source.
export const FACTORY_ROOT = APP_ROOT;

// The skill root inside the factory repo — install.py + templates live here.
export const SKILL_ROOT = join(APP_ROOT, ".claude", "skills", "sssf");

// The install script that stamps the factory into a target repo.
export const INSTALL_SCRIPT = join(SKILL_ROOT, "scripts", "install.py");

// The skill templates dir (the canonical factory files install.py copies from).
export const TEMPLATES_ROOT = join(SKILL_ROOT, "templates");

// Conventional location for an approved spec inside a target repo.
export const APPROVED_SPEC_REL = "requests/approved-spec.md";

// Default config path inside a target repo.
export const DEFAULT_CONFIG_REL = "adws/adw_sssf_config/sssf.config.yaml";

// Trace DB relative path.
export const TRACE_DB_REL = "adws/adw_data/sssf.db";

export function workspacePath(slug: string): string {
  return join(WORKSPACES_ROOT, slug);
}
