/* ═══════════════════════════════════════════
   algorithms/graph.js
   Graph algorithm generators.
   Graph = { nodes: [{id,x,y,label}], edges: [{from,to,weight}] }
   ═══════════════════════════════════════════ */

/**
 * BFS — Breadth First Search
 */
function* bfsGen(graph, startId) {
  const visited = new Set();
  const queue = [startId];
  const parent = {};
  visited.add(startId);
  yield {
    type: "visit",
    node: startId,
    queue: [...queue],
    message: `Start BFS from node ${startId}`,
  };

  while (queue.length > 0) {
    const node = queue.shift();
    yield {
      type: "process",
      node,
      queue: [...queue],
      message: `Processing node ${node}`,
    };

    const neighbors = getNeighbors(graph, node);
    for (const { to, weight } of neighbors) {
      if (!visited.has(to)) {
        visited.add(to);
        parent[to] = node;
        queue.push(to);
        yield {
          type: "visit",
          node: to,
          edge: [node, to],
          queue: [...queue],
          message: `Visiting ${to} via ${node}`,
        };
      } else {
        yield { type: "skip", node: to, message: `${to} already visited` };
      }
    }
  }
  yield { type: "done", visited: [...visited], message: "BFS complete!" };
}

/**
 * DFS — Depth First Search
 */
function* dfsGen(graph, startId) {
  const visited = new Set();
  const stack = [];
  yield* dfsHelper(graph, startId, visited, stack, null);
  yield { type: "done", visited: [...visited], message: "DFS complete!" };
}

function* dfsHelper(graph, node, visited, stack, parent) {
  visited.add(node);
  stack.push(node);
  yield {
    type: "visit",
    node,
    stack: [...stack],
    message: `Visit ${node}, stack: [${stack.join(",")}]`,
  };

  for (const { to } of getNeighbors(graph, node)) {
    if (!visited.has(to)) {
      yield {
        type: "process",
        edge: [node, to],
        message: `Exploring edge ${node} → ${to}`,
      };
      yield* dfsHelper(graph, to, visited, stack, node);
    }
  }
  stack.pop();
  yield { type: "backtrack", node, message: `Backtrack from ${node}` };
}

/**
 * Dijkstra's Algorithm
 */
function* dijkstraGen(graph, startId) {
  const dist = {};
  const prev = {};
  const done = new Set();

  graph.nodes.forEach((n) => {
    dist[n.id] = Infinity;
    prev[n.id] = null;
  });
  dist[startId] = 0;

  yield {
    type: "init",
    dist: { ...dist },
    message: `Initialize: dist[${startId}]=0, all others=∞`,
  };

  while (done.size < graph.nodes.length) {
    // Find unvisited node with minimum distance
    let u = null;
    for (const n of graph.nodes) {
      if (!done.has(n.id) && (u === null || dist[n.id] < dist[u])) u = n.id;
    }
    if (dist[u] === Infinity) break;

    done.add(u);
    yield {
      type: "process",
      node: u,
      dist: { ...dist },
      message: `Processing node ${u} (dist=${dist[u]})`,
    };

    for (const { to, weight } of getNeighbors(graph, u)) {
      if (done.has(to)) continue;
      const newDist = dist[u] + weight;
      yield {
        type: "relax",
        from: u,
        to,
        weight,
        message: `Relaxing edge ${u}→${to} (${dist[u]}+${weight}=${newDist})`,
      };
      if (newDist < dist[to]) {
        dist[to] = newDist;
        prev[to] = u;
        yield {
          type: "update",
          node: to,
          dist: { ...dist },
          message: `Updated dist[${to}] = ${newDist}`,
        };
      }
    }
  }
  yield {
    type: "done",
    dist: { ...dist },
    prev: { ...prev },
    message: "Dijkstra complete!",
  };
  return { dist, prev };
}

/**
 * A* Search
 */
function* aStarGen(graph, startId, goalId) {
  function heuristic(a, b) {
    const na = graph.nodes.find((n) => n.id === a);
    const nb = graph.nodes.find((n) => n.id === b);
    if (!na || !nb) return 0;
    return Math.hypot(na.x - nb.x, na.y - nb.y) * 0.01;
  }

  const g = {};
  const f = {};
  const prev = {};
  const open = new Set([startId]);
  const closed = new Set();

  graph.nodes.forEach((n) => {
    g[n.id] = Infinity;
    f[n.id] = Infinity;
  });
  g[startId] = 0;
  f[startId] = heuristic(startId, goalId);

  yield { type: "init", message: `A* from ${startId} to ${goalId}` };

  while (open.size > 0) {
    // Find node in open with lowest f
    let u = null;
    for (const id of open) {
      if (u === null || f[id] < f[u]) u = id;
    }
    if (u === goalId) {
      yield { type: "done", node: u, prev, message: `Goal ${goalId} reached!` };
      return { prev };
    }

    open.delete(u);
    closed.add(u);
    yield {
      type: "process",
      node: u,
      message: `Exploring ${u}, f=${f[u].toFixed(2)}`,
    };

    for (const { to, weight } of getNeighbors(graph, u)) {
      if (closed.has(to)) continue;
      const tentG = g[u] + weight;
      yield { type: "relax", from: u, to, message: `Checking ${u}→${to}` };
      if (tentG < g[to]) {
        prev[to] = u;
        g[to] = tentG;
        f[to] = tentG + heuristic(to, goalId);
        open.add(to);
        yield {
          type: "update",
          node: to,
          message: `Updated ${to}: g=${tentG.toFixed(2)}, f=${f[to].toFixed(2)}`,
        };
      }
    }
  }
  yield { type: "notFound", message: `No path from ${startId} to ${goalId}` };
}

/**
 * Prim's Minimum Spanning Tree
 */
function* primGen(graph, startId) {
  const inMST = new Set([startId]);
  const mstEdges = [];
  yield {
    type: "init",
    node: startId,
    message: `Start Prim's from node ${startId}`,
  };

  while (inMST.size < graph.nodes.length) {
    let bestEdge = null,
      bestW = Infinity;
    for (const u of inMST) {
      for (const { to, weight } of getNeighbors(graph, u)) {
        if (!inMST.has(to)) {
          yield {
            type: "consider",
            from: u,
            to,
            weight,
            message: `Considering edge ${u}→${to} (w=${weight})`,
          };
          if (weight < bestW) {
            bestW = weight;
            bestEdge = { from: u, to, weight };
          }
        }
      }
    }
    if (!bestEdge) break;
    inMST.add(bestEdge.to);
    mstEdges.push(bestEdge);
    yield {
      type: "addEdge",
      edge: bestEdge,
      message: `Add MST edge ${bestEdge.from}→${bestEdge.to} (w=${bestEdge.weight})`,
    };
  }
  yield {
    type: "done",
    mstEdges,
    message: `MST complete! Total weight: ${mstEdges.reduce((s, e) => s + e.weight, 0)}`,
  };
}

/**
 * Bellman-Ford
 */
function* bellmanFordGen(graph, startId) {
  const dist = {};
  const prev = {};
  graph.nodes.forEach((n) => {
    dist[n.id] = Infinity;
    prev[n.id] = null;
  });
  dist[startId] = 0;

  const V = graph.nodes.length;
  yield {
    type: "init",
    dist: { ...dist },
    message: `Bellman-Ford from ${startId}, ${V} nodes`,
  };

  for (let i = 0; i < V - 1; i++) {
    yield {
      type: "phase",
      phase: i + 1,
      message: `Phase ${i + 1} of ${V - 1}`,
    };
    let updated = false;
    for (const edge of graph.edges) {
      const { from, to, weight } = edge;
      for (const [u, v] of [
        [from, to],
        [to, from],
      ]) {
        if (dist[u] + weight < dist[v]) {
          dist[v] = dist[u] + weight;
          prev[v] = u;
          updated = true;
          yield {
            type: "update",
            from: u,
            to: v,
            dist: { ...dist },
            message: `Relaxed ${u}→${v}: dist[${v}]=${dist[v]}`,
          };
        } else {
          yield {
            type: "relax",
            from: u,
            to: v,
            message: `${u}→${v}: no improvement`,
          };
        }
      }
    }
    if (!updated) {
      yield { type: "done", dist, message: "Converged early!" };
      return;
    }
  }
  // Check negative cycles
  for (const edge of graph.edges) {
    const { from, to, weight } = edge;
    if (dist[from] + weight < dist[to]) {
      yield { type: "negCycle", message: "⚠ Negative cycle detected!" };
      return;
    }
  }
  yield { type: "done", dist, prev, message: "Bellman-Ford complete!" };
}

/**
 * Floyd-Warshall — All pairs shortest paths
 */
function* floydWarshallGen(graph) {
  const ids = graph.nodes.map((n) => n.id);
  const N = ids.length;
  const idx = {};
  ids.forEach((id, i) => (idx[id] = i));

  // Build distance matrix
  const dist = Array.from({ length: N }, (_, i) =>
    Array.from({ length: N }, (_, j) => (i === j ? 0 : Infinity)),
  );
  for (const e of graph.edges) {
    const u = idx[e.from],
      v = idx[e.to];
    if (u !== undefined && v !== undefined) {
      dist[u][v] = Math.min(dist[u][v], e.weight);
      dist[v][u] = Math.min(dist[v][u], e.weight);
    }
  }

  yield {
    type: "init",
    dist: dist.map((r) => [...r]),
    ids,
    message: "Floyd-Warshall initialized",
  };

  for (let k = 0; k < N; k++) {
    yield {
      type: "phase",
      k,
      node: ids[k],
      message: `Intermediate vertex: ${ids[k]}`,
    };
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        if (dist[i][k] + dist[k][j] < dist[i][j]) {
          dist[i][j] = dist[i][k] + dist[k][j];
          yield {
            type: "update",
            i,
            j,
            k,
            val: dist[i][j],
            dist: dist.map((r) => [...r]),
            ids,
            message: `dist[${ids[i]}][${ids[j]}] updated to ${dist[i][j]}`,
          };
        }
      }
    }
  }
  yield { type: "done", dist, ids, message: "Floyd-Warshall complete!" };
}

/* ── Helper: get neighbors from graph ── */
function getNeighbors(graph, nodeId) {
  const neighbors = [];
  for (const e of graph.edges) {
    if (e.from === nodeId) neighbors.push({ to: e.to, weight: e.weight });
    if (e.to === nodeId) neighbors.push({ to: e.from, weight: e.weight });
  }
  return neighbors;
}

/* ── Registry ── */
const GRAPH_ALGORITHMS = {
  bfs: { gen: bfsGen, label: "BFS", theory: "bfs", needsGoal: false },
  dfs: { gen: dfsGen, label: "DFS", theory: "dfs", needsGoal: false },
  dijkstra: {
    gen: dijkstraGen,
    label: "Dijkstra's",
    theory: "dijkstra",
    needsGoal: false,
  },
  aStar: { gen: aStarGen, label: "A*", theory: "aStar", needsGoal: true },
  prim: { gen: primGen, label: "Prim's MST", theory: "prim", needsGoal: false },
  bellmanFord: {
    gen: bellmanFordGen,
    label: "Bellman-Ford",
    theory: "bellmanFord",
    needsGoal: false,
  },
  floydWarshall: {
    gen: floydWarshallGen,
    label: "Floyd-Warshall",
    theory: "floydWarshall",
    needsGoal: false,
    noStart: true,
  },
};
