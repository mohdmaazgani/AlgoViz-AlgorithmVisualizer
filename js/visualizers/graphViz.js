/* ═══════════════════════════════════════════
   visualizers/graphViz.js
   Canvas-based interactive graph visualization
   ═══════════════════════════════════════════ */

const GraphViz = (() => {
  let currentAlgo = "bfs";
  let graph = { nodes: [], edges: [] };
  let controller = null;
  let stepGen = null;

  // Visual state
  let visitedNodes = new Set();
  let processedNodes = new Set();
  let activeEdges = new Set();
  let mstEdges = new Set();
  let pathEdges = new Set();
  let startNode = null;
  let goalNode = null;
  let distTable = {};

  // Interaction state
  let tool = "addNode"; // addNode | addEdge | setStart | setGoal
  let edgeFrom = null;
  let dragging = null;

  const canvas = () => document.getElementById("graphCanvas");
  const logEl = () => document.getElementById("graphStepLog");
  const theorPan = () => document.getElementById("graphTheory");

  /* ── Drawing ── */
  function getCtx() {
    const c = canvas();
    if (!c) return null;
    c.width = c.offsetWidth;
    c.height = c.offsetHeight;
    return c.getContext("2d");
  }

  function getCSSVar(v) {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(v)
      .trim();
  }

  function draw() {
    const ctx = getCtx();
    if (!ctx) return;
    const c = canvas();
    ctx.clearRect(0, 0, c.width, c.height);

    // Draw edges
    for (const e of graph.edges) {
      const from = graph.nodes.find((n) => n.id === e.from);
      const to = graph.nodes.find((n) => n.id === e.to);
      if (!from || !to) continue;

      const key1 = `${e.from}-${e.to}`,
        key2 = `${e.to}-${e.from}`;
      let color = getCSSVar("--border");
      if (pathEdges.has(key1) || pathEdges.has(key2))
        color = getCSSVar("--path");
      else if (mstEdges.has(key1) || mstEdges.has(key2))
        color = getCSSVar("--accent");
      else if (activeEdges.has(key1) || activeEdges.has(key2))
        color = getCSSVar("--compare");

      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.strokeStyle = color;
      ctx.lineWidth = pathEdges.has(key1) || pathEdges.has(key2) ? 3 : 2;
      ctx.stroke();

      // Weight label
      const mx = (from.x + to.x) / 2,
        my = (from.y + to.y) / 2;
      ctx.fillStyle = getCSSVar("--text-secondary");
      ctx.font = "11px Space Mono, monospace";
      ctx.textAlign = "center";
      ctx.fillText(e.weight, mx, my - 6);

      // Arrow
      drawArrow(ctx, from, to, color);
    }

    // Draw nodes
    for (const node of graph.nodes) {
      let fillColor = getCSSVar("--bg-card");
      let strokeColor = getCSSVar("--border");
      let textColor = getCSSVar("--text-primary");

      if (node.id === startNode) {
        strokeColor = getCSSVar("--accent");
        fillColor = getCSSVar("--accent-dim");
      }
      if (node.id === goalNode) {
        strokeColor = getCSSVar("--highlight");
        fillColor = getCSSVar("--highlight-dim");
      }
      if (processedNodes.has(node.id)) {
        fillColor = getCSSVar("--visited") + "44";
        strokeColor = getCSSVar("--visited");
      }
      if (visitedNodes.has(node.id)) {
        fillColor = getCSSVar("--frontier") + "44";
        strokeColor = getCSSVar("--frontier");
      }

      ctx.beginPath();
      ctx.arc(node.x, node.y, 22, 0, Math.PI * 2);
      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = textColor;
      ctx.font = "bold 13px Syne, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(node.label || node.id, node.x, node.y);

      // Distance label
      if (distTable[node.id] !== undefined && distTable[node.id] !== Infinity) {
        ctx.font = "10px Space Mono, monospace";
        ctx.fillStyle = getCSSVar("--accent");
        ctx.fillText(
          distTable[node.id] === Infinity
            ? "∞"
            : Math.round(distTable[node.id] * 10) / 10,
          node.x,
          node.y + 32,
        );
      }
    }

    // Edge-in-progress
    if (tool === "addEdge" && edgeFrom && _mousePos) {
      const from = graph.nodes.find((n) => n.id === edgeFrom);
      if (from) {
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(_mousePos.x, _mousePos.y);
        ctx.strokeStyle = getCSSVar("--accent");
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }

  function drawArrow(ctx, from, to, color) {
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const r = 22;
    const ex = to.x - r * Math.cos(angle);
    const ey = to.y - r * Math.sin(angle);
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    ctx.lineTo(
      ex - 10 * Math.cos(angle - 0.4),
      ey - 10 * Math.sin(angle - 0.4),
    );
    ctx.lineTo(
      ex - 10 * Math.cos(angle + 0.4),
      ey - 10 * Math.sin(angle + 0.4),
    );
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  let _mousePos = null;

  /* ── Canvas interaction ── */
  function bindCanvas() {
    const c = canvas();
    if (!c) return;

    c.addEventListener("mousemove", (e) => {
      const r = c.getBoundingClientRect();
      _mousePos = { x: e.clientX - r.left, y: e.clientY - r.top };
      if (dragging) {
        dragging.x = _mousePos.x;
        dragging.y = _mousePos.y;
        draw();
      }
      if (tool === "addEdge" && edgeFrom) draw();
    });

    c.addEventListener("mousedown", (e) => {
      const r = c.getBoundingClientRect();
      const x = e.clientX - r.left,
        y = e.clientY - r.top;
      const hit = graph.nodes.find((n) => Math.hypot(n.x - x, n.y - y) < 22);

      if (tool === "addNode") {
        if (!hit) {
          const id =
            String.fromCharCode(65 + (graph.nodes.length % 26)) +
            (graph.nodes.length >= 26
              ? Math.floor(graph.nodes.length / 26)
              : "");
          graph.nodes.push({ id, label: id, x, y });
          if (!startNode) startNode = id;
          draw();
        } else {
          dragging = hit;
        }
      } else if (tool === "addEdge") {
        if (hit) {
          if (!edgeFrom) {
            edgeFrom = hit.id;
          } else if (edgeFrom !== hit.id) {
            const w = parseInt(
              document.getElementById("edgeWeight")?.value || "1",
            );
            graph.edges.push({ from: edgeFrom, to: hit.id, weight: w });
            edgeFrom = null;
            draw();
          } else {
            edgeFrom = null;
          }
        }
      } else if (tool === "setStart") {
        if (hit) {
          startNode = hit.id;
          draw();
        }
      } else if (tool === "setGoal") {
        if (hit) {
          goalNode = hit.id;
          draw();
        }
      } else if (tool === "deleteNode") {
        if (hit) {
          graph.nodes = graph.nodes.filter((n) => n.id !== hit.id);
          graph.edges = graph.edges.filter(
            (e) => e.from !== hit.id && e.to !== hit.id,
          );
          draw();
        }
      }
    });

    c.addEventListener("mouseup", () => {
      dragging = null;
    });
  }

  /* ── Animation ── */
  async function startAnim() {
    if (controller && controller.running) return;
    resetVisuals();
    clearLog(logEl());
    controller = new AnimController();
    controller.start();

    document.getElementById("graphStart").disabled = true;

    const algoMeta = GRAPH_ALGORITHMS[currentAlgo];
    let gen;
    if (algoMeta.noStart) gen = algoMeta.gen(graph);
    else if (algoMeta.needsGoal) gen = algoMeta.gen(graph, startNode, goalNode);
    else gen = algoMeta.gen(graph, startNode);

    try {
      for (const step of gen) {
        const delay = speedToDelay(
          document.getElementById("graphSpeed")?.value || 5,
        );
        await controller.tick(delay);
        applyStep(step);
      }
    } catch (e) {
      if (!(e instanceof StopError)) console.error(e);
    }
    document.getElementById("graphStart").disabled = false;
  }

  function applyStep(step) {
    const { type, message } = step;
    switch (type) {
      case "visit":
        if (step.node) visitedNodes.add(step.node);
        if (step.edge) activeEdges.add(`${step.edge[0]}-${step.edge[1]}`);
        break;
      case "process":
        if (step.node) {
          processedNodes.add(step.node);
          visitedNodes.delete(step.node);
        }
        if (step.edge) activeEdges.add(`${step.edge[0]}-${step.edge[1]}`);
        break;
      case "backtrack":
        if (step.node) visitedNodes.delete(step.node);
        break;
      case "update":
        if (step.node) {
          visitedNodes.add(step.node);
          if (step.dist) {
            distTable = {};
            for (const [k, v] of Object.entries(step.dist)) distTable[k] = v;
          }
        }
        break;
      case "relax":
        if (step.from && step.to) activeEdges.add(`${step.from}-${step.to}`);
        if (step.dist) {
          distTable = {};
          for (const [k, v] of Object.entries(step.dist)) distTable[k] = v;
        }
        break;
      case "addEdge":
        if (step.edge) mstEdges.add(`${step.edge.from}-${step.edge.to}`);
        if (step.edge) visitedNodes.add(step.edge.to);
        break;
      case "consider":
        if (step.from && step.to) activeEdges.add(`${step.from}-${step.to}`);
        break;
      case "done":
        if (step.visited) step.visited.forEach((n) => processedNodes.add(n));
        if (step.dist) {
          distTable = {};
          for (const [k, v] of Object.entries(step.dist)) distTable[k] = v;
        }
        if (step.mstEdges)
          step.mstEdges.forEach((e) => mstEdges.add(`${e.from}-${e.to}`));
        if (step.prev) buildPath(step.prev, goalNode || startNode);
        buildDistTable(step.dist || distTable, step.ids);
        break;
      case "init":
        if (step.dist) {
          distTable = {};
          for (const [k, v] of Object.entries(step.dist)) distTable[k] = v;
        }
        break;
    }
    draw();
    if (message)
      logStep(
        logEl(),
        message,
        type === "visit"
          ? "highlight"
          : type === "done"
            ? "warn"
            : type === "backtrack"
              ? "back"
              : "normal",
      );
  }

  function buildPath(prev, endId) {
    if (!endId || !prev) return;
    let cur = endId;
    while (cur && prev[cur]) {
      pathEdges.add(`${prev[cur]}-${cur}`);
      cur = prev[cur];
    }
  }

  function buildDistTable(dist, ids) {
    if (!dist) return;
    const wrap = document.getElementById("distTableWrap");
    if (!wrap) return;
    const keys = ids || Object.keys(dist);
    let html = `<h4>Distance Table</h4><table class="dist-table"><thead><tr><th>Node</th><th>Distance</th></tr></thead><tbody>`;
    for (const k of keys) {
      const v =
        dist[k] === undefined
          ? "—"
          : dist[k] === Infinity
            ? "∞"
            : Math.round(dist[k] * 100) / 100;
      html += `<tr><td>${k}</td><td>${v}</td></tr>`;
    }
    html += "</tbody></table>";
    wrap.innerHTML = html;
  }

  function resetVisuals() {
    visitedNodes.clear();
    processedNodes.clear();
    activeEdges.clear();
    mstEdges.clear();
    pathEdges.clear();
    distTable = {};
    draw();
    const wrap = document.getElementById("distTableWrap");
    if (wrap) wrap.innerHTML = "";
  }

  /* ── Toolbar ── */
  function buildToolbar() {
    const tb = document.getElementById("graphToolbar");
    tb.innerHTML = `
      <button class="tool-btn active" data-tool="addNode">+ Node</button>
      <button class="tool-btn" data-tool="addEdge">+ Edge</button>
      <label>Weight: <input type="number" id="edgeWeight" value="1" min="1" max="99" /></label>
      <button class="tool-btn" data-tool="setStart">▶ Start</button>
      <button class="tool-btn" data-tool="setGoal">⚑ Goal</button>
      <button class="tool-btn" data-tool="deleteNode">✕ Del</button>
      <button class="tool-btn" id="clearGraph">Clear All</button>
      <button class="tool-btn" id="randomGraph">Random Graph</button>
    `;
    tb.querySelectorAll("[data-tool]").forEach((btn) => {
      btn.addEventListener("click", () => {
        tool = btn.dataset.tool;
        edgeFrom = null;
        tb.querySelectorAll("[data-tool]").forEach((b) =>
          b.classList.remove("active"),
        );
        btn.classList.add("active");
      });
    });
    tb.querySelector("#clearGraph").addEventListener("click", () => {
      graph = { nodes: [], edges: [] };
      resetVisuals();
      startNode = null;
      goalNode = null;
      draw();
    });
    tb.querySelector("#randomGraph").addEventListener(
      "click",
      generateRandomGraph,
    );
  }

  function buildControls() {
    const ctrl = document.getElementById("graphControls");
    ctrl.innerHTML = `
      <button class="btn btn-primary" id="graphStart">▶ Start</button>
      <button class="btn btn-secondary" id="graphPause">⏸ Pause</button>
      <button class="btn btn-secondary" id="graphReset">↺ Reset</button>
      <div class="speed-control">
        <span>Speed:</span>
        <input type="range" id="graphSpeed" min="1" max="10" value="5" />
        <span id="graphSpeedVal">5</span>
      </div>
    `;
    ctrl.querySelector("#graphSpeed").addEventListener("input", (e) => {
      ctrl.querySelector("#graphSpeedVal").textContent = e.target.value;
    });
    ctrl.querySelector("#graphStart").addEventListener("click", startAnim);
    ctrl.querySelector("#graphPause").addEventListener("click", () => {
      if (!controller) return;
      if (controller.paused) {
        controller.resume();
        ctrl.querySelector("#graphPause").textContent = "⏸ Pause";
      } else {
        controller.pause();
        ctrl.querySelector("#graphPause").textContent = "▶ Resume";
      }
    });
    ctrl.querySelector("#graphReset").addEventListener("click", () => {
      if (controller) {
        controller.stop();
        controller = null;
      }
      resetVisuals();
      clearLog(logEl());
      ctrl.querySelector("#graphStart").disabled = false;
    });
  }

  /* ── Algo selector ── */
  function buildSelector() {
    const sel = document.getElementById("graphAlgoSelector");
    sel.innerHTML = "";
    for (const [key, meta] of Object.entries(GRAPH_ALGORITHMS)) {
      const btn = document.createElement("button");
      btn.className = "algo-btn" + (key === currentAlgo ? " active" : "");
      btn.textContent = meta.label;
      btn.addEventListener("click", () => {
        currentAlgo = key;
        sel
          .querySelectorAll(".algo-btn")
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        renderTheoryPanel(theorPan(), THEORY[meta.theory]);
        resetVisuals();
        clearLog(logEl());
      });
      sel.appendChild(btn);
    }
  }

  function generateRandomGraph() {
    graph = { nodes: [], edges: [] };
    const c = canvas();
    if (!c) return;
    const W = c.offsetWidth || 600,
      H = c.offsetHeight || 380;
    const count = 7;
    const labels = "ABCDEFGHIJ";
    for (let i = 0; i < count; i++) {
      graph.nodes.push({
        id: labels[i],
        label: labels[i],
        x: 60 + Math.random() * (W - 120),
        y: 50 + Math.random() * (H - 100),
      });
    }
    // Add random edges
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        if (Math.random() > 0.45) {
          const w = randInt(1, 15);
          graph.edges.push({
            from: graph.nodes[i].id,
            to: graph.nodes[j].id,
            weight: w,
          });
        }
      }
    }
    startNode = graph.nodes[0].id;
    goalNode = graph.nodes[count - 1].id;
    resetVisuals();
    draw();
  }

  /* ── Resize ── */
  function handleResize() {
    const c = canvas();
    if (!c) return;
    c.width = c.offsetWidth;
    c.height = c.offsetHeight;
    draw();
  }

  function init() {
    buildSelector();
    buildToolbar();
    buildControls();
    generateRandomGraph();
    bindCanvas();
    renderTheoryPanel(theorPan(), THEORY[GRAPH_ALGORITHMS[currentAlgo].theory]);
    window.addEventListener("resize", handleResize);
  }

  return { init };
})();
