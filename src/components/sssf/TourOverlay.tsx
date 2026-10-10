"use client";

import { useTour, TOUR_STEPS, markTourSeen, type Placement } from "@/lib/tour-store";
import { useEffect, useLayoutEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/sssf/ui";

interface Rect { top: number; left: number; width: number; height: number; }

const PADDING = 8;

export function TourOverlay() {
  const { active, index, next, prev, stop } = useTour();
  const [rect, setRect] = useState<Rect | null>(null);
  const [placement, setPlacement] = useState<Placement>("center");
  const step = TOUR_STEPS[index];

  // Locate the target element and track its position.
  useLayoutEffect(() => {
    if (!active || !step) { setRect(null); return; }
    if (!step.target) { setRect(null); setPlacement(step.placement || "center"); return; }
    let raf = 0;
    const update = () => {
      const el = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
      if (el) {
        const r = el.getBoundingClientRect();
        setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
        setPlacement(step.placement || bestPlacement(r));
      } else {
        setRect(null);
        setPlacement("center");
      }
    };
    update();
    const onScroll = () => { raf = requestAnimationFrame(update); };
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    // Re-measure shortly after tab switch in case content is still rendering.
    const t1 = setTimeout(update, 60);
    const t2 = setTimeout(update, 250);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [active, index, step]);

  // Scroll target into view.
  useEffect(() => {
    if (!active || !step?.target) return;
    const el = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
  }, [active, index, step]);

  // Esc to close.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { markTourSeen(); stop(); }
      else if (e.key === "ArrowRight" && index < TOUR_STEPS.length - 1) next();
      else if (e.key === "ArrowLeft" && index > 0) prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, index, next, prev, stop]);

  if (!active || !step) return null;

  const isLast = index === TOUR_STEPS.length - 1;
  const isFirst = index === 0;
  const centered = placement === "center" || !rect;

  const popoverPos = computePopoverPos(rect, placement);

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-label="Guided tour">
      {/* Spotlight overlay */}
      <div className="absolute inset-0 bg-black/50 transition-opacity" onClick={() => { markTourSeen(); stop(); }} />
      {rect && (
        <div
          className="absolute rounded-lg ring-2 ring-accent shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"
          style={{
            top: rect.top - PADDING,
            left: rect.left - PADDING,
            width: rect.width + PADDING * 2,
            height: rect.height + PADDING * 2,
          }}
        />
      )}

      {/* Popover */}
      <div
        className={cn(
          "absolute z-[101] w-[340px] max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-surface p-4 shadow-2xl studio-fade",
          centered && "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
        )}
        style={centered ? undefined : popoverPos}
      >
        {/* Tail */}
        {rect && !centered && <Tail placement={placement} />}

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-fg-on-accent">{index + 1}</div>
            <span className="text-[11px] font-medium text-fg-muted">Step {index + 1} of {TOUR_STEPS.length}</span>
          </div>
          <button onClick={() => { markTourSeen(); stop(); }} className="text-fg-muted hover:text-fg" aria-label="Close tour"><X className="h-4 w-4" /></button>
        </div>

        <h3 className="font-display mt-3 text-[16px] font-semibold tracking-tight text-fg">{step.title}</h3>
        <p className="mt-1.5 text-[13px] leading-relaxed text-fg-muted">{step.body}</p>

        <div className="mt-4 flex items-center justify-between">
          <button onClick={() => { markTourSeen(); stop(); }} className="text-[12px] text-fg-muted hover:text-fg">Skip tour</button>
          <div className="flex items-center gap-2">
            {!isFirst && (
              <button onClick={prev} className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-[12px] font-medium text-fg-muted hover:bg-surface-2">
                <ChevronLeft className="h-3.5 w-3.5" /> Back
              </button>
            )}
            {isLast ? (
              <button onClick={() => { markTourSeen(); stop(); }} className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-[12px] font-medium text-fg-on-accent hover:bg-accent/90">
                <Check className="h-3.5 w-3.5" /> Done
              </button>
            ) : (
              <button onClick={next} className="inline-flex items-center gap-1 rounded-lg bg-accent px-3 py-1.5 text-[12px] font-medium text-fg-on-accent hover:bg-accent/90">
                Next <ChevronRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Progress dots */}
        <div className="mt-3 flex items-center gap-1">
          {TOUR_STEPS.map((_, i) => (
            <span key={i} className={cn("h-1 flex-1 rounded-full", i <= index ? "bg-accent" : "bg-border")} />
          ))}
        </div>
      </div>
    </div>
  );
}

function bestPlacement(r: Rect): Placement {
  // Prefer below if there's room, else above, else right.
  const below = window.innerHeight - (r.top + r.height);
  if (below > 220) return "bottom";
  if (r.top > 220) return "top";
  return "right";
}

function computePopoverPos(rect: Rect | null, placement: Placement): React.CSSProperties {
  if (!rect) return {};
  const pw = 340;
  const gap = 16;
  switch (placement) {
    case "bottom":
      return { top: rect.top + rect.height + PADDING + gap, left: Math.max(12, Math.min(rect.left, window.innerWidth - pw - 12)) };
    case "top":
      return { top: Math.max(12, rect.top - PADDING - gap - 200), left: Math.max(12, Math.min(rect.left, window.innerWidth - pw - 12)) };
    case "right":
      return { top: Math.max(12, Math.min(rect.top, window.innerHeight - 260)), left: Math.min(rect.left + rect.width + PADDING + gap, window.innerWidth - pw - 12) };
    case "left":
      return { top: Math.max(12, Math.min(rect.top, window.innerHeight - 260)), left: Math.max(12, rect.left - PADDING - gap - pw) };
    default:
      return {};
  }
}

function Tail({ placement }: { placement: Placement }) {
  const base = "absolute h-3 w-3 rotate-45 bg-surface border-border";
  switch (placement) {
    case "bottom": return <span className={cn(base, "border-l border-t -top-1.5")} style={{ left: 24 }} />;
    case "top": return <span className={cn(base, "border-b border-r -bottom-1.5")} style={{ left: 24 }} />;
    case "right": return <span className={cn(base, "border-l border-b -left-1.5")} style={{ top: 24 }} />;
    case "left": return <span className={cn(base, "border-r border-t -right-1.5")} style={{ top: 24 }} />;
    default: return null;
  }
}
