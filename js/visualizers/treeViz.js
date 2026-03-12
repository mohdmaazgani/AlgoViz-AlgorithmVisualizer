/* ═══════════════════════════════════════════
   visualizers/treeViz.js
   Canvas-based tree visualization
   ═══════════════════════════════════════════ */

const TreeViz = (() => {
  let currentAlgo = "bst";
  let tree = null;
  let highlightedNode = null;
  let highlightType = "default";
  let stepGen = null;

  const canvas = () => document.getElementById("treeCanvas");
  const logEl = () => document.getElementById("treeStepLog");
  const theorPan = () => document.getElementById("treeTheory");

  function getCSSVar(v) {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(v)
      .trim();
  }

  /* ── Selector ── */
  function buildSelector() {
    const sel = document.getElementById("treeAlgoSelector");
    sel.innerHTML = "";
    for (const [key, meta] of Object.entries(TREE_ALGORITHMS)) {
      const btn = document.createElement("button");
      btn.className = "algo-btn" + (key === currentAlgo ? " active" : "");
      btn.textContent = meta.label;
      btn.addEventListener("click", () => {
        currentAlgo = key;
        tree = new TREE_ALGORITHMS[key].TreeClass();
        highlightedNode = null;
        sel
          .querySelectorAll(".algo-btn")
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        renderTheoryPanel(theorPan(), THEORY[meta.theory]);
        clearLog(logEl());
        draw();
      });
      sel.appendChild(btn);
    }
  }

  /* ── Input row ── */
  function buildInputRow() {
    const row = document.getElementById("treeInputRow");
    row.innerHTML = `
      <input type="number" id="treeValInput" placeholder="Value" min="1" max="999" />
      <button class="btn btn-primary" id="treeInsert">Insert</button>
      <button class="btn btn-secondary" id="treeDelete">Delete</button>
      <button class="btn btn-secondary" id="treeSearch">Search</button>
      <button class="btn btn-accent" id="treeRandom">Random Fill</button>
      <button class="btn btn-secondary" id="treeClear">Clear</button>
    `;
    row.querySelector("#treeInsert").addEventListener("click", () => {
      const v = parseInt(row.querySelector("#treeValInput").value);
      if (isNaN(v)) return;
      stepGen = tree.insert(v)[Symbol.iterator]();
      runSteps();
    });
    row.querySelector("#treeDelete").addEventListener("click", () => {
      const v = parseInt(row.querySelector("#treeValInput").value);
      if (isNaN(v)) return;
      stepGen = tree.delete(v)[Symbol.iterator]();
      runSteps();
    });
    row.querySelector("#treeSearch").addEventListener("click", () => {
      const v = parseInt(row.querySelector("#treeValInput").value);
      if (isNaN(v)) return;
      stepGen = tree.search ? tree.search(v)[Symbol.iterator]() : null;
      if (stepGen) runSteps();
    });
    row.querySelector("#treeRandom").addEventListener("click", () => {
      tree = new TREE_ALGORITHMS[currentAlgo].TreeClass();
      const vals = shuffle(
        Array.from({ length: 10 }, (_, i) => randInt(1, 99)),
      );
      vals.forEach((v) => tree.insert(v));
      draw();
      clearLog(logEl());
    });
    row.querySelector("#treeClear").addEventListener("click", () => {
      tree = new TREE_ALGORITHMS[currentAlgo].TreeClass();
      highlightedNode = null;
      clearLog(logEl());
      draw();
    });
  }

  async function runSteps() {
    if (!stepGen) return;
    for (const step of { [Symbol.iterator]: () => stepGen }) {
      applyStep(step);
      await sleep(300);
    }
    stepGen = null;
    highlightedNode = null;
    draw();
  }

  function applyStep(step) {
    if (step.type === "compare") {
      highlightedNode = step.node;
      highlightType = "compare";
    } else if (step.type === "insert") {
      highlightedNode = step.node;
      highlightType = "insert";
    } else if (step.type === "found") {
      highlightedNode = step.node;
      highlightType = "found";
    } else if (step.type === "delete" || step.type === "replace") {
      highlightedNode = step.node;
      highlightType = "delete";
    } else if (step.type === "rotate") {
      highlightType = "rotate";
    }
    draw();
    if (step.message)
      logStep(
        logEl(),
        step.message,
        step.type === "insert"
          ? "highlight"
          : step.type === "found"
            ? "warn"
            : step.type === "rotate"
              ? "back"
              : "normal",
      );
  }

  /* ── Draw ── */
  function draw() {
    const c = canvas();
    if (!c) return;
    c.width = c.offsetWidth;
    c.height = c.offsetHeight;
    const ctx = c.getContext("2d");
    ctx.clearRect(0, 0, c.width, c.height);

    if (!tree) return;

    // Get root depending on tree type
    const root = currentAlgo === "redBlack" ? tree.root : tree.root;
    if (!root || (currentAlgo === "redBlack" && root === tree.NIL)) return;

    assignPositions(
      root,
      0,
      c.width,
      50,
      c.width / 4,
      currentAlgo === "redBlack" ? tree.NIL : null,
    );
    drawNode(ctx, root, currentAlgo === "redBlack" ? tree.NIL : null);
  }

  function assignPositions(node, left, right, y, xGap, NIL) {
    if (!node || node === NIL) return;
    node.x = (left + right) / 2;
    node.y = y;
    const half = (right - left) / 2;
    if (node.left && node.left !== NIL)
      assignPositions(node.left, left, node.x, y + 70, half / 2, NIL);
    if (node.right && node.right !== NIL)
      assignPositions(node.right, node.x, right, y + 70, half / 2, NIL);
  }

  function drawNode(ctx, node, NIL) {
    if (!node || node === NIL) return;

    // Draw children first
    if (node.left && node.left !== NIL) {
      drawEdge(ctx, node, node.left, node.left.bf);
      drawNode(ctx, node.left, NIL);
    }
    if (node.right && node.right !== NIL) {
      drawEdge(ctx, node, node.right, node.right.bf);
      drawNode(ctx, node.right, NIL);
    }

    // Node fill
    let fillColor = getCSSVar("--bg-card");
    let strokeColor = getCSSVar("--border");
    let textColor = getCSSVar("--text-primary");

    // Red-Black coloring
    if (node.color === "red") {
      strokeColor = "#ef476f";
      fillColor = "rgba(239,71,111,0.18)";
    }
    if (node.color === "black" && node.val !== null) {
      strokeColor = getCSSVar("--text-muted");
    }

    // Highlight
    if (node.val === highlightedNode) {
      if (highlightType === "compare") {
        strokeColor = getCSSVar("--compare");
        fillColor = getCSSVar("--compare-dim");
      }
      if (highlightType === "insert") {
        strokeColor = getCSSVar("--accent");
        fillColor = getCSSVar("--accent-dim");
      }
      if (highlightType === "found") {
        strokeColor = getCSSVar("--sorted");
        fillColor = "rgba(6,214,160,0.2)";
      }
      if (highlightType === "delete") {
        strokeColor = getCSSVar("--highlight");
        fillColor = getCSSVar("--highlight-dim");
      }
    }

    ctx.beginPath();
    ctx.arc(node.x, node.y, 22, 0, Math.PI * 2);
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = textColor;
    ctx.font = "bold 12px Syne, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(node.val, node.x, node.y);

    // Balance factor for AVL
    if (node.bf !== undefined) {
      ctx.font = "9px Space Mono, monospace";
      ctx.fillStyle =
        node.bf > 1 || node.bf < -1
          ? getCSSVar("--highlight")
          : getCSSVar("--text-muted");
      ctx.fillText(`bf:${node.bf}`, node.x, node.y + 32);
    }
    // Height for AVL
    if (node.height !== undefined) {
      ctx.font = "9px Space Mono, monospace";
      ctx.fillStyle = getCSSVar("--text-muted");
      ctx.fillText(`h:${node.height}`, node.x - 26, node.y - 28);
    }
  }

  function drawEdge(ctx, from, to, bf) {
    ctx.beginPath();
    ctx.moveTo(from.x, from.y + 22);
    ctx.lineTo(to.x, to.y - 22);
    ctx.strokeStyle = getCSSVar("--border");
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  /* ── Resize ── */
  function handleResize() {
    draw();
  }

  /* ── Init ── */
  function init() {
    buildSelector();
    buildInputRow();
    tree = new TREE_ALGORITHMS[currentAlgo].TreeClass();
    // Pre-load some values
    [50, 30, 70, 20, 40, 60, 80].forEach((v) => tree.insert(v));
    draw();
    renderTheoryPanel(theorPan(), THEORY[TREE_ALGORITHMS[currentAlgo].theory]);
    window.addEventListener("resize", handleResize);
  }

  return { init };
})();
