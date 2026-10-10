"use client";

import { useStudio } from "@/lib/studio-store";
import { api, type DiscoverySession, type DiscoveryMessage, type DiscoveryFeedback } from "@/lib/sssf/api-client";
import { useEffect, useRef, useState, useCallback } from "react";
import { Compass, Plus, Loader2, Send, Sparkles, CheckCircle2, FileCheck2, ChevronDown, Trash2, X, Check, AlertTriangle, HelpCircle, Lightbulb, ListChecks, MessageSquare, Upload, Mic, ClipboardPaste, Square } from "lucide-react";
import { cn, timeAgo } from "@/lib/sssf/ui";
import { toast } from "sonner";
import { MarkdownView } from "./MarkdownView";

interface RecognitionResult {
  readonly 0: { readonly transcript: string };
}

interface RecognitionEvent {
  readonly results: ArrayLike<RecognitionResult>;
}

interface SpeechRecognitionController {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionWindow extends Window {
  SpeechRecognition?: new () => SpeechRecognitionController;
  webkitSpeechRecognition?: new () => SpeechRecognitionController;
}

export function DiscoveryTab() {
  const { activeWorkspace } = useStudio();
  const slug = activeWorkspace?.slug;
  const [sessions, setSessions] = useState<DiscoverySession[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [session, setSession] = useState<DiscoverySession | null>(null);
  const [specDraft, setSpecDraft] = useState("");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState<"review" | "chat" | "approve" | null>(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState("");
  const [showList, setShowList] = useState(false);
  const [preview, setPreview] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [loadingList, setLoadingList] = useState(false);
  const [listening, setListening] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionController | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load sessions list.
  const refreshSessions = useCallback(async () => {
    if (!slug) return;
    setLoadingList(true);
    try {
      const r = await api.listSessions(slug);
      setSessions(r.sessions);
      if (!activeId && r.sessions.length > 0) setActiveId(r.sessions[0].id);
    } finally {
      setLoadingList(false);
    }
  }, [slug, activeId]);

  useEffect(() => {
    refreshSessions().catch((error) => toast.error(error instanceof Error ? error.message : "Could not load conversations"));
  }, [refreshSessions]);

  useEffect(() => () => recognitionRef.current?.stop(), []);

  // Load active session.
  useEffect(() => {
    if (!slug || !activeId) { setSession(null); setSpecDraft(""); return; }
    let alive = true;
    api.getSession(slug, activeId).then((r) => {
      if (!alive) return;
      setSession(r.session);
      setSpecDraft(r.session.specDraft);
      setTitle(r.session.title);
      setDismissed(new Set());
    }).catch((error) => {
      if (alive) toast.error(error instanceof Error ? error.message : "Could not load this conversation");
    });
    return () => { alive = false; };
  }, [slug, activeId]);

  // Auto-scroll chat.
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [session?.messages.length]);

  // Debounced autosave of spec draft.
  useEffect(() => {
    if (!slug || !activeId || !session) return;
    if (specDraft === session.specDraft) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await api.patchSession(slug, activeId, { specDraft });
      } catch (error) {
        toast.error(error instanceof Error ? `Could not save the proposal: ${error.message}` : "Could not save the proposal");
      }
    }, 900);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [specDraft, slug, activeId, session]);

  async function newSession() {
    if (!slug) return;
    const title = `Discovery ${new Date().toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}`;
    try {
      const r = await api.createSession(slug, title);
      await refreshSessions();
      setActiveId(r.session.id);
      setShowList(false);
    } catch (e: any) { toast.error(e.message); }
  }

  async function beginGuidedConversation(prompt: string) {
    if (!slug) return;
    setBusy("chat");
    try {
      const created = await api.createSession(slug, "New request");
      const reply = await api.chat(slug, created.session.id, prompt, "");
      const timestamp = new Date().toISOString();
      setSpecDraft(reply.specDraft);
      setTitle(created.session.title);
      setSession({
        ...created.session,
        specDraft: reply.specDraft,
        messages: [
          { id: `u${Date.now()}`, role: "user", content: prompt, feedback: null, createdAt: timestamp },
          reply.message,
        ],
      });
      setActiveId(created.session.id);
      setShowList(false);
      await refreshSessions();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start the conversation");
    } finally {
      setBusy(null);
    }
  }

  async function runReview() {
    if (!slug || !activeId) return;
    setBusy("review");
    const userMsg = input.trim() || undefined;
    try {
      const r = await api.review(slug, activeId, userMsg, specDraft);
      setSession((s) => s ? { ...s, messages: [...s.messages, ...(userMsg ? [{ id: "u" + Date.now(), role: "user", content: userMsg, feedback: null, createdAt: new Date().toISOString() } as DiscoveryMessage] : []), r.message] } : s);
      setInput("");
      toast.success("Discovery agent reviewed the spec");
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(null); }
  }

  async function sendChat() {
    if (!slug || !activeId || !input.trim()) return;
    setBusy("chat");
    const msg = input.trim();
    setInput("");
    try {
      const r = await api.chat(slug, activeId, msg, specDraft);
      setSpecDraft(r.specDraft);
      setSession((s) => s ? { ...s, messages: [...s.messages, { id: "u" + Date.now(), role: "user", content: msg, feedback: null, createdAt: new Date().toISOString() } as DiscoveryMessage, r.message] } : s);
    } catch (e: any) { toast.error(e.message); setBusy(null); }
    finally { setBusy(null); }
  }

  function toggleVoiceInput() {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const speechWindow = window as SpeechRecognitionWindow;
    const Recognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!Recognition) {
      toast.error("Voice input is not available in this browser. Use Paste from clipboard or choose a text file instead.");
      return;
    }
    const recognition = new Recognition();
    recognition.lang = navigator.language;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results, (result) => result[0].transcript).join(" ").trim();
      if (transcript) setInput((current) => current ? `${current} ${transcript}` : transcript);
    };
    recognition.onerror = (event) => toast.error(`Voice input failed: ${event.error}`);
    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };
    recognitionRef.current = recognition;
    setListening(true);
    try {
      recognition.start();
    } catch (error) {
      setListening(false);
      recognitionRef.current = null;
      toast.error(error instanceof Error ? error.message : "Could not start voice input");
    }
  }

  async function pasteFromClipboard() {
    try {
      const pasted = await navigator.clipboard.readText();
      if (!pasted.trim()) {
        toast.info("The clipboard is empty");
        return;
      }
      setInput((current) => current ? `${current}\n${pasted}` : pasted);
    } catch (error) {
      toast.error(error instanceof Error ? `Could not read clipboard: ${error.message}` : "Could not read clipboard");
    }
  }

  async function approve() {
    if (!slug || !activeId || !specDraft.trim()) return;
    setBusy("approve");
    try {
      const r = await api.approve(slug, activeId, specDraft);
      toast.success(`Spec approved → ${r.specPath}`);
      await refreshSessions();
      // reload session to reflect approved status
      const s = await api.getSession(slug, activeId);
      setSession(s.session);
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(null); }
  }

  async function saveTitle() {
    if (!slug || !activeId) return;
    setEditingTitle(false);
    if (!title.trim() || title === session?.title) return;
    try {
      await api.patchSession(slug, activeId, { title });
      setSession((s) => s ? { ...s, title } : s);
      await refreshSessions();
    } catch (e: any) { toast.error(e.message); }
  }

  async function deleteSession(id: string) {
    if (!slug) return;
    try {
      await api.deleteSession(slug, id);
      if (activeId === id) setActiveId(null);
      await refreshSessions();
    } catch (e: any) { toast.error(e.message); }
  }

  function acceptSuggestion(text: string, key: string) {
    const addition = `\n\n- ${text}`;
    setSpecDraft((d) => d + addition);
    setDismissed((s) => new Set(s).add(key));
    toast.success("Added to spec");
  }
  function rejectSuggestion(key: string) {
    setDismissed((s) => new Set(s).add(key));
  }

  /** Load a markdown file from disk into the spec editor (replaces the draft). */
  function loadFile(file: File) {
    const r = new FileReader();
    r.onload = () => {
      const text = String(r.result || "");
      setSpecDraft(text);
      setPreview(false);
      toast.success(`Imported ${file.name} (${text.length.toLocaleString()} chars)`);
    };
    r.onerror = () => toast.error("Could not read file");
    r.readAsText(file);
  }

  if (!slug) return null;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-border bg-surface px-6 py-3">
        <Compass className="h-5 w-5 text-accent" />
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-fg-muted">Discovery</div>
          {editingTitle ? (
            <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} onBlur={saveTitle} onKeyDown={(e) => { if (e.key === "Enter") saveTitle(); if (e.key === "Escape") { setTitle(session?.title || ""); setEditingTitle(false); } }} className="w-full rounded border border-accent/40 px-1.5 py-0 text-[16px] font-semibold outline-none" />
          ) : (
            <button onClick={() => setEditingTitle(true)} className="block max-w-full truncate text-[16px] font-semibold tracking-tight hover:text-accent">
              {session?.title || "No session selected"}
            </button>
          )}
        </div>

        {/* Session switcher */}
        <div className="relative">
          <button onClick={() => setShowList((v) => !v)} className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-[12px] font-medium text-fg-muted hover:border-border">
            <ListChecks className="h-3.5 w-3.5" /> Sessions ({sessions.length}) <ChevronDown className="h-3.5 w-3.5" />
          </button>
          {showList && (
            <div className="absolute right-0 top-full z-30 mt-1 w-72 rounded-lg border border-border bg-surface p-1.5 shadow-lg">
              <button onClick={newSession} className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[13px] font-medium text-accent hover:bg-accent-soft">
                <Plus className="h-3.5 w-3.5" /> New discovery session
              </button>
              {sessions.length > 0 && <div className="my-1 border-t border-border" />}
              <div className="max-h-64 overflow-y-auto studio-scroll">
                {sessions.map((s) => (
                  <div key={s.id} className={cn("group flex items-center gap-1 rounded-md px-1.5 py-1", activeId === s.id ? "bg-surface-2" : "hover:bg-bg")}>
                    <button onClick={() => { setActiveId(s.id); setShowList(false); }} className="min-w-0 flex-1 text-left">
                      <div className="truncate text-[12.5px] font-medium text-fg">{s.title}</div>
                      <div className="text-[10.5px] text-fg-muted">{s.status} · {timeAgo(s.updatedAt)} · {s._count?.messages ?? 0} msgs</div>
                    </button>
                    <button onClick={() => deleteSession(s.id)} className="opacity-0 group-hover:opacity-100 text-fg-muted hover:text-danger"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {session?.status === "approved" ? (
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-accent/30 bg-accent-soft px-3 py-1.5 text-[12px] font-medium text-accent">
            <FileCheck2 className="h-4 w-4" /> Approved
          </span>
        ) : (
          <button data-tour="tour-discovery-approve" onClick={approve} disabled={busy !== null || !specDraft.trim()} className="inline-flex items-center gap-2 rounded-lg bg-accent px-3.5 py-1.5 text-[13px] font-medium text-fg hover:bg-accent disabled:opacity-50">
            {busy === "approve" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileCheck2 className="h-4 w-4" />}
            Approve specification
          </button>
        )}
      </header>

      {!session ? (
        <div className="flex flex-1 items-center justify-center p-8">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-accent"><Compass className="h-7 w-7" /></div>
            <h2 className="font-display text-lg font-semibold">What would you like help with?</h2>
            <p className="mt-1.5 text-[13px] text-fg-muted">Choose a starting point. The Discovery agent will talk it through with you and prepare a proposal—no typing required.</p>
            <div className="mt-5 grid gap-2 text-left">
              {[
                { label: "I have an idea to work through", prompt: "I have an idea I would like help shaping into a clear, practical plan. Please guide me with one simple question at a time." },
                { label: "I want help with an existing project", prompt: "I want help with an existing project. Please ask me what I want to accomplish and guide me one question at a time." },
                { label: "Help me use files I already have", prompt: "I have existing files that may help explain what I need. Please ask me what I am trying to accomplish and help me use those files as context." },
              ].map((starter) => (
                <button
                  key={starter.label}
                  onClick={() => beginGuidedConversation(starter.prompt)}
                  disabled={busy !== null}
                  className="flex min-h-12 items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-left text-[13px] font-medium text-fg hover:border-accent/50 hover:bg-accent-soft/40 disabled:opacity-50"
                >
                  <MessageSquare className="h-4 w-4 shrink-0 text-accent" />
                  {starter.label}
                </button>
              ))}
            </div>
            <div className="my-4 flex items-center gap-3 text-[11px] text-fg-muted"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
            <button onClick={newSession} disabled={busy !== null} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-surface px-4 py-2 text-[13px] font-medium text-fg hover:bg-surface-2 disabled:opacity-50">
              <Plus className="h-4 w-4" /> Start a conversation
            </button>
          </div>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1">
          {/* Chat panel */}
          <section className="flex w-[44%] min-w-[340px] flex-col border-r border-border bg-surface" data-tour="tour-discovery-chat">
            <div ref={chatRef} className="flex-1 space-y-4 overflow-y-auto p-4 studio-scroll">
              {session.messages.length === 0 && (
                <div className="rounded-xl border border-dashed border-border bg-bg p-4 text-[13px] text-fg-muted">
                  <p className="font-medium text-fg">Discovery workspace</p>
                  <p className="mt-1">Tell the Discovery agent what you want. Use the microphone, paste copied text, or choose an existing markdown file. You do not need to type.</p>
                  <p className="mt-2">The agent will ask questions and shape a proposal with you. Review it, then approve it before the Python workflow can continue.</p>
                </div>
              )}
              {session.messages.map((m) => (
                <MessageBubble key={m.id} m={m} dismissed={dismissed} onAccept={acceptSuggestion} onReject={rejectSuggestion} />
              ))}
            </div>
            {/* Input */}
            <div className="border-t border-border p-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Use Speak or Paste to tell the Discovery agent what you need…"
                rows={2}
                aria-label="Conversation message (optional keyboard input)"
                className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-[13px] outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
              <div className="mt-2 flex items-center justify-between gap-2">
                <span aria-live="polite" className="text-[11px] text-fg-muted">{listening ? "Listening… speak now" : input.trim() ? "Ready to send your message" : "Speak, paste, or choose a file — typing is optional"}</span>
                <div className="flex flex-wrap justify-end gap-1.5">
                  <button onClick={toggleVoiceInput} disabled={busy !== null} aria-pressed={listening} className={cn("inline-flex min-h-10 items-center gap-1.5 rounded-lg border px-3 py-2 text-[12px] font-medium", listening ? "border-danger bg-danger/10 text-danger" : "border-border bg-surface text-fg-muted hover:bg-bg")}>
                    {listening ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />} {listening ? "Stop speaking" : "Speak"}
                  </button>
                  <button onClick={pasteFromClipboard} disabled={busy !== null} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-[12px] font-medium text-fg-muted hover:bg-bg disabled:opacity-50">
                    <ClipboardPaste className="h-4 w-4" /> Paste
                  </button>
                  <button onClick={sendChat} disabled={busy !== null || !input.trim()} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-[12px] font-medium text-fg-muted hover:bg-bg disabled:opacity-50">
                    {busy === "chat" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />} Send
                  </button>
                  <button onClick={runReview} disabled={busy !== null} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-surface px-3 py-2 text-[12px] font-medium text-fg hover:bg-surface-2 disabled:opacity-50">
                    {busy === "review" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />} Review spec
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Spec editor */}
          <section className="flex min-w-0 flex-1 flex-col bg-bg" data-tour="tour-discovery-spec">
            <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-2">
              <div className="flex items-center gap-2 text-[12px] font-medium text-fg-muted">
                <FileCheck2 className="h-3.5 w-3.5 text-fg-muted" /> Specification draft
                <span className="text-fg-muted">·</span>
                <span className="font-mono text-[11px] text-fg-muted">requests/approved-spec.md</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-[11px] font-medium text-fg-muted hover:bg-surface-2 hover:text-fg">
                  <Upload className="h-3.5 w-3.5" /> Import .md
                  <input type="file" accept=".md,.markdown,text/markdown,text/plain" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) loadFile(f); e.currentTarget.value = ""; }} />
                </label>
                <div className="flex items-center gap-1 rounded-lg border border-border p-0.5 text-[11px]">
                  <button onClick={() => setPreview(false)} className={cn("rounded px-2 py-0.5 font-medium", !preview ? "bg-surface text-fg" : "text-fg-muted")}>Edit</button>
                  <button onClick={() => setPreview(true)} className={cn("rounded px-2 py-0.5 font-medium", preview ? "bg-surface text-fg" : "text-fg-muted")}>Preview</button>
                </div>
              </div>
            </div>
            {preview ? (
              <div className="flex-1 overflow-y-auto p-5 studio-scroll"><MarkdownView>{specDraft}</MarkdownView></div>
            ) : (
              <div
                className="relative flex-1"
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.dataset.drag = "1"; }}
                onDragLeave={(e) => { delete e.currentTarget.dataset.drag; }}
                onDrop={(e) => { e.preventDefault(); delete e.currentTarget.dataset.drag; const f = e.dataTransfer.files?.[0]; if (f) loadFile(f); }}
              >
                <textarea
                  value={specDraft}
                  onChange={(e) => setSpecDraft(e.target.value)}
                  spellCheck={false}
                  className="h-full w-full resize-none bg-transparent p-5 font-mono text-[12.5px] leading-relaxed text-fg outline-none studio-scroll"
                  placeholder="Write your spec in markdown…  (or drag a .md file here / click Import)"
                />
              </div>
            )}
            <div className="flex items-center justify-between border-t border-border bg-surface px-4 py-1.5 text-[11px] text-fg-muted">
              <span>{specDraft.length.toLocaleString()} chars · {specDraft.split("\n").length} lines</span>
              <span>Autosaves locally · approved on click</span>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function MessageBubble({ m, dismissed, onAccept, onReject }: { m: DiscoveryMessage; dismissed: Set<string>; onAccept: (text: string, key: string) => void; onReject: (key: string) => void }) {
  const feedback: DiscoveryFeedback | null = m.feedback ? JSON.parse(m.feedback) : null;
  const isUser = m.role === "user";
  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[88%] rounded-2xl rounded-br-sm bg-surface px-3.5 py-2 text-[13px] text-fg whitespace-pre-wrap">{m.content}</div>
      </div>
    );
  }
  return (
    <div className="flex gap-2.5">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent"><Sparkles className="h-3.5 w-3.5" /></div>
      <div className="min-w-0 flex-1 space-y-2">
        {m.content && <div className="text-[13px] text-fg whitespace-pre-wrap">{m.content}</div>}
        {feedback && <FeedbackCards feedback={feedback} dismissed={dismissed} onAccept={onAccept} onReject={onReject} baseKey={m.id} />}
      </div>
    </div>
  );
}

function FeedbackCards({ feedback, dismissed, onAccept, onReject, baseKey }: { feedback: DiscoveryFeedback; dismissed: Set<string>; onAccept: (t: string, k: string) => void; onReject: (k: string) => void; baseKey: string }) {
  const groups: { key: keyof DiscoveryFeedback; label: string; icon: typeof HelpCircle; tint: string }[] = [
    { key: "missing", label: "Missing requirements", icon: ListChecks, tint: "text-danger bg-danger/10 border-danger/30" },
    { key: "ambiguities", label: "Ambiguities", icon: HelpCircle, tint: "text-warning bg-warning/10 border-warning/30" },
    { key: "suggestions", label: "Suggestions", icon: Lightbulb, tint: "text-accent bg-accent-soft border-accent/30" },
    { key: "questions", label: "Open questions", icon: MessageSquare, tint: "text-accent bg-accent-soft border-accent/30" },
    { key: "risks", label: "Risks", icon: AlertTriangle, tint: "text-warning bg-warning/10 border-warning/30" },
  ];
  return (
    <div className="space-y-2">
      {groups.map((g) => {
        const items = (feedback[g.key] as string[]) || [];
        if (items.length === 0) return null;
        const Icon = g.icon;
        return (
          <div key={g.key} className={cn("rounded-xl border p-2.5", g.tint)}>
            <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide">
              <Icon className="h-3.5 w-3.5" /> {g.label} <span className="opacity-60">({items.length})</span>
            </div>
            <ul className="space-y-1.5">
              {items.map((text, i) => {
                const k = `${baseKey}-${g.key}-${i}`;
                if (dismissed.has(k)) return null;
                return (
                  <li key={k} className="flex items-start gap-2 rounded-lg bg-surface/70 px-2.5 py-1.5 text-[12.5px] text-fg">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-60" />
                    <span className="min-w-0 flex-1">{text}</span>
                    {g.key === "suggestions" && (
                      <div className="flex shrink-0 items-center gap-1">
                        <button onClick={() => onAccept(text, k)} title="Add to spec" className="rounded p-1 text-accent hover:bg-accent-soft"><Check className="h-3.5 w-3.5" /></button>
                        <button onClick={() => onReject(k)} title="Dismiss" className="rounded p-1 text-fg-muted hover:bg-surface-2"><X className="h-3.5 w-3.5" /></button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
