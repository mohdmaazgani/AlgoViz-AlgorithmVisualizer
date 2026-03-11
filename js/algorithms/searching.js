/* ═══════════════════════════════════════════
   algorithms/searching.js
   ═══════════════════════════════════════════ */

/**
 * Linear Search — O(n)
 * Scans each element sequentially.
 */
function* linearSearchGen(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    yield {
      type: "current",
      index: i,
      message: `Checking index ${i}: ${arr[i]} == ${target}?`,
    };
    if (arr[i] === target) {
      yield {
        type: "found",
        index: i,
        message: `Found ${target} at index ${i}! ✓`,
      };
      return;
    }
    yield { type: "miss", index: i, message: `${arr[i]} ≠ ${target}, move on` };
  }
  yield { type: "notFound", message: `${target} not found in array` };
}

/**
 * Binary Search — O(log n)
 * Requires sorted array. Halves search range each step.
 */
function* binarySearchGen(arr, target) {
  let lo = 0,
    hi = arr.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    yield {
      type: "range",
      lo,
      hi,
      mid,
      message: `Search range [${lo}..${hi}], mid = ${mid}`,
    };
    yield {
      type: "current",
      index: mid,
      lo,
      hi,
      message: `Checking arr[${mid}] = ${arr[mid]}`,
    };
    if (arr[mid] === target) {
      yield {
        type: "found",
        index: mid,
        lo,
        hi,
        message: `Found ${target} at index ${mid}! ✓`,
      };
      return;
    } else if (arr[mid] < target) {
      yield {
        type: "eliminate",
        lo,
        hi: mid,
        message: `${arr[mid]} < ${target}, eliminate left half`,
      };
      lo = mid + 1;
    } else {
      yield {
        type: "eliminate",
        lo: mid,
        hi,
        message: `${arr[mid]} > ${target}, eliminate right half`,
      };
      hi = mid - 1;
    }
  }
  yield { type: "notFound", message: `${target} not found in array` };
}

const SEARCH_ALGORITHMS = {
  linearSearch: {
    gen: linearSearchGen,
    label: "Linear Search",
    theory: "linearSearch",
  },
  binarySearch: {
    gen: binarySearchGen,
    label: "Binary Search",
    theory: "binarySearch",
  },
};
