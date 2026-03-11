/* ═══════════════════════════════════════════
   app.js — Main application controller
   ═══════════════════════════════════════════ */

/* ── Dashboard data ── */
const DASHBOARD_CARDS = [
  {
    category: "sorting",
    icon: "↕",
    title: "Sorting Algorithms",
    desc: "Visualize 9 sorting algorithms with bar animations, step-by-step explanations, and custom input.",
    algos: [
      "Bubble",
      "Selection",
      "Insertion",
      "Merge",
      "Quick",
      "Heap",
      "Shell",
      "Radix",
      "Bucket",
    ],
    accent: "#00e5a0",
  },
  {
    category: "searching",
    icon: "◎",
    title: "Searching Algorithms",
    desc: "Watch Linear and Binary Search in action with highlighted elements and comparison counters.",
    algos: ["Linear Search", "Binary Search"],
    accent: "#ffd166",
  },
  {
    category: "graph",
    icon: "◈",
    title: "Graph Algorithms",
    desc: "Interactive graph canvas with 7 graph algorithms. Add nodes, edges, and weights dynamically.",
    algos: [
      "BFS",
      "DFS",
      "Dijkstra's",
      "A*",
      "Prim's",
      "Bellman-Ford",
      "Floyd-Warshall",
    ],
    accent: "#845ec2",
  },
  {
    category: "tree",
    icon: "⌥",
    title: "Tree Algorithms",
    desc: "Interactive BST, AVL, and Red-Black trees with animated rotations, balance factors, and color rules.",
    algos: ["BST", "AVL Tree", "Red-Black Tree"],
    accent: "#118ab2",
  },
  {
    category: "backtracking",
    icon: "↺",
    title: "Backtracking Algorithms",
    desc: "Step through N-Queens, TSP, and Sudoku with animated backtracking and conflict highlighting.",
    algos: ["N-Queens", "TSP", "Sudoku Solver"],
    accent: "#ff6b35",
  },
];

/* ── Build Dashboard ── */
function buildDashboard() {
  const grid = document.getElementById("dashboardGrid");
  if (!grid) return;
  grid.innerHTML = "";
  DASHBOARD_CARDS.forEach((card) => {
    const el = document.createElement("div");
    el.className = "dash-card";
    el.style.setProperty("--card-accent", card.accent);
    el.innerHTML = `
      <span class="dash-card-icon">${card.icon}</span>
      <div class="dash-card-title">${card.title}</div>
      <div class="dash-card-desc">${card.desc}</div>
      <div class="dash-card-algos">
        ${card.algos.map((a) => `<span class="dash-algo-tag">${a}</span>`).join("")}
      </div>
    `;
    el.addEventListener("click", () => navigateTo(card.category));
    grid.appendChild(el);
  });
}

/* ── Navigation ── */
function navigateTo(category) {
  // Update nav
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.category === category);
  });
  // Update panels
  document.querySelectorAll(".panel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === `panel-${category}`);
  });
  // Close mobile sidebar
  document.getElementById("sidebar")?.classList.remove("open");
  // Trigger canvas redraws
  if (category === "graph") {
    setTimeout(() => {
      const c = document.getElementById("graphCanvas");
      if (c) {
        c.width = c.offsetWidth;
        c.height = c.offsetHeight;
      }
    }, 50);
  }
  if (category === "tree") {
    setTimeout(() => {
      const c = document.getElementById("treeCanvas");
      if (c) {
        c.width = c.offsetWidth;
        c.height = c.offsetHeight;
      }
    }, 50);
  }
}

/* ── Theme toggle ── */
function initTheme() {
  const saved = localStorage.getItem("algviz-theme") || "dark";
  document.documentElement.setAttribute("data-theme", saved);

  function toggle() {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("algviz-theme", next);
  }
  document.getElementById("themeToggle")?.addEventListener("click", toggle);
  document
    .getElementById("themeToggleMobile")
    ?.addEventListener("click", toggle);
}

/* ── Mobile sidebar ── */
function initMobileSidebar() {
  document.getElementById("hamburger")?.addEventListener("click", () => {
    document.getElementById("sidebar")?.classList.toggle("open");
  });
}

/* ── Nav items ── */
function initNav() {
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", () => navigateTo(item.dataset.category));
  });
}

/* ── Initialize all visualizers ── */
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initMobileSidebar();
  initNav();
  buildDashboard();

  // Initialize each visualizer
  try {
    SortingViz.init();
  } catch (e) {
    console.error("SortingViz init error:", e);
  }
  try {
    SearchingViz.init();
  } catch (e) {
    console.error("SearchingViz init error:", e);
  }
  try {
    GraphViz.init();
  } catch (e) {
    console.error("GraphViz init error:", e);
  }
  try {
    TreeViz.init();
  } catch (e) {
    console.error("TreeViz init error:", e);
  }
  try {
    BacktrackingViz.init();
  } catch (e) {
    console.error("BacktrackingViz init error:", e);
  }

  console.log("✓ AlgoViz initialized");
});
