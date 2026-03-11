/* ═══════════════════════════════════════════
   visualizers/backtrackingViz.js
   ═══════════════════════════════════════════ */

const BacktrackingViz = (() => {
  let currentAlgo = "nQueens";
  let controller = null;
  let stepGen = null;

  const canvasWrap = () => document.getElementById("backtrackCanvas");
  const logEl = () => document.getElementById("backtrackStepLog");
  const theorPan = () => document.getElementById("backtrackTheory");

  /* ── Selector ── */
  function buildSelector() {
    const sel = document.getElementById("backtrackingAlgoSelector");
    sel.innerHTML = "";
    for (const [key, meta] of Object.entries(BACKTRACK_ALGORITHMS)) {
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
        reset();
        buildVizArea();
      });
      sel.appendChild(btn);
    }
  }

  /* ── Options panel ── */
  function buildOptions() {
    const opt = document.getElementById("backtrackOptions");
    if (currentAlgo === "nQueens") {
      opt.innerHTML = `<label>Board size (N):
        <input type="number" id="queensN" value="6" min="4" max="12" />
      </label>`;
    } else if (currentAlgo === "tsp") {
      opt.innerHTML = `<label>Cities:
        <input type="number" id="tspCities" value="6" min="4" max="9" />
      </label>
      <button class="btn btn-secondary" id="tspRandomize">Randomize Cities</button>`;
      opt.querySelector("#tspRandomize")?.addEventListener("click", () => {
        buildVizArea();
      });
    } else if (currentAlgo === "sudoku") {
      opt.innerHTML = `<span style="color:var(--text-secondary);font-size:0.8rem;font-family:var(--font-mono)">Using classic sample puzzle</span>`;
    }
  }

  /* ── Viz area builder ── */
  function buildVizArea() {
    const wrap = canvasWrap();
    wrap.innerHTML = "";
    if (currentAlgo === "nQueens") buildQueensBoard(wrap);
    else if (currentAlgo === "tsp") buildTSPCanvas(wrap);
    else if (currentAlgo === "sudoku")
      buildSudokuBoard(
        wrap,
        SAMPLE_SUDOKU.map((r) => [...r]),
      );
  }

  /* ──── N-QUEENS ──── */
  let queensBoard = null;
  let queensN = 6;

  function buildQueensBoard(wrap) {
    queensN = parseInt(document.getElementById("queensN")?.value || 6);
    const board = Array.from({ length: queensN }, () => Array(queensN).fill(0));
    queensBoard = board;
    renderQueensBoard(wrap, board);
  }

  function renderQueensBoard(wrap, board, highlights = {}) {
    wrap.innerHTML = "";
    const grid = document.createElement("div");
    grid.className = "queens-board";
    grid.style.gridTemplateColumns = `repeat(${queensBoard.length}, 44px)`;
    for (let r = 0; r < queensBoard.length; r++) {
      for (let c = 0; c < queensBoard.length; c++) {
        const cell = document.createElement("div");
        cell.className =
          "queens-cell " + ((r + c) % 2 === 0 ? "light" : "dark");
        if (board[r][c] === 1) {
          cell.classList.add("queen");
          cell.textContent = "♛";
        }
        if (highlights.conflict?.some(([rr, cc]) => rr === r && cc === c))
          cell.classList.add("conflict");
        if (
          highlights.trying &&
          highlights.trying[0] === r &&
          highlights.trying[1] === c
        )
          cell.classList.add("trying");
        grid.appendChild(cell);
      }
    }
    wrap.appendChild(grid);
  }

  /* ──── TSP ──── */
  let tspCities = [];
  let tspCanvas = null;

  function buildTSPCanvas(wrap) {
    const n = parseInt(document.getElementById("tspCities")?.value || 6);
    tspCities = Array.from({ length: n }, (_, i) => ({
      x: 80 + Math.random() * 480,
      y: 60 + Math.random() * 280,
    }));
    const c = document.createElement("canvas");
    c.id = "tspCanvas";
    c.style.cssText =
      "width:100%;height:360px;display:block;border-radius:var(--radius-lg)";
    wrap.appendChild(c);
    tspCanvas = c;
    renderTSP([]);
  }

  function renderTSP(path, best = null) {
    const c = tspCanvas;
    if (!c) return;
    c.width = c.offsetWidth || 600;
    c.height = c.offsetHeight || 360;
    const ctx = c.getContext("2d");
    ctx.clearRect(0, 0, c.width, c.height);

    // Draw best path
    if (best && best.length > 1) {
      ctx.beginPath();
      ctx.moveTo(tspCities[best[0]].x, tspCities[best[0]].y);
      best.forEach((i) => ctx.lineTo(tspCities[i].x, tspCities[i].y));
      ctx.closePath();
      ctx.strokeStyle = "rgba(0,229,160,0.4)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw current path
    if (path.length > 1) {
      ctx.beginPath();
      ctx.moveTo(tspCities[path[0]].x, tspCities[path[0]].y);
      path.forEach((i) => ctx.lineTo(tspCities[i].x, tspCities[i].y));
      ctx.strokeStyle = "#ffd166";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Draw cities
    tspCities.forEach((city, i) => {
      const inPath = path.includes(i);
      ctx.beginPath();
      ctx.arc(city.x, city.y, 14, 0, Math.PI * 2);
      ctx.fillStyle = inPath ? "rgba(255,209,102,0.3)" : "rgba(26,26,32,0.8)";
      ctx.fill();
      ctx.strokeStyle = inPath ? "#ffd166" : "#3a3a50";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "#f0f0f5";
      ctx.font = "bold 11px Syne, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(i, city.x, city.y);
    });
  }

  /* ──── SUDOKU ──── */
  let sudokuInitial = null;

  function buildSudokuBoard(wrap, initial) {
    sudokuInitial = initial;
    renderSudokuBoard(wrap, initial, initial, {});
  }

  function renderSudokuBoard(wrap, initial, board, highlights) {
    wrap.innerHTML = "";
    wrap.style.display = "flex";
    wrap.style.justifyContent = "center";
    wrap.style.paddingTop = "20px";
    const grid = document.createElement("div");
    grid.className = "sudoku-grid";
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const cell = document.createElement("div");
        cell.className = "sudoku-cell";
        if (c === 2 || c === 5) cell.classList.add("box-border-right");
        if (r === 2 || r === 5) cell.classList.add("box-border-bottom");

        if (initial[r][c] !== 0) {
          cell.classList.add("given");
          cell.textContent = initial[r][c];
        } else if (board[r][c] !== 0) {
          cell.classList.add("filled");
          cell.textContent = board[r][c];
        }

        if (
          highlights.trying &&
          highlights.trying[0] === r &&
          highlights.trying[1] === c
        ) {
          cell.classList.add("trying");
          cell.textContent = highlights.trying[2];
        }
        if (
          highlights.conflict &&
          highlights.conflict[0] === r &&
          highlights.conflict[1] === c
        ) {
          cell.classList.add("conflict");
        }
        grid.appendChild(cell);
      }
    }
    wrap.appendChild(grid);
  }

  /* ── Animation ── */
  async function startAnim() {
    if (controller && controller.running) return;
    clearLog(logEl());
    controller = new AnimController();
    controller.start();
    document.getElementById("backtrackStart").disabled = true;

    let gen;
    if (currentAlgo === "nQueens") {
      queensN = parseInt(document.getElementById("queensN")?.value || 6);
      gen = nQueensGen(queensN);
    } else if (currentAlgo === "tsp") {
      gen = tspGen(tspCities);
    } else if (currentAlgo === "sudoku") {
      gen = sudokuGen(SAMPLE_SUDOKU.map((r) => [...r]));
    }

    let bestPath = null;

    try {
      for (const step of gen) {
        const delay = speedToDelay(
          document.getElementById("btSpeed")?.value || 5,
        );
        await controller.tick(delay);
        applyStep(step, bestPath);
        if (step.type === "best") bestPath = step.path;
      }
    } catch (e) {
      if (!(e instanceof StopError)) console.error(e);
    }
    document.getElementById("backtrackStart").disabled = false;
  }

  function applyStep(step, bestPath) {
    const wrap = canvasWrap();
    if (currentAlgo === "nQueens") {
      renderQueensBoard(wrap, step.board || queensBoard, {
        trying: step.type === "try" ? [step.row, step.col] : null,
        conflict: step.type === "conflict" ? [[step.row, step.col]] : null,
      });
    } else if (currentAlgo === "tsp") {
      renderTSP(step.path || [], bestPath);
    } else if (currentAlgo === "sudoku") {
      renderSudokuBoard(wrap, SAMPLE_SUDOKU, step.board || SAMPLE_SUDOKU, {
        trying: step.type === "try" ? [step.row, step.col, step.num] : null,
        conflict: step.type === "invalid" ? [step.row, step.col] : null,
      });
    }

    const msgType =
      step.type === "place" || step.type === "solution" || step.type === "best"
        ? "highlight"
        : step.type === "remove" || step.type === "backtrack"
          ? "back"
          : step.type === "conflict" || step.type === "prune"
            ? "warn"
            : "normal";
    if (step.message) logStep(logEl(), step.message, msgType);
  }

  function reset() {
    if (controller) {
      controller.stop();
      controller = null;
    }
    clearLog(logEl());
    buildVizArea();
    document.getElementById("backtrackStart")?.removeAttribute("disabled");
  }

  /* ── Controls ── */
  function buildControls() {
    const ctrl = document.getElementById("backtrackControls");
    ctrl.innerHTML = `
      <button class="btn btn-primary" id="backtrackStart">▶ Start</button>
      <button class="btn btn-secondary" id="backtrackPause">⏸ Pause</button>
      <button class="btn btn-secondary" id="backtrackReset">↺ Reset</button>
      <div class="speed-control">
        <span>Speed:</span>
        <input type="range" id="btSpeed" min="1" max="10" value="7" />
        <span id="btSpeedVal">7</span>
      </div>
    `;
    ctrl.querySelector("#btSpeed").addEventListener("input", (e) => {
      ctrl.querySelector("#btSpeedVal").textContent = e.target.value;
    });
    ctrl.querySelector("#backtrackStart").addEventListener("click", startAnim);
    ctrl.querySelector("#backtrackPause").addEventListener("click", () => {
      if (!controller) return;
      if (controller.paused) {
        controller.resume();
        ctrl.querySelector("#backtrackPause").textContent = "⏸ Pause";
      } else {
        controller.pause();
        ctrl.querySelector("#backtrackPause").textContent = "▶ Resume";
      }
    });
    ctrl.querySelector("#backtrackReset").addEventListener("click", reset);
  }

  function init() {
    buildSelector();
    buildOptions();
    buildControls();
    buildVizArea();
    renderTheoryPanel(
      theorPan(),
      THEORY[BACKTRACK_ALGORITHMS[currentAlgo].theory],
    );
  }

  return { init };
})();
