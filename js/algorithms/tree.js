/* ═══════════════════════════════════════════
   algorithms/tree.js
   BST, AVL, Red-Black Tree implementations
   ═══════════════════════════════════════════ */

/* ═══════════════ BST ═══════════════ */
class BSTNode {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
    this.state = "default"; // for coloring
    this.x = 0;
    this.y = 0;
  }
}

class BST {
  constructor() {
    this.root = null;
  }

  /** Insert a value, returns array of steps */
  insert(val) {
    const steps = [];
    const newNode = new BSTNode(val);
    if (!this.root) {
      this.root = newNode;
      steps.push({
        type: "insert",
        node: val,
        message: `Inserted ${val} as root`,
      });
      return steps;
    }
    let cur = this.root,
      parent = null,
      dir = null;
    while (cur) {
      steps.push({
        type: "compare",
        node: cur.val,
        message: `Compare ${val} with ${cur.val}`,
      });
      parent = cur;
      if (val < cur.val) {
        dir = "left";
        cur = cur.left;
      } else if (val > cur.val) {
        dir = "right";
        cur = cur.right;
      } else {
        steps.push({ type: "duplicate", message: `${val} already exists` });
        return steps;
      }
    }
    parent[dir] = newNode;
    steps.push({
      type: "insert",
      node: val,
      message: `Inserted ${val} as ${dir} child of ${parent.val}`,
    });
    return steps;
  }

  search(val) {
    const steps = [];
    let cur = this.root;
    while (cur) {
      steps.push({
        type: "compare",
        node: cur.val,
        message: `Checking node ${cur.val}`,
      });
      if (val === cur.val) {
        steps.push({ type: "found", node: val, message: `Found ${val}!` });
        return steps;
      }
      cur = val < cur.val ? cur.left : cur.right;
    }
    steps.push({ type: "notFound", message: `${val} not found` });
    return steps;
  }

  delete(val) {
    const steps = [];
    this.root = this._delete(this.root, val, steps);
    return steps;
  }

  _delete(node, val, steps) {
    if (!node) {
      steps.push({ type: "notFound", message: `${val} not found` });
      return null;
    }
    steps.push({
      type: "compare",
      node: node.val,
      message: `Checking ${node.val}`,
    });
    if (val < node.val) {
      node.left = this._delete(node.left, val, steps);
    } else if (val > node.val) {
      node.right = this._delete(node.right, val, steps);
    } else {
      steps.push({ type: "delete", node: val, message: `Deleting ${val}` });
      if (!node.left) return node.right;
      if (!node.right) return node.left;
      // In-order successor
      let succ = node.right;
      while (succ.left) succ = succ.left;
      steps.push({
        type: "replace",
        node: val,
        succ: succ.val,
        message: `Replace ${val} with in-order successor ${succ.val}`,
      });
      node.val = succ.val;
      node.right = this._delete(node.right, succ.val, steps);
    }
    return node;
  }

  toArray() {
    const r = [];
    this._inorder(this.root, r);
    return r;
  }
  _inorder(n, r) {
    if (!n) return;
    this._inorder(n.left, r);
    r.push(n.val);
    this._inorder(n.right, r);
  }
}

/* ═══════════════ AVL ═══════════════ */
class AVLNode {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
    this.height = 1;
    this.bf = 0;
    this.x = 0;
    this.y = 0;
    this.state = "default";
  }
}

class AVLTree {
  constructor() {
    this.root = null;
  }

  height(n) {
    return n ? n.height : 0;
  }
  bf(n) {
    return n ? this.height(n.left) - this.height(n.right) : 0;
  }
  update(n) {
    n.height = 1 + Math.max(this.height(n.left), this.height(n.right));
    n.bf = this.bf(n);
  }

  rotateRight(y) {
    const x = y.left,
      T2 = x.right;
    x.right = y;
    y.left = T2;
    this.update(y);
    this.update(x);
    return x;
  }
  rotateLeft(x) {
    const y = x.right,
      T2 = y.left;
    y.left = x;
    x.right = T2;
    this.update(x);
    this.update(y);
    return y;
  }

  insert(val) {
    const steps = [];
    this.root = this._insert(this.root, val, steps);
    return steps;
  }

  _insert(node, val, steps) {
    if (!node) {
      steps.push({ type: "insert", node: val, message: `Inserted ${val}` });
      return new AVLNode(val);
    }
    steps.push({
      type: "compare",
      node: node.val,
      message: `Compare ${val} with ${node.val}`,
    });
    if (val < node.val) node.left = this._insert(node.left, val, steps);
    else if (val > node.val) node.right = this._insert(node.right, val, steps);
    else return node;

    this.update(node);
    const balance = node.bf;

    if (balance > 1 && val < node.left.val) {
      steps.push({
        type: "rotate",
        kind: "LL",
        node: node.val,
        message: `LL rotation at ${node.val} (bf=${balance})`,
      });
      return this.rotateRight(node);
    }
    if (balance < -1 && val > node.right.val) {
      steps.push({
        type: "rotate",
        kind: "RR",
        node: node.val,
        message: `RR rotation at ${node.val} (bf=${balance})`,
      });
      return this.rotateLeft(node);
    }
    if (balance > 1 && val > node.left.val) {
      steps.push({
        type: "rotate",
        kind: "LR",
        node: node.val,
        message: `LR rotation at ${node.val} (bf=${balance})`,
      });
      node.left = this.rotateLeft(node.left);
      return this.rotateRight(node);
    }
    if (balance < -1 && val < node.right.val) {
      steps.push({
        type: "rotate",
        kind: "RL",
        node: node.val,
        message: `RL rotation at ${node.val} (bf=${balance})`,
      });
      node.right = this.rotateRight(node.right);
      return this.rotateLeft(node);
    }
    return node;
  }

  delete(val) {
    const steps = [];
    this.root = this._delete(this.root, val, steps);
    return steps;
  }

  _delete(node, val, steps) {
    if (!node) return null;
    steps.push({ type: "compare", node: node.val });
    if (val < node.val) node.left = this._delete(node.left, val, steps);
    else if (val > node.val) node.right = this._delete(node.right, val, steps);
    else {
      steps.push({ type: "delete", node: val, message: `Deleting ${val}` });
      if (!node.left || !node.right) return node.left || node.right;
      let succ = node.right;
      while (succ.left) succ = succ.left;
      node.val = succ.val;
      node.right = this._delete(node.right, succ.val, steps);
    }
    this.update(node);
    const b = node.bf;
    if (b > 1 && this.bf(node.left) >= 0) {
      steps.push({
        type: "rotate",
        kind: "LL",
        message: `LL rotation at ${node.val}`,
      });
      return this.rotateRight(node);
    }
    if (b > 1) {
      steps.push({ type: "rotate", kind: "LR", message: `LR rotation` });
      node.left = this.rotateLeft(node.left);
      return this.rotateRight(node);
    }
    if (b < -1 && this.bf(node.right) <= 0) {
      steps.push({
        type: "rotate",
        kind: "RR",
        message: `RR rotation at ${node.val}`,
      });
      return this.rotateLeft(node);
    }
    if (b < -1) {
      steps.push({ type: "rotate", kind: "RL", message: `RL rotation` });
      node.right = this.rotateRight(node.right);
      return this.rotateLeft(node);
    }
    return node;
  }
}

/* ═══════════════ Red-Black ═══════════════ */
const RED = "red",
  BLACK = "black";

class RBNode {
  constructor(val) {
    this.val = val;
    this.color = RED;
    this.left = null;
    this.right = null;
    this.parent = null;
    this.x = 0;
    this.y = 0;
  }
}

class RedBlackTree {
  constructor() {
    this.NIL = new RBNode(null);
    this.NIL.color = BLACK;
    this.root = this.NIL;
  }

  insert(val) {
    const steps = [];
    const node = new RBNode(val);
    node.left = node.right = node.parent = this.NIL;
    this._bstInsert(node);
    steps.push({
      type: "insert",
      node: val,
      message: `BST insert ${val}, colored RED`,
    });
    this._fixInsert(node, steps);
    return steps;
  }

  _bstInsert(node) {
    let parent = this.NIL,
      cur = this.root;
    while (cur !== this.NIL) {
      parent = cur;
      cur = node.val < cur.val ? cur.left : cur.right;
    }
    node.parent = parent;
    if (parent === this.NIL) this.root = node;
    else if (node.val < parent.val) parent.left = node;
    else parent.right = node;
  }

  _fixInsert(node, steps) {
    while (node.parent.color === RED) {
      const uncle =
        node.parent === node.parent.parent.left
          ? node.parent.parent.right
          : node.parent.parent.left;
      if (uncle.color === RED) {
        // Case 1: recolor
        node.parent.color = BLACK;
        uncle.color = BLACK;
        node.parent.parent.color = RED;
        steps.push({
          type: "recolor",
          message: `Recolor: parent+uncle BLACK, grandparent RED`,
        });
        node = node.parent.parent;
      } else {
        if (node.parent === node.parent.parent.left) {
          if (node === node.parent.right) {
            node = node.parent;
            this._rotateLeft(node);
            steps.push({
              type: "rotate",
              kind: "left",
              message: "Left rotation",
            });
          }
          node.parent.color = BLACK;
          node.parent.parent.color = RED;
          this._rotateRight(node.parent.parent);
          steps.push({
            type: "rotate",
            kind: "right",
            message: "Right rotation + recolor",
          });
        } else {
          if (node === node.parent.left) {
            node = node.parent;
            this._rotateRight(node);
            steps.push({
              type: "rotate",
              kind: "right",
              message: "Right rotation",
            });
          }
          node.parent.color = BLACK;
          node.parent.parent.color = RED;
          this._rotateLeft(node.parent.parent);
          steps.push({
            type: "rotate",
            kind: "left",
            message: "Left rotation + recolor",
          });
        }
      }
    }
    this.root.color = BLACK;
  }

  _rotateLeft(x) {
    const y = x.right;
    x.right = y.left;
    if (y.left !== this.NIL) y.left.parent = x;
    y.parent = x.parent;
    if (x.parent === this.NIL) this.root = y;
    else if (x === x.parent.left) x.parent.left = y;
    else x.parent.right = y;
    y.left = x;
    x.parent = y;
  }

  _rotateRight(x) {
    const y = x.left;
    x.left = y.right;
    if (y.right !== this.NIL) y.right.parent = x;
    y.parent = x.parent;
    if (x.parent === this.NIL) this.root = y;
    else if (x === x.parent.right) x.parent.right = y;
    else x.parent.left = y;
    y.right = x;
    x.parent = y;
  }
}

const TREE_ALGORITHMS = {
  bst: { label: "BST", theory: "bst", TreeClass: BST },
  avl: { label: "AVL Tree", theory: "avl", TreeClass: AVLTree },
  redBlack: {
    label: "Red-Black Tree",
    theory: "redBlack",
    TreeClass: RedBlackTree,
  },
};
