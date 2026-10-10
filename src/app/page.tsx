"use client";

import { useEffect } from "react";
import { useStudio } from "@/lib/studio-store";
import { api } from "@/lib/sssf/api-client";
import { AppShell } from "@/components/sssf/AppShell";
import { TourOverlay } from "@/components/sssf/TourOverlay";
import { useTour, tourHasBeenSeen, markTourSeen } from "@/lib/tour-store";
import { toast } from "sonner";

export default function Home() {
  const setWorkspaces = useStudio((s) => s.setWorkspaces);
  const workspaces = useStudio((s) => s.workspaces);
  const activeSlug = useStudio((s) => s.activeSlug);
  const startTour = useTour((s) => s.start);

  useEffect(() => {
    let alive = true;
    api.listWorkspaces().then((r) => {
      if (alive) setWorkspaces(r.workspaces);
    }).catch((error) => {
      if (alive) toast.error(error instanceof Error ? error.message : "Could not load workspaces");
    });
    return () => { alive = false; };
  }, [setWorkspaces]);

  useEffect(() => {
    if (!activeSlug && workspaces.length > 0) {
      useStudio.getState().setActive(workspaces[0].slug);
    }
  }, [activeSlug, workspaces]);

  // First-visit: auto-start the tour once workspaces have loaded.
  useEffect(() => {
    if (workspaces.length === 0) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (!tourHasBeenSeen()) {
      timer = setTimeout(() => startTour(), 900);
    }
    return () => { if (timer) clearTimeout(timer); };
  }, [workspaces.length]);

  // Mark seen if user closes tab without finishing (so it doesn't nag forever).
  useEffect(() => {
    const onBeforeUnload = () => markTourSeen();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  return (
    <>
      <AppShell />
      <TourOverlay />
    </>
  );
}
