/* SSSF Studio — Learner's Manual content
   All pages as structured objects. Rendered by app.js. */

const PAGES = [
  // ════════════════════════════════════════════════════════════════════════
  // HOME
  // ════════════════════════════════════════════════════════════════════════
  {
    id: "home", group: "Start", title: "Home", icon: "🏠",
    render: () => `
<h1>SSSF Studio</h1>
<p class="lead" style="font-size:1.15rem;color:var(--fg-muted);max-width:560px;">One workspace for the whole flow: take a rough idea, refine it into an approved spec, then hand it to the Super Simple Software Factory to run — all without leaving this app.</p>

<div class="hero-paths" style="margin-top:2rem;">
  <a class="hero-path" href="#/start-here"><div class="hero-path-icon">🚀</div><div class="hero-path-label">Get it running</div><div class="hero-path-desc">Shortest path to your first run</div></a>
  <a class="hero-path" href="#/course/module-1"><div class="hero-path-icon">📚</div><div class="hero-path-label">Learn how it works</div><div class="hero-path-desc">Interactive course, 6 modules</div></a>
  <a class="hero-path" href="#/walkthroughs/architecture"><div class="hero-path-icon">🗺️</div><div class="hero-path-label">Show me the system</div><div class="hero-path-desc">Visual walkthroughs</div></a>
  <a class="hero-path" href="#/developer/architecture"><div class="hero-path-icon">🔧</div><div class="hero-path-label">I'm a developer</div><div class="hero-path-desc">Architecture & build</div></a>
  <a class="hero-path" href="#/troubleshooting"><div class="hero-path-icon">🩹</div><div class="hero-path-label">Something broke</div><div class="hero-path-desc">Troubleshooting guide</div></a>
</div>

<h2>What is this?</h2>
<p>SSSF Studio is a web application that sits on top of the <strong>Super Simple Software Factory</strong> — a repeatable, agents-plus-code workflow system that turns a markdown specification into tested, reviewed, committed code. The factory itself is a collection of Python scripts (called <strong>ADWs</strong>, for AI Developer Workflows) that orchestrate coding agents through named phases, with every event streaming into a SQLite trace database for live observability.</p>
<p>The factory is powerful but has a gap: it assumes you already have a high-quality, approved specification. SSSF Studio fills that gap. It adds an interactive <strong>Discovery</strong> layer where you refine a rough idea with an AI reviewer, a visual <strong>Configuration</strong> editor for the agent roster, one-click <strong>Launch</strong>, and a native run <strong>Observer</strong> — all in one calm workspace.</p>

<h2>Why does it exist?</h2>
<p>Getting an AI agent to write code once is easy. Getting the same result twice is hard. The factory solves repeatability by moving control out of the prompt and into deterministic Python. SSSF Studio solves usability: instead of remembering CLI flags and editing YAML by hand, you work in a single interface that guides you from idea to shipped code.</p>

<h2>Who is it for?</h2>
<ul>
  <li><strong>Engineers</strong> who want repeatable AI-assisted development without babysitting a terminal.</li>
  <li><strong>Teams</strong> who need a visible, traceable record of what an agent did and why.</li>
  <li><strong>Learners</strong> who want to understand how agents-plus-code pipelines work.</li>
  <li><strong>Anyone</strong> who has a rough idea and wants to see it become code without context-switching between five tools.</li>
</ul>

<h2>What can it do?</h2>
<div class="card-grid">
  <div class="card"><div class="card-icon">📁</div><h4>Workspace</h4><p>Create a target repo, stamp the factory in, see live status.</p></div>
  <div class="card"><div class="card-icon">🧭</div><h4>Discovery</h4><p>Chat with an AI reviewer that turns rough ideas into approved specs.</p></div>
  <div class="card"><div class="card-icon">⚙️</div><h4>Configuration</h4><p>Visually edit the agent roster — models, tools, write permissions.</p></div>
  <div class="card"><div class="card-icon">🚀</div><h4>Runs</h4><p>Launch any ADW and watch phases, events, and envelopes stream live.</p></div>
</div>

<h2>What should I do first?</h2>
<p>If you're new, follow the <a href="#/start-here">Start Here</a> path — it walks you from zero to your first factory run in about five minutes. If you prefer to understand the system visually first, go to <a href="#/walkthroughs/architecture">Show Me the System</a>. If you just want to install it, jump to <a href="#/installation">Installation</a>.</p>
`
  },

  // ════════════════════════════════════════════════════════════════════════
  // START HERE
  // ════════════════════════════════════════════════════════════════════════
  {
    id: "start-here", group: "Start", title: "Start Here", icon: "🚀",
    render: () => `
<h1>Start Here</h1>
<p>This is the shortest successful path through SSSF Studio. Follow these steps in order. You can complete the essential flow without typing: use the guided choices, speak or paste your idea, choose files with the picker, and click to review and approve.</p>

<div class="page-toc">
  <div class="page-toc-title">On this page</div>
  <ol>
    <li><a href="#step-1">Open SSSF Studio</a></li>
    <li><a href="#step-2">Create a workspace</a></li>
    <li><a href="#step-3">Stamp the factory</a></li>
    <li><a href="#step-4">Share your idea</a></li>
    <li><a href="#step-5">Review with the Discovery agent</a></li>
    <li><a href="#step-6">Approve the spec</a></li>
    <li><a href="#step-7">Launch a run</a></li>
  </ol>
</div>

<h2 id="step-1">1 · Open SSSF Studio</h2>
<p>When you open the app, you'll see a dark sidebar on the left and a main area on the right. The sidebar has four tabs: <strong>Workspace</strong>, <strong>Discovery</strong>, <strong>Configuration</strong>, and <strong>Runs</strong>. Everything you do happens across these four tabs.</p>
<div class="callout tip"><div class="callout-title">💡 First visit?</div><p>A guided tour will start automatically the first time you open the app. It walks you through each tab with pointer bubbles. You can restart it any time from the sidebar's "Take the tour" button.</p></div>

<h2 id="step-2">2 · Create a workspace</h2>
<p>A <strong>workspace</strong> is a project directory on disk. The factory gets stamped into it. Think of it as a target repo.</p>
<ol>
  <li>Click <strong>"Create My Workspace"</strong>. Studio creates and opens a workspace for you; no name needs to be typed.</li>
  <li>If you already have a project, choose it with the workspace folder picker instead.</li>
  <li>The status grid shows whether the factory is stamped into that workspace.</li>
</ol>

<h2 id="step-3">3 · Stamp the factory</h2>
<p>Stamping copies the Super Simple Software Factory into your workspace — the ADW scripts, the agent modules, the starter roster, and the justfile. It's idempotent: safe to run once, or again with "Overwrite" to refresh.</p>
<ol>
  <li>On the Workspace tab, find the <strong>"Factory installation"</strong> section.</li>
  <li>Click <strong>"Stamp factory into this repo"</strong>.</li>
  <li>Wait a few seconds. The status grid turns green: factory stamped, roster present.</li>
</ol>
<div class="callout concept"><div class="callout-title">📖 What does "stamp" mean?</div><p>Stamping is the factory's own term for installing itself into a repo. The official <code>install.py</code> script copies a known-good set of files. SSSF Studio calls that script — it doesn't modify the factory's code.</p></div>

<h2 id="step-4">4 · Share your idea</h2>
<p>Click the <strong>Discovery</strong> tab and choose a suggested starting point, or begin with your own idea. You do not have to write a specification yourself. Share the idea in whichever way is easiest:</p>
<ul>
  <li><strong>Speak</strong> using the voice button (if your browser supports speech recognition and microphone access).</li>
  <li><strong>Paste</strong> copied text using the paste button — even a rough sentence is fine.</li>
  <li><strong>Choose a file</strong> with the import button, including a Markdown file with notes or requirements.</li>
</ul>
<p>The Discovery assistant asks one question at a time and builds the proposal from what you share. If its AI connection is not configured, open <strong>Configuration → AI provider setup</strong> and paste your provider settings.</p>

<h2 id="step-5">5 · Review with the Discovery agent</h2>
<p>Continue the conversation using speech or paste. The <strong>Discovery agent</strong> updates a readable proposal as you confirm details. Choose <strong>"Review spec"</strong> when you want structured feedback:</p>
<div class="card-grid">
  <div class="card"><h4 style="color:var(--danger)">Missing</h4><p>Requirements a good spec of this request would contain.</p></div>
  <div class="card"><h4 style="color:var(--warning)">Ambiguities</h4><p>Under-specified points that will cause confusion downstream.</p></div>
  <div class="card"><h4 style="color:var(--success)">Suggestions</h4><p>Concrete improvements — click ✓ to append to the spec.</p></div>
  <div class="card"><h4 style="color:var(--accent)">Questions</h4><p>Open questions for you to answer in the chat.</p></div>
  <div class="card"><h4 style="color:var(--warning)">Risks</h4><p>Things that could go wrong.</p></div>
</div>
<p>Answer questions with speech or paste, accept the suggestions you want, and review again if needed. You can inspect the proposal and make any final adjustments before approval.</p>
<div class="callout concept"><div class="callout-title">📖 What is the Discovery agent?</div><p>It is an AI interviewer and specification reviewer. It never touches the ADW graph; its job is to help you shape a proposal for your approval. Configure its endpoint, model, and optional key in <strong>Configuration → AI provider setup</strong>.</p></div>

<h2 id="step-6">6 · Approve the spec</h2>
<p>When the spec is ready, click <strong>"Approve specification"</strong> in the top-right. SSSF Studio writes your markdown to <code>requests/approved-spec.md</code> inside the workspace directory and records the approval in its database. That file is exactly what the factory later consumes as its prompt — untouched, unmodified.</p>
<div class="callout why"><div class="callout-title">🤔 Why a file in the repo?</div><p>The factory reads its prompt from a file path. By writing the approved spec into the target repo, SSSF Studio bridges the interactive layer and the execution layer without coupling them. The factory doesn't know SSSF Studio exists; SSSF Studio doesn't modify the factory. The markdown file is the contract between them.</p></div>

<h2 id="step-7">7 · Launch a run</h2>
<p>Click the <strong>Runs</strong> tab. You'll see:</p>
<ul>
  <li>An <strong>ADW workflow</strong> selector (default: <code>adw_simple_sdlc</code>, the recommended full chain).</li>
  <li>A <strong>roster</strong> selector (which <code>sssf.config.yaml</code> to use).</li>
  <li>The <strong>approved spec</strong> path (should show <code>requests/approved-spec.md</code>).</li>
</ul>
<p>Click <strong>"Launch"</strong>. SSSF Studio invokes the factory as a subprocess: <code>uv run adws/adw_simple_sdlc.py "requests/approved-spec.md" --config ... --adw-id ...</code>. A launch log is captured for diagnostics.</p>
<div class="callout warning"><div class="callout-title">⚠️ Prerequisites for real runs</div><p>A real factory run needs the <code>pi</code> coding agent and provider API keys. If those aren't set up, the launch will fail at the factory's own validation step — SSSF Studio surfaces that error in the launch log. See <a href="#/installation">Installation</a> for how to set up <code>pi</code> and keys.</p></div>
<p>Once a run is live, select it in the sidebar to see the phase timeline, agent lanes, every event, typed envelopes, and gate results — all polled live from the factory's trace database. Switch to the <strong>"Visualizer"</strong> sub-tab to see the same data in the factory's official waterfall view.</p>

<h2>That's it</h2>
<p>You've gone from rough idea → interactive refinement → approved markdown in the repo → factory launch, all in one workspace. The rest of this manual goes deeper: <a href="#/course/module-1">the course</a> teaches you how it works under the hood, <a href="#/walkthroughs/architecture">the walkthroughs</a> show you the system visually, and <a href="#/troubleshooting">troubleshooting</a> helps when things go wrong.</p>
`
  },

  // ════════════════════════════════════════════════════════════════════════
  // INSTALLATION
  // ════════════════════════════════════════════════════════════════════════
  {
    id: "installation", group: "Start", title: "Installation", icon: "📦",
    render: () => `
<h1>Installation</h1>
<p>SSSF Studio is a Next.js web application. It runs on your machine and opens in a browser. This page covers every prerequisite, what it is, why you need it, and how to verify it works.</p>

<div class="page-toc">
  <div class="page-toc-title">On this page</div>
  <ol>
    <li><a href="#prereqs">Prerequisites overview</a></li>
    <li><a href="#node">Node.js & Bun (the app runtime)</a></li>
    <li><a href="#uv">uv (Python runner for the factory)</a></li>
    <li><a href="#pi">pi (the coding agent)</a></li>
    <li><a href="#keys">Provider API keys</a></li>
    <li><a href="#run">Running SSSF Studio</a></li>
    <li><a href="#verify">Verifying everything works</a></li>
  </ol>
</div>

<h2 id="prereqs">Prerequisites overview</h2>
<table>
  <tr><th>Tool</th><th>What it is</th><th>Needed for</th><th>Required?</th></tr>
  <tr><td>Node.js 20+</td><td>JavaScript runtime</td><td>Running the Next.js app</td><td>Yes</td></tr>
  <tr><td>Bun</td><td>Fast JS runtime & package manager</td><td>Installing deps, running the app</td><td>Yes</td></tr>
  <tr><td>uv</td><td>Python package runner</td><td>Running the factory's ADW scripts</td><td>For real runs</td></tr>
  <tr><td>pi</td><td>The coding agent harness</td><td>Agent execution inside the factory</td><td>For real runs</td></tr>
  <tr><td>Provider API keys</td><td>Keys for the LLM providers your roster uses</td><td>Agent LLM calls</td><td>For real runs</td></tr>
  <tr><td>SQLite</td><td>Embedded database</td><td>Trace storage (the factory creates it)</td><td>Automatic</td></tr>
</table>
<div class="callout concept"><div class="callout-title">📖 What's the difference between "running the app" and "real runs"?</div><p>SSSF Studio (the web app) runs on Node/Bun. The factory (the thing that actually writes code) runs on Python via <code>uv</code> and uses <code>pi</code> to drive agents. You can use the app — create workspaces, stamp the factory, write specs, edit configs, observe demo traces — without <code>pi</code> or API keys. You only need them when you click "Launch" for real.</p></div>

<h2 id="node">Node.js & Bun</h2>
<div class="callout concept"><div class="callout-title">📖 What is Node.js?</div><p>Node.js is a program that runs JavaScript outside a browser. SSSF Studio is built with Next.js, which runs on Node. Without it, your computer doesn't know how to run the app.</p></div>
<div class="callout concept"><div class="callout-title">📖 What is Bun?</div><p>Bun is a faster alternative to Node that also works as a package manager (like npm). SSSF Studio uses it to install dependencies and start the dev server. It's a single binary you install once.</p></div>

<h4>macOS / Linux</h4>
<pre><code class="lang-bash"># Install Node (via nvm, the version manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
nvm install --lts

# Install Bun
curl -fsSL https://bun.sh/install | bash</code></pre>

<h4>Windows (PowerShell)</h4>
<pre><code class="lang-powershell"># Install Node (download from https://nodejs.org, or:
winget install OpenJS.NodeJS.LTS

# Install Bun
powershell -c "irm bun.sh/install.ps1 | iex"</code></pre>

<h4>Verify</h4>
<pre><code class="lang-bash">node --version   # should print v20.x or higher
bun --version    # should print 1.x</code></pre>

<h2 id="uv">uv (Python runner)</h2>
<div class="callout concept"><div class="callout-title">📖 What is uv?</div><p><code>uv</code> is a fast Python package runner. The factory's ADW scripts start with <code>#!/usr/bin/env -S uv run</code>, which means <code>uv</code> reads each script's inline dependency list, creates an ephemeral Python environment, and runs it — no manual virtual environment management. It's like <code>npx</code> but for Python.</p></div>
<h4>macOS / Linux</h4>
<pre><code class="lang-bash">curl -LsSf https://astral.sh/uv/install.sh | sh</code></pre>
<h4>Windows (PowerShell)</h4>
<pre><code class="lang-powershell">powershell -c "irm https://astral.sh/uv/install.ps1 | iex"</code></pre>
<h4>Verify</h4>
<pre><code class="lang-bash">uv --version    # should print uv 0.x</code></pre>

<h2 id="pi">pi (the coding agent)</h2>
<div class="callout concept"><div class="callout-title">📖 What is pi?</div><p><code>pi</code> is the coding agent harness the factory uses in v1. It's a CLI that runs an LLM with tools (read, write, bash, etc.) against a codebase. The factory calls <code>pi -p --mode json</code> to run agents non-interactively, streaming JSONL events. <code>pi</code> reads its model catalog from <code>~/.pi/agent/models.json</code> and provider keys from the environment.</p></div>
<p>Install <code>pi</code> following its official instructions. After installing, register at least one model and set the matching provider key (below).</p>
<h4>Verify</h4>
<pre><code class="lang-bash">pi --list-models   # should list registered models
pi --version       # confirm it's on PATH</code></pre>
<div class="callout why"><div class="callout-title">🤔 Why do I need this?</div><p>The factory's agents are <code>pi</code> sessions. Without <code>pi</code>, <code>agents.validate()</code> fails before any session is created — the launch log will show "model pattern not found in pi --list-models". That's the factory doing its job: fail fast, don't spawn against a half-valid config.</p></div>

<h2 id="keys">Provider API keys</h2>
<p>The starter roster uses three providers, each needing a key:</p>
<table>
  <tr><th>Provider</th><th>Env var</th><th>Models in starter roster</th></tr>
  <tr><td>OpenRouter</td><td><code>OPENROUTER_API_KEY</code></td><td><code>google/gemini-3.6-flash</code></td></tr>
  <tr><td>Fireworks</td><td><code>FIREWORKS_API_KEY</code></td><td><code>fireworks/accounts/fireworks/models/kimi-k3</code></td></tr>
  <tr><td>OpenAI</td><td><code>OPENAI_API_KEY</code></td><td><code>openai/gpt-5.6-terra</code>, <code>openai/gpt-5.6-luna</code></td></tr>
</table>
<p>In SSSF Studio, go to <strong>Configuration → API keys</strong> and enter each key. They're written to the workspace's <code>.env</code> file (gitignored by the factory). The factory loads them via <code>python-dotenv</code> at run time.</p>
<div class="callout tip"><div class="callout-title">💡 One provider is fine</div><p>Point every agent at one provider and you only need one key. Set <code>defaults.model</code> and delete the per-agent <code>model:</code> overrides in the roster editor. The fastest path to a working run is one key, one model.</p></div>

<h2 id="run">Running SSSF Studio</h2>
<pre><code class="lang-bash"># From the project root
bun install
bun run dev

# Open http://localhost:3000 in your browser</code></pre>
<p>The visualizer mini-service (for the embedded run view) runs separately:</p>
<pre><code class="lang-bash">cd mini-services/visualizer
bun install
bun run build          # build the Vue frontend to dist/
PORT=4600 bun run server/index.ts &   # start the API + SPA server</code></pre>

<h2 id="verify">Verifying everything works</h2>
<ol>
  <li><strong>App loads:</strong> open <code>http://localhost:3000</code> — you see the SSSF Studio sidebar and workspace tab.</li>
  <li><strong>Workspace creates:</strong> click "New workspace", name it — a folder appears under <code>workspaces/</code>.</li>
  <li><strong>Factory stamps:</strong> click "Stamp factory" — status grid turns green.</li>
  <li><strong>Discovery works:</strong> go to Discovery, write a spec, click "Review spec" — the agent returns structured feedback (requires the LLM endpoint to be reachable).</li>
  <li><strong>Config saves:</strong> go to Configuration, change a value, click "Save roster" — the YAML file updates and stays valid.</li>
  <li><strong>Demo trace:</strong> go to Runs, click "Seed demo trace" — a 10-phase session appears in the observer.</li>
  <li><strong>Real run:</strong> with <code>pi</code> + keys set up, approve a spec and click "Launch" — phases stream live.</li>
</ol>
`
  },

  // ════════════════════════════════════════════════════════════════════════
  // FEATURES
  // ════════════════════════════════════════════════════════════════════════
  {
    id: "features-workspace", group: "Features", title: "Workspace tab", icon: "📁",
    render: () => `
<h1>Workspace tab</h1>
<p>The Workspace tab is where you manage target repos. A <strong>workspace</strong> is a directory on disk that the factory gets stamped into. Each workspace is independent — you can have many, each with its own roster, specs, and trace history.</p>

<h2>What it does</h2>
<ul>
  <li><strong>Create</strong> a new workspace (a folder is created under <code>workspaces/</code>).</li>
  <li><strong>Select</strong> an existing workspace from the sidebar.</li>
  <li><strong>Stamp</strong> the factory into the workspace using the official <code>install.py</code>.</li>
  <li><strong>See live status</strong>: factory installed, roster present, approved spec exists, trace DB exists.</li>
  <li><strong>Jump to the next step</strong> via the three shortcut cards.</li>
</ul>

<h2>The status grid</h2>
<p>Four cards show the workspace's readiness:</p>
<table>
  <tr><th>Card</th><th>Green when</th><th>What it means</th></tr>
  <tr><td>Factory stamped</td><td><code>adws/adw_modules/__init__.py</code> + config exist</td><td>The factory code is present in the repo</td></tr>
  <tr><td>Agent roster</td><td><code>sssf.config.yaml</code> exists</td><td>There's a roster the factory can read</td></tr>
  <tr><td>Approved spec</td><td><code>requests/approved-spec.md</code> exists</td><td>A spec is ready to run against</td></tr>
  <tr><td>Trace DB</td><td><code>adws/adw_data/sssf.db</code> exists</td><td>At least one run has happened (or a demo was seeded)</td></tr>
</table>

<h2>Stamping</h2>
<p>The "Stamp factory into this repo" button calls <code>uv run .claude/skills/sssf/scripts/install.py</code> from the workspace directory. This is the factory's own install script — SSSF Studio doesn't modify it. It copies:</p>
<ul>
  <li><code>adws/</code> — the ADW scripts and <code>adw_modules/</code></li>
  <li><code>adws/adw_data/prompt_engineering/</code> — the 4 starter agent prompts</li>
  <li><code>adws/adw_sssf_config/sssf.config.yaml</code> — the starter roster</li>
  <li><code>.env.sample</code> and <code>justfile</code></li>
  <li><code>.gitignore</code> entries for runtime files</li>
</ul>
<p>Existing files are skipped unless you check "Overwrite (--force)".</p>

<h2>What happens underneath</h2>
<p>SSSF Studio's <code>stampFactory()</code> function spawns <code>uv run install.py</code> with <code>cwd = workspace path</code>. The script's stdout/stderr are captured and shown in the UI. The factory code in <code>sssf-factory/</code> is the source; the stamped copy in <code>workspaces/&lt;slug&gt;/adws/</code> is the target. They're identical — stamping is a copy, not a transform.</p>
`
  },
  {
    id: "features-discovery", group: "Features", title: "Discovery tab", icon: "🧭",
    render: () => `
<h1>Discovery tab</h1>
<p>Discovery is the interactive layer the factory was missing. Its only job: produce a high-quality, human-approved markdown specification and place it in the target repo. It never touches the ADW graph.</p>

<h2>The two-panel layout</h2>
<div class="card-grid">
  <div class="card"><h4>Left: Chat</h4><p>A conversation with the Discovery agent. Click "Review spec" to get structured feedback. Ask questions, answer the agent's questions, iterate.</p></div>
  <div class="card"><h4>Right: Spec editor</h4><p>A live markdown editor. Start from the template, paste an idea, or import a .md file. Switch between Edit and Preview. Autosaves as you type.</p></div>
</div>

<h2>The Discovery agent</h2>
<p>The agent is an LLM given a system prompt that makes it a specification reviewer. When you click "Review spec", it receives:</p>
<ul>
  <li>The current spec draft</li>
  <li>Recent conversation history (for context)</li>
  <li>Your latest message (if any)</li>
  <li>A short repo summary (top-level files + README excerpt) for grounding</li>
</ul>
<p>It returns strict JSON with five sections:</p>
<table>
  <tr><th>Section</th><th>What it contains</th><th>Color</th></tr>
  <tr><td>Missing</td><td>Requirements a good spec of this request would contain</td><td>Red</td></tr>
  <tr><td>Ambiguities</td><td>Under-specified points</td><td>Amber</td></tr>
  <tr><td>Suggestions</td><td>Concrete, actionable improvements — click ✓ to append</td><td>Green</td></tr>
  <tr><td>Questions</td><td>Open questions for you to answer</td><td>Blue</td></tr>
  <tr><td>Risks</td><td>Things that could go wrong</td><td>Orange</td></tr>
</table>

<h2>Accepting suggestions</h2>
<p>Each suggestion has a ✓ button. Clicking it appends the suggestion text to your spec draft as a bullet point and dismisses the card. This is the fastest way to build up a spec: review, accept the good suggestions, answer the questions, review again.</p>

<h2>Importing a markdown file</h2>
<p>Click "Import .md" to pick a file, or drag a <code>.md</code> file directly onto the editor. The file's content replaces the current draft. Useful when you already have specs written elsewhere.</p>

<h2>Approving</h2>
<p>When you're satisfied, click "Approve specification". SSSF Studio:</p>
<ol>
  <li>Writes the markdown to <code>requests/approved-spec.md</code> in the workspace.</li>
  <li>Prepends an approval comment with a timestamp.</li>
  <li>Records the approval in the app database.</li>
  <li>Marks the session as "approved".</li>
</ol>
<p>The file is now ready for the factory to consume as its prompt.</p>

<h2>The LLM endpoint</h2>
<p>The Discovery agent calls an OpenAI-compatible chat completions endpoint. The default local gateway is <code>http://127.0.0.1:31415/v1</code>. To use another provider for this workspace, open <strong>Configuration → AI provider setup</strong> and paste its URL, model, and optional API key. App-root environment variables can provide process-wide defaults. If the endpoint is unreachable, Studio reports an error rather than silently switching providers.</p>
`
  },
  {
    id: "features-config", group: "Features", title: "Configuration tab", icon: "⚙️",
    render: () => `
<h1>Configuration tab</h1>
<p>The Configuration tab is a visual editor for <code>sssf.config.yaml</code> — the agent roster the factory reads. Changes you make here are written as valid YAML the factory consumes unchanged.</p>

<h2>Defaults section</h2>
<p>Every agent inherits these unless it overrides them:</p>
<ul>
  <li><strong>coding_agent</strong> — <code>pi</code> (v1) or <code>claude_code</code> (v2, stubbed)</li>
  <li><strong>model</strong> — always <code>provider/model-id</code> (e.g. <code>google/gemini-3.6-flash</code>)</li>
  <li><strong>thinking</strong> — reasoning effort: <code>off | minimal | low | medium | high | xhigh | max</code></li>
  <li><strong>tools</strong> — roster-wide tool allowlist (read, bash, edit, write, grep, find, ls)</li>
  <li><strong>protected_files</strong> — paths NO agent may edit unless it names them in its <code>writes</code></li>
  <li><strong>data_dir</strong> — where session runtime lives</li>
</ul>

<h2>Agent cards</h2>
<p>Each agent is a card with:</p>
<table>
  <tr><th>Field</th><th>What it means</th></tr>
  <tr><td>name</td><td>The identifier ADW scripts use (e.g. <code>planner</code>)</td></tr>
  <tr><td>purpose</td><td>One sentence: what this agent is for</td></tr>
  <tr><td>model</td><td>Override the default model (blank = inherit)</td></tr>
  <tr><td>thinking</td><td>Override the default thinking level</td></tr>
  <tr><td>color</td><td>Lane color in the visualizer (hex)</td></tr>
  <tr><td>tools</td><td>Allowlist (blank = inherit default)</td></tr>
  <tr><td>writes</td><td>What this agent may MODIFY in the repo. <code>[]</code> = read-only. Blank = unrestricted (minus protected_files)</td></tr>
  <tr><td>harness_engineering</td><td>pi extension file paths</td></tr>
</table>

<h2>Tools vs writes</h2>
<div class="callout concept"><div class="callout-title">📖 The difference matters</div><p><code>tools</code> is a capability list — what the agent CAN do. <code>writes</code> is a boundary — what the agent MAY change. <code>bash</code> runs anything (including <code>git checkout</code>), so a tool list can never enforce "this agent changes nothing." <code>writes</code> is enforced in code after every agent call: unauthorized changes are rolled back. This is the factory's safety guarantee, and SSSF Studio's editor surfaces it clearly.</p></div>

<h2>API key management</h2>
<p>The "API keys" card at the bottom shows known keys (OPENROUTER, FIREWORKS, OPENAI, GEMINI, ANTHROPIC, etc.). Enter values and click "Save keys" — they're written to the workspace's <code>.env</code> file (gitignored). The "used" tag marks keys your current roster actually references. Keys are never committed to git.</p>

<h2>Rosters</h2>
<p>You can have multiple named rosters in <code>adws/adw_sssf_config/</code>. Switch between them with the selector at the top. The "YAML" button shows a read-only preview of what will be written. "Save roster" writes the file.</p>
`
  },
  {
    id: "features-runs", group: "Features", title: "Runs tab", icon: "🚀",
    render: () => `
<h1>Runs tab</h1>
<p>The Runs tab is where you launch ADW workflows and observe them. It has three parts: a launch bar, a session list, and a detail view with three sub-tabs (Events, Launch log, Visualizer).</p>

<h2>The launch bar</h2>
<ul>
  <li><strong>ADW workflow</strong> — which factory script to run (auto-discovered from <code>adws/adw_*.py</code>). <code>adw_simple_sdlc</code> is recommended.</li>
  <li><strong>Roster config</strong> — which <code>sssf.config.yaml</code> to pass via <code>--config</code>.</li>
  <li><strong>Approved spec</strong> — shows <code>requests/approved-spec.md</code> (or a warning if none).</li>
  <li><strong>Launch</strong> — invokes the factory as a detached subprocess.</li>
</ul>

<h2>What happens when you launch</h2>
<p>SSSF Studio runs:</p>
<pre><code class="lang-bash">uv run adws/adw_simple_sdlc.py "requests/approved-spec.md" \\
  --config adws/adw_sssf_config/sssf.config.yaml \\
  --adw-id &lt;generated-id&gt;</code></pre>
<p>from the workspace directory. stdout/stderr are teed to a log file at <code>adws/adw_data/studio-logs/&lt;adw-id&gt;.log</code>. The process is detached, so the web request returns immediately. The factory's tracer writes live progress into <code>adws/adw_data/sssf.db</code> (WAL mode), which the Runs tab polls.</p>

<h2>The session list (left sidebar)</h2>
<p>Shows all trace sessions, most recent first. Each entry shows the adw_id, status, token count, cost, phase count, and a row of colored phase dots. Click one to open the detail view.</p>
<p>Launches that failed before creating a trace session (e.g. validation errors) also appear, tagged "no trace (launch only)" — click one to see its launch log.</p>

<h2>The detail view</h2>
<h3>Summary bar</h3>
<p>Status, duration, total tokens, cost, and raw read/written tokens. Below it: agent lanes showing each agent's model, color, and context window occupancy.</p>

<h3>Phase timeline</h3>
<p>Every phase as a colored chip: green (success), red (fail), amber (running). Click a phase to filter the events below to just that phase. The chip shows the phase name, owner (agent name or "git"/"quality"), and duration.</p>

<h3>Events sub-tab</h3>
<p>A chronological stream of every traced event: phase_start, agent_start, tool_call, gate_pass/gate_fail, handoff, agent_end, phase_end, error. Click any event to expand its payload JSON. Tool calls show the tool name and primary argument.</p>

<h3>Launch log sub-tab</h3>
<p>The raw stdout/stderr of the factory subprocess. Useful for diagnosing validation failures, missing keys, or <code>pi</code> errors.</p>

<h3>Visualizer sub-tab</h3>
<p>An embedded copy of the factory's official Vue visualizer. It polls the same <code>sssf.db</code> and renders the full waterfall / lane / envelope UX. It runs as a mini-service on port 4600 and is iframe-embedded with the workspace's DB path passed via query param.</p>

<h2>Seed demo trace</h2>
<p>The "Seed demo trace" button creates a realistic 10-phase trace (plan → build → test → review → document) directly into <code>sssf.db</code>. This lets you explore the observer without needing <code>pi</code> or API keys. The seeded data uses the exact same schema as a real run, so everything you see is representative.</p>
`
  },

  // ════════════════════════════════════════════════════════════════════════
  // COURSE
  // ════════════════════════════════════════════════════════════════════════
  {
    id: "course-intro", group: "Learn", title: "Course intro", icon: "📚",
    render: () => `
<h1>Learn This Project — Course</h1>
<p>This is a 6-module interactive course that teaches you how SSSF Studio works, starting from what you can see and progressively going deeper. Each module ends with a short quiz to check your understanding. There's no score — quizzes are feedback, not tests. Wrong answers teach rather than shame.</p>

<h2>How to use this course</h2>
<ul>
  <li><strong>See it</strong> — each module starts with something observable.</li>
  <li><strong>Learn it</strong> — then explains what's happening underneath.</li>
  <li><strong>Try it</strong> — points you to the real app to try the thing.</li>
  <li><strong>Check it</strong> — a quiz confirms you understood.</li>
  <li><strong>Go deeper</strong> — links to walkthroughs and source files.</li>
</ul>

<h2>The modules</h2>
<ol>
  <li><a href="#/course/module-1">What happens when you approve a spec</a> — the bridge between Discovery and the factory</li>
  <li><a href="#/course/module-2">The factory as a black box</a> — what SSSF Studio doesn't touch and why</li>
  <li><a href="#/course/module-3">How the Discovery agent thinks</a> — the system prompt, the feedback structure, the LLM call</li>
  <li><a href="#/course/module-4">The trace database</a> — how live observability works via SQLite WAL</li>
  <li><a href="#/course/module-5">How launches work</a> — subprocess spawning, log capture, polling</li>
  <li><a href="#/course/module-6">How to safely modify SSSF Studio</a> — where to make common changes</li>
</ol>

<p>Start with <a href="#/course/module-1">Module 1</a>.</p>
`
  },
];

// Course modules with quizzes — appended separately for readability.
// Each module is a page with a quiz at the end.
COURSE_MODULES = [
  {
    id: "course/module-1", group: "Learn", title: "Module 1: Approve a spec", icon: "📝",
    render: () => `
<h1>Module 1 — What happens when you approve a spec</h1>
<p class="lead" style="color:var(--fg-muted);">Start with the single most important action in SSSF Studio: clicking "Approve specification".</p>

<h2>See it</h2>
<p>Open the Discovery tab. Write something in the spec editor. Click "Approve specification". A toast says "Spec approved → requests/approved-spec.md". The button changes to an "Approved" badge.</p>

<h2>Learn it</h2>
<p>Underneath, three things happen in sequence:</p>
<ol>
  <li><strong>A file is written.</strong> Your markdown draft (with an approval timestamp comment prepended) is saved to <code>requests/approved-spec.md</code> inside the workspace directory on disk.</li>
  <li><strong>The session is marked approved.</strong> The DiscoverySession row in the app's SQLite database gets <code>status = "approved"</code>.</li>
  <li><strong>An approval record is created.</strong> A row in the <code>Approval</code> table logs the path, title, and a preview — so you have a history of what was decided and when.</li>
</ol>

<p>The factory never knows this happened. It will later read the file by path when you launch a run. This separation is deliberate:</p>
<div class="callout why"><div class="callout-title">🤔 Why a file, not an API call?</div><p>The factory reads its prompt from a file path — that's its contract. By writing the approved spec into the repo as a file, SSSF Studio bridges the interactive layer and the execution layer without coupling them. The factory doesn't import SSSF Studio's code; SSSF Studio doesn't modify the factory. The markdown file IS the integration point.</p></div>

<h2>Try it</h2>
<ol>
  <li>Go to the Discovery tab in the app.</li>
  <li>Write a one-sentence spec.</li>
  <li>Click "Approve specification".</li>
  <li>Open your workspace folder (<code>workspaces/&lt;slug&gt;/requests/approved-spec.md</code>) in a text editor — your spec is there.</li>
</ol>

<h2>The actual code</h2>
<p>The approval lives in <code>src/app/api/workspaces/[slug]/discovery/[sid]/approve/route.ts</code>. The core of it:</p>
<pre><code class="lang-typescript">const specPath = join(row.path, APPROVED_SPEC_REL);  // "requests/approved-spec.md"
mkdirSync(dirname(specPath), { recursive: true });
const header = "&lt;!-- Approved via SSSF Studio on " + new Date().toISOString() + " -->\\n";
writeFileSync(specPath, header + specDraft, "utf-");

await db.discoverySession.update({ where: { id: session.id }, data: { status: "approved", specDraft } });
const approval = await db.approval.create({ data: { workspaceId: row.id, specPath: APPROVED_SPEC_REL, ... } });</code></pre>
<p>That's it. A file write, a database update, a history record. No factory code touched.</p>

<h2>Check it</h2>
${quiz("approve-1", "When you click 'Approve specification', what exactly gets written to the target repo?", [
  { text: "A JSON file with the spec and approval metadata", correct: false, feedback: "No — it's a markdown file, not JSON. The factory reads plain markdown." },
  { text: "A markdown file at requests/approved-spec.md, with a timestamp comment prepended", correct: true, feedback: "Correct. The file is plain markdown with an HTML comment header. The factory reads it as its prompt." },
  { text: "A copy of the sssf.config.yaml with the spec embedded", correct: false, feedback: "No — the config and the spec are separate files. The config defines the roster; the spec is the prompt." },
  { text: "Nothing is written to disk — it's saved in the app database only", correct: false, feedback: "No — a real file is written so the factory can read it by path. The database records the approval, but the file is the source of truth." },
])}

${quiz("approve-2", "Why does SSSF Studio write the spec as a file in the repo rather than passing it to the factory via an API or CLI argument?", [
  { text: "Because the factory can't read CLI arguments", correct: false, feedback: "The factory CAN read a prompt from a CLI argument or a file path. The file approach is a design choice, not a limitation." },
  { text: "To keep the interactive layer (SSSF Studio) decoupled from the execution layer (the factory) — the file is the contract between them", correct: true, feedback: "Correct. The factory doesn't know SSSF Studio exists. It just reads a file. SSSF Studio doesn't modify the factory. The markdown file is the integration point." },
  { text: "Because files are faster than API calls", correct: false, feedback: "Speed isn't the reason. The reason is architectural decoupling." },
])}

<h2>Go deeper</h2>
<ul>
  <li><a href="#/walkthroughs/discovery-flow">Walkthrough: Discovery → approval → launch flow</a></li>
  <li>Source: <code>src/app/api/workspaces/[slug]/discovery/[sid]/approve/route.ts</code></li>
  <li><a href="#/course/module-2">Next: Module 2 — The factory as a black box</a></li>
</ul>
`
  },
  {
    id: "course/module-2", group: "Learn", title: "Module 2: The factory as a black box", icon: "📦",
    render: () => `
<h1>Module 2 — The factory as a black box</h1>
<p class="lead" style="color:var(--fg-muted);">SSSF Studio treats the Super Simple Software Factory as a reliable black-box execution engine. This module explains what that means and why it matters.</p>

<h2>See it</h2>
<p>Go to the Runs tab and click "Seed demo trace". A 10-phase session appears. That trace was produced by the factory — SSSF Studio only reads it. Now click "Launch" (without <code>pi</code> installed, it'll fail). The error in the launch log comes FROM the factory, not from SSSF Studio. SSSF Studio just surfaces it.</p>

<h2>Learn it</h2>
<p>The factory is a collection of Python scripts that live in <code>adws/</code> inside each stamped workspace. The key pieces:</p>
<table>
  <tr><th>Piece</th><th>What it does</th></tr>
  <tr><td><code>adw_*.py</code></td><td>ADW scripts — each one is a workflow (plan → build → test → review → document)</td></tr>
  <tr><td><code>adw_modules/</code></td><td>The engine: config loading, agent execution, tracing, permissions, quality gates</td></tr>
  <tr><td><code>adw_sssf_config/sssf.config.yaml</code></td><td>The agent roster</td></tr>
  <tr><td><code>adw_data/sssf.db</code></td><td>The SQLite trace database (WAL mode)</td></tr>
  <tr><td><code>adw_data/sessions/</code></td><td>Per-run session directories with prompts, raw output, envelopes</td></tr>
</table>

<p>SSSF Studio's relationship to all of this:</p>
<ul>
  <li><strong>Reads</strong> the config YAML (to power the visual editor).</li>
  <li><strong>Writes</strong> the config YAML (when you save).</li>
  <li><strong>Writes</strong> <code>requests/approved-spec.md</code> (when you approve).</li>
  <li><strong>Writes</strong> <code>.env</code> (when you set API keys).</li>
  <li><strong>Invokes</strong> <code>uv run adws/&lt;adw&gt;.py ...</code> as a subprocess (when you launch).</li>
  <li><strong>Reads</strong> <code>sssf.db</code> (to power the run observer).</li>
</ul>
<p>It never imports <code>adw_modules</code>, never modifies <code>adw_*.py</code>, and never touches <code>adw_data/sessions/</code> (the run record).</p>

<div class="callout concept"><div class="callout-title">📖 What does "black box" mean here?</div><p>A black box is a system where you know the inputs and outputs but don't need to understand the internals to use it. SSSF Studio knows: "give it a spec file, a config, and an adw-id, and it writes a trace DB." What happens inside is the factory's business. This means SSSF Studio works with any future factory version that respects the same contract.</p></div>

<h2>Try it</h2>
<ol>
  <li>Open <code>workspaces/&lt;your-workspace&gt;/adws/adw_simple_sdlc.py</code> in a text editor. Read the docstring — it describes the phase chain.</li>
  <li>Open <code>adws/adw_modules/tracer.py</code> — that's where the trace DB schema lives. SSSF Studio's <code>src/lib/sssf/trace.ts</code> reads that exact schema.</li>
  <li>Notice: SSSF Studio's trace reader mirrors the schema but doesn't import the Python. It's a parallel TypeScript reader.</li>
</ol>

<h2>Check it</h2>
${quiz("bbox-1", "Which of these does SSSF Studio NEVER do?", [
  { text: "Read sssf.db to show run progress", correct: false, feedback: "It does this — that's how the Runs observer works." },
  { text: "Write requests/approved-spec.md into the target repo", correct: false, feedback: "It does this — that's the approval action." },
  { text: "Modify adw_modules/ Python code to add a new gate", correct: true, feedback: "Correct. SSSF Studio never modifies the factory's code. The factory is a black box. To add a gate, you'd edit the factory directly (outside SSSF Studio)." },
  { text: "Invoke uv run adws/adw_simple_sdlc.py as a subprocess", correct: false, feedback: "It does this — that's the launch action." },
])}

${quiz("bbox-2", "If the factory team releases a new ADW called adw_super_sdlc.py, what does SSSF Studio need to do to support it?", [
  { text: "Write a new API route and UI component specifically for it", correct: false, feedback: "No — SSSF Studio auto-discovers ADWs by listing adws/adw_*.py. No code change needed." },
  { text: "Nothing — it auto-discovers any adw_*.py file in the stamped repo and shows it in the Runs selector", correct: true, feedback: "Correct. listAdws() reads the directory and parses each script's docstring for the phase chain and REQUIRED_AGENTS. New ADWs appear automatically after stamping." },
  { text: "Restart the visualizer mini-service", correct: false, feedback: "No — the visualizer is independent of which ADWs exist." },
])}

<h2>Go deeper</h2>
<ul>
  <li><a href="#/walkthroughs/architecture">Walkthrough: Architecture</a></li>
  <li>Source: <code>src/lib/sssf/factory.ts</code> (listAdws, stampFactory)</li>
  <li>Factory source: <code>sssf-factory/adws/adw_simple_sdlc.py</code></li>
  <li><a href="#/course/module-3">Next: Module 3 — How the Discovery agent thinks</a></li>
</ul>
`
  },
  {
    id: "course/module-3", group: "Learn", title: "Module 3: The Discovery agent", icon: "🤖",
    render: () => `
<h1>Module 3 — How the Discovery agent thinks</h1>
<p class="lead" style="color:var(--fg-muted);">The Discovery agent is the only AI component SSSF Studio adds. This module opens the box and shows you exactly how it works.</p>

<h2>See it</h2>
<p>In the app, go to Discovery, share an idea by speaking, pasting, or choosing a file, then click "Review spec". Five colored cards appear: Missing, Ambiguities, Suggestions, Questions, Risks. That structured output is not magic — it's a system prompt.</p>

<h2>Learn it</h2>
<p>The Discovery agent is an LLM (large language model) called via an OpenAI-compatible chat completions endpoint. The default is a local gateway; each workspace can set its endpoint, model, and optional key in <strong>Configuration → AI provider setup</strong>. No API key is hard-coded in source. The agent's behavior is defined by its <strong>system prompt</strong> — instructions that tell the LLM what role to play and what format to return.</p>

<h3>The system prompt (abridged)</h3>
<pre><code class="lang-text">You are the SSSF Studio Discovery agent — an interactive specification
reviewer that sits BEFORE the Super Simple Software Factory runs.

Your job: turn a rough idea into a high-quality, human-approved markdown
specification. You never write code and you never launch anything.

You return ONLY a JSON object with this exact shape:
{
  "summary": "...",
  "missing":   [...],
  "ambiguities": [...],
  "suggestions": [...],
  "questions":   [...],
  "risks":       [...]
}

Rules:
- Be specific and grounded in what the draft actually says.
- "suggestions" must be concrete enough to act on.
- Output ONLY the JSON object. No prose, no markdown fences.</code></pre>

<p>The user message sent to the LLM combines: the repo context (top-level files + README excerpt), recent conversation, your latest message, and the current spec draft. The LLM returns text; <code>parseFeedback()</code> extracts the JSON object (handling code fences and leading/trailing prose) and turns it into the five cards you see.</p>

<div class="callout concept"><div class="callout-title">📖 What is a system prompt?</div><p>A system prompt is the first message in an LLM conversation, setting the model's role and rules. Unlike the user messages (which change each turn), the system prompt stays the same. It's how you turn a general-purpose LLM into a specification reviewer, a coding assistant, or anything else. The quality of the system prompt determines the quality of the output.</p></div>

<h2>Why JSON, not prose?</h2>
<p>The feedback needs to be structured so the UI can render it as typed cards (each with its own color and actions). If the agent returned prose, you'd have to read a wall of text. By forcing JSON, each piece of feedback is actionable: suggestions get ✓ buttons, questions get answered in chat, risks get acknowledged. The system prompt enforces this by saying "Output ONLY the JSON object."</p>

<h2>The chat fallback</h2>
<p>When you send a message (not a review request), a different system prompt is used. The model replies conversationally and returns JSON containing both its message and the complete updated proposal. Studio saves the proposal so the conversation can refine it as you confirm details.</p>

<h2>Try it</h2>
<ol>
  <li>Read the full system prompt in <code>src/lib/sssf/discovery.ts</code> (the <code>SYSTEM_PROMPT</code> constant).</li>
  <li>In the app, share a deliberately vague idea (e.g. "make the app better") by speaking or pasting, then click "Review spec". Notice the agent returns mostly Questions and Ambiguities — it can't review what isn't there.</li>
  <li>Answer questions and confirm details in the conversation. Review again and notice how the feedback becomes more specific.</li>
</ol>

<h2>Check it</h2>
${quiz("agent-1", "What makes the Discovery agent return structured JSON instead of prose?", [
  { text: "A JSON parsing library that converts the LLM's prose into JSON", correct: false, feedback: "No — the parsing library only extracts JSON that's already there. It can't convert prose into structured data." },
  { text: "The system prompt instructs the LLM to return ONLY a JSON object with a specific shape", correct: true, feedback: "Correct. The system prompt is the entire mechanism. The LLM is told its role, the exact JSON shape, and 'Output ONLY the JSON object.' parseFeedback() then extracts it." },
  { text: "A fine-tuned model that only outputs JSON", correct: false, feedback: "No — the agent uses a general-purpose LLM (model 'auto'). No fine-tuning. The system prompt does all the work." },
])}

${quiz("agent-2", "If the LLM endpoint is unreachable, what happens?", [
  { text: "The app crashes", correct: false, feedback: "No — the error is caught and returned as a clean JSON error message." },
  { text: "The review button spins forever", correct: false, feedback: "No — it stops and shows an error toast." },
  { text: "The API returns a clean error: 'Could not reach the LLM gateway at...' and the UI shows it as a toast", correct: true, feedback: "Correct. chatCompletion() catches fetch failures and throws a helpful message. The review route catches that and returns it as JSON. The UI shows it as a toast. No crash, no hang." },
])}

<h2>Go deeper</h2>
<ul>
  <li>Source: <code>src/lib/sssf/discovery.ts</code> (system prompt, reviewSpec, chatReply, parseFeedback)</li>
  <li>Source: <code>src/lib/sssf/llm.ts</code> (the LLM call; credentials are supplied through environment/workspace settings)</li>
  <li><a href="#/course/module-4">Next: Module 4 — The trace database</a></li>
</ul>
`
  },
  {
    id: "course/module-4", group: "Learn", title: "Module 4: The trace database", icon: "🗄️",
    render: () => `
<h1>Module 4 — The trace database</h1>
<p class="lead" style="color:var(--fg-muted);">How does SSSF Studio show you live run progress? It reads a SQLite database the factory writes to. This module explains the schema and the polling mechanism.</p>

<h2>See it</h2>
<p>Go to Runs, seed a demo trace, click it. Everything you see — the phases, the events, the envelopes, the gates, the token counts — comes from one file: <code>adws/adw_data/sssf.db</code>.</p>

<h2>Learn it</h2>
<p>The factory's tracer (<code>adw_modules/tracer.py</code>) writes every event to a SQLite database in WAL (Write-Ahead Logging) mode. WAL means readers never block writers — the factory can insert events while SSSF Studio reads them, with no locks and no waiting.</p>

<div class="callout concept"><div class="callout-title">📖 What is WAL mode?</div><p>WAL (Write-Ahead Logging) is a SQLite journaling mode. Instead of writing changes directly to the database file (which locks it), changes are written to a separate <code>-wal</code> file first. Readers read the database plus the WAL file, seeing the latest state. Writers append to the WAL. They never block each other. This is what makes live polling possible: the factory writes events as they happen, and SSSF Studio reads them a fraction of a second later, with no conflict.</p></div>

<h3>The schema (key tables)</h3>
<table>
  <tr><th>Table</th><th>What it holds</th><th>Who writes it</th></tr>
  <tr><td><code>sessions</code></td><td>One row per run: adw_id, status, tokens, cost</td><td>Factory tracer</td></tr>
  <tr><td><code>phases</code></td><td>Each phase: name, kind, owner, status, timing</td><td>Factory tracer</td></tr>
  <tr><td><code>events</code></td><td>Every traced event: phase_start, tool_call, gate_pass, etc.</td><td>Factory tracer</td></tr>
  <tr><td><code>envelopes</code></td><td>Typed agent outputs (PlanOutput, BuildOutput, etc.)</td><td>Factory tracer</td></tr>
  <tr><td><code>gate_results</code></td><td>Gate verdicts with checks and violations</td><td>Factory tracer</td></tr>
  <tr><td><code>agent_sessions</code></td><td>Per-agent model, color, context window occupancy</td><td>Factory tracer</td></tr>
  <tr><td><code>processes</code></td><td>Live PIDs for stuck-run detection</td><td>Factory tracer</td></tr>
</table>

<p>SSSF Studio's reader (<code>src/lib/sssf/trace.ts</code>) opens the database <strong>readonly</strong> and runs SELECT queries. It mirrors the schema but doesn't import the Python — it's a parallel TypeScript implementation using <code>better-sqlite3</code>.</p>

<h2>How polling works</h2>
<p>The Runs tab polls on a timer:</p>
<ul>
  <li><strong>Session list:</strong> every 4 seconds, fetches all sessions (lightweight).</li>
  <li><strong>Active session detail:</strong> every 1.5 seconds while running, every 8 seconds when done.</li>
  <li><strong>Events:</strong> uses a rowid cursor — "give me events after rowid X". Only new events come back. This is efficient even for long runs.</li>
</ul>
<p>There's no WebSocket, no push. The data path is always: factory → SQLite → poll. Simple, reliable, debuggable.</p>

<h2>Try it</h2>
<ol>
  <li>Seed a demo trace.</li>
  <li>Open a terminal and run: <code>sqlite3 workspaces/&lt;slug&gt;/adws/adw_data/sssf.db "SELECT name, status FROM phases;"</code> — see the raw data.</li>
  <li>Compare with what the Runs tab shows. Same data, different presentation.</li>
</ol>

<h2>Check it</h2>
${quiz("trace-1", "Why does SSSF Studio open the trace database in readonly mode?", [
  { text: "Because it's faster", correct: false, feedback: "Readonly isn't meaningfully faster for SELECTs. The reason is safety." },
  { text: "To guarantee SSSF Studio can never accidentally corrupt a running factory's trace data — only the factory writes", correct: true, feedback: "Correct. The factory's tracer is the sole writer. SSSF Studio only reads. Readonly mode enforces this at the database level — even a bug in SSSF Studio can't modify the trace." },
  { text: "Because SQLite doesn't allow concurrent writes", correct: false, feedback: "SQLite does allow concurrent writes (one at a time, with busy_timeout). The reason is separation of concerns, not a SQLite limitation." },
])}

${quiz("trace-2", "How does the events polling avoid re-downloading all events every time?", [
  { text: "It uses a WebSocket and only receives new events", correct: false, feedback: "No — there's no WebSocket. The data path is poll-based." },
  { text: "It uses a rowid cursor: 'give me events WHERE rowid > last_seen'", correct: true, feedback: "Correct. Each response includes a cursor (the last rowid). The next poll passes that cursor, so only events AFTER it come back. Efficient even for runs with thousands of events." },
  { text: "It downloads all events and filters client-side", correct: false, feedback: "No — that would be wasteful for long runs. The filtering happens in SQL." },
])}

<h2>Go deeper</h2>
<ul>
  <li><a href="#/walkthroughs/trace-flow">Walkthrough: Trace data flow</a></li>
  <li>Source: <code>src/lib/sssf/trace.ts</code> (the readonly reader)</li>
  <li>Factory source: <code>sssf-factory/adws/adw_modules/tracer.py</code> (the schema)</li>
  <li><a href="#/course/module-5">Next: Module 5 — How launches work</a></li>
</ul>
`
  },
  {
    id: "course/module-5", group: "Learn", title: "Module 5: How launches work", icon: "🚀",
    render: () => `
<h1>Module 5 — How launches work</h1>
<p class="lead" style="color:var(--fg-muted);">When you click "Launch", SSSF Studio starts a subprocess and watches it. This module traces exactly what happens.</p>

<h2>See it</h2>
<p>Go to Runs. If you have <code>pi</code> + keys set up, approve a spec and click "Launch". If not, click "Seed demo trace" to see what a completed run looks like. Either way, the run appears in the session list within seconds.</p>

<h2>Learn it</h2>
<p>The launch function lives in <code>src/lib/sssf/launch.ts</code>. Here's what it does, step by step:</p>
<ol>
  <li><strong>Validates</strong> the ADW exists in the repo, the spec file exists, and the config exists.</li>
  <li><strong>Generates an adw-id</strong> — a short random hex string like <code>s1a2b3c4</code>.</li>
  <li><strong>Creates a log file</strong> at <code>adws/adw_data/studio-logs/&lt;adw-id&gt;.log</code>.</li>
  <li><strong>Spawns the subprocess</strong>: <code>uv run adws/&lt;adw&gt;.py "&lt;spec-path&gt;" --config &lt;cfg&gt; --adw-id &lt;id&gt;</code> with <code>cwd = workspace</code>.</li>
  <li><strong>Pipes stdout/stderr</strong> to the log file in real time.</li>
  <li><strong>Detaches</strong> the child process (<code>child.unref()</code>) so the web request can return immediately.</li>
  <li><strong>Records a Launch row</strong> in the app database with the pid and log path.</li>
</ol>

<pre><code class="lang-typescript">const child = spawn("uv",
  ["run", "adws/" + adw + ".py", specPath, "--config", configPath, "--adw-id", adwId],
  { cwd: repoPath, env, detached: true, stdio: ["ignore", "pipe", "pipe"] }
);
child.stdout.on("data", d => appendToLog("stdout", d));
child.stderr.on("data", d => appendToLog("stderr", d));
child.unref();  // let the web request return</code></pre>

<p>From this point, two things run in parallel:</p>
<ul>
  <li><strong>The factory subprocess</strong> writes events to <code>sssf.db</code> as it works.</li>
  <li><strong>The Runs tab</strong> polls <code>sssf.db</code> every 1.5 seconds and renders new phases/events.</li>
</ul>
<p>They communicate through the database. SSSF Studio never talks to the factory process directly after spawning it.</p>

<div class="callout concept"><div class="callout-title">📖 What is a detached subprocess?</div><p>Normally, a child process dies when its parent dies. <code>detached: true</code> puts the child in its own process group, and <code>child.unref()</code> tells Node "I'm done with this — don't keep the event loop alive for it." The result: the factory keeps running even if the web request that started it has returned, and even if you close the browser. The run completes on its own.</p></div>

<h2>What if the launch fails?</h2>
<p>If the factory's <code>agents.validate()</code> fails (e.g. a model not registered with <code>pi</code>, or a missing key), the subprocess exits with code 1 BEFORE creating a trace session. The launch log captures the error. SSSF Studio shows these launches in the session list tagged "no trace (launch only)" — click one to see the log and the factory's error message.</p>

<h2>Try it</h2>
<ol>
  <li>Without <code>pi</code> installed, approve a spec and click "Launch".</li>
  <li>Wait a few seconds. A new entry appears in the session list tagged "no trace".</li>
  <li>Click it. The "Launch log" sub-tab shows the factory's validation error verbatim.</li>
  <li>Open <code>workspaces/&lt;slug&gt;/adws/adw_data/studio-logs/</code> — the log file is there.</li>
</ol>

<h2>Check it</h2>
${quiz("launch-1", "After SSSF Studio spawns the factory subprocess, how does it know what phase the run is on?", [
  { text: "It reads the subprocess's stdout line by line", correct: false, feedback: "No — stdout goes to the log file, not to the Runs UI. The UI doesn't parse stdout." },
  { text: "It polls sssf.db, which the factory's tracer writes events to as they happen", correct: true, feedback: "Correct. The factory writes events to SQLite (WAL mode). SSSF Studio polls that database every 1.5 seconds. They communicate through the database, not through pipes." },
  { text: "It uses a WebSocket connection to the factory", correct: false, feedback: "No — there's no WebSocket. The data path is factory → SQLite → poll." },
])}

${quiz("launch-2", "What happens if you close your browser while a run is in progress?", [
  { text: "The run is killed immediately", correct: false, feedback: "No — the subprocess is detached. It doesn't depend on the browser." },
  { text: "The run continues to completion; when you reopen the app, you'll see its final state in the session list", correct: true, feedback: "Correct. child.unref() means the factory runs independently. The tracer writes to sssf.db regardless of whether anyone is watching. Reopen the app later and the run is there." },
  { text: "The run pauses and resumes when you reopen", correct: false, feedback: "No — the factory doesn't pause. It runs to completion. You just see the result when you return." },
])}

<h2>Go deeper</h2>
<ul>
  <li><a href="#/walkthroughs/launch-flow">Walkthrough: Launch flow</a></li>
  <li>Source: <code>src/lib/sssf/launch.ts</code></li>
  <li><a href="#/course/module-6">Next: Module 6 — How to safely modify SSSF Studio</a></li>
</ul>
`
  },
  {
    id: "course/module-6", group: "Learn", title: "Module 6: Safe modifications", icon: "🔧",
    render: () => `
<h1>Module 6 — How to safely modify SSSF Studio</h1>
<p class="lead" style="color:var(--fg-muted);">If you want to extend SSSF Studio, this module tells you where to look and what's safe to change.</p>

<h2>The rule</h2>
<div class="callout warning"><div class="callout-title">⚠️ The golden rule</div><p>Never modify anything inside <code>sssf-factory/</code> or inside a workspace's <code>adws/</code> directory. The factory is a black box. SSSF Studio talks to it through files and subprocesses, not by modifying its code. If you change the factory, you void the contract.</p></div>

<h2>What's safe to change</h2>
<table>
  <tr><th>You want to…</th><th>Look at</th><th>Safe?</th></tr>
  <tr><td>Change the LLM endpoint/model</td><td><code>src/lib/sssf/llm.ts</code></td><td>✅ Yes</td></tr>
  <tr><td>Tweak the Discovery agent's behavior</td><td><code>src/lib/sssf/discovery.ts</code> (SYSTEM_PROMPT)</td><td>✅ Yes</td></tr>
  <tr><td>Add a new tab</td><td><code>src/components/sssf/</code> + AppShell TABS</td><td>✅ Yes</td></tr>
  <tr><td>Change the UI theme</td><td><code>src/app/globals.css</code></td><td>✅ Yes</td></tr>
  <tr><td>Add a new API route</td><td><code>src/app/api/...</code></td><td>✅ Yes</td></tr>
  <tr><td>Change the trace DB schema</td><td><code>sssf-factory/adws/adw_modules/tracer.py</code></td><td>❌ No — that's factory code</td></tr>
  <tr><td>Add a new ADW</td><td><code>adws/adw_*.py</code> in the factory repo</td><td>⚠️ Factory team's job</td></tr>
  <tr><td>Change how agents are called</td><td><code>adws/adw_modules/agents.py</code></td><td>❌ No — factory code</td></tr>
</table>

<h2>Common modification patterns</h2>

<h3>Change the Discovery agent's personality</h3>
<p>Edit <code>SYSTEM_PROMPT</code> in <code>src/lib/sssf/discovery.ts</code>. For example, to make it focus more on security, add a rule like "Always include a security review section." The JSON shape must stay the same (the UI expects those five keys), but you can change what the agent looks for within each.</p>

<h3>Point the Discovery agent at a different LLM</h3>
<p>For normal use, open <strong>Configuration → AI provider setup</strong> and paste the workspace endpoint, optional API key, and model. App-root environment variables can provide process-wide defaults for development:</p>
<pre><code class="lang-bash">LLM_BASE_URL=http://my-llm-server/v1 \\
LLM_API_KEY=my-key \\
LLM_MODEL=gpt-4o \\
bun run dev</code></pre>
<p>Workspace settings override the defaults without changing source code.</p>

<h3>Add a new onboarding tour step</h3>
<p>Edit <code>TOUR_STEPS</code> in <code>src/lib/tour-store.ts</code>. Add a <code>data-tour="your-id"</code> attribute to the target element in the relevant component, then add a step pointing at it.</p>

<h3>Add a new data field to the trace reader</h3>
<p>If the factory adds a new column (via migration), update <code>src/lib/sssf/trace.ts</code> to read it. The reader already handles optional columns gracefully (via <code>hasColumn()</code>).</p>

<h2>Try it</h2>
<ol>
  <li>Open <code>src/lib/sssf/discovery.ts</code>.</li>
  <li>In <code>SYSTEM_PROMPT</code>, add a line: "Always include at least one suggestion about testing."</li>
  <li>Save. The app hot-reloads.</li>
  <li>Go to Discovery, review a spec. Notice the suggestions now include testing advice.</li>
</ol>

<h2>Check it</h2>
${quiz("mod-1", "You want the Discovery agent to also return a 'security' section. What do you change?", [
  { text: "The factory's agent code in adw_modules/agents.py", correct: false, feedback: "No — the Discovery agent is NOT a factory agent. It lives entirely in SSSF Studio." },
  { text: "The SYSTEM_PROMPT in src/lib/sssf/discovery.ts, and the UI in DiscoveryTab.tsx to render the new section", correct: true, feedback: "Correct. The system prompt tells the LLM to include the new key in its JSON. The UI needs a new card to render it. Both are in SSSF Studio's code — no factory changes." },
  { text: "The sssf.config.yaml roster to add a 'security' agent", correct: false, feedback: "No — the Discovery agent isn't in the roster. It's a pre-factory interactive layer." },
])}

${quiz("mod-2", "Why is it safe to change src/lib/sssf/llm.ts but NOT sssf-factory/adws/adw_modules/tracer.py?", [
  { text: "Because llm.ts is TypeScript and tracer.py is Python", correct: false, feedback: "The language isn't the reason. The reason is architectural ownership." },
  { text: "Because llm.ts is SSSF Studio's own code (the control layer), while tracer.py is the factory's code (the execution engine). SSSF Studio is allowed to change itself; it's not allowed to change the factory.", correct: true, feedback: "Correct. SSSF Studio owns the UI, the API, the Discovery agent, and the launch/trace readers. The factory owns the ADW scripts, the modules, the tracer, and the config schema. Crossing that boundary breaks the contract." },
])}

<h2>Congratulations</h2>
<p>You've finished the course. You now understand: the approval bridge (M1), the black-box contract (M2), the Discovery agent (M3), the trace database (M4), the launch mechanism (M5), and safe modifications (M6).</p>
<p>Next steps: <a href="#/walkthroughs/architecture">see the system visually</a>, read the <a href="#/glossary">glossary</a>, or go back to the <a href="#/home">home page</a>.</p>
`
  },
];

// Append course modules to PAGES
PAGES.push(...COURSE_MODULES);

// ════════════════════════════════════════════════════════════════════════
// WALKTHROUGHS
// ════════════════════════════════════════════════════════════════════════
PAGES.push(
  {
    id: "walkthroughs/architecture", group: "See", title: "Architecture", icon: "🗺️",
    render: () => `
<h1>Walkthrough — Architecture</h1>
<p>The big picture: how SSSF Studio, the factory, and the target repo relate.</p>

<div class="mermaid">
graph TB
    subgraph "SSSF Studio (Next.js app)"
      UI[Web UI<br/>4 tabs]
      API[API routes]
      DB[(App DB<br/>Prisma/SQLite)]
      LLM[Discovery agent<br/>LLM helper]
    end
    subgraph "Target repo (workspace)"
      ADWS[adws/<br/>ADW scripts]
      MODS[adw_modules/<br/>the engine]
      CFG[sssf.config.yaml<br/>the roster]
      SPEC[requests/<br/>approved-spec.md]
      ENV[.env<br/>API keys]
      TRDB[(adw_data/sssf.db<br/>trace DB)]
      LOGS[studio-logs/<br/>launch logs]
    end
    UI --> API
    API --> DB
    API --> LLM
    API -->|stamp| ADWS
    API -->|write config| CFG
    API -->|write spec| SPEC
    API -->|write keys| ENV
    API -->|launch: uv run| ADWS
    ADWS --> MODS
    MODS -->|read| CFG
    MODS -->|read| SPEC
    MODS -->|read keys| ENV
    MODS -->|write events| TRDB
    API -->|poll readonly| TRDB
    API -->|read| LOGS
    style UI fill:#3a2e28,color:#ebe7df
    style LLM fill:#3a2e28,color:#ebe7df
    style TRDB fill:#2f2d2a,color:#ebe7df
    style SPEC fill:#2f2d2a,color:#ebe7df
    style CFG fill:#2f2d2a,color:#ebe7df
</div>
<div class="mermaid-caption">SSSF Studio (left) talks to the target repo (right) through files and subprocesses. The factory writes the trace DB; SSSF Studio reads it. They never share code.</div>

<h2>Key relationships</h2>
<ul>
  <li><strong>SSSF Studio → Target repo:</strong> writes config, spec, .env; invokes ADW scripts as subprocess; reads trace DB.</li>
  <li><strong>Factory → Target repo:</strong> reads config, spec, .env; writes trace DB and session directories.</li>
  <li><strong>SSSF Studio ↛ Factory code:</strong> never imports, never modifies <code>adw_modules/</code> or <code>adw_*.py</code>.</li>
  <li><strong>Discovery agent → LLM endpoint:</strong> calls an OpenAI-compatible API. The factory's agents (via <code>pi</code>) are separate and use the roster's models.</li>
</ul>

<h2>Process boundaries</h2>
<div class="mermaid">
graph LR
    subgraph "Process 1: Next.js dev server"
      APP[SSSF Studio<br/>port 3000]
    end
    subgraph "Process 2: Visualizer mini-service"
      VIZ[Bun server<br/>port 4600]
    end
    subgraph "Process 3: Factory subprocess (per launch)"
      FACT[uv run adw_*.py<br/>detached]
    end
    subgraph "Process 4: pi agent (per agent phase)"
      PI[pi -p --mode json<br/>child of factory]
    end
    APP -->|iframe + XTransformPort| VIZ
    APP -->|spawn detached| FACT
    FACT -->|spawn| PI
    FACT -->|write| TRDB[(sssf.db)]
    APP -->|poll readonly| TRDB
    VIZ -->|readonly| TRDB
    style APP fill:#3a2e28,color:#ebe7df
    style VIZ fill:#2f2d2a,color:#ebe7df
    style FACT fill:#2f2d2a,color:#ebe7df
    style TRDB fill:#3a3833,color:#ebe7df
</div>
<div class="mermaid-caption">Four process types. The factory and its pi children are detached — they run independently of the web server.</div>
`
  },
  {
    id: "walkthroughs/discovery-flow", group: "See", title: "Discovery → Launch flow", icon: "🔄",
    render: () => `
<h1>Walkthrough — Discovery → Approval → Launch</h1>
<p>Trace the most important user flow: from rough idea to factory run.</p>

<div class="mermaid">
sequenceDiagram
    participant U as You
    participant S as SSSF Studio
    participant L as LLM endpoint
    participant R as Target repo
    participant F as Factory subprocess
    participant T as Trace DB

    U->>S: Write spec draft
    U->>S: Click "Review spec"
    S->>L: POST /chat/completions<br/>(system prompt + spec + context)
    L-->>S: JSON feedback (5 sections)
    S->>S: Render as cards
    U->>S: Accept suggestions, answer questions
    U->>S: Click "Approve specification"
    S->>R: Write requests/approved-spec.md
    S->>S: Mark session approved, log to app DB
    U->>S: Go to Runs, click "Launch"
    S->>R: spawn: uv run adws/adw_simple_sdlc.py "approved-spec.md" --config ... --adw-id ...
    S-->>U: Return immediately (detached)
    F->>R: Read spec, config, .env
    F->>F: Validate agents
    F->>T: INSERT session, phases, events...
    loop Each agent phase
        F->>F: Spawn pi child
        F->>T: INSERT agent_start, tool_call, agent_end
    end
    S->>T: Poll every 1.5s (readonly)
    T-->>S: New events since cursor
    S-->>U: Render live phases, events, envelopes
    F->>T: UPDATE session SET status='success'
    S->>T: Final poll
    S-->>U: Show completed run
</div>
<div class="mermaid-caption">The full lifecycle. Note: SSSF Studio and the factory communicate only through the filesystem and the trace DB — never directly.</div>

<h2>Key moments</h2>
<ol>
  <li><strong>Review</strong>: SSSF Studio calls the LLM. The factory isn't involved.</li>
  <li><strong>Approve</strong>: SSSF Studio writes a file. The factory isn't involved.</li>
  <li><strong>Launch</strong>: SSSF Studio spawns a subprocess and steps back. The factory takes over.</li>
  <li><strong>Observe</strong>: SSSF Studio polls the trace DB the factory writes to. Both run independently.</li>
</ul>
`
  },
  {
    id: "walkthroughs/trace-flow", group: "See", title: "Trace data flow", icon: "🗄️",
    render: () => `
<h1>Walkthrough — Trace data flow</h1>
<p>How an event gets from an agent's tool call to your screen.</p>

<div class="mermaid">
graph LR
    PI[pi agent<br/>runs a tool] -->|JSONL event| TRACER[Tracer<br/>adw_modules/tracer.py]
    TRACER -->|JSONL append| JSONL[events.jsonl<br/>on disk]
    TRACER -->|INSERT| WAL[sssf.db<br/>WAL file]
    WAL -->|merge| DB[sssf.db<br/>main file]
    API[SSSF Studio API<br/>better-sqlite3 readonly] -->|SELECT| DB
    API -->|JSON over HTTP| UI[Runs tab<br/>React poll]
    UI -->|render| SCREEN[Your screen]
    style PI fill:#3a2e28,color:#ebe7df
    style TRACER fill:#2f2d2a,color:#ebe7df
    style WAL fill:#3a3833,color:#ebe7df
    style DB fill:#3a3833,color:#ebe7df
    style API fill:#3a2e28,color:#ebe7df
</div>
<div class="mermaid-caption">An event flows: pi → tracer → SQLite (WAL) → SSSF Studio API (readonly SELECT) → React poll → screen. No push, no WebSocket — just polling a database.</div>

<h2>Why this works</h2>
<ul>
  <li><strong>WAL mode</strong> means the factory's INSERTs never block SSSF Studio's SELECTs.</li>
  <li><strong>Rowid cursor</strong> means each poll only fetches NEW events — efficient even for 10,000+ event runs.</li>
  <li><strong>Readonly connection</strong> means SSSF Studio physically cannot corrupt the trace, even if it has a bug.</li>
  <li><strong>Files are the raw record</strong> — the JSONL file and the DB mirror each other. If the DB corrupts, the JSONL is the backup.</li>
</ul>
`
  }
);

// ════════════════════════════════════════════════════════════════════════
// CONCEPTS
// ════════════════════════════════════════════════════════════════════════
PAGES.push(
  {
    id: "concepts", group: "Reference", title: "Technical concepts", icon: "📖",
    render: () => `
<h1>Technical concepts</h1>
<p>On first use, unfamiliar terms are explained here. This isn't a dictionary — it's the vocabulary you need to use SSSF Studio confidently.</p>

<div class="callout concept"><div class="callout-title">📖 localhost</div><p><code>localhost</code> means "this computer." When SSSF Studio runs on <code>http://localhost:3000</code>, it's a program running on YOUR machine, not a server on the internet. You open it in your browser like any website, but only you can see it.</p></div>

<div class="callout concept"><div class="callout-title">📖 Port</div><p>A port is a numbered channel on your computer. <code>localhost:3000</code> means "the program listening on port 3000." Only one program can use a port at a time. SSSF Studio uses 3000 (the app), 4600 (the visualizer), and the factory uses no fixed port (it's a subprocess).</p></div>

<div class="callout concept"><div class="callout-title">📖 API key</div><p>An API key is a secret password that lets software talk to a service. The factory's agents need LLM provider keys (OpenAI, Fireworks, etc.) to call their models. SSSF Studio stores these in the workspace's <code>.env</code> file (gitignored — never committed to git).</p></div>

<div class="callout concept"><div class="callout-title">📖 SQLite</div><p>SQLite is a lightweight database that stores everything in a single file. No server, no setup. The factory uses it for trace data (<code>sssf.db</code>). SSSF Studio uses it for app state. You can open a SQLite file with the <code>sqlite3</code> command-line tool or any SQLite viewer.</p></div>

<div class="callout concept"><div class="callout-title">📖 WAL mode</div><p>Write-Ahead Logging. A SQLite mode where changes go to a <code>-wal</code> file first, then merge into the main file. Readers never block writers. This is what lets SSSF Studio poll a trace DB while the factory is actively writing to it.</p></div>

<div class="callout concept"><div class="callout-title">📖 YAML</div><p>YAML is a human-readable config format. The factory's roster (<code>sssf.config.yaml</code>) is YAML. SSSF Studio's visual editor reads and writes it. You never need to edit YAML by hand, but you can if you want — the "YAML" button in Configuration shows a preview.</p></div>

<div class="callout concept"><div class="callout-title">📖 Subprocess</div><p>A subprocess is a program started by another program. When you click "Launch", SSSF Studio (a Node.js process) starts <code>uv run adws/...</code> (a Python subprocess). The subprocess runs independently — SSSF Studio doesn't wait for it; it just polls the trace DB.</p></div>

<div class="callout concept"><div class="callout-title">📖 LLM</div><p>Large Language Model. The AI that powers the Discovery agent and the factory's coding agents. SSSF Studio's Discovery agent calls an OpenAI-compatible endpoint. The factory's agents use <code>pi</code>, which calls provider APIs directly.</p></div>

<div class="callout concept"><div class="callout-title">📖 ADW</div><p>AI Developer Workflow. A Python script that orchestrates agents through named phases. <code>adw_simple_sdlc.py</code> is the recommended one: plan → build → test → review → document, with 3 commits. Each ADW is a black box to SSSF Studio — it just invokes it with a spec, a config, and an adw-id.</p></div>

<div class="callout concept"><div class="callout-title">📖 Envelope</div><p>A typed JSON object that agents hand to each other. Every agent call declares an output type (PlanOutput, BuildOutput, ReviewOutput, etc.). The agent's final response is parsed against that type. Gates validate the claims in the envelope. SSSF Studio shows these in the Runs observer.</p></div>

<div class="callout concept"><div class="callout-title">📖 Gate</div><p>A gate is a code check that validates an agent's claims. <code>artifacts_exist</code> checks that the files the agent says it created actually exist. <code>diff_matches_claims</code> checks that the git diff matches what the agent reported. Gate failures flow back to the agent as corrections.</p></div>

<div class="callout concept"><div class="callout-title">📖 pi</div><p>The coding agent harness the factory uses in v1. It's a CLI that runs an LLM with tools (read, write, bash, etc.) against a codebase. The factory calls <code>pi -p --mode json</code> non-interactively. <code>pi</code> reads its model catalog from <code>~/.pi/agent/models.json</code>.</p></div>

<div class="callout concept"><div class="callout-title">📖 uv</div><p>A fast Python package runner. The factory's ADW scripts start with <code>#!/usr/bin/env -S uv run</code>, which reads each script's inline dependency list and runs it in an ephemeral environment. Like <code>npx</code> for Python.</p></div>

<div class="callout concept"><div class="callout-title">📖 Environment variable</div><p>A named value passed to programs when they start. The factory reads API keys from environment variables (<code>OPENAI_API_KEY</code>, etc.). SSSF Studio writes them to <code>.env</code>, which <code>python-dotenv</code> loads into the environment when the factory runs.</p></div>

<div class="callout concept"><div class="callout-title">📖 .env file</div><p>A text file of <code>KEY=value</code> lines. It's gitignored (never committed). The factory loads it via <code>python-dotenv</code>. SSSF Studio's Configuration tab writes to it when you set API keys.</p></div>
`
  }
);

// ════════════════════════════════════════════════════════════════════════
// TROUBLESHOOTING
// ════════════════════════════════════════════════════════════════════════
PAGES.push(
  {
    id: "troubleshooting", group: "Reference", title: "Troubleshooting", icon: "🩹",
    render: () => `
<h1>Troubleshooting</h1>
<p>Common issues, what they mean, and how to fix them.</p>

<div class="ts-item">
  <div class="ts-symptom">🔴 "config validation failed: agent 'planner': model pattern '...' not found in pi --list-models"</div>
  <p><strong>What it means:</strong> The factory's <code>agents.validate()</code> ran before any session was created. A model in your roster isn't registered with <code>pi</code>.</p>
  <p><strong>Check this first:</strong> Run <code>pi --list-models</code> in a terminal. Does the model from the error appear?</p>
  <p><strong>Fix it:</strong> Either register the model in <code>~/.pi/agent/models.json</code>, or change the roster (Configuration tab) to use a model that IS registered. The fastest path: set every agent to one model you know works.</p>
  <p><strong>Why that works:</strong> The factory fails fast — it won't spawn agents against a half-valid config. This is a feature, not a bug.</p>
</div>

<div class="ts-item">
  <div class="ts-symptom">🔴 "Could not reach the LLM gateway at http://127.0.0.1:31415/v1/chat/completions"</div>
  <p><strong>What it means:</strong> The Discovery agent (SSSF Studio's own LLM helper) can't connect to its configured endpoint.</p>
  <p><strong>Check this first:</strong> Is the LLM server running? Try <code>curl http://127.0.0.1:31415/v1/models</code> in a terminal.</p>
  <p><strong>Fix it:</strong> Start the LLM server, or open <strong>Configuration → AI provider setup</strong> and paste the correct workspace endpoint, model, and optional API key.</p>
</div>

<div class="ts-item">
  <div class="ts-symptom">🟡 "No approved spec. Approve one in Discovery first."</div>
  <p><strong>What it means:</strong> You clicked "Launch" but there's no <code>requests/approved-spec.md</code> in the workspace.</p>
  <p><strong>Fix it:</strong> Go to Discovery, write a spec, click "Approve specification". Then go back to Runs and launch.</p>
</div>

<div class="ts-item">
  <div class="ts-symptom">🟡 The Visualizer sub-tab shows a blank iframe</div>
  <p><strong>What it means:</strong> The visualizer mini-service isn't running, or the gateway can't forward to port 4600.</p>
  <p><strong>Check this first:</strong> Run <code>curl http://localhost:4600/api/health</code>. Does it respond?</p>
  <p><strong>Fix it:</strong> Start the visualizer: <code>cd mini-services/visualizer && PORT=4600 bun run server/index.ts &</code>. Make sure you've run <code>bun run build</code> at least once so <code>dist/</code> exists.</p>
</div>

<div class="ts-item">
  <div class="ts-symptom">🟡 Discovery, Configuration, and Runs tabs are disabled</div>
  <p><strong>What it means:</strong> The factory isn't stamped into the current workspace. Those tabs require a stamped factory.</p>
  <p><strong>Fix it:</strong> Go to the Workspace tab and click "Stamp factory into this repo". Once the status grid turns green, the other tabs unlock.</p>
</div>

<div class="ts-item">
  <div class="ts-symptom">🟡 I saved the roster but the factory still uses the old one</div>
  <p><strong>What it means:</strong> The Runs tab's "Roster config" selector might be pointing at a different file than the one you edited.</p>
  <p><strong>Fix it:</strong> In the Runs tab, check which roster is selected in the launch bar. In Configuration, check which roster you edited. They need to match. The default is <code>sssf.config.yaml</code>.</p>
</div>

<div class="ts-item">
  <div class="ts-symptom">🟡 The tour keeps starting every time I open the app</div>
  <p><strong>What it means:</strong> The "seen" flag in localStorage was cleared, or you're in a private window.</p>
  <p><strong>Fix it:</strong> Click "Skip tour" or finish it — that sets the flag. If it persists, check that your browser isn't clearing localStorage on exit.</p>
</div>

<div class="ts-item">
  <div class="ts-symptom">🔴 bun run dev fails with "module not found"</div>
  <p><strong>What it means:</strong> Dependencies aren't installed.</p>
  <p><strong>Fix it:</strong> Run <code>bun install</code> in the project root. Then <code>bun run dev</code>.</p>
</div>

<div class="ts-item">
  <div class="ts-symptom">🔴 The app loads but the page is blank / shows an error</div>
  <p><strong>What it means:</strong> A runtime error occurred. Check the browser console (F12 → Console) and the terminal running <code>bun run dev</code>.</p>
  <p><strong>Still broken?</strong> Check <code>dev.log</code> in the project root for the full error. The most common cause is a port conflict (something else using 3000).</p>
</div>
`
  }
);

// ════════════════════════════════════════════════════════════════════════
// GLOSSARY
// ════════════════════════════════════════════════════════════════════════
PAGES.push(
  {
    id: "glossary", group: "Reference", title: "Glossary", icon: "📑",
    render: () => `
<h1>Glossary</h1>
<p>Searchable list of terms used in SSSF Studio. Type in the search box (top-left) to filter.</p>
<div class="glossary-list" id="glossary-list">
  ${[
    ["ADW", "AI Developer Workflow. A Python script that orchestrates agents through named phases. Each adw_*.py file is one ADW."],
    ["adw-id", "A short unique identifier for a run. Generated by SSSF Studio on launch and passed to the factory via --adw-id. Also the primary key in the trace DB's sessions table."],
    ["Agent", "A coding agent — an LLM with tools (read, write, bash, etc.) that works inside a named phase. The factory's agents run via pi. The Discovery agent is separate (SSSF Studio's own LLM call)."],
    ["Agent roster", "The collection of agents defined in sssf.config.yaml. Each agent has a name, model, thinking level, tools, and write permissions."],
    ["Approval", "The act of clicking 'Approve specification' in Discovery. Writes the spec to requests/approved-spec.md and records it in the app DB."],
    ["Bun", "A fast JavaScript runtime and package manager. SSSF Studio uses it to install deps and run the dev server."],
    ["Caddy", "The gateway/reverse proxy in front of the Next.js app. Handles routing between ports via the XTransformPort query param."],
    ["Config", "Short for sssf.config.yaml — the agent roster. Defines defaults and per-agent settings."],
    ["Discovery", "The interactive pre-factory layer. A chat + spec editor where an AI reviewer helps you refine a rough idea into an approved markdown file."],
    ["Discovery agent", "The LLM that powers Discovery. NOT a factory agent — it's SSSF Studio's own, defined in src/lib/sssf/discovery.ts."],
    ["Envelope", "A typed JSON object that an agent returns. Each agent call declares an output type (PlanOutput, BuildOutput, etc.). Gates validate the envelope's claims."],
    ["Factory", "Short for 'Super Simple Software Factory.' The Python-based agents-plus-code workflow system that SSSF Studio sits on top of."],
    ["Gate", "A code check that validates an agent's claims. artifacts_exist, files_non_empty, diff_matches_claims, verdict_consistent. Failures flow back as corrections."],
    ["install.py", "The factory's official stamping script. Copies adws/, prompt engineering, config, and justfile into a target repo. Idempotent."],
    ["Launch", "The act of clicking 'Launch' in the Runs tab. Spawns the factory as a detached subprocess with the approved spec as its prompt."],
    ["LLM", "Large Language Model. The AI behind both the Discovery agent (SSSF Studio's call) and the factory's coding agents (via pi)."],
    ["Mermaid", "A text-based diagram language. Used in this manual for architecture and flow diagrams."],
    ["Mini-service", "A separate Bun process running alongside the Next.js app. The visualizer is a mini-service on port 4600."],
    ["Next.js", "The React framework SSSF Studio is built with. App Router, TypeScript, Tailwind."],
    ["Observer", "The Runs tab's detail view. Polls the trace DB and renders phases, events, envelopes, and gates live."],
    ["pi", "The coding agent harness the factory uses in v1. A CLI that runs an LLM with tools against a codebase."],
    ["Phase", "A named step in an ADW. Each phase has a kind (engineer, agent, code), an owner, and a status. The trace DB records all phases for a run."],
    ["Protected files", "Paths in defaults.protected_files that NO agent may edit unless it names them in its own 'writes'. Defaults to the factory's own code."],
    ["Roster", "Synonym for the agent config (sssf.config.yaml). You can have multiple named rosters."],
    ["SQLite", "A lightweight file-based database. Used for the trace DB (sssf.db) and the app DB (custom.db)."],
    ["Stamp", "The act of running install.py to copy the factory into a target repo. SSSF Studio's Workspace tab does this."],
    ["Subprocess", "A program started by another program. The factory is a subprocess of SSSF Studio (spawned on launch)."],
    ["Trace DB", "The SQLite database (adws/adw_data/sssf.db) the factory's tracer writes events to. SSSF Studio reads it readonly to power the observer."],
    ["Tracer", "The factory module (adw_modules/tracer.py) that writes events to the trace DB and JSONL files."],
    ["Tour", "The guided onboarding walk-through. Auto-starts on first visit, restartable from the sidebar."],
    ["uv", "A fast Python package runner. The factory's ADW scripts use it via the #!/usr/bin/env -S uv run shebang."],
    ["Visualizer", "The factory's official Vue app for viewing trace data. SSSF Studio embeds it as an iframe in the Runs tab."],
    ["WAL", "Write-Ahead Logging. A SQLite mode that lets readers and writers coexist without blocking. Essential for live polling."],
    ["Workspace", "A project directory on disk that the factory is stamped into. Each workspace is independent."],
    ["writes", "A per-agent config field. What the agent may MODIFY in the repo. [] = read-only. Blank = unrestricted (minus protected_files). Enforced in code after every agent call."],
    ["XTransformPort", "A query parameter the Caddy gateway uses to forward requests to a different port. The visualizer iframe uses it to reach port 4600."],
    ["YAML", "A human-readable config format. sssf.config.yaml is YAML. SSSF Studio's editor reads and writes it."],
  ].map(([term, def]) => `<div class="glossary-item" data-term="${term.toLowerCase()}"><div class="glossary-term">${term}</div><div class="glossary-def">${def}</div></div>`).join("")}
</div>
`
  }
);

// ════════════════════════════════════════════════════════════════════════
// DEVELOPER / MAINTAINER
// ════════════════════════════════════════════════════════════════════════
PAGES.push(
  {
    id: "developer-architecture", group: "Develop", title: "Architecture", icon: "🏗️",
    render: () => `
<h1>Developer Guide — Architecture</h1>
<p>For developers and future maintainers. This is the map of the codebase.</p>

<h2>Repository structure</h2>
<pre><code class="lang-text">my-project/
├── src/
│   ├── app/
│   │   ├── api/workspaces/[slug]/...   # API routes
│   │   ├── layout.tsx                  # Root layout (fonts, theme)
│   │   ├── page.tsx                    # Home page (loads AppShell + Tour)
│   │   └── globals.css                 # Theme tokens, markdown styles
│   ├── components/sssf/
│   │   ├── AppShell.tsx                # Sidebar + 4 tabs + tour buttons
│   │   ├── WorkspaceTab.tsx
│   │   ├── DiscoveryTab.tsx
│   │   ├── ConfigTab.tsx
│   │   ├── RunsTab.tsx
│   │   ├── TourOverlay.tsx            # Guided tour popover
│   │   ├── ThemeToggle.tsx
│   │   └── MarkdownView.tsx
│   └── lib/sssf/
│       ├── factory.ts                  # stamp, listAdws, listRosters
│       ├── config.ts                   # types, validation (client-safe)
│       ├── config-io.ts                # YAML read/write (server-only)
│       ├── trace.ts                    # better-sqlite3 readonly reader
│       ├── launch.ts                   # subprocess spawn
│       ├── discovery.ts                # Discovery agent (LLM)
│       ├── llm.ts                      # LLM helper (environment/workspace settings)
│       ├── workspaces.ts               # Prisma sync
│       ├── seed.ts                     # demo trace seeder
│       ├── api-client.ts               # typed fetch helpers (client)
│       ├── ui.ts                       # cn(), formatters
│       └── paths.ts                    # constants
├── prisma/schema.prisma                # Workspace, DiscoverySession, Message, Approval, Launch
├── mini-services/visualizer/           # embedded Vue visualizer (port 4600)
├── sssf-factory/                       # the factory repo (DO NOT MODIFY)
├── workspaces/                         # target repos (created at runtime)
└── public/learners-manual/             # this manual
</code></pre>

<h2>Layer separation</h2>
<table>
  <tr><th>Layer</th><th>Owns</th><th>Can touch factory?</th></tr>
  <tr><td>UI (components/sssf)</td><td>Rendering, user interaction</td><td>No — calls API only</td></tr>
  <tr><td>API (app/api)</td><td>Business logic, file I/O</td><td>Yes — via lib helpers</td></tr>
  <tr><td>Lib (lib/sssf)</td><td>Factory interaction primitives</td><td>Yes — reads/writes files, spawns subprocesses</td></tr>
  <tr><td>Factory (sssf-factory + workspaces/*/adws)</td><td>Agent orchestration, tracing</td><td>Is the factory</td></tr>
</table>

<h2>Data flow</h2>
<div class="mermaid">
graph TD
    BROWSER[Browser] -->|HTTP| NEXT[Next.js API routes]
    NEXT -->|Prisma| APPDB[(app DB<br/>custom.db)]
    NEXT -->|lib/sssf helpers| FS[Filesystem<br/>workspace dir]
    NEXT -->|fetch| LLM[LLM endpoint]
    NEXT -->|better-sqlite3 readonly| TRDB[(sssf.db)]
    NEXT -->|spawn| FACTORY[Factory subprocess]
    FACTORY -->|writes| TRDB
    FACTORY -->|writes| FS
    style NEXT fill:#3a2e28,color:#ebe7df
    style FACTORY fill:#2f2d2a,color:#ebe7df
    style TRDB fill:#3a3833,color:#ebe7df
    style APPDB fill:#3a3833,color:#ebe7df
</div>
`
  },
  {
    id: "developer-build", group: "Develop", title: "Build & test", icon: "🔨",
    render: () => `
<h1>Developer Guide — Build & test</h1>

<h2>Running the app</h2>
<pre><code class="lang-bash">bun install
bun run dev          # http://localhost:3000</code></pre>

<h2>Running the visualizer mini-service</h2>
<pre><code class="lang-bash">cd mini-services/visualizer
bun install
bun run build        # build Vue frontend to dist/
PORT=4600 bun run server/index.ts &   # start API + SPA</code></pre>

<h2>Lint</h2>
<pre><code class="lang-bash">bun run lint</code></pre>

<h2>Database</h2>
<pre><code class="lang-bash">bun run db:push     # push schema.prisma to db/custom.db
bun run db:generate  # regenerate Prisma client</code></pre>

<h2>Factory smoke test</h2>
<pre><code class="lang-bash">cd sssf-factory
uv run adws/adw_scout.py "where does auth live" \\
  --config adws/adw_sssf_config/sssf.config.yaml</code></pre>
<p>Requires <code>pi</code> + keys. Without them, fails at <code>agents.validate()</code> — expected.</p>

<h2>Project configuration files</h2>
<table>
  <tr><th>File</th><th>Purpose</th></tr>
  <tr><td><code>package.json</code></td><td>Dependencies, scripts</td></tr>
  <tr><td><code>tsconfig.json</code></td><td>TypeScript config</td></tr>
  <tr><td><code>next.config.ts</code></td><td>Next.js config</td></tr>
  <tr><td><code>tailwind.config.ts</code></td><td>Tailwind config</td></tr>
  <tr><td><code>Caddyfile</code></td><td>Gateway config (XTransformPort routing)</td></tr>
  <tr><td><code>prisma/schema.prisma</code></td><td>App DB schema</td></tr>
  <tr><td><code>eslint.config.mjs</code></td><td>Lint rules (excludes sssf-factory, mini-services, workspaces)</td></tr>
</table>
`
  },
  {
    id: "developer-where-to-change", group: "Develop", title: "Where to make changes", icon: "📍",
    render: () => `
<h1>Developer Guide — Where to make changes</h1>
<p>The map from "I want to do X" to "edit this file."</p>

<table>
  <tr><th>I want to…</th><th>Edit</th></tr>
  <tr><td>Change the LLM endpoint/model</td><td><code>src/lib/sssf/llm.ts</code></td></tr>
  <tr><td>Change the Discovery agent's behavior</td><td><code>src/lib/sssf/discovery.ts</code> (SYSTEM_PROMPT)</td></tr>
  <tr><td>Add a tour step</td><td><code>src/lib/tour-store.ts</code> (TOUR_STEPS) + <code>data-tour</code> attr on target</td></tr>
  <tr><td>Change the theme</td><td><code>src/app/globals.css</code> (CSS variables)</td></tr>
  <tr><td>Add a new tab</td><td><code>src/components/sssf/</code> (new component) + <code>AppShell.tsx</code> (TABS array)</td></tr>
  <tr><td>Add an API route</td><td><code>src/app/api/workspaces/[slug]/...</code></td></tr>
  <tr><td>Change the app DB schema</td><td><code>prisma/schema.prisma</code> → <code>bun run db:push</code></td></tr>
  <tr><td>Add a trace DB field</td><td>Factory's <code>tracer.py</code> (migration) → <code>src/lib/sssf/trace.ts</code> (reader)</td></tr>
  <tr><td>Change the visualizer</td><td><code>mini-services/visualizer/</code> (it's a copy, safe to modify)</td></tr>
  <tr><td>Add a manual page</td><td><code>public/learners-manual/content.js</code> (PAGES array)</td></tr>
</table>

<h2>Never edit</h2>
<ul>
  <li><code>sssf-factory/</code> — the factory source. It's a git clone. Modify only if you're forking the factory itself.</li>
  <li><code>workspaces/*/adws/</code> — stamped factory copies. They're regenerated by install.py.</li>
  <li><code>workspaces/*/adws/adw_data/sessions/</code> — the run record. The factory's contract says nothing touches this.</li>
</ul>

<h2>Maintaining this manual</h2>
<p>This Learner's Manual is a static HTML site in <code>public/learners-manual/</code>. Three files:</p>
<ul>
  <li><code>index.html</code> — shell (sidebar, content area, scripts)</li>
  <li><code>styles.css</code> — all styling (Anthropic-inspired, dark/light themes)</li>
  <li><code>content.js</code> — all page content as structured objects</li>
  <li><code>app.js</code> — router, search, quiz, theme toggle, mermaid init</li>
</ul>
<p>To add a page: add an object to the <code>PAGES</code> array in <code>content.js</code> with <code>id</code>, <code>group</code>, <code>title</code>, <code>icon</code>, and a <code>render()</code> function returning HTML. The nav, search, breadcrumbs, and prev/next all update automatically.</p>
`
  }
);

// ── Quiz helper ──────────────────────────────────────────────────────────
function quiz(id, question, options) {
  const optsHtml = options.map((o, i) => {
    const letter = String.fromCharCode(65 + i);
    return `<div class="quiz-option" data-correct="${o.correct}" data-quiz="${id}">
      <span class="qo-letter">${letter}</span>
      <span class="qo-text">${o.text}</span>
    </div>`;
  }).join("");
  const feedbacks = options.map((o, i) =>
    `<div class="quiz-feedback ${o.correct ? 'correct' : 'incorrect'}" data-quiz="${id}" data-option="${i}">${o.feedback}</div>`
  ).join("");
  return `
  <div class="quiz" data-quiz-id="${id}">
    <div class="quiz-question">${question}</div>
    <div class="quiz-options">${optsHtml}</div>
    ${feedbacks}
    <div class="quiz-actions">
      <button class="nav-btn quiz-retry" data-quiz="${id}" style="display:none">↺ Try again</button>
    </div>
  </div>`;
}

// Export for app.js
window.MANUAL_PAGES = PAGES;
