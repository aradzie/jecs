export type Network = {
  /**
   * The only ground node in the whole circuit.
   */
  readonly groundNode: Node;

  /**
   * Adds a new voltage node to the MNA matrix.
   * @param id Unique node id.
   */
  makeNode(id: string): Node;

  /**
   * Adds a new current branch to the MNA matrix.
   * @param a A first node connected with the branch.
   * @param b A second node connected with the branch.
   */
  makeBranch(a: Node, b: Node): Branch;
};

/**
 * Circuit's node.
 */
export class Node {
  readonly type = "node" as const;

  /** Unique node id. */
  readonly id: string;

  /** Whether this node is enabled. Disabled nodes are excluded from the MNA matrix. */
  enabled: boolean = true;

  /** A branch index in the MNA matrix, if enabled. */
  index: number = -1;

  /** Computed node voltage. */
  voltage = 0;

  /** Computed node AC phase. */
  phase = 0;

  constructor(id: string) {
    this.id = id;
  }

  toString(): string {
    return `Node[${this.id}]`;
  }
}

/**
 * Circuit's branch.
 */
export class Branch {
  readonly type = "branch" as const;

  /** The first node connected with this branch. */
  readonly a: Node;

  /** The second node connected with this branch. */
  readonly b: Node;

  /** Whether this branch is enabled. Disabled branches are excluded from the MNA matrix. */
  enabled: boolean = true;

  /** A branch index in the MNA matrix, if enabled. */
  index: number = -1;

  /** Computed branch current. */
  current = 0;

  /** Computed branch AC phase. */
  phase = 0;

  constructor(a: Node, b: Node) {
    this.a = a;
    this.b = b;
  }

  toString(): string {
    return `${this.a}~${this.b}`;
  }
}

export const groundNode = new Node("gnd");
