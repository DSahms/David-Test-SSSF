"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/sssf/api-client";
import { cn } from "@/lib/sssf/ui";
import { X, Folder, FolderOpen, ChevronUp, HardDrive, ArrowLeft, Check, Loader2, AlertCircle } from "lucide-react";

interface RepoPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (path: string) => void;
}

interface BrowseResult {
  currentPath: string;
  parentPath: string | null;
  directories: { name: string; path: string }[];
  drives: string[];
  error: string | null;
}

export function RepoPicker({ open, onClose, onSelect }: RepoPickerProps) {
  const [data, setData] = useState<BrowseResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  const load = useCallback(async (path?: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.browse(path);
      setData(result);
      setSelectedPath(null);
      if (result.error) setError(result.error);
    } catch (e: any) {
      setError(e.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      load();
    }
  }, [open, load]);

  if (!open) return null;

  function handleSelect() {
    // Use the explicitly-selected subdirectory if one was clicked, otherwise
    // use the current directory being browsed. This lets the user either
    // click into a folder and then click "Select this folder" to pick the
    // current one, or click a sub-folder and select it without navigating in.
    const path = selectedPath || data?.currentPath;
    if (!path) return;
    onSelect(path);
  }

  function handleDirClick(path: string) {
    load(path);
  }

  function handleUp() {
    if (data?.parentPath) {
      load(data.parentPath);
    }
  }

  function handleDrive(drive: string) {
    load(drive);
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Dialog */}
      <div className="relative z-10 flex w-full max-w-2xl flex-col rounded-xl border border-border bg-surface shadow-2xl studio-fade" style={{ maxHeight: "80vh" }}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-accent" />
            <h2 className="font-display text-[16px] font-semibold tracking-tight">Pick an existing repository</h2>
          </div>
          <button onClick={onClose} className="text-fg-muted hover:text-fg">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Breadcrumb / current path */}
        <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
          <button
            onClick={handleUp}
            disabled={!data?.parentPath || loading}
            className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[12px] font-medium text-fg-muted hover:bg-surface-2 hover:text-fg disabled:opacity-30"
            title="Go to parent directory"
          >
            <ChevronUp className="h-3.5 w-3.5" /> Up
          </button>
          <div className="min-w-0 flex-1 truncate font-mono text-[12px] text-fg-muted" title={data?.currentPath || ""}>
            {data?.currentPath || "..."}
          </div>
        </div>

        {/* Drive selector (Windows) */}
        {data && data.drives.length > 0 && (
          <div className="flex flex-wrap gap-1 border-b border-border px-4 py-2">
            {data.drives.map((drive) => (
              <button
                key={drive}
                onClick={() => handleDrive(drive)}
                className={cn(
                  "inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-mono",
                  data.currentPath.toUpperCase().startsWith(drive.toUpperCase())
                    ? "bg-accent-soft text-accent"
                    : "text-fg-muted hover:bg-surface-2",
                )}
              >
                <HardDrive className="h-3 w-3" /> {drive}
              </button>
            ))}
          </div>
        )}

        {/* Directory list */}
        <div className="min-h-[200px] flex-1 overflow-y-auto studio-scroll">
          {loading && (
            <div className="flex items-center justify-center py-12 text-fg-muted">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          )}
          {error && !loading && (
            <div className="flex items-center gap-2 px-4 py-8 text-center text-[13px] text-danger">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {!loading && !error && data && data.directories.length === 0 && (
            <div className="px-4 py-12 text-center text-[13px] text-fg-muted">
              No subdirectories found in {data.currentPath}
            </div>
          )}
          {!loading && !error && data && data.directories.map((dir) => (
            <button
              key={dir.path}
              onClick={() => handleDirClick(dir.path)}
              onDoubleClick={() => setSelectedPath(dir.path)}
              className={cn(
                "group flex w-full items-center gap-2.5 px-4 py-2 text-left text-[13px] transition-colors",
                selectedPath === dir.path
                  ? "bg-accent-soft text-accent"
                  : "text-fg hover:bg-surface-2",
              )}
            >
              <Folder className={cn("h-4 w-4 shrink-0", selectedPath === dir.path ? "text-accent" : "text-fg-muted group-hover:text-fg")} />
              <span className="flex-1 truncate">{dir.name}</span>
              {selectedPath === dir.path && <Check className="h-3.5 w-3.5 text-accent" />}
            </button>
          ))}
        </div>

        {/* Selected path + actions */}
        <div className="border-t border-border px-4 py-3">
          <div className="mb-2.5 min-w-0">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-fg-muted">Selected folder</div>
            <div className="truncate font-mono text-[12px] text-fg" title={selectedPath || data?.currentPath || ""}>
              {selectedPath || data?.currentPath || "(none — navigate to a folder, then click Select)"}
            </div>
          </div>
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] text-fg-muted">
              Click a folder to navigate into it. The current folder will be imported.
            </p>
            <div className="flex gap-2">
              <button onClick={onClose} className="rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-fg-muted hover:bg-surface-2">
                Cancel
              </button>
              <button
                onClick={handleSelect}
                disabled={!data?.currentPath}
                className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-1.5 text-[12px] font-medium text-fg-on-accent hover:bg-accent/90 disabled:opacity-50"
              >
                <Check className="h-3.5 w-3.5" /> Select this folder
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
