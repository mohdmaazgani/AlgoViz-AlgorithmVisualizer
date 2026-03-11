/* ═══════════════════════════════════════════
   algorithms/sorting.js
   Pure algorithm generators that yield steps.
   Each step = { type, indices, message }
   ═══════════════════════════════════════════ */

/**
 * Bubble Sort — O(n²)
 * Repeatedly compares adjacent pairs and swaps if out of order.
 */
function* bubbleSortGen(arr) {
  const a = [...arr];
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      yield {
        type: "compare",
        indices: [j, j + 1],
        arr: [...a],
        message: `Comparing ${a[j]} and ${a[j + 1]}`,
      };
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        yield {
          type: "swap",
          indices: [j, j + 1],
          arr: [...a],
          message: `Swapping ${a[j]} ↔ ${a[j + 1]}`,
        };
      }
    }
    yield {
      type: "sorted",
      indices: [n - i - 1],
      arr: [...a],
      message: `Position ${n - i - 1} is sorted`,
    };
  }
  yield {
    type: "sorted",
    indices: [0],
    arr: [...a],
    message: "Array is sorted!",
  };
}

/**
 * Selection Sort — O(n²)
 * Finds the minimum in each pass and places it in position.
 */
function* selectionSortGen(arr) {
  const a = [...arr];
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    yield {
      type: "active",
      indices: [i],
      arr: [...a],
      message: `Looking for minimum from index ${i}`,
    };
    for (let j = i + 1; j < n; j++) {
      yield {
        type: "compare",
        indices: [j, minIdx],
        arr: [...a],
        message: `Comparing ${a[j]} with current min ${a[minIdx]}`,
      };
      if (a[j] < a[minIdx]) {
        minIdx = j;
        yield {
          type: "active",
          indices: [minIdx],
          arr: [...a],
          message: `New minimum: ${a[minIdx]} at index ${minIdx}`,
        };
      }
    }
    if (minIdx !== i) {
      [a[i], a[minIdx]] = [a[minIdx], a[i]];
      yield {
        type: "swap",
        indices: [i, minIdx],
        arr: [...a],
        message: `Placing minimum ${a[i]} at index ${i}`,
      };
    }
    yield {
      type: "sorted",
      indices: [i],
      arr: [...a],
      message: `Index ${i} sorted`,
    };
  }
  yield {
    type: "sorted",
    indices: [n - 1],
    arr: [...a],
    message: "Array is sorted!",
  };
}

/**
 * Insertion Sort — O(n²) / O(n) best
 * Inserts each element into its correct position in the sorted portion.
 */
function* insertionSortGen(arr) {
  const a = [...arr];
  const n = a.length;
  yield {
    type: "sorted",
    indices: [0],
    arr: [...a],
    message: "Index 0 trivially sorted",
  };
  for (let i = 1; i < n; i++) {
    const key = a[i];
    let j = i - 1;
    yield {
      type: "active",
      indices: [i],
      arr: [...a],
      message: `Inserting ${key} into sorted portion`,
    };
    while (j >= 0 && a[j] > key) {
      yield {
        type: "compare",
        indices: [j, j + 1],
        arr: [...a],
        message: `${a[j]} > ${key}, shifting right`,
      };
      a[j + 1] = a[j];
      yield {
        type: "swap",
        indices: [j + 1],
        arr: [...a],
        message: `Shifted ${a[j + 1]} to index ${j + 1}`,
      };
      j--;
    }
    a[j + 1] = key;
    yield {
      type: "sorted",
      indices: [j + 1],
      arr: [...a],
      message: `Placed ${key} at index ${j + 1}`,
    };
  }
  yield { type: "done", arr: [...a], message: "Array is sorted!" };
}

/**
 * Merge Sort — O(n log n)
 * Divide and conquer — split, sort halves, merge.
 */
function* mergeSortGen(arr) {
  const a = [...arr];
  yield* mergeSortHelper(a, 0, a.length - 1);
  yield { type: "done", arr: [...a], message: "Merge Sort complete!" };
}

function* mergeSortHelper(a, l, r) {
  if (l >= r) return;
  const mid = Math.floor((l + r) / 2);
  yield {
    type: "active",
    indices: [l, r],
    arr: [...a],
    message: `Dividing [${l}..${r}] at mid=${mid}`,
  };
  yield* mergeSortHelper(a, l, mid);
  yield* mergeSortHelper(a, mid + 1, r);
  yield* mergeHelper(a, l, mid, r);
}

function* mergeHelper(a, l, mid, r) {
  const left = a.slice(l, mid + 1);
  const right = a.slice(mid + 1, r + 1);
  let i = 0,
    j = 0,
    k = l;
  yield {
    type: "compare",
    indices: Array.from({ length: r - l + 1 }, (_, x) => l + x),
    arr: [...a],
    message: `Merging [${l}..${mid}] and [${mid + 1}..${r}]`,
  };
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      a[k] = left[i++];
    } else {
      a[k] = right[j++];
    }
    yield {
      type: "swap",
      indices: [k],
      arr: [...a],
      message: `Placing ${a[k]} at index ${k}`,
    };
    k++;
  }
  while (i < left.length) {
    a[k] = left[i++];
    yield {
      type: "swap",
      indices: [k],
      arr: [...a],
      message: `Placing ${a[k]}`,
    };
    k++;
  }
  while (j < right.length) {
    a[k] = right[j++];
    yield {
      type: "swap",
      indices: [k],
      arr: [...a],
      message: `Placing ${a[k]}`,
    };
    k++;
  }
  for (let x = l; x <= r; x++) {
    yield {
      type: "sorted",
      indices: [x],
      arr: [...a],
      message: `Merged segment [${l}..${r}]`,
    };
  }
}

/**
 * Quick Sort — O(n log n) avg
 * Partitions array around a pivot, recursively sorts partitions.
 */
function* quickSortGen(arr) {
  const a = [...arr];
  yield* quickSortHelper(a, 0, a.length - 1);
  yield { type: "done", arr: [...a], message: "Quick Sort complete!" };
}

function* quickSortHelper(a, lo, hi) {
  if (lo < hi) {
    const [pivotIdx, steps] = yield* partitionGen(a, lo, hi);
    yield* quickSortHelper(a, lo, pivotIdx - 1);
    yield* quickSortHelper(a, pivotIdx + 1, hi);
  } else if (lo === hi) {
    yield {
      type: "sorted",
      indices: [lo],
      arr: [...a],
      message: `Single element ${a[lo]} sorted`,
    };
  }
}

function* partitionGen(a, lo, hi) {
  const pivot = a[hi];
  yield {
    type: "pivot",
    indices: [hi],
    arr: [...a],
    message: `Pivot = ${pivot}`,
  };
  let i = lo - 1;
  for (let j = lo; j < hi; j++) {
    yield {
      type: "compare",
      indices: [j, hi],
      arr: [...a],
      message: `Comparing ${a[j]} with pivot ${pivot}`,
    };
    if (a[j] <= pivot) {
      i++;
      [a[i], a[j]] = [a[j], a[i]];
      if (i !== j)
        yield {
          type: "swap",
          indices: [i, j],
          arr: [...a],
          message: `Swapping ${a[i]} ↔ ${a[j]}`,
        };
    }
  }
  [a[i + 1], a[hi]] = [a[hi], a[i + 1]];
  yield {
    type: "sorted",
    indices: [i + 1],
    arr: [...a],
    message: `Pivot ${pivot} placed at index ${i + 1}`,
  };
  return [i + 1];
}

/**
 * Heap Sort — O(n log n)
 * Builds a max-heap, then extracts max repeatedly.
 */
function* heapSortGen(arr) {
  const a = [...arr];
  const n = a.length;
  // Build max-heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    yield* heapify(a, n, i);
  }
  yield {
    type: "compare",
    indices: Array.from({ length: n }, (_, i) => i),
    arr: [...a],
    message: "Max-heap built",
  };
  // Extract elements
  for (let i = n - 1; i > 0; i--) {
    [a[0], a[i]] = [a[i], a[0]];
    yield {
      type: "swap",
      indices: [0, i],
      arr: [...a],
      message: `Placed ${a[i]} at position ${i}`,
    };
    yield {
      type: "sorted",
      indices: [i],
      arr: [...a],
      message: `Index ${i} sorted`,
    };
    yield* heapify(a, i, 0);
  }
  yield { type: "done", arr: [...a], message: "Heap Sort complete!" };
}

function* heapify(a, n, i) {
  let largest = i,
    l = 2 * i + 1,
    r = 2 * i + 2;
  if (l < n && a[l] > a[largest]) largest = l;
  if (r < n && a[r] > a[largest]) largest = r;
  if (largest !== i) {
    yield {
      type: "compare",
      indices: [i, largest],
      arr: [...a],
      message: `Heapifying: ${a[i]} ↔ ${a[largest]}`,
    };
    [a[i], a[largest]] = [a[largest], a[i]];
    yield {
      type: "swap",
      indices: [i, largest],
      arr: [...a],
      message: `Swapped ${a[i]} and ${a[largest]}`,
    };
    yield* heapify(a, n, largest);
  }
}

/**
 * Shell Sort — O(n log²n)
 * Generalized insertion sort with decreasing gap.
 */
function* shellSortGen(arr) {
  const a = [...arr];
  const n = a.length;
  let gap = Math.floor(n / 2);
  while (gap > 0) {
    yield {
      type: "active",
      indices: [],
      arr: [...a],
      message: `Shell Sort pass with gap = ${gap}`,
    };
    for (let i = gap; i < n; i++) {
      const temp = a[i];
      let j = i;
      while (j >= gap && a[j - gap] > temp) {
        yield {
          type: "compare",
          indices: [j, j - gap],
          arr: [...a],
          message: `Comparing ${a[j - gap]} and ${temp} (gap=${gap})`,
        };
        a[j] = a[j - gap];
        yield {
          type: "swap",
          indices: [j],
          arr: [...a],
          message: `Shifted ${a[j]} right`,
        };
        j -= gap;
      }
      a[j] = temp;
    }
    gap = Math.floor(gap / 2);
  }
  yield { type: "done", arr: [...a], message: "Shell Sort complete!" };
}

/**
 * Radix Sort — O(nk)
 * Sorts integers digit by digit using counting sort.
 */
function* radixSortGen(arr) {
  const a = [...arr];
  const max = Math.max(...a);
  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
    yield {
      type: "active",
      indices: [],
      arr: [...a],
      message: `Sorting by digit at place value ${exp}`,
    };
    const output = new Array(a.length).fill(0);
    const count = new Array(10).fill(0);
    for (let i = 0; i < a.length; i++) {
      const digit = Math.floor(a[i] / exp) % 10;
      count[digit]++;
      yield {
        type: "compare",
        indices: [i],
        arr: [...a],
        message: `Digit of ${a[i]} at ${exp}s place: ${digit}`,
        bucket: digit,
      };
    }
    for (let i = 1; i < 10; i++) count[i] += count[i - 1];
    for (let i = a.length - 1; i >= 0; i--) {
      const digit = Math.floor(a[i] / exp) % 10;
      output[--count[digit]] = a[i];
    }
    for (let i = 0; i < a.length; i++) a[i] = output[i];
    yield {
      type: "swap",
      indices: Array.from({ length: a.length }, (_, i) => i),
      arr: [...a],
      message: `After pass for ${exp}s place`,
    };
  }
  yield { type: "done", arr: [...a], message: "Radix Sort complete!" };
}

/**
 * Bucket Sort — O(n+k) avg
 * Distributes elements into buckets, sorts each.
 */
function* bucketSortGen(arr) {
  const a = [...arr];
  const n = a.length;
  const max = Math.max(...a);
  const buckets = Array.from({ length: n }, () => []);
  for (let i = 0; i < n; i++) {
    const bi = Math.min(Math.floor((a[i] / max) * (n - 1)), n - 1);
    buckets[bi].push(a[i]);
    yield {
      type: "compare",
      indices: [i],
      arr: [...a],
      message: `${a[i]} → Bucket ${bi}`,
      bucket: bi % 10,
    };
  }
  // Sort each bucket (insertion sort)
  let k = 0;
  for (let b = 0; b < n; b++) {
    buckets[b].sort((x, y) => x - y);
    for (const val of buckets[b]) {
      a[k] = val;
      yield {
        type: "sorted",
        indices: [k],
        arr: [...a],
        message: `Placed ${val} from bucket ${b}`,
      };
      k++;
    }
  }
  yield { type: "done", arr: [...a], message: "Bucket Sort complete!" };
}

/* ── Registry ── */
const SORT_ALGORITHMS = {
  bubbleSort: { gen: bubbleSortGen, label: "Bubble", theory: "bubbleSort" },
  selectionSort: {
    gen: selectionSortGen,
    label: "Selection",
    theory: "selectionSort",
  },
  insertionSort: {
    gen: insertionSortGen,
    label: "Insertion",
    theory: "insertionSort",
  },
  mergeSort: { gen: mergeSortGen, label: "Merge", theory: "mergeSort" },
  quickSort: { gen: quickSortGen, label: "Quick", theory: "quickSort" },
  heapSort: { gen: heapSortGen, label: "Heap", theory: "heapSort" },
  shellSort: { gen: shellSortGen, label: "Shell", theory: "shellSort" },
  radixSort: { gen: radixSortGen, label: "Radix", theory: "radixSort" },
  bucketSort: { gen: bucketSortGen, label: "Bucket", theory: "bucketSort" },
};
