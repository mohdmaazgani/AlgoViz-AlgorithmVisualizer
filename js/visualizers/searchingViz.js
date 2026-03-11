/* ═══════════════════════════════════════════
   visualizers/searchingViz.js
   ═══════════════════════════════════════════ */

const SearchingViz = (() => {
  let currentAlgo = "linearSearch";
  let arr = [];
  let target = 0;
  let controller = null;
  let stepGen = null;
  let comparisons = 0;

  const barWrap = () => document.getElementById("searchBarContainer");
  const logEl = () => document.getElementById("searchStepLog");
  const theorPanel = () => document.getElementById("searchingTheory");

  /* ── Selector ── */
  function buildSelector() {
    const sel = document.getElementById("searchingAlgoSelector");
    sel.innerHTML = "";
    for (const [key, meta] of Object.entries(SEARCH_ALGORITHMS)) {
      const btn = document.createElement("button");
      btn.className = "algo-btn" + (key === currentAlgo ? " active" : "");
      btn.textContent = meta.label;
      btn.addEventListener("click", () => {
        currentAlgo = key;
        sel
          .querySelectorAll(".algo-btn")
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        renderTheoryPanel(theorPanel(), THEORY[SEARCH_ALGORITHMS[key].theory]);
        reset();
      });
      sel.appendChild(btn);
    }
  }

  /* ── Render ── */
  function renderBars(highlights = {}) {
    const wrap = barWrap();
    if (!wrap) return;
    wrap.innerHTML = "";
    const maxVal = Math.max(...arr, 1);
    arr.forEach((val, i) => {
      const item = document.createElement("div");
      item.className = "search-bar-item";

      const label = document.createElement("div");
      label.className = "search-bar-label";
      label.textContent = i;

      const bar = document.createElement("div");
      bar.className = "bar";
      bar.style.height = `${(val / maxVal) * 200}px`;
      bar.setAttribute("data-value", val);

      const valEl = document.createElement("div");
      valEl.className = "search-bar-val";
      valEl.textContent = val;

      if (highlights.found === i) bar.classList.add("found");
      else if (highlights.current === i) bar.classList.add("current");
      else if (highlights.eliminated?.includes(i))
        bar.classList.add("eliminated");
      else if (
        highlights.range &&
        i >= highlights.range[0] &&
        i <= highlights.range[1]
      )
        bar.classList.add("range");

      item.append(label, bar, valEl);
      wrap.appendChild(item);
    });

    // Stats row
    let stats = wrap.querySelector(".search-stats");
    if (!stats) {
      stats = document.createElement("div");
      stats.className = "search-stats";
      wrap.appendChild(stats);
    }
    stats.innerHTML = `Comparisons: <span>${comparisons}</span>`;
  }

  /* ── Animation ── */
  async function startAnim() {
    if (controller && controller.running) return;
    clearLog(logEl());
    comparisons = 0;
    controller = new AnimController();
    controller.start();
    const gen = SEARCH_ALGORITHMS[currentAlgo].gen(arr, target);

    document.getElementById("searchStart").disabled = true;
    try {
      for (const step of gen) {
        const delay = speedToDelay(
          document.getElementById("searchSpeed")?.value || 5,
        );
        await controller.tick(delay);
        applyStep(step);
      }
    } catch (e) {
      if (!(e instanceof StopError)) console.error(e);
    }
    document.getElementById("searchStart").disabled = false;
  }

  let eliminated = [];
  let lastRange = null;

  function applyStep(step) {
    comparisons++;
    const { type, index, lo, hi, message } = step;
    let highlights = {};

    if (type === "current") {
      highlights = {
        current: index,
        range: lastRange ? [lastRange[0], lastRange[1]] : null,
      };
    } else if (type === "range") {
      lastRange = [lo, hi];
      highlights = { range: [lo, hi] };
    } else if (type === "found") {
      highlights = { found: index };
      logStep(logEl(), message, "highlight");
    } else if (type === "miss") {
      eliminated.push(index);
      highlights = { eliminated: [...eliminated] };
    } else if (type === "eliminate") {
      // binary: eliminate a half
      if (step.hi !== undefined && step.lo !== undefined) {
        for (let i = step.lo; i <= step.hi; i++) eliminated.push(i);
      }
      highlights = {
        eliminated: [...eliminated],
        range: lastRange ? [lastRange[0], lastRange[1]] : null,
      };
    } else if (type === "notFound") {
      highlights = { eliminated: arr.map((_, i) => i) };
    }

    renderBars(highlights);
    if (type !== "found") logStep(logEl(), message);
  }

  /* ── Step mode ── */
  function doStep() {
    if (!stepGen) {
      clearLog(logEl());
      comparisons = 0;
      eliminated = [];
      lastRange = null;
      stepGen = SEARCH_ALGORITHMS[currentAlgo].gen(arr, target);
    }
    const r = stepGen.next();
    if (!r.done && r.value) applyStep(r.value);
    if (r.done) stepGen = null;
  }

  function reset() {
    if (controller) {
      controller.stop();
      controller = null;
    }
    stepGen = null;
    eliminated = [];
    lastRange = null;
    comparisons = 0;
    clearLog(logEl());
    generateRandom();
  }

  function generateRandom() {
    const size = 16;
    const raw = randomArray(size, 1, 99);
    if (currentAlgo === "binarySearch") raw.sort((a, b) => a - b);
    arr = raw;
    target = arr[randInt(0, arr.length - 1)];
    document.getElementById("searchArrayInput").value = arr.join(",");
    document.getElementById("searchTargetInput").value = target;
    renderBars();
  }

  /* ── Controls ── */
  function buildControls() {
    const ctrl = document.getElementById("searchingControls");
    ctrl.innerHTML = `
      <button class="btn btn-primary" id="searchStart">▶ Start</button>
      <button class="btn btn-secondary" id="searchPause">⏸ Pause</button>
      <button class="btn btn-secondary" id="searchStep">⏭ Step</button>
      <button class="btn btn-secondary" id="searchReset">↺ Reset</button>
      <div class="speed-control">
        <span>Speed:</span>
        <input type="range" id="searchSpeed" min="1" max="10" value="5" />
        <span id="searchSpeedVal">5</span>
      </div>
    `;
    ctrl.querySelector("#searchSpeed").addEventListener("input", (e) => {
      ctrl.querySelector("#searchSpeedVal").textContent = e.target.value;
    });
    ctrl.querySelector("#searchStart").addEventListener("click", startAnim);
    ctrl.querySelector("#searchPause").addEventListener("click", () => {
      if (!controller) return;
      if (controller.paused) {
        controller.resume();
        ctrl.querySelector("#searchPause").textContent = "⏸ Pause";
      } else {
        controller.pause();
        ctrl.querySelector("#searchPause").textContent = "▶ Resume";
      }
    });
    ctrl.querySelector("#searchStep").addEventListener("click", doStep);
    ctrl.querySelector("#searchReset").addEventListener("click", reset);
  }

  function bindInputs() {
    document.getElementById("searchApply")?.addEventListener("click", () => {
      const parsedArr = parseNumberList(
        document.getElementById("searchArrayInput").value,
      );
      const t = parseFloat(document.getElementById("searchTargetInput").value);
      if (parsedArr.length > 0) {
        arr = parsedArr;
        target = isNaN(t) ? arr[0] : t;
        clearLog(logEl());
        eliminated = [];
        lastRange = null;
        renderBars();
      }
    });
    document
      .getElementById("searchRandomize")
      ?.addEventListener("click", () => {
        reset();
      });
  }

  function init() {
    buildSelector();
    buildControls();
    generateRandom();
    bindInputs();
    renderTheoryPanel(
      theorPanel(),
      THEORY[SEARCH_ALGORITHMS[currentAlgo].theory],
    );
  }

  return { init };
})();
