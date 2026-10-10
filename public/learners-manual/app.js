/* SSSF Studio — Learner's Manual app logic
   Router, search, quiz, theme toggle, mermaid, copy-code. */

(function () {
  const PAGES = window.MANUAL_PAGES || [];
  const GROUPS = ["Start", "Features", "Learn", "See", "Reference", "Develop"];
  const GROUP_LABELS = {
    Start: "Getting started",
    Features: "Features",
    Learn: "Learn — Course",
    See: "See — Walkthroughs",
    Reference: "Reference",
    Develop: "Developer guide",
  };

  // ── Build sidebar nav ────────────────────────────────────
  const nav = document.getElementById("nav");
  GROUPS.forEach((g) => {
    const pages = PAGES.filter((p) => p.group === g);
    if (pages.length === 0) return;
    const groupDiv = document.createElement("div");
    groupDiv.className = "nav-group";
    groupDiv.innerHTML = `<div class="nav-group-label">${GROUP_LABELS[g] || g}</div>`;
    pages.forEach((p) => {
      const a = document.createElement("a");
      a.className = "nav-item";
      a.href = "#/" + p.id;
      a.dataset.pageId = p.id;
      a.innerHTML = `<span style="margin-right:6px">${p.icon || ""}</span>${p.title}`;
      a.addEventListener("click", () => { closeMobileNav(); });
      groupDiv.appendChild(a);
    });
    nav.appendChild(groupDiv);
  });

  // ── Router ────────────────────────────────────────────────
  function currentRoute() {
    const h = window.location.hash.replace(/^#\/?/, "");
    return h || "home";
  }

  function render() {
    const id = currentRoute();
    const page = PAGES.find((p) => p.id === id) || PAGES[0];
    const content = document.getElementById("page-content");
    content.innerHTML = page.render();

    // Active nav item
    document.querySelectorAll(".nav-item").forEach((el) => {
      el.classList.toggle("active", el.dataset.pageId === page.id);
    });

    // Breadcrumbs
    const groupLabel = GROUP_LABELS[page.group] || page.group;
    document.getElementById("breadcrumbs").innerHTML =
      `<a href="#/home">Home</a><span class="sep">/</span><a href="#/${page.id}">${groupLabel}</a><span class="sep">/</span><span>${page.title}</span>`;

    // Prev/next
    const idx = PAGES.findIndex((p) => p.id === page.id);
    const prev = idx > 0 ? PAGES[idx - 1] : null;
    const next = idx < PAGES.length - 1 ? PAGES[idx + 1] : null;
    ["prev-page", "prev-page-2"].forEach((bid) => {
      const b = document.getElementById(bid);
      b.disabled = !prev;
      b.onclick = prev ? () => { window.location.hash = "#/" + prev.id; } : null;
    });
    ["next-page", "next-page-2"].forEach((bid) => {
      const b = document.getElementById(bid);
      b.disabled = !next;
      b.onclick = next ? () => { window.location.hash = "#/" + next.id; } : null;
    });
    document.getElementById("page-position").textContent = `${idx + 1} of ${PAGES.length}`;

    // Re-render mermaid
    if (window.mermaid) {
      window.mermaid.run({ querySelector: ".mermaid", nodes: content.querySelectorAll(".mermaid") });
    }

    // Copy buttons on code blocks
    content.querySelectorAll("pre").forEach((pre) => {
      if (pre.querySelector(".copy-btn")) return;
      const btn = document.createElement("button");
      btn.className = "copy-btn";
      btn.textContent = "Copy";
      btn.addEventListener("click", () => {
        const code = pre.querySelector("code");
        const text = code ? code.textContent : pre.textContent;
        navigator.clipboard.writeText(text).then(() => {
          btn.textContent = "✓ Copied";
          setTimeout(() => (btn.textContent = "Copy"), 1500);
        });
      });
      pre.appendChild(btn);
    });

    // Quiz handlers
    content.querySelectorAll(".quiz").forEach((quizEl) => {
      const qid = quizEl.dataset.quizId;
      const options = quizEl.querySelectorAll(".quiz-option");
      const feedbacks = quizEl.querySelectorAll(".quiz-feedback");
      const retryBtn = quizEl.querySelector(".quiz-retry");
      let answered = false;

      options.forEach((opt, i) => {
        opt.addEventListener("click", () => {
          if (answered) return;
          answered = true;
          const correct = opt.dataset.correct === "true";
          options.forEach((o, j) => {
            o.classList.add("disabled");
            if (o.dataset.correct === "true") o.classList.add("correct");
            if (j === i && !correct) o.classList.add("incorrect");
          });
          feedbacks.forEach((f) => {
            if (f.dataset.option === String(i) || (correct && f.classList.contains("correct"))) {
              f.classList.add("show");
            }
          });
          // If wrong, also show the correct explanation
          if (!correct) {
            feedbacks.forEach((f) => { if (f.classList.contains("correct")) f.classList.add("show"); });
          }
          retryBtn.style.display = "inline-block";
        });
      });

      retryBtn.addEventListener("click", () => {
        answered = false;
        options.forEach((o) => o.classList.remove("disabled", "correct", "incorrect"));
        feedbacks.forEach((f) => f.classList.remove("show"));
        retryBtn.style.display = "none";
      });
    });

    // Scroll to top
    window.scrollTo(0, 0);
    document.getElementById("content").scrollTop = 0;
  }

  window.addEventListener("hashchange", render);

  // ── Search ────────────────────────────────────────────────
  const searchInput = document.getElementById("search");
  searchInput.addEventListener("input", () => {
    const q = searchInput.value.toLowerCase().trim();
    // Glossary filter
    const glossaryItems = document.querySelectorAll(".glossary-item");
    glossaryItems.forEach((item) => {
      const term = item.dataset.term || "";
      const text = item.textContent.toLowerCase();
      item.classList.toggle("hidden", q && !term.includes(q) && !text.includes(q));
    });
    // Nav filter
    document.querySelectorAll(".nav-item").forEach((item) => {
      const text = item.textContent.toLowerCase();
      const matches = !q || text.includes(q);
      item.classList.toggle("hidden", !matches);
    });
    // Hide empty groups
    document.querySelectorAll(".nav-group").forEach((g) => {
      const visible = g.querySelectorAll(".nav-item:not(.hidden)");
      g.style.display = visible.length ? "" : "none";
    });
  });

  // ── Theme toggle ──────────────────────────────────────────
  const themeToggle = document.getElementById("theme-toggle");
  function applyTheme(t) {
    document.documentElement.dataset.theme = t;
    themeToggle.textContent = t === "dark" ? "🌙 Dark" : "☀️ Light";
    try { localStorage.setItem("sssf-manual-theme", t); } catch (e) {}
    // Re-render mermaid with theme
    if (window.mermaid) {
      const dark = t === "dark";
      window.mermaid.initialize({
        startOnLoad: false,
        theme: "base",
        themeVariables: dark
          ? { background: "#262522", primaryColor: "#d97757", primaryTextColor: "#ebe7df", primaryBorderColor: "#d97757", lineColor: "#a8a39a", secondaryColor: "#2f2d2a", tertiaryColor: "#3a3833", textColor: "#ebe7df", fontSize: "14px" }
          : { background: "#ffffff", primaryColor: "#f4e4dc", primaryTextColor: "#1a1915", primaryBorderColor: "#c15f3c", lineColor: "#6b6862", secondaryColor: "#f3f1eb", tertiaryColor: "#e8e5dd", textColor: "#1a1915", fontSize: "14px" },
      });
      // Re-run mermaid on current page
      const content = document.getElementById("page-content");
      content.querySelectorAll(".mermaid").forEach((el) => {
        el.removeAttribute("data-processed");
        el.innerHTML = el.dataset.original || el.innerHTML;
      });
      window.mermaid.run({ querySelector: ".mermaid", nodes: content.querySelectorAll(".mermaid") });
    }
  }

  // Store original mermaid HTML for re-render
  setTimeout(() => {
    document.querySelectorAll(".mermaid").forEach((el) => {
      el.dataset.original = el.textContent;
    });
  }, 100);

  let savedTheme = "dark";
  try { savedTheme = localStorage.getItem("sssf-manual-theme") || "dark"; } catch (e) {}
  applyTheme(savedTheme);
  themeToggle.addEventListener("click", () => {
    const current = document.documentElement.dataset.theme;
    applyTheme(current === "dark" ? "light" : "dark");
  });

  // ── Mobile nav ────────────────────────────────────────────
  const mobileToggle = document.getElementById("mobile-nav-toggle");
  const sidebar = document.getElementById("sidebar");
  const mobileOverlay = document.getElementById("mobile-nav-overlay");
  function closeMobileNav() {
    sidebar.classList.remove("open");
    mobileOverlay.classList.remove("open");
  }
  mobileToggle.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    mobileOverlay.classList.toggle("open");
  });
  mobileOverlay.addEventListener("click", closeMobileNav);

  // ── Init ──────────────────────────────────────────────────
  // Init mermaid
  if (window.mermaid) {
    window.mermaid.initialize({ startOnLoad: false, theme: "base", themeVariables: { background: "#262522", primaryColor: "#d97757", primaryTextColor: "#ebe7df", lineColor: "#a8a39a", fontSize: "14px" } });
  }
  render();
})();
