/* ═══════════════════════════════════════════
   utils/theory.js — Theory panel content
   ═══════════════════════════════════════════ */

/**
 * Render a collapsible theory panel inside `container` with `data`.
 * data = { title, description, pseudocode, complexity, useCase }
 */
function renderTheoryPanel(container, data) {
  if (!container || !data) return;
  container.innerHTML = "";

  const sections = [
    {
      title: "📖 Explanation",
      content: `<p>${data.description || ""}</p>`,
    },
    {
      title: "⌨️ Pseudocode",
      content: `<pre class="pseudocode">${data.pseudocode || ""}</pre>`,
    },
    {
      title: "⏱ Complexity",
      content: buildComplexityTable(data.complexity),
    },
    {
      title: "💡 When to Use",
      content: `<p>${data.useCase || ""}</p>`,
    },
  ];

  sections.forEach((sec, i) => {
    const wrap = document.createElement("div");
    wrap.className = "theory-section";

    const btn = document.createElement("button");
    btn.className = "theory-toggle" + (i === 0 ? " open" : "");
    btn.innerHTML = `<span>${sec.title}</span><span class="arrow">›</span>`;

    const body = document.createElement("div");
    body.className = "theory-content" + (i === 0 ? " open" : "");
    body.innerHTML = sec.content;

    btn.addEventListener("click", () => {
      btn.classList.toggle("open");
      body.classList.toggle("open");
    });

    wrap.append(btn, body);
    container.appendChild(wrap);
  });
}

function buildComplexityTable(c) {
  if (!c) return "";
  return `<table class="complexity-table">
    <thead><tr><th>Case</th><th>Time</th><th>Space</th></tr></thead>
    <tbody>
      <tr><td>Best</td><td class="best">${c.timeBest || "—"}</td><td rowspan="3">${c.space || "—"}</td></tr>
      <tr><td>Average</td><td class="avg">${c.timeAvg || "—"}</td></tr>
      <tr><td>Worst</td><td class="worst">${c.timeWorst || "—"}</td></tr>
    </tbody>
  </table>`;
}

/* ── Theory Data ── */

const THEORY = {
  /* ── SORTING ── */
  bubbleSort: {
    description:
      "Bubble Sort repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order. The pass through the list is repeated until no swaps are needed.",
    pseudocode: `for i = 0 to n-1:
  for j = 0 to n-i-2:
    if arr[j] > arr[j+1]:
      swap(arr[j], arr[j+1])`,
    complexity: {
      timeBest: "O(n)",
      timeAvg: "O(n²)",
      timeWorst: "O(n²)",
      space: "O(1)",
    },
    useCase:
      "Educational purposes. Nearly-sorted small arrays. Simple to implement.",
  },
  selectionSort: {
    description:
      "Selection Sort divides the array into a sorted and unsorted portion. It repeatedly finds the minimum element from the unsorted portion and places it at the beginning of the sorted portion.",
    pseudocode: `for i = 0 to n-1:
  min_idx = i
  for j = i+1 to n:
    if arr[j] < arr[min_idx]:
      min_idx = j
  swap(arr[i], arr[min_idx])`,
    complexity: {
      timeBest: "O(n²)",
      timeAvg: "O(n²)",
      timeWorst: "O(n²)",
      space: "O(1)",
    },
    useCase:
      "When memory writes are costly. Simple implementation needed. Small datasets.",
  },
  insertionSort: {
    description:
      "Insertion Sort builds the final sorted array one item at a time. It picks each element and inserts it into its correct position among the already-sorted elements.",
    pseudocode: `for i = 1 to n-1:
  key = arr[i]
  j = i - 1
  while j >= 0 and arr[j] > key:
    arr[j+1] = arr[j]
    j -= 1
  arr[j+1] = key`,
    complexity: {
      timeBest: "O(n)",
      timeAvg: "O(n²)",
      timeWorst: "O(n²)",
      space: "O(1)",
    },
    useCase:
      "Small datasets. Nearly sorted arrays. Online sorting (stream of data). Hybrid algorithms (TimSort).",
  },
  mergeSort: {
    description:
      "Merge Sort is a divide-and-conquer algorithm that splits the array in half, recursively sorts each half, then merges them back together in sorted order.",
    pseudocode: `mergeSort(arr, l, r):
  if l < r:
    mid = (l + r) / 2
    mergeSort(arr, l, mid)
    mergeSort(arr, mid+1, r)
    merge(arr, l, mid, r)

merge(arr, l, mid, r):
  // copy to temp arrays
  // merge back in order`,
    complexity: {
      timeBest: "O(n log n)",
      timeAvg: "O(n log n)",
      timeWorst: "O(n log n)",
      space: "O(n)",
    },
    useCase:
      "Large datasets. Stable sort required. Linked lists. External sorting.",
  },
  quickSort: {
    description:
      "Quick Sort picks a pivot element, partitions the array around it (smaller elements to the left, larger to the right), then recursively sorts each partition.",
    pseudocode: `quickSort(arr, lo, hi):
  if lo < hi:
    p = partition(arr, lo, hi)
    quickSort(arr, lo, p-1)
    quickSort(arr, p+1, hi)

partition(arr, lo, hi):
  pivot = arr[hi]
  i = lo - 1
  for j = lo to hi-1:
    if arr[j] <= pivot:
      i++; swap(arr[i], arr[j])
  swap(arr[i+1], arr[hi])
  return i+1`,
    complexity: {
      timeBest: "O(n log n)",
      timeAvg: "O(n log n)",
      timeWorst: "O(n²)",
      space: "O(log n)",
    },
    useCase:
      "General-purpose sorting. Cache-friendly. In-place sorting needed.",
  },
  heapSort: {
    description:
      "Heap Sort converts the array into a max-heap, then repeatedly extracts the maximum element and rebuilds the heap until sorted.",
    pseudocode: `heapSort(arr):
  buildMaxHeap(arr)
  for i = n-1 to 1:
    swap(arr[0], arr[i])
    heapify(arr, 0, i)

heapify(arr, i, n):
  largest = i
  l = 2i+1; r = 2i+2
  if l<n and arr[l]>arr[largest]: largest=l
  if r<n and arr[r]>arr[largest]: largest=r
  if largest != i:
    swap; heapify(arr, largest, n)`,
    complexity: {
      timeBest: "O(n log n)",
      timeAvg: "O(n log n)",
      timeWorst: "O(n log n)",
      space: "O(1)",
    },
    useCase:
      "Guaranteed O(n log n). In-place sorting. Priority queue implementations.",
  },
  shellSort: {
    description:
      "Shell Sort is an improved Insertion Sort that first sorts elements far apart, then progressively reduces the gap to perform a final insertion sort on a nearly-sorted array.",
    pseudocode: `shellSort(arr):
  gap = n / 2
  while gap > 0:
    for i = gap to n:
      temp = arr[i]
      j = i
      while j >= gap and arr[j-gap] > temp:
        arr[j] = arr[j-gap]
        j -= gap
      arr[j] = temp
    gap = gap / 2`,
    complexity: {
      timeBest: "O(n log n)",
      timeAvg: "O(n log²n)",
      timeWorst: "O(n²)",
      space: "O(1)",
    },
    useCase:
      "Medium-size datasets. Hardware contexts with small stack. Embedded systems.",
  },
  radixSort: {
    description:
      "Radix Sort sorts numbers digit by digit from least significant to most significant using a stable counting sort as a subroutine. Works only on integers.",
    pseudocode: `radixSort(arr):
  max = getMax(arr)
  for exp = 1; max/exp > 0; exp *= 10:
    countingSort(arr, exp)

countingSort(arr, exp):
  output[n], count[10] = 0
  for i in arr: count[(i/exp)%10]++
  for i=1 to 9: count[i] += count[i-1]
  for i=n-1 to 0:
    output[count[(arr[i]/exp)%10]-1] = arr[i]
    count[(arr[i]/exp)%10]--
  copy output to arr`,
    complexity: {
      timeBest: "O(nk)",
      timeAvg: "O(nk)",
      timeWorst: "O(nk)",
      space: "O(n+k)",
    },
    useCase:
      "Integer sorting. Fixed-length strings. Large datasets with small key range.",
  },
  bucketSort: {
    description:
      "Bucket Sort distributes elements into a number of buckets, sorts each bucket individually (using Insertion Sort), then concatenates the buckets.",
    pseudocode: `bucketSort(arr):
  n = arr.length
  buckets = array of n empty lists
  for num in arr:
    idx = floor(num / max * n)
    buckets[idx].append(num)
  for bucket in buckets:
    insertionSort(bucket)
  return concat(buckets)`,
    complexity: {
      timeBest: "O(n+k)",
      timeAvg: "O(n+k)",
      timeWorst: "O(n²)",
      space: "O(n+k)",
    },
    useCase:
      "Uniformly distributed floating-point numbers. When counting sort key range is large.",
  },

  /* ── SEARCHING ── */
  linearSearch: {
    description:
      "Linear Search scans each element sequentially until the target is found or the array ends. Works on both sorted and unsorted arrays.",
    pseudocode: `linearSearch(arr, target):
  for i = 0 to n-1:
    if arr[i] == target:
      return i
  return -1`,
    complexity: {
      timeBest: "O(1)",
      timeAvg: "O(n)",
      timeWorst: "O(n)",
      space: "O(1)",
    },
    useCase:
      "Unsorted arrays. Small datasets. Linked lists where random access is unavailable.",
  },
  binarySearch: {
    description:
      "Binary Search works on sorted arrays. It repeatedly halves the search range by comparing the target with the middle element.",
    pseudocode: `binarySearch(arr, target):
  lo = 0; hi = n - 1
  while lo <= hi:
    mid = (lo + hi) / 2
    if arr[mid] == target: return mid
    elif arr[mid] < target: lo = mid + 1
    else: hi = mid - 1
  return -1`,
    complexity: {
      timeBest: "O(1)",
      timeAvg: "O(log n)",
      timeWorst: "O(log n)",
      space: "O(1)",
    },
    useCase:
      "Sorted arrays. Database indexing. Dictionary lookup. System libraries.",
  },

  /* ── GRAPH ── */
  bfs: {
    description:
      "BFS explores all neighbors at the current depth before moving to nodes at the next depth. Uses a queue. Guarantees shortest path in unweighted graphs.",
    pseudocode: `BFS(graph, start):
  visited = {start}
  queue = [start]
  while queue not empty:
    node = queue.dequeue()
    for neighbor in graph[node]:
      if neighbor not in visited:
        visited.add(neighbor)
        queue.enqueue(neighbor)`,
    complexity: {
      timeBest: "O(V+E)",
      timeAvg: "O(V+E)",
      timeWorst: "O(V+E)",
      space: "O(V)",
    },
    useCase:
      "Shortest path (unweighted). Level-order traversal. Social network friend suggestions.",
  },
  dfs: {
    description:
      "DFS explores as far as possible along each branch before backtracking. Uses a stack (or recursion). Good for topological sort, cycle detection.",
    pseudocode: `DFS(graph, node, visited):
  visited.add(node)
  for neighbor in graph[node]:
    if neighbor not in visited:
      DFS(graph, neighbor, visited)`,
    complexity: {
      timeBest: "O(V+E)",
      timeAvg: "O(V+E)",
      timeWorst: "O(V+E)",
      space: "O(V)",
    },
    useCase:
      "Maze solving. Cycle detection. Topological sorting. Connected components.",
  },
  dijkstra: {
    description:
      "Dijkstra's Algorithm finds the shortest path from a source to all other nodes in a weighted graph with non-negative weights. Uses a priority queue.",
    pseudocode: `Dijkstra(graph, src):
  dist[src] = 0; dist[others] = ∞
  PQ = [(0, src)]
  while PQ not empty:
    (d, u) = PQ.pop_min()
    for (v, w) in graph[u]:
      if dist[u] + w < dist[v]:
        dist[v] = dist[u] + w
        PQ.push((dist[v], v))`,
    complexity: {
      timeBest: "O((V+E) log V)",
      timeAvg: "O((V+E) log V)",
      timeWorst: "O((V+E) log V)",
      space: "O(V)",
    },
    useCase:
      "GPS navigation. Network routing. Road maps with positive weights.",
  },
  aStar: {
    description:
      "A* combines Dijkstra's with a heuristic (estimated remaining distance) to find the shortest path more efficiently. Uses f(n) = g(n) + h(n).",
    pseudocode: `AStar(graph, start, goal):
  open = [(f(start), start)]
  g[start] = 0
  while open not empty:
    (f, u) = open.pop_min()
    if u == goal: return path
    for (v, w) in graph[u]:
      new_g = g[u] + w
      if new_g < g[v]:
        g[v] = new_g
        f[v] = new_g + h(v, goal)
        open.push((f[v], v))`,
    complexity: {
      timeBest: "O(E)",
      timeAvg: "O(E log V)",
      timeWorst: "O(b^d)",
      space: "O(V)",
    },
    useCase:
      "Pathfinding in games. Maps with heuristic distance. Robotics navigation.",
  },
  prim: {
    description:
      "Prim's Algorithm builds a Minimum Spanning Tree by greedily adding the cheapest edge that connects a new vertex to the current tree.",
    pseudocode: `Prim(graph):
  inMST = {start}
  key[start] = 0; key[others] = ∞
  while inMST != all vertices:
    u = vertex with min key not in MST
    inMST.add(u)
    for (v, w) in graph[u]:
      if v not in MST and w < key[v]:
        key[v] = w; parent[v] = u`,
    complexity: {
      timeBest: "O(E log V)",
      timeAvg: "O(E log V)",
      timeWorst: "O(E log V)",
      space: "O(V)",
    },
    useCase:
      "Network design. Clustering. Circuit design. Approximation algorithms.",
  },
  bellmanFord: {
    description:
      "Bellman-Ford finds shortest paths from a source vertex. Unlike Dijkstra's, it handles negative edge weights and can detect negative cycles.",
    pseudocode: `BellmanFord(graph, src):
  dist[src] = 0; dist[others] = ∞
  for i = 1 to V-1:
    for each edge (u, v, w):
      if dist[u] + w < dist[v]:
        dist[v] = dist[u] + w
  // Check negative cycles
  for each edge (u, v, w):
    if dist[u] + w < dist[v]:
      print "Negative cycle detected"`,
    complexity: {
      timeBest: "O(VE)",
      timeAvg: "O(VE)",
      timeWorst: "O(VE)",
      space: "O(V)",
    },
    useCase:
      "Negative edge weights. Currency arbitrage detection. Routing protocols (RIP).",
  },
  floydWarshall: {
    description:
      "Floyd-Warshall finds shortest paths between all pairs of vertices using dynamic programming. Works with negative weights (no negative cycles).",
    pseudocode: `FloydWarshall(graph):
  dist = graph adjacency matrix
  for k = 0 to V-1:
    for i = 0 to V-1:
      for j = 0 to V-1:
        dist[i][j] = min(dist[i][j],
                         dist[i][k] + dist[k][j])`,
    complexity: {
      timeBest: "O(V³)",
      timeAvg: "O(V³)",
      timeWorst: "O(V³)",
      space: "O(V²)",
    },
    useCase:
      "All-pairs shortest paths. Dense graphs. Traffic routing. Transitive closure.",
  },

  /* ── TREE ── */
  bst: {
    description:
      "A Binary Search Tree maintains the property: left child < node < right child. Supports O(log n) average search, insert, and delete.",
    pseudocode: `insert(root, val):
  if root is null: return new Node(val)
  if val < root.val:
    root.left = insert(root.left, val)
  else:
    root.right = insert(root.right, val)
  return root

search(root, val):
  if root is null or root.val == val: return root
  if val < root.val: return search(root.left, val)
  return search(root.right, val)`,
    complexity: {
      timeBest: "O(log n)",
      timeAvg: "O(log n)",
      timeWorst: "O(n)",
      space: "O(n)",
    },
    useCase:
      "Dynamic sorted sets. Database indexing. Symbol tables. Priority queues.",
  },
  avl: {
    description:
      "AVL Tree is a self-balancing BST where the height difference (balance factor) between left and right subtrees is at most 1. Uses rotations to maintain balance.",
    pseudocode: `insert(root, val):
  // normal BST insert
  // update height
  balance = getBalance(root)
  // LL rotation: balance > 1 and val < left
  // RR rotation: balance < -1 and val > right
  // LR rotation: balance > 1 and val > left
  // RL rotation: balance < -1 and val < right`,
    complexity: {
      timeBest: "O(log n)",
      timeAvg: "O(log n)",
      timeWorst: "O(log n)",
      space: "O(n)",
    },
    useCase:
      "Database indexing. Frequent lookup with rare insertions. Sorted data with guaranteed O(log n).",
  },
  redBlack: {
    description:
      "Red-Black Tree is a self-balancing BST with color properties: nodes are red or black, root is black, no two consecutive red nodes, equal black-height on all paths.",
    pseudocode: `insert(root, val):
  // BST insert, color new node RED
  // Fix violations:
  // Case 1: Uncle is RED → recolor
  // Case 2: Uncle is BLACK, triangle → rotate
  // Case 3: Uncle is BLACK, line → rotate + recolor`,
    complexity: {
      timeBest: "O(log n)",
      timeAvg: "O(log n)",
      timeWorst: "O(log n)",
      space: "O(n)",
    },
    useCase:
      "Java TreeMap/TreeSet. C++ std::map. Linux process scheduling. Less rigid than AVL — better for inserts.",
  },

  /* ── BACKTRACKING ── */
  nQueens: {
    description:
      "N-Queens places N queens on an N×N chessboard so no two queens threaten each other. Uses backtracking: place a queen, check conflicts, backtrack if needed.",
    pseudocode: `solve(board, col):
  if col >= N: solution found, return
  for row = 0 to N-1:
    if isSafe(board, row, col):
      board[row][col] = 1
      if solve(board, col+1): return true
      board[row][col] = 0  // backtrack
  return false`,
    complexity: {
      timeBest: "O(N!)",
      timeAvg: "O(N!)",
      timeWorst: "O(N!)",
      space: "O(N)",
    },
    useCase:
      "Constraint satisfaction. Resource allocation. Testing backtracking frameworks.",
  },
  tsp: {
    description:
      "Travelling Salesman Problem finds the shortest route visiting all cities exactly once and returning to the start. Uses backtracking with pruning.",
    pseudocode: `tsp(path, visited, cost):
  if all visited:
    total = cost + dist[last][start]
    update bestCost
    return
  for city not visited:
    visited.add(city)
    tsp(path+city, visited, cost+dist[curr][city])
    visited.remove(city)  // backtrack`,
    complexity: {
      timeBest: "O(n!)",
      timeAvg: "O(n!)",
      timeWorst: "O(n!)",
      space: "O(n)",
    },
    useCase:
      "Logistics routing. PCB drilling. DNA sequencing. Delivery optimization.",
  },
  sudoku: {
    description:
      "Sudoku Solver uses backtracking: find an empty cell, try digits 1-9, check validity, recurse. If stuck, backtrack and try the next digit.",
    pseudocode: `solveSudoku(board):
  cell = findEmpty(board)
  if no empty cell: return true (solved)
  for num = 1 to 9:
    if isValid(board, cell, num):
      board[cell] = num
      if solveSudoku(board): return true
      board[cell] = 0  // backtrack
  return false`,
    complexity: {
      timeBest: "O(1)",
      timeAvg: "O(9^m)",
      timeWorst: "O(9^81)",
      space: "O(81)",
    },
    useCase:
      "Constraint satisfaction. Puzzle solving. AI planning. Configuration problems.",
  },
};
