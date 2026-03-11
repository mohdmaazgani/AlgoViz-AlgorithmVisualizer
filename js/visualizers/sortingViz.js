/* ═══════════════════════════════════════════
   visualizers/sortingViz.js
   Renders the sorting bar chart and drives animation
   ═══════════════════════════════════════════ */

const SortingViz = (() => {
  let currentAlgo = "bubbleSort";
  let arr = [];
  let controller = null;
  let generator = null;
  let sortedIndices = new Set();

  const container = () => document.getElementById("barContainer");
  const logEl = () => document.getElementById("sortStepLog");
  const theorPanel = () => document.getElementById("sortingTheory");
  const sizeSlider = () => document.getElementById("arraySizeSlider");
  const sizeLabel = () => document.getElementById("arraySizeVal");

  /* ── Build algo selector ── */
  function buildSelector() {
    const sel = document.getElementById("sortingAlgoSelector");
    sel.innerHTML = "";
    for (const [key, meta] of Object.entries(SORT_ALGORITHMS)) {
      const btn = document.createElement("button");
      btn.className = "algo-btn" + (key === currentAlgo ? " active" : "");
      btn.textContent = meta.label;
      btn.addEventListener("click", () => {
        selectAlgo(key);
        sel
          .querySelectorAll(".algo-btn")
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
      });
      sel.appendChild(btn);
    }
  }

  function selectAlgo(key) {
    reset();
    currentAlgo = key;
    renderTheoryPanel(theorPanel(), THEORY[SORT_ALGORITHMS[key].theory]);
  }

  /* ── Build controls ── */
  function buildControls() {
    const ctrl = document.getElementById("sortingControls");
    const { startBtn, pauseBtn, stepBtn, resetBtn, speedSlider } =
      buildControls2(ctrl);
    startBtn.addEventListener("click", startAnim);
    pauseBtn.addEventListener("click", () => {
      if (controller) {
        if (controller.paused) {
          controller.resume();
          pauseBtn.textContent = "⏸ Pause";
        } else {
          controller.pause();
          pauseBtn.textContent = "▶ Resume";
        }
      }
    });
    stepBtn.addEventListener("click", () => {
      if (!controller || !controller.running) startStep();
      else controller.step();
    });
    resetBtn.addEventListener("click", reset);
  }

  /* ── Render bars ── */
  function renderBars(arr, highlights = {}) {
    const wrap = container();
    if (!wrap) return;
    const maxVal = Math.max(...arr);
    const barWidth = Math.max(
      4,
      Math.floor((wrap.offsetWidth - arr.length * 3) / arr.length),
    );

    // Reuse existing bars for performance
    const existing = wrap.children;
    while (existing.length > arr.length)
      wrap.removeChild(existing[existing.length - 1]);

    arr.forEach((val, i) => {
      let bar = existing[i];
      if (!bar) {
        bar = document.createElement("div");
        bar.className = "bar";
        wrap.appendChild(bar);
      }
      const pct = (val / maxVal) * 100;
      bar.style.height = `${pct}%`;
      bar.setAttribute("data-value", val);

      // Determine class
      bar.className = "bar";
      if (
        highlights.sorted &&
        (sortedIndices.has(i) || highlights.sorted.includes(i))
      )
        bar.classList.add("sorted");
      if (highlights.compare && highlights.compare.includes(i))
        bar.classList.add("compare");
      if (highlights.active && highlights.active.includes(i))
        bar.classList.add("active");
      if (highlights.pivot && highlights.pivot.includes(i))
        bar.classList.add("pivot");
      if (
        highlights.bucket !== undefined &&
        highlights.bucket !== null &&
        highlights.bucketIdx === i
      )
        bar.classList.add(`bucket-${highlights.bucket % 10}`);
    });
  }

  /* ── Animation loop ── */
  async function startAnim() {
    if (controller && controller.running) return;
    sortedIndices.clear();
    clearLog(logEl());
    controller = new AnimController();
    controller.start();
    generator = SORT_ALGORITHMS[currentAlgo].gen(arr);

    const ctrl = document.getElementById("sortingControls");
    ctrl.querySelector(".btn-primary").disabled = true;

    try {
      for (const step of generator) {
        const delay = speedToDelay(
          document.getElementById("speedSlider")?.value || 5,
        );
        await controller.tick(delay);
        applyStep(step);
      }
    } catch (e) {
      if (!(e instanceof StopError)) console.error(e);
    }
    ctrl.querySelector(".btn-primary").disabled = false;
  }

  function applyStep(step) {
    const { type, arr: newArr, indices, message, bucket } = step;
    if (newArr) arr = newArr;

    let highlights = {};
    if (type === "compare") highlights = { compare: indices };
    else if (type === "swap") highlights = { active: indices };
    else if (type === "pivot") highlights = { pivot: indices };
    else if (type === "sorted") {
      indices?.forEach((i) => sortedIndices.add(i));
      highlights = { sorted: [...sortedIndices] };
    } else if (type === "active") highlights = { active: indices };

    // Bucket / radix coloring
    if (bucket !== undefined && indices?.length === 1) {
      highlights.bucket = bucket;
      highlights.bucketIdx = indices[0];
    }

    renderBars(arr, highlights);
    logStep(
      logEl(),
      message,
      type === "swap" ? "highlight" : type === "sorted" ? "warn" : "normal",
    );
  }

  /* ── Step mode (no controller) ── */
  let stepGen = null;
  function startStep() {
    if (!stepGen) {
      sortedIndices.clear();
      clearLog(logEl());
      stepGen = SORT_ALGORITHMS[currentAlgo].gen(arr);
    }
    const result = stepGen.next();
    if (!result.done && result.value) applyStep(result.value);
    if (result.done) {
      stepGen = null;
    }
  }

  function reset() {
    if (controller) {
      controller.stop();
      controller = null;
    }
    stepGen = null;
    generator = null;
    sortedIndices.clear();
    clearLog(logEl());
    generateRandom();
    document.getElementById("sortingControls")?.querySelector(".btn-primary") &&
      (document
        .getElementById("sortingControls")
        .querySelector(".btn-primary").disabled = false);
  }

  function generateRandom() {
    const size = parseInt(sizeSlider()?.value || 30);
    arr = randomArray(size, 5, 100);
    renderBars(arr);
  }

  /* ── Custom input ── */
  function bindCustomInput() {
    document
      .getElementById("sortCustomApply")
      ?.addEventListener("click", () => {
        const parsed = parseNumberList(
          document.getElementById("sortCustomInput").value,
        );
        if (parsed.length > 1) {
          arr = parsed;
          renderBars(arr);
          clearLog(logEl());
        }
      });
    document.getElementById("sortRandomize")?.addEventListener("click", () => {
      reset();
      generateRandom();
    });
    sizeSlider()?.addEventListener("input", () => {
      sizeLabel().textContent = sizeSlider().value;
      generateRandom();
    });
  }

  /* ── Init ── */
  function init() {
    buildSelector();
    buildControls_();
    generateRandom();
    bindCustomInput();
    renderTheoryPanel(
      theorPanel(),
      THEORY[SORT_ALGORITHMS[currentAlgo].theory],
    );
  }

  function buildControls_() {
    const ctrl = document.getElementById("sortingControls");
    ctrl.innerHTML = `
      <button class="btn btn-primary" id="sortStart">▶ Start</button>
      <button class="btn btn-secondary" id="sortPause">⏸ Pause</button>
      <button class="btn btn-secondary" id="sortStep">⏭ Step</button>
      <button class="btn btn-secondary" id="sortReset">↺ Reset</button>
      <div class="speed-control">
        <span>Speed:</span>
        <input type="range" id="speedSlider" min="1" max="10" value="5" />
        <span id="speedVal">5</span>
      </div>
    `;
    ctrl.querySelector("#speedSlider").addEventListener("input", (e) => {
      ctrl.querySelector("#speedVal").textContent = e.target.value;
    });
    ctrl.querySelector("#sortStart").addEventListener("click", startAnim);
    ctrl.querySelector("#sortPause").addEventListener("click", () => {
      if (!controller) return;
      if (controller.paused) {
        controller.resume();
        ctrl.querySelector("#sortPause").textContent = "⏸ Pause";
      } else {
        controller.pause();
        ctrl.querySelector("#sortPause").textContent = "▶ Resume";
      }
    });
    ctrl.querySelector("#sortStep").addEventListener("click", () => {
      if (!controller || !controller.running) startStep();
      else controller.step();
    });
    ctrl.querySelector("#sortReset").addEventListener("click", reset);
  }

  return { init };
})();
