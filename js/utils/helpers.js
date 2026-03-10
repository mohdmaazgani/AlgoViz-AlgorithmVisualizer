/* ═══════════════════════════════════════════
   utils/helpers.js — Shared utility functions
   ═══════════════════════════════════════════ */

/**
 * Sleep for ms milliseconds (used in animation loops)
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate a random integer in [min, max]
 */
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate array of n random integers between lo and hi
 */
function randomArray(n, lo = 5, hi = 100) {
  return Array.from({ length: n }, () => randInt(lo, hi));
}

/**
 * Shuffle array in place (Fisher-Yates)
 */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Clamp a value between lo and hi
 */
function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

/**
 * Parse comma-separated string into number array
 */
function parseNumberList(str) {
  return str
    .split(",")
    .map((s) => parseFloat(s.trim()))
    .filter((n) => !isNaN(n));
}

/**
 * Deep clone an object / array
 */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Append a log entry to the step log container
 * @param {HTMLElement} container
 * @param {string} text
 * @param {'normal'|'highlight'|'warn'|'back'} type
 */
function logStep(container, text, type = "normal") {
  if (!container) return;
  const entry = document.createElement("div");
  entry.className = `log-entry ${type}`;
  const timeEl = document.createElement("span");
  timeEl.className = "log-time";
  const count = container.querySelectorAll(".log-entry").length + 1;
  timeEl.textContent = count;
  const textEl = document.createElement("span");
  textEl.className = "log-text";
  textEl.textContent = text;
  entry.append(timeEl, textEl);
  container.appendChild(entry);
  container.scrollTop = container.scrollHeight;
}

/**
 * Clear all log entries
 */
function clearLog(container) {
  if (container) container.innerHTML = "";
}

/**
 * Create standard control buttons
 * Returns { start, pause, step, reset, speedSlider, speedLabel }
 */
function buildControls(container, onStart, onPause, onStep, onReset) {
  container.innerHTML = "";

  const startBtn = makeBtn("▶ Start", "btn btn-primary", onStart);
  const pauseBtn = makeBtn("⏸ Pause", "btn btn-secondary", onPause);
  const stepBtn = makeBtn("⏭ Step", "btn btn-secondary", onStep);
  const resetBtn = makeBtn("↺ Reset", "btn btn-secondary", onReset);

  const speedWrap = document.createElement("div");
  speedWrap.className = "speed-control";
  speedWrap.innerHTML = `<span>Speed:</span>
    <input type="range" id="speedSlider" min="1" max="10" value="5" />
    <span id="speedLabel">5</span>`;

  container.append(startBtn, pauseBtn, stepBtn, resetBtn, speedWrap);

  const slider = speedWrap.querySelector("#speedSlider");
  const label = speedWrap.querySelector("#speedLabel");
  slider.addEventListener("input", () => {
    label.textContent = slider.value;
  });

  // State helpers
  pauseBtn.disabled = true;
  stepBtn.disabled = false;

  return { startBtn, pauseBtn, stepBtn, resetBtn, speedSlider: slider };
}

function makeBtn(text, cls, onClick) {
  const btn = document.createElement("button");
  btn.className = cls;
  btn.textContent = text;
  if (onClick) btn.addEventListener("click", onClick);
  return btn;
}

/**
 * Convert speed slider value (1-10) to delay in ms
 */
function speedToDelay(val) {
  // val=1 → 900ms, val=10 → 20ms
  return Math.round(1000 / (val * val * 0.12 + 0.5));
}
